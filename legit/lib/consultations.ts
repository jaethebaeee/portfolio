/**
 * 상담(Consultation) 관리 라이브러리
 */

import { createServerClient } from './supabase';
import { Consultation, ConsultationStatus, ConsultationOutcome, ConsultationSource } from './database.types';

export async function getConsultations(userId: string) {
  const supabase = createServerClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('consultations')
    .select(`
      *,
      patient:patients(name, phone, birth_date)
    `)
    .eq('user_id', userId)
    .order('consultation_date', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getConsultationStats(userId: string) {
  const supabase = createServerClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('consultations')
    .select('status, outcome, source, quoted_price, deposit_amount')
    .eq('user_id', userId);

  if (error) throw error;

  const total = data.length;
  const completed = data.filter(c => c.status === 'completed').length;
  const booked = data.filter(c => c.outcome === 'surgery_booked' || c.outcome === 'deposit_paid').length;
  const totalRevenue = data.reduce((acc, curr) => acc + (curr.deposit_amount || 0), 0);
  const totalQuoted = data.reduce((acc, curr) => acc + (curr.quoted_price || 0), 0);

  // 소스별 통계
  const bySource = data.reduce((acc, curr) => {
    const source = curr.source || 'etc';
    if (!acc[source]) acc[source] = { count: 0, booked: 0 };
    acc[source].count++;
    if (curr.outcome === 'surgery_booked' || curr.outcome === 'deposit_paid') {
      acc[source].booked++;
    }
    return acc;
  }, {} as Record<string, { count: number; booked: number }>);

  return {
    total,
    completed,
    booked,
    conversionRate: completed > 0 ? (booked / completed) * 100 : 0,
    totalRevenue,
    totalQuoted,
    bySource
  };
}

export async function createConsultation(userId: string, consultation: Partial<Consultation>) {
  const supabase = createServerClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('consultations')
    .insert({ ...consultation, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateConsultation(userId: string, id: string, updates: Partial<Consultation>) {
  const supabase = createServerClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('consultations')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteConsultation(userId: string, id: string) {
  const supabase = createServerClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { error } = await supabase
    .from('consultations')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

