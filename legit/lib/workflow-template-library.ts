/**
 * 워크플로우 템플릿 라이브러리 관리
 */

import { supabase } from './supabase';
import { Node, Edge } from '@xyflow/react';
import { WorkflowNodeData } from './workflow-types';

export interface WorkflowTemplateRecord {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  category: '안과' | '성형외과' | '피부과' | '공통';
  specialty: string | null;
  target_surgery_type: string | null;
  visual_data: { nodes: Node<WorkflowNodeData>[]; edges: Edge[] } | null;
  steps: any[] | null;
  is_public: boolean;
  is_featured: boolean;
  is_system_template: boolean;
  usage_count: number;
  rating_average: number;
  rating_count: number;
  tags: string[] | null;
  preview_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateRating {
  id: string;
  template_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface TemplateUsage {
  id: string;
  template_id: string;
  user_id: string;
  workflow_id: string | null;
  created_at: string;
}

/**
 * 공개 템플릿 목록 조회
 */
export async function getPublicTemplates(filters?: {
  category?: string;
  specialty?: string;
  search?: string;
  featured?: boolean;
  sortBy?: 'rating' | 'usage' | 'recent';
}) {
  let query = supabase
    .from('workflow_templates')
    .select('*')
    .or('is_public.eq.true,is_system_template.eq.true');

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.specialty) {
    query = query.eq('specialty', filters.specialty);
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  if (filters?.featured) {
    query = query.eq('is_featured', true);
  }

  // 정렬
  if (filters?.sortBy === 'rating') {
    query = query.order('rating_average', { ascending: false });
  } else if (filters?.sortBy === 'usage') {
    query = query.order('usage_count', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as WorkflowTemplateRecord[];
}

/**
 * 사용자의 템플릿 목록 조회
 */
export async function getUserTemplates(userId: string) {
  const { data, error } = await supabase
    .from('workflow_templates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as WorkflowTemplateRecord[];
}

/**
 * 템플릿 상세 조회
 */
export async function getTemplate(id: string) {
  const { data, error } = await supabase
    .from('workflow_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as WorkflowTemplateRecord;
}

/**
 * 템플릿 생성
 */
export async function createTemplate(
  userId: string,
  template: {
    name: string;
    description?: string;
    category: '안과' | '성형외과' | '피부과' | '공통';
    specialty?: string;
    target_surgery_type?: string;
    visual_data?: { nodes: Node<WorkflowNodeData>[]; edges: Edge[] };
    steps?: any[];
    tags?: string[];
    is_public?: boolean;
  }
) {
  const { data, error } = await supabase
    .from('workflow_templates')
    .insert({
      user_id: userId,
      name: template.name,
      description: template.description || null,
      category: template.category,
      specialty: template.specialty || null,
      target_surgery_type: template.target_surgery_type || null,
      visual_data: template.visual_data || null,
      steps: template.steps || null,
      tags: template.tags || [],
      is_public: template.is_public || false,
      is_featured: false,
      is_system_template: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data as WorkflowTemplateRecord;
}

/**
 * 템플릿 업데이트
 */
export async function updateTemplate(
  userId: string,
  id: string,
  updates: Partial<{
    name: string;
    description: string;
    category: '안과' | '성형외과' | '피부과' | '공통';
    specialty: string;
    target_surgery_type: string;
    visual_data: { nodes: Node<WorkflowNodeData>[]; edges: Edge[] };
    steps: any[];
    tags: string[];
    is_public: boolean;
  }>
) {
  const { data, error } = await supabase
    .from('workflow_templates')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as WorkflowTemplateRecord;
}

/**
 * 템플릿 삭제
 */
export async function deleteTemplate(userId: string, id: string) {
  const { error } = await supabase
    .from('workflow_templates')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * 템플릿 공유 설정
 */
export async function shareTemplate(userId: string, id: string, isPublic: boolean) {
  const { data, error } = await supabase
    .from('workflow_templates')
    .update({ is_public: isPublic })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as WorkflowTemplateRecord;
}

/**
 * 템플릿 평점 추가/수정
 */
export async function rateTemplate(
  userId: string,
  templateId: string,
  rating: number,
  comment?: string
) {
  const { data, error } = await supabase
    .from('workflow_template_ratings')
    .upsert(
      {
        template_id: templateId,
        user_id: userId,
        rating,
        comment: comment || null,
      },
      {
        onConflict: 'template_id,user_id',
      }
    )
    .select()
    .single();

  if (error) throw error;
  return data as TemplateRating;
}

/**
 * 템플릿 평점 조회
 */
export async function getTemplateRatings(templateId: string) {
  const { data, error } = await supabase
    .from('workflow_template_ratings')
    .select('*')
    .eq('template_id', templateId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as TemplateRating[];
}

/**
 * 사용자의 템플릿 평점 조회
 */
export async function getUserRating(userId: string, templateId: string) {
  const { data, error } = await supabase
    .from('workflow_template_ratings')
    .select('*')
    .eq('template_id', templateId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
  return data as TemplateRating | null;
}

/**
 * 템플릿 사용 이력 기록
 */
export async function recordTemplateUsage(
  userId: string,
  templateId: string,
  workflowId?: string
) {
  const { data, error } = await supabase
    .from('workflow_template_usage')
    .insert({
      template_id: templateId,
      user_id: userId,
      workflow_id: workflowId || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as TemplateUsage;
}

/**
 * 템플릿을 워크플로우로 변환
 */
export async function createWorkflowFromTemplate(
  userId: string,
  templateId: string,
  options?: {
    workflowName?: string;
    description?: string;
    activateImmediately?: boolean;
  }
) {
  // 템플릿 조회
  const template = await getTemplate(templateId);

  // 워크플로우 생성
  const { createWorkflow } = await import('./workflows');
  const workflow = await createWorkflow(userId, {
    name: options?.workflowName || `${template.name} (복사본)`,
    description: options?.description || template.description || undefined,
    trigger_type: 'post_surgery',
    target_surgery_type: template.target_surgery_type || undefined,
    visual_data: template.visual_data || undefined,
    steps: template.steps || undefined,
    is_active: options?.activateImmediately ?? false, // 기본값은 false (사용자가 확인 후 활성화)
  });

  // 사용 이력 기록
  await recordTemplateUsage(userId, templateId, workflow.id);

  return workflow;
}

/**
 * 워크플로우를 템플릿으로 내보내기
 */
export async function exportWorkflowAsTemplate(
  userId: string,
  workflowId: string,
  templateName: string,
  isPublic: boolean = false
) {
  const { getWorkflow } = await import('./workflows');
  const workflow = await getWorkflow(userId, workflowId);

  const template = await createTemplate(userId, {
    name: templateName,
    description: workflow.description || undefined,
    category: '공통', // 기본값, 사용자가 수정 가능
    target_surgery_type: workflow.target_surgery_type || undefined,
    visual_data: workflow.visual_data || undefined,
    steps: workflow.steps || undefined,
    is_public: isPublic,
  });

  return template;
}

/**
 * 템플릿을 JSON으로 내보내기
 */
export function exportTemplateAsJSON(template: WorkflowTemplateRecord): string {
  return JSON.stringify(
    {
      name: template.name,
      description: template.description,
      category: template.category,
      specialty: template.specialty,
      target_surgery_type: template.target_surgery_type,
      visual_data: template.visual_data,
      steps: template.steps,
      tags: template.tags,
      version: '1.0',
      exported_at: new Date().toISOString(),
    },
    null,
    2
  );
}

/**
 * JSON에서 템플릿 가져오기
 */
export function importTemplateFromJSON(json: string): {
  name: string;
  description?: string;
  category: '안과' | '성형외과' | '피부과' | '공통';
  specialty?: string;
  target_surgery_type?: string;
  visual_data?: { nodes: Node<WorkflowNodeData>[]; edges: Edge[] };
  steps?: any[];
  tags?: string[];
} {
  let data;
  try {
    data = JSON.parse(json);
  } catch (error) {
    throw new Error('Invalid JSON format');
  }

  if (!data.name) {
    throw new Error('Template name is required');
  }

  // 카테고리 검증
  const validCategories = ['안과', '성형외과', '피부과', '공통'];
  if (data.category && !validCategories.includes(data.category)) {
    throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
  }

  return {
    name: data.name,
    description: data.description,
    category: data.category || '공통',
    specialty: data.specialty,
    target_surgery_type: data.target_surgery_type,
    visual_data: data.visual_data,
    steps: data.steps,
    tags: data.tags || [],
  };
}

/**
 * 즐겨찾기 추가
 */
export async function addToFavorites(userId: string, templateId: string) {
  const { data, error } = await supabase
    .from('workflow_template_favorites')
    .insert({ user_id: userId, template_id: templateId })
    .select()
    .single();

  // 중복 에러는 무시 (이미 즐겨찾기된 경우)
  if (error && error.code !== '23505') throw error;
  return data;
}

/**
 * 즐겨찾기 제거
 */
export async function removeFromFavorites(userId: string, templateId: string) {
  const { error } = await supabase
    .from('workflow_template_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('template_id', templateId);

  if (error) throw error;
}

/**
 * 사용자의 즐겨찾기 목록 조회
 */
export async function getUserFavorites(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('workflow_template_favorites')
    .select('template_id')
    .eq('user_id', userId);

  if (error) throw error;
  return data.map(f => f.template_id);
}

/**
 * 템플릿이 즐겨찾기인지 확인
 */
export async function isFavorite(userId: string, templateId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('workflow_template_favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('template_id', templateId)
    .single();

  return !error && !!data;
}

