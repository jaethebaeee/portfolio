import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { WorkflowQueue } from '@/lib/workflow-queue';

/**
 * Cron endpoint to process delayed workflow jobs
 * Should be called every minute to check for jobs ready to execute
 * 
 * GET /api/cron/process-delayed-jobs?key=CRON_SECRET
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  
  const authHeader = req.headers.get('authorization');
  const validSecret = process.env.CRON_SECRET;

  const isValidKey = key === validSecret;
  const isValidHeader = authHeader === `Bearer ${validSecret}`;
  
  if (!validSecret || (!isValidKey && !isValidHeader)) {
    if (process.env.NODE_ENV === 'development' && key === 'demo-secret') {
      // Allow demo-secret in dev only
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const supabase = createServerClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const workflowQueue = WorkflowQueue.getInstance();
    const now = new Date();

    // Load and lock jobs atomically using the queue system
    // The queue uses rpc('get_next_jobs') internally to prevent race conditions
    // pass true to process immediately (Serverless friendly)
    await workflowQueue.loadScheduledJobs(true);

    return NextResponse.json({
      success: true,
      message: 'Jobs processed successfully',
      timestamp: now.toISOString()
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    if (process.env.NODE_ENV === 'development') {
      console.error('Cron Error:', error);
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

