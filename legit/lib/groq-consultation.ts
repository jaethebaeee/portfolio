/**
 * Groq Llama3 상담 노트 포맷팅 유틸리티
 * 의료 상담 내용을 SOAP 형식으로 구조화하여 정리합니다.
 */

import Groq from "groq-sdk";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY && process.env.NODE_ENV === 'development') {
  console.warn("GROQ_API_KEY가 설정되지 않았습니다.");
}

/**
 * 상담 노트를 SOAP 형식으로 포맷팅
 * SOAP: Subjective (주관적 정보), Objective (객관적 정보), Assessment (평가), Plan (계획)
 */
export async function formatConsultationNote(
  rawNotes: string,
  options?: {
    patientName?: string;
    consultationDate?: string;
    procedureType?: string;
  }
): Promise<{
  success: boolean;
  formattedNote?: string;
  error?: string;
  attempts?: number;
}> {
  if (!GROQ_API_KEY) {
    return {
      success: false,
      error: "GROQ_API_KEY가 설정되지 않았습니다.",
    };
  }

  if (!rawNotes || rawNotes.trim().length === 0) {
    return {
      success: false,
      error: "분석할 상담 내용이 없습니다.",
    };
  }

  const groq = new Groq({
    apiKey: GROQ_API_KEY,
  });

  // 컨텍스트 정보 구성
  const contextInfo = [];
  if (options?.patientName) {
    contextInfo.push(`환자명: ${options.patientName}`);
  }
  if (options?.consultationDate) {
    contextInfo.push(`상담일자: ${options.consultationDate}`);
  }
  if (options?.procedureType) {
    contextInfo.push(`관심 시술: ${options.procedureType}`);
  }

  const contextPrompt = contextInfo.length > 0 
    ? `\n\n[상담 컨텍스트]\n${contextInfo.join('\n')}\n`
    : '';

  // 시스템 프롬프트: 의료 상담 노트를 SOAP 형식으로 구조화 (한국 의료 현실 반영)
  const systemPrompt = `당신은 한국의 성형외과/안과 클리닉에서 근무하는 전문적인 의료 상담 노트 작성 전문가입니다.
다음 규칙을 엄격히 준수하여 상담 내용을 SOAP 형식으로 구조화해주세요:

1. 형식 (SOAP):
   - S (Subjective): 환자의 주관적 호소 및 증상
     * 환자가 직접 말한 불편사항, 우려사항
     * 과거 수술/시술 이력 (라식, 라섹, 백내장, 쌍꺼풀, 코성형 등)
     * 가족력, 알레르기 등
   - O (Objective): 객관적 관찰 사항
     * 시각적 관찰 (안과: 시력, 안압, 안저 등 / 성형: 비대칭, 흉터 등)
     * 측정 가능한 수치 (나이, 시력, 안압 등)
     * 사진/영상 자료 언급 여부
   - A (Assessment): 평가 및 판단
     * 의료진의 의견 및 평가
     * 가능한 진단 또는 시술 적합성 판단
     * 주의사항이나 제한사항
   - P (Plan): 계획 및 조치 사항
     * 예약 사항 (수술 예약, 재방문, 검사 등)
     * 견적 및 비용 관련
     * 처방 또는 권고사항
     * 다음 단계 계획

2. 작성 원칙:
   - 원본 내용의 핵심 정보를 정확히 보존
   - 한국 의료 현실에 맞는 전문 용어 사용 (예: "라식", "라섹", "백내장", "쌍꺼풀", "코성형" 등)
   - 구체적인 수치, 날짜, 시간, 금액은 정확히 기록
   - 환자의 감정이나 우려사항도 포함
   - 상담실장이 기록한 내용을 의료진이 이해하기 쉽게 구조화

3. 구조:
   - 각 섹션은 명확하게 구분 (## 제목 형식 사용)
   - 불릿 포인트(-)나 번호를 사용하여 가독성 향상
   - 중요한 정보는 강조 (금액, 날짜, 시술명 등)

4. 주의사항:
   - 의료 용어는 정확하게 사용하되, 환자가 사용한 표현도 존중
   - 추측이나 확정적 진단 표현은 피함 ("가능성", "의심" 등 표현 사용)
   - 환자의 표현을 객관적으로 기록
   - 법적 문제를 피하기 위해 확정적 진단 표현 지양`;

  const userPrompt = `다음 상담 내용을 SOAP 형식으로 구조화해주세요:${contextPrompt}

[원본 상담 내용]
${rawNotes}

위 내용을 분석하여 SOAP 형식으로 정리해주세요. 원본 내용의 모든 중요한 정보를 포함하되, 구조화된 형식으로 재구성해주세요.`;

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts++;

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        model: "llama-3.1-70b-versatile",
        temperature: 0.3, // 의료 기록은 일관성이 중요하므로 낮은 temperature
        max_tokens: 1500, // 상담 노트는 길 수 있으므로 충분한 토큰 할당
        top_p: 1,
        stream: false,
      });

      const generatedText = completion.choices[0]?.message?.content || "";

      if (!generatedText) {
        if (attempts < maxAttempts) {
          continue;
        }
        return {
          success: false,
          error: "생성된 노트가 없습니다.",
          attempts,
        };
      }

      // 포맷팅된 노트에 원본 내용 추가
      const formattedNote = `[AI 구조화 리포트]\n\n${generatedText.trim()}\n\n---\n[원본 상담 내용]\n${rawNotes}`;

      return {
        success: true,
        formattedNote,
        attempts,
      };
    } catch (error: any) {
      if (attempts >= maxAttempts) {
        return {
          success: false,
          error: error.message || "노트 포맷팅 중 오류가 발생했습니다.",
          attempts,
        };
      }
      // 재시도 전에 짧은 대기
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return {
    success: false,
    error: "최대 시도 횟수를 초과했습니다.",
    attempts,
  };
}

/**
 * 상담 노트에서 핵심 정보 추출 (요약 버전)
 */
export async function extractConsultationSummary(
  rawNotes: string
): Promise<{
  success: boolean;
  summary?: {
    mainComplaint?: string;
    keyPoints?: string[];
    nextSteps?: string[];
    concerns?: string[];
  };
  error?: string;
}> {
  if (!GROQ_API_KEY) {
    return {
      success: false,
      error: "GROQ_API_KEY가 설정되지 않았습니다.",
    };
  }

  const groq = new Groq({
    apiKey: GROQ_API_KEY,
  });

  const systemPrompt = `당신은 의료 상담 노트 분석 전문가입니다.
상담 내용에서 핵심 정보를 추출하여 JSON 형식으로 반환해주세요.

다음 필드를 포함하세요:
- mainComplaint: 환자의 주요 호소사항 (한 문장)
- keyPoints: 주요 포인트 목록 (배열)
- nextSteps: 다음 단계/계획 (배열)
- concerns: 환자의 우려사항 (배열)

JSON 형식으로만 응답하세요.`;

  const userPrompt = `다음 상담 내용에서 핵심 정보를 추출해주세요:\n\n${rawNotes}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "llama-3.1-70b-versatile",
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content || "";
    const summary = JSON.parse(content);

    return {
      success: true,
      summary,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "요약 추출 중 오류가 발생했습니다.",
    };
  }
}

