import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getWorkflows,
  createWorkflow,
} from '@/lib/workflows';
import { Workflow } from '@/lib/database.types';

/**
 * GET /api/workflows - 워크플로우 목록 조회
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
    const isActive = searchParams.get('is_active');
    
    const workflows = await getWorkflows(userId);
    
    // Filter by is_active if provided
    let filteredWorkflows = workflows;
    if (isActive !== null) {
      const active = isActive === 'true';
      filteredWorkflows = workflows.filter(w => w.is_active === active);
    }

    return NextResponse.json({ workflows: filteredWorkflows });
  } catch (error: unknown) {
    console.error('워크플로우 목록 조회 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workflows - 워크플로우 생성
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
        { error: '워크플로우 이름은 필수입니다.' },
        { status: 400 }
      );
    }

    // Build workflow input
    const workflowInput: Partial<Workflow> = {
      name: body.name,
      description: body.description,
      trigger_type: body.trigger_type || 'post_surgery',
      target_surgery_type: body.target_surgery_type,
      steps: body.steps || [],
      visual_data: body.visual_data || null,
      is_active: body.is_active ?? true,
    };

    const workflow = await createWorkflow(userId, workflowInput);
    return NextResponse.json({ workflow }, { status: 201 });
  } catch (error: unknown) {
    console.error('워크플로우 생성 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

