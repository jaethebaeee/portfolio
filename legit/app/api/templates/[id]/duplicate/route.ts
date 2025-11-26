import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { duplicateTemplate } from '@/lib/templates';

/**
 * POST /api/templates/[id]/duplicate - 템플릿 복제
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
    const template = await duplicateTemplate(userId, id);

    return NextResponse.json({ template });
  } catch (error: any) {
    console.error('템플릿 복제 오류:', error);
    
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { error: '템플릿을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

