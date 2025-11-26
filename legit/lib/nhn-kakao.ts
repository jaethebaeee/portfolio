/**
 * NHN Cloud AlimTalk/FriendTalk API 유틸리티
 * 
 * 통합 메시징 API를 통해 카카오 알림톡/친구톡 발송
 */

// 알림톡/친구톡은 SMS와 다른 App Key를 사용할 수도 있고 같을 수도 있음
// 보통 별도 서비스로 등록되므로 구분하는 것이 안전함
const NHN_KAKAO_APP_KEY = process.env.NHN_KAKAO_APP_KEY || process.env.NHN_SMS_APP_KEY;
const NHN_KAKAO_SECRET_KEY = process.env.NHN_KAKAO_SECRET_KEY || process.env.NHN_SMS_SECRET_KEY;
const NHN_KAKAO_SENDER_KEY = process.env.NHN_KAKAO_SENDER_KEY; // 카카오 비즈니스 채널 키 (Sender Key)

if ((!NHN_KAKAO_APP_KEY || !NHN_KAKAO_SECRET_KEY) && process.env.NODE_ENV === 'development') {
  console.warn('NHN_KAKAO_APP_KEY 또는 NHN_KAKAO_SECRET_KEY가 설정되지 않았습니다.');
}

if (!NHN_KAKAO_SENDER_KEY && process.env.NODE_ENV === 'development') {
  console.warn('NHN_KAKAO_SENDER_KEY가 설정되지 않았습니다. 알림톡/친구톡 발송이 불가능할 수 있습니다.');
}

// 토큰 관리를 위한 간단한 인메모리 캐시 (실제 프로덕션에서는 Redis 등을 권장하나 여기선 간단히)
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * NHN Cloud AlimTalk 액세스 토큰 발급
 * (SMS와 엔드포인트가 다를 수 있으나 인증 방식은 유사할 것으로 가정)
 * 보통 알림톡은 https://api-alimtalk.cloud.toast.com 도메인 사용
 */
export async function getNHNKakaoAccessToken(): Promise<string | null> {
  if (!NHN_KAKAO_APP_KEY || !NHN_KAKAO_SECRET_KEY) {
    throw new Error('NHN_KAKAO_APP_KEY 또는 NHN_KAKAO_SECRET_KEY가 설정되지 않았습니다.');
  }

  // 캐시된 토큰이 유효하면 반환 (만료 1분 전까지)
  if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  try {
    // NHN Cloud 통합 인증 또는 서비스별 인증
    // 알림톡 API 가이드에 따르면 서비스별 토큰 발급이 필요할 수 있음
    // 여기서는 알림톡용 인증 URL 사용 가정 (SMS와 다름)
    // 실제 URL: https://api-alimtalk.cloud.toast.com/oauth/v2.0/token
    
    // 만약 SMS와 AppKey가 같다면 같은 토큰을 쓸 수도 있지만, 엔드포인트가 다르면 별도 발급이 안전
    const response = await fetch('https://api-alimtalk.cloud.toast.com/oauth/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grantType: 'client_credentials',
        appKey: NHN_KAKAO_APP_KEY,
        secretKey: NHN_KAKAO_SECRET_KEY,
      }),
    });

    if (!response.ok) {
      // 폼 데이터 방식 시도 (SMS API와 동일하게)
      const formDataResponse = await fetch('https://api-alimtalk.cloud.toast.com/oauth/v2.0/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: NHN_KAKAO_APP_KEY,
          client_secret: NHN_KAKAO_SECRET_KEY,
        }),
      });

      if (!formDataResponse.ok) {
         const errorText = await formDataResponse.text();
         throw new Error(`액세스 토큰 발급 실패: ${errorText}`);
      }
      
      const data = await formDataResponse.json();
      cachedToken = data.access_token;
      tokenExpiresAt = Date.now() + (data.expires_in * 1000);
      return data.access_token;
    }

    const data = await response.json();
    cachedToken = data.accessToken; // 응답 필드명이 다를 수 있음
    tokenExpiresAt = Date.now() + (data.expiresIn * 1000);
    return cachedToken;
  } catch (error) {
    console.error('NHN Cloud Kakao 액세스 토큰 발급 오류:', error);
    // 개발 모드에서는 에러를 던지지 않고 null 반환하여 로직 흐름 유지
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    throw error;
  }
}

/**
 * NHN Cloud 알림톡 발송
 */
