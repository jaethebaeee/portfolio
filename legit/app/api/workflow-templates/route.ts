import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getPublicTemplates,
  getUserTemplates,
  createTemplate,
} from '@/lib/workflow-template-library';

/**
 * GET /api/workflow-templates
 * 공개 템플릿 목록 조회 또는 사용자 템플릿 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'public' or 'my'

    if (type === 'my') {
      // 사용자 템플릿 조회
      const templates = await getUserTemplates(userId);
      return NextResponse.json({ templates });
    } else {
      // 공개 템플릿 조회
      const filters = {
        category: searchParams.get('category') || undefined,
        specialty: searchParams.get('specialty') || undefined,
        search: searchParams.get('search') || undefined,
        featured: searchParams.get('featured') === 'true' || undefined,
        sortBy: (searchParams.get('sortBy') as 'rating' | 'usage' | 'recent') || 'recent',
      };

      const templates = await getPublicTemplates(filters);
      return NextResponse.json({ templates });
    }
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workflow-templates
 * 새 템플릿 생성
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const template = await createTemplate(userId, body);

    return NextResponse.json({ template }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create template' },
      { status: 500 }
    );
  }
}

