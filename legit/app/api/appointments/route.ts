import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getAppointments,
  createAppointment,
  CreateAppointmentInput,
} from '@/lib/appointments';
import { executeTemplate, TemplateVariableContext } from '@/lib/template-engine';
import { getActiveTemplates } from '@/lib/template-scheduler';
import { getPatient } from '@/lib/patients';
import { MarketingTemplate } from '@/lib/template-types';

/**
 * GET /api/appointments - 예약 목록 조회
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

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id') || undefined;
    const status = searchParams.get('status') || undefined;
    const dateFrom = searchParams.get('date_from') || undefined;
    const dateTo = searchParams.get('date_to') || undefined;

    const appointments = await getAppointments(userId, {
      patient_id: patientId,
      status,
      date_from: dateFrom,
      date_to: dateTo,
    });

    return NextResponse.json({ appointments });
  } catch (error: any) {
    console.error('예약 목록 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/appointments - 예약 생성
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
    const input: CreateAppointmentInput = {
      patient_id: body.patient_id,
      appointment_date: body.appointment_date,
      appointment_time: body.appointment_time,
      type: body.type,
      status: body.status || 'scheduled',
      notes: body.notes,
    };

    // 필수 필드 검증
    if (!input.patient_id || !input.appointment_date || !input.appointment_time) {
      return NextResponse.json(
        { error: '환자 ID, 예약 날짜, 예약 시간은 필수입니다.' },
        { status: 400 }
      );
    }

    // 예약 생성
    const appointment = await createAppointment(userId, input);

    // 예약 완료 시 템플릿 자동 실행
    try {
      // 환자 정보 조회
      const patient = await getPatient(userId, input.patient_id);
      if (patient) {
        // 활성화된 템플릿 중 'appointment_completed' 트리거가 있는 템플릿 찾기
        const templates = await getActiveTemplates(userId);
        const appointmentTemplates = templates.filter(
          (t: MarketingTemplate) => t.trigger.type === 'appointment_completed'
        );

        // 각 템플릿 실행
        for (const template of appointmentTemplates) {
          const context: TemplateVariableContext = {
            patient,
            appointment,
          };

          try {
            await executeTemplate(
              userId,
              template,
              context,
              patient.id,
              appointment.id
            );
          } catch (templateError) {
            console.error(`템플릿 "${template.name}" 실행 실패:`, templateError);
            // 템플릿 실행 실패해도 예약 생성은 성공으로 처리
          }
        }
      }
    } catch (templateError) {
      console.error('템플릿 자동 실행 오류:', templateError);
      // 템플릿 실행 실패해도 예약 생성은 성공으로 처리
    }

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error: any) {
    console.error('예약 생성 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

