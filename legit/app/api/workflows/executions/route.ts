import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const workflowId = searchParams.get("workflow_id");
  const patientId = searchParams.get("patient_id");
  const status = searchParams.get("status");
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");
  const limitParam = parseInt(searchParams.get("limit") || "50", 10);
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  const limit = Math.min(Math.max(isNaN(limitParam) ? 50 : limitParam, 1), 100);
  const page = Math.max(isNaN(pageParam) ? 1 : pageParam, 1);
  const rangeStart = (page - 1) * limit;
  const rangeEnd = rangeStart + limit - 1;

  try {
    const supabase = createServerClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    let query = supabase
      .from("workflow_executions")
      .select(
        `
        *,
        workflow:workflows(name),
        patient:patients(name, phone)
      `,
        { count: "exact" }
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(rangeStart, rangeEnd);

    if (workflowId) {
      query = query.eq("workflow_id", workflowId);
    }

    if (patientId) {
      query = query.eq("patient_id", patientId);
    }

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (startDate) {
      const start = new Date(startDate);
      if (!isNaN(start.getTime())) {
        start.setHours(0, 0, 0, 0);
        query = query.gte("created_at", start.toISOString());
      }
    }

    if (endDate) {
      const end = new Date(endDate);
      if (!isNaN(end.getTime())) {
        end.setHours(23, 59, 59, 999);
        query = query.lte("created_at", end.toISOString());
      }
    }

    const { data: executions, error, count } = await query;

    if (error) throw error;

    const total = count ?? 0;
    const pageCount = total > 0 ? Math.ceil(total / limit) : 0;

    return NextResponse.json({ executions, total, page, limit, pageCount });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching workflow executions:", error);
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

