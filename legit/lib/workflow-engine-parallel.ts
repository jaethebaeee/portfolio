/**
 * Parallel Workflow Execution Engine
 * Implements concurrent node execution for better performance
 */

import { supabase } from './supabase';
import { Workflow, Patient, Appointment } from './database.types';
import { sendSmartMessage } from './smart-messaging';
import { evaluateCondition } from './conditional-logic';

interface GraphNode {
  id: string;
  type: string;
  data: any;
  position: any;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

interface VisualWorkflowData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface ExecutionTask {
  node: GraphNode;
  executionOrder: number;
  dependencies: string[];
  context: ExecutionContext;
}

interface ExecutionContext {
  patient: Patient;
  appointment: Appointment;
  workflowId: string;
  executionId: string;
  daysPassed: number;
  variables: Record<string, any>;
  triggerType?: string;
}

interface ExecutionResult {
  success: boolean;
  nodeId: string;
  output?: any;
  error?: string;
  duration: number;
}

export class ParallelWorkflowEngine {
  private maxConcurrency: number;
  private executionTimeout: number;

  constructor(options: {
    maxConcurrency?: number;
    executionTimeout?: number;
  } = {}) {
    this.maxConcurrency = options.maxConcurrency || 5;
    this.executionTimeout = options.executionTimeout || 30000; // 30 seconds
  }

  async executeWorkflow(
    workflow: Workflow,
    patient: Patient,
    appointment: Appointment,
    context: { daysPassed: number },
    options: { dryRun?: boolean } = {}
  ): Promise<{ executed: boolean; log: string; results: ExecutionResult[] }> {
    // Validate visual_data
    if (!workflow.visual_data) {
      return { executed: false, log: 'No visual data', results: [] };
    }

    const visualData = workflow.visual_data as unknown as VisualWorkflowData;
    if (!visualData.nodes || !visualData.edges) {
      return { executed: false, log: 'Invalid visual data structure', results: [] };
    }

    // Create execution context
    // For dryRun, we might skip DB recording or mark it as test
    let executionId = 'dry-run-execution';
    if (!options.dryRun) {
        executionId = await this.createExecutionRecord(workflow, patient, appointment, context);
    }
    
    const execContext: ExecutionContext = {
      patient,
      appointment,
      workflowId: workflow.id,
      executionId,
      daysPassed: context.daysPassed,
      variables: this.buildContextVariables(patient, appointment, context),
      triggerType: context.triggerType,
    };

    // Build execution plan with dependencies
    const executionPlan = this.buildExecutionPlan(visualData.nodes, visualData.edges, execContext);

    // Execute nodes in parallel with dependency management
    const results = await this.executeWithDependencies(executionPlan, execContext, options.dryRun);

    // Update execution record (only if not dryRun)
    if (!options.dryRun) {
        await this.updateExecutionRecord(executionId, results);
    }

    const executed = results.some(r => r.success);
    const log = results.map(r => `${r.nodeId}: ${r.success ? 'SUCCESS' : 'FAILED'}`).join(', ');

    return { executed, log, results };
  }

  private buildExecutionPlan(
    nodes: GraphNode[],
    edges: GraphEdge[],
    context: ExecutionContext
  ): ExecutionTask[] {
    const plan: ExecutionTask[] = [];
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const dependencyMap = this.buildDependencyMap(edges);

    // Find nodes that should execute today
    // Support multiple trigger types: surgery_completed, appointment status changes, etc.
    const triggerType = context.triggerType || 'surgery_completed';
    const startNode = nodes.find(n =>
      n.type === 'trigger' &&
      n.data.triggerType === triggerType
    );

    if (!startNode) return [];

    // Calculate which nodes should execute based on days passed
    const executableNodes = this.calculateExecutableNodes(
      nodes,
      edges,
      startNode,
      context.daysPassed
    );

    let order = 0;
    const processed = new Set<string>();

    const processNode = (nodeId: string, currentOrder: number) => {
      if (processed.has(nodeId)) return;

      const node = nodeMap.get(nodeId);
      if (!node) return;

      // Process dependencies first
      const dependencies = dependencyMap.get(nodeId) || [];
      let maxDependencyOrder = currentOrder;

      for (const depId of dependencies) {
        processNode(depId, currentOrder);
        const depTask = plan.find(t => t.node.id === depId);
        if (depTask) {
          maxDependencyOrder = Math.max(maxDependencyOrder, depTask.executionOrder + 1);
        }
      }

      plan.push({
        node,
        executionOrder: maxDependencyOrder,
        dependencies,
        context
      });

      processed.add(nodeId);
    };

    // Process all executable nodes
    for (const node of executableNodes) {
      processNode(node.id, order);
    }

    return plan.sort((a, b) => a.executionOrder - b.executionOrder);
  }

