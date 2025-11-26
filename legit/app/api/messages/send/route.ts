/**
 * Unified Message Sending API
 * 
 * Consolidates multiple message sending endpoints into one:
 * - Supports Kakao (AlimTalk/FriendTalk)
 * - Supports SMS (NHN/Coolsms)
 * - Supports Email
 * - Automatic fallback logic
 * - Unified logging
 * 
 * Replaces:
 * - /api/kakao/send-message
 * - /api/nhn/send-sms
 * - /api/coolsms/send-sms
 * - /api/integrations/send-message
 */

import { NextRequest } from 'next/server';
import {
  withAuthRateLimitAndValidation,
  successResponse,
  errorResponse,
  BodyHandler,
} from '@/lib/api-middleware';
import { validationSchemas } from '@/lib/input-validation';
import { sendSmartMessage } from '@/lib/smart-messaging';
import { sendKakaoOnly } from '@/lib/smart-messaging';
import { sendTestSMS } from '@/lib/nhn-sms';
import { sendCoolsmsTestSMS } from '@/lib/coolsms';

/**
 * Request body schema for unified message sending
 */
interface SendMessageRequest {
  // Recipient info
  phoneNumber?: string;
  email?: string;
  patientId?: string;

  // Message content
  content: string;
  templateId?: string;
  campaignId?: string;

  // Channel preferences
  channel?: 'kakao' | 'sms' | 'email' | 'auto';
  provider?: 'nhn' | 'coolsms' | 'auto'; // For SMS only
  kakaoType?: 'alim' | 'friend'; // For Kakao only

  // Fallback settings
  enableFallback?: boolean;
  fallbackOrder?: ('kakao' | 'sms' | 'email')[];

  // Metadata
  metadata?: Record<string, any>;
}

/**
 * Response type
 */
interface SendMessageResponse {
  success: boolean;
  channel?: 'kakao' | 'sms' | 'email';
  provider?: 'nhn' | 'coolsms';
  messageId?: string;
  error?: string;
  fallbackUsed?: boolean;
}

/**
 * Unified message sending handler
 */
const sendMessageHandler: BodyHandler<SendMessageRequest, SendMessageResponse> = async (
  userId,
  body,
  request
) => {
  const {
    phoneNumber,
    email,
    patientId,
    content,
    templateId,
    campaignId,
    channel = 'auto',
    provider = 'auto',
    kakaoType = 'alim',
    enableFallback = true,
    fallbackOrder = ['kakao', 'sms', 'email'],
    metadata = {},
  } = body;

  // Validate recipient
  if (!phoneNumber && !email) {
    return errorResponse('전화번호 또는 이메일이 필요합니다.', 400);
  }

  // Validate content
  if (!content || content.trim().length === 0) {
    return errorResponse('메시지 내용이 필요합니다.', 400);
  }

  // Determine channel priority
  const channelsToTry = channel === 'auto' 
    ? fallbackOrder 
    : [channel];

  let lastError: string | undefined;
  let fallbackUsed = false;

  // Try each channel in order
  for (let i = 0; i < channelsToTry.length; i++) {
    const currentChannel = channelsToTry[i];
    const isFallback = i > 0;

    try {
      let result: { success: boolean; error?: string; messageId?: string };

      switch (currentChannel) {
        case 'kakao':
          if (!phoneNumber) {
            lastError = '카카오톡 발송을 위해 전화번호가 필요합니다.';
            continue;
          }

          result = await sendKakaoOnly(
            userId,
            {
              recipientPhone: phoneNumber,
              content,
              templateId,
            },
            {
              patientId,
              campaignId,
              templateId,
            },
            provider === 'nhn' ? 'nhn' : 'auto'
          );

          if (result.success) {
            return successResponse<SendMessageResponse>({
              success: true,
              channel: 'kakao',
              provider: provider === 'nhn' ? 'nhn' : undefined,
              messageId: result.messageId,
              fallbackUsed: isFallback,
            });
          }
          lastError = result.error;
          break;

        case 'sms':
          if (!phoneNumber) {
            lastError = 'SMS 발송을 위해 전화번호가 필요합니다.';
            continue;
          }

          // Choose SMS provider
          const smsProvider = provider === 'auto' 
            ? (process.env.NHN_SMS_API_KEY ? 'nhn' : 'coolsms')
            : provider;

          if (smsProvider === 'nhn') {
            result = await sendTestSMS(phoneNumber, content);
          } else {
            result = await sendCoolsmsTestSMS(phoneNumber, content);
          }

          if (result.success) {
            return successResponse<SendMessageResponse>({
              success: true,
              channel: 'sms',
              provider: smsProvider,
              messageId: result.messageId,
              fallbackUsed: isFallback,
            });
          }
          lastError = result.error;
          break;

        case 'email':
          if (!email) {
            lastError = '이메일 발송을 위해 이메일 주소가 필요합니다.';
            continue;
          }

          // Email sending would go here
          // For now, return error as email is not fully implemented
          lastError = '이메일 발송 기능은 아직 구현되지 않았습니다.';
          continue;

        default:
          lastError = `지원하지 않는 채널입니다: ${currentChannel}`;
          continue;
      }

      // If we get here and fallback is disabled, stop trying
      if (!enableFallback && !result.success) {
        break;
      }

    } catch (error) {
      lastError = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      
      // If fallback is disabled, stop trying
      if (!enableFallback) {
        break;
      }
    }
  }

  // All channels failed
  return errorResponse(
    lastError || '메시지 발송에 실패했습니다.',
    500
  );
};

/**
 * POST /api/messages/send
 * Unified message sending endpoint
 */
export const POST = withAuthRateLimitAndValidation(
  sendMessageHandler,
  {
    // Basic validation schema
    phoneNumber: { type: 'string', optional: true },
    email: { type: 'string', optional: true },
    content: { type: 'string', required: true },
    channel: { type: 'string', optional: true },
    provider: { type: 'string', optional: true },
  }
);

