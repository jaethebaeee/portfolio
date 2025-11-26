/**
 * Workflow Execution Metrics and Monitoring
 * Tracks performance, errors, and success rates
 */

import { supabase } from './supabase';

interface WorkflowMetrics {
  workflowId: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  averageExecutionTime: number;
  nodeMetrics: Record<string, NodeMetrics>;
  errorRates: Record<string, number>;
  lastExecutionTime: number;
  uptime: number;
}

interface NodeMetrics {
  executionCount: number;
  successCount: number;
  failureCount: number;
  averageExecutionTime: number;
  errorRate: number;
  lastExecutionTime: number;
}

interface ExecutionMetrics {
  workflowId: string;
  executionId: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  nodeCount: number;
  errorMessage?: string;
  nodeResults: Array<{
    nodeId: string;
    nodeType: string;
    success: boolean;
    duration: number;
    error?: string;
  }>;
}

export class WorkflowMetricsCollector {
  private static instance: WorkflowMetricsCollector;
  private metrics = new Map<string, WorkflowMetrics>();
  private executionHistory: ExecutionMetrics[] = [];
  private readonly MAX_HISTORY_SIZE = 1000;

  static getInstance(): WorkflowMetricsCollector {
    if (!WorkflowMetricsCollector.instance) {
      WorkflowMetricsCollector.instance = new WorkflowMetricsCollector();
    }
    return WorkflowMetricsCollector.instance;
  }

  // Record workflow execution
  recordExecution(metrics: ExecutionMetrics): void {
    // Update workflow-level metrics
    const workflowMetrics = this.metrics.get(metrics.workflowId) || this.createEmptyMetrics(metrics.workflowId);

    workflowMetrics.executionCount++;
    if (metrics.success) {
      workflowMetrics.successCount++;
    } else {
      workflowMetrics.failureCount++;
    }

    workflowMetrics.averageExecutionTime =
      (workflowMetrics.averageExecutionTime * (workflowMetrics.executionCount - 1) + metrics.duration) /
      workflowMetrics.executionCount;

    workflowMetrics.lastExecutionTime = metrics.endTime;

    // Update node-level metrics
    for (const nodeResult of metrics.nodeResults) {
      const nodeMetrics = workflowMetrics.nodeMetrics[nodeResult.nodeId] || {
        executionCount: 0,
        successCount: 0,
        failureCount: 0,
        averageExecutionTime: 0,
        errorRate: 0,
        lastExecutionTime: 0
      };

      nodeMetrics.executionCount++;
      if (nodeResult.success) {
        nodeMetrics.successCount++;
      } else {
        nodeMetrics.failureCount++;
      }

      nodeMetrics.averageExecutionTime =
        (nodeMetrics.averageExecutionTime * (nodeMetrics.executionCount - 1) + nodeResult.duration) /
        nodeMetrics.executionCount;

      nodeMetrics.errorRate = nodeMetrics.failureCount / nodeMetrics.executionCount;
      nodeMetrics.lastExecutionTime = metrics.endTime;

      workflowMetrics.nodeMetrics[nodeResult.nodeId] = nodeMetrics;
    }

    // Update error rates
    workflowMetrics.errorRates = Object.fromEntries(
      Object.entries(workflowMetrics.nodeMetrics).map(([nodeId, metrics]) => [
        nodeId,
        metrics.errorRate
      ])
    );

    this.metrics.set(metrics.workflowId, workflowMetrics);

    // Add to execution history
    this.executionHistory.push(metrics);
    if (this.executionHistory.length > this.MAX_HISTORY_SIZE) {
      this.executionHistory.shift();
    }

    // Persist metrics asynchronously
    this.persistMetrics(metrics.workflowId, workflowMetrics);
  }

  private createEmptyMetrics(workflowId: string): WorkflowMetrics {
    return {
      workflowId,
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      averageExecutionTime: 0,
      nodeMetrics: {},
      errorRates: {},
      lastExecutionTime: 0,
      uptime: 1.0
    };
  }

