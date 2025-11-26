"use client";

import { Handle, Position } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Webhook, Calendar, UserPlus, Stethoscope, Heart, Gift, Info, MessageCircle } from 'lucide-react';
import { getStatusIcon } from '@/lib/utils/node-status';
import { WorkflowNodeData } from '@/lib/workflow-types';
import { NodeStatus, NodeExecutionInfo } from '@/lib/node-status';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface EnhancedTriggerNodeProps {
  data: WorkflowNodeData & { 
    executionInfo?: NodeExecutionInfo;
    validationErrors?: string[];
  };
  selected?: boolean;
}


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
  keyword_received: MessageCircle,
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
  keyword_received: '키워드 수신',
};

export function EnhancedTriggerNode({ data, selected }: EnhancedTriggerNodeProps) {
  const triggerType = data.triggerType || 'manual';
  const Icon = triggerIcons[triggerType as keyof typeof triggerIcons] || Clock;
  const label = triggerLabels[triggerType as keyof typeof triggerLabels] || '트리거';
  const status = data.executionInfo?.status;
  const hasErrors = data.validationErrors && data.validationErrors.length > 0;

  return (
    <TooltipProvider>
      <Card className={cn(
        "relative w-[200px] border-2 transition-all group",
        selected ? "border-blue-500 shadow-lg" : "border-gray-200 dark:border-gray-800",
        hasErrors && "border-red-500"
      )}>
        <CardContent className="p-0">
          {/* Header with gradient */}
          <div className={cn(
            "px-3 py-2 bg-gradient-to-r text-white rounded-t-lg flex items-center justify-between",
            data.triggerType === 'webhook' ? "from-pink-500 to-rose-600" : 
            data.triggerType === 'keyword_received' ? "from-purple-500 to-violet-600" :
            "from-blue-500 to-indigo-600"
          )}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="font-semibold text-sm truncate">{label}</span>
            </div>
            {getStatusIcon(status)}
          </div>

          {/* Content */}
          <div className="p-3 space-y-2">
            {data.triggerType === 'keyword_received' && data.keywordConfig && (
              <div className="text-xs bg-muted p-2 rounded border">
                <div className="font-semibold mb-1">키워드 ({data.keywordConfig.matchType === 'exact' ? '일치' : '포함'}):</div>
                <div className="flex flex-wrap gap-1">
                  {data.keywordConfig.keywords?.map((k, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px] px-1 py-0 h-5">
                      {k}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {data.triggerType === 'webhook' && (
              <div className="text-xs text-muted-foreground">
                외부 시스템에서 데이터를 받아 워크플로우를 시작합니다.
              </div>
            )}
            {data.scheduleConfig && (
              <div className="text-xs bg-muted p-2 rounded border font-mono">
                {data.scheduleConfig.cron || `매 ${data.scheduleConfig.interval}분`}
              </div>
            )}

            {/* Validation Errors */}
            {hasErrors && (
              <div className="bg-red-50 dark:bg-red-950 rounded p-2 space-y-1">
                {data.validationErrors!.map((error, idx) => (
                  <div key={idx} className="text-xs text-red-600 dark:text-red-400 flex items-start gap-1">
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Execution Info */}
            {data.executionInfo && (
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                {data.executionInfo.executionCount !== undefined && (
                  <span>실행: {data.executionInfo.executionCount}회</span>
                )}
                {data.executionInfo.lastExecuted && (
                  <span className="text-[10px]">
                    {new Date(data.executionInfo.lastExecuted).toLocaleDateString('ko-KR')}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-3 pb-2">
            <Badge variant="outline" className="text-[10px] w-full justify-center bg-blue-50 dark:bg-blue-950">
              트리거
            </Badge>
          </div>
        </CardContent>

        {/* Tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Info className="h-3 w-3 text-muted-foreground" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <div className="space-y-1">
              <div className="font-semibold">{label}</div>
              {data.scheduleConfig && (
                <div className="text-xs">스케줄: {data.scheduleConfig.cron || `매 ${data.scheduleConfig.interval}분`}</div>
              )}
              {data.executionInfo?.lastExecuted && (
                <div className="text-xs">마지막 실행: {new Date(data.executionInfo.lastExecuted).toLocaleString('ko-KR')}</div>
              )}
              {data.executionInfo?.successCount !== undefined && (
                <div className="text-xs">성공: {data.executionInfo.successCount}회</div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        <Handle type="source" position={Position.Bottom} className="!bg-blue-500 !w-3 !h-3" />
      </Card>
    </TooltipProvider>
  );
}

