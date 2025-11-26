import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getWorkflow,
  updateWorkflow,
  deleteWorkflow,
} from '@/lib/workflows';
import { Workflow } from '@/lib/database.types';

/**
 * GET /api/workflows/[id] - 워크플로우 단일 조회
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
    const workflow = await getWorkflow(userId, id);

    if (!workflow) {
      return NextResponse.json(
        { error: '워크플로우를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ workflow });
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('워크플로우 조회 오류:', error);
    }
    
    // Handle not found error
    if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116') {
      return NextResponse.json(
        { error: '워크플로우를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/workflows/[id] - 워크플로우 업데이트
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

    // Build update input (only include provided fields)
    const updates: Partial<Workflow> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.trigger_type !== undefined) updates.trigger_type = body.trigger_type;
    if (body.target_surgery_type !== undefined) updates.target_surgery_type = body.target_surgery_type;
    if (body.steps !== undefined) updates.steps = body.steps;
    if (body.visual_data !== undefined) updates.visual_data = body.visual_data;
    if (body.is_active !== undefined) updates.is_active = body.is_active;

    const workflow = await updateWorkflow(userId, id, updates);
    return NextResponse.json({ workflow });
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('워크플로우 업데이트 오류:', error);
    }
    
    // Handle not found error
    if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116') {
      return NextResponse.json(
        { error: '워크플로우를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workflows/[id] - 워크플로우 삭제
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
    await deleteWorkflow(userId, id);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('워크플로우 삭제 오류:', error);
    }
    
    // Handle not found error
    if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116') {
      return NextResponse.json(
        { error: '워크플로우를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

