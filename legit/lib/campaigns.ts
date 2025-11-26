/**
 * 캠페인 데이터 관리 유틸리티
 */

import { createServerClient } from './supabase';
import { Campaign } from './database.types';

export interface CreateCampaignInput {
  name: string;
  description?: string;
  template_id: string;
  target_patients?: string[];
  scheduled_at?: string;
  status?: 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled';
}

export interface UpdateCampaignInput extends Partial<CreateCampaignInput> {}

/**
 * 캠페인 목록 조회
 */
export async function getCampaigns(userId: string, filters?: {
  status?: string;
}): Promise<Campaign[]> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }

  let query = supabase
    .from('campaigns')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`캠페인 목록 조회 실패: ${error.message}`);
  }

  return data || [];
}

/**
 * 캠페인 단일 조회
 */
export async function getCampaign(userId: string, campaignId: string): Promise<Campaign | null> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }

  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`캠페인 조회 실패: ${error.message}`);
  }

  return data;
}

/**
 * 캠페인 생성
 */
export async function createCampaign(userId: string, input: CreateCampaignInput): Promise<Campaign> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }

  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      user_id: userId,
      ...input,
      status: input.status || 'draft',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`캠페인 생성 실패: ${error.message}`);
  }

  return data;
}

/**
 * 캠페인 업데이트
 */
export async function updateCampaign(
  userId: string,
  campaignId: string,
  input: UpdateCampaignInput
): Promise<Campaign> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }

  const { data, error } = await supabase
    .from('campaigns')
    .update(input)
    .eq('id', campaignId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`캠페인 업데이트 실패: ${error.message}`);
  }

  return data;
}

/**
 * 캠페인 삭제
 */
export async function deleteCampaign(userId: string, campaignId: string): Promise<void> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }

  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', campaignId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`캠페인 삭제 실패: ${error.message}`);
  }
}

/**
 * 캠페인 실행 (배치 발송)
 */
export async function executeCampaign(userId: string, campaignId: string): Promise<{
  success: boolean;
  sentCount: number;
  failedCount: number;
  errors: string[];
}> {
  const campaign = await getCampaign(userId, campaignId);
  if (!campaign) {
    throw new Error('캠페인을 찾을 수 없습니다.');
  }

  if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
    throw new Error('실행 가능한 상태의 캠페인이 아닙니다.');
  }

  // 캠페인 상태를 'running'으로 변경
  await updateCampaign(userId, campaignId, {
    status: 'running',
    started_at: new Date().toISOString(),
  });

  const errors: string[] = [];
  let sentCount = 0;
  let failedCount = 0;

  try {
    // 템플릿 조회
    const supabase = createServerClient();
    if (!supabase) {
      throw new Error('Supabase가 설정되지 않았습니다.');
    }

    const { data: templateData, error: templateError } = await supabase
      .from('templates')
      .select('*')
      .eq('id', campaign.template_id)
      .eq('user_id', userId)
      .single();

    if (templateError || !templateData) {
      throw new Error('템플릿을 찾을 수 없습니다.');
    }

    // 환자 목록 조회
    const { getPatients } = await import('./patients');
    const allPatients = await getPatients(userId);
    const targetPatients = campaign.target_patients && campaign.target_patients.length > 0
      ? allPatients.filter((p) => campaign.target_patients!.includes(p.id))
      : allPatients;

    // 각 환자에 대해 템플릿 실행
    const { executeTemplate, TemplateVariableContext } = await import('./template-engine');
    const { MarketingTemplate } = await import('./template-types');

    const template: MarketingTemplate = {
      id: templateData.id,
      name: templateData.name,
      description: templateData.description,
      trigger: {
        type: templateData.trigger_type,
        value: templateData.trigger_value,
        unit: templateData.trigger_unit,
      },
      messages: Array.isArray(templateData.messages) ? templateData.messages : [],
      enabled: templateData.enabled,
      createdAt: new Date(templateData.created_at),
      updatedAt: new Date(templateData.updated_at),
    };

    for (const patient of targetPatients) {
      try {
        const context: TemplateVariableContext = {
          patient,
        };

        const result = await executeTemplate(
          userId,
          template,
          context,
          patient.id,
          campaignId
        );

        if (result.success) {
          sentCount += result.sentCount;
          failedCount += result.failedCount;
        } else {
          failedCount++;
          errors.push(`환자 ${patient.name}: ${result.errors.join(', ')}`);
        }
      } catch (error: any) {
        failedCount++;
        errors.push(`환자 ${patient.name}: ${error.message}`);
      }
    }

    // 캠페인 상태를 'completed'로 변경
    await updateCampaign(userId, campaignId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });

    return {
      success: sentCount > 0,
      sentCount,
      failedCount,
      errors,
    };
  } catch (error: any) {
    // 에러 발생 시 상태를 'cancelled'로 변경
    await updateCampaign(userId, campaignId, {
      status: 'cancelled',
    });

    throw error;
  }
}

