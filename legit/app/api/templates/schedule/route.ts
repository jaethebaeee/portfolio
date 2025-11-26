import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { runScheduler, runSchedulerForTrigger } from '@/lib/template-scheduler';

/**
 * POST /api/templates/schedule - 스케줄러 실행
 * 
 * 참고: 실제 프로덕션에서는 cron job이나 별도의 백그라운드 서비스로 실행해야 합니다.
 * 이 API는 수동 실행 또는 테스트용입니다.
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
    const { triggerType } = body;

    // 특정 트리거 타입만 실행
    if (triggerType) {
      const result = await runSchedulerForTrigger(userId, triggerType);
      return NextResponse.json(result);
    }

    // 모든 템플릿 실행
    const result = await runScheduler(userId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('스케줄러 실행 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

