"use client";

import { Handle, Position } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Info } from 'lucide-react';
import { WorkflowNodeData } from '@/lib/workflow-types';
import { NodeStatus, NodeExecutionInfo } from '@/lib/node-status';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getStatusIcon } from '@/lib/utils/node-status';

interface EnhancedDelayNodeProps {
  data: WorkflowNodeData & { 
    executionInfo?: NodeExecutionInfo;
    validationErrors?: string[];
  };
  selected?: boolean;
}

const delayLabels = {
  minutes: '분',
  hours: '시간',
  days: '일',
  business_days: '영업일',
};

export function EnhancedDelayNode({ data, selected }: EnhancedDelayNodeProps) {
  const delay = data.delay;
  const status = data.executionInfo?.status || 'pending';
  const hasErrors = data.validationErrors && data.validationErrors.length > 0;
  
  const delayText = delay
    ? `${delay.value}${delayLabels[delay.type]} 대기`
    : '대기 없음';

  // Calculate total delay in milliseconds for display
  // Note: business_days calculation is async, so we estimate for display
  const totalDelayMs = delay ? (
    delay.type === 'minutes' ? delay.value * 60 * 1000 :
    delay.type === 'hours' ? delay.value * 60 * 60 * 1000 :
    delay.type === 'business_days' ? delay.value * 1.4 * 24 * 60 * 60 * 1000 : // Estimate: 40% buffer for weekends/holidays
    delay.value * 24 * 60 * 60 * 1000
  ) : 0;

  return (
    <TooltipProvider>
      <Card 
        className={cn(
          "min-w-[220px] transition-all duration-200 hover:shadow-lg",
          selected && "ring-2 ring-primary ring-offset-2",
          hasErrors && "border-red-500 border-2"
        )}
      >
        <CardContent className="p-0">
          {/* Header */}
          <div className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="font-semibold text-sm truncate">{data.label || '지연'}</span>
            </div>
            {getStatusIcon(status)}
          </div>

          {/* Content */}
          <div className="p-3 space-y-2">
            <div className="text-xs bg-muted p-2 rounded border font-mono text-center">
              {delayText}
            </div>

            {totalDelayMs > 0 && (
              <div className="text-xs text-muted-foreground text-center">
                총 {Math.floor(totalDelayMs / 1000)}초 대기
              </div>
            )}

            {/* Validation Errors */}
            {hasErrors && (
              <div className="bg-red-50 dark:bg-red-950 rounded p-2 space-y-1">
                {data.validationErrors!.map((error, idx) => (
                  <div key={idx} className="text-xs text-red-600 dark:text-red-400">
                    {error}
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

          {/* Footer */}
          <div className="px-3 pb-2">
            <Badge variant="outline" className="text-[10px] w-full justify-center bg-purple-50 dark:bg-purple-950">
              지연
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
              <div className="font-semibold">지연 노드</div>
              <div className="text-xs">{delayText}</div>
              {totalDelayMs > 0 && (
                <div className="text-xs">총 대기 시간: {Math.floor(totalDelayMs / 1000)}초</div>
              )}
              {data.executionInfo?.lastExecuted && (
                <div className="text-xs">마지막 실행: {new Date(data.executionInfo.lastExecuted).toLocaleString('ko-KR')}</div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        <Handle type="target" position={Position.Top} className="!bg-purple-500 !w-3 !h-3" />
        <Handle type="source" position={Position.Bottom} className="!bg-purple-500 !w-3 !h-3" />
      </Card>
    </TooltipProvider>
  );
}

