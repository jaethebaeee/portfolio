import { NextRequest, NextResponse } from 'next/server';
import { sendKakaoMessage } from '@/lib/integrations/kakao';
import { sendSMSMessage } from '@/lib/integrations/sms';
import { sendEmailMessage } from '@/lib/integrations/email';

export interface SendMessageRequest {
  recipient: {
    phone: string;
    email?: string;
    name?: string;
  };
  message: {
    content: string;
    type: 'notification' | 'marketing' | 'reminder' | 'care_instructions';
    priority: 'low' | 'normal' | 'high';
  };
  channels: {
    kakao: boolean;
    sms: boolean;
    email: boolean;
  };
  fallback_order?: ('kakao' | 'sms' | 'email')[];
  metadata?: {
    patient_id?: string;
    appointment_id?: string;
    surgery_type?: string;
    template_id?: string;
  };
}

export interface SendMessageResponse {
  success: boolean;
  message_id?: string;
  channel_used?: 'kakao' | 'sms' | 'email';
  delivery_status?: 'sent' | 'queued' | 'failed';
  error?: string;
  fallback_used?: boolean;
  attempts?: {
    channel: 'kakao' | 'sms' | 'email';
    success: boolean;
    error?: string;
    timestamp: string;
  }[];
}

// Smart channel selection based on message type and Korean regulations
function getChannelPriority(messageType: string, fallbackOrder?: string[]): ('kakao' | 'sms' | 'email')[] {
  const defaultOrder: ('kakao' | 'sms' | 'email')[] = ['kakao', 'sms', 'email'];

  if (fallbackOrder && fallbackOrder.length > 0) {
    return fallbackOrder as ('kakao' | 'sms' | 'email')[];
  }

  // Korean medical regulations and best practices
  switch (messageType) {
    case 'notification':
    case 'reminder':
    case 'care_instructions':
      // AlimTalk is preferred for medical notifications (legal compliance)
      return ['kakao', 'sms', 'email'];

    case 'marketing':
      // FriendTalk or SMS for marketing (can't use AlimTalk for marketing)
      return ['sms', 'kakao', 'email'];

    default:
      return defaultOrder;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SendMessageRequest = await request.json();

    // Validate required fields
    if (!body.recipient?.phone && !body.recipient?.email) {
      return NextResponse.json({
        success: false,
        error: 'Recipient phone or email is required'
      } as SendMessageResponse, { status: 400 });
    }

    if (!body.message?.content) {
      return NextResponse.json({
        success: false,
        error: 'Message content is required'
      } as SendMessageResponse, { status: 400 });
    }

    const channelPriority = getChannelPriority(body.message.type, body.fallback_order);
    const attempts: SendMessageResponse['attempts'] = [];
    let success = false;
    let messageId: string | undefined;
    let channelUsed: 'kakao' | 'sms' | 'email' | undefined;
    let fallbackUsed = false;

    // Try channels in priority order
    for (const channel of channelPriority) {
      // Check if this channel is enabled
      if (!body.channels[channel]) {
        attempts.push({
          channel,
          success: false,
          error: 'Channel disabled',
          timestamp: new Date().toISOString()
        });
        continue;
      }

      try {
        let result;

        switch (channel) {
          case 'kakao':
            if (body.recipient.phone) {
              result = await sendKakaoMessage({
                phone: body.recipient.phone,
                name: body.recipient.name,
                content: body.message.content,
                type: body.message.type === 'marketing' ? 'friend' : 'alim',
                priority: body.message.priority,
                metadata: body.metadata
              });
            }
            break;

          case 'sms':
            if (body.recipient.phone) {
              result = await sendSMSMessage({
                phone: body.recipient.phone,
                name: body.recipient.name,
                content: body.message.content,
                type: body.message.type,
                priority: body.message.priority,
                metadata: body.metadata
              });
            }
            break;

          case 'email':
            if (body.recipient.email) {
              result = await sendEmailMessage({
                email: body.recipient.email,
                name: body.recipient.name,
                subject: getEmailSubject(body.message.type),
                content: body.message.content,
                type: body.message.type,
                priority: body.message.priority,
                metadata: body.metadata
              });
            }
            break;
        }

        if (result?.success) {
          success = true;
          messageId = result.messageId;
          channelUsed = channel;
          attempts.push({
            channel,
            success: true,
            timestamp: new Date().toISOString()
          });
          break; // Stop trying other channels
        } else {
          attempts.push({
            channel,
            success: false,
            error: result?.error || 'Unknown error',
            timestamp: new Date().toISOString()
          });

          // Mark fallback as used if we continue to next channel
          if (channelPriority.indexOf(channel) < channelPriority.length - 1) {
            fallbackUsed = true;
          }
        }

      } catch (error) {
        attempts.push({
          channel,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });

        if (channelPriority.indexOf(channel) < channelPriority.length - 1) {
          fallbackUsed = true;
        }
      }
    }

    // Log the message attempt for analytics
    if (success && process.env.NODE_ENV === 'development') {
      console.log(`Message sent successfully via ${channelUsed}`, {
        recipient: body.recipient.phone || body.recipient.email,
        channel: channelUsed,
        type: body.message.type,
        messageId,
        fallbackUsed
      });
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.error('All message channels failed', {
          recipient: body.recipient.phone || body.recipient.email,
          attempts
        });
      }
    }

    return NextResponse.json({
      success,
      message_id: messageId,
      channel_used: channelUsed,
      delivery_status: success ? 'sent' : 'failed',
      fallback_used: fallbackUsed,
      attempts
    } as SendMessageResponse);

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Send message error:', error);
    }
    return NextResponse.json({
      success: false,
      error: 'Failed to send message'
    } as SendMessageResponse, { status: 500 });
  }
}

function getEmailSubject(messageType: string): string {
  switch (messageType) {
    case 'notification':
      return '진료 안내';
    case 'reminder':
      return '진료 예약 알림';
    case 'care_instructions':
      return '케어 안내';
    case 'marketing':
      return '건강 정보';
    default:
      return '메시지';
  }
}
