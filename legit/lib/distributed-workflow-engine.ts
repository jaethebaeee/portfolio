/**
 * Distributed Workflow Execution Engine
 * Horizontal scaling with multiple worker processes
 */

import { supabase } from './supabase';
import { Workflow, Patient, Appointment } from './database.types';
import { WorkflowQueue } from './workflow-queue';
import { WorkflowWorker, WorkflowWorkerPool, AutoScalingWorkerPool } from './workflow-worker';
import { enhancedWorkflowEngine } from './workflow-execution-engine';

export interface DistributedEngineConfig {
  enableQueue: boolean;
  enableWorkers: boolean;
  enableAutoScaling: boolean;
  queueConfig: {
    maxConcurrency: number;
  };
  workerConfig: {
    poolSize: number;
    maxConcurrency: number;
    pollInterval: number;
    shutdownTimeout: number;
    healthCheckInterval: number;
  };
  autoScalingConfig: {
    minWorkers: number;
    maxWorkers: number;
    scaleUpThreshold: number;
    scaleDownThreshold: number;
    checkInterval: number;
  };
}

export class DistributedWorkflowEngine {
  private static instance: DistributedWorkflowEngine;
  private config: DistributedEngineConfig;
  private queue: WorkflowQueue | null = null;
  private workerPool: WorkflowWorkerPool | AutoScalingWorkerPool | null = null;
  private isInitialized = false;

  constructor(config: Partial<DistributedEngineConfig> = {}) {
    this.config = {
      enableQueue: true,
      enableWorkers: true,
      enableAutoScaling: true,
      queueConfig: {
        maxConcurrency: 10,
        ...config.queueConfig
      },
      workerConfig: {
        poolSize: 3,
        maxConcurrency: 5,
        pollInterval: 1000,
        shutdownTimeout: 30000,
        healthCheckInterval: 30000,
        ...config.workerConfig
      },
      autoScalingConfig: {
        minWorkers: 2,
        maxWorkers: 10,
        scaleUpThreshold: 20,
        scaleDownThreshold: 5,
        checkInterval: 30000,
        ...config.autoScalingConfig
      }
    };
  }

  static getInstance(): DistributedWorkflowEngine {
    if (!DistributedWorkflowEngine.instance) {
      DistributedWorkflowEngine.instance = new DistributedWorkflowEngine();
    }
    return DistributedWorkflowEngine.instance;
  }

  // Initialize distributed components
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('Initializing distributed workflow engine...');

    // Initialize queue
    if (this.config.enableQueue) {
      this.queue = WorkflowQueue.getInstance();
      console.log('✓ Workflow queue initialized');
    }

    // Initialize worker pool
    if (this.config.enableWorkers) {
      if (this.config.enableAutoScaling) {
        this.workerPool = new AutoScalingWorkerPool(
          {
            workerId: 'distributed',
            maxConcurrency: this.config.workerConfig.maxConcurrency,
            pollInterval: this.config.workerConfig.pollInterval,
            shutdownTimeout: this.config.workerConfig.shutdownTimeout,
            healthCheckInterval: this.config.workerConfig.healthCheckInterval
          },
          this.config.autoScalingConfig
        );
      } else {
        this.workerPool = new WorkflowWorkerPool(
          {
            workerId: 'distributed',
            maxConcurrency: this.config.workerConfig.maxConcurrency,
            pollInterval: this.config.workerConfig.pollInterval,
            shutdownTimeout: this.config.workerConfig.shutdownTimeout,
            healthCheckInterval: this.config.workerConfig.healthCheckInterval
          },
          this.config.workerConfig.poolSize
        );
      }

      await this.workerPool.start();
      console.log(`✓ Worker pool initialized (${this.config.enableAutoScaling ? 'auto-scaling' : 'fixed-size'})`);
    }

