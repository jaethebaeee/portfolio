import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase";
import { WorkflowQueue } from "@/lib/workflow-queue";

/**
 * POST /api/workflows/executions/[id]/retry - 실패한 실행 재시도
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    
    const supabase = createServerClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // 실행 이력 조회
    const { data: execution, error: execError } = await supabase
      .from("workflow_executions")
      .select(`
        *,
        workflow:workflows(*),
        patient:patients(*),
        appointment:appointments(*)
      `)
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (execError || !execution) {
      return NextResponse.json(
        { error: "Execution not found" },
        { status: 404 }
      );
    }

    // 재시도 가능 여부 확인
    if (execution.status !== 'failed' && execution.status !== 'completed') {
      return NextResponse.json(
        { error: "Only failed or completed executions can be retried" },
        { status: 400 }
      );
    }

    // 워크플로우, 환자, 예약 정보 확인
    if (!execution.workflow || !execution.patient || !execution.appointment) {
      return NextResponse.json(
        { error: "Missing workflow, patient, or appointment data" },
        { status: 400 }
      );
    }

    // 재시도 옵션
    const retryOptions = {
      retryFailedNodesOnly: body.retryFailedNodesOnly ?? false,
      resetContext: body.resetContext ?? false,
      priority: body.priority || 'high' as 'low' | 'normal' | 'high' | 'critical'
    };

    // 실행 컨텍스트 복원
    const executionData = execution.execution_data as any || {};
    const context = retryOptions.resetContext 
      ? { daysPassed: executionData.days_passed || 0 }
      : {
          ...executionData.context,
          daysPassed: executionData.days_passed || 0,
          retryFromExecutionId: id,
          retryOptions
        };

    // 워크플로우 큐에 재시도 작업 추가
    const workflowQueue = WorkflowQueue.getInstance();
    const jobId = await workflowQueue.enqueue(
      execution.workflow,
      execution.patient,
      execution.appointment,
      context,
      {
        priority: retryOptions.priority,
        tags: ['retry', `original-execution-${id}`],
        maxRetries: body.maxRetries || 3,
        executionContext: {
          originalExecutionId: id,
          retryCount: (executionData.retryCount || 0) + 1,
          retryOptions
        }
      }
    );

    // 재시도 이력 기록
    await supabase
      .from("workflow_executions")
      .update({
        execution_data: {
          ...executionData,
          retryCount: (executionData.retryCount || 0) + 1,
          lastRetryAt: new Date().toISOString(),
          retryJobId: jobId
        }
      })
      .eq("id", id);

    return NextResponse.json({
      success: true,
      jobId,
      message: "Retry job queued successfully",
      retryOptions
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    if (process.env.NODE_ENV === 'development') {
      console.error("Error retrying execution:", error);
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

