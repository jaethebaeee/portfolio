import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getCampaign,
  updateCampaign,
  deleteCampaign,
  UpdateCampaignInput,
} from '@/lib/campaigns';

/**
 * GET /api/campaigns/[id] - 캠페인 단일 조회
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
    const campaign = await getCampaign(userId, id);

    if (!campaign) {
      return NextResponse.json(
        { error: '캠페인을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ campaign });
  } catch (error: any) {
    console.error('캠페인 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/campaigns/[id] - 캠페인 업데이트
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
    const input: UpdateCampaignInput = {
      name: body.name,
      description: body.description,
      template_id: body.template_id,
      target_patients: body.target_patients,
      scheduled_at: body.scheduled_at,
      status: body.status,
    };

    const campaign = await updateCampaign(userId, id, input);
    return NextResponse.json({ campaign });
  } catch (error: any) {
    console.error('캠페인 업데이트 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/campaigns/[id] - 캠페인 삭제
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
    await deleteCampaign(userId, id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('캠페인 삭제 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

