import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { executeCampaign } from '@/lib/campaigns';

/**
 * POST /api/campaigns/[id]/execute - 캠페인 실행 (배치 발송)
 */
export async function POST(
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
    const result = await executeCampaign(userId, id);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('캠페인 실행 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

