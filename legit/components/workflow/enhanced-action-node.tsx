"use client";

import { Handle, Position } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, Phone, Mail, User, Calendar, Stethoscope, Gift, Star, FileText,
  Info, Globe, Pill
} from 'lucide-react';
import { getStatusIcon } from '@/lib/utils/node-status';

// ...

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
  http_request: Globe,
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
  http_request: '외부 API 요청',
  medication_reminder: '복약 리마인더',
};

const actionColors = {
  send_kakao: 'from-yellow-500 to-yellow-600',
  send_sms: 'from-blue-500 to-blue-600',
  send_email: 'from-purple-500 to-purple-600',
  update_patient: 'from-indigo-500 to-indigo-600',
  create_appointment: 'from-green-500 to-green-600',
  send_surgery_reminder: 'from-red-500 to-red-600',
  send_post_surgery_care: 'from-pink-500 to-pink-600',
  send_coupon: 'from-orange-500 to-orange-600',
  request_review: 'from-amber-500 to-amber-600',
  send_consultation_result: 'from-teal-500 to-teal-600',
  http_request: 'from-cyan-500 to-cyan-600',
  medication_reminder: 'from-green-500 to-green-600',
};


export function EnhancedActionNode({ data, selected }: EnhancedActionNodeProps) {
  const Icon = data.actionType ? actionIcons[data.actionType] : MessageSquare;
  const label = data.actionType ? actionLabels[data.actionType] : data.label;
  const colorGradient = data.actionType ? actionColors[data.actionType] : 'from-green-500 to-green-600';
  const status = data.executionInfo?.status || 'pending';
  const hasErrors = data.validationErrors && data.validationErrors.length > 0;

  return (
    <TooltipProvider>
      <Card 
        className={cn(
          "min-w-[220px] transition-all duration-200 hover:shadow-lg",
          selected && "ring-2 ring-primary ring-offset-2",
          hasErrors && "border-red-500 border-2",
          status === 'running' && "animate-pulse"
        )}
      >
        <CardContent className="p-0">
          {/* Header with gradient */}
          <div className={cn(
            "px-3 py-2 bg-gradient-to-r text-white rounded-t-lg flex items-center justify-between",
            colorGradient
          )}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="font-semibold text-sm truncate">{label}</span>
            </div>
            {getStatusIcon(status)}
          </div>

          {/* Content */}
          <div className="p-3 space-y-2">
            {data.actionType === 'http_request' && data.httpRequest && (
              <div className="text-xs text-muted-foreground flex items-center gap-1 overflow-hidden">
                <span className="font-mono font-bold bg-muted px-1 rounded">{data.httpRequest.method}</span>
                <span className="truncate flex-1">{data.httpRequest.url}</span>
              </div>
            )}

            {data.actionType === 'send_email' && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span className="truncate font-medium">{data.emailConfig?.subject || '(제목 없음)'}</span>
              </div>
            )}

            {data.templateId && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span className="truncate">템플릿: {data.templateId}</span>
              </div>
            )}

            {data.message_template && (
              <div className="text-xs text-muted-foreground line-clamp-2">
                {data.message_template}
              </div>
            )}

            {data.actionType === 'medication_reminder' && data.medication && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="font-medium">{data.medication.name}</div>
                <div className="flex items-center gap-2">
                  <span>{data.medication.frequency}</span>
                  <span className="text-muted-foreground/70">
                    {data.medication.times.join(', ')}
                  </span>
                </div>
                <div className="text-muted-foreground/70">
                  {data.medication.instructions}
                </div>
                <div className="text-muted-foreground/70">
                  {data.medication.duration}일간
                </div>
              </div>
            )}

            {/* Validation Errors */}
            {hasErrors && (
              <div className="bg-red-50 dark:bg-red-950 rounded p-2 space-y-1">
                {data.validationErrors!.map((error, idx) => (
                  <div key={idx} className="text-xs text-red-600 dark:text-red-400 flex items-start gap-1">
                    <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
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
                {data.executionInfo.executionTime !== undefined && (
                  <span>{data.executionInfo.executionTime}ms</span>
                )}
              </div>
            )}
          </div>

          {/* Footer Badge */}
          <div className="px-3 pb-2">
            <Badge variant="outline" className="text-[10px] w-full justify-center">
              액션
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
              {data.templateId && <div>템플릿 ID: {data.templateId}</div>}
              {data.executionInfo?.lastExecuted && (
                <div>마지막 실행: {new Date(data.executionInfo.lastExecuted).toLocaleString('ko-KR')}</div>
              )}
              {data.executionInfo?.successCount !== undefined && (
                <div>성공: {data.executionInfo.successCount}회</div>
              )}
              {data.executionInfo?.errorCount !== undefined && (
                <div>실패: {data.executionInfo.errorCount}회</div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        <Handle type="target" position={Position.Top} className="!bg-green-500 !w-3 !h-3" />
        <Handle type="source" position={Position.Bottom} className="!bg-green-500 !w-3 !h-3" />
      </Card>
    </TooltipProvider>
  );
}

