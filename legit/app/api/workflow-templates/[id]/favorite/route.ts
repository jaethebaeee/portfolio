import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  addToFavorites,
  removeFromFavorites,
  isFavorite,
} from '@/lib/workflow-template-library';

/**
 * POST /api/workflow-templates/[id]/favorite
 * 즐겨찾기 추가/제거
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
    const { favorite } = body;

    if (favorite) {
      await addToFavorites(userId, id);
    } else {
      await removeFromFavorites(userId, id);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error updating favorite:', error);
    }
    const errorMessage = error instanceof Error ? error.message : 'Failed to update favorite';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET /api/workflow-templates/[id]/favorite
 * 즐겨찾기 여부 확인
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const favorited = await isFavorite(userId, id);
    return NextResponse.json({ favorited });
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error checking favorite:', error);
    }
    const errorMessage = error instanceof Error ? error.message : 'Failed to check favorite';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

