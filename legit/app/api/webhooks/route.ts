import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getWebhooks,
  createWebhook,
  CreateWebhookInput,
} from '@/lib/webhook';

/**
 * GET /api/webhooks - 웹훅 목록 조회
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

    const webhooks = await getWebhooks(userId);
    return NextResponse.json({ webhooks });
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('웹훅 목록 조회 오류:', error);
    }
    const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/webhooks - 웹훅 생성
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
    const input: CreateWebhookInput = {
      name: body.name,
      workflow_id: body.workflow_id,
      enabled: body.enabled ?? true,
    };

    if (!input.name) {
      return NextResponse.json(
        { error: '웹훅 이름은 필수입니다.' },
        { status: 400 }
      );
    }

    const webhook = await createWebhook(userId, input);
    return NextResponse.json({ webhook }, { status: 201 });
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('웹훅 생성 오류:', error);
    }
    const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

