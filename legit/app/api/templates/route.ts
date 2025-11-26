import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getTemplates,
  createTemplate,
} from '@/lib/templates';
import { MarketingTemplate } from '@/lib/template-types';
import { validateTemplateForSave } from '@/lib/template-validation';

/**
 * GET /api/templates - 템플릿 목록 조회
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

    const { searchParams } = new URL(request.url);
    const enabled = searchParams.get('enabled');
    
    const templates = await getTemplates(userId);
    
    // Filter by enabled if provided
    let filteredTemplates = templates;
    if (enabled !== null) {
      const isEnabled = enabled === 'true';
      filteredTemplates = templates.filter(t => t.enabled === isEnabled);
    }

    return NextResponse.json({ templates: filteredTemplates });
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('템플릿 목록 조회 오류:', error);
    }
    const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates - 템플릿 생성
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
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: '템플릿 이름은 필수입니다.' },
        { status: 400 }
      );
    }

    // Build template input
    const templateInput: Omit<MarketingTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
      name: body.name,
      description: body.description || '',
      trigger: body.trigger || {
        type: 'appointment_completed',
      },
      messages: body.messages || [],
      enabled: body.enabled ?? true,
    };

    // Validate template
    const validation = validateTemplateForSave({
      ...templateInput,
      id: 'temp',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    const template = await createTemplate(userId, templateInput);
    return NextResponse.json({ template }, { status: 201 });
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('템플릿 생성 오류:', error);
    }
    const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

