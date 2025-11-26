import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { NodeStatus } from '@/lib/node-status';

/**
 * Get status icon for workflow nodes
 * Shared utility function for all node components
 */
export function getStatusIcon(status?: NodeStatus) {
  switch (status) {
    case 'success':
      return <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />;
    case 'error':
      return <XCircle className="h-3 w-3 text-red-600 dark:text-red-400" />;
    case 'running':
      return <Loader2 className="h-3 w-3 text-blue-600 dark:text-blue-400 animate-spin" />;
    case 'skipped':
      return <AlertCircle className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />;
    default:
      return null;
  }
}

