import { useQuery } from '@tanstack/react-query';
import { WebhookExecution } from '@/lib/database.types';

export interface WebhookExecutionWithDetails extends WebhookExecution {
  webhook?: { name: string; url: string };
}

export const webhookExecutionKeys = {
  all: ['webhook-executions'] as const,
  lists: () => [...webhookExecutionKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...webhookExecutionKeys.lists(), filters] as const,
};

async function fetchWebhookExecutions(filters: { webhookId?: string; status?: string } = {}): Promise<WebhookExecutionWithDetails[]> {
  const params = new URLSearchParams();
  if (filters.webhookId) params.append('webhook_id', filters.webhookId);
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  
  const response = await fetch(`/api/webhooks/executions?${params.toString()}`);
  if (!response.ok) {
    throw new Error('웹훅 실행 이력을 불러올 수 없습니다.');
  }
  const data = await response.json();
  return data.executions || [];
}

export function useWebhookExecutions(filters: { webhookId?: string; status?: string } = {}) {
  return useQuery({
    queryKey: webhookExecutionKeys.list(filters),
    queryFn: () => fetchWebhookExecutions(filters),
  });
}

