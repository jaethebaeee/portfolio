import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getPatientCountBySegment, PatientFilters } from '@/lib/patient-segmentation';

/**
 * POST /api/campaigns/preview-count
 * Get count of patients matching segment filters
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
    const filters: PatientFilters = body.filters || {};

    const count = await getPatientCountBySegment(userId, filters);

    return NextResponse.json({
      success: true,
      count,
    });
  } catch (error: any) {
    console.error('Failed to get patient count:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || '서버 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}

