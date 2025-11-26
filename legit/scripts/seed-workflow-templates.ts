/**
 * 워크플로우 템플릿 시드 스크립트
 * 
 * 기본 템플릿들을 데이터베이스에 추가합니다.
 * 
 * 실행 방법:
 * npx tsx scripts/seed-workflow-templates.ts
 */

import { supabase } from '../lib/supabase';
import { workflowTemplates } from '../lib/workflow-templates';

async function seedTemplates() {
  console.log('워크플로우 템플릿 시드 시작...');

  for (const template of workflowTemplates) {
    try {
      // 템플릿이 이미 존재하는지 확인
      const { data: existing } = await supabase
        .from('workflow_templates')
        .select('id')
        .eq('name', template.name)
        .eq('is_system_template', true)
        .single();

      if (existing) {
        console.log(`✓ 템플릿 "${template.name}" 이미 존재함`);
        continue;
      }

      // 템플릿 생성
      const { data, error } = await supabase
        .from('workflow_templates')
        .insert({
          user_id: null, // 시스템 템플릿
          name: template.name,
          description: template.description,
          category: template.category,
          specialty: template.targetSurgery || null,
          target_surgery_type: template.targetSurgery || null,
          visual_data: {
            nodes: template.nodes,
            edges: template.edges,
          },
          steps: null,
          tags: template.tags || [],
          is_public: true,
          is_featured: template.isFeatured || false,
          is_system_template: true,
          usage_count: 0,
          rating_average: 0,
          rating_count: 0,
        })
        .select()
        .single();

      if (error) {
        console.error(`✗ 템플릿 "${template.name}" 생성 실패:`, error.message);
      } else {
        console.log(`✓ 템플릿 "${template.name}" 생성 완료`);
      }
    } catch (error: any) {
      console.error(`✗ 템플릿 "${template.name}" 처리 중 오류:`, error.message);
    }
  }

  console.log('워크플로우 템플릿 시드 완료!');
}

// 스크립트 직접 실행 시
if (require.main === module) {
  seedTemplates()
    .then(() => {
      console.log('시드 작업이 완료되었습니다.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('시드 작업 중 오류 발생:', error);
      process.exit(1);
    });
}

export { seedTemplates };

