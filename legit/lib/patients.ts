/**
 * 환자 데이터 관리 유틸리티
 */

import { createServerClient } from './supabase';
import { Patient } from './database.types';

export interface CreatePatientInput {
  name: string;
  phone: string;
  email?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  last_visit_date?: string;
  last_surgery_date?: string;
  notes?: string;
}

export interface UpdatePatientInput extends Partial<CreatePatientInput> {}

/**
 * 환자 목록 조회
 */
export async function getPatients(userId: string): Promise<Patient[]> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }
  
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`환자 목록 조회 실패: ${error.message}`);
  }

  return data || [];
}

/**
 * 환자 단일 조회
 */
export async function getPatient(userId: string, patientId: string): Promise<Patient | null> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }
  
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // 데이터 없음
    }
    throw new Error(`환자 조회 실패: ${error.message}`);
  }

  return data;
}

/**
 * 환자 생성
 */
export async function createPatient(userId: string, input: CreatePatientInput): Promise<Patient> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }
  
  const { data, error } = await supabase
    .from('patients')
    .insert({
      user_id: userId,
      ...input,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`환자 생성 실패: ${error.message}`);
  }

  return data;
}

/**
 * 환자 업데이트
 */
export async function updatePatient(
  userId: string,
  patientId: string,
  input: UpdatePatientInput
): Promise<Patient> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }
  
  const { data, error } = await supabase
    .from('patients')
    .update(input)
    .eq('id', patientId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`환자 업데이트 실패: ${error.message}`);
  }

  return data;
}

/**
 * 환자 삭제
 */
export async function deletePatient(userId: string, patientId: string): Promise<void> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }
  
  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', patientId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`환자 삭제 실패: ${error.message}`);
  }
}

/**
 * 전화번호로 환자 검색
 */
export async function findPatientByPhone(userId: string, phone: string): Promise<Patient | null> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }
  
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', userId)
    .eq('phone', phone)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`환자 검색 실패: ${error.message}`);
  }

  return data;
}

