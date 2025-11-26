import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  createTemplate,
  importTemplateFromJSON,
} from '@/lib/workflow-template-library';

/**
 * POST /api/workflow-templates/import
 * JSON에서 템플릿 가져오기
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { json, isPublic } = body;

    if (!json) {
      return NextResponse.json(
        { error: 'JSON data is required' },
        { status: 400 }
      );
    }

    const templateData = importTemplateFromJSON(json);
    const template = await createTemplate(userId, {
      ...templateData,
      is_public: isPublic || false,
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error: any) {
    console.error('Error importing template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import template' },
      { status: 500 }
    );
  }
}