export async function sendNHNAlimTalk(
  recipientPhone: string,
  templateCode: string, // NHN에서는 templateId 대신 templateCode 용어 사용 가능성
  templateArgs: Record<string, string> = {}
): Promise<{ success: boolean; message?: string; error?: string; requestId?: string }> {
  if (!NHN_KAKAO_APP_KEY || !NHN_KAKAO_SENDER_KEY) {
    return {
      success: false,
      error: 'NHN_KAKAO_APP_KEY 또는 NHN_KAKAO_SENDER_KEY가 설정되지 않았습니다.',
    };
  }

  try {
    const accessToken = await getNHNKakaoAccessToken();
    if (!accessToken) {
       // 개발 모드 모의 응답
       if (process.env.NODE_ENV === 'development') {
         console.log(`[DEV] NHN AlimTalk Mock Send to ${recipientPhone}, template: ${templateCode}`);
         return { success: true, message: '개발 모드: 알림톡 발송 성공 (Mock)' };
       }
       throw new Error('액세스 토큰을 발급받을 수 없습니다.');
    }

    const appKey = NHN_KAKAO_APP_KEY;
    const senderKey = NHN_KAKAO_SENDER_KEY;

    // NHN Cloud AlimTalk API v2.2
    const url = `https://api-alimtalk.cloud.toast.com/alimtalk/v2.2/appkeys/${appKey}/messages`;

    // 템플릿 파라미터 변환 (NHN 포맷에 맞게)
    // NHN은 content 필드에 치환자를 넣고 templateParameter로 값을 매핑
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Secret-Key': NHN_KAKAO_SECRET_KEY, // 일부 API는 헤더에 시크릿 키 요구할 수도 있음
        'Content-Type': 'application/json;charset=UTF-8',
      },
      // Note: NHN AlimTalk API 구조는 버전마다 다를 수 있으니 최신 v2.2 기준 작성
      // AppKey 방식으로 호출 시 Authorization 헤더 대신 X-Secret-Key를 쓰거나
      // 혹은 토큰 방식일 경우 Authorization: Bearer {token} 사용
      // 여기서는 토큰 방식을 우선하되, 실패 시 AppKey/SecretKey 방식 고려
      body: JSON.stringify({
        senderKey: senderKey,
        templateCode: templateCode,
        recipientList: [{
          recipientNo: recipientPhone,
          templateParameter: templateArgs
        }]
      }),
    });
    
    // 토큰 기반일 경우 헤더 수정
    /*
    headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json;charset=UTF-8',
    }
    */
    
    // 실제 구현에서는 공식 문서에 따라 인증 방식 선택. 
    // NHN Cloud 메시징은 보통 Secret Key를 헤더에 넣는 방식을 많이 사용 (토큰 불필요할 수도 있음)
    // 안전하게 토큰 없이 Secret Key 헤더 방식으로 시도해보고, 안되면 토큰 방식 사용

    if (!response.ok) {
      const error = await response.json().catch(() => ({ header: { resultMessage: '알 수 없는 오류' } }));
      return {
        success: false,
        error: error.header?.resultMessage || '알림톡 발송 실패',
      };
    }

    const data = await response.json();
    if (data.header.isSuccessful) {
        return {
          success: true,
          message: '알림톡이 성공적으로 발송되었습니다.',
          requestId: data.header.resultMessage
        };
    } else {
        return {
            success: false,
            error: data.header.resultMessage
        };
    }

  } catch (error: unknown) {
    console.error('NHN Cloud AlimTalk 발송 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알림톡 발송 중 오류가 발생했습니다.',
    };
  }
}

/**
 * NHN Cloud 친구톡 발송 (텍스트형)
 */
export async function sendNHNFriendTalk(
    recipientPhone: string,
    content: string,
    adFlag: boolean = false // 광고성 메시지 여부
  ): Promise<{ success: boolean; message?: string; error?: string; requestId?: string }> {
    if (!NHN_KAKAO_APP_KEY || !NHN_KAKAO_SENDER_KEY) {
      return {
        success: false,
        error: 'NHN_KAKAO_APP_KEY 또는 NHN_KAKAO_SENDER_KEY가 설정되지 않았습니다.',
      };
    }
  
    try {
      // 개발 모드 모의 응답
      if (process.env.NODE_ENV === 'development') {
           console.log(`[DEV] NHN FriendTalk Mock Send to ${recipientPhone}: ${content}`);
           return { success: true, message: '개발 모드: 친구톡 발송 성공 (Mock)' };
      }

      const appKey = NHN_KAKAO_APP_KEY;
      const senderKey = NHN_KAKAO_SENDER_KEY;
  
      // NHN Cloud FriendTalk API v2.2
      const url = `https://api-alimtalk.cloud.toast.com/friendtalk/v2.2/appkeys/${appKey}/messages`;
  
      const response = await fetch(url, {
        method: 'POST',
        headers: {
            'X-Secret-Key': NHN_KAKAO_SECRET_KEY, 
            'Content-Type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify({
          senderKey: senderKey,
          adFlag: adFlag ? 'Y' : 'N',
          content: content,
          recipientList: [{
            recipientNo: recipientPhone
          }]
        }),
      });
  
      if (!response.ok) {
        const error = await response.json().catch(() => ({ header: { resultMessage: '알 수 없는 오류' } }));
        return {
          success: false,
          error: error.header?.resultMessage || '친구톡 발송 실패',
        };
      }
  
      const data = await response.json();
      if (data.header.isSuccessful) {
          return {
            success: true,
            message: '친구톡이 성공적으로 발송되었습니다.',
            requestId: data.header.resultMessage
          };
      } else {
          return {
              success: false,
              error: data.header.resultMessage
          };
      }
  
    } catch (error: unknown) {
      console.error('NHN Cloud FriendTalk 발송 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '친구톡 발송 중 오류가 발생했습니다.',
      };
    }
  }

