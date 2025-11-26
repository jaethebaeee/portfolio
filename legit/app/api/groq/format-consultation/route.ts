import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { formatConsultationNote } from "@/lib/groq-consultation";
import { rateLimit, rateLimitConfigs } from "@/lib/rate-limit";

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

    // 요청 본문 파싱
    const body = await request.json();
    const { rawNotes, patientName, consultationDate, procedureType } = body;

    // 입력 검증
    if (!rawNotes || typeof rawNotes !== 'string' || rawNotes.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "상담 내용이 필요합니다." },
        { status: 400 }
      );
    }

    // 상담 노트 포맷팅
    const result = await formatConsultationNote(rawNotes, {
      patientName,
      consultationDate,
      procedureType,
    });

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error: any) {
    console.error("Consultation note formatting error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "서버 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

