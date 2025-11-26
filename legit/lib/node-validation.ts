/**
 * 노드 검증 유틸리티
 */

import { WorkflowNodeData } from './workflow-types';

export interface NodeValidationError {
  field: string;
  message: string;
}

/**
 * 트리거 노드 검증
 */
export function validateTriggerNode(data: WorkflowNodeData): NodeValidationError[] {
  const errors: NodeValidationError[] = [];

  if (!data.triggerType) {
    errors.push({
      field: 'triggerType',
      message: '트리거 타입이 필요합니다.',
    });
  }

  if (data.triggerType === 'schedule' && !data.scheduleConfig) {
    errors.push({
      field: 'scheduleConfig',
      message: '스케줄 설정이 필요합니다.',
    });
  }

  return errors;
}

/**
 * 액션 노드 검증
 */
export function validateActionNode(data: WorkflowNodeData): NodeValidationError[] {
  const errors: NodeValidationError[] = [];

  if (!data.actionType) {
    errors.push({
      field: 'actionType',
      message: '액션 타입이 필요합니다.',
    });
  }

  // 메시지 발송 액션은 템플릿 또는 메시지 템플릿 필요
  if (['send_kakao', 'send_sms', 'send_email'].includes(data.actionType || '')) {
    if (!data.templateId && !data.message_template) {
      errors.push({
        field: 'templateId',
        message: '템플릿 ID 또는 메시지 템플릿이 필요합니다.',
      });
    }
  }

  // HTTP Request 검증
  if (data.actionType === 'http_request') {
    if (!data.httpRequest || !data.httpRequest.url) {
      errors.push({
        field: 'httpRequest.url',
        message: 'HTTP 요청 URL이 필요합니다.',
      });
    }
    if (data.httpRequest && !data.httpRequest.method) {
      errors.push({
        field: 'httpRequest.method',
        message: 'HTTP 요청 메서드가 필요합니다.',
      });
    }
  }

  // Medication Reminder 검증
  if (data.actionType === 'medication_reminder') {
    if (!data.medication) {
      errors.push({
        field: 'medication',
        message: '약물 정보가 필요합니다.',
      });
      return errors;
    }

    if (!data.medication.name || data.medication.name.trim() === '') {
      errors.push({
        field: 'medication.name',
        message: '약물 이름이 필요합니다.',
      });
    }

    if (!data.medication.times || data.medication.times.length === 0) {
      errors.push({
        field: 'medication.times',
        message: '복약 시간이 최소 1개 이상 필요합니다.',
      });
    } else {
      // 시간 형식 검증 (HH:MM)
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      data.medication.times.forEach((time, index) => {
        if (!timeRegex.test(time)) {
          errors.push({
            field: `medication.times[${index}]`,
            message: `복약 시간 형식이 올바르지 않습니다. (HH:MM 형식): ${time}`,
          });
        }
      });
    }

    if (!data.medication.duration || data.medication.duration <= 0) {
      errors.push({
        field: 'medication.duration',
        message: '복약 기간은 1일 이상이어야 합니다.',
      });
    }

    if (!data.medication.instructions || data.medication.instructions.trim() === '') {
      errors.push({
        field: 'medication.instructions',
        message: '복약 방법이 필요합니다.',
      });
    }
  }

  return errors;
}

/**
 * 조건 노드 검증
 */
export function validateConditionNode(data: WorkflowNodeData): NodeValidationError[] {
  const errors: NodeValidationError[] = [];

  if (!data.condition) {
    errors.push({
      field: 'condition',
      message: '조건이 필요합니다.',
    });
    return errors;
  }

  if (!data.condition.variable) {
    errors.push({
      field: 'condition.variable',
      message: '조건 변수가 필요합니다.',
    });
  }

  if (!data.condition.operator) {
    errors.push({
      field: 'condition.operator',
      message: '조건 연산자가 필요합니다.',
    });
  }

  if (data.condition.value === undefined || data.condition.value === '') {
    errors.push({
      field: 'condition.value',
      message: '조건 값이 필요합니다.',
    });
  }

  return errors;
}

/**
 * 지연 노드 검증
 */
export function validateDelayNode(data: WorkflowNodeData): NodeValidationError[] {
  const errors: NodeValidationError[] = [];

  if (!data.delay) {
    errors.push({
      field: 'delay',
      message: '지연 설정이 필요합니다.',
    });
    return errors;
  }

  if (!data.delay.type) {
    errors.push({
      field: 'delay.type',
      message: '지연 타입이 필요합니다.',
    });
  }

  if (data.delay.value === undefined || data.delay.value <= 0) {
    errors.push({
      field: 'delay.value',
      message: '지연 값은 0보다 커야 합니다.',
    });
  }

  // Basic max delay check (30 days) - async validation happens at runtime
  if (data.delay.value && data.delay.type) {
    // Quick synchronous check for obvious violations
    if (data.delay.type === 'days' && data.delay.value > 30) {
      errors.push({
        field: 'delay.value',
        message: '지연 시간은 30일을 초과할 수 없습니다.',
      });
    }
    // Note: Full validation with business days and holidays happens at runtime
  }

  return errors;
}

/**
 * 시간 제한 노드 검증
 */
export function validateTimeWindowNode(data: WorkflowNodeData): NodeValidationError[] {
  const errors: NodeValidationError[] = [];

  if (!data.timeWindow) {
    errors.push({
      field: 'timeWindow',
      message: '시간 제한 설정이 필요합니다.',
    });
    return errors;
  }

  if (!data.timeWindow.startTime) {
    errors.push({
      field: 'timeWindow.startTime',
      message: '시작 시간이 필요합니다.',
    });
  }

  if (!data.timeWindow.endTime) {
    errors.push({
      field: 'timeWindow.endTime',
      message: '종료 시간이 필요합니다.',
    });
  }

  // 시간 형식 검증 (HH:MM)
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  if (data.timeWindow.startTime && !timeRegex.test(data.timeWindow.startTime)) {
    errors.push({
      field: 'timeWindow.startTime',
      message: '시작 시간 형식이 올바르지 않습니다. (HH:MM 형식)',
    });
  }

  if (data.timeWindow.endTime && !timeRegex.test(data.timeWindow.endTime)) {
    errors.push({
      field: 'timeWindow.endTime',
      message: '종료 시간 형식이 올바르지 않습니다. (HH:MM 형식)',
    });
  }

  return errors;
}

/**
 * 노드 타입별 검증
 */
export function validateNode(data: WorkflowNodeData): NodeValidationError[] {
  switch (data.type) {
    case 'trigger':
      return validateTriggerNode(data);
    case 'action':
      return validateActionNode(data);
    case 'condition':
      return validateConditionNode(data);
    case 'delay':
      return validateDelayNode(data);
    case 'time_window':
      return validateTimeWindowNode(data);
    default:
      return [];
  }
}

/**
 * 검증 오류를 문자열 배열로 변환
 */
export function getValidationErrorMessages(errors: NodeValidationError[]): string[] {
  return errors.map(error => error.message);
}

