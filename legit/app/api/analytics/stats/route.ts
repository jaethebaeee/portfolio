import { createServerClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const range = searchParams.get('range') || '30d'; // 7d, 30d, 90d

  try {
    const now = new Date();
    let startDate = new Date();
    
    if (range === '7d') startDate.setDate(now.getDate() - 7);
    else if (range === '90d') startDate.setDate(now.getDate() - 90);
    else startDate.setDate(now.getDate() - 30);

    const isoStartDate = startDate.toISOString();

    // 1. Message Stats (Total, Sent, Failed)
    const { data: messageStats, error: msgError } = await supabase
      .from('message_logs')
      .select('status, created_at, channel')
      .eq('user_id', userId)
      .gte('created_at', isoStartDate);

    if (msgError) throw msgError;

    // 2. Workflow Executions
    const { data: workflowStats, error: wfError } = await supabase
      .from('workflow_executions')
      .select('status, created_at, workflow_id, workflows(name)')
      .eq('user_id', userId)
      .gte('created_at', isoStartDate);

    if (wfError) throw wfError;

    // Process Data
    const totalMessages = messageStats.length;
    const successfulMessages = messageStats.filter(m => m.status === 'success' || m.status === 'sent').length;
    const failedMessages = messageStats.filter(m => m.status === 'failed').length;
    const pendingMessages = messageStats.filter(m => m.status === 'pending').length;

    // Channel Breakdown
    const channelStats = {
      kakao: messageStats.filter(m => m.channel?.includes('kakao') || m.channel === 'alimtalk').length,
      sms: messageStats.filter(m => m.channel === 'sms' || m.channel === 'lms').length,
    };

    // Daily Trend
    const dailyTrend = new Map<string, { sent: number; failed: number }>();
    // Initialize days
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      dailyTrend.set(d.toISOString().split('T')[0], { sent: 0, failed: 0 });
    }

    messageStats.forEach(m => {
      const date = m.created_at.split('T')[0];
      if (dailyTrend.has(date)) {
        const entry = dailyTrend.get(date)!;
        if (m.status === 'success' || m.status === 'sent') entry.sent++;
        else if (m.status === 'failed') entry.failed++;
      }
    });

    const chartData = Array.from(dailyTrend.entries()).map(([date, stats]) => ({
      date,
      sent: stats.sent,
      failed: stats.failed
    }));

    // Top Workflows
    const workflowCounts = new Map<string, { name: string, count: number, success: number }>();
    workflowStats.forEach(w => {
      const id = w.workflow_id;
      const name = (w.workflows as any)?.name || 'Unknown Workflow';
      if (!workflowCounts.has(id)) {
        workflowCounts.set(id, { name, count: 0, success: 0 });
      }
      const entry = workflowCounts.get(id)!;
      entry.count++;
      if (w.status === 'completed') entry.success++;
    });

    const topWorkflows = Array.from(workflowCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      overview: {
        total: totalMessages,
        success: successfulMessages,
        failed: failedMessages,
        pending: pendingMessages,
        deliveryRate: totalMessages > 0 ? Math.round((successfulMessages / totalMessages) * 100) : 0
      },
      channels: channelStats,
      trend: chartData,
      topWorkflows
    });

  } catch (error: any) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

