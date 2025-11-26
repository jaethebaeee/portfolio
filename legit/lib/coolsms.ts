/**
 * Coolsms (SOLAPI) SMS API 유틸리티
 * Official SOLAPI SDK 사용
 */

import { SolapiMessageService } from 'solapi';

const COOLSMS_API_KEY = process.env.COOLSMS_API_KEY;
const COOLSMS_API_SECRET = process.env.COOLSMS_API_SECRET;
const COOLSMS_SENDER_PHONE = process.env.COOLSMS_SENDER_PHONE || '15771603'; // 기본 발신번호

let messageService: SolapiMessageService | null = null;

if ((!COOLSMS_API_KEY || !COOLSMS_API_SECRET) && process.env.NODE_ENV === 'development') {
  console.warn('COOLSMS_API_KEY 또는 COOLSMS_API_SECRET가 설정되지 않았습니다.');
}

/**
 * Coolsms 메시지 서비스 초기화
 */
function getCoolsmsMessageService(): SolapiMessageService | null {
  if (!COOLSMS_API_KEY || !COOLSMS_API_SECRET) {
    return null;
  }

  if (!messageService) {
    messageService = new SolapiMessageService(COOLSMS_API_KEY, COOLSMS_API_SECRET);
  }

  return messageService;
}

/**
 * Coolsms SMS 발송
 */
export async function sendCoolsmsSMS(
  recipientPhone: string,
  message: string,
  senderPhone?: string
): Promise<{ success: boolean; message?: string; error?: string; messageId?: string }> {
  const service = getCoolsmsMessageService();
  if (!service) {
    return {
      success: false,
      error: 'COOLSMS_API_KEY 또는 COOLSMS_API_SECRET가 설정되지 않았습니다.',
    };
  }

  try {
    const from = senderPhone || COOLSMS_SENDER_PHONE;

    const result = await service.send({
      to: recipientPhone,
      from: from,
      text: message,
      type: 'SMS', // SMS, LMS, MMS (자동으로 결정됨)
    });

    return {
      success: true,
      message: 'SMS가 성공적으로 발송되었습니다.',
      messageId: result.messageId || result.groupId,
    };
  } catch (error: unknown) {
    console.error('Coolsms SMS 발송 오류:', error);
    const errorMessage = error instanceof Error ? error.message : 'SMS 발송 중 오류가 발생했습니다.';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 테스트 SMS 발송
 */
export async function sendCoolsmsTestSMS(
  recipientPhone?: string,
  content?: string
): Promise<{ success: boolean; message?: string; error?: string; messageId?: string }> {
  // 테스트 메시지
  const testMessage = content || '성형 수술 D-1 리마인더';

  // 개발 환경에서는 실제 발송 시도 (실패할 수 있음)
  if (!recipientPhone) {
    if (process.env.NODE_ENV === 'development') {
      console.log('개발 모드: 수신자 번호가 없어 모의 응답을 반환합니다.');
      console.log('발송 예정 메시지:', testMessage);

      return {
        success: true,
        message: `테스트 모드: "${testMessage}" SMS가 발송되었습니다. (실제 발송을 위해서는 수신자 번호가 필요합니다)`,
      };
    }

    return {
      success: false,
      error: '수신자 전화번호가 필요합니다.',
    };
  }

  // 실제 SMS 발송
  try {
    return await sendCoolsmsSMS(recipientPhone, testMessage);
  } catch (error: unknown) {
    // 개발 환경에서는 API 호출 실패 시에도 성공으로 처리 (실제 발송은 프로덕션에서만)
    if (process.env.NODE_ENV === 'development') {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      console.warn('Coolsms SMS API 호출 실패 (개발 모드):', errorMessage);
      return {
        success: true,
        message: `테스트 모드: "${testMessage}" SMS 발송이 시뮬레이션되었습니다. 실제 발송을 위해서는 Coolsms 계정 설정이 필요합니다.`,
      };
    }
    throw error;
  }
}

/**
 * Coolsms 잔액 조회
 */
export async function getCoolsmsBalance(): Promise<{ balance?: number; error?: string }> {
  const service = getCoolsmsMessageService();
  if (!service) {
    return { error: 'COOLSMS_API_KEY 또는 COOLSMS_API_SECRET가 설정되지 않았습니다.' };
  }

  try {
    // SOLAPI SDK를 통한 잔액 조회
    const balance = await service.getBalance();
    return { balance: balance.cash || balance.balance };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '잔액 조회 중 오류가 발생했습니다.';
    return { error: errorMessage };
  }
}
