/**
 * NHN Cloud SMS API 유틸리티
 */

const NHN_SMS_APP_KEY = process.env.NHN_SMS_APP_KEY;
const NHN_SMS_SECRET_KEY = process.env.NHN_SMS_SECRET_KEY;
const NHN_SMS_SENDER_PHONE = process.env.NHN_SMS_SENDER_PHONE || '01012345678'; // 발신번호 (기본값)

if ((!NHN_SMS_APP_KEY || !NHN_SMS_SECRET_KEY) && process.env.NODE_ENV === 'development') {
  console.warn('NHN_SMS_APP_KEY 또는 NHN_SMS_SECRET_KEY가 설정되지 않았습니다.');
}

/**
 * NHN Cloud SMS 액세스 토큰 발급
 */
export async function getNHNAccessToken(): Promise<string | null> {
  if (!NHN_SMS_APP_KEY || !NHN_SMS_SECRET_KEY) {
    throw new Error('NHN_SMS_APP_KEY 또는 NHN_SMS_SECRET_KEY가 설정되지 않았습니다.');
  }

  try {
    const response = await fetch('https://api-sms.cloud.toast.com/oauth/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: NHN_SMS_APP_KEY,
        client_secret: NHN_SMS_SECRET_KEY,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`액세스 토큰 발급 실패: ${error}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('NHN Cloud SMS 액세스 토큰 발급 오류:', error);
    throw error;
  }
}

/**
 * NHN Cloud SMS 발송
 */
export async function sendNHNSMS(
  accessToken: string,
  recipientPhone: string,
  message: string,
  senderPhone?: string
): Promise<{ success: boolean; message?: string; error?: string; requestId?: string }> {
  if (!NHN_SMS_APP_KEY) {
    return {
      success: false,
      error: 'NHN_SMS_APP_KEY가 설정되지 않았습니다.',
    };
  }

  try {
    const appKey = NHN_SMS_APP_KEY;
    const senderNumber = senderPhone || NHN_SMS_SENDER_PHONE;

    // NHN Cloud SMS API 엔드포인트
    const url = `https://api-sms.cloud.toast.com/sms/v3.0/appKeys/${appKey}/sender/sms`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify({
        body: message,
        sendNo: senderNumber,
        recipientList: [
          {
            recipientNo: recipientPhone,
            templateParameter: {},
            countryCode: '82', // 한국 국가 코드
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '알 수 없는 오류' }));
      return {
        success: false,
        error: error.message || error.errorMessage || 'SMS 발송 실패',
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: 'SMS가 성공적으로 발송되었습니다.',
      requestId: data.header?.requestId,
    };
  } catch (error: unknown) {
    console.error('NHN Cloud SMS 발송 오류:', error);
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
export async function sendTestSMS(
  recipientPhone?: string,
  content?: string
): Promise<{ success: boolean; message?: string; error?: string; requestId?: string }> {
  try {
    const accessToken = await getNHNAccessToken();
    if (!accessToken) {
      return {
        success: false,
        error: '액세스 토큰을 발급받을 수 없습니다.',
      };
    }

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
      return await sendNHNSMS(accessToken, recipientPhone, testMessage);
    } catch (error: unknown) {
      // 개발 환경에서는 API 호출 실패 시에도 성공으로 처리 (실제 발송은 프로덕션에서만)
      if (process.env.NODE_ENV === 'development') {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        console.warn('NHN SMS API 호출 실패 (개발 모드):', errorMessage);
        return {
          success: true,
          message: `테스트 모드: "${testMessage}" SMS 발송이 시뮬레이션되었습니다. 실제 발송을 위해서는 NHN Cloud 계정 설정이 필요합니다.`,
        };
      }
      throw error;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'SMS 발송 중 오류가 발생했습니다.';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

