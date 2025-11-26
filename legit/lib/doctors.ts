
import { createServerClient } from '@/lib/supabase';
import { Doctor } from './database.types';

export async function getDoctors(userId: string) {
  const supabase = createServerClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data as Doctor[];
}

export async function createDoctor(userId: string, doctor: Partial<Doctor>) {
  const supabase = createServerClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('doctors')
    .insert({ ...doctor, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data as Doctor;
}

export async function updateDoctor(userId: string, id: string, doctor: Partial<Doctor>) {
  const supabase = createServerClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('doctors')
    .update(doctor)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Doctor;
}

export async function deleteDoctor(userId: string, id: string) {
  const supabase = createServerClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { error } = await supabase
    .from('doctors')
    .update({ is_active: false }) // Soft delete
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

