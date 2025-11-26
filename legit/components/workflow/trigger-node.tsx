"use client";

import { Handle, Position } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Webhook, Calendar, UserPlus } from 'lucide-react';
import { WorkflowNodeData } from '@/lib/workflow-types';

interface TriggerNodeProps {
  data: WorkflowNodeData;
  selected?: boolean;
}

import { Stethoscope, Heart, Gift } from 'lucide-react';

const triggerIcons = {
  appointment_created: Calendar,
  appointment_completed: Calendar,
  patient_registered: UserPlus,
  manual: Clock,
  schedule: Clock,
  webhook: Webhook,
  surgery_completed: Stethoscope,
  consultation_completed: Calendar,
  post_surgery_day: Stethoscope,
  before_birthday: Gift,
  no_visit_period: UserPlus,
  review_request: Heart,
};

const triggerLabels = {
  appointment_created: '예약 생성',
  appointment_completed: '예약 완료',
  patient_registered: '환자 등록',
  manual: '수동 실행',
  schedule: '스케줄',
  webhook: '웹훅',
  surgery_completed: '수술 완료',
  consultation_completed: '상담 완료',
  post_surgery_day: '수술 후 N일',
  before_birthday: '생일 N일 전',
  no_visit_period: 'N개월 미방문',
  review_request: '후기 요청',
};

export function TriggerNode({ data, selected }: TriggerNodeProps) {
  const Icon = data.triggerType ? triggerIcons[data.triggerType] : Clock;
  const label = data.triggerType ? triggerLabels[data.triggerType] : data.label;

  return (
    <Card className={`min-w-[200px] ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded">
            <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">{label}</div>
            {data.scheduleConfig && (
              <div className="text-xs text-muted-foreground mt-1">
                {data.scheduleConfig.cron || `매 ${data.scheduleConfig.interval}분`}
              </div>
            )}
          </div>
          <Badge variant="outline" className="text-xs">트리거</Badge>
        </div>
      </CardContent>
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </Card>
  );
}

