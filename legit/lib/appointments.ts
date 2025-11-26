/**
 * 예약 데이터 관리 유틸리티
 */

import { createServerClient } from './supabase';
import { Appointment } from './database.types';

export interface CreateAppointmentInput {
  patient_id: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:mm
  type?: string;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  cancellation_reason?: string;
  cancellation_reason_category?: 'schedule_conflict' | 'financial' | 'health_concern' | 'dissatisfaction' | 'found_other_provider' | 'no_longer_needed' | 'other';
  // Telemedicine fields
  is_telemedicine?: boolean;
  video_provider?: 'zoom' | 'google_meet' | 'custom';
  meeting_id?: string;
  meeting_url?: string;
  meeting_password?: string;
  recording_consent?: boolean;
  recording_url?: string;
  video_metadata?: Record<string, any>;
}

export interface UpdateAppointmentInput extends Partial<CreateAppointmentInput> {}

/**
 * 예약 목록 조회
 */
export async function getAppointments(userId: string, filters?: {
  patient_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}): Promise<Appointment[]> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }

  let query = supabase
    .from('appointments')
    .select('*')
    .eq('user_id', userId)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });

  if (filters?.patient_id) {
    query = query.eq('patient_id', filters.patient_id);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.date_from) {
    query = query.gte('appointment_date', filters.date_from);
  }
  if (filters?.date_to) {
    query = query.lte('appointment_date', filters.date_to);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`예약 목록 조회 실패: ${error.message}`);
  }

  return data || [];
}

/**
 * 예약 단일 조회
 */
export async function getAppointment(userId: string, appointmentId: string): Promise<Appointment | null> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`예약 조회 실패: ${error.message}`);
  }

  return data;
}

/**
 * 예약 생성
 */
export async function createAppointment(userId: string, input: CreateAppointmentInput): Promise<Appointment> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      user_id: userId,
      ...input,
      status: input.status || 'scheduled',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`예약 생성 실패: ${error.message}`);
  }

  return data;
}

/**
 * 예약 업데이트
 */
export async function updateAppointment(
  userId: string,
  appointmentId: string,
  input: UpdateAppointmentInput
): Promise<Appointment> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }

  const { data, error } = await supabase
    .from('appointments')
    .update(input)
    .eq('id', appointmentId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`예약 업데이트 실패: ${error.message}`);
  }

  return data;
}

/**
 * 예약 삭제
 */
export async function deleteAppointment(userId: string, appointmentId: string): Promise<void> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', appointmentId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`예약 삭제 실패: ${error.message}`);
  }
}

