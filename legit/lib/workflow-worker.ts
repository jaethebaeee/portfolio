/**
 * Workflow Worker Process
 * Dedicated worker for processing workflow jobs
 */

import { WorkflowQueue } from './workflow-queue';
import { enhancedWorkflowEngine } from './workflow-execution-engine';

export interface WorkerConfig {
  workerId: string;
  maxConcurrency: number;
  pollInterval: number;
  shutdownTimeout: number;
  healthCheckInterval: number;
}

export interface WorkerStats {
  workerId: string;
  status: 'idle' | 'processing' | 'shutdown';
  uptime: number;
  jobsProcessed: number;
  jobsFailed: number;
  averageProcessingTime: number;
  currentJobs: number;
  memoryUsage: NodeJS.MemoryUsage;
  lastHealthCheck: number;
}

export class WorkflowWorker {
  private config: WorkerConfig;
  private queue: WorkflowQueue;
  private stats: WorkerStats;
  private isRunning = false;
  private shutdownRequested = false;
  private processingJobs = new Map<string, { startTime: number; jobId: string }>();
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<WorkerConfig> = {}) {
    this.config = {
      workerId: `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      maxConcurrency: 5,
      pollInterval: 1000,
      shutdownTimeout: 30000,
      healthCheckInterval: 30000,
      ...config
    };

    this.queue = WorkflowQueue.getInstance();

    this.stats = {
      workerId: this.config.workerId,
      status: 'idle',
      uptime: 0,
      jobsProcessed: 0,
      jobsFailed: 0,
      averageProcessingTime: 0,
      currentJobs: 0,
      memoryUsage: process.memoryUsage(),
      lastHealthCheck: Date.now()
    };
  }

  // Start worker
  async start(): Promise<void> {
    if (this.isRunning) return;

    console.log(`Starting workflow worker ${this.config.workerId}`);
    this.isRunning = true;
    this.stats.status = 'idle';
    this.stats.uptime = Date.now();

    // Start health check
    this.startHealthCheck();

    // Main processing loop
    while (this.isRunning && !this.shutdownRequested) {
      try {
        await this.processJobs();
        await this.delay(this.config.pollInterval);
      } catch (error) {
        console.error(`Worker ${this.config.workerId} processing error:`, error);
        await this.delay(5000); // Wait 5 seconds before retrying
      }
    }

    console.log(`Worker ${this.config.workerId} stopped`);
  }

  // Stop worker
  async stop(): Promise<void> {
    console.log(`Stopping workflow worker ${this.config.workerId}`);
    this.shutdownRequested = true;
    this.stats.status = 'shutdown';

    // Stop health check
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    // Wait for current jobs to complete
    const shutdownStart = Date.now();
    while (this.processingJobs.size > 0 && Date.now() - shutdownStart < this.config.shutdownTimeout) {
      await this.delay(1000);
    }

    // Force stop remaining jobs
    for (const [jobId] of this.processingJobs) {
      console.warn(`Force stopping job ${jobId}`);
    }
    this.processingJobs.clear();

    this.isRunning = false;
  }

  // Process jobs from queue
  private async processJobs(): Promise<void> {
    // Check if we can process more jobs
    if (this.processingJobs.size >= this.config.maxConcurrency) {
      return;
    }

    // Get next job from queue (this is a simplified version)
    // In a real distributed system, this would poll from Redis/database
    const nextJob = await this.getNextJob();

    if (!nextJob) {
      this.stats.status = 'idle';
      return;
    }

    this.stats.status = 'processing';
    this.stats.currentJobs = this.processingJobs.size + 1;

    // Start processing job
    this.processingJobs.set(nextJob.id, {
      startTime: Date.now(),
      jobId: nextJob.id
    });

    // Process job asynchronously
    this.processJob(nextJob).catch(error => {
      console.error(`Failed to process job ${nextJob.id}:`, error);
      this.stats.jobsFailed++;
    });
  }

  // Get next job from queue (simplified)
  private async getNextJob(): Promise<any | null> {
    // In a real implementation, this would poll from Redis queue
    // For now, return null to simulate queue polling
    return null;
  }

  // Process individual job
  private async processJob(job: any): Promise<void> {
    const processingInfo = this.processingJobs.get(job.id);
    if (!processingInfo) return;

    try {
      // Execute workflow
      // This is where the actual workflow execution would happen
      // For now, simulate execution
      await this.simulateJobExecution(job);

      // Mark as completed
      this.stats.jobsProcessed++;
      const processingTime = Date.now() - processingInfo.startTime;
      this.updateAverageProcessingTime(processingTime);

    } catch (error) {
      this.stats.jobsFailed++;
      throw error;
    } finally {
      this.processingJobs.delete(job.id);
      this.stats.currentJobs = this.processingJobs.size;
    }
  }

  // Simulate job execution (replace with actual workflow execution)
  private async simulateJobExecution(job: any): Promise<void> {
    // Simulate processing time (1-5 seconds)
    const processingTime = 1000 + Math.random() * 4000;
    await this.delay(processingTime);

    // Simulate occasional failures
    if (Math.random() < 0.1) { // 10% failure rate
      throw new Error('Simulated job failure');
    }
  }

  // Start health check
  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  // Perform health check
  private performHealthCheck(): void {
    this.stats.memoryUsage = process.memoryUsage();
    this.stats.lastHealthCheck = Date.now();

    // Check if worker is responsive
    const isHealthy = !this.shutdownRequested && this.isRunning;

    if (!isHealthy) {
      console.error(`Worker ${this.config.workerId} health check failed`);
    }

    // In a real system, you might report health status to a monitoring system
  }

  // Update average processing time
  private updateAverageProcessingTime(processingTime: number): void {
    const totalJobs = this.stats.jobsProcessed + this.stats.jobsFailed;
    this.stats.averageProcessingTime =
      (this.stats.averageProcessingTime * (totalJobs - 1) + processingTime) / totalJobs;
  }

  // Get worker statistics
  getStats(): WorkerStats {
    return {
      ...this.stats,
      uptime: Date.now() - this.stats.uptime
    };
  }

  // Get worker health status
  getHealthStatus(): {
    healthy: boolean;
    status: string;
    issues: string[];
  } {
    const issues: string[] = [];
    let healthy = true;

    // Check memory usage
    const memoryUsageMB = this.stats.memoryUsage.heapUsed / 1024 / 1024;
    if (memoryUsageMB > 500) { // 500MB threshold
      issues.push(`High memory usage: ${memoryUsageMB.toFixed(1)}MB`);
      healthy = false;
    }

    // Check failure rate
    const totalJobs = this.stats.jobsProcessed + this.stats.jobsFailed;
    if (totalJobs > 10) {
      const failureRate = this.stats.jobsFailed / totalJobs;
      if (failureRate > 0.2) { // 20% failure rate
        issues.push(`High failure rate: ${(failureRate * 100).toFixed(1)}%`);
        healthy = false;
      }
    }

    // Check if worker is stuck
    const timeSinceLastHealthCheck = Date.now() - this.stats.lastHealthCheck;
    if (timeSinceLastHealthCheck > this.config.healthCheckInterval * 2) {
      issues.push('Worker may be stuck');
      healthy = false;
    }

    return {
      healthy,
      status: this.stats.status,
      issues
    };
  }

  // Utility delay function
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Worker pool management
export class WorkflowWorkerPool {
  private workers: WorkflowWorker[] = [];
  private config: WorkerConfig;

  constructor(config: WorkerConfig, poolSize: number = 3) {
    this.config = config;

    // Create worker pool
    for (let i = 0; i < poolSize; i++) {
      const workerConfig = {
        ...config,
        workerId: `${config.workerId}_pool_${i}`
      };
      this.workers.push(new WorkflowWorker(workerConfig));
    }
  }

  // Start all workers
  async start(): Promise<void> {
    console.log(`Starting worker pool with ${this.workers.length} workers`);

    const startPromises = this.workers.map(worker => worker.start());
    await Promise.all(startPromises);
  }

  // Stop all workers
  async stop(): Promise<void> {
    console.log('Stopping worker pool');

    const stopPromises = this.workers.map(worker => worker.stop());
    await Promise.all(stopPromises);
  }

  // Get pool statistics
  getPoolStats(): {
    totalWorkers: number;
    activeWorkers: number;
    totalJobsProcessed: number;
    totalJobsFailed: number;
    averageProcessingTime: number;
    workerStats: WorkerStats[];
  } {
    const workerStats = this.workers.map(worker => worker.getStats());

    return {
      totalWorkers: this.workers.length,
      activeWorkers: workerStats.filter(s => s.status === 'processing').length,
      totalJobsProcessed: workerStats.reduce((sum, s) => sum + s.jobsProcessed, 0),
      totalJobsFailed: workerStats.reduce((sum, s) => sum + s.jobsFailed, 0),
      averageProcessingTime: workerStats.reduce((sum, s) => sum + s.averageProcessingTime, 0) / workerStats.length,
      workerStats
    };
  }

  // Get pool health status
  getPoolHealth(): {
    healthy: boolean;
    totalWorkers: number;
    healthyWorkers: number;
    issues: string[];
    workerHealth: Array<{ workerId: string; healthy: boolean; issues: string[] }>;
  } {
    const workerHealth = this.workers.map(worker => ({
      workerId: worker.getStats().workerId,
      ...worker.getHealthStatus()
    }));

    const healthyWorkers = workerHealth.filter(w => w.healthy).length;
    const allIssues = workerHealth.flatMap(w => w.issues);

    return {
      healthy: healthyWorkers === this.workers.length,
      totalWorkers: this.workers.length,
      healthyWorkers,
      issues: allIssues,
      workerHealth
    };
  }

  // Scale pool (add/remove workers)
  async scalePool(newSize: number): Promise<void> {
    const currentSize = this.workers.length;

    if (newSize > currentSize) {
      // Add workers
      for (let i = currentSize; i < newSize; i++) {
        const workerConfig = {
          ...this.config,
          workerId: `${this.config.workerId}_pool_${i}`
        };
        const worker = new WorkflowWorker(workerConfig);
        this.workers.push(worker);
        await worker.start();
      }
    } else if (newSize < currentSize) {
      // Remove workers
      const workersToRemove = this.workers.splice(newSize);
      await Promise.all(workersToRemove.map(worker => worker.stop()));
    }
  }
}

// Create default worker pool
export const defaultWorkerPool = new WorkflowWorkerPool({
  workerId: 'default',
  maxConcurrency: 5,
  pollInterval: 1000,
  shutdownTimeout: 30000,
  healthCheckInterval: 30000
}, 3);

// Auto-scaling worker pool
export class AutoScalingWorkerPool extends WorkflowWorkerPool {
  private minWorkers: number;
  private maxWorkers: number;
  private scaleUpThreshold: number;
  private scaleDownThreshold: number;
  private checkInterval: number;
  private scalingInterval: NodeJS.Timeout | null = null;

  constructor(
    config: WorkerConfig,
    options: {
      minWorkers?: number;
      maxWorkers?: number;
      scaleUpThreshold?: number; // queue length threshold to scale up
      scaleDownThreshold?: number; // queue length threshold to scale down
      checkInterval?: number; // how often to check scaling
    } = {}
  ) {
    super(config, options.minWorkers || 2);

    this.minWorkers = options.minWorkers || 2;
    this.maxWorkers = options.maxWorkers || 10;
    this.scaleUpThreshold = options.scaleUpThreshold || 20;
    this.scaleDownThreshold = options.scaleDownThreshold || 5;
    this.checkInterval = options.checkInterval || 30000; // 30 seconds
  }

  async start(): Promise<void> {
    await super.start();

    // Start auto-scaling
    this.scalingInterval = setInterval(() => {
      this.checkAndScale();
    }, this.checkInterval);
  }

  async stop(): Promise<void> {
    if (this.scalingInterval) {
      clearInterval(this.scalingInterval);
      this.scalingInterval = null;
    }

    await super.stop();
  }

  private async checkAndScale(): Promise<void> {
    const queue = WorkflowQueue.getInstance();
    const queueStats = queue.getStats();
    const poolStats = this.getPoolStats();
    const currentWorkers = poolStats.totalWorkers;

    // Scale up if queue is getting long
    if (queueStats.waiting > this.scaleUpThreshold && currentWorkers < this.maxWorkers) {
      const newSize = Math.min(currentWorkers + 2, this.maxWorkers);
      console.log(`Scaling up from ${currentWorkers} to ${newSize} workers (queue: ${queueStats.waiting})`);
      await this.scalePool(newSize);
    }

    // Scale down if queue is short
    if (queueStats.waiting < this.scaleDownThreshold && currentWorkers > this.minWorkers) {
      const newSize = Math.max(currentWorkers - 1, this.minWorkers);
      console.log(`Scaling down from ${currentWorkers} to ${newSize} workers (queue: ${queueStats.waiting})`);
      await this.scalePool(newSize);
    }
  }
}
