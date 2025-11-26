import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase";

/**
 * GET /api/workflows/executions/[id] - 실행 이력 상세 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createServerClient();
    
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // 실행 이력 상세 조회 (관계 데이터 포함)
    const { data: execution, error } = await supabase
      .from("workflow_executions")
      .select(
        `
        *,
        workflow:workflows(
          id,
          name,
          description,
          trigger_type,
          is_active
        ),
        patient:patients(
          id,
          name,
          phone,
          email
        ),
        appointment:appointments(
          id,
          appointment_date,
          appointment_time,
          surgery_type
        )
      `
      )
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: "Execution not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    if (!execution) {
      return NextResponse.json(
        { error: "Execution not found" },
        { status: 404 }
      );
    }

    // 실행 로그 조회 (있는 경우)
    const { data: logs } = await supabase
      .from("message_logs")
      .select("*")
      .contains("metadata", { execution_id: id })
      .order("created_at", { ascending: true });

    // 실행 데이터 파싱
    const executionData = execution.execution_data as any || {};
    
    return NextResponse.json({
      execution: {
        ...execution,
        executionData,
        logs: logs || [],
        // 계산된 필드
        duration: execution.completed_at && execution.started_at
          ? new Date(execution.completed_at).getTime() - new Date(execution.started_at).getTime()
          : null,
        progress: execution.total_steps > 0
          ? (execution.steps_completed / execution.total_steps) * 100
          : 0
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching execution:", error);
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

