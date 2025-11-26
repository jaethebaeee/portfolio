/**
 * Groq Llama3 마케팅 문구 생성 유틸리티
 */

import Groq from "groq-sdk";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY && process.env.NODE_ENV === 'development') {
  console.warn("GROQ_API_KEY가 설정되지 않았습니다.");
}

// 차단할 의료 용어 목록
const BLOCKED_MEDICAL_TERMS = [
  "증상",
  "진단",
  "질병",
  "병",
  "치료",
  "수술",
  "시술",
  "처방",
  "약물",
  "약",
  "병원",
  "의사",
  "의료진",
  "검사",
  "진료",
  "병리",
  "증후",
  "합병증",
];

// 허용할 마케팅 키워드
const ALLOWED_MARKETING_KEYWORDS = [
  "할인",
  "이벤트",
  "예약",
  "안내",
  "쿠폰",
  "프로모션",
  "특가",
  "혜택",
  "서비스",
  "방문",
  "상담",
  "문의",
  "리뷰",
  "후기",
  "만족",
  "추천",
];

/**
 * 텍스트에 차단된 의료 용어가 포함되어 있는지 확인
 */
export function containsBlockedTerms(text: string): boolean {
  const lowerText = text.toLowerCase();
  return BLOCKED_MEDICAL_TERMS.some((term) => lowerText.includes(term.toLowerCase()));
}

/**
 * 텍스트에 허용된 마케팅 키워드가 포함되어 있는지 확인
 */
export function containsMarketingKeywords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return ALLOWED_MARKETING_KEYWORDS.some((keyword) =>
    lowerText.includes(keyword.toLowerCase())
  );
}

/**
 * 마케팅 문구 검증
 */
export function validateMarketingText(text: string): {
  isValid: boolean;
  reason?: string;
} {
  // 차단된 의료 용어 확인
  if (containsBlockedTerms(text)) {
    return {
      isValid: false,
      reason: "의료 용어가 포함되어 있습니다. 마케팅 문구만 생성 가능합니다.",
    };
  }

  // 마케팅 키워드 확인
  if (!containsMarketingKeywords(text)) {
    return {
      isValid: false,
      reason: "마케팅 관련 키워드가 포함되어 있지 않습니다.",
    };
  }

  return { isValid: true };
}

/**
 * Groq Llama3를 사용하여 마케팅 문구 생성
 */
export async function generateMarketingText(
  prompt: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
  }
): Promise<{
  success: boolean;
  text?: string;
  error?: string;
  attempts?: number;
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

  const maxTokens = options?.maxTokens || 200;
  const temperature = options?.temperature || 0.7;

  // 마케팅 문구 생성 프롬프트
  const systemPrompt = `당신은 전문적인 마케팅 문구 작성 전문가입니다. 
다음 규칙을 엄격히 준수해야 합니다:

1. 절대 사용 금지 단어:
   - 증상, 진단, 질병, 병, 치료, 수술, 시술, 처방, 약물, 약, 병원, 의사, 의료진, 검사, 진료, 병리, 증후, 합병증 등 모든 의료 관련 용어

2. 반드시 포함해야 할 마케팅 키워드:
   - 할인, 이벤트, 예약, 안내, 쿠폰, 프로모션, 특가, 혜택, 서비스, 방문, 상담, 문의, 리뷰, 후기, 만족, 추천 등

3. 작성 스타일:
   - 친근하고 따뜻한 톤
   - 명확하고 간결한 문구
   - 행동 유도(CTA) 포함
   - 이모지 적절히 사용 가능

4. 목적:
   - 고객 유치 및 재방문 유도
   - 할인 및 이벤트 홍보
   - 예약 및 상담 안내
   - 리뷰 작성 유도

의료 용어를 절대 사용하지 말고, 순수하게 마케팅 문구만 작성하세요.`;

  const userPrompt = `다음 주제에 대한 마케팅 문구를 작성해주세요:\n\n${prompt}\n\n위 주제에 맞는 친근하고 매력적인 마케팅 문구를 작성해주세요. 의료 용어는 절대 사용하지 마세요.`;

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
        temperature: temperature,
        max_tokens: maxTokens,
        top_p: 1,
        stream: false,
      });

      const generatedText = completion.choices[0]?.message?.content || "";

      if (!generatedText) {
        return {
          success: false,
          error: "생성된 문구가 없습니다.",
          attempts,
        };
      }

      // 생성된 문구 검증
      const validation = validateMarketingText(generatedText);

      if (validation.isValid) {
        return {
          success: true,
          text: generatedText.trim(),
          attempts,
        };
      } else {
        // 검증 실패 시 재시도
        if (attempts < maxAttempts) {
          continue;
        }
        return {
          success: false,
          error: validation.reason || "생성된 문구가 요구사항을 만족하지 않습니다.",
          attempts,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "문구 생성 중 오류가 발생했습니다.",
        attempts,
      };
    }
  }

  return {
    success: false,
    error: "최대 시도 횟수를 초과했습니다.",
    attempts,
  };
}

/**
 * 여러 버전의 마케팅 문구 생성
 */
export async function generateMultipleMarketingTexts(
  prompt: string,
  count: number = 3
): Promise<{
  success: boolean;
  texts?: string[];
  error?: string;
}> {
  const texts: string[] = [];
  const errors: string[] = [];

  for (let i = 0; i < count; i++) {
    const result = await generateMarketingText(prompt, {
      temperature: 0.7 + i * 0.1, // 다양한 문구를 위해 temperature 조정
    });

    if (result.success && result.text) {
      texts.push(result.text);
    } else {
      errors.push(result.error || "알 수 없는 오류");
    }
  }

  if (texts.length === 0) {
    return {
      success: false,
      error: errors.join(", "),
    };
  }

  return {
    success: true,
    texts,
  };
}

