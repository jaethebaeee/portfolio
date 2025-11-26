
export type WorkflowStepType = 'survey' | 'photo';

export interface WorkflowStep {
  day: number; // 수술 후 N일차
  type: WorkflowStepType;
  message_template?: string; // 발송할 메시지 내용
  title?: string; // 스텝 제목 (예: 1일차 통증 확인)
}

export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  trigger_type: 'post_surgery';
  steps: WorkflowStep[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  visual_data?: { nodes: any[], edges: any[] };
  target_surgery_type?: string;
}

export interface WorkflowNodeData extends Record<string, unknown> {
  label: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'time_window';
  
  // Trigger Specific
  triggerType?: 'surgery_completed' | 'appointment_created' | 'appointment_completed' | 'appointment_cancelled' | 'appointment_no_show' | 'manual' | 'schedule' | 'webhook' | 'keyword_received';
  keywordConfig?: {
    keywords: string[]; // e.g. ["위치", "주차", "비용"]
    matchType: 'exact' | 'contains';
  };
  scheduleConfig?: {
    cron: string;
    interval?: number;
  };

  // Action Specific
  actionType?: 'send_kakao' | 'send_sms' | 'send_email' | 'update_patient' | 'http_request' | 'survey_cancellation_reason' | 'survey_patient_feedback' | 'medication_reminder';
  templateId?: string;
  message_template?: string;
  
  // Email Specific
  emailConfig?: {
    subject: string;
  };

  // Survey Specific
  surveyType?: 'cancellation_reason' | 'patient_feedback' | 'satisfaction';
  surveyOptions?: {
    question: string;
    options?: string[]; // For multiple choice surveys
    allowCustomResponse?: boolean;
  };
  
  // Medication Reminder Specific
  medication?: {
    name: string;
    frequency: string; // e.g. "4회/일"
    times: string[]; // e.g. ["08:00", "12:00", "18:00", "22:00"]
    duration: number; // days
    instructions: string; // e.g. "1방울씩 점안"
  };
  
  // HTTP Request Specific
  httpRequest?: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    headers?: { key: string; value: string }[];
    body?: string;
  };

  // Condition Specific
  condition?: {
    variable: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: string;
  };

  // Delay Specific
  delay?: {
    type: 'minutes' | 'hours' | 'days' | 'business_days';
    value: number;
    skipWeekends?: boolean; // For business_days: skip weekends (default: true)
    skipHolidays?: boolean; // For business_days: skip Korean holidays (default: true)
  };

  // Time Window Specific
  timeWindow?: {
    startTime: string; // "09:00"
    endTime: string;   // "18:00"
    timezone?: string; // "Asia/Seoul"
  };
}

export const defaultWorkflows: Omit<Workflow, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  {
    name: '라식/라섹 수술 후 케어',
    description: '시력 교정 수술 환자를 위한 표준 해피콜',
    trigger_type: 'post_surgery',
    is_active: true,
    steps: [
      {
        day: 1,
        type: 'survey',
        title: '통증 및 불편감 확인',
        message_template: '안녕하세요 {{patient_name}}님, 수술 후 하루가 지났습니다. 현재 눈 상태는 어떠신가요? 아래 버튼을 눌러 상태를 알려주세요.'
      },
      {
        day: 3,
        type: 'photo',
        title: '충혈 상태 확인',
        message_template: '{{patient_name}}님, 회복은 잘 되고 계신가요? 수술 부위 확인을 위해 눈 사진을 찍어 보내주세요.'
      }
    ]
  },
  {
    name: '쌍꺼풀 수술 후 케어',
    description: '성형외과 눈 수술 환자 케어',
    trigger_type: 'post_surgery',
    is_active: true,
    steps: [
      {
        day: 1,
        type: 'survey',
        title: '붓기 및 통증 확인',
        message_template: '수술 받으시느라 고생 많으셨습니다. 현재 붓기나 통증은 어떠신가요?'
      },
      {
        day: 7,
        type: 'photo',
        title: '실밥 제거 전 상태 확인',
        message_template: '실밥 제거 예정일이 다가옵니다. 현재 상태 확인을 위해 수술 부위 사진을 부탁드립니다.'
      }
    ]
  }
];
