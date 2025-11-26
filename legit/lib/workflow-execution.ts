/**
 * Workflow Execution Engine
 * Daily logic to trigger "Happy Call" workflows based on patient's surgery date
 */

import { createServerClient } from './supabase';
import { Workflow, Appointment, Patient } from './database.types';
import { sendSmartMessage } from './smart-messaging';
import { executeVisualWorkflow } from './visual-workflow-engine';

export async function executeDailyWorkflows(userId: string) {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  // 1. Get active workflows for this user
  const { data: workflows, error: wfError } = await supabase
    .from('workflows')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .eq('trigger_type', 'post_surgery');

  if (wfError || !workflows) throw new Error('Failed to fetch workflows');

  let executionCount = 0;
  const logs: string[] = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const workflow of workflows) {
    // Check if it's a Visual Workflow or Legacy Linear Workflow
    const isVisual = workflow.visual_data && (workflow.visual_data as any).nodes && (workflow.visual_data as any).nodes.length > 0;

    // Fetch appointments
    // Logic: Fetch all completed appointments for this user and filter in memory
    // (Better: query based on date range, but range depends on max delay in workflow)
    let query = supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (workflow.target_surgery_type) {
      query = query.eq('surgery_type', workflow.target_surgery_type);
    }

    // PERFORMANCE FIX: Calculate date range based on workflow's max delay
    // This ensures workflows with longer delays (e.g., 6 months) still execute correctly
    let maxDelayDays = 30; // Default fallback
    
    if (isVisual && workflow.visual_data) {
      // Calculate max delay from visual workflow nodes
      const visualData = workflow.visual_data as any;
      if (visualData.nodes && Array.isArray(visualData.nodes)) {
        const delayNodes = visualData.nodes.filter((n: any) => n.type === 'delay');
        if (delayNodes.length > 0) {
          maxDelayDays = Math.max(
            ...delayNodes.map((n: any) => {
              const delay = n.data?.delay;
              if (!delay) return 0;
              
              // Convert different delay types to days
              if (delay.type === 'days' || delay.type === 'business_days') {
                return delay.value || 0;
              } else if (delay.type === 'hours') {
                return Math.ceil((delay.value || 0) / 24);
              } else if (delay.type === 'minutes') {
                return Math.ceil((delay.value || 0) / (24 * 60));
              }
              return 0;
            })
          );
        }
      }
    } else if (workflow.steps && Array.isArray(workflow.steps)) {
      // Calculate max delay from linear workflow steps
      maxDelayDays = Math.max(...workflow.steps.map(s => s.day || 0));
    }
    
    // Add buffer (7 days) for safety and ensure minimum of 30 days
    const bufferDays = 7;
    const calculatedDays = maxDelayDays + bufferDays;
    const dateRangeDays = Math.max(calculatedDays, 30);
    
    const dateFrom = new Date(today);
    dateFrom.setDate(today.getDate() - dateRangeDays);
    
    query = query.gte('appointment_date', dateFrom.toISOString().split('T')[0]);

    const { data: appointments, error: appError } = await query;
    if (appError || !appointments) continue;

    // PERFORMANCE FIX: Batch query to check existing logs (avoid N+1 problem)
    const patientIds = appointments
      .map(appt => appt.patient?.id)
      .filter((id): id is string => !!id);
    
    const appointmentIds = appointments.map(appt => appt.id);

    // Fetch all existing logs for these patients/workflow in one query
    let executedSet = new Set<string>();
    if (patientIds.length > 0) {
      const { data: existingLogs } = await supabase
        .from('message_logs')
        .select('patient_id, metadata')
        .in('patient_id', patientIds)
        .contains('metadata', { workflow_id: workflow.id });

      // Create lookup set: "patientId-appointmentId-stepIndex"
      executedSet = new Set(
        existingLogs
          ?.filter(log => {
            const meta = log.metadata as any;
            return meta?.workflow_id === workflow.id && 
                   appointmentIds.includes(meta?.appointment_id);
          })
          .map(log => {
            const meta = log.metadata as any;
            return `${log.patient_id}-${meta?.appointment_id}-${meta?.step_index}`;
          }) || []
      );
    }

    // Collect log IDs for batch metadata update
    const logsToUpdate: Array<{ logId: string; metadata: any }> = [];

    for (const appt of appointments) {
      if (!appt.patient) continue;
      
      const apptDate = new Date(appt.appointment_date);
      apptDate.setHours(0,0,0,0);
      
      const diffTime = Math.abs(today.getTime() - apptDate.getTime());
      const daysPassed = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      const patient = appt.patient as unknown as Patient;

      if (isVisual) {
        // New Visual Engine
        const result = await executeVisualWorkflow(workflow, patient, appt, { daysPassed });
        if (result.executed) {
          executionCount++;
          logs.push(`Visual Workflow: ${result.log}`);
        }
      } else {
        // Legacy Linear Logic
        if (!workflow.steps || workflow.steps.length === 0) continue;

        const stepIndex = workflow.steps.findIndex(s => s.day === daysPassed);
        if (stepIndex === -1) continue;

        const step = workflow.steps[stepIndex];
        
        // PERFORMANCE FIX: Check in memory instead of querying database
        const executionKey = `${patient.id}-${appt.id}-${stepIndex}`;
        if (executedSet.has(executionKey)) {
          logs.push(`Skipped: ${patient.name} (Step ${step.day} already sent)`);
          continue;
        }

        // Create Execution Log
        let executionId: string | null = null;
        try {
          const { data: execData } = await supabase
            .from('workflow_executions')
            .insert({
              user_id: userId,
              workflow_id: workflow.id,
              patient_id: patient.id,
              trigger_type: 'schedule',
              status: 'running',
              current_step_index: stepIndex,
              total_steps: workflow.steps.length,
              execution_data: {
                days_passed: daysPassed,
                step_day: step.day
              }
            })
            .select('id')
            .single();
          if (execData) executionId = execData.id;
        } catch (e) {
          console.error('Failed to create execution log', e);
        }

        // Execute Action
        let content = step.message_template || "안녕하세요, 수술 후 상태 확인차 연락드립니다.";
        content = content.replace('{{patient_name}}', patient.name);
        
        if (step.type === 'survey') {
          content += `\n\n[상태 체크하기]\nhttps://doctorsflow.com/check/${workflow.id}/${patient.id}/${stepIndex}`;
        } else if (step.type === 'photo') {
          content += `\n\n[사진 업로드하기]\nhttps://doctorsflow.com/upload/${workflow.id}/${patient.id}/${stepIndex}`;
        }

        const result = await sendSmartMessage(userId, {
          recipientPhone: patient.phone,
          content: content
        }, {
          patientId: patient.id,
          templateId: workflow.id, 
        });

        if (result.success) {
          // PERFORMANCE FIX: Collect log ID for batch update instead of immediate query
          // We'll fetch the latest log ID after all messages are sent
          const { data: latestLog } = await supabase
            .from('message_logs')
            .select('id')
            .eq('patient_id', patient.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
          if (latestLog) {
            logsToUpdate.push({
              logId: latestLog.id,
              metadata: {
                workflow_id: workflow.id,
                step_index: stepIndex,
                appointment_id: appt.id,
                days_passed: daysPassed,
                execution_id: executionId
              }
            });
          }
          
          executionCount++;
          logs.push(`Executed: ${patient.name} (Step ${step.day})`);

          // Update Execution Log Success
          if (executionId) {
            await supabase.from('workflow_executions').update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              steps_completed: 1
            }).eq('id', executionId);
          }
        } else {
          const errorMessage = result.error || 'Unknown error';
          logs.push(`Failed: ${patient.name} (${errorMessage})`);

          // Update Execution Log Failure with error classification
          if (executionId) {
            const { WorkflowErrorHandler } = await import('./workflow-error-handler');
            const errorCategory = WorkflowErrorHandler.classifyError(errorMessage);
            const severity = WorkflowErrorHandler.getSeverity(errorMessage);
            
            await supabase.from('workflow_executions').update({
              status: 'failed',
              completed_at: new Date().toISOString(),
              error_message: errorMessage,
              execution_data: {
                ...executionData,
                error_category: errorCategory,
                error_severity: severity,
                failed_at: new Date().toISOString()
              }
            }).eq('id', executionId);
          }
        }
      }
    }

    // PERFORMANCE FIX: Batch update metadata for all logs at once
    if (logsToUpdate.length > 0) {
      // Update logs in parallel (Supabase doesn't support batch update, so we use Promise.all)
      await Promise.all(
        logsToUpdate.map(({ logId, metadata }) =>
          supabase.from('message_logs').update({ metadata }).eq('id', logId)
        )
      );
    }
  }

  return { executionCount, logs };
}
