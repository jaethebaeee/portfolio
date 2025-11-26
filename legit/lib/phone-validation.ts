/**
 * 전화번호 검증 유틸리티
 */

/**
 * 한국 전화번호 형식 검증
 * 허용 형식: 010-1234-5678, 01012345678, 010 1234 5678
 */
export function validateKoreanPhoneNumber(phone: string): {
  isValid: boolean;
  formatted?: string;
  error?: string;
} {
  if (!phone || phone.trim().length === 0) {
    return {
      isValid: false,
      error: "전화번호를 입력해주세요.",
    };
  }

  // 하이픈, 공백 제거
  const cleaned = phone.replace(/[-\s]/g, "");

  // 숫자만 있는지 확인
  if (!/^\d+$/.test(cleaned)) {
    return {
      isValid: false,
      error: "전화번호는 숫자만 입력 가능합니다.",
    };
  }

  // 길이 확인 (10자리 또는 11자리)
  if (cleaned.length !== 10 && cleaned.length !== 11) {
    return {
      isValid: false,
      error: "전화번호는 10자리 또는 11자리여야 합니다.",
    };
  }

  // 한국 휴대폰 번호 형식 확인 (010, 011, 016, 017, 018, 019로 시작)
  const mobilePrefixes = ["010", "011", "016", "017", "018", "019"];
  const prefix = cleaned.substring(0, 3);

  if (!mobilePrefixes.includes(prefix)) {
    return {
      isValid: false,
      error: "올바른 휴대폰 번호 형식이 아닙니다. (010, 011, 016, 017, 018, 019로 시작)",
    };
  }

  // 포맷팅 (010-1234-5678)
  let formatted = cleaned;
  if (cleaned.length === 11) {
    formatted = `${cleaned.substring(0, 3)}-${cleaned.substring(3, 7)}-${cleaned.substring(7)}`;
  } else if (cleaned.length === 10) {
    formatted = `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }

  return {
    isValid: true,
    formatted: cleaned, // API에는 숫자만 전송
  };
}

/**
 * 전화번호 포맷팅 (표시용)
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return "";
  
  const cleaned = phone.replace(/[-\s]/g, "");
  
  if (cleaned.length === 11) {
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 7)}-${cleaned.substring(7)}`;
  } else if (cleaned.length === 10) {
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }
  
  return phone;
}

