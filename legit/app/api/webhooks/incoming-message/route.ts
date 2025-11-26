import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { ParallelWorkflowEngine } from '@/lib/workflow-engine-parallel';
import { validateKoreanPhoneNumber } from '@/lib/phone-validation';
import crypto from 'crypto';

/**
 * POST /api/webhooks/incoming-message
 * Handles incoming messages (Kakao/SMS) and triggers workflows based on keywords
 * 
 * SECURITY: Requires webhook signature verification via HMAC-SHA256
 * Set INCOMING_MESSAGE_WEBHOOK_SECRET environment variable
 */
export async function POST(req: NextRequest) {
  try {
    // SECURITY: Verify webhook signature
    const webhookSecret = process.env.INCOMING_MESSAGE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('[Security] INCOMING_MESSAGE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Get raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get('x-webhook-signature') || req.headers.get('x-signature');
    
    if (!signature) {
      // In development, allow requests without signature for testing
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Security] Missing webhook signature in development mode - allowing request');
      } else {
        return NextResponse.json(
          { error: 'Missing webhook signature' },
          { status: 401 }
        );
      }
    } else {
      // Verify signature using HMAC-SHA256
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');
      
      // Use constant-time comparison to prevent timing attacks
      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
      
      if (!isValid) {
        console.warn('[Security] Invalid webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // Parse payload after verification
    const payload = JSON.parse(body);
    
    // Normalize phone number
    const phoneVal = validateKoreanPhoneNumber(payload.sender || payload.phone);
    if (!phoneVal.isValid) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }
    const senderPhone = phoneVal.formatted;
    const messageContent = (payload.content || payload.message || '').trim();

    if (!messageContent) {
        return NextResponse.json({ message: 'Empty content, ignoring' });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Incoming Message] From: ${senderPhone}, Content: "${messageContent}"`);
    }

    const supabase = createServerClient();

    // 2. Find Patient
    // We need to find which user (clinic) this patient belongs to.
    // Since a patient might belong to multiple clinics (rare but possible), 
    // we might need to broadcast or find the most recent interaction.
    // For MVP, we assume unique phone per clinic OR we broadcast to all matching clinics.
    // Actually, this webhook likely comes to a specific "AppKey" or "SenderKey" which maps to a Clinic User.
    // BUT, NHN Cloud usually sends webhooks to a single URL configured for the App.
    // If we are a SaaS, we should have a way to identify the tenant.
    // Assuming the webhook URL might be /api/webhooks/incoming-message?appKey=... or similar.
    // Or we search for the patient across all users (inefficient but works for MVP).
    
    // Better approach: Find patient by phone number.
    const { data: patients, error: patientError } = await supabase
      .from('patients')
      .select('id, user_id, name, phone')
      .eq('phone', senderPhone);

    if (patientError || !patients || patients.length === 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Patient not found for incoming message');
        }
        return NextResponse.json({ message: 'Patient not found' });
    }

    // 2.5 Store in Inbox (Conversations & Messages)
    for (const patient of patients) {
        // Find or create conversation
        let { data: conversation } = await supabase
            .from('conversations')
            .select('id')
            .eq('user_id', patient.user_id)
            .eq('patient_id', patient.id)
            .single();

        if (!conversation) {
            const { data: newConv } = await supabase
                .from('conversations')
                .insert({
                    user_id: patient.user_id,
                    patient_id: patient.id,
                    status: 'open',
                    last_message_at: new Date().toISOString()
                })
                .select('id')
                .single();
            conversation = newConv;
        } else {
             await supabase
                .from('conversations')
                .update({ last_message_at: new Date().toISOString(), status: 'open' })
                .eq('id', conversation.id);
        }

        if (conversation) {
            await supabase.from('messages').insert({
                conversation_id: conversation.id,
                user_id: patient.user_id,
                direction: 'inbound',
                channel: 'kakao', // Assume kakao for now, or derive from payload
                content: messageContent,
                status: 'received'
            });
        }
    }

    // 3. Find Active Workflows with Keyword Triggers for these users
    const engine = new ParallelWorkflowEngine();
    const results = [];

    for (const patient of patients) {
        // Fetch active workflows for this user
        const { data: workflows } = await supabase
            .from('workflows')
            .select('*')
            .eq('user_id', patient.user_id)
            .eq('is_active', true);

        if (!workflows) continue;

        // Filter for workflows with keyword triggers that match
        for (const workflow of workflows) {
            if (!workflow.visual_data) continue;
            
            const visualData = workflow.visual_data as any;
            const triggerNodes = visualData.nodes.filter((n: any) => 
                n.type === 'trigger' && n.data.triggerType === 'keyword_received'
            );

            for (const node of triggerNodes) {
                const config = node.data.keywordConfig;
                if (!config || !config.keywords) continue;

                const keywords = config.keywords as string[];
                const matchType = config.matchType || 'contains';
                
                let isMatch = false;
                if (matchType === 'exact') {
                    isMatch = keywords.some(k => k.trim() === messageContent);
                } else {
                    isMatch = keywords.some(k => messageContent.includes(k.trim()));
                }

                if (isMatch) {
                    if (process.env.NODE_ENV === 'development') {
                      console.log(`[Keyword Match] Workflow: ${workflow.name}, Keyword found in: "${messageContent}"`);
                    }
                    
                    // Create dummy appointment context
                    const mockAppointment = {
                        id: `keyword-${Date.now()}`,
                        patient_id: patient.id,
                        user_id: patient.user_id,
                        status: 'scheduled', // Dummy
                        appointment_date: new Date().toISOString(),
                        surgery_type: 'general',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };

                    try {
                        // Trigger Workflow
                        // Pass message content as variable
                        const result = await engine.executeWorkflow(
                            workflow,
                            patient,
                            mockAppointment,
                            { 
                                daysPassed: 0, 
                                triggerType: 'keyword_received' 
                            }
                        );
                        results.push({ 
                            workflowId: workflow.id, 
                            patientId: patient.id, 
                            success: result.executed 
                        });
                    } catch (e) {
                        if (process.env.NODE_ENV === 'development') {
                          console.error('Workflow execution failed:', e);
                        }
                    }
                }
            }
        }
    }

    return NextResponse.json({ 
        success: true, 
        processed: patients.length, 
        triggered: results.length,
        results 
    });

  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Incoming message handler error:', error);
    }
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

