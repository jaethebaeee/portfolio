/**
 * Kakao Business Messaging API 유틸리티
 */

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;

if (!KAKAO_REST_API_KEY && process.env.NODE_ENV === 'development') {
  console.warn('KAKAO_REST_API_KEY가 설정되지 않았습니다.');
}

/**
 * Kakao 액세스 토큰 발급
 */
export async function getKakaoAccessToken(): Promise<string | null> {
  if (!KAKAO_REST_API_KEY) {
    throw new Error('KAKAO_REST_API_KEY가 설정되지 않았습니다.');
  }

  try {
    const response = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: KAKAO_REST_API_KEY,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`액세스 토큰 발급 실패: ${error}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Kakao 액세스 토큰 발급 오류:', error);
    throw error;
  }
}

/**
 * Kakao Talk 메시지 발송 (친구톡)
 * 참고: 실제 발송을 위해서는 Kakao Business 계정과 템플릿 승인이 필요합니다.
 */
export async function sendKakaoTalkMessage(
  accessToken: string,
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // Kakao Business Messaging API 엔드포인트
    // 실제 사용 시에는 비즈니스 계정의 엔드포인트로 변경 필요
    const response = await fetch('https://kapi.kakao.com/v2/api/talk/memo/default/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        receiver_uuids: JSON.stringify([phoneNumber]),
        template_object: JSON.stringify({
          object_type: 'text',
          text: message,
          link: {
            web_url: '',
            mobile_web_url: '',
          },
        }),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.msg || '메시지 발송 실패',
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: '메시지가 성공적으로 발송되었습니다.',
    };
  } catch (error: unknown) {
    console.error('Kakao Talk 메시지 발송 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '메시지 발송 중 오류가 발생했습니다.';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Kakao AlimTalk 메시지 발송 (알림톡)
 * 비즈니스 계정과 템플릿 승인이 필요합니다.
 */
export async function sendKakaoAlimTalk(
  accessToken: string,
  phoneNumber: string,
  templateId: string,
  templateArgs: Record<string, string> = {}
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch('https://kapi.kakao.com/v1/alimtalk/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receiver_phone_number: phoneNumber,
        template_id: templateId,
        template_args: templateArgs,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.msg || '알림톡 발송 실패',
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: '알림톡이 성공적으로 발송되었습니다.',
    };
  } catch (error: unknown) {
    console.error('Kakao AlimTalk 발송 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '알림톡 발송 중 오류가 발생했습니다.';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 간단한 테스트 메시지 발송 (개발용)
 * 실제로는 사용자 ID나 전화번호가 필요하지만, 테스트용으로 구현
 */
export async function sendTestMessage(
  phoneNumber?: string,
  content?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const accessToken = await getKakaoAccessToken();
    if (!accessToken) {
      return {
        success: false,
        error: '액세스 토큰을 발급받을 수 없습니다.',
      };
    }

    // 테스트 메시지
    const testMessage = content || '라식 예약 테스트입니다';

    // 실제 발송을 위해서는 사용자 ID나 전화번호가 필요합니다
    // 개발 환경에서는 모의 응답 반환
    if (process.env.NODE_ENV === 'development') {
      console.log('개발 모드: 실제 메시지는 발송되지 않습니다.');
      console.log('발송 예정 메시지:', testMessage);
      console.log('수신자:', phoneNumber || '설정 필요');
      
      return {
        success: true,
        message: `테스트 모드: "${testMessage}" 메시지가 발송되었습니다. (실제 발송은 프로덕션 환경에서만 가능)`,
      };
    }

    // 프로덕션 환경에서는 실제 API 호출
    if (!phoneNumber) {
      return {
        success: false,
        error: '전화번호가 필요합니다.',
      };
    }

    return await sendKakaoTalkMessage(accessToken, phoneNumber, testMessage);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '메시지 발송 중 오류가 발생했습니다.';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

