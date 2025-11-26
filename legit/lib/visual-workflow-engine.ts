/**
 * Visual Workflow Execution Engine
 * Executes workflows based on React Flow graph data (nodes & edges)
 */

import { createServerClient } from './supabase';
import { Workflow, Appointment, Patient } from './database.types';
import { sendSmartMessage } from './smart-messaging';
import { evaluateCondition } from './conditional-logic';

const delayLabels = {
  minutes: '분',
  hours: '시간',
  days: '일',
};

function calculateAge(birthDate?: string): number {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

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

/**
 * Traverse the graph to find nodes to execute for a given patient/context
 */
export async function executeVisualWorkflow(
  workflow: Workflow,
  patient: Patient,
  appointment: Appointment,
  context: { 
    daysPassed: number; 
    executionId?: string; 
    resumeFromNodeId?: string;
    triggerType?: string;
  }
): Promise<{ executed: boolean; log: string }> {
  // Validate visual_data exists
  if (!workflow.visual_data) {
    return { executed: false, log: 'No visual data' };
  }

  // Validate visual_data structure
  const visualData = workflow.visual_data as unknown as VisualWorkflowData;
  if (!visualData.nodes || !Array.isArray(visualData.nodes) || 
      !visualData.edges || !Array.isArray(visualData.edges)) {
    return { executed: false, log: 'Invalid visual data structure' };
  }

  const { nodes, edges } = visualData;

  // 1. Find Start Node (Trigger)
  // Support multiple trigger types based on context
  const triggerType = context.triggerType || 'surgery_completed';
  let startNode = nodes.find(n => n.type === 'trigger' && n.data.triggerType === triggerType);
  if (!startNode) return { executed: false, log: `No start node found for trigger: ${triggerType}` };

  // If resuming from a specific node (after delay), find that node
  if (context.resumeFromNodeId) {
    const resumeNode = nodes.find(n => n.id === context.resumeFromNodeId);
    if (resumeNode) {
      startNode = resumeNode;
    }
  }

  // 2. Calculate execution plan
  const executionPlan = await calculateExecutionPlan(nodes, edges, patient, appointment, context);
  
  // Find actions scheduled for today (daysPassed)
  const todaysActions = executionPlan.filter(plan => plan.day === context.daysPassed);
  
  if (todaysActions.length === 0) {
    return { executed: false, log: `No actions for day ${context.daysPassed}` };
  }

  // Initialize Supabase client
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  // Start Execution Tracking
  let executionId: string | null = null;
  try {
    const { data: execData, error: execError } = await supabase
      .from('workflow_executions')
      .insert({
        user_id: workflow.user_id,
        workflow_id: workflow.id,
        patient_id: patient.id,
        trigger_type: 'schedule', // Daily check is a schedule trigger
        status: 'running',
        current_step_index: context.daysPassed,
        total_steps: nodes.length, // Approximate
        execution_data: {
          days_passed: context.daysPassed,
          planned_actions: todaysActions.map(a => a.node.id)
        }
      })
      .select('id')
      .single();
    
    if (!execError && execData) {
      executionId = execData.id;
    }
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to create execution log', e);
    }
  }

  let executedCount = 0;
  let logMessages = [];
  let hasErrors = false;

  // Check if we need to handle delay nodes first
  const delayNodes = todaysActions.filter(plan => plan.node.type === 'delay');
  if (delayNodes.length > 0) {
    // Handle delay nodes - schedule continuation
    for (const delayPlan of delayNodes) {
      const delay = delayPlan.node.data.delay;
      if (delay && delay.value && delay.type) {
        // Import delay calculation utilities
        const { calculateDelayMs, calculateExecutionDate, validateDelay, formatDelay } = await import('./delay-calculation');
        
        // Validate delay configuration
        const validation = await validateDelay({
          type: delay.type as 'minutes' | 'hours' | 'days' | 'business_days',
          value: delay.value,
          skipWeekends: delay.skipWeekends ?? true,
          skipHolidays: delay.skipHolidays ?? true,
        });

        if (!validation.isValid) {
          hasErrors = true;
          logMessages.push(`Delay validation failed: ${validation.error}`);
          continue;
        }

        if (validation.warning) {
          logMessages.push(`Delay warning: ${validation.warning}`);
        }

        // Calculate delay with business days support
        const startDate = appointment.appointment_date 
          ? new Date(appointment.appointment_date) 
          : new Date();
        
        const delayMs = await calculateDelayMs({
          type: delay.type as 'minutes' | 'hours' | 'days' | 'business_days',
          value: delay.value,
          skipWeekends: delay.skipWeekends ?? true,
          skipHolidays: delay.skipHolidays ?? true,
        }, startDate);

        if (delayMs > 0) {
          // Find the next node after this delay
          const outgoingEdges = edges.filter(e => e.source === delayPlan.node.id);
          if (outgoingEdges.length > 0) {
            const nextNodeId = outgoingEdges[0].target;

            // Calculate execution date
            const executionDate = delay.type === 'business_days'
              ? await calculateExecutionDate({
                  type: 'business_days',
                  value: delay.value,
                  skipWeekends: delay.skipWeekends ?? true,
                  skipHolidays: delay.skipHolidays ?? true,
                }, startDate)
              : new Date(Date.now() + delayMs);

            // Store full execution context snapshot
            const executionContext = {
              workflow: {
                id: workflow.id,
                user_id: workflow.user_id,
                name: workflow.name,
                visual_data: workflow.visual_data,
              },
              patient: {
                id: patient.id,
                name: patient.name,
                phone: patient.phone,
                email: patient.email,
                birth_date: patient.birth_date,
                gender: patient.gender,
              },
              appointment: {
                id: appointment.id,
                appointment_date: appointment.appointment_date,
                appointment_time: appointment.appointment_time,
                surgery_type: appointment.surgery_type,
                status: appointment.status,
              },
              context: {
                daysPassed: context.daysPassed,
                triggerType: context.triggerType,
                executionId: executionId,
              },
              delayNode: {
                id: delayPlan.node.id,
                delay: delay,
              },
            };

            // Schedule continuation using the queue system with full context
            const { workflowQueue } = await import('./workflow-queue');
            await workflowQueue.enqueue(
              workflow,
              patient,
              appointment,
              {
                daysPassed: context.daysPassed,
                resumeFromNodeId: nextNodeId,
                executionId: executionId || undefined,
                triggerType: context.triggerType,
              },
              {
                delay: delayMs,
                tags: ['delay_continuation'],
                executionContext: executionContext,
                delayConfig: {
                  type: delay.type,
                  value: delay.value,
                  skipWeekends: delay.skipWeekends ?? true,
                  skipHolidays: delay.skipHolidays ?? true,
                },
                scheduledFor: executionDate.getTime(),
              }
            );

            logMessages.push(`Scheduled delay: ${formatDelay({ type: delay.type as any, value: delay.value })} 후 ${nextNodeId}에서 계속 (실행 예정: ${executionDate.toLocaleString('ko-KR')})`);
          }
        }
      }
    }

    // If we have delay nodes, don't execute regular actions today
    if (delayNodes.length > 0) {
      return {
        executed: true,
        log: logMessages.join('; ')
      };
    }
  }

  for (const action of todaysActions) {
    // ... (action execution)
    if (action.node.type === 'action') {
      const { actionType, message_template } = action.node.data;
      
      // Check if already executed
      const { data: existingLog } = await supabase
        .from('message_logs')
        .select('id')
        .eq('patient_id', patient.id)
        .contains('metadata', { 
          workflow_id: workflow.id, 
          node_id: action.node.id,
          appointment_id: appointment.id 
        })
        .single();

      if (existingLog) {
        logMessages.push(`Skipped node ${action.node.id} (Already sent)`);
        continue;
      }

      // Handle survey nodes (cancellation reason, patient feedback, etc.)
      if (actionType === 'survey_cancellation_reason' || actionType === 'survey_patient_feedback') {
        const templateId = action.node.data.templateId;
        let content = message_template || "설문에 참여해주세요.";

        // Basic variable context
        const variables: Record<string, string> = {
          patient_name: patient.name || '',
          patient_gender: patient.gender || '',
          surgery_type: appointment.surgery_type || '',
          patient_phone: patient.phone || '',
          appointment_date: appointment.appointment_date || '',
          appointment_time: appointment.appointment_time || '',
          // Telemedicine variables
          meeting_url: appointment.meeting_url || '',
          meeting_password: appointment.meeting_password || '',
          video_provider: appointment.video_provider || '',
          is_telemedicine: appointment.is_telemedicine ? 'true' : 'false',
        };

        // Replace variables in content
        Object.entries(variables).forEach(([key, value]) => {
          content = content.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        });

        // Build survey URL
        const surveyType = actionType === 'survey_cancellation_reason' ? 'cancellation' : 'feedback';
        const surveyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://doctorsflow.com'}/cancellation-survey?aid=${appointment.id}&pid=${patient.id}&uid=${workflow.user_id}&wid=${workflow.id}&nid=${action.node.id}`;
        
        // Add survey link to message
        content += `\n\n[설문 참여하기]\n${surveyUrl}`;
        
        const result = await sendSmartMessage(workflow.user_id, {
          recipientPhone: patient.phone,
          content: content,
          templateId: actionType === 'send_kakao' ? templateId : undefined,
          templateArgs: actionType === 'send_kakao' && templateId ? variables : undefined,
          fallbackMessage: content
        }, {
          patientId: patient.id,
          templateId: workflow.id,
          campaignId: undefined
        });

        if (result.success) {
          const { data: latestLog } = await supabase
            .from('message_logs')
            .select('id')
            .eq('patient_id', patient.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
          if (latestLog) {
            await supabase.from('message_logs').update({
              metadata: {
                workflow_id: workflow.id,
                node_id: action.node.id,
                appointment_id: appointment.id,
                days_passed: context.daysPassed,
                execution_id: executionId,
                survey_type: surveyType,
                survey_url: surveyUrl
              }
            }).eq('id', latestLog.id);
          }
          executedCount++;
          logMessages.push(`Executed survey node ${action.node.id}`);
        } else {
          hasErrors = true;
          logMessages.push(`Failed survey node ${action.node.id}: ${result.error}`);
        }
      } else if (actionType === 'send_kakao' || actionType === 'send_sms') {
        const templateId = action.node.data.templateId;
        let content = message_template || "안녕하세요.";

        // Basic variable context
        const variables: Record<string, string> = {
          patient_name: patient.name || '',
          patient_gender: patient.gender || '',
          surgery_type: appointment.surgery_type || '',
          patient_phone: patient.phone || '',
          appointment_date: appointment.appointment_date || '',
          appointment_time: appointment.appointment_time || '',
          // Telemedicine variables
          meeting_url: appointment.meeting_url || '',
          meeting_password: appointment.meeting_password || '',
          video_provider: appointment.video_provider || '',
          is_telemedicine: appointment.is_telemedicine ? 'true' : 'false',
        };

        // Replace variables in content
        Object.entries(variables).forEach(([key, value]) => {
          content = content.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        });
        
        const result = await sendSmartMessage(workflow.user_id, {
          recipientPhone: patient.phone,
          content: content,
          templateId: actionType === 'send_kakao' ? templateId : undefined,
          templateArgs: actionType === 'send_kakao' && templateId ? variables : undefined,
          fallbackMessage: content
        }, {
          patientId: patient.id,
          templateId: workflow.id,
          campaignId: undefined
        });

        if (result.success) {
          // Log execution metadata update
           // ... (existing metadata update logic)
          const { data: latestLog } = await supabase
            .from('message_logs')
            .select('id')
            .eq('patient_id', patient.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
          if (latestLog) {
            await supabase.from('message_logs').update({
              metadata: {
                workflow_id: workflow.id,
                node_id: action.node.id,
                appointment_id: appointment.id,
                days_passed: context.daysPassed,
                execution_id: executionId // Link to execution
              }
            }).eq('id', latestLog.id);
          }
          executedCount++;
          logMessages.push(`Executed node ${action.node.id}`);
        } else {
          hasErrors = true;
          logMessages.push(`Failed node ${action.node.id}: ${result.error}`);
        }
      } else if (actionType === 'medication_reminder') {
        const medication = action.node.data.medication;
        if (!medication) {
          hasErrors = true;
          logMessages.push(`Medication reminder node ${action.node.id} missing medication config`);
          continue;
        }

        // Calculate start date (appointment date or today)
        const startDate = appointment.appointment_date 
          ? new Date(appointment.appointment_date) 
          : new Date();
        startDate.setHours(0, 0, 0, 0);

        // Schedule reminders for each day in duration
        const scheduledCount = await scheduleMedicationReminders(
          workflow,
          patient,
          appointment,
          medication,
          startDate,
          context.daysPassed,
          action.node.id,
          executionId
        );

        executedCount++;
        logMessages.push(`Scheduled ${scheduledCount} medication reminders for ${medication.name}`);
      }
    }
  }

  // Update Execution Status
  if (executionId) {
    await supabase
      .from('workflow_executions')
      .update({
        status: hasErrors ? 'failed' : 'completed',
        completed_at: new Date().toISOString(),
        steps_completed: executedCount,
        error_message: hasErrors ? logMessages.join(', ') : null,
        execution_data: {
          log: logMessages
        }
      })
      .eq('id', executionId);
  }

  return { 
    executed: executedCount > 0, 
    log: logMessages.join(', ') 
  };
}

/**
 * Helper: Calculate when each node should be executed relative to the start
 * Returns a list of { node, day }
 */
async function calculateExecutionPlan(
  nodes: GraphNode[], 
  edges: GraphEdge[],
  patient: Patient,
  appointment: Appointment,
  context?: { daysPassed?: number }
) {
  const plan: { node: GraphNode, day: number }[] = [];
  const startNode = nodes.find(n => n.type === 'trigger');
  if (!startNode) return [];

  // Queue for BFS: { nodeId, currentDelay }
  const queue: { nodeId: string, currentDelay: number }[] = [
    { nodeId: startNode.id, currentDelay: 0 }
  ];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const { nodeId, currentDelay } = queue.shift()!;
    if (visited.has(nodeId + '-' + currentDelay)) continue;
    visited.add(nodeId + '-' + currentDelay);

    const node = nodes.find(n => n.id === nodeId);
    if (!node) continue;

    // Calculate delay added by THIS node
    let addedDelay = 0;
    if (node.type === 'delay') {
      const { delay } = node.data;
      if (delay) {
        // For days and business_days, add to day count
        // For minutes/hours, we can't convert to days accurately in planning phase
        // They will be handled by the queue system with precise timing
        if (delay.type === 'days' || delay.type === 'business_days') {
          addedDelay = parseInt(delay.value) || 0;
        }
        // Note: minutes/hours delays are handled by queue scheduling, not day-based planning
        // They will execute at the precise time via scheduled_for timestamp
      }
    }

    const nextDelay = currentDelay + addedDelay;

    // If it's an action, add to plan
    if (node.type === 'action') {
      plan.push({ node, day: nextDelay });
    }

    // Handle Time Window Logic (Skip if outside window)
    if (node.type === 'time_window') {
      const { startTime = "09:00", endTime = "18:00" } = node.data.timeWindow || {};
      const now = new Date();
      // Simple string comparison for HH:mm works in local time
      const currentHHmm = now.toTimeString().slice(0, 5);
      
      // If outside window, we conceptually "add delay" to push to next morning
      // But for daily cron (running at 10 AM), we just check if 10 AM is in range.
      // If Cron runs at 10:00, it's usually inside 09:00~18:00.
      // This logic is more relevant for Real-time triggers.
      // For Day-based Logic: Pass through.
    }

    // Find next nodes
    let outgoingEdges = edges.filter(e => e.source === nodeId);

    // Handle Condition Logic
    if (node.type === 'condition') {
      try {
        // Build context variables for condition evaluation
        const conditionVariables: Record<string, string> = {
          patient_name: patient.name || '',
          patient_gender: patient.gender || '',
          surgery_type: appointment.surgery_type || '',
          patient_age: String(calculateAge(patient.birth_date)),
        };
        
        // Add daysPassed if context is available
        if (context?.daysPassed !== undefined) {
          conditionVariables.days_passed = String(context.daysPassed);
        }

        // Evaluate condition (evaluateCondition is synchronous)
        const conditionObj = node.data.condition || node.data;
        if (conditionObj && typeof conditionObj === 'object' && 'variable' in conditionObj) {
          const conditionResult = evaluateCondition(conditionObj, conditionVariables);

          // Filter edges based on handle ID ('true' or 'false')
          outgoingEdges = outgoingEdges.filter(e => 
            e.sourceHandle === (conditionResult ? 'true' : 'false')
          );
        } else {
          console.warn(`Invalid condition object for node ${node.id}`);
          outgoingEdges = [];
        }
      } catch (error) {
        console.error(`Condition evaluation failed for node ${node.id}:`, error);
        // On error, skip this branch (conservative approach)
        outgoingEdges = [];
      }
    }

    for (const edge of outgoingEdges) {
      queue.push({ nodeId: edge.target, currentDelay: nextDelay });
    }
  }

  return plan;
}

/**
 * Schedule medication reminders for a patient
 * Creates scheduled reminder entries for each time slot over the duration
 */
async function scheduleMedicationReminders(
  workflow: Workflow,
  patient: Patient,
  appointment: Appointment,
  medication: {
    name: string;
    frequency: string;
    times: string[];
    duration: number;
    instructions: string;
  },
  startDate: Date,
  daysPassed: number,
  nodeId: string,
  executionId?: string
): Promise<number> {
  let scheduledCount = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build reminder message
  const variables: Record<string, string> = {
    patient_name: patient.name || '',
    medication_name: medication.name,
    medication_frequency: medication.frequency,
    medication_instructions: medication.instructions,
  };

  let messageTemplate = `안녕하세요 {{patient_name}}님,\n\n복약 시간입니다.\n\n약물: {{medication_name}}\n복용 횟수: {{medication_frequency}}\n복용 방법: {{medication_instructions}}\n\n건강한 회복을 응원합니다.`;
  
  // Replace variables
  Object.entries(variables).forEach(([key, value]) => {
    messageTemplate = messageTemplate.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  });

  // Schedule reminders for each day in duration
  for (let day = 0; day < medication.duration; day++) {
    const reminderDate = new Date(startDate);
    reminderDate.setDate(reminderDate.getDate() + day);
    reminderDate.setHours(0, 0, 0, 0);

    // Only schedule future reminders or today's reminders
    if (reminderDate < today) continue;

    // Schedule for each time slot
    for (const time of medication.times) {
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledTime = new Date(reminderDate);
      scheduledTime.setHours(hours, minutes, 0, 0);

      // Skip if the time has already passed today
      if (day === 0 && scheduledTime < new Date()) {
        continue;
      }

      // Create scheduled reminder entry in database
      // For now, we'll send immediately if it's time, or schedule for later
      // In a production system, you'd want a proper job queue (e.g., Bull, Agenda)
      try {
        // Check if reminder already sent for this time slot
        const reminderKey = `medication_${medication.name}_${reminderDate.toISOString().split('T')[0]}_${time}`;
        
        const { data: existingLog } = await supabase
          .from('message_logs')
          .select('id')
          .eq('patient_id', patient.id)
          .contains('metadata', {
            workflow_id: workflow.id,
            node_id: nodeId,
            appointment_id: appointment.id,
            reminder_key: reminderKey
          })
          .single();

        if (existingLog) {
          continue; // Already scheduled/sent
        }

        // If it's time to send now, send immediately
        if (scheduledTime <= new Date()) {
          const result = await sendSmartMessage(workflow.user_id, {
            recipientPhone: patient.phone,
            content: messageTemplate,
            templateId: undefined,
            templateArgs: undefined,
            fallbackMessage: messageTemplate
          }, {
            patientId: patient.id,
            templateId: workflow.id,
            campaignId: undefined
          });

          if (result.success) {
            // Log the reminder
            const { data: logData } = await supabase
              .from('message_logs')
              .select('id')
              .eq('patient_id', patient.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            if (logData) {
              await supabase.from('message_logs').update({
                metadata: {
                  workflow_id: workflow.id,
                  node_id: nodeId,
                  appointment_id: appointment.id,
                  execution_id: executionId,
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
          // Schedule for future - store in a scheduled_reminders table or similar
          // For now, we'll create a placeholder that can be picked up by a cron job
          // In production, use a proper job scheduler
          await supabase.from('message_logs').insert({
            patient_id: patient.id,
            user_id: workflow.user_id,
            content: messageTemplate,
            status: 'scheduled',
            scheduled_at: scheduledTime.toISOString(),
            metadata: {
              workflow_id: workflow.id,
              node_id: nodeId,
              appointment_id: appointment.id,
              execution_id: executionId,
              reminder_key: reminderKey,
              medication_name: medication.name,
              scheduled_time: scheduledTime.toISOString(),
              reminder_type: 'medication'
            }
          });
          scheduledCount++;
        }
      } catch (error: any) {
        console.error(`Failed to schedule medication reminder: ${error.message}`);
      }
    }
  }

  return scheduledCount;
}

