/**
 * Workflow State Persistence and Recovery
 * Enables resuming interrupted workflows
 */

import { supabase } from './supabase';
import { Workflow, Patient, Appointment } from './database.types';

interface WorkflowExecutionState {
  executionId: string;
  workflowId: string;
  patientId: string;
  status: 'running' | 'paused' | 'failed' | 'completed';
  currentStep: number;
  totalSteps: number;
  executedNodes: string[];
  pendingNodes: string[];
  failedNodes: Record<string, string>; // nodeId -> error
  contextData: Record<string, any>;
  checkpointData: any;
  lastUpdated: number;
  retryCount: number;
  maxRetries: number;
}

interface CheckpointData {
  nodeStates: Record<string, NodeState>;
  globalVariables: Record<string, any>;
  executionPlan: any;
  dependencyGraph: any;
}

interface NodeState {
  nodeId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  inputData?: any;
  outputData?: any;
  errorMessage?: string;
  startTime?: number;
  endTime?: number;
  retryCount: number;
}

export class WorkflowStateManager {
  private static instance: WorkflowStateManager;
  private activeStates = new Map<string, WorkflowExecutionState>();

  static getInstance(): WorkflowStateManager {
    if (!WorkflowStateManager.instance) {
      WorkflowStateManager.instance = new WorkflowStateManager();
    }
    return WorkflowStateManager.instance;
  }

  // Create new execution state
  async createExecutionState(
    workflow: Workflow,
    patient: Patient,
    appointment: Appointment,
    context: { daysPassed: number }
  ): Promise<string> {
    const executionId = await this.createExecutionRecord(workflow, patient, appointment, context);

    const state: WorkflowExecutionState = {
      executionId,
      workflowId: workflow.id,
      patientId: patient.id,
      status: 'running',
      currentStep: 0,
      totalSteps: 0, // Will be set during execution
      executedNodes: [],
      pendingNodes: [],
      failedNodes: {},
      contextData: {
        daysPassed: context.daysPassed,
        patient: patient,
        appointment: appointment,
        workflow: workflow
      },
      checkpointData: null,
      lastUpdated: Date.now(),
      retryCount: 0,
      maxRetries: 3
    };

    this.activeStates.set(executionId, state);
    await this.persistState(state);

    return executionId;
  }

  // Load existing execution state
  async loadExecutionState(executionId: string): Promise<WorkflowExecutionState | null> {
    // Try memory first
    if (this.activeStates.has(executionId)) {
      return this.activeStates.get(executionId)!;
    }

    // Try database
    try {
      const { data, error } = await supabase
        .from('workflow_execution_states')
        .select('*')
        .eq('execution_id', executionId)
        .single();

      if (error || !data) return null;

      const state: WorkflowExecutionState = {
        executionId: data.execution_id,
        workflowId: data.workflow_id,
        patientId: data.patient_id,
        status: data.status,
        currentStep: data.current_step,
        totalSteps: data.total_steps,
        executedNodes: data.executed_nodes || [],
        pendingNodes: data.pending_nodes || [],
        failedNodes: data.failed_nodes || {},
        contextData: data.context_data || {},
        checkpointData: data.checkpoint_data,
        lastUpdated: new Date(data.last_updated).getTime(),
        retryCount: data.retry_count || 0,
        maxRetries: data.max_retries || 3
      };

      // Cache in memory
      this.activeStates.set(executionId, state);

      return state;
    } catch (error) {
      console.error('Failed to load execution state:', error);
      return null;
    }
  }

  // Update execution state
  async updateExecutionState(
    executionId: string,
    updates: Partial<WorkflowExecutionState>
  ): Promise<void> {
    const state = this.activeStates.get(executionId);
    if (!state) return;

    // Update in-memory state
    Object.assign(state, updates, { lastUpdated: Date.now() });

    // Persist to database
    await this.persistState(state);
  }

  // Save checkpoint
  async saveCheckpoint(
    executionId: string,
    checkpointData: CheckpointData
  ): Promise<void> {
    await this.updateExecutionState(executionId, {
      checkpointData
    });
  }

  // Load checkpoint
  async loadCheckpoint(executionId: string): Promise<CheckpointData | null> {
    const state = await this.loadExecutionState(executionId);
    return state?.checkpointData || null;
  }

  // Mark node as completed
  async markNodeCompleted(
    executionId: string,
    nodeId: string,
    outputData?: any
  ): Promise<void> {
    const state = this.activeStates.get(executionId);
    if (!state) return;

    // Update node state
    if (state.checkpointData?.nodeStates) {
      const nodeState = state.checkpointData.nodeStates[nodeId];
      if (nodeState) {
        nodeState.status = 'completed';
        nodeState.outputData = outputData;
        nodeState.endTime = Date.now();
      }
    }

    // Update execution state
    state.executedNodes.push(nodeId);
    state.pendingNodes = state.pendingNodes.filter(id => id !== nodeId);
    state.currentStep = Math.max(state.currentStep, state.executedNodes.length);

    await this.persistState(state);
  }

