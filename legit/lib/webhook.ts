/**
 * 웹훅 관리 유틸리티
 * n8n 스타일의 웹훅 트리거 기능
 */

import { createServerClient } from './supabase';
import crypto from 'crypto';

export interface Webhook {
  id: string;
  user_id: string;
  name: string;
  workflow_id?: string; // 연결된 워크플로우 또는 템플릿 ID
  secret: string; // 웹훅 시크릿 키
  url: string; // 웹훅 URL
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateWebhookInput {
  name: string;
  workflow_id?: string;
  enabled?: boolean;
}

/**
 * 웹훅 생성
 */
export async function createWebhook(
  userId: string,
  input: CreateWebhookInput
): Promise<Webhook> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }

  // 시크릿 키 생성
  const secret = crypto.randomBytes(32).toString('hex');
  
  // 웹훅 ID 생성
  const webhookId = crypto.randomBytes(16).toString('hex');
  
  // 웹훅 URL 생성
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://doctorsflow.com';
  const webhookUrl = `${baseUrl}/api/webhooks/${webhookId}`;

  const { data, error } = await supabase
    .from('webhooks')
    .insert({
      id: webhookId,
      user_id: userId,
      name: input.name,
      workflow_id: input.workflow_id,
      secret,
      url: webhookUrl,
      enabled: input.enabled ?? true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`웹훅 생성 실패: ${error.message}`);
  }

  return data;
}

/**
 * 웹훅 조회
 */
export async function getWebhook(
  userId: string,
  webhookId: string
): Promise<Webhook | null> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }

  const { data, error } = await supabase
    .from('webhooks')
    .select('*')
    .eq('id', webhookId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`웹훅 조회 실패: ${error.message}`);
  }

  return data;
}

/**
 * 사용자의 모든 웹훅 조회
 */
export async function getWebhooks(userId: string): Promise<Webhook[]> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }

  const { data, error } = await supabase
    .from('webhooks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`웹훅 목록 조회 실패: ${error.message}`);
  }

  return data || [];
}

/**
 * 웹훅 시크릿 검증
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * 웹훅 삭제
 */
export async function deleteWebhook(
  userId: string,
  webhookId: string
): Promise<void> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }

  const { error } = await supabase
    .from('webhooks')
    .delete()
    .eq('id', webhookId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`웹훅 삭제 실패: ${error.message}`);
  }
}

/**
 * 웹훅 활성화/비활성화
 */
export async function toggleWebhook(
  userId: string,
  webhookId: string,
  enabled: boolean
): Promise<Webhook> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }

  const { data, error } = await supabase
    .from('webhooks')
    .update({ enabled })
    .eq('id', webhookId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`웹훅 업데이트 실패: ${error.message}`);
  }

  return data;
}

