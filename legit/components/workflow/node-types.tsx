"use client";

import { NodeTypes } from '@xyflow/react';
import { EnhancedTriggerNode } from './enhanced-trigger-node';
import { EnhancedActionNode } from './enhanced-action-node';
import { EnhancedConditionNode } from './enhanced-condition-node';
import { EnhancedDelayNode } from './enhanced-delay-node';
import { EnhancedTimeWindowNode } from './enhanced-time-window-node';
import { TimeWindowNode } from './time-window-node';

// Keep old nodes for backward compatibility
import { TriggerNode } from './trigger-node';
import { ActionNode } from './action-node';
import { ConditionNode } from './condition-node';
import { DelayNode } from './delay-node';

export const nodeTypes: NodeTypes = {
  trigger: EnhancedTriggerNode,
  action: EnhancedActionNode,
  condition: EnhancedConditionNode,
  delay: EnhancedDelayNode,
  time_window: EnhancedTimeWindowNode,
  
  // Legacy nodes (for backward compatibility)
  trigger_legacy: TriggerNode,
  action_legacy: ActionNode,
  condition_legacy: ConditionNode,
  delay_legacy: DelayNode,
  time_window_legacy: TimeWindowNode,
};

