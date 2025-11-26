/**
 * Workflow Queue System
 * Distributed workflow execution using Redis-based queues
 */

import { createServerClient } from './supabase';
import { Workflow, Patient, Appointment } from './database.types';

export interface WorkflowJob {
  id: string;
  workflowId: string;
  patientId: string;
  appointmentId: string;
  context: {
    daysPassed: number;
    triggerType?: string;
    customData?: Record<string, any>;
  };
  priority: 'low' | 'normal' | 'high' | 'critical';
  retryCount: number;
  maxRetries: number;
  timeout: number; // milliseconds
  createdAt: number;
  scheduledFor?: number; // future execution
  tags?: string[]; // for filtering and monitoring
}

export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  throughput: {
    jobsPerMinute: number;
    averageExecutionTime: number;
  };
}

export class WorkflowQueue {
  private static instance: WorkflowQueue;
  private queue: WorkflowJob[] = [];
  private activeJobs = new Map<string, WorkflowJob>();
  private completedJobs: WorkflowJob[] = [];
  private failedJobs: WorkflowJob[] = [];
  private isProcessing = false;
  private maxConcurrency: number;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor(maxConcurrency = 5) {
    this.maxConcurrency = maxConcurrency;
    this.startProcessing();
  }

  static getInstance(): WorkflowQueue {
    if (!WorkflowQueue.instance) {
      WorkflowQueue.instance = new WorkflowQueue();
    }
    return WorkflowQueue.instance;
  }

