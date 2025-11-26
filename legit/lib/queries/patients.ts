/**
 * 환자 관련 React Query hooks 및 query functions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Patient } from '@/lib/database.types';
import { formatPhoneNumber } from '@/lib/phone-validation';

/**
 * Query Keys
 */
export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (filters?: { search?: string }) => [...patientKeys.lists(), filters] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
};

/**
 * 환자 목록 조회 함수
 */
async function fetchPatients(): Promise<Patient[]> {
  const response = await fetch('/api/patients');
  if (!response.ok) {
    throw new Error('환자 목록을 불러올 수 없습니다.');
  }
  const data = await response.json();
  return data.patients || [];
}

/**
 * 환자 상세 조회 함수
 */
async function fetchPatient(id: string): Promise<Patient> {
  const response = await fetch(`/api/patients/${id}`);
  if (!response.ok) {
    throw new Error('환자를 불러올 수 없습니다.');
  }
  const data = await response.json();
  return data.patient;
}

/**
 * 환자 생성 함수
 */
async function createPatient(patientData: Partial<Patient>): Promise<Patient> {
  const response = await fetch('/api/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...patientData,
      phone: patientData.phone ? formatPhoneNumber(patientData.phone) : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '환자 추가에 실패했습니다.');
  }

  const data = await response.json();
  return data.patient;
}

/**
 * 환자 수정 함수
 */
async function updatePatient(id: string, patientData: Partial<Patient>): Promise<Patient> {
  const response = await fetch(`/api/patients/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...patientData,
      phone: patientData.phone ? formatPhoneNumber(patientData.phone) : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '환자 수정에 실패했습니다.');
  }

  const data = await response.json();
  return data.patient;
}

/**
 * 환자 삭제 함수
 */
async function deletePatient(id: string): Promise<void> {
  const response = await fetch(`/api/patients/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '환자 삭제에 실패했습니다.');
  }
}

/**
 * React Query Hooks
 */

/**
 * 환자 목록 조회 Hook
 */
export function usePatients(searchQuery?: string) {
  return useQuery({
    queryKey: patientKeys.list({ search: searchQuery }),
    queryFn: fetchPatients,
    select: (data) => {
      if (!searchQuery) return data;
      const query = searchQuery.toLowerCase();
      return data.filter(
        (patient) =>
          patient.name?.toLowerCase().includes(query) ||
          patient.phone?.includes(query) ||
          patient.email?.toLowerCase().includes(query)
      );
    },
  });
}

/**
 * 환자 상세 조회 Hook
 */
export function usePatient(id: string) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => fetchPatient(id),
    enabled: !!id,
  });
}

/**
 * 환자 생성 Mutation Hook
 */
export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPatient,
    onSuccess: () => {
      // 환자 목록 캐시 무효화하여 자동 리프레시
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
  });
}

/**
 * 환자 수정 Mutation Hook
 */
export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Patient> }) =>
      updatePatient(id, data),
    onSuccess: (data, variables) => {
      // 환자 목록 및 상세 캐시 무효화
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(variables.id) });
    },
  });
}

/**
 * 환자 삭제 Mutation Hook
 */
export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePatient,
    onSuccess: () => {
      // 환자 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
  });
}

