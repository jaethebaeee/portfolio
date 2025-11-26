/**
 * 템플릿 검증 유틸리티
 */

import { MarketingTemplate, TemplateMessage } from './template-types';

export interface ValidationError {
  type: 'missing_variable' | 'message_too_long' | 'missing_content' | 'invalid_trigger';
  message: string;
  messageIndex?: number;
}

/**
 * SMS 메시지 바이트 길이 계산 (한글 2바이트, 영문 1바이트)
 */
export function getByteLength(text: string): number {
  let length = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charAt(i);
    if (char.match(/[가-힣ㄱ-ㅎㅏ-ㅣ]/)) {
      length += 2; // 한글
    } else {
      length += 1; // 영문, 숫자, 특수문자
    }
  }
  return length;
}

/**
 * 템플릿에서 사용된 변수 추출
 */
export function extractVariables(content: string): string[] {
  const variableRegex = /\{\{(\w+)\}\}/g;
  const variables: string[] = [];
  let match;
  
  while ((match = variableRegex.exec(content)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }
  
  return variables;
}

/**
 * 사용 가능한 변수 목록
 */
export const AVAILABLE_VARIABLES = [
  { name: 'patient_name', description: '환자 이름' },
  { name: 'patient_phone', description: '환자 전화번호' },
  { name: 'patient_email', description: '환자 이메일' },
  { name: 'appointment_date', description: '예약 날짜' },
  { name: 'appointment_time', description: '예약 시간' },
  { name: 'appointment_type', description: '예약 유형' },
  { name: 'days_since_surgery', description: '수술 후 경과 일수' },
  { name: 'days_until_birthday', description: '생일까지 남은 일수' },
  { name: 'months_since_last_visit', description: '마지막 방문 후 경과 개월수' },
  { name: 'coupon_code', description: '쿠폰 코드' },
  { name: 'coupon_expiry', description: '쿠폰 만료일' },
  { name: 'phone_number', description: '병원 전화번호' },
  { name: 'booking_link', description: '예약 링크' },
  { name: 'review_link', description: '후기 작성 링크' },
  { name: 'naver_review_link', description: 'Naver 리뷰 링크' },
] as const;

/**
 * 변수가 사용 가능한지 확인
 */
export function isVariableAvailable(variableName: string): boolean {
  return AVAILABLE_VARIABLES.some((v) => v.name === variableName);
}

/**
 * 템플릿 메시지 검증
 */
export function validateMessage(
  message: TemplateMessage,
  messageIndex: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  // 내용이 비어있는지 확인
  if (!message.content || message.content.trim().length === 0) {
    errors.push({
      type: 'missing_content',
      message: `메시지 ${messageIndex + 1}: 내용이 비어있습니다.`,
      messageIndex,
    });
  }

  // SMS 길이 제한 확인
  if (message.channel === 'sms' || message.channel === 'both') {
    const byteLength = getByteLength(message.content);
    if (byteLength > 90) {
      errors.push({
        type: 'message_too_long',
        message: `메시지 ${messageIndex + 1}: SMS는 90바이트를 초과할 수 없습니다. (현재: ${byteLength}바이트)`,
        messageIndex,
      });
    }
  }

  // 사용된 변수 확인
  const usedVariables = extractVariables(message.content);
  const invalidVariables = usedVariables.filter((v) => !isVariableAvailable(v));
  
  if (invalidVariables.length > 0) {
    errors.push({
      type: 'missing_variable',
      message: `메시지 ${messageIndex + 1}: 사용 불가능한 변수: ${invalidVariables.join(', ')}`,
      messageIndex,
    });
  }

  return errors;
}

/**
 * 템플릿 전체 검증
 */
export function validateTemplate(template: MarketingTemplate): {
  isValid: boolean;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];

  // 기본 정보 검증
  if (!template.name || template.name.trim().length === 0) {
    errors.push({
      type: 'missing_content',
      message: '템플릿 이름이 필요합니다.',
    });
  }

  // 트리거 검증
  if (!template.trigger || !template.trigger.type) {
    errors.push({
      type: 'invalid_trigger',
      message: '트리거가 설정되지 않았습니다.',
    });
  }

  // 메시지 검증
  if (!template.messages || template.messages.length === 0) {
    errors.push({
      type: 'missing_content',
      message: '최소 하나의 메시지가 필요합니다.',
    });
  } else {
    template.messages.forEach((message, index) => {
      const messageErrors = validateMessage(message, index);
      errors.push(...messageErrors);
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 템플릿 저장 전 검증 (경고만 표시)
 */
export function validateTemplateForSave(template: MarketingTemplate): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
} {
  const validation = validateTemplate(template);
  const warnings: string[] = [];
  const errors: string[] = [];

  // 경고: 변수가 선언되었지만 사용되지 않음
  template.messages.forEach((message, index) => {
    if (message.variables && message.variables.length > 0) {
      const usedVariables = extractVariables(message.content);
      const unusedVariables = message.variables.filter(
        (v) => !usedVariables.includes(v)
      );
      if (unusedVariables.length > 0) {
        warnings.push(
          `메시지 ${index + 1}: 선언된 변수가 사용되지 않습니다: ${unusedVariables.join(', ')}`
        );
      }
    }
  });

  // 에러 변환
  errors.push(...validation.errors.map((e) => e.message));

  return {
    isValid: validation.isValid,
    warnings,
    errors,
  };
}

