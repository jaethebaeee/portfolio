/**
 * 워크플로우 검증 유틸리티
 */

import { Node, Edge } from '@xyflow/react';
import { WorkflowNodeData } from './workflow-types';
import { validateNode, getValidationErrorMessages } from './node-validation';

export interface WorkflowValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  nodeErrors: Record<string, string[]>; // nodeId -> errors
}

/**
 * 워크플로우 전체 검증
 */
export function validateWorkflow(nodes: Node[], edges: Edge[]): WorkflowValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const nodeErrors: Record<string, string[]> = {};

  // 1. 최소 노드 개수 확인
  if (nodes.length === 0) {
    errors.push('워크플로우에 최소 하나의 노드가 필요합니다.');
    return { isValid: false, errors, warnings, nodeErrors };
  }

  // 2. 트리거 노드 확인
  const triggerNodes = nodes.filter(n => n.type === 'trigger');
  if (triggerNodes.length === 0) {
    errors.push('워크플로우에 트리거 노드가 필요합니다.');
  } else if (triggerNodes.length > 1) {
    warnings.push('여러 개의 트리거 노드가 있습니다. 하나만 사용하는 것을 권장합니다.');
  }

  // 3. 각 노드 검증
  nodes.forEach(node => {
    const nodeData = node.data as WorkflowNodeData;
    const validationErrors = validateNode(nodeData);
    
    if (validationErrors.length > 0) {
      const errorMessages = getValidationErrorMessages(validationErrors);
      nodeErrors[node.id] = errorMessages;
      errors.push(`노드 "${node.data.label || node.id}": ${errorMessages.join(', ')}`);
    }
  });

  // 4. 연결성 확인
  const nodeIds = new Set(nodes.map(n => n.id));
  const orphanNodes: string[] = [];
  
  nodes.forEach(node => {
    // 트리거 노드는 연결이 없어도 됨
    if (node.type === 'trigger') return;
    
    // 액션 노드는 최소 하나의 incoming edge가 있어야 함
    if (node.type === 'action') {
      const hasIncomingEdge = edges.some(e => e.target === node.id);
      if (!hasIncomingEdge) {
        orphanNodes.push(node.id);
        warnings.push(`액션 노드 "${node.data.label || node.id}"가 연결되지 않았습니다.`);
      }
    }
  });

  // 5. 순환 참조 확인
  const cycles = detectCycles(nodes, edges);
  if (cycles.length > 0) {
    errors.push(`순환 참조가 발견되었습니다: ${cycles.join(', ')}`);
  }

  // 6. 조건 노드 확인
  const conditionNodes = nodes.filter(n => n.type === 'condition');
  conditionNodes.forEach(conditionNode => {
    const trueEdges = edges.filter(e => e.source === conditionNode.id && e.sourceHandle === 'true');
    const falseEdges = edges.filter(e => e.source === conditionNode.id && e.sourceHandle === 'false');
    
    if (trueEdges.length === 0 && falseEdges.length === 0) {
      warnings.push(`조건 노드 "${conditionNode.data.label || conditionNode.id}"에 연결이 없습니다.`);
    } else if (trueEdges.length === 0) {
      warnings.push(`조건 노드 "${conditionNode.data.label || conditionNode.id}"의 True 경로가 연결되지 않았습니다.`);
    } else if (falseEdges.length === 0) {
      warnings.push(`조건 노드 "${conditionNode.data.label || conditionNode.id}"의 False 경로가 연결되지 않았습니다.`);
    }
  });

  // 7. 트리거 노드 확인 (하나만 source edge를 가져야 함)
  triggerNodes.forEach(triggerNode => {
    const outgoingEdges = edges.filter(e => e.source === triggerNode.id);
    if (outgoingEdges.length === 0) {
      warnings.push(`트리거 노드 "${triggerNode.data.label || triggerNode.id}"에 연결된 노드가 없습니다.`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    nodeErrors,
  };
}

/**
 * 순환 참조 감지 (간단한 DFS)
 */
function detectCycles(nodes: Node[], edges: Edge[]): string[] {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cycles: string[] = [];

  function dfs(nodeId: string, path: string[]): void {
    if (recursionStack.has(nodeId)) {
      // Cycle detected
      const cycleStart = path.indexOf(nodeId);
      const cycle = path.slice(cycleStart).concat(nodeId);
      cycles.push(cycle.join(' -> '));
      return;
    }

    if (visited.has(nodeId)) return;

    visited.add(nodeId);
    recursionStack.add(nodeId);

    const outgoingEdges = edges.filter(e => e.source === nodeId);
    for (const edge of outgoingEdges) {
      dfs(edge.target, [...path, nodeId]);
    }

    recursionStack.delete(nodeId);
  }

  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      dfs(node.id, []);
    }
  });

  return cycles;
}

/**
 * 워크플로우 저장 가능 여부 확인
 */
export function canSaveWorkflow(nodes: Node[], edges: Edge[]): {
  canSave: boolean;
  reason?: string;
} {
  const validation = validateWorkflow(nodes, edges);
  
  if (!validation.isValid) {
    return {
      canSave: false,
      reason: validation.errors[0] || '워크플로우 검증에 실패했습니다.',
    };
  }

  // 최소 하나의 액션 노드 필요
  const actionNodes = nodes.filter(n => n.type === 'action');
  if (actionNodes.length === 0) {
    return {
      canSave: false,
      reason: '최소 하나의 액션 노드가 필요합니다.',
    };
  }

  return { canSave: true };
}

