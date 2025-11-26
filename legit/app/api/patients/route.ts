import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getPatients,
  createPatient,
  CreatePatientInput,
} from '@/lib/patients';

/**
 * GET /api/patients - 환자 목록 조회
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

    const patients = await getPatients(userId);
    return NextResponse.json({ patients });
  } catch (error: unknown) {
    console.error('환자 목록 조회 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/patients - 환자 생성
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
    const input: CreatePatientInput = {
      name: body.name,
      phone: body.phone,
      email: body.email,
      birth_date: body.birth_date,
      gender: body.gender,
      last_visit_date: body.last_visit_date,
      last_surgery_date: body.last_surgery_date,
      notes: body.notes,
    };

    // 필수 필드 검증
    if (!input.name || !input.phone) {
      return NextResponse.json(
        { error: '이름과 전화번호는 필수입니다.' },
        { status: 400 }
      );
    }

    const patient = await createPatient(userId, input);
    return NextResponse.json({ patient }, { status: 201 });
  } catch (error: unknown) {
    console.error('환자 생성 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

