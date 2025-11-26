/**
 * Enhanced Workflow Execution Engine
 * Combines parallel execution, caching, circuit breaker, and state persistence
 */

import { Workflow, Patient, Appointment } from './database.types';
import { ParallelWorkflowEngine } from './workflow-engine-parallel';
import { WorkflowCache } from './workflow-cache';
import { WorkflowCircuitBreaker, workflowCircuitBreaker, messagingCircuitBreaker } from './workflow-circuit-breaker';
import { WorkflowMetricsCollector } from './workflow-metrics';
import { WorkflowStateManager } from './workflow-state-persistence';
import { executeVisualWorkflow } from './visual-workflow-engine';

interface ExecutionOptions {
  enableParallelism?: boolean;
  enableCaching?: boolean;
  enableCircuitBreaker?: boolean;
  enableMetrics?: boolean;
  enableStatePersistence?: boolean;
  maxConcurrency?: number;
  executionTimeout?: number;
}

interface ExecutionResult {
  success: boolean;
  executed: boolean;
  log: string;
  executionId?: string;
  duration?: number;
  error?: string;
}

export class EnhancedWorkflowExecutionEngine {
  private parallelEngine: ParallelWorkflowEngine;
  private cache: WorkflowCache;
  private circuitBreaker: WorkflowCircuitBreaker;
  private metrics: WorkflowMetricsCollector;
  private stateManager: WorkflowStateManager;

  constructor(options: ExecutionOptions = {}) {
    this.parallelEngine = new ParallelWorkflowEngine({
      maxConcurrency: options.maxConcurrency || 5,
      executionTimeout: options.executionTimeout || 30000
    });

    this.cache = WorkflowCache.getInstance();
    this.circuitBreaker = workflowCircuitBreaker;
    this.metrics = WorkflowMetricsCollector.getInstance();
    this.stateManager = WorkflowStateManager.getInstance();
  }

