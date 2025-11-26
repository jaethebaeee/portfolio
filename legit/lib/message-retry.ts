/**
 * 메시지 재시도 로직
 * 실패한 발송을 자동으로 재시도
 */

import { createServerClient } from './supabase';
import { MessageLog } from './database.types';
import { executeTemplateMessage } from './template-engine';
import { TemplateMessage } from './template-types';

export interface RetryConfig {
  maxRetries: number; // 최대 재시도 횟수 (기본: 3)
  retryIntervals: number[]; // 재시도 간격 (초 단위) [60, 300, 1800] = 1분, 5분, 30분
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryIntervals: [60, 300, 1800], // 1분, 5분, 30분
};

/**
 * 재시도 가능한 실패 메시지 조회
 */
export async function getRetryableMessages(
  userId: string,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<MessageLog[]> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }

  // 실패한 메시지 중 재시도 가능한 것들 조회
  const { data, error } = await supabase
    .from('message_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'failed')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`메시지 조회 실패: ${error.message}`);
  }

  if (!data) return [];

  // 재시도 가능한 메시지 필터링
  const now = Date.now();
  const retryableMessages: MessageLog[] = [];

  for (const log of data) {
    // 재시도 횟수 확인 (metadata에 저장)
    const metadata = (log as any).metadata || {};
    const retryCount = metadata.retry_count || 0;

    if (retryCount >= config.maxRetries) {
      continue; // 최대 재시도 횟수 초과
    }

    // 재시도 간격 확인
    const lastRetryTime = metadata.last_retry_time
      ? new Date(metadata.last_retry_time).getTime()
      : new Date(log.created_at).getTime();
    
    const timeSinceLastRetry = (now - lastRetryTime) / 1000; // 초 단위
    const requiredInterval = config.retryIntervals[retryCount] || config.retryIntervals[config.retryIntervals.length - 1];

    if (timeSinceLastRetry >= requiredInterval) {
      retryableMessages.push(log);
    }
  }

  return retryableMessages;
}

/**
 * 메시지 재시도 실행
 */
export async function retryMessage(
  userId: string,
  messageLog: MessageLog,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }

  const metadata = (messageLog as any).metadata || {};
  const retryCount = (metadata.retry_count || 0) + 1;

  try {
    // 메시지 재발송 시도
    // 여기서는 실제 발송 로직을 호출해야 함
    // 현재는 메시지 로그만 있으므로, 템플릿과 환자 정보를 다시 조회해야 함
    
    // 재시도 상태 업데이트
    await supabase
      .from('message_logs')
      .update({
        status: 'pending',
        metadata: {
          retry_count: retryCount,
          last_retry_time: new Date().toISOString(),
        },
      })
      .eq('id', messageLog.id);

    // 실제 재발송은 별도 함수에서 처리
    // 여기서는 재시도 이력만 기록

    return { success: true };
  } catch (error: any) {
    // 재시도 실패 시 메타데이터 업데이트
    await supabase
      .from('message_logs')
      .update({
        metadata: {
          retry_count: retryCount,
          last_retry_time: new Date().toISOString(),
          last_retry_error: error.message,
        },
      })
      .eq('id', messageLog.id);

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * 모든 재시도 가능한 메시지 재시도
 */
export async function retryAllFailedMessages(
  userId: string,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<{
  processed: number;
  retried: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let processed = 0;
  let retried = 0;

  try {
    const retryableMessages = await getRetryableMessages(userId, config);

    for (const message of retryableMessages) {
      processed++;

      try {
        const result = await retryMessage(userId, message, config);
        if (result.success) {
          retried++;
        } else {
          errors.push(`메시지 ${message.id}: ${result.error}`);
        }
      } catch (error: any) {
        errors.push(`메시지 ${message.id}: ${error.message}`);
      }
    }
  } catch (error: any) {
    errors.push(`재시도 프로세스 오류: ${error.message}`);
  }

  return {
    processed,
    retried,
    errors,
  };
}

