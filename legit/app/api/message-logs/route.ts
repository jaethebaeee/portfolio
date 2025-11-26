import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getMessageLogs, getMessageStats } from '@/lib/message-logs';

/**
 * GET /api/message-logs - 발송 이력 조회
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
    const templateId = searchParams.get('template_id') || undefined;
    const campaignId = searchParams.get('campaign_id') || undefined;
    const channel = searchParams.get('channel') as 'kakao' | 'sms' | undefined;
    const status = searchParams.get('status') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

    const { logs, total } = await getMessageLogs(userId, {
      patient_id: patientId,
      template_id: templateId,
      campaign_id: campaignId,
      channel,
      status,
      limit,
      offset,
    });

    return NextResponse.json({ logs, total });
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('발송 이력 조회 오류:', error);
    }
    const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

