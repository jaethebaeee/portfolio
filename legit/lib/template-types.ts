/**
 * 템플릿 타입 정의
 */

export type Channel = 'kakao' | 'sms' | 'both';

export type TriggerType =
  | 'appointment_completed'
  | 'days_after_surgery'
  | 'days_before_birthday'
  | 'months_since_last_visit'
  | 'review_request'
  | 'consultation_completed'
  | 'surgery_booked'
  | 'surgery_date'
  | 'surgery_completed'
  | 'followup_due'
  | 'second_eye_eligible'
  | 'family_referral'
  | 'review_reminder';

export interface TemplateTrigger {
  type: TriggerType;
  value?: number; // 일수 또는 개월수
  unit?: 'days' | 'months';
}

export interface TemplateMessage {
  channel: Channel;
  content: string;
  variables?: string[]; // 사용 가능한 변수 목록
}

export interface MarketingTemplate {
  id: string;
  name: string;
  description: string;
  trigger: TemplateTrigger;
  messages: TemplateMessage[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 진료과목별 전문 템플릿 설정
 */
export interface SpecialtyConfig {
  name: string;
  nameEn: string;
  description: string;
  commonProcedures: string[];
  patientJourney: string[];
  recommendedTriggers: TriggerType[];
  autoCampaigns: string[];
}

/**
 * 진료과목별 설정
 */
export const specialtyConfigs: Record<string, SpecialtyConfig> = {
  '안과': {
    name: '안과',
    nameEn: 'Ophthalmology',
    description: '백내장, 라식, 녹내장 등 눈 관련 진료',
    commonProcedures: ['백내장 수술', '라식/라섹 수술', '녹내장 치료', '망막 질환', '노안 수술'],
    patientJourney: [
      '초진 상담',
      '수술 예약',
      '수술 당일',
      '수술 완료',
      '퇴원 관리',
      '1차 검진',
      '패치 제거',
      '2차 검진',
      '후기 요청',
      '두 번째 눈 제안',
      '가족 추천',
      '정기 검진'
    ],
    recommendedTriggers: [
      'consultation_completed',
      'surgery_booked',
      'surgery_date',
      'surgery_completed',
      'followup_due',
      'second_eye_eligible',
      'family_referral',
      'review_reminder'
    ],
    autoCampaigns: [
      '백내장 수술 환자 자동 관리',
      '수술 후 케어 리마인더',
      '가족 검진 추천',
      '재방문 유도',
      '후기 자동 수집'
    ]
  },
  '치과': {
    name: '치과',
    nameEn: 'Dentistry',
    description: '임플란트, 교정, 충치 치료 등 치아 진료',
    commonProcedures: ['임플란트', '교정', '충치 치료', '스케일링', '치아 미백'],
    patientJourney: [
      '초진 상담',
      '치료 계획',
      '치료 진행',
      '치료 완료',
      '정기 검진',
      '후기 요청'
    ],
    recommendedTriggers: [
      'appointment_completed',
      'days_after_surgery',
      'months_since_last_visit',
      'review_request'
    ],
    autoCampaigns: [
      '치료 환자 관리',
      '정기 검진 리마인드',
      '임플란트 사후 관리',
      '교정 진행 상황'
    ]
  },
  '성형외과': {
    name: '성형외과',
    nameEn: 'Plastic Surgery',
    description: '눈성형, 코성형 등 미용 수술',
    commonProcedures: ['눈성형', '코성형', '안면윤곽', '가슴성형', '지방흡입'],
    patientJourney: [
      '초진 상담',
      '수술 계획',
      '수술 예약',
      '수술 당일',
      '수술 완료',
      '퇴원 관리',
      '검진 및 관리',
      '후기 요청'
    ],
    recommendedTriggers: [
      'consultation_completed',
      'surgery_booked',
      'surgery_date',
      'surgery_completed',
      'followup_due',
      'review_request'
    ],
    autoCampaigns: [
      '수술 환자 케어',
      '사후 관리 리마인드',
      '추가 시술 제안',
      '후기 자동 수집'
    ]
  }
};

/**
 * 안과 클리닉 전문 템플릿 팩
 */
export const eyeClinicTemplates: Omit<MarketingTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: '백내장 수술 상담 완료 안내',
    description: '백내장 진단 상담이 완료된 환자에게 수술 일정 및 준비사항 안내',
    trigger: {
      type: 'consultation_completed',
    },
    messages: [
      {
        channel: 'kakao',
        content: '안녕하세요 {{patient_name}}님!\n\n백내장 수술 상담이 완료되었습니다.\n\n🔍 진단 결과: 백내장 진행 단계 - {{cataract_stage}}\n💰 예상 비용: {{estimated_cost}}원 (건강보험 적용)\n📅 권장 수술 시기: {{recommended_date}}\n\n수술에 대해 궁금한 점이 있으시면 언제든 문의주세요.\n\n📞 상담 문의: {{clinic_phone}}\n🏥 {{clinic_name}}',
        variables: ['patient_name', 'cataract_stage', 'estimated_cost', 'recommended_date', 'clinic_phone', 'clinic_name'],
      },
    ],
    enabled: true,
  },
  {
    name: '백내장 수술 예약 확인',
    description: '수술 예약이 확정된 환자에게 상세 안내',
    trigger: {
      type: 'surgery_booked',
    },
    messages: [
      {
        channel: 'kakao',
        content: '📅 백내장 수술 예약 확정\n\n{{patient_name}}님, 수술 예약이 완료되었습니다!\n\n🗓️ 수술 날짜: {{surgery_date}}\n🕐 수술 시간: {{surgery_time}}\n👨‍⚕️ 담당 의사: {{doctor_name}}\n🏥 수술 병원: {{clinic_name}}\n📍 위치: {{clinic_address}}\n\n[수술 전 준비사항]\n• 수술 8시간 전 금식\n• 평소 복용 약물 상의 필수\n• 보호자 동반 (택시 이용 권장)\n• 여벌 옷 및 담요 준비\n\n수술 당일 {{arrival_time}}까지 도착해주세요.\n\n📞 문의: {{clinic_phone}}',
        variables: ['patient_name', 'surgery_date', 'surgery_time', 'doctor_name', 'clinic_name', 'clinic_address', 'arrival_time', 'clinic_phone'],
      },
      {
        channel: 'sms',
        content: '[{{clinic_name}}] {{patient_name}}님, 백내장 수술 예약 확정: {{surgery_date}} {{surgery_time}}. 문의: {{clinic_phone}}',
        variables: ['clinic_name', 'patient_name', 'surgery_date', 'surgery_time', 'clinic_phone'],
      },
    ],
    enabled: true,
  },
  {
    name: '수술 1주일 전 리마인더',
    description: '수술 일주일 전 최종 확인 및 준비 안내',
    trigger: {
      type: 'surgery_date',
      value: 7,
      unit: 'days',
    },
    messages: [
      {
        channel: 'kakao',
        content: '🔔 수술 1주일 전 안내\n\n{{patient_name}}님, 백내장 수술 일주일 남았습니다!\n\n📅 D-7: {{surgery_date}}\n\n[최종 확인사항]\n✅ 건강보험 자격 확인\n✅ 약물 복용 중지 ({{medication_stop_date}})\n✅ 보호자 확정\n✅ 교통편 준비\n✅ 수술 당일 금식 계획\n\n[수술 전 검진 안내]\n📆 예약일: {{pre_op_check_date}}\n🕐 시간: {{pre_op_check_time}}\n\n궁금한 점 있으시면 연락주세요!\n📞 {{clinic_phone}}',
        variables: ['patient_name', 'surgery_date', 'medication_stop_date', 'pre_op_check_date', 'pre_op_check_time', 'clinic_phone'],
      },
    ],
    enabled: true,
  },
  {
    name: '수술 1일 전 최종 리마인더',
    description: '수술 전날 최종 준비사항 및 도착 안내',
    trigger: {
      type: 'surgery_date',
      value: 1,
      unit: 'days',
    },
    messages: [
      {
        channel: 'kakao',
        content: '🚨 내일 백내장 수술 리마인더!\n\n{{patient_name}}님, 내일이 수술 날입니다.\n\n🗓️ 수술일: {{surgery_date}}\n🕐 도착시간: {{arrival_time}}\n📍 장소: {{clinic_address}}\n\n[수술 전날 준비사항]\n✅ 저녁 8시 이후 금식 (물만 가능)\n✅ 샤워 및 머리감기\n✅ 편한 복장 및 슬리퍼\n✅ 마스크, 여벌 속옷 준비\n\n[수술 당일 일정]\n🕐 {{arrival_time}}: 도착 및 접수\n🕐 {{surgery_time}}: 수술 시작\n🕐 {{discharge_time}}: 귀가 예정\n\n📞 응급 연락처: {{emergency_phone}}\n\n오늘 밤 좋은 꿈 꾸세요! 💙',
        variables: ['patient_name', 'surgery_date', 'arrival_time', 'clinic_address', 'surgery_time', 'discharge_time', 'emergency_phone'],
      },
      {
        channel: 'sms',
        content: '[{{clinic_name}}] {{patient_name}}님 내일 수술: {{arrival_time}} 도착. 금식 필수. 문의: {{clinic_phone}}',
        variables: ['clinic_name', 'patient_name', 'arrival_time', 'clinic_phone'],
      },
    ],
    enabled: true,
  },
  {
    name: '수술 당일 도착 안내',
    description: '수술 당일 2시간 전 도착 리마인더',
    trigger: {
      type: 'surgery_date',
      value: 0,
      unit: 'days',
    },
    messages: [
      {
        channel: 'kakao',
        content: '🏥 오늘 백내장 수술 당일입니다!\n\n{{patient_name}}님, 수술 준비 잘 하셨나요?\n\n🕐 도착 예정: {{arrival_time}}\n📍 병원 위치: {{clinic_address}}\n🚗 주차장: {{parking_info}}\n\n[준비물 확인]\n✅ 신분증\n✅ 보호자\n✅ 마스크\n✅ 편한 신발\n\n수술 전 2시간 금식 유지해주세요.\n\n📞 도착 시 연락: {{clinic_phone}}\n\n파이팅! 💪 오늘 좋은 결과 있을 거예요!',
        variables: ['patient_name', 'arrival_time', 'clinic_address', 'parking_info', 'clinic_phone'],
      },
    ],
    enabled: true,
  },
  {
    name: '수술 완료 및 퇴원 안내',
    description: '수술이 완료된 후 퇴원 시 관리 안내',
    trigger: {
      type: 'surgery_completed',
    },
    messages: [
      {
        channel: 'kakao',
        content: '🎉 백내장 수술 성공적으로 완료되었습니다!\n\n{{patient_name}}님, 수술이 끝났습니다.\n\n[수술 결과]\n✅ {{surgery_eye}} 백내장 제거 완료\n✅ 인공 수정체 삽입 완료\n✅ 수술 시간: {{surgery_duration}}분\n\n[퇴원 후 관리 안내]\n🛡️ 보호안경 24시간 착용 (1주)\n💧 안약 점안: {{eye_drops_schedule}}\n❌ 세안/샤워 금지 (3일)\n👁️ 시력 회복까지 1-2주 소요\n\n[다음 일정]\n📅 1차 검진: {{first_checkup_date}}\n📅 패치 제거: {{patch_removal_date}}\n\n📞 응급시: {{emergency_phone}}\n🏥 {{clinic_name}}',
        variables: ['patient_name', 'surgery_eye', 'surgery_duration', 'eye_drops_schedule', 'first_checkup_date', 'patch_removal_date', 'emergency_phone', 'clinic_name'],
      },
    ],
    enabled: true,
  },
  {
    name: '수술 후 1일차 관리 안내',
    description: '수술 다음날 관리 및 증상 모니터링',
    trigger: {
      type: 'surgery_completed',
      value: 1,
      unit: 'days',
    },
    messages: [
      {
        channel: 'kakao',
        content: '🌅 수술 후 1일차 안내\n\n{{patient_name}}님, 수술 잘 회복하고 계신가요?\n\n[오늘 관리사항]\n💧 안약 점안: {{eye_drops_today}}\n🛡️ 보호안경 착용 유지\n❌ 눈 비비기 금지\n\n[정상적인 증상]\n• 가벼운 통증\n• 이물감\n• 눈물 흘림\n\n[즉시 연락 필요한 증상]\n🚨 심한 통증\n🚨 시력 급격 악화\n🚨 출혈\n🚨 구토\n\n📞 응급시: {{emergency_phone}}\n📅 다음 검진: {{next_checkup_date}}',
        variables: ['patient_name', 'eye_drops_today', 'emergency_phone', 'next_checkup_date'],
      },
    ],
    enabled: true,
  },
  {
    name: '패치 제거 및 1차 검진 안내',
    description: '수술 후 3일차 패치 제거 및 검진 예약',
    trigger: {
      type: 'surgery_completed',
      value: 3,
      unit: 'days',
    },
    messages: [
      {
        channel: 'kakao',
        content: '👁️ 수술 후 3일차 - 패치 제거 안내\n\n{{patient_name}}님, 오늘 패치를 제거합니다!\n\n📅 패치 제거일: {{patch_removal_date}}\n🕐 검진 시간: {{checkup_time}}\n📍 장소: {{clinic_name}}\n\n[패치 제거 후 주의사항]\n✅ 밝은 빛에 눈 적응\n✅ TV/스마트폰 사용 제한적\n✅ 야외 활동 자제\n\n[안약 점안 계속 유지]\n💧 {{eye_drops_schedule}}\n\n검진 후 시력 회복 상태 확인하겠습니다.\n\n📞 문의: {{clinic_phone}}',
        variables: ['patient_name', 'patch_removal_date', 'checkup_time', 'clinic_name', 'eye_drops_schedule', 'clinic_phone'],
      },
    ],
    enabled: true,
  },
  {
    name: '수술 후 1주일 후기 요청',
    description: '수술 1주일 후 만족도 조사 및 후기 요청',
    trigger: {
      type: 'surgery_completed',
      value: 7,
      unit: 'days',
    },
    messages: [
      {
        channel: 'kakao',
        content: '📝 수술 후 1주일 후기 부탁드립니다!\n\n{{patient_name}}님, 수술 후 일주일이 지났습니다.\n\n시력 회복은 어떠신가요? 😊\n\n[후기 작성 시 혜택]\n🎁 스타벅스 커피 쿠폰\n📱 네이버 리뷰 포인트\n💝 다음 환자 할인 쿠폰\n\n📝 후기 작성: {{review_link}}\n\n소중한 후기가 다른 환자분들에게 큰 도움이 됩니다.\n\n감사합니다! 🙏\n🏥 {{clinic_name}}',
        variables: ['patient_name', 'review_link', 'clinic_name'],
      },
    ],
    enabled: true,
  },
  {
    name: '두 번째 눈 수술 제안',
    description: '첫 번째 눈 수술 후 2개월 뒤 두 번째 눈 제안',
    trigger: {
      type: 'second_eye_eligible',
    },
    messages: [
      {
        channel: 'kakao',
        content: '👁️ 두 눈 모두 치료받으시면 더욱 완벽합니다!\n\n{{patient_name}}님, 첫 번째 눈 수술 후 2개월이 지났습니다.\n\n[두 번째 눈 백내장 수술 혜택]\n✅ 완벽한 양안 시력 회복\n✅ 교통사고 예방\n✅ 일상생활 편리성 대폭 향상\n✅ 가족/친구와의 활동 증가\n\n[특별 할인 이벤트]\n💰 두 번째 눈 20% 할인\n🎁 수술 후 관리 용품 증정\n📅 빠른 예약 우선 배정\n\n지금 상담 예약하시면 자세한 검진 및 상담 드립니다!\n\n📞 예약 문의: {{clinic_phone}}\n🏥 {{clinic_name}}',
        variables: ['patient_name', 'clinic_phone', 'clinic_name'],
      },
    ],
    enabled: true,
  },
  {
    name: '수술 환자 가족 추천 캠페인',
    description: '수술 환자의 가족에게 검진 권유',
    trigger: {
      type: 'family_referral',
    },
    messages: [
      {
        channel: 'kakao',
        content: '👨‍👩‍👧‍👦 가족분들도 백내장 검진 받아보세요!\n\n{{patient_name}}님의 가족분들께,\n\n백내장은 나이가 들면서 자연스럽게 발생하는 증상입니다.\n부모님 또는 배우자분들도 조기 검진을 권장드립니다.\n\n[가족 검진 패키지 혜택]\n👥 2인 동시 검진 15% 할인\n🎁 무료 가족 상담\n📅 주말 검진 가능\n💝 수술 시 가족 할인 적용\n\n백내장은 조기 발견이 중요합니다!\n지금 무료 검진 상담 예약하세요.\n\n📞 가족 검진 문의: {{clinic_phone}}\n🏥 {{clinic_name}}',
        variables: ['patient_name', 'clinic_phone', 'clinic_name'],
      },
    ],
    enabled: true,
  },
  {
    name: '수술 6개월 후 안과 검진 리마인드',
    description: '정기 검진 및 추가 서비스 제안',
    trigger: {
      type: 'surgery_completed',
      value: 180,
      unit: 'days',
    },
    messages: [
      {
        channel: 'kakao',
        content: '👁️ 정기 안과 검진 시기입니다!\n\n{{patient_name}}님, 수술 후 6개월이 지났습니다.\n\n[정기 검진 권장사항]\n✅ 시력 및 안압 검사\n✅ 수정체 상태 확인\n✅ 녹내장 조기 발견\n✅ 노안 진행 상태 체크\n\n[추가 서비스 제안]\n🔄 노안 교정 수술 상담\n🛡️ 녹내장 예방 관리\n👓 안경/콘택트렌즈 검진\n\n정기 검진으로 건강한 눈 관리하세요!\n\n📅 검진 예약: {{clinic_phone}}\n🏥 {{clinic_name}}',
        variables: ['patient_name', 'clinic_phone', 'clinic_name'],
      },
    ],
    enabled: true,
  },
];

