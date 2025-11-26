import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sendCoolsmsTestSMS } from '@/lib/coolsms';
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';
import { createMessageLog, updateMessageLogStatus } from '@/lib/message-logs';
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
    const validation = validateRequestBody(body, validationSchemas.sendSMS);

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    const { recipientPhone, patientId, templateId, campaignId, content } = validation.sanitizedData;
    const testMessage = content || '성형 수술 D-1 리마인더';

    // 발송 이력 생성 (pending 상태)
    let logId: string | null = null;
    try {
      const log = await createMessageLog(userId, {
        patient_id: patientId,
        template_id: templateId,
        campaign_id: campaignId,
        channel: 'sms',
        recipient_phone: recipientPhone || '',
        message_content: testMessage,
        status: 'pending',
        provider: 'coolsms' // Coolsms 공급자 표시
      });
      logId = log.id;
    } catch (logError) {
      console.warn('발송 이력 생성 실패 (계속 진행):', logError);
    }

    // SMS 발송
    const result = await sendCoolsmsTestSMS(recipientPhone, testMessage);

    // 발송 결과에 따라 이력 업데이트
    if (logId) {
      try {
        if (result.success) {
          await updateMessageLogStatus(userId, logId, 'sent');
        } else {
          await updateMessageLogStatus(userId, logId, 'failed', result.error);
        }
      } catch (updateError) {
        console.warn('발송 이력 업데이트 실패:', updateError);
      }
    }

    if (result.success) {
      return NextResponse.json({ ...result, provider: 'coolsms' }, { status: 200 });
    } else {
      return NextResponse.json({ ...result, provider: 'coolsms' }, { status: 400 });
    }
  } catch (error: unknown) {
    // Error logging is handled in the response
    const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        provider: 'coolsms'
      },
      { status: 500 }
    );
  }
}
