/**
 * 캠페인 관련 React Query hooks 및 query functions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Campaign } from '@/lib/database.types';

/**
 * Query Keys
 */
export const campaignKeys = {
  all: ['campaigns'] as const,
  lists: () => [...campaignKeys.all, 'list'] as const,
  list: (filters?: { status?: string }) => [...campaignKeys.lists(), filters] as const,
  details: () => [...campaignKeys.all, 'detail'] as const,
  detail: (id: string) => [...campaignKeys.details(), id] as const,
};

/**
 * 캠페인 목록 조회 함수
 */
async function fetchCampaigns(status?: string): Promise<Campaign[]> {
  const params = new URLSearchParams();
  if (status && status !== 'all') {
    params.append('status', status);
  }

  const response = await fetch(`/api/campaigns?${params.toString()}`);
  if (!response.ok) {
    throw new Error('캠페인 목록을 불러올 수 없습니다.');
  }
  const data = await response.json();
  return data.campaigns || [];
}

/**
 * 캠페인 상세 조회 함수
 */
async function fetchCampaign(id: string): Promise<Campaign> {
  const response = await fetch(`/api/campaigns/${id}`);
  if (!response.ok) {
    throw new Error('캠페인을 불러올 수 없습니다.');
  }
  const data = await response.json();
  return data.campaign;
}

/**
 * 캠페인 생성 함수
 */
async function createCampaign(campaignData: Partial<Campaign>): Promise<Campaign> {
  const response = await fetch('/api/campaigns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...campaignData,
      target_patients: campaignData.target_patients && Array.isArray(campaignData.target_patients) && campaignData.target_patients.length > 0
        ? campaignData.target_patients
        : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '캠페인 추가에 실패했습니다.');
  }

  const data = await response.json();
  return data.campaign;
}

/**
 * 캠페인 수정 함수
 */
async function updateCampaign(id: string, campaignData: Partial<Campaign>): Promise<Campaign> {
  const response = await fetch(`/api/campaigns/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...campaignData,
      target_patients: campaignData.target_patients && Array.isArray(campaignData.target_patients) && campaignData.target_patients.length > 0
        ? campaignData.target_patients
        : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '캠페인 수정에 실패했습니다.');
  }

  const data = await response.json();
  return data.campaign;
}

/**
 * 캠페인 삭제 함수
 */
async function deleteCampaign(id: string): Promise<void> {
  const response = await fetch(`/api/campaigns/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '캠페인 삭제에 실패했습니다.');
  }
}

/**
 * 캠페인 실행 함수
 */
async function executeCampaign(id: string): Promise<{ sentCount: number; failedCount: number }> {
  const response = await fetch(`/api/campaigns/${id}/execute`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '캠페인 실행에 실패했습니다.');
  }

  return response.json();
}

/**
 * React Query Hooks
 */

/**
 * 캠페인 목록 조회 Hook
 */
export function useCampaigns(statusFilter?: string) {
  return useQuery({
    queryKey: campaignKeys.list({ status: statusFilter }),
    queryFn: () => fetchCampaigns(statusFilter),
  });
}

/**
 * 캠페인 상세 조회 Hook
 */
export function useCampaign(id: string) {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: () => fetchCampaign(id),
    enabled: !!id,
  });
}

/**
 * 캠페인 생성 Mutation Hook
 */
export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}

/**
 * 캠페인 수정 Mutation Hook
 */
export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Campaign> }) =>
      updateCampaign(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(variables.id) });
    },
  });
}

/**
 * 캠페인 삭제 Mutation Hook
 */
export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}

/**
 * 캠페인 실행 Mutation Hook
 */
export function useExecuteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: executeCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}

