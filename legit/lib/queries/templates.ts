/**
 * 템플릿 React Query hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MarketingTemplate } from '../template-types';
import { toast } from 'sonner';

const TEMPLATES_QUERY_KEY = ['templates'] as const;

/**
 * 템플릿 목록 조회
 */
export function useTemplates(enabled?: boolean) {
  return useQuery({
    queryKey: [...TEMPLATES_QUERY_KEY, enabled],
    queryFn: async () => {
      const params = enabled !== undefined ? `?enabled=${enabled}` : '';
      const response = await fetch(`/api/templates${params}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '템플릿 목록을 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      return data.templates as MarketingTemplate[];
    },
  });
}

/**
 * 템플릿 단일 조회
 */
export function useTemplate(id: string | null) {
  return useQuery({
    queryKey: [...TEMPLATES_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const response = await fetch(`/api/templates/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        const error = await response.json();
        throw new Error(error.error || '템플릿을 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      return data.template as MarketingTemplate;
    },
    enabled: !!id,
  });
}

/**
 * 템플릿 생성
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: Omit<MarketingTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '템플릿 생성에 실패했습니다.');
      }

      const data = await response.json();
      return data.template as MarketingTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY });
      toast.success('템플릿이 생성되었습니다.');
    },
    onError: (error: Error) => {
      toast.error(error.message || '템플릿 생성에 실패했습니다.');
    },
  });
}

/**
 * 템플릿 업데이트
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MarketingTemplate> }) => {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '템플릿 업데이트에 실패했습니다.');
      }

      const data = await response.json();
      return data.template as MarketingTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY });
      toast.success('템플릿이 업데이트되었습니다.');
    },
    onError: (error: Error) => {
      toast.error(error.message || '템플릿 업데이트에 실패했습니다.');
    },
  });
}

/**
 * 템플릿 삭제
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '템플릿 삭제에 실패했습니다.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY });
      toast.success('템플릿이 삭제되었습니다.');
    },
    onError: (error: Error) => {
      toast.error(error.message || '템플릿 삭제에 실패했습니다.');
    },
  });
}

/**
 * 템플릿 복제
 */
export function useDuplicateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/templates/${id}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '템플릿 복제에 실패했습니다.');
      }

      const data = await response.json();
      return data.template as MarketingTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY });
      toast.success('템플릿이 복제되었습니다.');
    },
    onError: (error: Error) => {
      toast.error(error.message || '템플릿 복제에 실패했습니다.');
    },
  });
}

