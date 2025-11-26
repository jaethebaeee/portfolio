import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getMessageStats } from '@/lib/message-logs';

/**
 * GET /api/message-logs/stats - 발송 통계 조회
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

    const stats = await getMessageStats(userId);
    return NextResponse.json({ stats });
  } catch (error: any) {
    console.error('발송 통계 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