  // Mark node as failed
  async markNodeFailed(
    executionId: string,
    nodeId: string,
    errorMessage: string
  ): Promise<void> {
    const state = this.activeStates.get(executionId);
    if (!state) return;

    // Update node state
    if (state.checkpointData?.nodeStates) {
      const nodeState = state.checkpointData.nodeStates[nodeId];
      if (nodeState) {
        nodeState.status = 'failed';
        nodeState.errorMessage = errorMessage;
        nodeState.endTime = Date.now();
      }
    }

    // Update execution state
    state.failedNodes[nodeId] = errorMessage;
    state.pendingNodes = state.pendingNodes.filter(id => id !== nodeId);

    await this.persistState(state);
  }

  // Pause execution
  async pauseExecution(executionId: string): Promise<void> {
    await this.updateExecutionState(executionId, { status: 'paused' });
  }

  // Resume execution
  async resumeExecution(executionId: string): Promise<void> {
    await this.updateExecutionState(executionId, { status: 'running' });
  }

  // Fail execution
  async failExecution(executionId: string, errorMessage: string): Promise<void> {
    await this.updateExecutionState(executionId, {
      status: 'failed',
      failedNodes: { ...this.activeStates.get(executionId)?.failedNodes, 'execution': errorMessage }
    });
  }

  // Complete execution
  async completeExecution(executionId: string): Promise<void> {
    await this.updateExecutionState(executionId, { status: 'completed' });

    // Clean up from memory
    this.activeStates.delete(executionId);
  }

  // Retry failed execution
  async retryExecution(executionId: string): Promise<boolean> {
    const state = await this.loadExecutionState(executionId);
    if (!state) return false;

    if (state.retryCount >= state.maxRetries) {
      return false; // Max retries exceeded
    }

    // Reset failed nodes to pending
    state.pendingNodes.push(...Object.keys(state.failedNodes));
    state.failedNodes = {};
    state.retryCount++;
    state.status = 'running';

    await this.persistState(state);
    return true;
  }

  // Get execution summary
  async getExecutionSummary(executionId: string): Promise<{
    status: string;
    progress: number;
    executedCount: number;
    failedCount: number;
    pendingCount: number;
    lastUpdated: number;
  } | null> {
    const state = await this.loadExecutionState(executionId);
    if (!state) return null;

    return {
      status: state.status,
      progress: state.totalSteps > 0 ? (state.executedNodes.length / state.totalSteps) * 100 : 0,
      executedCount: state.executedNodes.length,
      failedCount: Object.keys(state.failedNodes).length,
      pendingCount: state.pendingNodes.length,
      lastUpdated: state.lastUpdated
    };
  }

  // Clean up old states
  async cleanupOldStates(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    const cutoffTime = Date.now() - maxAge;

    // Clean up from database
    try {
      await supabase
        .from('workflow_execution_states')
        .delete()
        .lt('last_updated', new Date(cutoffTime).toISOString());
    } catch (error) {
      console.error('Failed to cleanup old execution states:', error);
    }

    // Clean up from memory
    for (const [executionId, state] of this.activeStates.entries()) {
      if (state.lastUpdated < cutoffTime && state.status !== 'running') {
        this.activeStates.delete(executionId);
      }
    }
  }

  private async createExecutionRecord(
    workflow: Workflow,
    patient: Patient,
    appointment: Appointment,
    context: { daysPassed: number }
  ): Promise<string> {
    const { data, error } = await supabase
      .from('workflow_executions')
      .insert({
        user_id: workflow.user_id,
        workflow_id: workflow.id,
        patient_id: patient.id,
        trigger_type: 'schedule',
        status: 'running',
        current_step_index: context.daysPassed,
        execution_data: {
          days_passed: context.daysPassed,
          state_managed: true
        }
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  private async persistState(state: WorkflowExecutionState): Promise<void> {
    try {
      await supabase
        .from('workflow_execution_states')
        .upsert({
          execution_id: state.executionId,
          workflow_id: state.workflowId,
          patient_id: state.patientId,
          status: state.status,
          current_step: state.currentStep,
          total_steps: state.totalSteps,
          executed_nodes: state.executedNodes,
          pending_nodes: state.pendingNodes,
          failed_nodes: state.failedNodes,
          context_data: state.contextData,
          checkpoint_data: state.checkpointData,
          last_updated: new Date(state.lastUpdated).toISOString(),
          retry_count: state.retryCount,
          max_retries: state.maxRetries
        });
    } catch (error) {
      console.error('Failed to persist execution state:', error);
    }
  }
}

// Singleton instance
export const workflowStateManager = WorkflowStateManager.getInstance();
