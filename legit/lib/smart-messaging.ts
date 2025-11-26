/**
 * Smart Failover Message System
 * 카카오 알림톡 발송 실패 시 자동으로 SMS/LMS로 대체 발송하는 로직
 */

import { sendKakaoTalkMessage, getKakaoAccessToken } from './kakao';
import { sendNHNSMS, getNHNAccessToken } from './nhn-sms';
import { sendNHNAlimTalk, sendNHNFriendTalk } from './nhn-kakao';
import { createMessageLog, updateMessageLogStatus } from './message-logs';

// Dynamic import for server-only module
const getCoolsmsModule = async () => {
  if (typeof window === 'undefined') {
    return await import('./coolsms');
  }
  return null;
};

interface MessageRequest {
  recipientPhone: string;
  content: string;
  templateId?: string; // 카카오 알림톡 템플릿 ID (NHN 사용 시 템플릿 코드)
  templateArgs?: Record<string, string>; // 알림톡 템플릿 변수
  fallbackMessage?: string; // SMS 발송 시 사용할 대체 메시지 (없으면 content 사용)
}

type SMSProvider = 'nhn' | 'coolsms';
type KakaoProvider = 'nhn' | 'direct'; // direct: 기존 kapi, nhn: NHN Cloud

export async function sendSmartMessage(
  userId: string,
  request: MessageRequest,
  context: {
    patientId?: string;
    campaignId?: string;
    templateId?: string;
  },
  smsProvider: SMSProvider = 'nhn',
  kakaoProvider: KakaoProvider = 'nhn'
): Promise<{ success: boolean; channel: 'kakao' | 'sms'; provider?: SMSProvider | KakaoProvider; error?: string }> {
  // 1. 카카오 알림톡/친구톡 시도
  try {
    let kakaoResult: { success: boolean; message?: string; error?: string };

    if (kakaoProvider === 'nhn') {
      // NHN Cloud 사용
      if (request.templateId) {
        // 템플릿 ID가 있으면 알림톡 발송
        kakaoResult = await sendNHNAlimTalk(request.recipientPhone, request.templateId, request.templateArgs);
      } else {
        // 템플릿 ID가 없으면 친구톡 발송
        kakaoResult = await sendNHNFriendTalk(request.recipientPhone, request.content);
      }
    } else {
      // 기존 Direct API 사용 (kapi)
      const kakaoToken = await getKakaoAccessToken();
      if (!kakaoToken) throw new Error('Kakao Token Error');

      // 기존 로직은 친구톡(sendKakaoTalkMessage)만 호출하고 있었음.
      // 알림톡 지원 추가 필요 시 여기서 분기 가능하지만, NHN 권장.
      kakaoResult = await sendKakaoTalkMessage(kakaoToken, request.recipientPhone, request.content);
    }
    
    // 성공 시 로그 기록 및 리턴
    if (kakaoResult.success) {
      await logMessage(userId, 'kakao', 'sent', request, context, undefined, kakaoProvider);
      return { success: true, channel: 'kakao', provider: kakaoProvider };
    }
    
    // 실패 로그 기록 (하지만 프로세스는 계속됨)
    console.warn(`Kakao send failed (${kakaoProvider}), attempting fallback: ${kakaoResult.error}`);
    await logMessage(userId, 'kakao', 'failed', request, context, kakaoResult.error, kakaoProvider);
    
  } catch (e: any) {
    console.warn(`Kakao exception (${kakaoProvider}), attempting fallback: ${e.message}`);
    await logMessage(userId, 'kakao', 'failed', request, context, e.message, kakaoProvider);
  }

  // 2. SMS/LMS 대체 발송 (Failover)
  try {
    let smsToken: string | null = null;
    let smsResult: { success: boolean; message?: string; error?: string; messageId?: string };

    // SMS 공급자에 따라 발송
    if (smsProvider === 'coolsms') {
      const coolsmsModule = await getCoolsmsModule();
      if (!coolsmsModule) {
        throw new Error('Coolsms is only available server-side');
      }
      const smsContent = request.fallbackMessage || request.content;
      smsResult = await coolsmsModule.sendCoolsmsSMS(request.recipientPhone, smsContent);
    } else {
      // 기본값: NHN
      smsToken = await getNHNAccessToken();
      if (!smsToken) throw new Error('NHN SMS Token Error');

      const smsContent = request.fallbackMessage || request.content;
      smsResult = await sendNHNSMS(smsToken, request.recipientPhone, smsContent);
    }

    if (smsResult.success) {
      const smsContent = request.fallbackMessage || request.content;
      await logMessage(userId, 'sms', 'sent', { ...request, content: smsContent }, context, undefined, smsProvider);
      return { success: true, channel: 'sms', provider: smsProvider };
    } else {
      const smsContent = request.fallbackMessage || request.content;
      await logMessage(userId, 'sms', 'failed', { ...request, content: smsContent }, context, smsResult.error, smsProvider);
      return { success: false, channel: 'sms', provider: smsProvider, error: smsResult.error };
    }
  } catch (e: any) {
    await logMessage(userId, 'sms', 'failed', request, context, e.message, smsProvider);
    return { success: false, channel: 'sms', provider: smsProvider, error: e.message };
  }
}