  private async persistMetrics(workflowId: string, metrics: WorkflowMetrics): Promise<void> {
    try {
      await supabase
        .from('workflow_metrics')
        .upsert({
          workflow_id: workflowId,
          metrics_data: metrics,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to persist workflow metrics:', error);
    }
  }

  // Get workflow metrics
  getWorkflowMetrics(workflowId: string): WorkflowMetrics | null {
    return this.metrics.get(workflowId) || null;
  }

  // Get all workflow metrics
  getAllMetrics(): Map<string, WorkflowMetrics> {
    return new Map(this.metrics);
  }

  // Get execution history
  getExecutionHistory(workflowId?: string, limit = 100): ExecutionMetrics[] {
    let history = this.executionHistory;

    if (workflowId) {
      history = history.filter(h => h.workflowId === workflowId);
    }

    return history.slice(-limit);
  }

  // Calculate success rate
  getSuccessRate(workflowId: string): number {
    const metrics = this.metrics.get(workflowId);
    if (!metrics || metrics.executionCount === 0) return 0;

    return metrics.successCount / metrics.executionCount;
  }

  // Get performance statistics
  getPerformanceStats(workflowId: string): {
    averageExecutionTime: number;
    medianExecutionTime: number;
    p95ExecutionTime: number;
    slowestNode: { nodeId: string; averageTime: number };
    fastestNode: { nodeId: string; averageTime: number };
  } {
    const history = this.getExecutionHistory(workflowId, 1000);
    if (history.length === 0) {
      return {
        averageExecutionTime: 0,
        medianExecutionTime: 0,
        p95ExecutionTime: 0,
        slowestNode: { nodeId: '', averageTime: 0 },
        fastestNode: { nodeId: '', averageTime: 0 }
      };
    }

    const executionTimes = history.map(h => h.duration).sort((a, b) => a - b);
    const averageExecutionTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
    const medianExecutionTime = executionTimes[Math.floor(executionTimes.length / 2)];
    const p95ExecutionTime = executionTimes[Math.floor(executionTimes.length * 0.95)];

    // Node performance analysis
    const nodeTimes = new Map<string, number[]>();
    for (const exec of history) {
      for (const node of exec.nodeResults) {
        if (!nodeTimes.has(node.nodeId)) {
          nodeTimes.set(node.nodeId, []);
        }
        nodeTimes.get(node.nodeId)!.push(node.duration);
      }
    }

    const nodeAverages = Array.from(nodeTimes.entries()).map(([nodeId, times]) => ({
      nodeId,
      averageTime: times.reduce((a, b) => a + b, 0) / times.length
    }));

    const slowestNode = nodeAverages.reduce((max, curr) =>
      curr.averageTime > max.averageTime ? curr : max,
      { nodeId: '', averageTime: 0 }
    );

    const fastestNode = nodeAverages.reduce((min, curr) =>
      curr.averageTime < min.averageTime ? curr : min,
      { nodeId: '', averageTime: Infinity }
    );

    return {
      averageExecutionTime,
      medianExecutionTime,
      p95ExecutionTime,
      slowestNode,
      fastestNode: fastestNode.averageTime === Infinity ? { nodeId: '', averageTime: 0 } : fastestNode
    };
  }

  // Get health status
  getHealthStatus(workflowId: string): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  } {
    const metrics = this.metrics.get(workflowId);
    if (!metrics) {
      return {
        status: 'warning',
        issues: ['No execution data available'],
        recommendations: ['Run workflow to collect metrics']
      };
    }

    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check success rate
    const successRate = this.getSuccessRate(workflowId);
    if (successRate < 0.8) {
      issues.push(`Low success rate: ${(successRate * 100).toFixed(1)}%`);
      recommendations.push('Investigate and fix failing nodes');
    }

    // Check performance
    const perfStats = this.getPerformanceStats(workflowId);
    if (perfStats.averageExecutionTime > 30000) { // 30 seconds
      issues.push(`Slow execution: ${perfStats.averageExecutionTime.toFixed(0)}ms average`);
      recommendations.push('Optimize slow-performing nodes');
    }

    // Check error rates by node
    for (const [nodeId, errorRate] of Object.entries(metrics.errorRates)) {
      if (errorRate > 0.2) { // 20% error rate
        issues.push(`High error rate in node ${nodeId}: ${(errorRate * 100).toFixed(1)}%`);
        recommendations.push(`Debug and fix node ${nodeId}`);
      }
    }

    // Determine status
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (issues.length > 2) {
      status = 'critical';
    } else if (issues.length > 0) {
      status = 'warning';
    }

    return { status, issues, recommendations };
  }

  // Export metrics for monitoring dashboards
  exportMetrics(): {
    workflows: Array<{
      workflowId: string;
      metrics: WorkflowMetrics;
      health: ReturnType<typeof this.getHealthStatus>;
    }>;
    summary: {
      totalWorkflows: number;
      totalExecutions: number;
      averageSuccessRate: number;
      averageExecutionTime: number;
    };
  } {
    const workflows = Array.from(this.metrics.entries()).map(([workflowId, metrics]) => ({
      workflowId,
      metrics,
      health: this.getHealthStatus(workflowId)
    }));

    const totalExecutions = workflows.reduce((sum, w) => sum + w.metrics.executionCount, 0);
    const averageSuccessRate = workflows.length > 0
      ? workflows.reduce((sum, w) => sum + this.getSuccessRate(w.workflowId), 0) / workflows.length
      : 0;
    const averageExecutionTime = workflows.length > 0
      ? workflows.reduce((sum, w) => sum + w.metrics.averageExecutionTime, 0) / workflows.length
      : 0;

    return {
      workflows,
      summary: {
        totalWorkflows: workflows.length,
        totalExecutions,
        averageSuccessRate,
        averageExecutionTime
      }
    };
  }

  // Clear metrics (for testing)
  clear(): void {
    this.metrics.clear();
    this.executionHistory = [];
  }
}

// Singleton instance
export const workflowMetrics = WorkflowMetricsCollector.getInstance();
