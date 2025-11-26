import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  createWorkflowFromTemplate,
  recordTemplateUsage,
} from '@/lib/workflow-template-library';

/**
 * POST /api/workflow-templates/[id]/use
 * 템플릿을 사용하여 워크플로우 생성
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
    const { workflowName, description, activateImmediately } = body;

    const workflow = await createWorkflowFromTemplate(
      userId,
      id,
      {
        workflowName,
        description,
        activateImmediately,
      }
    );

    return NextResponse.json({ workflow }, { status: 201 });
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error using template:', error);
    }
    const errorMessage = error instanceof Error ? error.message : 'Failed to use template';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

