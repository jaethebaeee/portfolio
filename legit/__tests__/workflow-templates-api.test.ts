/**
 * 워크플로우 템플릿 API 테스트
 * 
 * 이 파일은 워크플로우 템플릿 API의 기본 기능을 테스트합니다.
 * 실제 실행을 위해서는 테스트 프레임워크가 필요합니다.
 */

import { getPublicTemplates, createTemplate, importTemplateFromJSON } from '@/lib/workflow-template-library';

// 테스트용 샘플 템플릿 데이터
const sampleTemplate = {
  name: '테스트 템플릿',
  description: '테스트용 템플릿입니다',
  category: '공통' as const,
  visual_data: {
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: { type: 'trigger', label: '테스트 트리거', triggerType: 'appointment_created' },
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 250, y: 150 },
        data: {
          type: 'action',
          label: '테스트 액션',
          actionType: 'send_kakao',
          message_template: '테스트 메시지입니다.',
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'action-1' },
    ],
  },
  steps: null,
  tags: ['테스트', '샘플'],
  is_public: false,
};

// 테스트 함수들
export async function testGetPublicTemplates() {
  console.log('🧪 테스트: 공개 템플릿 조회');
  try {
    const templates = await getPublicTemplates({
      category: '안과',
      sortBy: 'rating',
    });
    console.log('✅ 성공:', templates.length, '개의 템플릿 조회됨');
    return templates;
  } catch (error) {
    console.error('❌ 실패:', error);
    throw error;
  }
}

export async function testCreateTemplate(userId: string) {
  console.log('🧪 테스트: 템플릿 생성');
  try {
    const template = await createTemplate(userId, sampleTemplate);
    console.log('✅ 성공: 템플릿 생성됨', template.id);
    return template;
  } catch (error) {
    console.error('❌ 실패:', error);
    throw error;
  }
}

export async function testImportExport() {
  console.log('🧪 테스트: Import/Export');
  try {
    // Export 테스트
    const exportData = {
      name: '테스트 템플릿',
      description: '테스트용',
      category: '공통' as const,
      visual_data: sampleTemplate.visual_data,
      tags: ['테스트'],
    };
    
    const json = JSON.stringify(exportData, null, 2);
    console.log('✅ Export 성공:', json.substring(0, 100) + '...');
    
    // Import 테스트
    const imported = importTemplateFromJSON(json);
    console.log('✅ Import 성공:', imported.name);
    
    return { exported: json, imported };
  } catch (error) {
    console.error('❌ 실패:', error);
    throw error;
  }
}

// 수동 테스트 실행 함수
export async function runTests(userId?: string) {
  console.log('🚀 워크플로우 템플릿 API 테스트 시작\n');
  
  try {
    // 1. 공개 템플릿 조회 테스트
    await testGetPublicTemplates();
    console.log('');
    
    // 2. Import/Export 테스트
    await testImportExport();
    console.log('');
    
    // 3. 템플릿 생성 테스트 (userId가 제공된 경우)
    if (userId) {
      await testCreateTemplate(userId);
      console.log('');
    } else {
      console.log('⏭️  템플릿 생성 테스트 건너뜀 (userId 필요)');
    }
    
    console.log('✅ 모든 테스트 완료!');
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
    throw error;
  }
}

// 직접 실행 시
if (require.main === module) {
  // 환경 변수에서 userId 가져오기 또는 명령줄 인자 사용
  const userId = process.env.TEST_USER_ID || process.argv[2];
  
  runTests(userId)
    .then(() => {
      console.log('\n✨ 테스트 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 테스트 실패:', error);
      process.exit(1);
    });
}

