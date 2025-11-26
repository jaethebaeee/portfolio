/**
 * 템플릿 스케줄러
 * 트리거 조건에 따라 자동으로 템플릿을 실행하는 로직
 * 
 * 참고: 실제 스케줄러는 cron job이나 별도의 백그라운드 서비스로 구현해야 합니다.
 * 이 파일은 스케줄러 로직의 예시입니다.
 */

import { createServerClient } from './supabase';
import { MarketingTemplate } from './template-types';
import { checkTriggerCondition, executeTemplate, TemplateVariableContext } from './template-engine';
import { getPatients } from './patients';

/**
 * 활성화된 템플릿 조회
 */
export async function getActiveTemplates(userId: string): Promise<MarketingTemplate[]> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('user_id', userId)
    .eq('enabled', true);

  if (error) {
    throw new Error(`템플릿 조회 실패: ${error.message}`);
  }

  // JSONB를 파싱하여 MarketingTemplate 형식으로 변환
  return (data || []).map((t: any) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    trigger: {
      type: t.trigger_type,
      value: t.trigger_value,
      unit: t.trigger_unit,
    },
    messages: Array.isArray(t.messages) ? t.messages : [],
    enabled: t.enabled,
    createdAt: new Date(t.created_at),
    updatedAt: new Date(t.updated_at),
  }));
}

/**
 * 스케줄러 실행 (하루에 한 번 실행)
 * 모든 활성화된 템플릿을 확인하고 조건에 맞는 템플릿 실행
 */
export async function runScheduler(userId: string): Promise<{
  processed: number;
  executed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let processed = 0;
  let executed = 0;

  try {
    // 활성화된 템플릿 조회
    const templates = await getActiveTemplates(userId);
    
    // 모든 환자 조회
    const patients = await getPatients(userId);

    // 각 템플릿에 대해
    for (const template of templates) {
      // 각 환자에 대해
      for (const patient of patients) {
        processed++;

        try {
          // 트리거 조건 확인
          const context: TemplateVariableContext = {
            patient,
          };

          if (checkTriggerCondition(template, context)) {
            // 조건에 맞으면 템플릿 실행
            const result = await executeTemplate(
              userId,
              template,
              context,
              patient.id
            );

            if (result.success) {
              executed++;
            } else {
              errors.push(
                `템플릿 "${template.name}" (환자: ${patient.name}): ${result.errors.join(', ')}`
              );
            }
          }
        } catch (error: any) {
          errors.push(
            `템플릿 "${template.name}" (환자: ${patient.name}): ${error.message}`
          );
        }
      }
    }
  } catch (error: any) {
    errors.push(`스케줄러 실행 오류: ${error.message}`);
  }

  return {
    processed,
    executed,
    errors,
  };
}

/**
 * 특정 트리거 타입에 대한 스케줄러 실행
 */
export async function runSchedulerForTrigger(
  userId: string,
  triggerType: string
): Promise<{
  processed: number;
  executed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let processed = 0;
  let executed = 0;

  try {
    // 특정 트리거 타입의 템플릿만 조회
    const supabase = createServerClient();
    if (!supabase) {
      throw new Error('Supabase가 설정되지 않았습니다.');
    }

    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('user_id', userId)
      .eq('enabled', true)
      .eq('trigger_type', triggerType);

    if (error) {
      throw new Error(`템플릿 조회 실패: ${error.message}`);
    }

    const templates = (data || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      trigger: {
        type: t.trigger_type,
        value: t.trigger_value,
        unit: t.trigger_unit,
      },
      messages: Array.isArray(t.messages) ? t.messages : [],
      enabled: t.enabled,
      createdAt: new Date(t.created_at),
      updatedAt: new Date(t.updated_at),
    }));

    // 모든 환자 조회
    const patients = await getPatients(userId);

    // 각 템플릿에 대해
    for (const template of templates) {
      // 각 환자에 대해
      for (const patient of patients) {
        processed++;

        try {
          // 트리거 조건 확인
          const context: TemplateVariableContext = {
            patient,
          };

          if (checkTriggerCondition(template, context)) {
            // 조건에 맞으면 템플릿 실행
            const result = await executeTemplate(
              userId,
              template,
              context,
              patient.id
            );

            if (result.success) {
              executed++;
            } else {
              errors.push(
                `템플릿 "${template.name}" (환자: ${patient.name}): ${result.errors.join(', ')}`
              );
            }
          }
        } catch (error: any) {
          errors.push(
            `템플릿 "${template.name}" (환자: ${patient.name}): ${error.message}`
          );
        }
      }
    }
  } catch (error: any) {
    errors.push(`스케줄러 실행 오류: ${error.message}`);
  }

  return {
    processed,
    executed,
    errors,
  };
}

