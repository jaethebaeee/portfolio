/**
 * 웹훅 관련 React Query hooks 및 query functions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Webhook {
  id: string;
  name: string;
  workflow_id?: string;
  url: string;
  enabled: boolean;
  created_at: string;
}

/**
 * Query Keys
 */
export const webhookKeys = {
  all: ['webhooks'] as const,
  lists: () => [...webhookKeys.all, 'list'] as const,
  list: () => [...webhookKeys.lists()] as const,
  details: () => [...webhookKeys.all, 'detail'] as const,
  detail: (id: string) => [...webhookKeys.details(), id] as const,
};

/**
 * 웹훅 목록 조회 함수
 */
async function fetchWebhooks(): Promise<Webhook[]> {
  const response = await fetch('/api/webhooks');
  if (!response.ok) {
    throw new Error('웹훅 목록을 불러올 수 없습니다.');
  }
  const data = await response.json();
  return data.webhooks || [];
}

/**
 * 웹훅 생성 함수
 */
async function createWebhook(webhookData: Partial<Webhook>): Promise<Webhook> {
  const response = await fetch('/api/webhooks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...webhookData,
      workflow_id: webhookData.workflow_id || undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '웹훅 생성에 실패했습니다.');
  }

  const data = await response.json();
  return data.webhook;
}

/**
 * 웹훅 토글 함수
 */
async function toggleWebhook(id: string, enabled: boolean): Promise<Webhook> {
  const response = await fetch(`/api/webhooks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled }),
  });

  if (!response.ok) {
    throw new Error('웹훅 상태 변경에 실패했습니다.');
  }

  const data = await response.json();
  return data.webhook;
}

/**
 * 웹훅 삭제 함수
 */
async function deleteWebhook(id: string): Promise<void> {
  const response = await fetch(`/api/webhooks/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '웹훅 삭제에 실패했습니다.');
  }
}

/**
 * React Query Hooks
 */

/**
 * 웹훅 목록 조회 Hook
 */
export function useWebhooks() {
  return useQuery({
    queryKey: webhookKeys.list(),
    queryFn: fetchWebhooks,
  });
}

/**
 * 웹훅 생성 Mutation Hook
 */
export function useCreateWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.lists() });
    },
  });
}

/**
 * 웹훅 토글 Mutation Hook
 */
export function useToggleWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      toggleWebhook(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.lists() });
    },
  });
}

/**
 * 웹훅 삭제 Mutation Hook
 */
export function useDeleteWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.lists() });
    },
  });
}

