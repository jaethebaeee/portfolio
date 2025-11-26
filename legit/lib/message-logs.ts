/**
 * 발송 이력 관리 유틸리티
 */

import { createServerClient } from './supabase';
import { MessageLog } from './database.types';

export interface CreateMessageLogInput {
  patient_id?: string;
  template_id?: string;
  campaign_id?: string;
  channel: 'kakao' | 'sms';
  recipient_phone: string;
  message_content: string;
  status?: 'pending' | 'sent' | 'failed' | 'delivered';
  error_message?: string;
  provider?: 'nhn' | 'coolsms' | 'direct' | string; // SMS/Kakao 공급자
}

/**
 * 발송 이력 생성
 */
export async function createMessageLog(
  userId: string,
  input: CreateMessageLogInput
): Promise<MessageLog> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }
  
  const { data, error } = await supabase
    .from('message_logs')
    .insert({
      user_id: userId,
      ...input,
      status: input.status || 'pending',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`발송 이력 생성 실패: ${error.message}`);
  }

  return data;
}

/**
 * 발송 이력 업데이트 (상태 변경)
 */
export async function updateMessageLogStatus(
  userId: string,
  logId: string,
  status: 'sent' | 'failed' | 'delivered',
  errorMessage?: string
): Promise<MessageLog> {
  const updateData: any = {
    status,
  };

  if (status === 'sent') {
    updateData.sent_at = new Date().toISOString();
  } else if (status === 'delivered') {
    updateData.delivered_at = new Date().toISOString();
  }

  if (errorMessage) {
    updateData.error_message = errorMessage;
  }

  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }
  
  const { data, error } = await supabase
    .from('message_logs')
    .update(updateData)
    .eq('id', logId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`발송 이력 업데이트 실패: ${error.message}`);
  }

  return data;
}

/**
 * 발송 이력 목록 조회
 */
export async function getMessageLogs(
  userId: string,
  options?: {
    patient_id?: string;
    template_id?: string;
    campaign_id?: string;
    channel?: 'kakao' | 'sms';
    status?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ logs: MessageLog[]; total: number }> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }
  
  let query = supabase
    .from('message_logs')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (options?.patient_id) {
    query = query.eq('patient_id', options.patient_id);
  }
  if (options?.template_id) {
    query = query.eq('template_id', options.template_id);
  }
  if (options?.campaign_id) {
    query = query.eq('campaign_id', options.campaign_id);
  }
  if (options?.channel) {
    query = query.eq('channel', options.channel);
  }
  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`발송 이력 조회 실패: ${error.message}`);
  }

  return {
    logs: data || [],
    total: count || 0,
  };
}

/**
 * 발송 통계 조회
 */
export async function getMessageStats(userId: string): Promise<{
  total: number;
  sent: number;
  failed: number;
  pending: number;
  by_channel: { kakao: number; sms: number };
}> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }
  
  const { data, error } = await supabase
    .from('message_logs')
    .select('status, channel')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`통계 조회 실패: ${error.message}`);
  }

  const stats = {
    total: data.length,
    sent: 0,
    failed: 0,
    pending: 0,
    by_channel: { kakao: 0, sms: 0 },
  };

  data.forEach((log) => {
    if (log.status === 'sent' || log.status === 'delivered') {
      stats.sent++;
    } else if (log.status === 'failed') {
      stats.failed++;
    } else if (log.status === 'pending') {
      stats.pending++;
    }

    if (log.channel === 'kakao') {
      stats.by_channel.kakao++;
    } else if (log.channel === 'sms') {
      stats.by_channel.sms++;
    }
  });

  return stats;
}
