"use client";

import { Handle, Position } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sun, Moon, Clock, Info } from 'lucide-react';
import { WorkflowNodeData } from '@/lib/workflow-types';
import { NodeStatus, NodeExecutionInfo } from '@/lib/node-status';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getStatusIcon } from '@/lib/utils/node-status';

interface EnhancedTimeWindowNodeProps {
  data: WorkflowNodeData & { 
    executionInfo?: NodeExecutionInfo;
    validationErrors?: string[];
  };
  selected?: boolean;
}

function isWithinTimeWindow(startTime: string, endTime: string): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  const startTimeMinutes = startHour * 60 + startMin;
  const endTimeMinutes = endHour * 60 + endMin;

  if (startTimeMinutes <= endTimeMinutes) {
    return currentTime >= startTimeMinutes && currentTime <= endTimeMinutes;
  } else {
    // Handle overnight time window
    return currentTime >= startTimeMinutes || currentTime <= endTimeMinutes;
  }
}

export function EnhancedTimeWindowNode({ data, selected }: EnhancedTimeWindowNodeProps) {
  const { startTime = "09:00", endTime = "18:00", timezone = "Asia/Seoul" } = data.timeWindow || {};
  const status = data.executionInfo?.status || 'pending';
  const hasErrors = data.validationErrors && data.validationErrors.length > 0;
  const isActive = isWithinTimeWindow(startTime, endTime);

  return (
    <TooltipProvider>
      <Card 
        className={cn(
          "min-w-[220px] transition-all duration-200 hover:shadow-lg",
          selected && "ring-2 ring-primary ring-offset-2",
          hasErrors && "border-red-500 border-2",
          isActive && "border-green-500 border-2"
        )}
      >
        <CardContent className="p-0">
          {/* Header */}
          <div className="px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {isActive ? (
                <Sun className="h-4 w-4 flex-shrink-0" />
              ) : (
                <Moon className="h-4 w-4 flex-shrink-0" />
              )}
              <span className="font-semibold text-sm truncate">{data.label || '시간 제한'}</span>
            </div>
            {getStatusIcon(status)}
          </div>

          {/* Content */}
          <div className="p-3 space-y-2">
            <div className="text-xs bg-muted p-2 rounded border font-mono text-center">
              {startTime} ~ {endTime}
            </div>

            {/* Active Status */}
            {isActive && (
              <div className="bg-green-50 dark:bg-green-950 rounded p-2 text-xs text-green-700 dark:text-green-300 flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>현재 활성 시간대입니다</span>
              </div>
            )}

            {!isActive && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded p-2 text-xs text-muted-foreground flex items-center gap-2">
                <Moon className="h-3 w-3" />
                <span>비활성 시간대입니다</span>
              </div>
            )}

            {/* Timezone */}
            <div className="text-xs text-muted-foreground text-center">
              시간대: {timezone}
            </div>

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
            <Badge variant="outline" className="text-[10px] w-full justify-center bg-orange-50 dark:bg-orange-950">
              시간 제한
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
              <div className="font-semibold">시간 제한 노드</div>
              <div className="text-xs">{startTime} ~ {endTime}</div>
              <div className="text-xs">시간대: {timezone}</div>
              <div className="text-xs">
                상태: {isActive ? '활성' : '비활성'}
              </div>
              {data.executionInfo?.lastExecuted && (
                <div className="text-xs">마지막 실행: {new Date(data.executionInfo.lastExecuted).toLocaleString('ko-KR')}</div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        <Handle type="target" position={Position.Top} className="!bg-orange-500 !w-3 !h-3" />
        <Handle type="source" position={Position.Bottom} className="!bg-orange-500 !w-3 !h-3" />
      </Card>
    </TooltipProvider>
  );
}