    this.isInitialized = true;
    console.log('✓ Distributed workflow engine ready');
  }

  // Execute workflow (synchronous for immediate response, queues for background processing)
  async executeWorkflow(
    workflow: Workflow,
    patient: Patient,
    appointment: Appointment,
    context: { daysPassed: number },
    options: {
      priority?: 'low' | 'normal' | 'high' | 'critical';
      immediate?: boolean; // Execute immediately vs queue
      tags?: string[];
      timeout?: number;
    } = {}
  ): Promise<{
    success: boolean;
    jobId?: string;
    result?: any;
    queued?: boolean;
    message: string;
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const { immediate = false, priority = 'normal', tags = [], timeout } = options;

    // For immediate execution, use the enhanced engine directly
    if (immediate || !this.config.enableQueue) {
      try {
        const result = await enhancedWorkflowEngine.executeWorkflow(
          workflow,
          patient,
          appointment,
          context,
          {
            enableParallelism: true,
            enableCaching: true,
            enableCircuitBreaker: true,
            enableMetrics: true,
            enableStatePersistence: true
          }
        );

        return {
          success: result.success,
          result: result,
          message: result.success ? 'Workflow executed successfully' : `Workflow execution failed: ${result.error}`
        };
      } catch (error: any) {
        return {
          success: false,
          message: `Workflow execution error: ${error.message}`
        };
      }
    }

    // For queued execution, add to queue
    if (this.queue) {
      try {
        const jobId = await this.queue.enqueue(
          workflow,
          patient,
          appointment,
          {
            daysPassed: context.daysPassed,
            triggerType: 'scheduled'
          },
          {
            priority,
            tags: ['distributed', ...tags],
            timeout: timeout || 300000 // 5 minutes
          }
        );

        return {
          success: true,
          jobId,
          queued: true,
          message: `Workflow queued for execution (Job ID: ${jobId})`
        };
      } catch (error: any) {
        return {
          success: false,
          message: `Failed to queue workflow: ${error.message}`
        };
      }
    }

    // Fallback to immediate execution
    return this.executeWorkflow(workflow, patient, appointment, context, { ...options, immediate: true });
  }

  // Execute multiple workflows in batch
  async executeWorkflows(
    workflowJobs: Array<{
      workflow: Workflow;
      patient: Patient;
      appointment: Appointment;
      context: { daysPassed: number };
      options?: {
        priority?: 'low' | 'normal' | 'high' | 'critical';
        tags?: string[];
        timeout?: number;
      };
    }>
  ): Promise<Array<{
    index: number;
    success: boolean;
    jobId?: string;
    result?: any;
    queued?: boolean;
    message: string;
  }>> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const results = await Promise.allSettled(
      workflowJobs.map(async (job, index) => {
        try {
          const result = await this.executeWorkflow(
            job.workflow,
            job.patient,
            job.appointment,
            job.context,
            job.options
          );
          return { index, ...result };
        } catch (error: any) {
          return {
            index,
            success: false,
            message: `Batch execution error: ${error.message}`
          };
        }
      })
    );

    return results.map(result =>
      result.status === 'fulfilled'
        ? result.value
        : { index: -1, success: false, message: 'Batch processing failed' }
    );
  }

  // Get job status
  async getJobStatus(jobId: string): Promise<{
    jobId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed' | 'not_found';
    result?: any;
    error?: string;
    progress?: number;
    createdAt?: number;
    startedAt?: number;
    completedAt?: number;
  }> {
    if (!this.queue) {
      return { jobId, status: 'not_found' };
    }

    const jobStatus = await this.queue.getJobStatus(jobId);

    return {
      jobId,
      status: jobStatus.status,
      result: jobStatus.result,
      error: jobStatus.error
    };
  }

  // Cancel job
  async cancelJob(jobId: string): Promise<boolean> {
    if (!this.queue) return false;

    return await this.queue.cancelJob(jobId);
  }

  // Get system statistics
  getSystemStats(): {
    queue: any;
    workers: any;
    health: any;
  } {
    const queueStats = this.queue?.getStats() || null;
    const workerStats = this.workerPool?.getPoolStats() || null;
    const workerHealth = this.workerPool?.getPoolHealth() || null;

    return {
      queue: queueStats,
      workers: workerStats,
      health: workerHealth
    };
  }

  // Health check
  async healthCheck(): Promise<{
    healthy: boolean;
    status: string;
    components: {
      queue: boolean;
      workers: boolean;
      database: boolean;
    };
    issues: string[];
  }> {
    const issues: string[] = [];
    let healthy = true;

    // Check queue
    const queueHealthy = !!this.queue;
    if (!queueHealthy) {
      issues.push('Queue not initialized');
      healthy = false;
    }

    // Check workers
    const workersHealthy = !!this.workerPool;
    if (!workersHealthy) {
      issues.push('Worker pool not initialized');
      healthy = false;
    } else {
      const health = this.workerPool.getPoolHealth();
      if (!health.healthy) {
        issues.push(...health.issues);
        healthy = false;
      }
    }

    // Check database
    let databaseHealthy = true;
    try {
      const { error } = await supabase.from('workflows').select('count').limit(1).single();
      if (error) {
        databaseHealthy = false;
        issues.push('Database connection failed');
        healthy = false;
      }
    } catch (error) {
      databaseHealthy = false;
      issues.push('Database health check failed');
      healthy = false;
    }

    return {
      healthy,
      status: healthy ? 'healthy' : 'unhealthy',
      components: {
        queue: queueHealthy,
        workers: workersHealthy,
        database: databaseHealthy
      },
      issues
    };
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    console.log('Shutting down distributed workflow engine...');

    // Stop worker pool
    if (this.workerPool) {
      await this.workerPool.stop();
      console.log('✓ Worker pool stopped');
    }

    // Stop queue processing
    if (this.queue) {
      this.queue.stopProcessing();
      console.log('✓ Queue processing stopped');
    }

    // Clean up resources
    await this.cleanup();

    console.log('✓ Distributed workflow engine shutdown complete');
  }

  // Cleanup old data
  private async cleanup(): Promise<void> {
    // Clean up old queue jobs
    if (this.queue) {
      await this.queue.cleanup(7 * 24 * 60 * 60 * 1000); // 7 days
    }

    // Clean up old execution states
    try {
      await supabase
        .from('workflow_execution_states')
        .delete()
        .lt('last_updated', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    } catch (error) {
      console.error('Failed to cleanup old execution states:', error);
    }
  }

  // Scale worker pool
  async scaleWorkers(newSize: number): Promise<void> {
    if (this.workerPool && 'scalePool' in this.workerPool) {
      await this.workerPool.scalePool(newSize);
    }
  }

  // Emergency stop all processing
  async emergencyStop(): Promise<void> {
    console.error('EMERGENCY STOP initiated');

    if (this.workerPool) {
      await this.workerPool.stop();
    }

    if (this.queue) {
      this.queue.stopProcessing();
    }

    // Log emergency stop
    await supabase
      .from('system_logs')
      .insert({
        level: 'emergency',
        message: 'Distributed workflow engine emergency stop',
        metadata: {
          timestamp: new Date().toISOString(),
          reason: 'manual_emergency_stop'
        }
      });
  }

  // Get configuration
  getConfig(): DistributedEngineConfig {
    return { ...this.config };
  }

  // Update configuration (hot reload)
  async updateConfig(newConfig: Partial<DistributedEngineConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };

    // Reinitialize if needed
    if (newConfig.enableAutoScaling !== undefined && this.workerPool) {
      console.log('Restarting worker pool with new configuration...');
      await this.workerPool.stop();

      // Reinitialize worker pool
      if (this.config.enableAutoScaling) {
        this.workerPool = new AutoScalingWorkerPool(
          {
            workerId: 'distributed',
            maxConcurrency: this.config.workerConfig.maxConcurrency,
            pollInterval: this.config.workerConfig.pollInterval,
            shutdownTimeout: this.config.workerConfig.shutdownTimeout,
            healthCheckInterval: this.config.workerConfig.healthCheckInterval
          },
          this.config.autoScalingConfig
        );
      } else {
        this.workerPool = new WorkflowWorkerPool(
          {
            workerId: 'distributed',
            maxConcurrency: this.config.workerConfig.maxConcurrency,
            pollInterval: this.config.workerConfig.pollInterval,
            shutdownTimeout: this.config.workerConfig.shutdownTimeout,
            healthCheckInterval: this.config.workerConfig.healthCheckInterval
          },
          this.config.workerConfig.poolSize
        );
      }

      await this.workerPool.start();
    }
  }
}

// Singleton instance
export const distributedWorkflowEngine = DistributedWorkflowEngine.getInstance();

// Process-level shutdown handlers
if (typeof process !== 'undefined') {
  // Graceful shutdown on SIGTERM/SIGINT
  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    await distributedWorkflowEngine.shutdown();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully...');
    await distributedWorkflowEngine.shutdown();
    process.exit(0);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    console.error('Uncaught exception:', error);
    await distributedWorkflowEngine.emergencyStop();
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
    await distributedWorkflowEngine.emergencyStop();
    process.exit(1);
  });
}
