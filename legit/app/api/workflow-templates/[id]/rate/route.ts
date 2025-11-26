import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { rateTemplate } from '@/lib/workflow-template-library';

/**
 * POST /api/workflow-templates/[id]/rate
 * 템플릿 평점 추가/수정
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const templateRating = await rateTemplate(userId, id, rating, comment);
    return NextResponse.json({ rating: templateRating });
  } catch (error: any) {
    console.error('Error rating template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to rate template' },
      { status: 500 }
    );
  }
}

