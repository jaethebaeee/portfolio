/**
 * 노드 상태 및 실행 정보 타입 정의
 */

export type NodeStatus = 'pending' | 'running' | 'success' | 'error' | 'skipped';

export interface NodeExecutionInfo {
  status: NodeStatus;
  executionTime?: number; // milliseconds
  errorMessage?: string;
  lastExecuted?: Date;
  executionCount?: number;
  successCount?: number;
  errorCount?: number;
}

export interface NodeValidationError {
  field: string;
  message: string;
}

/**
 * 노드 상태별 색상
 */
export const NODE_STATUS_COLORS: Record<NodeStatus, { bg: string; text: string; border: string }> = {
  pending: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-300 dark:border-gray-700',
  },
  running: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-300 dark:border-blue-700',
  },
  success: {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-300 dark:border-green-700',
  },
  error: {
    bg: 'bg-red-100 dark:bg-red-900',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-300 dark:border-red-700',
  },
  skipped: {
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    text: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-300 dark:border-yellow-700',
  },
};

/**
 * 노드 상태별 아이콘
 */
export const NODE_STATUS_ICONS = {
  pending: '⏳',
  running: '⚙️',
  success: '✅',
  error: '❌',
  skipped: '⏭️',
};