async function logMessage(
  userId: string,
  channel: 'kakao' | 'sms',
  status: 'sent' | 'failed',
  request: MessageRequest,
  context: { patientId?: string; campaignId?: string; templateId?: string },
  errorMessage?: string,
  provider?: SMSProvider | KakaoProvider
) {
  try {
    await createMessageLog(userId, {
      patient_id: context.patientId,
      template_id: context.templateId,
      campaign_id: context.campaignId,
      channel,
      recipient_phone: request.recipientPhone,
      message_content: request.content,
      status: status === 'sent' ? 'sent' : 'failed', // pending은 건너뜀
      error_message: errorMessage,
      provider: provider // SMS/Kakao 공급자 정보 추가
    });
  } catch (e) {
    console.error('Failed to write message log:', e);
  }
}

/**
 * 카카오만 발송 (SMS 대체 발송 없음)
 */
export async function sendKakaoOnly(
  userId: string,
  request: MessageRequest,
  context: {
    patientId?: string;
    campaignId?: string;
    templateId?: string;
  },
  kakaoProvider: KakaoProvider = 'nhn'
): Promise<{ success: boolean; channel: 'kakao'; provider?: KakaoProvider; error?: string }> {
  try {
    let kakaoResult: { success: boolean; message?: string; error?: string };

    if (kakaoProvider === 'nhn') {
      // NHN Cloud 사용
      if (request.templateId) {
        kakaoResult = await sendNHNAlimTalk(request.recipientPhone, request.templateId, request.templateArgs);
      } else {
        kakaoResult = await sendNHNFriendTalk(request.recipientPhone, request.content);
      }
    } else {
      // 기존 Direct API 사용 (kapi)
      const kakaoToken = await getKakaoAccessToken();
      if (!kakaoToken) throw new Error('Kakao Token Error');

      kakaoResult = await sendKakaoTalkMessage(kakaoToken, request.recipientPhone, request.content);
    }
    
    if (kakaoResult.success) {
      await logMessage(userId, 'kakao', 'sent', request, context, undefined, kakaoProvider);
      return { success: true, channel: 'kakao', provider: kakaoProvider };
    } else {
      await logMessage(userId, 'kakao', 'failed', request, context, kakaoResult.error, kakaoProvider);
      return { success: false, channel: 'kakao', provider: kakaoProvider, error: kakaoResult.error };
    }
    
  } catch (e: any) {
    await logMessage(userId, 'kakao', 'failed', request, context, e.message, kakaoProvider);
    return { success: false, channel: 'kakao', provider: kakaoProvider, error: e.message };
  }
}

/**
 * SMS만 발송 (카카오 알림톡 없이)
 */
export async function sendSMSOnly(
  userId: string,
  request: MessageRequest,
  context: {
    patientId?: string;
    campaignId?: string;
    templateId?: string;
  },
  smsProvider: SMSProvider = 'nhn'
): Promise<{ success: boolean; channel: 'sms'; provider: SMSProvider; error?: string }> {
  try {
    let smsToken: string | null = null;
    let smsResult: { success: boolean; message?: string; error?: string; messageId?: string };

    // SMS 공급자에 따라 발송
    if (smsProvider === 'coolsms') {
      const coolsmsModule = await getCoolsmsModule();
      if (!coolsmsModule) {
        throw new Error('Coolsms is only available server-side');
      }
      const smsContent = request.fallbackMessage || request.content;
      smsResult = await coolsmsModule.sendCoolsmsSMS(request.recipientPhone, smsContent);
    } else {
      // 기본값: NHN
      smsToken = await getNHNAccessToken();
      if (!smsToken) throw new Error('NHN SMS Token Error');

      const smsContent = request.fallbackMessage || request.content;
      smsResult = await sendNHNSMS(smsToken, request.recipientPhone, smsContent);
    }

    if (smsResult.success) {
      const smsContent = request.fallbackMessage || request.content;
      await logMessage(userId, 'sms', 'sent', { ...request, content: smsContent }, context, undefined, smsProvider);
      return { success: true, channel: 'sms', provider: smsProvider };
    } else {
      const smsContent = request.fallbackMessage || request.content;
      await logMessage(userId, 'sms', 'failed', { ...request, content: smsContent }, context, smsResult.error, smsProvider);
      return { success: false, channel: 'sms', provider: smsProvider, error: smsResult.error };
    }
  } catch (e: any) {
    await logMessage(userId, 'sms', 'failed', request, context, e.message, smsProvider);
    return { success: false, channel: 'sms', provider: smsProvider, error: e.message };
  }
}

