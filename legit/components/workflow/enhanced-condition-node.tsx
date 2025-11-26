"use client";

import { Handle, Position } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Info, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { WorkflowNodeData } from '@/lib/workflow-types';
import { NodeStatus, NodeExecutionInfo } from '@/lib/node-status';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getStatusIcon } from '@/lib/utils/node-status';

interface EnhancedConditionNodeProps {
  data: WorkflowNodeData & { 
    executionInfo?: NodeExecutionInfo;
    validationErrors?: string[];
  };
  selected?: boolean;
}

const operatorLabels = {
  equals: '=',
  not_equals: '≠',
  contains: '포함',
  greater_than: '>',
  less_than: '<',
};

export function EnhancedConditionNode({ data, selected }: EnhancedConditionNodeProps) {
  const condition = data.condition;
  const hasErrors = data.validationErrors && data.validationErrors.length > 0;
  const status = data.executionInfo?.status || 'pending';
  
  const conditionText = condition
    ? `${condition.variable} ${operatorLabels[condition.operator] || condition.operator} ${condition.value}`
    : '조건 없음';

  const result = data.executionInfo?.status === 'success' 
    ? (data.executionInfo as any).result 
    : null;

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
          <div className="px-3 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <GitBranch className="h-4 w-4 flex-shrink-0" />
              <span className="font-semibold text-sm truncate">{data.label || '조건'}</span>
            </div>
            {getStatusIcon(status)}
          </div>

          {/* Content */}
          <div className="p-3 space-y-2">
            <div className="text-xs font-mono bg-muted p-2 rounded border">
              {conditionText}
            </div>

            {/* Result */}
            {result !== null && (
              <div className={cn(
                "text-xs font-semibold p-2 rounded flex items-center gap-2",
                result ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300" :
                         "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300"
              )}>
                {result ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    <span>True - Yes 경로로 진행</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3" />
                    <span>False - No 경로로 진행</span>
                  </>
                )}
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

          {/* Footer */}
          <div className="px-3 pb-2">
            <Badge variant="outline" className="text-[10px] w-full justify-center">
              조건 분기
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
              <div className="font-semibold">조건 노드</div>
              <div className="text-xs">{conditionText}</div>
              {data.executionInfo?.lastExecuted && (
                <div className="text-xs">마지막 실행: {new Date(data.executionInfo.lastExecuted).toLocaleString('ko-KR')}</div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        <Handle type="target" position={Position.Top} className="!bg-yellow-500 !w-3 !h-3" />
        <Handle 
          type="source" 
          position={Position.Bottom} 
          id="true" 
          className="!bg-green-500 !w-3 !h-3 !left-[30%]"
          style={{ left: '30%' }}
        >
          <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-[10px] text-green-600 dark:text-green-400 font-medium">
            Yes
          </div>
        </Handle>
        <Handle 
          type="source" 
          position={Position.Bottom} 
          id="false" 
          className="!bg-red-500 !w-3 !h-3 !left-[70%]"
          style={{ left: '70%' }}
        >
          <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-[10px] text-red-600 dark:text-red-400 font-medium">
            No
          </div>
        </Handle>
      </Card>
    </TooltipProvider>
  );
}

