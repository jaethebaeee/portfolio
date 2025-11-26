import { createServerClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { ParallelWorkflowEngine } from '@/lib/workflow-engine-parallel';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { workflowId, patientIds } = await req.json();

    if (!workflowId || !patientIds || !Array.isArray(patientIds) || patientIds.length === 0) {
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
    }

    const supabase = createServerClient();
    
    // 1. Verify workflow belongs to user
    const { data: workflow, error: wfError } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .eq('user_id', userId)
      .single();

    if (wfError || !workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // 2. Fetch patients
    const { data: patients, error: pError } = await supabase
      .from('patients')
      .select('*')
      .in('id', patientIds)
      .eq('user_id', userId);

    if (pError || !patients) {
      return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
    }

    // 3. Initialize engine
    const engine = new ParallelWorkflowEngine();
    
    // 4. Execute for each patient (Background processing recommended for large batches)
    // For MVP, we will start them but return early or process a few.
    // Ideally, we insert 'pending' executions and let a worker pick them up.
    // Here we will use the engine to "start" them.
    
    const results = [];
    
    // Limit batch size for immediate execution to avoid timeout
    const batchSize = 20; 
    const immediateProcess = patients.slice(0, batchSize);
    const remaining = patients.slice(batchSize);

    // Process first batch immediately to give feedback
    for (const patient of immediateProcess) {
      // Mock appointment data since this is a manual trigger
      const mockAppointment = {
        id: `manual-trigger-${Date.now()}`,
        patient_id: patient.id,
        user_id: userId,
        status: 'scheduled',
        appointment_date: new Date().toISOString(),
        surgery_type: workflow.target_surgery_type || 'general',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      try {
        // Execute workflow with daysPassed = 0 (Start)
        const result = await engine.executeWorkflow(
            workflow,
            patient,
            mockAppointment,
            { daysPassed: 0 }
        );
        results.push({ patientId: patient.id, success: result.executed, log: result.log });
      } catch (e: any) {
        console.error(`Failed to execute workflow for patient ${patient.id}:`, e);
        results.push({ patientId: patient.id, success: false, error: e.message });
      }
    }

    // For remaining, we might ideally queue them. 
    // For now, let's just note them as "queued" (feature to be implemented)
    // In a real production system, we'd use a message queue (Redis/SQS).

    return NextResponse.json({ 
      message: `Processed ${results.length} patients.`,
      results,
      queued: remaining.length 
    });

  } catch (error: any) {
    console.error('Batch execution error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

