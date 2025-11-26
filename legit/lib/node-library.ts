/**
 * 노드 라이브러리 정의
 * 사이드바에 표시할 노드 목록 및 메타데이터
 */

import { 
  Clock, Webhook, Calendar, UserPlus, Stethoscope, Heart, Gift,
  MessageSquare, Phone, Mail, User, FileText, Star,
  GitBranch, Sun, Search, Filter, Pill
} from 'lucide-react';

export interface NodeLibraryItem {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'time_window';
  subType: string;
  label: string;
  description: string;
  icon: any;
  color: string;
  category: string;
  tags: string[];
}

export const NODE_LIBRARY: NodeLibraryItem[] = [
  // 트리거
  {
    id: 'trigger-surgery-completed',
    type: 'trigger',
    subType: 'surgery_completed',
    label: '수술 완료',
    description: '환자의 수술이 완료되면 워크플로우를 시작합니다',
    icon: Stethoscope,
    color: 'text-blue-500',
    category: '트리거',
    tags: ['수술', '완료', '자동'],
  },
  {
    id: 'trigger-appointment-created',
    type: 'trigger',
    subType: 'appointment_created',
    label: '예약 생성',
    description: '새로운 예약이 생성되면 워크플로우를 시작합니다',
    icon: Calendar,
    color: 'text-blue-500',
    category: '트리거',
    tags: ['예약', '생성', '자동'],
  },
  {
    id: 'trigger-appointment-completed',
    type: 'trigger',
    subType: 'appointment_completed',
    label: '예약 완료',
    description: '예약이 완료되면 워크플로우를 시작합니다',
    icon: Calendar,
    color: 'text-blue-500',
    category: '트리거',
    tags: ['예약', '완료', '자동'],
  },
  {
    id: 'trigger-appointment-cancelled',
    type: 'trigger',
    subType: 'appointment_cancelled',
    label: '예약 취소',
    description: '예약이 취소되면 워크플로우를 시작합니다',
    icon: Calendar,
    color: 'text-red-500',
    category: '트리거',
    tags: ['예약', '취소', '자동', '노쇼'],
  },
  {
    id: 'trigger-appointment-no-show',
    type: 'trigger',
    subType: 'appointment_no_show',
    label: '노쇼 (No-Show)',
    description: '예약 시간에 환자가 나타나지 않으면 워크플로우를 시작합니다',
    icon: Calendar,
    color: 'text-orange-500',
    category: '트리거',
    tags: ['예약', '노쇼', '부재중', '자동'],
  },
  {
    id: 'trigger-patient-registered',
    type: 'trigger',
    subType: 'patient_registered',
    label: '환자 등록',
    description: '새로운 환자가 등록되면 워크플로우를 시작합니다',
    icon: UserPlus,
    color: 'text-blue-500',
    category: '트리거',
    tags: ['환자', '등록', '자동'],
  },
  {
    id: 'trigger-webhook',
    type: 'trigger',
    subType: 'webhook',
    label: '웹훅',
    description: '외부 시스템에서 웹훅을 받으면 워크플로우를 시작합니다',
    icon: Webhook,
    color: 'text-blue-500',
    category: '트리거',
    tags: ['웹훅', '외부', 'API'],
  },
  {
    id: 'trigger-manual',
    type: 'trigger',
    subType: 'manual',
    label: '수동 실행',
    description: '수동으로 워크플로우를 실행합니다',
    icon: Clock,
    color: 'text-blue-500',
    category: '트리거',
    tags: ['수동', '실행'],
  },
  {
    id: 'trigger-schedule',
    type: 'trigger',
    subType: 'schedule',
    label: '스케줄',
    description: '정해진 시간에 워크플로우를 실행합니다',
    icon: Clock,
    color: 'text-blue-500',
    category: '트리거',
    tags: ['스케줄', '시간', '반복'],
  },
  
  // 액션
  {
    id: 'action-send-kakao',
    type: 'action',
    subType: 'send_kakao',
    label: '카카오톡 발송',
    description: '카카오톡 비즈니스 메시지를 발송합니다',
    icon: MessageSquare,
    color: 'text-yellow-500',
    category: '메시지 발송',
    tags: ['카카오톡', '메시지', '발송'],
  },
  {
    id: 'action-send-sms',
    type: 'action',
    subType: 'send_sms',
    label: 'SMS 발송',
    description: 'SMS 문자 메시지를 발송합니다',
    icon: Phone,
    color: 'text-blue-500',
    category: '메시지 발송',
    tags: ['SMS', '문자', '발송'],
  },
  {
    id: 'action-send-email',
    type: 'action',
    subType: 'send_email',
    label: '이메일 발송',
    description: '이메일을 발송합니다',
    icon: Mail,
    color: 'text-purple-500',
    category: '메시지 발송',
    tags: ['이메일', '발송'],
  },
  {
    id: 'action-update-patient',
    type: 'action',
    subType: 'update_patient',
    label: '환자 정보 업데이트',
    description: '환자의 정보를 업데이트합니다',
    icon: User,
    color: 'text-indigo-500',
    category: '데이터 관리',
    tags: ['환자', '업데이트', '정보'],
  },
  {
    id: 'action-create-appointment',
    type: 'action',
    subType: 'create_appointment',
    label: '예약 생성',
    description: '새로운 예약을 생성합니다',
    icon: Calendar,
    color: 'text-green-500',
    category: '데이터 관리',
    tags: ['예약', '생성'],
  },
  {
    id: 'action-send-surgery-reminder',
    type: 'action',
    subType: 'send_surgery_reminder',
    label: '수술 리마인더 발송',
    description: '수술 전 리마인더 메시지를 발송합니다',
    icon: Stethoscope,
    color: 'text-red-500',
    category: '케어',
    tags: ['수술', '리마인더', '케어'],
  },
  {
    id: 'action-send-post-surgery-care',
    type: 'action',
    subType: 'send_post_surgery_care',
    label: '수술 후 케어 안내',
    description: '수술 후 케어 안내 메시지를 발송합니다',
    icon: Stethoscope,
    color: 'text-pink-500',
    category: '케어',
    tags: ['수술', '케어', '안내'],
  },
  {
    id: 'action-send-coupon',
    type: 'action',
    subType: 'send_coupon',
    label: '할인 쿠폰 발송',
    description: '할인 쿠폰을 발송합니다',
    icon: Gift,
    color: 'text-orange-500',
    category: '마케팅',
    tags: ['쿠폰', '할인', '마케팅'],
  },
  {
    id: 'action-request-review',
    type: 'action',
    subType: 'request_review',
    label: '후기 요청',
    description: '환자에게 후기 작성을 요청합니다',
    icon: Star,
    color: 'text-amber-500',
    category: '마케팅',
    tags: ['후기', '리뷰', '마케팅'],
  },
  {
    id: 'action-send-consultation-result',
    type: 'action',
    subType: 'send_consultation_result',
    label: '상담 결과 발송',
    description: '상담 결과를 발송합니다',
    icon: FileText,
    color: 'text-teal-500',
    category: '케어',
    tags: ['상담', '결과', '발송'],
  },
  
  // 흐름 제어
  {
    id: 'condition-if',
    type: 'condition',
    subType: 'condition',
    label: '조건 분기 (IF)',
    description: '조건에 따라 흐름을 분기합니다',
    icon: GitBranch,
    color: 'text-orange-500',
    category: '흐름 제어',
    tags: ['조건', '분기', 'IF'],
  },
  {
    id: 'delay-wait',
    type: 'delay',
    subType: 'delay',
    label: '지연 (Delay)',
    description: '지정한 시간만큼 대기한 후 다음 단계로 진행합니다',
    icon: Clock,
    color: 'text-purple-500',
    category: '흐름 제어',
    tags: ['지연', '대기', '시간'],
  },
  {
    id: 'time-window',
    type: 'time_window',
    subType: 'time_window',
    label: '발송 가능 시간',
    description: '지정한 시간대에만 다음 단계로 진행합니다',
    icon: Sun,
    color: 'text-orange-500',
    category: '흐름 제어',
    tags: ['시간', '제한', '시간대'],
  },
  
  // Survey Nodes
  {
    id: 'survey-cancellation-reason',
    type: 'action',
    subType: 'survey_cancellation_reason',
    label: '취소 사유 수집',
    description: '예약 취소 사유를 수집하는 설문을 발송합니다',
    icon: FileText,
    color: 'text-red-500',
    category: '설문',
    tags: ['취소', '설문', '사유', '수집'],
  },
  {
    id: 'survey-patient-feedback',
    type: 'action',
    subType: 'survey_patient_feedback',
    label: '환자 피드백 수집',
    description: '환자의 피드백을 수집하는 설문을 발송합니다',
    icon: MessageSquare,
    color: 'text-blue-500',
    category: '설문',
    tags: ['피드백', '설문', '수집'],
  },
  {
    id: 'action-medication-reminder',
    type: 'action',
    subType: 'medication_reminder',
    label: '복약 리마인더',
    description: '환자에게 약물 복용 시간을 알려주는 리마인더를 설정합니다',
    icon: Pill,
    color: 'text-green-500',
    category: '케어',
    tags: ['약물', '복약', '리마인더', '케어'],
  },
];

/**
 * 카테고리별로 노드 그룹화
 */
export function getNodesByCategory(): Record<string, NodeLibraryItem[]> {
  const grouped: Record<string, NodeLibraryItem[]> = {};
  NODE_LIBRARY.forEach(node => {
    if (!grouped[node.category]) {
      grouped[node.category] = [];
    }
    grouped[node.category].push(node);
  });
  return grouped;
}

/**
 * 검색으로 노드 필터링
 */
export function searchNodes(query: string): NodeLibraryItem[] {
  if (!query.trim()) return NODE_LIBRARY;
  
  const lowerQuery = query.toLowerCase();
  return NODE_LIBRARY.filter(node => 
    node.label.toLowerCase().includes(lowerQuery) ||
    node.description.toLowerCase().includes(lowerQuery) ||
    node.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * 타입별로 노드 필터링
 */
export function filterNodesByType(type: string): NodeLibraryItem[] {
  if (!type) return NODE_LIBRARY;
  return NODE_LIBRARY.filter(node => node.type === type);
}

