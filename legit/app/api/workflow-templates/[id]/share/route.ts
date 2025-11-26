import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { shareTemplate } from '@/lib/workflow-template-library';

/**
 * POST /api/workflow-templates/[id]/share
 * 템플릿 공유 설정
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
    const { isPublic } = body;

    const template = await shareTemplate(userId, id, isPublic);
    return NextResponse.json({ template });
  } catch (error: any) {
    console.error('Error sharing template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to share template' },
      { status: 500 }
    );
  }
}

