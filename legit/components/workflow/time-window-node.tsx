"use client";

import { Handle, Position } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sun } from 'lucide-react';
import { WorkflowNodeData } from '@/lib/workflow-types';

interface TimeWindowNodeProps {
  data: WorkflowNodeData;
  selected?: boolean;
}

export function TimeWindowNode({ data, selected }: TimeWindowNodeProps) {
  const { startTime = "09:00", endTime = "18:00" } = data.timeWindow || {};

  return (
    <Card className={`min-w-[200px] ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded">
            <Sun className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">{data.label || '시간 제한'}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {startTime} ~ {endTime}
            </div>
          </div>
          <Badge variant="outline" className="text-xs">Time</Badge>
        </div>
      </CardContent>
      <Handle type="target" position={Position.Top} className="!bg-orange-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-orange-500" />
    </Card>
  );
}

