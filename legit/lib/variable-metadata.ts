/**
 * 변수 메타데이터 및 고급 기능
 */

export interface VariableMetadata {
  name: string;
  description: string;
  category: 'patient' | 'appointment' | 'surgery' | 'marketing' | 'system';
  example: string;
  type: 'string' | 'number' | 'date' | 'link';
  required?: boolean;
  triggerTypes?: string[]; // 이 변수가 유용한 트리거 타입
  relatedVariables?: string[]; // 관련 변수들
}

/**
 * 확장된 변수 메타데이터
 */
export const VARIABLE_METADATA: VariableMetadata[] = [
  // 환자 정보
  {
    name: 'patient_name',
    description: '환자 이름',
    category: 'patient',
    example: '홍길동',
    type: 'string',
    required: true,
    triggerTypes: ['appointment_completed', 'days_after_surgery', 'days_before_birthday', 'months_since_last_visit', 'review_request'],
    relatedVariables: ['patient_phone', 'patient_email'],
  },
  {
    name: 'patient_phone',
    description: '환자 전화번호',
    category: 'patient',
    example: '010-1234-5678',
    type: 'string',
    triggerTypes: ['appointment_completed', 'days_after_surgery'],
    relatedVariables: ['patient_name', 'patient_email'],
  },
  {
    name: 'patient_email',
    description: '환자 이메일',
    category: 'patient',
    example: 'patient@example.com',
    type: 'string',
    triggerTypes: ['appointment_completed'],
    relatedVariables: ['patient_name', 'patient_phone'],
  },
  
  // 예약 정보
  {
    name: 'appointment_date',
    description: '예약 날짜 (예: 2024년 1월 20일)',
    category: 'appointment',
    example: '2024년 1월 20일',
    type: 'date',
    required: true,
    triggerTypes: ['appointment_completed'],
    relatedVariables: ['appointment_time', 'appointment_type'],
  },
  {
    name: 'appointment_time',
    description: '예약 시간',
    category: 'appointment',
    example: '14:30',
    type: 'string',
    triggerTypes: ['appointment_completed'],
    relatedVariables: ['appointment_date', 'appointment_type'],
  },
  {
    name: 'appointment_type',
    description: '예약 유형 (예: 라식, 라섹)',
    category: 'appointment',
    example: '라식',
    type: 'string',
    triggerTypes: ['appointment_completed'],
    relatedVariables: ['appointment_date', 'appointment_time'],
  },
  
  // 수술 정보
  {
    name: 'days_since_surgery',
    description: '수술 후 경과 일수',
    category: 'surgery',
    example: '7',
    type: 'number',
    triggerTypes: ['days_after_surgery'],
    relatedVariables: ['patient_name'],
  },
  
  // 생일 정보
  {
    name: 'days_until_birthday',
    description: '생일까지 남은 일수',
    category: 'marketing',
    example: '3',
    type: 'number',
    triggerTypes: ['days_before_birthday'],
    relatedVariables: ['patient_name', 'coupon_code'],
  },
  
  // 마케팅
  {
    name: 'coupon_code',
    description: '쿠폰 코드 (자동 생성)',
    category: 'marketing',
    example: 'DF-123456',
    type: 'string',
    triggerTypes: ['days_before_birthday'],
    relatedVariables: ['coupon_expiry', 'patient_name'],
  },
  {
    name: 'coupon_expiry',
    description: '쿠폰 만료일',
    category: 'marketing',
    example: '2024년 2월 20일',
    type: 'date',
    triggerTypes: ['days_before_birthday'],
    relatedVariables: ['coupon_code'],
  },
  
  // 방문 정보
  {
    name: 'months_since_last_visit',
    description: '마지막 방문 후 경과 개월수',
    category: 'patient',
    example: '3',
    type: 'number',
    triggerTypes: ['months_since_last_visit'],
    relatedVariables: ['patient_name', 'booking_link'],
  },
  
  // 시스템 링크
  {
    name: 'phone_number',
    description: '병원 전화번호',
    category: 'system',
    example: '02-1234-5678',
    type: 'string',
    triggerTypes: ['appointment_completed', 'months_since_last_visit'],
  },
  {
    name: 'booking_link',
    description: '예약 링크',
    category: 'system',
    example: 'https://doctorsflow.com/booking',
    type: 'link',
    triggerTypes: ['appointment_completed', 'months_since_last_visit'],
    relatedVariables: ['phone_number'],
  },
  {
    name: 'review_link',
    description: '후기 작성 링크',
    category: 'system',
    example: 'https://doctorsflow.com/review',
    type: 'link',
    triggerTypes: ['days_after_surgery', 'review_request'],
    relatedVariables: ['patient_name'],
  },
  {
    name: 'naver_review_link',
    description: 'Naver 리뷰 링크',
    category: 'system',
    example: 'https://map.naver.com/...',
    type: 'link',
    triggerTypes: ['review_request'],
    relatedVariables: ['patient_name'],
  },
];

/**
 * 카테고리별 변수 그룹화
 */
export function getVariablesByCategory(): Record<string, VariableMetadata[]> {
  const grouped: Record<string, VariableMetadata[]> = {};
  VARIABLE_METADATA.forEach(variable => {
    if (!grouped[variable.category]) {
      grouped[variable.category] = [];
    }
    grouped[variable.category].push(variable);
  });
  return grouped;
}

/**
 * 트리거 타입에 맞는 변수 필터링
 */
export function getVariablesForTrigger(triggerType: string): VariableMetadata[] {
  return VARIABLE_METADATA.filter(variable => 
    !variable.triggerTypes || variable.triggerTypes.includes(triggerType)
  );
}

/**
 * 관련 변수 찾기
 */
export function getRelatedVariables(variableName: string): VariableMetadata[] {
  const variable = VARIABLE_METADATA.find(v => v.name === variableName);
  if (!variable || !variable.relatedVariables) return [];
  
  return VARIABLE_METADATA.filter(v => 
    variable.relatedVariables!.includes(v.name)
  );
}

/**
 * 퍼지 검색으로 변수 찾기
 */
export function fuzzySearchVariables(query: string, limit: number = 10): VariableMetadata[] {
  if (!query.trim()) return VARIABLE_METADATA;
  
  const lowerQuery = query.toLowerCase();
  const scored = VARIABLE_METADATA.map(variable => {
    const nameMatch = variable.name.toLowerCase().includes(lowerQuery);
    const descMatch = variable.description.toLowerCase().includes(lowerQuery);
    const exampleMatch = variable.example.toLowerCase().includes(lowerQuery);
    
    let score = 0;
    if (variable.name.toLowerCase().startsWith(lowerQuery)) score += 10;
    if (nameMatch) score += 5;
    if (descMatch) score += 3;
    if (exampleMatch) score += 1;
    
    return { variable, score };
  })
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, limit)
  .map(item => item.variable);
  
  return scored;
}

/**
 * 변수 이름으로 메타데이터 찾기
 */
export function getVariableMetadata(name: string): VariableMetadata | undefined {
  return VARIABLE_METADATA.find(v => v.name === name);
}

/**
 * 카테고리 라벨
 */
export const CATEGORY_LABELS: Record<string, string> = {
  patient: '환자 정보',
  appointment: '예약 정보',
  surgery: '수술 정보',
  marketing: '마케팅',
  system: '시스템',
};

