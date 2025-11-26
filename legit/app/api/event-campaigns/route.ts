import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getEventCampaigns,
  createSeasonalCampaign,
  createBirthdayCampaign,
  seasonalEventTemplates,
} from '@/lib/event-crm';

/**
 * GET /api/event-campaigns - 이벤트 캠페인 목록 조회
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

    const campaigns = await getEventCampaigns(userId);
    return NextResponse.json({ campaigns });
  } catch (error: any) {
    console.error('이벤트 캠페인 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/event-campaigns - 이벤트 캠페인 생성
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
    const { type, templateId, customConfig } = body;

    let campaign;

    if (type === 'seasonal' && templateId) {
      const template = seasonalEventTemplates.find((t) => t.id === templateId);
      if (!template) {
        return NextResponse.json(
          { error: '템플릿을 찾을 수 없습니다.' },
          { status: 400 }
        );
      }
      campaign = await createSeasonalCampaign(userId, template, customConfig);
    } else if (type === 'birthday') {
      campaign = await createBirthdayCampaign(
        userId,
        customConfig?.daysBefore || 3,
        customConfig?.discountRate || 15
      );
    } else {
      return NextResponse.json(
        { error: '유효하지 않은 캠페인 타입입니다.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error: any) {
    console.error('이벤트 캠페인 생성 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/event-campaigns/templates - 계절별 이벤트 템플릿 목록
 */
export async function GET_TEMPLATES() {
  return NextResponse.json({ templates: seasonalEventTemplates });
}

