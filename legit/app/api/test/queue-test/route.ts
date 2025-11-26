/**
 * Queue Test Endpoint
 * 
 * Creates a test workflow with a 1-minute delay to verify the queue system works.
 * 
 * Usage:
 * POST /api/test/queue-test
 * Body: { patientId: string, appointmentId: string }
 * 
 * This will:
 * 1. Create a simple test workflow
 * 2. Schedule it with 1-minute delay
 * 3. Return the job ID to track
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { WorkflowQueue } from '@/lib/workflow-queue';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { patientId, appointmentId } = body;

    if (!patientId || !appointmentId) {
      return NextResponse.json(
        { success: false, error: 'patientId와 appointmentId가 필요합니다.' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: '데이터베이스 연결 실패' },
        { status: 500 }
      );
    }

    // Get patient and appointment
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .eq('user_id', userId)
      .single();

    if (patientError || !patient) {
      return NextResponse.json(
        { success: false, error: '환자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .eq('user_id', userId)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { success: false, error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Create a simple test workflow
    const testWorkflow = {
      id: `test_${Date.now()}`,
      user_id: userId,
      name: 'Queue Test Workflow (1분 지연)',
      description: '큐 시스템 테스트용 워크플로우',
      enabled: true,
      visual_data: {
        nodes: [
          {
            id: 'trigger-1',
            type: 'trigger',
            position: { x: 100, y: 100 },
            data: {
              trigger: {
                type: 'appointment_completed',
              },
            },
          },
          {
            id: 'delay-1',
            type: 'delay',
            position: { x: 300, y: 100 },
            data: {
              delay: {
                type: 'minutes',
                value: '1', // 1 minute delay
              },
            },
          },
          {
            id: 'action-1',
            type: 'action',
            position: { x: 500, y: 100 },
            data: {
              action: {
                type: 'send_message',
                channel: 'sms',
                content: '큐 테스트 메시지입니다. 1분 후 발송되었습니다.',
              },
            },
          },
        ],
        edges: [
          { id: 'e1', source: 'trigger-1', target: 'delay-1' },
          { id: 'e2', source: 'delay-1', target: 'action-1' },
        ],
      },
    };

    // Insert workflow
    const { data: createdWorkflow, error: workflowError } = await supabase
      .from('workflows')
      .insert({
        user_id: userId,
        name: testWorkflow.name,
        description: testWorkflow.description,
        enabled: true,
        visual_data: testWorkflow.visual_data,
      })
      .select()
      .single();

    if (workflowError || !createdWorkflow) {
      return NextResponse.json(
        { success: false, error: '워크플로우 생성 실패: ' + workflowError?.message },
        { status: 500 }
      );
    }

    // Schedule workflow execution with 1-minute delay
    const workflowQueue = WorkflowQueue.getInstance();
    const delayMs = 60 * 1000; // 1 minute in milliseconds
    const scheduledFor = Date.now() + delayMs;

    const jobId = await workflowQueue.enqueue(
      createdWorkflow as any,
      patient as any,
      appointment as any,
      {
        daysPassed: 0,
        triggerType: 'appointment_completed',
      },
      {
        delay: delayMs,
        scheduledFor: scheduledFor,
        tags: ['test', 'queue-test'],
      }
    );

    const executionDate = new Date(scheduledFor);

    return NextResponse.json({
      success: true,
      message: '테스트 워크플로우가 생성되었습니다. 1분 후 실행됩니다.',
      workflowId: createdWorkflow.id,
      jobId: jobId,
      scheduledFor: executionDate.toISOString(),
      scheduledForKST: executionDate.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      instructions: [
        '1. 1분 후 cron job이 이 워크플로우를 실행합니다.',
        '2. /api/cron/process-delayed-jobs 엔드포인트가 매 분마다 호출됩니다.',
        '3. workflow_jobs 테이블에서 job 상태를 확인할 수 있습니다.',
        '4. workflow_executions 테이블에서 실행 결과를 확인할 수 있습니다.',
      ],
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    console.error('Queue test error:', error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

