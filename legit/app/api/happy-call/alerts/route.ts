import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';

/**
 * GET /api/happy-call/alerts
 * 심각도가 'high'이고 아직 검토되지 않은(is_reviewed=false) 응답 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // 환자 정보를 join해서 가져오기 위해 select 수정
    const { data, error } = await supabase
      .from('patient_responses')
      .select(`
        *,
        patient:patients(name, phone)
      `)
      .eq('user_id', userId)
      .eq('severity_level', 'high')
      .eq('is_reviewed', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ alerts: data });
  } catch (error: unknown) {
    console.error('Alert Fetch Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Server Error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/happy-call/alerts
 * 알림 검토 완료 처리
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { response_id } = body;

    if (!response_id) {
      return NextResponse.json({ error: 'Response ID required' }, { status: 400 });
    }

    const supabase = createServerClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('patient_responses')
      .update({ is_reviewed: true })
      .eq('id', response_id)
      .eq('user_id', userId) // 내 병원의 데이터만 수정 가능
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error('Alert Update Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Server Error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

