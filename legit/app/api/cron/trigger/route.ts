import { NextRequest, NextResponse } from 'next/server';
import { executeDailyWorkflows } from '@/lib/workflow-execution';
import { createServerClient } from '@/lib/supabase';

// CRON Endpoint (e.g. called by Vercel Cron or external scheduler)
// GET /api/cron/trigger?key=SECRET_KEY
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  
  // Check CRON_SECRET from environment variables
  // Also support Vercel Cron header if needed (Authorization: Bearer <CRON_SECRET>)
  const authHeader = req.headers.get('authorization');
  const validSecret = process.env.CRON_SECRET;

  const isValidKey = key === validSecret;
  const isValidHeader = authHeader === `Bearer ${validSecret}`;
  
  if (!validSecret || (!isValidKey && !isValidHeader)) {
    // Fallback for development only if CRON_SECRET is not set
    if (process.env.NODE_ENV === 'development' && key === 'demo-secret') {
      // Allow demo-secret in dev only
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    // 1. Load scheduled delayed jobs from database
    const { WorkflowQueue } = await import('@/lib/workflow-queue');
    const workflowQueue = WorkflowQueue.getInstance();
    await workflowQueue.loadScheduledJobs();

    // 2. Get all active users (or iterate through them)
    // For MVP, we might just run for specific users or all.
    // Let's run for all users who have active workflows.
    
    // Distinct user_ids from workflows
    const supabase = createServerClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data: users, error } = await supabase
      .from('workflows')
      .select('user_id')
      .eq('is_active', true);
      
    if (error) throw error;
    
    // Unique users
    const userIds = Array.from(new Set(users.map(u => u.user_id)));
    const results = [];
    const executionLogs = [];

    for (const userId of userIds) {
      try {
        const result = await executeDailyWorkflows(userId);
        results.push({ userId, ...result });
        
        // Collect detailed logs for response
        if (result.logs && result.logs.length > 0) {
          executionLogs.push(...result.logs);
        }
      } catch (e: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`Failed for user ${userId}:`, e);
        }
        results.push({ userId, error: e.message });
      }
    }

    // Optional: Log summary to Supabase (system log table if exists)
    // For now, just return detailed JSON for Vercel Cron logs

    return NextResponse.json({ 
      success: true, 
      timestamp: new Date().toISOString(),
      processed_users: userIds.length,
      execution_summary: results,
      logs: executionLogs
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    if (process.env.NODE_ENV === 'development') {
      console.error('Cron Error:', error);
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

