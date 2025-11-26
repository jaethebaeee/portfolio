import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { executeTemplate, TemplateVariableContext } from '@/lib/template-engine';
import { MarketingTemplate } from '@/lib/template-types';
import { getPatient } from '@/lib/patients';
import { createServerClient } from '@/lib/supabase';

/**
 * POST /api/templates/execute - 템플릿 실행
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
    const { template, patientId, appointmentId, customVariables } = body;

    if (!template || !patientId) {
      return NextResponse.json(
        { error: '템플릿과 환자 ID는 필수입니다.' },
        { status: 400 }
      );
    }

    // 환자 정보 조회
    const patient = await getPatient(userId, patientId);
    if (!patient) {
      return NextResponse.json(
        { error: '환자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 예약 정보 조회 (있는 경우)
    let appointment = null;
    if (appointmentId) {
      const supabase = createServerClient();
      if (supabase) {
        const { data } = await supabase
          .from('appointments')
          .select('*')
          .eq('id', appointmentId)
          .eq('user_id', userId)
          .single();
        appointment = data;
      }
    }

    // 템플릿 실행 컨텍스트 생성
    const context: TemplateVariableContext = {
      patient,
      appointment: appointment || undefined,
      customVariables,
    };

    // 템플릿 실행
    const result = await executeTemplate(
      userId,
      template as MarketingTemplate,
      context,
      patientId
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('템플릿 실행 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

