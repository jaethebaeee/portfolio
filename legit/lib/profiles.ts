import { createServerClient } from './supabase';

export interface Profile {
  id: string;
  user_id: string;
  hospital_name: string | null;
  business_type: string;
  practice_size?: string | null;
  user_role?: string | null;
  specialty?: string | null;
  team_size?: number | null;
  is_onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProfileInput {
  hospital_name: string;
  business_type?: string;
  practice_size?: string;
  user_role?: string;
  specialty?: string;
  team_size?: number;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

export async function createProfile(userId: string, input: CreateProfileInput): Promise<Profile> {
  const supabase = createServerClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      user_id: userId,
      hospital_name: input.hospital_name,
      is_onboarding_complete: true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, input: Partial<CreateProfileInput>): Promise<Profile> {
  const supabase = createServerClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...input,
      is_onboarding_complete: true // Ensure this is true on update if valid
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

