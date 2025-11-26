/**
 * 워크플로우 관리 라이브러리
 */

import { createServerClient } from './supabase';
import { Workflow } from './database.types';

export async function getWorkflows(userId: string) {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Workflow[];
}

export async function getWorkflow(userId: string, id: string) {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data as Workflow;
}

export async function createWorkflow(userId: string, workflow: Partial<Workflow>) {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  // Ensure default values
  const newWorkflow = {
    ...workflow,
    user_id: userId,
    trigger_type: workflow.trigger_type || 'post_surgery',
    steps: workflow.steps || [],
    is_active: workflow.is_active ?? true,
    visual_data: workflow.visual_data || {}
  };

  const { data, error } = await supabase
    .from('workflows')
    .insert(newWorkflow)
    .select()
    .single();

  if (error) throw error;
  return data as Workflow;
}

export async function updateWorkflow(userId: string, id: string, updates: Partial<Workflow>) {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('workflows')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Workflow;
}

export async function deleteWorkflow(userId: string, id: string) {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { error } = await supabase
    .from('workflows')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

