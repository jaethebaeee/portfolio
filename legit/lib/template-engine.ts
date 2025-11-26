/**
 * 템플릿 실행 엔진
 * 변수 치환 및 템플릿 실행 로직
 */

import { MarketingTemplate, TemplateMessage } from './template-types';
import { Patient, Appointment } from './database.types';
import { processConditionalText } from './conditional-logic';
import { sendSmartMessage } from './smart-messaging';

export interface TemplateVariableContext {
  patient?: Patient;
  appointment?: Appointment;
  customVariables?: Record<string, string>;
}

/**
 * 템플릿 변수 값 생성
 */
export function generateTemplateVariables(
  context: TemplateVariableContext
): Record<string, string> {
  const variables: Record<string, string> = {
    // 기본 변수
    phone_number: '02-1234-5678', // 병원 전화번호 (설정 가능)
    booking_link: 'https://doctorsflow.com/booking',
    review_link: 'https://doctorsflow.com/review',
    naver_review_link: 'https://map.naver.com/...', // Naver 리뷰 링크
  };

  // 환자 정보
  if (context.patient) {
    const patient = context.patient;
    variables.patient_name = patient.name || '';
    variables.patient_phone = patient.phone || '';
    variables.patient_email = patient.email || '';
    
    if (patient.birth_date) {
      const birthDate = new Date(patient.birth_date);
      const todayForBirthday = new Date();
      const thisYearBirthday = new Date(todayForBirthday.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      
      // 생일까지 남은 일수 계산
      if (thisYearBirthday < todayForBirthday) {
        thisYearBirthday.setFullYear(todayForBirthday.getFullYear() + 1);
      }
      const daysUntilBirthday = Math.ceil((thisYearBirthday.getTime() - todayForBirthday.getTime()) / (1000 * 60 * 60 * 24));
      variables.days_until_birthday = daysUntilBirthday.toString();
    }

    if (patient.last_visit_date) {
      const lastVisit = new Date(patient.last_visit_date);
      const todayForVisit = new Date();
      const monthsSinceVisit = Math.floor(
        (todayForVisit.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      variables.months_since_last_visit = monthsSinceVisit.toString();
    }

    if (patient.last_surgery_date) {
      const surgeryDate = new Date(patient.last_surgery_date);
      const todayForSurgery = new Date();
      const daysSinceSurgery = Math.floor(
        (todayForSurgery.getTime() - surgeryDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      variables.days_since_surgery = daysSinceSurgery.toString();
    }
  }

  // 예약 정보
  if (context.appointment) {
    const appointment = context.appointment;
    const appointmentDate = new Date(appointment.appointment_date);
    
    variables.appointment_date = appointmentDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    variables.appointment_time = appointment.appointment_time || '';
    variables.appointment_type = appointment.type || '';
  }

  // 쿠폰 변수 생성 (동적)
  if (!variables.coupon_code) {
    variables.coupon_code = generateCouponCode();
  }
  if (!variables.coupon_expiry) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30일 후 만료
    variables.coupon_expiry = expiryDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // 커스텀 변수 병합
  if (context.customVariables) {
    Object.assign(variables, context.customVariables);
  }

  return variables;
}

/**
 * 쿠폰 코드 생성
 */
function generateCouponCode(): string {
  const prefix = 'DF';
  const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `${prefix}-${randomNum}`;
}

/**
 * 템플릿 메시지에서 변수 치환 및 조건부 로직 처리
 */
export function replaceTemplateVariables(
  content: string,
  variables: Record<string, string>
): string {
  let result = content;
  
  // 1. 조건부 로직 처리 ({{if}} ... {{else}} ... {{/if}})
  result = processConditionalText(result, variables);
  
  // 2. {{variable}} 형식의 변수를 찾아서 치환
  const variableRegex = /\{\{(\w+)\}\}/g;
  
  result = result.replace(variableRegex, (match, varName) => {
    // 조건부 키워드는 건너뛰기
    if (['if', 'else', '/if'].includes(varName)) {
      return match;
    }
    
    const value = variables[varName];
    if (value !== undefined) {
      return value;
    }
    // 변수가 없으면 원본 유지 (또는 빈 문자열)
    console.warn(`템플릿 변수 '${varName}'을 찾을 수 없습니다.`);
    return match; // 또는 '' 빈 문자열로 대체 가능
  });

  return result;
}

/**
 * 템플릿 메시지 실행 (단일 메시지 발송)
 * Updated to use sendSmartMessage (Smart Failover)
 */
export async function executeTemplateMessage(
  userId: string,
  message: TemplateMessage,
  variables: Record<string, string>,
  patientId?: string,
  templateId?: string,
  campaignId?: string
): Promise<{ success: boolean; error?: string }> {
  // 변수 치환
  const content = replaceTemplateVariables(message.content, variables);
  
  // 환자 전화번호 가져오기
  const recipientPhone = variables.patient_phone || variables.recipient_phone;
  if (!recipientPhone) {
    return {
      success: false,
      error: '수신자 전화번호가 없습니다.',
    };
  }

  try {
    // Smart Failover System 사용
    const result = await sendSmartMessage(userId, {
      recipientPhone,
      content,
      // 카카오 템플릿 ID 등을 넘길 수 있음 (현재는 구조상 content만 처리)
    }, {
      patientId,
      templateId,
      campaignId
    });

    return {
      success: result.success,
      error: result.error
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 템플릿 실행 (전체 메시지 발송)
 */
export async function executeTemplate(
  userId: string,
  template: MarketingTemplate,
  context: TemplateVariableContext,
  patientId?: string,
  campaignId?: string
): Promise<{
  success: boolean;
  sentCount: number;
  failedCount: number;
  errors: string[];
}> {
  if (!template.enabled) {
    return {
      success: false,
      sentCount: 0,
      failedCount: 0,
      errors: ['템플릿이 비활성화되어 있습니다.'],
    };
  }

  // 변수 생성
  const variables = generateTemplateVariables(context);

  // 모든 메시지 실행
  const results = await Promise.allSettled(
    template.messages.map((message) =>
      executeTemplateMessage(
        userId,
        message,
        variables,
        patientId,
        template.id,
        campaignId
      )
    )
  );

  // 결과 집계
  let sentCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      if (result.value.success) {
        sentCount++;
      } else {
        failedCount++;
        if (result.value.error) {
          errors.push(`메시지 ${index + 1}: ${result.value.error}`);
        }
      }
    } else {
      failedCount++;
      errors.push(`메시지 ${index + 1}: ${result.reason?.message || '알 수 없는 오류'}`);
    }
  });

  return {
    success: sentCount > 0,
    sentCount,
    failedCount,
    errors,
  };
}

/**
 * 트리거 조건 확인
 */
export function checkTriggerCondition(
  template: MarketingTemplate,
  context: TemplateVariableContext
): boolean {
  const { trigger } = template;
  const { patient } = context;

  if (!patient) {
    return false;
  }

  switch (trigger.type) {
    case 'appointment_completed':
      // 예약 완료는 별도로 처리 (예약 생성 시 직접 호출)
      return context.appointment !== undefined;

    case 'days_after_surgery':
      if (!patient.last_surgery_date || !trigger.value) {
        return false;
      }
      const surgeryDate = new Date(patient.last_surgery_date);
      const todayForSurgeryCheck = new Date();
      const daysSinceSurgery = Math.floor(
        (todayForSurgeryCheck.getTime() - surgeryDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceSurgery === trigger.value;

    case 'days_before_birthday':
      if (!patient.birth_date || !trigger.value) {
        return false;
      }
      const birthDate = new Date(patient.birth_date);
      const todayForBirthday = new Date();
      const thisYearBirthday = new Date(
        todayForBirthday.getFullYear(),
        birthDate.getMonth(),
        birthDate.getDate()
      );
      
      if (thisYearBirthday < todayForBirthday) {
        thisYearBirthday.setFullYear(todayForBirthday.getFullYear() + 1);
      }
      
      const daysUntilBirthday = Math.ceil(
        (thisYearBirthday.getTime() - todayForBirthday.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilBirthday === trigger.value;

    case 'months_since_last_visit':
      if (!patient.last_visit_date || !trigger.value) {
        return false;
      }
      const lastVisit = new Date(patient.last_visit_date);
      const todayForVisit = new Date();
      const monthsSinceVisit = Math.floor(
        (todayForVisit.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      return monthsSinceVisit >= trigger.value;

    case 'review_request':
      // 리뷰 요청은 수동 실행 또는 별도 로직 필요
      return true;

    default:
      return false;
  }
}
