/**
 * Workflow Trigger Utilities
 * Handles triggering workflows based on appointment status changes
 */

import { createServerClient } from './supabase';
import { Appointment, Patient, Workflow } from './database.types';
import { WorkflowQueue } from './workflow-queue';

const workflowQueue = new WorkflowQueue();

/**
 * Trigger workflows when appointment status changes
 */
export async function triggerWorkflowsForAppointment(
  userId: string,
  appointment: Appointment,
  oldStatus?: string
): Promise<void> {
  const supabase = createServerClient();
  if (!supabase) {
    console.error('Supabase client not available');
    return;
  }

  // Only trigger on status changes
  if (oldStatus === appointment.status) {
    return;
  }

  // Get patient data
  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('id', appointment.patient_id)
    .single();

  if (!patient) {
    console.error(`Patient not found: ${appointment.patient_id}`);
    return;
  }

  // Determine trigger type based on new status
  let triggerType: 'appointment_completed' | 'appointment_cancelled' | 'appointment_no_show' | null = null;

  if (appointment.status === 'completed') {
    triggerType = 'appointment_completed';
  } else if (appointment.status === 'cancelled') {
    triggerType = 'appointment_cancelled';
  } else if (appointment.status === 'no_show') {
    triggerType = 'appointment_no_show';
  }

  if (!triggerType) {
    return; // No workflow to trigger
  }

  // Find active workflows with matching trigger type
  const { data: workflows, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error || !workflows) {
    console.error('Failed to fetch workflows:', error);
    return;
  }

  // Filter workflows that have the matching trigger type
  // For cancellation workflows, also check if they match the cancellation reason
  const matchingWorkflows = workflows.filter((workflow: Workflow) => {
    if (!workflow.visual_data?.nodes) {
      return false; // Legacy workflows handled separately
    }

    // Check if workflow has a trigger node matching the trigger type
    const triggerNode = workflow.visual_data.nodes.find(
      (node: any) =>
        node.type === 'trigger' &&
        node.data?.triggerType === triggerType
    );

    if (!triggerNode) {
      return false;
    }

    // For cancellation workflows, check if workflow should be triggered based on cancellation reason
    if (triggerType === 'appointment_cancelled' && appointment.cancellation_reason_category) {
      // Check if workflow has a condition node that filters by cancellation reason
      const conditionNodes = workflow.visual_data.nodes.filter(
        (node: any) => node.type === 'condition'
      );

      // If workflow has cancellation reason conditions, check them
      for (const conditionNode of conditionNodes) {
        const condition = conditionNode.data?.condition;
        if (condition?.variable === 'cancellation_reason_category') {
          // Check if the cancellation reason matches the condition
          if (condition.operator === 'equals' && condition.value !== appointment.cancellation_reason_category) {
            return false; // Reason doesn't match, skip this workflow
          }
          if (condition.operator === 'not_equals' && condition.value === appointment.cancellation_reason_category) {
            return false; // Reason matches excluded value, skip this workflow
          }
        }
      }

      // Check workflow metadata for cancellation reason filters
      const workflowMetadata = (workflow as any).metadata;
      if (workflowMetadata?.cancellation_reason_filters) {
        const filters = workflowMetadata.cancellation_reason_filters;
        if (filters.include && !filters.include.includes(appointment.cancellation_reason_category)) {
          return false; // Not in include list
        }
        if (filters.exclude && filters.exclude.includes(appointment.cancellation_reason_category)) {
          return false; // In exclude list
        }
      }
    }

    return true;
  });

  // Queue each matching workflow
  for (const workflow of matchingWorkflows) {
    try {
      await workflowQueue.enqueue(
        workflow,
        patient,
        appointment,
        {
          daysPassed: 0,
          triggerType,
          appointmentStatus: appointment.status,
        },
        {
          tags: ['appointment_status_change', triggerType],
        }
      );
      console.log(`Queued workflow ${workflow.id} for trigger ${triggerType}`);
    } catch (error) {
      console.error(`Failed to queue workflow ${workflow.id}:`, error);
    }
  }
}

/**
 * Check for no-show appointments and trigger workflows
 * This should be called by a daily cron job
 */
export async function checkNoShowAppointments(userId: string): Promise<void> {
  const supabase = createServerClient();
  if (!supabase) {
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  // Find appointments that were scheduled for today but haven't been completed
  // and it's past the appointment time
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('*, patients(*)')
    .eq('user_id', userId)
    .eq('status', 'scheduled')
    .eq('appointment_date', todayStr)
    .lt('appointment_time', new Date().toTimeString().slice(0, 5)); // Past appointment time

  if (error || !appointments) {
    console.error('Failed to fetch no-show appointments:', error);
    return;
  }

  // Mark as no-show and trigger workflows
  for (const appointment of appointments) {
    try {
      // Update appointment status to no_show
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: 'no_show' })
        .eq('id', appointment.id);

      if (updateError) {
        console.error(`Failed to update appointment ${appointment.id}:`, updateError);
        continue;
      }

      // Trigger workflows
      await triggerWorkflowsForAppointment(
        userId,
        { ...appointment, status: 'no_show' },
        'scheduled'
      );
    } catch (error) {
      console.error(`Failed to process no-show appointment ${appointment.id}:`, error);
    }
  }
}