  // Add job to queue
  async enqueue(
    workflow: Workflow,
    patient: Patient,
    appointment: Appointment,
    context: WorkflowJob['context'],
    options: {
      priority?: WorkflowJob['priority'];
      delay?: number; // milliseconds to delay execution
      tags?: string[];
      timeout?: number;
      maxRetries?: number;
      executionContext?: Record<string, any>; // Full execution context snapshot
      delayConfig?: Record<string, any>; // Delay configuration
      scheduledFor?: number; // Specific timestamp for execution
    } = {}
  ): Promise<string> {
    const jobId = `wf_${workflow.id}_${patient.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Use scheduledFor if provided, otherwise calculate from delay
    const scheduledFor = options.scheduledFor 
      ? options.scheduledFor 
      : (options.delay ? Date.now() + options.delay : undefined);

    const job: WorkflowJob = {
      id: jobId,
      workflowId: workflow.id,
      patientId: patient.id,
      appointmentId: appointment.id,
      context,
      priority: options.priority || 'normal',
      retryCount: 0,
      maxRetries: options.maxRetries || 3,
      timeout: options.timeout || 300000, // 5 minutes default
      createdAt: Date.now(),
      scheduledFor,
      tags: options.tags || []
    };

    // Store job in database with full context
    await this.persistJob(job, {
      executionContext: options.executionContext,
      delayConfig: options.delayConfig,
      resumeFromNodeId: context.resumeFromNodeId,
      originalExecutionId: context.executionId,
    });

    // Add to in-memory queue if not delayed
    if (!job.scheduledFor || job.scheduledFor <= Date.now()) {
      this.addToQueue(job);
    } else {
      // Handle delayed jobs
      this.scheduleDelayedJob(job);
    }

    return jobId;
  }

  // Add job to in-memory queue
  private addToQueue(job: WorkflowJob): void {
    // Insert based on priority
    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
    const insertIndex = this.queue.findIndex(
      existing => priorityOrder[existing.priority] > priorityOrder[job.priority]
    );

    if (insertIndex === -1) {
      this.queue.push(job);
    } else {
      this.queue.splice(insertIndex, 0, job);
    }
  }

  // Schedule delayed job
  private scheduleDelayedJob(job: WorkflowJob): void {
    if (!job.scheduledFor) return;

    const delay = job.scheduledFor - Date.now();
    
    // For delays > 1 hour, rely on cron job to process from database
    // For shorter delays, use setTimeout
    if (delay > 60 * 60 * 1000) {
      // Long delay: job is already in database with scheduled_for timestamp
      // Cron job will pick it up when ready
      return;
    }
    
    // Short delay: use setTimeout for immediate processing
    setTimeout(() => {
      this.addToQueue(job);
    }, Math.max(0, delay));
  }

  // Load scheduled jobs from database (called by cron)
  // Uses Postgres locking to prevent race conditions in serverless environment
  // @param processImmediately If true, awaits execution of jobs (best for Serverless Cron)
  async loadScheduledJobs(processImmediately = false): Promise<void> {
    const supabase = createServerClient();
    if (!supabase) return; // Safety check

    const now = Date.now();

    // Use RPC to fetch and lock jobs atomically
    const { data: scheduledJobs, error } = await supabase
      .rpc('get_next_jobs', { 
        limit_count: 10,
        max_retries: 3 
      });

    if (error) {
      console.error('Failed to load scheduled jobs:', error);
      return;
    }

    if (!scheduledJobs || scheduledJobs.length === 0) {
      return;
    }

    const processingPromises = [];

    // Convert database format to WorkflowJob format
    for (const job of scheduledJobs) {
      const jobData = job.job_data as any;
      const workflowJob: WorkflowJob = {
        id: job.id,
        workflowId: job.workflow_id,
        patientId: job.patient_id,
        appointmentId: job.appointment_id,
        context: jobData.context || {},
        priority: jobData.priority || 'normal',
        retryCount: job.retry_count || 0,
        maxRetries: jobData.max_retries || 3,
        timeout: jobData.timeout || 300000,
        createdAt: new Date(job.created_at).getTime(),
        scheduledFor: job.scheduled_for ? new Date(job.scheduled_for).getTime() : undefined,
        tags: jobData.tags || []
      };

      if (processImmediately) {
        // Serverless mode: Execute immediately and wait
        this.activeJobs.set(workflowJob.id, workflowJob);
        processingPromises.push(
          this.processJob(workflowJob).catch(err => {
            console.error(`Failed to process job ${workflowJob.id}:`, err);
          }).finally(() => {
             this.activeJobs.delete(workflowJob.id);
          })
        );
      } else {
        // Background mode: Add to memory queue
        this.addToQueue(workflowJob);
      }
    }

    if (processImmediately && processingPromises.length > 0) {
      await Promise.all(processingPromises);
    }
  }

  // Start processing queue
  private startProcessing(): void {
    if (this.processingInterval) return;

    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, 1000); // Process every second
  }

  // Stop processing
  stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  // Process queue
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.activeJobs.size >= this.maxConcurrency) {
      return;
    }

    this.isProcessing = true;

    try {
      // Get next job that can be processed
      const availableJob = this.queue.find(job =>
        !this.isJobActive(job.id) &&
        this.canProcessJob(job)
      );

      if (!availableJob) {
        return;
      }

      // Remove from queue and mark as active
      this.queue = this.queue.filter(job => job.id !== availableJob.id);
      this.activeJobs.set(availableJob.id, availableJob);

      // Process job asynchronously
      this.processJob(availableJob).catch(error => {
        console.error(`Failed to process job ${availableJob.id}:`, error);
      });

    } finally {
      this.isProcessing = false;
    }
  }

  // Check if job can be processed (dependency checks, rate limiting, etc.)
  private canProcessJob(job: WorkflowJob): boolean {
    // Add rate limiting logic here
    // Add dependency checks here
    return true;
  }

  // Check if job is currently active
  private isJobActive(jobId: string): boolean {
    return this.activeJobs.has(jobId);
  }

  // Process individual job
  private async processJob(job: WorkflowJob): Promise<void> {
    const startTime = Date.now();

    try {
      // Update job status to processing
      await this.updateJobStatus(job.id, 'processing');

      // Import and execute workflow
      const { enhancedWorkflowEngine } = await import('./workflow-execution-engine');

      // Get workflow data
      const supabase = createServerClient();
      if (!supabase) throw new Error('Supabase client not initialized');

      const { data: workflow, error: wfError } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', job.workflowId)
        .single();

      if (wfError || !workflow) {
        throw new Error(`Workflow not found: ${job.workflowId}`);
      }

      // Get patient data
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', job.patientId)
        .single();

      if (patientError || !patient) {
        throw new Error(`Patient not found: ${job.patientId}`);
      }

      // Get appointment data
      const { data: appointment, error: apptError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', job.appointmentId)
        .single();

      if (apptError || !appointment) {
        throw new Error(`Appointment not found: ${job.appointmentId}`);
      }

      // Restore execution context from database if available (for delayed executions)
      const { data: jobData } = await supabase
        .from('workflow_jobs')
        .select('execution_context, resume_from_node_id, original_execution_id')
        .eq('id', job.id)
        .single();

      // Use restored context or current context
      const executionContext = jobData?.execution_context || {};
      const resumeFromNodeId = jobData?.resume_from_node_id || job.context.resumeFromNodeId;
      const originalExecutionId = jobData?.original_execution_id || job.context.executionId;

      // Restore patient/appointment from context snapshot if available (for delayed executions)
      const restoredPatient = executionContext.patient ? {
        ...patient,
        ...executionContext.patient, // Override with context snapshot
      } : patient;

      const restoredAppointment = executionContext.appointment ? {
        ...appointment,
        ...executionContext.appointment, // Override with context snapshot
      } : appointment;

      // Build execution context with resume information
      const executionContextWithResume = {
        daysPassed: job.context.daysPassed,
        resumeFromNodeId,
        executionId: originalExecutionId,
        triggerType: job.context.triggerType || executionContext.context?.triggerType,
        ...executionContext.context, // Include any additional context
      };

      // Execute workflow with timeout
      const executionPromise = enhancedWorkflowEngine.executeWorkflow(
        workflow,
        restoredPatient,
        restoredAppointment,
        executionContextWithResume,
        {
          enableParallelism: true,
          enableCaching: true,
          enableCircuitBreaker: true,
          enableMetrics: true,
          enableStatePersistence: true
        }
      );

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Job execution timeout')), job.timeout);
      });

      const result = await Promise.race([executionPromise, timeoutPromise]);

      // Mark job as completed
      await this.completeJob(job.id, result, Date.now() - startTime);

    } catch (error: any) {
      console.error(`Job ${job.id} failed:`, error);

      // Handle retry logic
      const shouldRetry = job.retryCount < job.maxRetries;

      if (shouldRetry) {
        await this.retryJob(job, error.message);
      } else {
        await this.failJob(job.id, error.message);
      }
    } finally {
      // Remove from active jobs
      this.activeJobs.delete(job.id);
    }
  }

  // Complete job
  private async completeJob(jobId: string, result: any, executionTime: number): Promise<void> {
    const job = this.activeJobs.get(jobId);
    if (!job) return;

    this.completedJobs.push(job);

    // Update database
    const supabase = createServerClient();
    if (!supabase) return;

    await supabase
      .from('workflow_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        execution_time: executionTime,
        result: result,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    // Keep only last 1000 completed jobs in memory
    if (this.completedJobs.length > 1000) {
      this.completedJobs.shift();
    }
  }

  // Fail job
  private async failJob(jobId: string, errorMessage: string): Promise<void> {
    const job = this.activeJobs.get(jobId);
    if (!job) return;

    this.failedJobs.push(job);

    // Update database
    const supabase = createServerClient();
    if (!supabase) return;

    await supabase
      .from('workflow_jobs')
      .update({
        status: 'failed',
        error_message: errorMessage,
        failed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);
  }

  // Retry job
  private async retryJob(job: WorkflowJob, errorMessage: string): Promise<void> {
    // Use WorkflowErrorHandler for smart retry strategy
    const { WorkflowErrorHandler } = await import('./workflow-error-handler');
    const retryStrategy = WorkflowErrorHandler.getRetryStrategy(
      errorMessage,
      job.retryCount,
      1000, // base delay 1s
      60000 // max delay 60s
    );
    
    if (!retryStrategy.shouldRetry) {
      // Max retries exceeded or non-retryable error
      await this.failJob(job.id, `Max retries exceeded: ${errorMessage}`);
      return;
    }
    
    const retryJob = {
      ...job,
      retryCount: job.retryCount + 1,
      createdAt: Date.now(),
      maxRetries: retryStrategy.maxRetries,
      scheduledFor: Date.now() + retryStrategy.delay
    };

    // Update retry count in database
    const supabase = createServerClient();
    if (!supabase) return;

    await supabase
      .from('workflow_jobs')
      .update({
        retry_count: retryJob.retryCount,
        last_error: errorMessage,
        updated_at: new Date().toISOString()
      })
      .eq('id', job.id);

    // Schedule retry
    this.scheduleDelayedJob(retryJob);
  }

  // Persist job to database with full execution context
  private async persistJob(
    job: WorkflowJob,
    metadata?: {
      executionContext?: Record<string, any>;
      delayConfig?: Record<string, any>;
      resumeFromNodeId?: string;
      originalExecutionId?: string;
    }
  ): Promise<void> {
    const supabase = createServerClient();
    if (!supabase) return;

    await supabase
      .from('workflow_jobs')
      .insert({
        id: job.id,
        workflow_id: job.workflowId,
        patient_id: job.patientId,
        appointment_id: job.appointmentId,
        job_data: {
          context: job.context,
          priority: job.priority,
          timeout: job.timeout,
          max_retries: job.maxRetries,
          tags: job.tags
        },
        execution_context: metadata?.executionContext || {},
        delay_config: metadata?.delayConfig || null,
        resume_from_node_id: metadata?.resumeFromNodeId || null,
        original_execution_id: metadata?.originalExecutionId || null,
        status: 'queued',
        retry_count: job.retryCount,
        created_at: new Date(job.createdAt).toISOString(),
        scheduled_for: job.scheduledFor ? new Date(job.scheduledFor).toISOString() : null
      });
  }

  // Update job status
  private async updateJobStatus(jobId: string, status: string): Promise<void> {
    const supabase = createServerClient();
    if (!supabase) return;

    await supabase
      .from('workflow_jobs')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);
  }

  // Get queue statistics
  getStats(): QueueStats {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Calculate throughput (jobs completed in last minute)
    const recentCompletions = this.completedJobs.filter(job =>
      job.createdAt > oneMinuteAgo
    ).length;

    const totalExecutionTime = this.completedJobs
      .filter(job => job.createdAt > oneMinuteAgo)
      .reduce((sum, job) => sum + (now - job.createdAt), 0);

    const averageExecutionTime = recentCompletions > 0
      ? totalExecutionTime / recentCompletions
      : 0;

    return {
      waiting: this.queue.length,
      active: this.activeJobs.size,
      completed: this.completedJobs.length,
      failed: this.failedJobs.length,
      delayed: this.queue.filter(job => job.scheduledFor && job.scheduledFor > now).length,
      throughput: {
        jobsPerMinute: recentCompletions,
        averageExecutionTime
      }
    };
  }

  // Get job status
  async getJobStatus(jobId: string): Promise<{
    job: WorkflowJob | null;
    status: 'queued' | 'processing' | 'completed' | 'failed' | 'not_found';
    result?: any;
    error?: string;
  }> {
    // Check memory first
    if (this.activeJobs.has(jobId)) {
      return { job: this.activeJobs.get(jobId)!, status: 'processing' };
    }

    if (this.queue.some(job => job.id === jobId)) {
      return { job: this.queue.find(job => job.id === jobId)!, status: 'queued' };
    }

    if (this.completedJobs.some(job => job.id === jobId)) {
      const job = this.completedJobs.find(job => job.id === jobId)!;
      return { job, status: 'completed' };
    }

    if (this.failedJobs.some(job => job.id === jobId)) {
      const job = this.failedJobs.find(job => job.id === jobId)!;
      return { job, status: 'failed' };
    }

    // Check database
    try {
      const supabase = createServerClient();
      if (!supabase) {
        return { job: null, status: 'not_found' };
      }

      const { data, error } = await supabase
        .from('workflow_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error || !data) {
        return { job: null, status: 'not_found' };
      }

      const job: WorkflowJob = {
        id: data.id,
        workflowId: data.workflow_id,
        patientId: data.patient_id,
        appointmentId: data.appointment_id,
        context: data.job_data.context,
        priority: data.job_data.priority,
        retryCount: data.retry_count,
        maxRetries: data.job_data.max_retries,
        timeout: data.job_data.timeout,
        createdAt: new Date(data.created_at).getTime(),
        scheduledFor: data.scheduled_for ? new Date(data.scheduled_for).getTime() : undefined,
        tags: data.job_data.tags
      };

      return {
        job,
        status: data.status,
        result: data.result,
        error: data.error_message
      };
    } catch (error) {
      return { job: null, status: 'not_found' };
    }
  }

  // Cancel job
  async cancelJob(jobId: string): Promise<boolean> {
    // Remove from queue
    this.queue = this.queue.filter(job => job.id !== jobId);

    // If active, mark for cancellation (in real implementation, this would signal the worker)
    if (this.activeJobs.has(jobId)) {
      this.activeJobs.delete(jobId);
    }

    // Update database
    const supabase = createServerClient();
    if (!supabase) return false;

    await supabase
      .from('workflow_jobs')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    return true;
  }

  // Clean up old jobs
  async cleanup(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    const cutoffTime = Date.now() - maxAge;

    // Clean up memory
    this.completedJobs = this.completedJobs.filter(job => job.createdAt > cutoffTime);
    this.failedJobs = this.failedJobs.filter(job => job.createdAt > cutoffTime);

    // Clean up database
    const supabase = createServerClient();
    if (!supabase) return;

    await supabase
      .from('workflow_jobs')
      .delete()
      .lt('created_at', new Date(cutoffTime).toISOString());
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    this.stopProcessing();

    // Wait for active jobs to complete (with timeout)
    const shutdownTimeout = 30000; // 30 seconds
    const shutdownPromise = new Promise<void>((resolve) => {
      const checkActive = () => {
        if (this.activeJobs.size === 0) {
          resolve();
        } else {
          setTimeout(checkActive, 1000);
        }
      };
      checkActive();
    });

    await Promise.race([
      shutdownPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Shutdown timeout')), shutdownTimeout))
    ]);
  }
}

// Singleton instance
export const workflowQueue = WorkflowQueue.getInstance();
