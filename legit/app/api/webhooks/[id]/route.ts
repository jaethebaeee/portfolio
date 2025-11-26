import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getWebhook,
  deleteWebhook,
  toggleWebhook,
  verifyWebhookSignature,
} from '@/lib/webhook';
import { executeTemplate, TemplateVariableContext } from '@/lib/template-engine';
import { getActiveTemplates } from '@/lib/template-scheduler';
import { getPatient } from '@/lib/patients';
import { MarketingTemplate } from '@/lib/template-types';
import { workflowQueue } from '@/lib/workflow-queue';
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';
import { createServerClient } from '@/lib/supabase';

/**
 * GET /api/webhooks/[id] - 웹훅 조회
 */
export async function GET(
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
    const webhook = await getWebhook(userId, id);

    if (!webhook) {
      return NextResponse.json(
        { error: '웹훅을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 시크릿 키는 반환하지 않음
    const { secret, ...safeWebhook } = webhook;
    return NextResponse.json({ webhook: safeWebhook });
  } catch (error: any) {
    console.error('웹훅 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/webhooks/[id] - 웹훅 트리거 (외부에서 호출)
 * 시크릿 키 검증 없이도 호출 가능 (선택사항)
 * Rate limiting applied to prevent abuse
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: Rate limiting to prevent abuse
    const rateLimitResult = await rateLimit({
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10, // 10 requests per minute per webhook
      message: 'Too many webhook requests. Please try again later.',
    })(request);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: rateLimitResult.message || 'Too many requests',
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        }
      );
    }

    const { id } = await params;
    const payload = await request.json();
    
    // 웹훅 조회 (user_id 없이도 조회 가능하도록 수정 필요)
    // 실제로는 웹훅 ID만으로 조회해야 함
    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const { data: webhook, error: webhookError } = await supabase
      .from('webhooks')
      .select('*')
      .eq('id', id)
      .eq('enabled', true)
      .single();

    if (webhookError || !webhook) {
      return NextResponse.json(
        { error: '웹훅을 찾을 수 없거나 비활성화되어 있습니다.' },
        { status: 404 }
      );
    }

    // 시크릿 키 검증 (선택사항)
    const signature = request.headers.get('x-webhook-signature');
    if (signature) {
      const body = JSON.stringify(payload);
      const isValid = verifyWebhookSignature(body, signature, webhook.secret);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // 웹훅 실행 이력 기록 시작
    const startTime = Date.now();
    const { data: execution } = await supabase
      .from('webhook_executions')
      .insert({
        user_id: webhook.user_id,
        webhook_id: webhook.id,
        status: 'running',
        payload,
      })
      .select()
      .single();

    try {
      // 1. Try to trigger a Visual Workflow first
      const { data: workflow } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', webhook.workflow_id)
        .single();

      if (workflow) {
        // OPTIMIZATION: Use static import instead of dynamic import
        // workflowQueue is already imported at top of file
        
        // Queue the workflow execution
        // We treat the webhook payload as "patient" or "appointment" data if possible,
        // or just pass it as custom context.
        
        // Mock Patient/Appointment for now if not provided in payload
        // In a real scenario, we might need to find/create a patient based on payload data
        const patientId = payload.patient_id || payload.patient?.id;
        const appointmentId = payload.appointment_id || payload.appointment?.id;

        if (!patientId) {
           // For generic webhooks without patient context, we might need a different execution mode
           // or create a dummy context. For now, we log warning.
           console.warn('Webhook triggered workflow but no patient_id provided in payload');
        }

        if (patientId) {
            // Fetch required entities to enqueue
            const { data: patient } = await supabase.from('patients').select('*').eq('id', patientId).single();
            const { data: appointment } = appointmentId 
                ? await supabase.from('appointments').select('*').eq('id', appointmentId).single()
                : { data: { id: 'webhook-triggered', surgery_type: 'webhook', status: 'scheduled', appointment_date: new Date().toISOString() } }; // Dummy appointment if missing

            if (patient) {
                const jobId = await workflowQueue.enqueue(
                    workflow,
                    patient,
                    appointment as any, // Cast as appointment might be dummy
                    {
                        daysPassed: 0, // Webhook usually starts at day 0
                        triggerType: 'webhook',
                        customData: payload // Pass full payload
                    },
                    {
                        tags: ['webhook', webhook.id]
                    }
                );

                const executionTime = Date.now() - startTime;
                await supabase
                    .from('webhook_executions')
                    .update({
                        status: 'completed',
                        response: { jobId, message: 'Workflow queued' },
                        execution_time_ms: executionTime,
                        completed_at: new Date().toISOString(),
                    })
                    .eq('id', execution.id);

                return NextResponse.json({ success: true, jobId, message: 'Workflow queued successfully' });
            }
        }
      }

      // 2. Fallback to Legacy Template System (if not a Visual Workflow)
      if (webhook.workflow_id) {
        // 템플릿 실행
        const templates = await getActiveTemplates(webhook.user_id);
        const template = templates.find((t: MarketingTemplate) => t.id === webhook.workflow_id);
        
        if (template) {
          const context: TemplateVariableContext = {
            patient: payload.patient_id
              ? await getPatient(webhook.user_id, payload.patient_id)
              : undefined,
            appointment: payload.appointment_id
              ? await (async () => {
                  const { data } = await supabase
                    .from('appointments')
                    .select('*')
                    .eq('id', payload.appointment_id)
                    .single();
                  return data;
                })()
              : undefined,
            customVariables: payload.variables,
          };

          const result = await executeTemplate(
            webhook.user_id,
            template,
            context,
            payload.patient_id
          );

          const executionTime = Date.now() - startTime;

          // 실행 이력 업데이트
          await supabase
            .from('webhook_executions')
            .update({
              status: result.success ? 'completed' : 'failed',
              response: result,
              execution_time_ms: executionTime,
              completed_at: new Date().toISOString(),
            })
            .eq('id', execution.id);

          return NextResponse.json({
            success: result.success,
            sentCount: result.sentCount,
            failedCount: result.failedCount,
            errors: result.errors,
          });
        }
      }

      // 워크플로우가 없으면 성공 응답만 반환
      const executionTime = Date.now() - startTime;
      await supabase
        .from('webhook_executions')
        .update({
          status: 'completed',
          response: { message: 'Webhook received' },
          execution_time_ms: executionTime,
          completed_at: new Date().toISOString(),
        })
        .eq('id', execution.id);

      return NextResponse.json({ success: true, message: 'Webhook received' });
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      await supabase
        .from('webhook_executions')
        .update({
          status: 'failed',
          error_message: error.message,
          execution_time_ms: executionTime,
          completed_at: new Date().toISOString(),
        })
        .eq('id', execution.id);

      throw error;
    }
  } catch (error: any) {
    console.error('웹훅 실행 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/webhooks/[id] - 웹훅 업데이트 (활성화/비활성화)
 */
export async function PATCH(
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
    
    if (body.enabled !== undefined) {
      const webhook = await toggleWebhook(userId, id, body.enabled);
      return NextResponse.json({ webhook });
    }

    return NextResponse.json(
      { error: '업데이트할 필드가 없습니다.' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('웹훅 업데이트 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/webhooks/[id] - 웹훅 삭제
 */
export async function DELETE(
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
    await deleteWebhook(userId, id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('웹훅 삭제 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

