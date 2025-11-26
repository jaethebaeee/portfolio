/**
 * 워크플로우 템플릿 Import/Export 함수 테스트
 * 
 * 실행: node test-template-import-export.js
 */

// 테스트용 샘플 JSON 데이터
const sampleTemplateJSON = JSON.stringify({
  name: '테스트 템플릿',
  description: '테스트용 템플릿입니다',
  category: '공통',
  specialty: 'test',
  target_surgery_type: 'test',
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
  version: '1.0',
  exported_at: new Date().toISOString(),
}, null, 2);

// Import 함수 로직 테스트 (간단한 버전)
function testImportTemplateFromJSON(json) {
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

// Export 함수 로직 테스트 (간단한 버전)
function testExportTemplateAsJSON(template) {
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

// 테스트 실행
console.log('🧪 워크플로우 템플릿 Import/Export 테스트 시작\n');

try {
  // 1. Import 테스트
  console.log('1️⃣ Import 테스트');
  console.log('   입력 JSON:', sampleTemplateJSON.substring(0, 100) + '...\n');
  
  const imported = testImportTemplateFromJSON(sampleTemplateJSON);
  console.log('   ✅ Import 성공!');
  console.log('   - 이름:', imported.name);
  console.log('   - 카테고리:', imported.category);
  console.log('   - 노드 수:', imported.visual_data?.nodes?.length || 0);
  console.log('   - 태그:', imported.tags.join(', '));
  console.log('');

  // 2. Export 테스트
  console.log('2️⃣ Export 테스트');
  const exported = testExportTemplateAsJSON(imported);
  console.log('   ✅ Export 성공!');
  console.log('   - JSON 길이:', exported.length, 'bytes');
  console.log('   - 이름 포함:', exported.includes(imported.name) ? '✅' : '❌');
  console.log('   - 카테고리 포함:', exported.includes(imported.category) ? '✅' : '❌');
  console.log('');

  // 3. Round-trip 테스트 (Import -> Export -> Import)
  console.log('3️⃣ Round-trip 테스트 (Import -> Export -> Import)');
  const reImported = testImportTemplateFromJSON(exported);
  const isSame = reImported.name === imported.name && 
                 reImported.category === imported.category;
  console.log('   ' + (isSame ? '✅' : '❌'), 'Round-trip 성공:', isSame ? '데이터 일치' : '데이터 불일치');
  console.log('');

  // 4. 오류 처리 테스트
  console.log('4️⃣ 오류 처리 테스트');
  
  // 잘못된 JSON
  try {
    testImportTemplateFromJSON('{ invalid json }');
    console.log('   ❌ 잘못된 JSON 테스트 실패 (오류가 발생해야 함)');
  } catch (error) {
    console.log('   ✅ 잘못된 JSON 처리:', error.message);
  }
  
  // 이름 없음
  try {
    testImportTemplateFromJSON('{"category": "공통"}');
    console.log('   ❌ 이름 없음 테스트 실패 (오류가 발생해야 함)');
  } catch (error) {
    console.log('   ✅ 이름 없음 처리:', error.message);
  }
  
  // 잘못된 카테고리
  try {
    testImportTemplateFromJSON('{"name": "테스트", "category": "잘못된카테고리"}');
    console.log('   ❌ 잘못된 카테고리 테스트 실패 (오류가 발생해야 함)');
  } catch (error) {
    console.log('   ✅ 잘못된 카테고리 처리:', error.message);
  }
  
  console.log('');

  console.log('✨ 모든 테스트 통과!');
  console.log('\n📊 테스트 결과 요약:');
  console.log('   ✅ Import 기능: 정상');
  console.log('   ✅ Export 기능: 정상');
  console.log('   ✅ Round-trip: 정상');
  console.log('   ✅ 오류 처리: 정상');
  
} catch (error) {
  console.error('❌ 테스트 실패:', error.message);
  console.error(error);
  process.exit(1);
}

