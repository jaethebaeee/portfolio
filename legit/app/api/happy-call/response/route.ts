import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { PatientResponse } from '@/lib/database.types';

// Supabase 클라이언트를 직접 생성하여 사용 (auth context 없이)
// 실제 운영 환경에서는 서명된 토큰 검증이 필요합니다.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      patient_id, 
      workflow_id, 
      step_index, 
      response_type, 
      response_value,
      user_id, // 병원 ID (테넌트 식별용)
      note // 추가 메모
    } = body;

    if (!patient_id || !workflow_id || !response_type || !response_value || !user_id) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 통증 레벨에 따른 심각도 판단
    let severity_level = 'normal';
    if (response_type === 'pain_level') {
      const painLevel = parseInt(response_value);
      if (painLevel >= 4) { // 4점 이상은 심각
        severity_level = 'high';
      }
    } else if (response_type === 'photo') {
      // 사진 업로드는 무조건 의료진 확인 필요하므로 우선 high로 설정하거나
      // 별도 로직 적용 가능. 여기서는 기본적으로 검토 필요 상태로 둠.
      severity_level = 'high';
    }

    const supabase = createServerClient();
    
    // RLS를 우회하거나 적절한 권한으로 insert 필요
    // 여기서는 공개 insert 정책이 적용되어 있다고 가정하거나,
    // 서비스 롤 키를 사용해야 합니다.
    // createServerClient는 기본적으로 서비스 롤을 사용하도록 설정되어 있을 수 있음
    
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('patient_responses')
      .insert({
        user_id,
        patient_id,
        workflow_id,
        step_index,
        response_type,
        response_value,
        severity_level,
        is_reviewed: false
        // note 컬럼이 스키마에 추가되어야 함. MVP에서는 생략하거나 JSONB 필드 활용
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // 심각도가 높으면 알림 트리거 (추후 구현)
    if (severity_level === 'high') {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚨 [ALERT] High severity response from patient ${patient_id}`);
      }
      // Note: Slack 알림 또는 내부 대시보드 알림 생성 로직은 추후 구현 예정
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Happy Call Response Error:', error);
    }
    const errorMessage = error instanceof Error ? error.message : 'Server Error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