/**
 * 기본 템플릿 데이터
 */
export const defaultTemplates: Omit<MarketingTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: '예약 완료 리마인더',
    description: '예약이 완료되면 카톡과 SMS로 리마인더를 발송합니다',
    trigger: {
      type: 'appointment_completed',
    },
    messages: [
      {
        channel: 'kakao',
        content: '안녕하세요 {{patient_name}}님! 예약이 완료되었습니다.\n\n📅 예약일시: {{appointment_date}} {{appointment_time}}\n📍 병원: 닥터스플로우 안과·성형외과\n\n예약 전날 다시 한번 안내드리겠습니다.',
        variables: ['patient_name', 'appointment_date', 'appointment_time'],
      },
      {
        channel: 'sms',
        content: '[닥터스플로우] {{patient_name}}님, 예약이 완료되었습니다. 예약일시: {{appointment_date}} {{appointment_time}}',
        variables: ['patient_name', 'appointment_date', 'appointment_time'],
      },
    ],
    enabled: true,
  },
  {
    name: '수술 후 후기 요청',
    description: '수술 후 3일째 후기 요청 문자를 발송합니다',
    trigger: {
      type: 'days_after_surgery',
      value: 3,
      unit: 'days',
    },
    messages: [
      {
        channel: 'sms',
        content: '[닥터스플로우] {{patient_name}}님, 수술 후 회복은 잘 되고 계신가요? 소중한 후기를 남겨주시면 다른 환자분들에게 큰 도움이 됩니다. 후기 작성: {{review_link}}',
        variables: ['patient_name', 'review_link'],
      },
    ],
    enabled: true,
  },
  {
    name: '생일 할인 쿠폰',
    description: '생일 3일 전 할인 쿠폰을 카톡으로 발송합니다',
    trigger: {
      type: 'days_before_birthday',
      value: 3,
      unit: 'days',
    },
    messages: [
      {
        channel: 'kakao',
        content: '🎉 {{patient_name}}님의 생일을 축하합니다!\n\n생일을 맞이하여 특별 할인 쿠폰을 드립니다.\n\n💰 할인율: 20%\n📅 유효기간: {{coupon_expiry}}\n🎁 쿠폰번호: {{coupon_code}}\n\n예약 시 쿠폰번호를 말씀해주시면 할인이 적용됩니다.',
        variables: ['patient_name', 'coupon_expiry', 'coupon_code'],
      },
    ],
    enabled: true,
  },
  {
    name: '재방문 유도',
    description: '3개월 미방문 환자에게 재방문 유도 문자를 발송합니다',
    trigger: {
      type: 'months_since_last_visit',
      value: 3,
      unit: 'months',
    },
    messages: [
      {
        channel: 'sms',
        content: '[닥터스플로우] {{patient_name}}님, 오랜만입니다! 정기 검진으로 건강을 확인하시는 것을 권장드립니다. 예약: {{booking_link}} 또는 {{phone_number}}',
        variables: ['patient_name', 'booking_link', 'phone_number'],
      },
    ],
    enabled: true,
  },
  {
    name: 'Naver 리뷰 작성 유도',
    description: 'Naver 리뷰 작성 링크를 발송합니다',
    trigger: {
      type: 'review_request',
    },
    messages: [
      {
        channel: 'kakao',
        content: '안녕하세요 {{patient_name}}님!\n\n소중한 시간 내어 방문해주셔서 감사합니다.\n\n만족스러우셨다면 Naver 리뷰를 남겨주시면 큰 도움이 됩니다.\n\n📝 리뷰 작성하기: {{naver_review_link}}\n\n소정의 감사 선물도 준비되어 있습니다!',
        variables: ['patient_name', 'naver_review_link'],
      },
    ],
    enabled: true,
  },
];

