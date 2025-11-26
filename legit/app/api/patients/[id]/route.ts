import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getPatient,
  updatePatient,
  deletePatient,
  UpdatePatientInput,
} from '@/lib/patients';

/**
 * GET /api/patients/[id] - 환자 단일 조회
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
    const patient = await getPatient(userId, id);

    if (!patient) {
      return NextResponse.json(
        { error: '환자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ patient });
  } catch (error: any) {
    console.error('환자 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/patients/[id] - 환자 업데이트
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
    const body = await request.json();
    const input: UpdatePatientInput = {
      name: body.name,
      phone: body.phone,
      email: body.email,
      birth_date: body.birth_date,
      gender: body.gender,
      last_visit_date: body.last_visit_date,
      last_surgery_date: body.last_surgery_date,
      notes: body.notes,
    };

    const patient = await updatePatient(userId, id, input);
    return NextResponse.json({ patient });
  } catch (error: any) {
    console.error('환자 업데이트 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/patients/[id] - 환자 삭제
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
    await deletePatient(userId, id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('환자 삭제 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

