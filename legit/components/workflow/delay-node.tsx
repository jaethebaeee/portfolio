"use client";

import { Handle, Position } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { WorkflowNodeData } from '@/lib/workflow-types';

interface DelayNodeProps {
  data: WorkflowNodeData;
  selected?: boolean;
}

const delayLabels = {
  minutes: '분',
  hours: '시간',
  days: '일',
  business_days: '영업일',
};

export function DelayNode({ data, selected }: DelayNodeProps) {
  const delay = data.delay;
  let delayText = delay
    ? `${delay.value}${delayLabels[delay.type] || delay.type} 대기`
    : '대기 없음';
  
  // Add business days info
  if (delay?.type === 'business_days') {
    const options = [];
    if (delay.skipWeekends !== false) options.push('주말제외');
    if (delay.skipHolidays !== false) options.push('공휴일제외');
    if (options.length > 0) {
      delayText += ` (${options.join(', ')})`;
    }
  }

  return (
    <Card className={`min-w-[200px] ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded">
            <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">{data.label || '지연'}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {delayText}
            </div>
          </div>
          <Badge variant="outline" className="text-xs">지연</Badge>
        </div>
      </CardContent>
      <Handle type="target" position={Position.Top} className="!bg-purple-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-purple-500" />
    </Card>
  );
}

