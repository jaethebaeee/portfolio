import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase";

/**
 * GET /api/workflows/[id]/stats - 워크플로우 실행 통계
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
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30", 10);
    
    const supabase = createServerClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // 날짜 범위 계산
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 전체 실행 이력 조회
    const { data: executions, error } = await supabase
      .from("workflow_executions")
      .select("status, execution_time, created_at, error_message, execution_data")
      .eq("workflow_id", id)
      .eq("user_id", userId)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;

    const total = executions?.length || 0;
    const successful = executions?.filter(e => e.status === 'completed').length || 0;
    const failed = executions?.filter(e => e.status === 'failed').length || 0;
    const running = executions?.filter(e => e.status === 'running').length || 0;
    const successRate = total > 0 ? successful / total : 0;

    // 실행 시간 통계
    const executionTimes = executions
      ?.filter(e => e.execution_time && e.execution_time > 0)
      .map(e => e.execution_time!) || [];
    
    const avgExecutionTime = executionTimes.length > 0
      ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length
      : 0;
    
    const sortedTimes = [...executionTimes].sort((a, b) => a - b);
    const medianExecutionTime = sortedTimes.length > 0
      ? sortedTimes[Math.floor(sortedTimes.length / 2)]
      : 0;
    
    const p95ExecutionTime = sortedTimes.length > 0
      ? sortedTimes[Math.floor(sortedTimes.length * 0.95)]
      : 0;

    // 에러 분석
    const errorMessages = executions
      ?.filter(e => e.status === 'failed' && e.error_message)
      .map(e => e.error_message!) || [];
    
    const errorFrequency: Record<string, number> = {};
    errorMessages.forEach(msg => {
      const key = msg.substring(0, 50); // 첫 50자만 사용
      errorFrequency[key] = (errorFrequency[key] || 0) + 1;
    });

    // 일별 통계
    const dailyStats: Record<string, { executions: number; successes: number; failures: number }> = {};
    executions?.forEach(exec => {
      const date = new Date(exec.created_at).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { executions: 0, successes: 0, failures: 0 };
      }
      dailyStats[date].executions++;
      if (exec.status === 'completed') {
        dailyStats[date].successes++;
      } else if (exec.status === 'failed') {
        dailyStats[date].failures++;
      }
    });

    const timeSeries = Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        executions: stats.executions,
        successes: stats.successes,
        failures: stats.failures,
        successRate: stats.executions > 0 ? stats.successes / stats.executions : 0
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      workflowId: id,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days
      },
      summary: {
        totalExecutions: total,
        successfulExecutions: successful,
        failedExecutions: failed,
        runningExecutions: running,
        successRate: Math.round(successRate * 10000) / 100, // 소수점 2자리
        failureRate: Math.round((failed / total) * 10000) / 100
      },
      performance: {
        averageExecutionTime: Math.round(avgExecutionTime),
        medianExecutionTime: Math.round(medianExecutionTime),
        p95ExecutionTime: Math.round(p95ExecutionTime),
        minExecutionTime: executionTimes.length > 0 ? Math.min(...executionTimes) : 0,
        maxExecutionTime: executionTimes.length > 0 ? Math.max(...executionTimes) : 0
      },
      errors: {
        totalErrors: failed,
        topErrors: Object.entries(errorFrequency)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([message, count]) => ({ message, count }))
      },
      timeSeries
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching workflow stats:", error);
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

