import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sendKakaoOnly } from '@/lib/smart-messaging';
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';
import { validateRequestBody, validationSchemas } from '@/lib/input-validation';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting 적용
    const rateLimitResult = await rateLimit(rateLimitConfigs.api)(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: rateLimitResult.message || '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          }
        }
      );
    }

    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 요청 본문 파싱 및 검증
    const body = await request.json();
    const validation = validateRequestBody(body, validationSchemas.sendKakaoMessage);

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    const { phoneNumber, patientId, templateId, campaignId, content } = validation.sanitizedData;
    const messageContent = content || '라식 예약 테스트입니다';

    // NHN Kakao 전송 (템플릿 ID 있으면 알림톡, 없으면 친구톡)
    // sendKakaoOnly 내부에서 로그 생성 및 업데이트 처리함
    const result = await sendKakaoOnly(
      userId,
      {
        recipientPhone: phoneNumber || '',
        content: messageContent,
        templateId: templateId, // 템플릿 ID 전달
      },
      {
        patientId,
        campaignId,
        templateId,
      },
      'nhn' // NHN Provider 강제 (기본값)
    );

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error: unknown) {
    // Error logging is handled in the response
    const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

