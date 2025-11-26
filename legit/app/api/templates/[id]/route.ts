import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
} from '@/lib/templates';
import { MarketingTemplate } from '@/lib/template-types';
import { validateTemplateForSave } from '@/lib/template-validation';

/**
 * GET /api/templates/[id] - 템플릿 단일 조회
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
    const template = await getTemplate(userId, id);

    if (!template) {
      return NextResponse.json(
        { error: '템플릿을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ template });
  } catch (error: any) {
    console.error('템플릿 조회 오류:', error);
    
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

/**
 * PATCH /api/templates/[id] - 템플릿 업데이트
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

    // Get existing template for validation
    const existing = await getTemplate(userId, id);
    if (!existing) {
      return NextResponse.json(
        { error: '템플릿을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Build update input (only include provided fields)
    const updates: Partial<Omit<MarketingTemplate, 'id' | 'createdAt' | 'updatedAt'>> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.trigger !== undefined) updates.trigger = body.trigger;
    if (body.messages !== undefined) updates.messages = body.messages;
    if (body.enabled !== undefined) updates.enabled = body.enabled;

    // Validate template if messages or trigger changed
    if (updates.messages || updates.trigger) {
      const validation = validateTemplateForSave({
        ...existing,
        ...updates,
      });

      if (!validation.isValid) {
        return NextResponse.json(
          { error: validation.errors.join(', ') },
          { status: 400 }
        );
      }
    }

    const template = await updateTemplate(userId, id, updates);
    return NextResponse.json({ template });
  } catch (error: any) {
    console.error('템플릿 업데이트 오류:', error);
    
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

/**
 * DELETE /api/templates/[id] - 템플릿 삭제
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
    await deleteTemplate(userId, id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('템플릿 삭제 오류:', error);
    
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

