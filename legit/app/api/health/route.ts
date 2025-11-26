import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { WorkflowQueue } from '@/lib/workflow-queue';

/**
 * Health Check Endpoint
 * Checks database, queue, and environment status
 * 
 * GET /api/health
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const checks: Record<string, any> = {
    database: { status: 'unknown' },
    queue: { status: 'unknown' },
    environment: { status: 'unknown' },
  };
  
  let statusCode = 200;

  try {
    // 1. Check Environment
    const envVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'CRON_SECRET'
    ];
    
    const missingVars = envVars.filter(v => !process.env[v]);
    checks.environment = {
      status: missingVars.length === 0 ? 'healthy' : 'degraded',
      missing: missingVars
    };
    
    if (missingVars.length > 0) statusCode = 503;

    // 2. Check Database
    const supabase = createServerClient();
    if (supabase) {
      const { data, error } = await supabase.from('workflow_jobs').select('count', { count: 'exact', head: true });
      if (error) {
        checks.database = { status: 'unhealthy', error: error.message };
        statusCode = 503;
      } else {
        checks.database = { status: 'healthy', latency: Date.now() - startTime };
      }
    } else {
      checks.database = { status: 'unhealthy', error: 'Client initialization failed' };
      statusCode = 503;
    }

    // 3. Check Queue
    if (checks.database.status === 'healthy' && supabase) {
      // Check for stuck jobs
      const { count: stuckCount } = await supabase
        .from('workflow_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'processing')
        .lt('updated_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()); // Older than 10m

      // Check for failed jobs in last 24h
      const { count: failedCount } = await supabase
        .from('workflow_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed')
        .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const queueStats = WorkflowQueue.getInstance().getStats();
      
      checks.queue = {
        status: stuckCount && stuckCount > 10 ? 'degraded' : 'healthy',
        stuck_jobs: stuckCount,
        failed_jobs_24h: failedCount,
        active_jobs: queueStats.active,
        waiting_jobs: queueStats.waiting
      };
    }

  } catch (error: any) {
    checks.system = { status: 'error', message: error.message };
    statusCode = 500;
  }

  const duration = Date.now() - startTime;
  
  return NextResponse.json({
    status: statusCode === 200 ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    duration_ms: duration,
    checks
  }, { status: statusCode });
}

