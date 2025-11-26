/**
 * 템플릿 관리 라이브러리
 * Supabase에 템플릿 저장 및 관리
 */

import { createServerClient } from './supabase';
import { MarketingTemplate, TemplateMessage } from './template-types';
import { DatabaseTemplate } from './database.types';

/**
 * MarketingTemplate을 DatabaseTemplate 형식으로 변환
 */
function toDatabaseTemplate(template: MarketingTemplate, userId: string): Partial<DatabaseTemplate> {
  return {
    user_id: userId,
    name: template.name,
    description: template.description,
    trigger_type: template.trigger.type,
    trigger_value: template.trigger.value,
    trigger_unit: template.trigger.unit,
    messages: JSON.stringify(template.messages),
    enabled: template.enabled,
  };
}

/**
 * DatabaseTemplate을 MarketingTemplate 형식으로 변환
 */
function fromDatabaseTemplate(dbTemplate: any): MarketingTemplate {
  return {
    id: dbTemplate.id,
    name: dbTemplate.name,
    description: dbTemplate.description || '',
    trigger: {
      type: dbTemplate.trigger_type as any,
      value: dbTemplate.trigger_value,
      unit: dbTemplate.trigger_unit as 'days' | 'months' | undefined,
    },
    messages: typeof dbTemplate.messages === 'string' 
      ? JSON.parse(dbTemplate.messages) 
      : dbTemplate.messages,
    enabled: dbTemplate.enabled,
    createdAt: new Date(dbTemplate.created_at),
    updatedAt: new Date(dbTemplate.updated_at),
  };
}

/**
 * 템플릿 목록 조회
 */
export async function getTemplates(userId: string): Promise<MarketingTemplate[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return (data || []).map(fromDatabaseTemplate);
}

/**
 * 템플릿 단일 조회
 */
export async function getTemplate(userId: string, id: string): Promise<MarketingTemplate | null> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }
  
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  
  return data ? fromDatabaseTemplate(data) : null;
}

/**
 * 템플릿 생성
 */
export async function createTemplate(
  userId: string,
  template: Omit<MarketingTemplate, 'id' | 'createdAt' | 'updatedAt'>
): Promise<MarketingTemplate> {
  const dbTemplate = toDatabaseTemplate(
    {
      ...template,
      id: '', // Will be generated
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    userId
  );

  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }
  
  const { data, error } = await supabase
    .from('templates')
    .insert(dbTemplate)
    .select()
    .single();

  if (error) throw error;
  return fromDatabaseTemplate(data);
}

/**
 * 템플릿 업데이트
 */
export async function updateTemplate(
  userId: string,
  id: string,
  updates: Partial<Omit<MarketingTemplate, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<MarketingTemplate> {
  const updateData: any = {};
  
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.enabled !== undefined) updateData.enabled = updates.enabled;
  if (updates.trigger !== undefined) {
    updateData.trigger_type = updates.trigger.type;
    updateData.trigger_value = updates.trigger.value;
    updateData.trigger_unit = updates.trigger.unit;
  }
  if (updates.messages !== undefined) {
    updateData.messages = JSON.stringify(updates.messages);
  }

  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }
  
  const { data, error } = await supabase
    .from('templates')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return fromDatabaseTemplate(data);
}

/**
 * 템플릿 삭제
 */
export async function deleteTemplate(userId: string, id: string): Promise<void> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }
  
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * 템플릿 복제
 */
export async function duplicateTemplate(
  userId: string,
  id: string
): Promise<MarketingTemplate> {
  const original = await getTemplate(userId, id);
  if (!original) {
    throw new Error('템플릿을 찾을 수 없습니다.');
  }

  const duplicated: Omit<MarketingTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
    name: `${original.name} (복사본)`,
    description: original.description,
    trigger: original.trigger,
    messages: original.messages.map(msg => ({ ...msg })),
    enabled: false, // 복사본은 비활성화 상태로 생성
  };

  return createTemplate(userId, duplicated);
}

