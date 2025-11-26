import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateMarketingText, generateMultipleMarketingTexts } from "@/lib/groq-marketing";
import { rateLimit, rateLimitConfigs } from "@/lib/rate-limit";
import { validateRequestBody, validationSchemas } from "@/lib/input-validation";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting 적용
    const rateLimitResult = await rateLimit(rateLimitConfigs.marketing)(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: rateLimitResult.message || "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
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
        { success: false, error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 요청 본문 파싱 및 검증
    const body = await request.json();
    const validation = validateRequestBody(body, validationSchemas.generateMarketing);

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    const { prompt, count, options } = validation.sanitizedData;

    // 여러 버전 생성 요청인지 확인
    if (count && count > 1) {
      const result = await generateMultipleMarketingTexts(prompt, count);
      return NextResponse.json(result, {
        status: result.success ? 200 : 400,
      });
    }

    // 단일 문구 생성
    const result = await generateMarketingText(prompt, options);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error: any) {
    // Error logging is handled in the response
    return NextResponse.json(
      {
        success: false,
        error: error.message || "서버 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

