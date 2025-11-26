import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const webhookId = searchParams.get('webhook_id');
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const supabase = createServerClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    let query = supabase
      .from('webhook_executions')
      .select(`
        *,
        webhook:webhooks(name, url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (webhookId) {
      query = query.eq('webhook_id', webhookId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: executions, error } = await query;

    if (error) throw error;

    return NextResponse.json({ executions });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching webhook executions:', error);
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

