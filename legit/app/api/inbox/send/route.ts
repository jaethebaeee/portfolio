import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { sendSmartMessage } from '@/lib/smart-messaging';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId, content } = await req.json();

    if (!conversationId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServerClient();

    // 1. Get Conversation & Patient Details
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*, patient:patients(*)')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    if (convError || !conversation || !conversation.patient) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // 2. Send Message via Smart Messaging (Kakao -> SMS Fallback)
    const result = await sendSmartMessage(userId, {
        recipientPhone: conversation.patient.phone,
        content: content,
        fallbackMessage: content // Use same content for fallback
    }, {
        patientId: conversation.patient.id,
        // No template/campaign ID for manual chat
        metadata: {
            source: 'inbox_manual_reply',
            conversation_id: conversationId
        }
    });

    // 3. Log result to messages table (This might be redundant if we want to rely on the client's optimistic update, 
    // but better to have server confirmation. However, the client already inserted a 'pending' message.
    // We should return the result so the client can update the status.)
    
    // Note: sendSmartMessage already logs to `message_logs`.
    // We need to ensure `messages` table is also updated or we duplicate.
    // Ideally, we unify, but for now, let's update the specific `messages` row if we passed an ID, 
    // or insert a new one if we didn't.
    
    // Since the client generated a temp ID, we can't update that one easily unless we pass it.
    // Better strategy: The API inserts the authoritative message record.
    
    const { data: newMessage, error: msgError } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        user_id: userId,
        direction: 'outbound',
        channel: result.channel,
        content: content,
        status: result.success ? 'sent' : 'failed'
    }).select().single();

    if (msgError) throw msgError;

    // Update conversation timestamp
    await supabase.from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

    return NextResponse.json({ 
        success: result.success, 
        message: newMessage,
        providerResult: result 
    });

  } catch (error: any) {
    console.error('Inbox Send Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

