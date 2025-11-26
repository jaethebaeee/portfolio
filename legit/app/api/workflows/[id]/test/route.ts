import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { ParallelWorkflowEngine } from '@/lib/workflow-engine-parallel';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    
    // Context data for testing (optional)
    const { patientId, appointmentId, daysPassed = 1, workflowData } = body;

    const supabase = createServerClient();
    if (!supabase) {
        throw new Error('Supabase client init failed');
    }

    // Fetch workflow
    let workflow;
    
    if (workflowData) {
        // Use provided workflow data (for unsaved changes)
        // We still fetch the original to get user_id and other metadata, but override visual_data
        const { data: original } = await supabase
            .from('workflows')
            .select('*')
            .eq('id', id)
            .single();
            
        if (original) {
            workflow = { ...original, visual_data: workflowData };
        } else {
            // Mock workflow if ID doesn't exist (new workflow case)
            workflow = {
                id: id,
                user_id: userId,
                name: 'Test Workflow',
                visual_data: workflowData
            };
        }
    } else {
        const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', id)
        .single();
        
        if (error || !data) {
            return NextResponse.json(
                { error: '워크플로우를 찾을 수 없습니다.' },
                { status: 404 }
            );
        }
        workflow = data;
    }

    // Fetch or create dummy patient/appointment context
    let patient;
    let appointment;

    if (patientId) {
        const { data } = await supabase.from('patients').select('*').eq('id', patientId).single();
        patient = data;
    } 
    
    if (!patient) {
        // Mock Patient
        patient = {
            id: 'test-patient-id',
            name: '테스트 환자',
            phone: '010-1234-5678',
            birth_date: '1990-01-01',
            gender: 'male',
            user_id: userId
        };
    }

    if (appointmentId) {
        const { data } = await supabase.from('appointments').select('*').eq('id', appointmentId).single();
        appointment = data;
    }

    if (!appointment) {
        // Mock Appointment
        appointment = {
            id: 'test-appointment-id',
            patient_id: patient.id,
            user_id: userId,
            appointment_date: new Date().toISOString(),
            status: 'scheduled',
            surgery_type: '라식'
        };
    }

    // Execute in Dry Run mode
    const engine = new ParallelWorkflowEngine();
    const result = await engine.executeWorkflow(
        workflow,
        patient,
        appointment,
        { daysPassed },
        { dryRun: true }
    );

    return NextResponse.json({
        success: true,
        executed: result.executed,
        log: result.log,
        results: result.results
    });

  } catch (error: any) {
    console.error('워크플로우 테스트 오류:', error);
    return NextResponse.json(
      { error: error.message || '테스트 실행 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