  async executeWorkflow(
    workflow: Workflow,
    patient: Patient,
    appointment: Appointment,
    context: { daysPassed: number },
    options: ExecutionOptions = {}
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    let executionId: string | undefined;

    try {
      // Check if execution should be blocked by circuit breaker
      if (options.enableCircuitBreaker) {
        await this.circuitBreaker.execute(async () => {
          // Circuit breaker check - if this throws, execution is blocked
          if (this.circuitBreaker.getState().state === 'open') {
            throw new Error('Circuit breaker is open');
          }
        });
      }

      // Try to resume from existing state
      if (options.enableStatePersistence) {
        const existingState = await this.findExistingExecution(workflow, patient, appointment, context);
        if (existingState) {
          return await this.resumeExecution(existingState, workflow, patient, appointment, context, options);
        }
      }

      // Create new execution state
      if (options.enableStatePersistence) {
        executionId = await this.stateManager.createExecutionState(workflow, patient, appointment, context);
      }

      // Execute workflow
      let result: { executed: boolean; log: string; results?: any[] };

      if (workflow.visual_data && options.enableParallelism) {
        // Use parallel execution for visual workflows
        result = await this.parallelEngine.executeWorkflow(workflow, patient, appointment, context);
      } else {
        // Use legacy execution for linear workflows or when parallelism is disabled
        result = await executeVisualWorkflow(workflow, patient, appointment, context);
      }

      // Record metrics
      if (options.enableMetrics && result.results) {
        // Get node types from workflow visual_data if available
        const nodeTypeMap: Record<string, string> = {};
        if (workflow.visual_data) {
          const visualData = workflow.visual_data as { nodes?: Array<{ id: string; type: string }> };
          if (visualData.nodes) {
            visualData.nodes.forEach(node => {
              nodeTypeMap[node.id] = node.type || 'unknown';
            });
          }
        }

        const executionMetrics = {
          workflowId: workflow.id,
          executionId: executionId || 'unknown',
          startTime,
          endTime: Date.now(),
          duration: Date.now() - startTime,
          success: result.executed,
          nodeCount: result.results.length,
          nodeResults: result.results.map(r => ({
            nodeId: r.nodeId || 'unknown',
            nodeType: r.nodeId ? (nodeTypeMap[r.nodeId] || 'action') : 'unknown',
            success: r.success,
            duration: r.duration || 0,
            error: r.error
          }))
        };

        this.metrics.recordExecution(executionMetrics);
      }

      // Complete execution state
      if (options.enableStatePersistence && executionId) {
        await this.stateManager.completeExecution(executionId);
      }

      return {
        success: result.executed,
        executed: result.executed,
        log: result.log,
        executionId,
        duration: Date.now() - startTime
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Handle execution failure
      if (executionId && options.enableStatePersistence) {
        await this.stateManager.failExecution(executionId, error.message);
      }

      // Record failure metrics
      if (options.enableMetrics) {
        const executionMetrics = {
          workflowId: workflow.id,
          executionId: executionId || 'unknown',
          startTime,
          endTime: Date.now(),
          duration,
          success: false,
          nodeCount: 0,
          errorMessage: error.message,
          nodeResults: []
        };

        this.metrics.recordExecution(executionMetrics);
      }

      return {
        success: false,
        executed: false,
        log: `Execution failed: ${error.message}`,
        executionId,
        duration,
        error: error.message
      };
    }
  }

  private async findExistingExecution(
    workflow: Workflow,
    patient: Patient,
    appointment: Appointment,
    context: { daysPassed: number }
  ): Promise<string | null> {
    try {
      // Look for incomplete executions for this workflow/patient/appointment
      const { data, error } = await supabase
        .from('workflow_execution_states')
        .select('execution_id')
        .eq('workflow_id', workflow.id)
        .eq('patient_id', patient.id)
        .in('status', ['running', 'paused'])
        .order('last_updated', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;

      return data.execution_id;
    } catch (error) {
      return null;
    }
  }

  private async resumeExecution(
    executionId: string,
    workflow: Workflow,
    patient: Patient,
    appointment: Appointment,
    context: { daysPassed: number },
    options: ExecutionOptions
  ): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      // Load execution state
      const state = await this.stateManager.loadExecutionState(executionId);
      if (!state) {
        throw new Error('Could not load execution state');
      }

      // Resume from checkpoint
      const checkpoint = await this.stateManager.loadCheckpoint(executionId);

      // For now, restart execution (full resume logic would be more complex)
      await this.stateManager.resumeExecution(executionId);

      // Execute workflow
      const result = await executeVisualWorkflow(workflow, patient, appointment, context);

      // Complete execution
      await this.stateManager.completeExecution(executionId);

      return {
        success: result.executed,
        executed: result.executed,
        log: `Resumed execution: ${result.log}`,
        executionId,
        duration: Date.now() - startTime
      };

    } catch (error: any) {
      await this.stateManager.failExecution(executionId, error.message);

      return {
        success: false,
        executed: false,
        log: `Resume failed: ${error.message}`,
        executionId,
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }

  // Get execution statistics
  getExecutionStats(workflowId: string): {
    successRate: number;
    averageExecutionTime: number;
    totalExecutions: number;
    healthStatus: any;
  } {
    return {
      successRate: this.metrics.getSuccessRate(workflowId),
      averageExecutionTime: this.metrics.getWorkflowMetrics(workflowId)?.averageExecutionTime || 0,
      totalExecutions: this.metrics.getWorkflowMetrics(workflowId)?.executionCount || 0,
      healthStatus: this.metrics.getHealthStatus(workflowId)
    };
  }

  // Get circuit breaker status
  getCircuitBreakerStatus(): any {
    return this.circuitBreaker.getState();
  }

  // Get cache statistics
  getCacheStats(): any {
    return this.cache.getStats();
  }

  // Manual cache cleanup
  cleanupCache(): void {
    this.cache.clearExpired();
  }

  // Reset circuit breaker (admin function)
  resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
  }
}

// Default enhanced engine instance
export const enhancedWorkflowEngine = new EnhancedWorkflowExecutionEngine({
  enableParallelism: true,
  enableCaching: true,
  enableCircuitBreaker: true,
  enableMetrics: true,
  enableStatePersistence: true,
  maxConcurrency: 5,
  executionTimeout: 30000
});
