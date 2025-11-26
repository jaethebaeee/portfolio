import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { retryAllFailedMessages } from '@/lib/message-retry';

/**
 * POST /api/messages/retry - 실패한 메시지 재시도
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

    const result = await retryAllFailedMessages(userId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('메시지 재시도 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

