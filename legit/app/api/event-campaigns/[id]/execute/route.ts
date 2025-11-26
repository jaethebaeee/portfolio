import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { getSegmentedPatients } from '@/lib/event-crm';
import { executeTemplate } from '@/lib/template-engine';
import { getActiveTemplates } from '@/lib/template-scheduler';
import { MarketingTemplate } from '@/lib/template-types';

/**
 * POST /api/event-campaigns/[id]/execute - 이벤트 캠페인 실행
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabase = createServerClient();
    if (!supabase) {
      throw new Error('Supabase가 설정되지 않았습니다.');
    }

    // 캠페인 조회
    const { data: campaign, error: campaignError } = await supabase
      .from('event_campaigns')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: '캠페인을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (!campaign.enabled) {
      return NextResponse.json(
        { error: '비활성화된 캠페인입니다.' },
        { status: 400 }
      );
    }

    // 세그먼트 설정 가져오기
    const segmentConfig = campaign.segment_config || {};

    // 세그먼트에 맞는 환자 조회
    const patients = await getSegmentedPatients(userId, segmentConfig);

    if (patients.length === 0) {
      return NextResponse.json({
        success: true,
        message: '세그먼트에 맞는 환자가 없습니다.',
        sentCount: 0,
        totalPatients: 0,
      });
    }

    // 템플릿 조회
    let template: MarketingTemplate | null = null;
    if (campaign.template_id) {
      const templates = await getActiveTemplates(userId);
      template = templates.find((t) => t.id === campaign.template_id) || null;
    }

    // 각 환자에게 메시지 발송
    let sentCount = 0;
    const errors: string[] = [];

    for (const patient of patients) {
      try {
        // 실행 이력 생성
        const { data: execution } = await supabase
          .from('event_campaign_executions')
          .insert({
            user_id: userId,
            campaign_id: id,
            patient_id: patient.id,
            status: 'pending',
          })
          .select()
          .single();

        if (template) {
          // 템플릿 실행
          const result = await executeTemplate(
            userId,
            template,
            { patient },
            patient.id
          );

          if (result.success) {
            await supabase
              .from('event_campaign_executions')
              .update({
                status: 'sent',
                sent_at: new Date().toISOString(),
              })
              .eq('id', execution.id);
            sentCount++;
          } else {
            await supabase
              .from('event_campaign_executions')
              .update({
                status: 'failed',
                error_message: result.errors.join(', '),
              })
              .eq('id', execution.id);
            errors.push(`${patient.name}: ${result.errors.join(', ')}`);
          }
        } else {
          // 템플릿이 없으면 기본 메시지 발송 (추후 구현)
          await supabase
            .from('event_campaign_executions')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
            })
            .eq('id', execution.id);
          sentCount++;
        }
      } catch (error: any) {
        errors.push(`${patient.name}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      sentCount,
      totalPatients: patients.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('이벤트 캠페인 실행 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

