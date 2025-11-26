/**
 * 예약 관련 React Query hooks 및 query functions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Appointment } from '@/lib/database.types';

/**
 * Query Keys
 */
export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters?: { status?: string }) => [...appointmentKeys.lists(), filters] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
};

/**
 * 예약 목록 조회 함수
 */
async function fetchAppointments(status?: string): Promise<Appointment[]> {
  const params = new URLSearchParams();
  if (status && status !== 'all') {
    params.append('status', status);
  }
  
  const response = await fetch(`/api/appointments?${params.toString()}`);
  if (!response.ok) {
    throw new Error('예약 목록을 불러올 수 없습니다.');
  }
  const data = await response.json();
  return data.appointments || [];
}

/**
 * 예약 상세 조회 함수
 */
async function fetchAppointment(id: string): Promise<Appointment> {
  const response = await fetch(`/api/appointments/${id}`);
  if (!response.ok) {
    throw new Error('예약을 불러올 수 없습니다.');
  }
  const data = await response.json();
  return data.appointment;
}

/**
 * 예약 생성 함수
 */
async function createAppointment(appointmentData: Partial<Appointment>): Promise<Appointment> {
  const response = await fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(appointmentData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '예약 추가에 실패했습니다.');
  }

  const data = await response.json();
  return data.appointment;
}

/**
 * 예약 수정 함수
 */
async function updateAppointment(id: string, appointmentData: Partial<Appointment>): Promise<Appointment> {
  const response = await fetch(`/api/appointments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(appointmentData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '예약 수정에 실패했습니다.');
  }

  const data = await response.json();
  return data.appointment;
}

/**
 * 예약 삭제 함수
 */
async function deleteAppointment(id: string): Promise<void> {
  const response = await fetch(`/api/appointments/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '예약 삭제에 실패했습니다.');
  }
}

/**
 * React Query Hooks
 */

/**
 * 예약 목록 조회 Hook
 */
export function useAppointments(statusFilter?: string) {
  return useQuery({
    queryKey: appointmentKeys.list({ status: statusFilter }),
    queryFn: () => fetchAppointments(statusFilter),
  });
}

/**
 * 예약 상세 조회 Hook
 */
export function useAppointment(id: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => fetchAppointment(id),
    enabled: !!id,
  });
}

/**
 * 예약 생성 Mutation Hook
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
}

/**
 * 예약 수정 Mutation Hook
 */
export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Appointment> }) =>
      updateAppointment(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(variables.id) });
    },
  });
}

/**
 * 예약 삭제 Mutation Hook
 */
export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
}