  private buildDependencyMap(edges: GraphEdge[]): Map<string, string[]> {
    const map = new Map<string, string[]>();

    for (const edge of edges) {
      if (!map.has(edge.target)) {
        map.set(edge.target, []);
      }
      map.get(edge.target)!.push(edge.source);
    }

    return map;
  }

  private calculateExecutableNodes(
    nodes: GraphNode[],
    edges: GraphEdge[],
    startNode: GraphNode,
    daysPassed: number
  ): GraphNode[] {
    const executable: GraphNode[] = [];
    const visited = new Set<string>();

    const traverse = (nodeId: string, currentDelay: number) => {
      if (visited.has(`${nodeId}-${currentDelay}`)) return;
      visited.add(`${nodeId}-${currentDelay}`);

      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;

      // Calculate delay for this node
      let additionalDelay = 0;
      if (node.type === 'delay') {
        const delay = node.data.delay;
        if (delay?.type === 'days') {
          additionalDelay = parseInt(delay.value) || 0;
        }
      }

      const executionDay = currentDelay + additionalDelay;

      // Check if this node should execute today
      if (executionDay === daysPassed) {
        executable.push(node);
      }

      // Continue traversal
      const outgoingEdges = edges.filter(e => e.source === nodeId);
      for (const edge of outgoingEdges) {
        traverse(edge.target, executionDay);
      }
    };

    traverse(startNode.id, 0);
    return executable;
  }

  private async executeWithDependencies(
    tasks: ExecutionTask[],
    context: ExecutionContext,
    dryRun: boolean = false
  ): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];
    const completedTasks = new Set<string>();

    // Group tasks by execution order
    const tasksByOrder = new Map<number, ExecutionTask[]>();
    for (const task of tasks) {
      if (!tasksByOrder.has(task.executionOrder)) {
        tasksByOrder.set(task.executionOrder, []);
      }
      tasksByOrder.get(task.executionOrder)!.push(task);
    }

    // Execute tasks in order, with parallelism within each order
    for (const [order, orderTasks] of tasksByOrder.entries()) {
      // Wait for all dependencies to complete
      const executableTasks = orderTasks.filter(task =>
        task.dependencies.every(depId => completedTasks.has(depId))
      );

      // Execute tasks in this order concurrently
      const orderResults = await Promise.allSettled(
        executableTasks.map(task => this.executeTaskWithTimeout(task, context, dryRun))
      );

      // Process results
      for (let i = 0; i < executableTasks.length; i++) {
        const task = executableTasks[i];
        const promiseResult = orderResults[i];

        const result: ExecutionResult = {
          nodeId: task.node.id,
          duration: 0,
          success: false
        };

        if (promiseResult.status === 'fulfilled') {
          result.success = promiseResult.value.success;
          result.output = promiseResult.value.output;
          result.error = promiseResult.value.error;
          result.duration = promiseResult.value.duration;
        } else {
          result.error = promiseResult.reason?.message || 'Execution failed';
        }

        results.push(result);

        if (result.success) {
          completedTasks.add(task.node.id);
        }
      }
    }

