"use client";

import { Handle, Position } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Phone, Mail, User, Calendar, Stethoscope, Gift, Star, FileText, Pill } from 'lucide-react';
import { WorkflowNodeData } from '@/lib/workflow-types';

interface ActionNodeProps {
  data: WorkflowNodeData;
  selected?: boolean;
}

const actionIcons = {
  send_kakao: MessageSquare,
  send_sms: Phone,
  send_email: Mail,
  update_patient: User,
  create_appointment: Calendar,
  send_surgery_reminder: Stethoscope,
  send_post_surgery_care: Stethoscope,
  send_coupon: Gift,
  request_review: Star,
  send_consultation_result: FileText,
  medication_reminder: Pill,
};

const actionLabels = {
  send_kakao: '카카오톡 발송',
  send_sms: 'SMS 발송',
  send_email: '이메일 발송',
  update_patient: '환자 정보 업데이트',
  create_appointment: '예약 생성',
  send_surgery_reminder: '수술 리마인더 발송',
  send_post_surgery_care: '수술 후 케어 안내',
  send_coupon: '할인 쿠폰 발송',
  request_review: '후기 요청',
  send_consultation_result: '상담 결과 발송',
  medication_reminder: '복약 리마인더',
};

export function ActionNode({ data, selected }: ActionNodeProps) {
  const Icon = data.actionType ? actionIcons[data.actionType] : MessageSquare;
  const label = data.actionType ? actionLabels[data.actionType] : data.label;

  return (
    <Card className={`min-w-[200px] ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded">
            <Icon className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">{label}</div>
            {data.templateId && (
              <div className="text-xs text-muted-foreground mt-1">
                템플릿: {data.templateId}
              </div>
            )}
          </div>
          <Badge variant="outline" className="text-xs">액션</Badge>
        </div>
      </CardContent>
      <Handle type="target" position={Position.Top} className="!bg-green-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-green-500" />
    </Card>
  );
}

