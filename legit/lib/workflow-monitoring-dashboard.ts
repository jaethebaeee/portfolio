/**
 * Workflow Monitoring Dashboard
 * Real-time monitoring and analytics for distributed workflow system
 */

import { supabase } from './supabase';
import { workflowMetrics } from './workflow-metrics';
import { WorkflowLoadBalancer } from './workflow-load-balancer';
import { workflowClusterManager } from './workflow-cluster-manager';

export interface DashboardMetrics {
  timestamp: number;
  system: {
    totalWorkflows: number;
    activeWorkflows: number;
    completedWorkflows: number;
    failedWorkflows: number;
    successRate: number;
  };
  performance: {
    averageExecutionTime: number;
    p95ExecutionTime: number;
    slowestWorkflow: string;
    fastestWorkflow: string;
  };
  cluster: {
    totalNodes: number;
    healthyNodes: number;
    leaderNode: string;
    loadDistribution: Record<string, number>;
  };
  queue: {
    waitingJobs: number;
    processingJobs: number;
    throughput: number;
    averageQueueTime: number;
  };
  alerts: Alert[];
}

export interface Alert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
  source: string;
}

export class WorkflowMonitoringDashboard {
  private static instance: WorkflowMonitoringDashboard;
  private alerts: Alert[] = [];
  private metricsHistory: DashboardMetrics[] = [];
  private maxHistorySize = 1000;
  private updateInterval: NodeJS.Timeout | null = null;
  private alertCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeMonitoring();
  }

  static getInstance(): WorkflowMonitoringDashboard {
    if (!WorkflowMonitoringDashboard.instance) {
      WorkflowMonitoringDashboard.instance = new WorkflowMonitoringDashboard();
    }
    return WorkflowMonitoringDashboard.instance;
  }

  private initializeMonitoring(): void {
    // Update metrics every 30 seconds
    this.updateInterval = setInterval(() => {
      this.updateMetrics();
    }, 30000);

    // Check for alerts every 60 seconds
    this.alertCheckInterval = setInterval(() => {
      this.checkAlerts();
    }, 60000);
  }

  // Get current dashboard metrics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const timestamp = Date.now();

    // System metrics
    const systemMetrics = await this.getSystemMetrics();

    // Performance metrics
    const performanceMetrics = await this.getPerformanceMetrics();

    // Cluster metrics
    const clusterMetrics = await this.getClusterMetrics();

    // Queue metrics
    const queueMetrics = await this.getQueueMetrics();

    const metrics: DashboardMetrics = {
      timestamp,
      system: systemMetrics,
      performance: performanceMetrics,
      cluster: clusterMetrics,
      queue: queueMetrics,
      alerts: this.alerts.filter(alert => !alert.acknowledged).slice(-10) // Last 10 unacknowledged alerts
    };

    // Store in history
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.shift();
    }

    return metrics;
  }

  private async getSystemMetrics() {
    try {
      // Get workflow counts from database
      const { data: workflowStats, error } = await supabase
        .rpc('get_workflow_stats');

      if (error || !workflowStats) {
        return {
          totalWorkflows: 0,
          activeWorkflows: 0,
          completedWorkflows: 0,
          failedWorkflows: 0,
          successRate: 0
        };
      }

      const total = workflowStats.total || 0;
      const completed = workflowStats.completed || 0;
      const failed = workflowStats.failed || 0;
      const successRate = total > 0 ? (completed / total) * 100 : 0;

      return {
        totalWorkflows: total,
        activeWorkflows: workflowStats.active || 0,
        completedWorkflows: completed,
        failedWorkflows: failed,
        successRate
      };
    } catch (error) {
      console.error('Failed to get system metrics:', error);
      return {
        totalWorkflows: 0,
        activeWorkflows: 0,
        completedWorkflows: 0,
        failedWorkflows: 0,
        successRate: 0
      };
    }
  }

  private async getPerformanceMetrics() {
    try {
      // Get performance data from metrics collector
      const workflows = workflowMetrics.getAllMetrics();

      if (workflows.size === 0) {
        return {
          averageExecutionTime: 0,
          p95ExecutionTime: 0,
          slowestWorkflow: '',
          fastestWorkflow: ''
        };
      }

      const workflowList = Array.from(workflows.values());
      const executionTimes = workflowList.map(w => w.averageExecutionTime).sort((a, b) => a - b);

      const averageExecutionTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
      const p95ExecutionTime = executionTimes[Math.floor(executionTimes.length * 0.95)];

      // Find slowest and fastest workflows
      const slowestWorkflow = workflowList.reduce((max, curr) =>
        curr.averageExecutionTime > max.averageExecutionTime ? curr : max
      );

      const fastestWorkflow = workflowList.reduce((min, curr) =>
        curr.averageExecutionTime < min.averageExecutionTime ? curr : min
      );

      return {
        averageExecutionTime,
        p95ExecutionTime,
        slowestWorkflow: slowestWorkflow.workflowId,
        fastestWorkflow: fastestWorkflow.workflowId
      };
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      return {
        averageExecutionTime: 0,
        p95ExecutionTime: 0,
        slowestWorkflow: '',
        fastestWorkflow: ''
      };
    }
  }

  private async getClusterMetrics() {
    try {
      const clusterStatus = workflowClusterManager.getClusterStatus();
      const loadBalancer = WorkflowLoadBalancer.getInstance();
      const loadStats = loadBalancer.getStats();

      const loadDistribution: Record<string, number> = {};
      loadStats.instanceStats.forEach(stat => {
        loadDistribution[stat.id] = stat.load;
      });

      return {
        totalNodes: clusterStatus.totalNodes,
        healthyNodes: clusterStatus.activeNodes,
        leaderNode: clusterStatus.currentLeader || '',
        loadDistribution
      };
    } catch (error) {
      console.error('Failed to get cluster metrics:', error);
      return {
        totalNodes: 0,
        healthyNodes: 0,
        leaderNode: '',
        loadDistribution: {}
      };
    }
  }

  private async getQueueMetrics() {
    try {
      // In a real implementation, this would get data from the queue system
      // For now, return mock data
      return {
        waitingJobs: 0,
        processingJobs: 0,
        throughput: 0,
        averageQueueTime: 0
      };
    } catch (error) {
      console.error('Failed to get queue metrics:', error);
      return {
        waitingJobs: 0,
        processingJobs: 0,
        throughput: 0,
        averageQueueTime: 0
      };
    }
  }

  // Update metrics (called periodically)
  private async updateMetrics(): Promise<void> {
    try {
      await this.getDashboardMetrics();
    } catch (error) {
      console.error('Failed to update metrics:', error);
    }
  }

  // Check for alerts
  private async checkAlerts(): Promise<void> {
    try {
      const metrics = await this.getDashboardMetrics();

      // Check system health
      if (metrics.system.successRate < 80) {
        this.createAlert('warning', 'Low Success Rate',
          `Workflow success rate is ${metrics.system.successRate.toFixed(1)}%`, 'system');
      }

      // Check performance
      if (metrics.performance.averageExecutionTime > 60000) { // 1 minute
        this.createAlert('warning', 'Slow Performance',
          `Average execution time is ${(metrics.performance.averageExecutionTime / 1000).toFixed(1)}s`, 'performance');
      }

      // Check cluster health
      if (metrics.cluster.healthyNodes < metrics.cluster.totalNodes * 0.5) {
        this.createAlert('critical', 'Cluster Health',
          `Only ${metrics.cluster.healthyNodes}/${metrics.cluster.totalNodes} nodes are healthy`, 'cluster');
      }

      // Check queue health
      if (metrics.queue.waitingJobs > 100) {
        this.createAlert('warning', 'Queue Backlog',
          `${metrics.queue.waitingJobs} jobs waiting in queue`, 'queue');
      }

    } catch (error) {
      console.error('Alert check failed:', error);
    }
  }

  // Create alert
  private createAlert(level: Alert['level'], title: string, message: string, source: string): void {
    // Check if similar alert already exists
    const existingAlert = this.alerts.find(alert =>
      alert.title === title &&
      alert.level === level &&
      !alert.acknowledged &&
      Date.now() - alert.timestamp < 300000 // 5 minutes
    );

    if (existingAlert) return;

    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      level,
      title,
      message,
      timestamp: Date.now(),
      acknowledged: false,
      source
    };

    this.alerts.push(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }

    console.log(`[${level.toUpperCase()}] ${title}: ${message}`);
  }

  // Acknowledge alert
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  // Get alerts
  getAlerts(filter?: { level?: Alert['level']; acknowledged?: boolean; source?: string }): Alert[] {
    let filteredAlerts = this.alerts;

    if (filter) {
      filteredAlerts = filteredAlerts.filter(alert => {
        if (filter.level && alert.level !== filter.level) return false;
        if (filter.acknowledged !== undefined && alert.acknowledged !== filter.acknowledged) return false;
        if (filter.source && alert.source !== filter.source) return false;
        return true;
      });
    }

    return filteredAlerts;
  }

  // Get metrics history
  getMetricsHistory(hours: number = 24): DashboardMetrics[] {
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    return this.metricsHistory.filter(metrics => metrics.timestamp > cutoffTime);
  }

  // Get workflow execution details
  async getWorkflowDetails(workflowId: string): Promise<{
    workflow: any;
    executions: any[];
    metrics: any;
    health: any;
  } | null> {
    try {
      // Get workflow info
      const { data: workflow, error: wfError } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (wfError || !workflow) return null;

      // Get recent executions
      const { data: executions, error: execError } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('created_at', { ascending: false })
        .limit(50);

      // Get metrics
      const metrics = workflowMetrics.getWorkflowMetrics(workflowId);
      const health = workflowMetrics.getHealthStatus(workflowId);

      return {
        workflow,
        executions: executions || [],
        metrics,
        health
      };
    } catch (error) {
      console.error('Failed to get workflow details:', error);
      return null;
    }
  }

  // Export metrics for external monitoring
  async exportMetrics(): Promise<{
    dashboard: DashboardMetrics;
    alerts: Alert[];
    recommendations: string[];
  }> {
    const dashboard = await this.getDashboardMetrics();
    const alerts = this.getAlerts();
    const recommendations = this.generateRecommendations(dashboard);

    return {
      dashboard,
      alerts,
      recommendations
    };
  }

  // Generate recommendations based on metrics
  private generateRecommendations(metrics: DashboardMetrics): string[] {
    const recommendations: string[] = [];

    // System recommendations
    if (metrics.system.successRate < 90) {
      recommendations.push('Investigate and fix failing workflows to improve success rate');
    }

    // Performance recommendations
    if (metrics.performance.averageExecutionTime > 30000) {
      recommendations.push('Optimize slow-performing workflows or consider scaling up cluster');
    }

    // Cluster recommendations
    if (metrics.cluster.healthyNodes < metrics.cluster.totalNodes) {
      recommendations.push('Check unhealthy cluster nodes and consider adding more nodes');
    }

    // Queue recommendations
    if (metrics.queue.waitingJobs > 50) {
      recommendations.push('Scale up worker pool or optimize workflow execution');
    }

    return recommendations;
  }

  // Get real-time metrics (for WebSocket connections)
  getRealtimeMetrics(): {
    timestamp: number;
    activeWorkflows: number;
    queueLength: number;
    clusterHealth: string;
  } {
    const clusterStatus = workflowClusterManager.getClusterStatus();

    return {
      timestamp: Date.now(),
      activeWorkflows: clusterStatus.nodeStats.reduce((sum, node) => sum + (node.metrics?.activeWorkflows || 0), 0),
      queueLength: 0, // Would come from queue system
      clusterHealth: clusterStatus.activeNodes === clusterStatus.totalNodes ? 'healthy' : 'degraded'
    };
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    console.log('Shutting down workflow monitoring dashboard...');

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    if (this.alertCheckInterval) {
      clearInterval(this.alertCheckInterval);
      this.alertCheckInterval = null;
    }

    console.log('✓ Workflow monitoring dashboard shutdown complete');
  }
}

// Singleton instance
export const workflowMonitoringDashboard = WorkflowMonitoringDashboard.getInstance();
