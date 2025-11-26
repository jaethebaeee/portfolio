import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getAppointment,
  updateAppointment,
  deleteAppointment,
  UpdateAppointmentInput,
} from '@/lib/appointments';
import { triggerWorkflowsForAppointment } from '@/lib/workflow-triggers';

/**
 * GET /api/appointments/[id] - 예약 단일 조회
 */
export async function GET(
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
    const appointment = await getAppointment(userId, id);

    if (!appointment) {
      return NextResponse.json(
        { error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ appointment });
  } catch (error: any) {
    console.error('예약 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/appointments/[id] - 예약 업데이트
 */
export async function PATCH(
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
    
    // Get current appointment to check status change
    const currentAppointment = await getAppointment(userId, id);
    const oldStatus = currentAppointment?.status;
    
    const body = await request.json();
    const input: UpdateAppointmentInput = {
      patient_id: body.patient_id,
      appointment_date: body.appointment_date,
      appointment_time: body.appointment_time,
      type: body.type,
      status: body.status,
      notes: body.notes,
      cancellation_reason: body.cancellation_reason,
      cancellation_reason_category: body.cancellation_reason_category,
    };

    const appointment = await updateAppointment(userId, id, input);
    
    // Trigger workflows if status changed
    if (oldStatus !== appointment.status) {
      try {
        await triggerWorkflowsForAppointment(userId, appointment, oldStatus);
      } catch (error) {
        console.error('Failed to trigger workflows:', error);
        // Don't fail the request if workflow trigger fails
      }
    }
    
    return NextResponse.json({ appointment });
  } catch (error: any) {
    console.error('예약 업데이트 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/appointments/[id] - 예약 삭제
 */
export async function DELETE(
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
    await deleteAppointment(userId, id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('예약 삭제 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

