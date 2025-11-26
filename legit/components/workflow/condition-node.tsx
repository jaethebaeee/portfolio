"use client";

import { Handle, Position } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch } from 'lucide-react';
import { WorkflowNodeData } from '@/lib/workflow-types';

interface ConditionNodeProps {
  data: WorkflowNodeData;
  selected?: boolean;
}

export function ConditionNode({ data, selected }: ConditionNodeProps) {
  const condition = data.condition;
  const conditionText = condition
    ? `${condition.variable} ${condition.operator} ${condition.value}`
    : '조건 없음';

  return (
    <Card className={`min-w-[200px] ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded">
            <GitBranch className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">{data.label || '조건'}</div>
            <div className="text-xs text-muted-foreground mt-1 font-mono">
              {conditionText}
            </div>
          </div>
          <Badge variant="outline" className="text-xs">조건</Badge>
        </div>
      </CardContent>
      <Handle type="target" position={Position.Top} className="!bg-yellow-500" />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="true" 
        className="!bg-green-500 !left-[30%]"
        style={{ left: '30%' }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="false" 
        className="!bg-red-500 !left-[70%]"
        style={{ left: '70%' }}
      />
    </Card>
  );
}

