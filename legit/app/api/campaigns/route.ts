import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { getPatientsBySegment, PatientFilters } from '@/lib/patient-segmentation';
import { sendSmartMessage } from '@/lib/smart-messaging';

/**
 * POST /api/campaigns
 * Create a new bulk campaign
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      filters,
      messageContent,
      channel,
      scheduledAt,
    } = body;

    if (!name || !messageContent || !filters) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: '데이터베이스 연결 실패' },
        { status: 500 }
      );
    }

    // Get patients matching filters
    const patients = await getPatientsBySegment(userId, filters as PatientFilters);

    if (patients.length === 0) {
      return NextResponse.json(
        { error: '대상 환자가 없습니다.' },
        { status: 400 }
      );
    }

    // Create campaign record
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        user_id: userId,
        name,
        description: description || null,
        target_patients: patients.map(p => p.id),
        scheduled_at: scheduledAt || null,
        status: scheduledAt ? 'scheduled' : 'running',
        started_at: scheduledAt ? null : new Date().toISOString(),
      })
      .select()
      .single();

    if (campaignError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to create campaign:', campaignError);
      }
      return NextResponse.json(
        { error: '캠페인 생성 실패' },
        { status: 500 }
      );
    }

    // If immediate send, queue messages
    if (!scheduledAt) {
      // Send messages in background (don't await)
      sendCampaignMessages(userId, campaign.id, patients, messageContent, channel)
        .catch((error) => {
          if (process.env.NODE_ENV === 'development') {
            console.error('Failed to send campaign messages:', error);
          }
        });
    }

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        patientCount: patients.length,
        status: campaign.status,
      },
    });
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to create campaign:', error);
    }
    const errorMessage = error instanceof Error ? error.message : '캠페인 생성 실패';
    return NextResponse.json(
      { 
        success: false,
        error: error.message || '서버 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}

/**
 * Send campaign messages to all patients
 */
async function sendCampaignMessages(
  userId: string,
  campaignId: string,
  patients: any[],
  messageContent: string,
  channel: 'kakao' | 'sms'
): Promise<void> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  let successCount = 0;
  let failCount = 0;

  for (const patient of patients) {
    try {
      // Replace template variables
      let message = messageContent
        .replace(/\{\{patient_name\}\}/g, patient.name || '고객님')
        .replace(/\{\{appointment_date\}\}/g, patient.last_visit_date || '')
        .replace(/\{\{last_visit_date\}\}/g, patient.last_visit_date || '');

      // Send message
      const result = await sendSmartMessage({
        userId,
        patientId: patient.id,
        phone: patient.phone,
        message,
        channel,
        templateId: undefined,
      });

      // Log message
      await supabase.from('message_logs').insert({
        user_id: userId,
        patient_id: patient.id,
        campaign_id: campaignId,
        channel,
        recipient_phone: patient.phone,
        message_content: message,
        status: result.success ? 'sent' : 'failed',
        error_message: result.error || null,
        sent_at: result.success ? new Date().toISOString() : null,
      });

      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }

      // Rate limiting: wait 100ms between messages
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Failed to send message to patient ${patient.id}:`, error);
      }
      failCount++;
    }
  }

  // Update campaign status
  await supabase
    .from('campaigns')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', campaignId);

  if (process.env.NODE_ENV === 'development') {
    console.log(`Campaign ${campaignId} completed: ${successCount} sent, ${failCount} failed`);
  }
}

/**
 * GET /api/campaigns
 * List all campaigns for the user
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: '데이터베이스 연결 실패' },
        { status: 500 }
      );
    }

    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch campaigns:', error);
      }
      return NextResponse.json(
        { error: '캠페인 조회 실패' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      campaigns: campaigns || [],
    });
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to fetch campaigns:', error);
    }
    return NextResponse.json(
      { 
        success: false,
        error: error.message || '서버 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}