    return results;
  }

  private async executeTaskWithTimeout(
    task: ExecutionTask,
    context: ExecutionContext,
    dryRun: boolean = false
  ): Promise<{ success: boolean; output?: any; error?: string; duration: number }> {
    const startTime = Date.now();

    try {
      const result = await Promise.race([
        this.executeTask(task, context, dryRun),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Execution timeout')), this.executionTimeout)
        )
      ]);

      const duration = Date.now() - startTime;
      return { success: true, output: result, duration };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        error: error.message || 'Unknown error',
        duration
      };
    }
  }

  private async executeTask(
    task: ExecutionTask,
    context: ExecutionContext,
    dryRun: boolean = false
  ): Promise<any> {
    const { node, context: execContext } = task;

    // For dryRun, we skip DB checks
    if (!dryRun) {
        // Check for duplicate execution
        const { data: existingLog } = await supabase
        .from('message_logs')
        .select('id')
        .eq('patient_id', execContext.patient.id)
        .contains('metadata', {
            workflow_id: execContext.workflowId,
            node_id: node.id,
            appointment_id: execContext.appointment.id
        })
        .single();

        if (existingLog) {
            return { skipped: true, reason: 'Already executed' };
        }
    }

    switch (node.type) {
      case 'action':
        return await this.executeActionNode(node, execContext, dryRun);

      case 'condition':
        return await this.executeConditionNode(node, execContext);

      default:
        return { result: 'Node type not supported' };
    }
  }

  private async executeActionNode(node: GraphNode, context: ExecutionContext, dryRun: boolean = false): Promise<any> {
    const { actionType, message_template, templateId, httpRequest } = node.data;

    if (actionType === 'http_request') {
      if (!httpRequest || !httpRequest.url) {
        throw new Error('Missing HTTP request configuration');
      }

      let url = httpRequest.url;
      // Replace variables in URL
      Object.entries(context.variables).forEach(([key, value]) => {
        url = url.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
      });

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (httpRequest.headers) {
        httpRequest.headers.forEach((h: any) => {
          if (h.key) headers[h.key] = h.value;
        });
      }

      // Prepare body
      let body = httpRequest.body;
      if (body && typeof body === 'string') {
         Object.entries(context.variables).forEach(([key, value]) => {
           body = body.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
         });
      }

      if (dryRun) {
        return { 
          sent: true, 
          channel: 'http', 
          dryRun: true, 
          request: { method: httpRequest.method, url, headers, body } 
        };
      }

      try {
        const response = await fetch(url, {
          method: httpRequest.method || 'GET',
          headers,
          body: (httpRequest.method !== 'GET' && httpRequest.method !== 'DELETE') ? body : undefined,
        });

        const responseText = await response.text();
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = responseText;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${responseText.substring(0, 100)}`);
        }
        
        // Store response in variables for subsequent nodes
        // Using node label or ID to namespace the variable
        const safeLabel = node.data.label.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        context.variables[`${safeLabel}_response`] = responseData;
        context.variables['last_http_response'] = responseData;

        return { 
          success: true, 
          status: response.status, 
          data: responseData 
        };

      } catch (error: any) {
        throw new Error(`HTTP Request Failed: ${error.message}`);
      }
    }

    if (actionType === 'send_email') {
      const emailConfig = node.data.emailConfig;
      if (!emailConfig || !emailConfig.subject || !message_template) {
        throw new Error('Missing email configuration');
      }

      let subject = emailConfig.subject;
      let body = message_template;

      // Replace variables
      Object.entries(context.variables).forEach(([key, value]) => {
        subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        body = body.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
      });

      if (dryRun) {
        return { 
          sent: true, 
          channel: 'email', 
          dryRun: true, 
          subject, 
          body 
        };
      }

      try {
         // Get Email Settings (Internal API call or direct DB if we move logic here)
         // For now, let's assume we call an internal API endpoint or utility function.
         // Calling internal API from here is tricky due to auth headers.
         // Better to use a direct utility if possible.
         
         // Dynamically import utility (to avoid circular deps if any)
         const { sendEmail } = await import('@/lib/email-sender');
         
         // Extract userId from workflowId (format: userId-workflowId or just workflowId)
         const userId = context.workflowId.split('-')[0];
         
         const result = await sendEmail(userId, {
           to: context.patient.email || '', // Need email field on patient!
           subject,
           html: body
         });

         await this.logExecution(context.executionId, node.id, 'success', { result });
         return { sent: true, channel: 'email' };

      } catch (e: any) {
        throw new Error(`Email send failed: ${e.message}`);
      }
    }

    if (actionType === 'send_kakao' || actionType === 'send_sms') {
      let content = message_template || "안녕하세요.";
      // Replace variables in content
      Object.entries(context.variables).forEach(([key, value]) => {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
      });
      
      if (dryRun) {
          return { sent: true, channel: actionType === 'send_kakao' ? 'kakao' : 'sms', dryRun: true, content };
      }

      // Prepare template args for AlimTalk
      const templateArgs: Record<string, string> = {};
      Object.entries(context.variables).forEach(([key, value]) => {
        templateArgs[key] = String(value);
      });

      const result = await sendSmartMessage(context.workflowId.split('-')[0], {
        recipientPhone: context.patient.phone,
        content: content,
        templateId: actionType === 'send_kakao' ? templateId : undefined, // Only use templateId for Kakao
        templateArgs: actionType === 'send_kakao' && templateId ? templateArgs : undefined,
        fallbackMessage: content // Use content as fallback
      }, {
        patientId: context.patient.id,
        templateId: context.workflowId, // This is the Workflow ID for logging context
        campaignId: undefined
      });

      if (result.success) {
        // Log execution
        await this.logExecution(context.executionId, node.id, 'success', { result });
        return { sent: true, channel: result.channel };
      } else {
        throw new Error(result.error || 'Message send failed');
      }
    }

    if (actionType === 'medication_reminder') {
      const medication = node.data.medication;
      if (!medication) {
        throw new Error('Missing medication configuration');
      }

      // Calculate start date (appointment date or today)
      const startDate = context.appointment.appointment_date 
        ? new Date(context.appointment.appointment_date) 
        : new Date();
      startDate.setHours(0, 0, 0, 0);

      // Build reminder message
      const variables: Record<string, string> = {
        patient_name: context.patient.name || '',
        medication_name: medication.name,
        medication_frequency: medication.frequency,
        medication_instructions: medication.instructions,
      };

      let messageTemplate = `안녕하세요 {{patient_name}}님,\n\n복약 시간입니다.\n\n약물: {{medication_name}}\n복용 횟수: {{medication_frequency}}\n복용 방법: {{medication_instructions}}\n\n건강한 회복을 응원합니다.`;
      
      // Replace variables
      Object.entries(variables).forEach(([key, value]) => {
        messageTemplate = messageTemplate.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
      });

      if (dryRun) {
        return {
          scheduled: true,
          dryRun: true,
          medication: medication.name,
          reminders: medication.times.length * medication.duration,
          message: messageTemplate
        };
      }

      // Schedule reminders (same logic as visual workflow engine)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let scheduledCount = 0;

      for (let day = 0; day < medication.duration; day++) {
        const reminderDate = new Date(startDate);
        reminderDate.setDate(reminderDate.getDate() + day);
        reminderDate.setHours(0, 0, 0, 0);

        if (reminderDate < today) continue;

        for (const time of medication.times) {
          const [hours, minutes] = time.split(':').map(Number);
          const scheduledTime = new Date(reminderDate);
          scheduledTime.setHours(hours, minutes, 0, 0);

          if (day === 0 && scheduledTime < new Date()) {
            continue;
          }

          const reminderKey = `medication_${medication.name}_${reminderDate.toISOString().split('T')[0]}_${time}`;
          
          // Check if already sent
          const { data: existingLog } = await supabase
            .from('message_logs')
            .select('id')
            .eq('patient_id', context.patient.id)
            .contains('metadata', {
              workflow_id: context.workflowId,
              node_id: node.id,
              reminder_key: reminderKey
            })
            .single();

          if (existingLog) continue;

          // Send immediately if it's time
          if (scheduledTime <= new Date()) {
            const result = await sendSmartMessage(context.workflowId.split('-')[0], {
              recipientPhone: context.patient.phone,
              content: messageTemplate,
              templateId: undefined,
              templateArgs: undefined,
              fallbackMessage: messageTemplate
            }, {
              patientId: context.patient.id,
              templateId: context.workflowId,
              campaignId: undefined
            });

            if (result.success) {
              const { data: logData } = await supabase
                .from('message_logs')
                .select('id')
                .eq('patient_id', context.patient.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

              if (logData) {
                await supabase.from('message_logs').update({
                  metadata: {
                    workflow_id: context.workflowId,
                    node_id: node.id,
                    appointment_id: context.appointment.id,
                    execution_id: context.executionId,
                    reminder_key: reminderKey,
                    medication_name: medication.name,
                    scheduled_time: scheduledTime.toISOString(),
                    reminder_type: 'medication'
                  }
                }).eq('id', logData.id);
              }
              scheduledCount++;
            }
          } else {
            // Schedule for future
            await supabase.from('message_logs').insert({
              patient_id: context.patient.id,
              user_id: context.workflowId.split('-')[0],
              content: messageTemplate,
              status: 'scheduled',
              scheduled_at: scheduledTime.toISOString(),
              metadata: {
                workflow_id: context.workflowId,
                node_id: node.id,
                appointment_id: context.appointment.id,
                execution_id: context.executionId,
                reminder_key: reminderKey,
                medication_name: medication.name,
                scheduled_time: scheduledTime.toISOString(),
                reminder_type: 'medication'
              }
            });
            scheduledCount++;
          }
        }
      }

      await this.logExecution(context.executionId, node.id, 'success', { 
        scheduled: scheduledCount,
        medication: medication.name 
      });

      return { 
        scheduled: true, 
        count: scheduledCount,
        medication: medication.name 
      };
    }

    return { result: 'Unsupported action type' };
  }

  private async executeConditionNode(node: GraphNode, context: ExecutionContext): Promise<any> {
    const conditionVariables = {
      patient_name: context.patient.name || '',
      patient_gender: context.patient.gender || '',
      surgery_type: context.appointment.surgery_type || '',
      days_passed: String(context.daysPassed),
    };

    const conditionObj = node.data.condition || node.data;
    if (conditionObj && typeof conditionObj === 'object' && 'variable' in conditionObj) {
      const result = evaluateCondition(conditionObj, conditionVariables);
      return { condition: result, variables: conditionVariables };
    }

    throw new Error('Invalid condition configuration');
  }

  private buildContextVariables(
    patient: Patient,
    appointment: Appointment,
    context: { daysPassed: number }
  ): Record<string, any> {
    return {
      patient_name: patient.name,
      patient_gender: patient.gender,
      patient_phone: patient.phone,
      surgery_type: appointment.surgery_type,
      surgery_date: appointment.appointment_date,
      days_passed: context.daysPassed,
      appointment_status: appointment.status,
    };
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
          engine: 'parallel'
        }
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  private async updateExecutionRecord(
    executionId: string,
    results: ExecutionResult[]
  ): Promise<void> {
    const hasErrors = results.some(r => !r.success);
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

    await supabase
      .from('workflow_executions')
      .update({
        status: hasErrors ? 'failed' : 'completed',
        completed_at: new Date().toISOString(),
        steps_completed: results.filter(r => r.success).length,
        error_message: hasErrors ? results.filter(r => !r.success).map(r => r.error).join('; ') : null,
        execution_data: {
          results: results.map(r => ({
            nodeId: r.nodeId,
            success: r.success,
            duration: r.duration,
            error: r.error
          })),
          total_duration: totalDuration,
          engine: 'parallel'
        }
      })
      .eq('id', executionId);
  }

  private async logExecution(
    executionId: string,
    nodeId: string,
    status: 'success' | 'failed',
    data: any
  ): Promise<void> {
    await supabase
      .from('workflow_executions')
      .update({
        execution_data: {
          node_executions: supabase.functions.invoke('array_append', {
            execution_id: executionId,
            node_id: nodeId,
            status,
            data,
            timestamp: new Date().toISOString()
          })
        }
      })
      .eq('id', executionId);
  }
}
