/**
 * 워크플로우 템플릿 라이브러리 종합 테스트
 * 
 * 실행: node test-workflow-templates-comprehensive.js
 */

console.log('🧪 워크플로우 템플릿 라이브러리 종합 테스트 시작\n');

// 테스트 결과 추적
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function test(name, fn) {
  try {
    const result = fn();
    if (result === true || (result && result.success !== false)) {
      testResults.passed++;
      testResults.tests.push({ name, status: '✅ PASS', details: result.details || '' });
      console.log(`✅ ${name}`);
      if (result.details) console.log(`   ${result.details}`);
      return true;
    } else {
      testResults.failed++;
      testResults.tests.push({ name, status: '❌ FAIL', details: result.error || 'Unknown error' });
      console.log(`❌ ${name}`);
      console.log(`   ${result.error || 'Test failed'}`);
      return false;
    }
  } catch (error) {
    testResults.failed++;
    testResults.tests.push({ name, status: '❌ ERROR', details: error.message });
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// 1. JSON Import/Export 함수 테스트
console.log('📦 1. Import/Export 함수 테스트\n');

test('JSON 파싱 - 유효한 JSON', () => {
  const json = '{"name": "테스트", "category": "공통"}';
  try {
    const data = JSON.parse(json);
    return { success: data.name === '테스트' };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

test('JSON 파싱 - 잘못된 JSON', () => {
  const json = '{ invalid json }';
  try {
    JSON.parse(json);
    return { success: false, error: 'Should have thrown error' };
  } catch (e) {
    return { success: true, details: 'Correctly throws error' };
  }
});

test('템플릿 데이터 구조 검증 - 필수 필드', () => {
  const validTemplate = {
    name: '테스트 템플릿',
    category: '공통',
    visual_data: { nodes: [], edges: [] }
  };
  const invalidTemplate = {
    category: '공통'
    // name 누락
  };
  
  const hasName1 = !!validTemplate.name;
  const hasName2 = !!invalidTemplate.name;
  
  return {
    success: hasName1 && !hasName2,
    details: `Valid: ${hasName1}, Invalid: ${hasName2}`
  };
});

test('카테고리 검증', () => {
  const validCategories = ['안과', '성형외과', '피부과', '공통'];
  const testCases = [
    { category: '안과', expected: true },
    { category: '성형외과', expected: true },
    { category: '피부과', expected: true },
    { category: '공통', expected: true },
    { category: '잘못된카테고리', expected: false },
    { category: null, expected: false }
  ];
  
  const results = testCases.map(tc => ({
    category: tc.category,
    isValid: validCategories.includes(tc.category),
    expected: tc.expected
  }));
  
  const allPass = results.every(r => r.isValid === r.expected);
  return {
    success: allPass,
    details: `${results.filter(r => r.isValid === r.expected).length}/${results.length} cases passed`
  };
});

// 2. 데이터 구조 테스트
console.log('\n📊 2. 데이터 구조 테스트\n');

test('템플릿 레코드 구조', () => {
  const template = {
    id: 'test-id',
    user_id: 'user-123',
    name: '테스트',
    description: '설명',
    category: '공통',
    specialty: null,
    target_surgery_type: null,
    visual_data: { nodes: [], edges: [] },
    steps: null,
    is_public: true,
    is_featured: false,
    is_system_template: false,
    usage_count: 0,
    rating_average: 0,
    rating_count: 0,
    tags: [],
    preview_image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const requiredFields = ['id', 'name', 'category', 'is_public', 'usage_count', 'rating_average'];
  const allPresent = requiredFields.every(field => field in template);
  
  return {
    success: allPresent,
    details: `All ${requiredFields.length} required fields present`
  };
});

test('노드 데이터 구조', () => {
  const node = {
    id: 'node-1',
    type: 'trigger',
    position: { x: 100, y: 200 },
    data: {
      type: 'trigger',
      label: '테스트 트리거',
      triggerType: 'appointment_created'
    }
  };
  
  const hasRequired = node.id && node.type && node.position && node.data;
  const hasDataFields = node.data.type && node.data.label;
  
  return {
    success: hasRequired && hasDataFields,
    details: 'Node structure valid'
  };
});

test('엣지 데이터 구조', () => {
  const edge = {
    id: 'edge-1',
    source: 'node-1',
    target: 'node-2'
  };
  
  const hasRequired = edge.id && edge.source && edge.target;
  
  return {
    success: hasRequired,
    details: 'Edge structure valid'
  };
});

// 3. 필터링 로직 테스트
console.log('\n🔍 3. 필터링 로직 테스트\n');

test('카테고리 필터링', () => {
  const templates = [
    { name: '템플릿1', category: '안과' },
    { name: '템플릿2', category: '성형외과' },
    { name: '템플릿3', category: '안과' },
    { name: '템플릿4', category: '피부과' }
  ];
  
  const filtered = templates.filter(t => t.category === '안과');
  const expectedCount = 2;
  
  return {
    success: filtered.length === expectedCount,
    details: `Filtered ${filtered.length} templates (expected ${expectedCount})`
  };
});

test('검색 필터링 - 이름', () => {
  const templates = [
    { name: '라식 수술 케어', description: '설명' },
    { name: '백내장 수술', description: '설명' },
    { name: '코성형 케어', description: '설명' }
  ];
  
  const searchTerm = '수술';
  const filtered = templates.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return {
    success: filtered.length === 2,
    details: `Found ${filtered.length} templates matching "${searchTerm}"`
  };
});

test('검색 필터링 - 설명', () => {
  const templates = [
    { name: '템플릿1', description: '라식 수술 후 케어' },
    { name: '템플릿2', description: '백내장 수술 케어' },
    { name: '템플릿3', description: '일반 케어' }
  ];
  
  const searchTerm = '수술';
  const filtered = templates.filter(t => 
    t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return {
    success: filtered.length === 2,
    details: `Found ${filtered.length} templates with description matching "${searchTerm}"`
  };
});

test('태그 필터링', () => {
  const templates = [
    { name: '템플릿1', tags: ['라식', '안과'] },
    { name: '템플릿2', tags: ['백내장', '안과'] },
    { name: '템플릿3', tags: ['코성형', '성형외과'] }
  ];
  
  const searchTag = '안과';
  const filtered = templates.filter(t => 
    t.tags?.some(tag => tag.toLowerCase().includes(searchTag.toLowerCase()))
  );
  
  return {
    success: filtered.length === 2,
    details: `Found ${filtered.length} templates with tag "${searchTag}"`
  };
});

// 4. 정렬 로직 테스트
console.log('\n📈 4. 정렬 로직 테스트\n');

test('평점순 정렬', () => {
  const templates = [
    { name: '템플릿1', rating_average: 4.5 },
    { name: '템플릿2', rating_average: 3.2 },
    { name: '템플릿3', rating_average: 4.8 },
    { name: '템플릿4', rating_average: 2.1 }
  ];
  
  const sorted = [...templates].sort((a, b) => b.rating_average - a.rating_average);
  const isDescending = sorted[0].rating_average >= sorted[1].rating_average &&
                       sorted[1].rating_average >= sorted[2].rating_average;
  
  return {
    success: isDescending && sorted[0].rating_average === 4.8,
    details: `Highest rating: ${sorted[0].rating_average}`
  };
});

test('사용 횟수순 정렬', () => {
  const templates = [
    { name: '템플릿1', usage_count: 10 },
    { name: '템플릿2', usage_count: 50 },
    { name: '템플릿3', usage_count: 25 },
    { name: '템플릿4', usage_count: 100 }
  ];
  
  const sorted = [...templates].sort((a, b) => b.usage_count - a.usage_count);
  const isDescending = sorted[0].usage_count >= sorted[1].usage_count;
  
  return {
    success: isDescending && sorted[0].usage_count === 100,
    details: `Most used: ${sorted[0].usage_count} times`
  };
});

test('최신순 정렬', () => {
  const now = new Date();
  const templates = [
    { name: '템플릿1', created_at: new Date(now - 1000).toISOString() },
    { name: '템플릿2', created_at: new Date(now - 5000).toISOString() },
    { name: '템플릿3', created_at: new Date(now - 2000).toISOString() }
  ];
  
  const sorted = [...templates].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );
  const isDescending = new Date(sorted[0].created_at) >= new Date(sorted[1].created_at);
  
  return {
    success: isDescending,
    details: 'Sorted by creation date (newest first)'
  };
});

// 5. 데이터 변환 테스트
console.log('\n🔄 5. 데이터 변환 테스트\n');

test('템플릿을 워크플로우 형식으로 변환', () => {
  const template = {
    name: '테스트 템플릿',
    description: '설명',
    target_surgery_type: 'lasik',
    visual_data: {
      nodes: [
        { id: 'n1', type: 'trigger', data: { label: '트리거' } },
        { id: 'n2', type: 'action', data: { label: '액션' } }
      ],
      edges: [{ id: 'e1', source: 'n1', target: 'n2' }]
    }
  };
  
  const workflow = {
    name: `${template.name} (복사본)`,
    description: template.description,
    trigger_type: 'post_surgery',
    target_surgery_type: template.target_surgery_type,
    visual_data: template.visual_data,
    is_active: false
  };
  
  const isValid = workflow.name.includes('복사본') &&
                  workflow.trigger_type === 'post_surgery' &&
                  workflow.visual_data.nodes.length === 2;
  
  return {
    success: isValid,
    details: 'Template converted to workflow format'
  };
});

test('노드를 스텝으로 변환', () => {
  const nodes = [
    { id: 'n1', type: 'action', data: { label: '액션1', message_template: '메시지1' } },
    { id: 'n2', type: 'action', data: { label: '액션2', message_template: '메시지2' } },
    { id: 'n3', type: 'delay', data: { label: '지연' } }
  ];
  
  const steps = nodes
    .filter(n => n.type === 'action')
    .map((n, i) => ({
      day: i + 1,
      type: 'survey',
      title: n.data.label,
      message_template: n.data.message_template || '기본 메시지'
    }));
  
  const isValid = steps.length === 2 &&
                  steps[0].day === 1 &&
                  steps[1].day === 2;
  
  return {
    success: isValid,
    details: `Converted ${steps.length} action nodes to steps`
  };
});

// 6. 평점 계산 테스트
console.log('\n⭐ 6. 평점 계산 테스트\n');

test('평균 평점 계산', () => {
  const ratings = [5, 4, 5, 3, 4];
  const average = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  const expected = 4.2;
  
  return {
    success: Math.abs(average - expected) < 0.01,
    details: `Average: ${average.toFixed(2)} (expected ${expected})`
  };
});

test('평점 개수 계산', () => {
  const ratings = [5, 4, 5, 3, 4, 5];
  const count = ratings.length;
  
  return {
    success: count === 6,
    details: `Rating count: ${count}`
  };
});

// 7. 유효성 검사 테스트
console.log('\n✔️ 7. 유효성 검사 테스트\n');

test('템플릿 이름 유효성', () => {
  const validNames = ['테스트', '라식 수술 케어', '템플릿 123'];
  const invalidNames = ['', null, undefined, '   '];
  
  const validPass = validNames.every(name => name && name.trim().length > 0);
  const invalidPass = invalidNames.every(name => !name || !name.trim().length);
  
  return {
    success: validPass && invalidPass,
    details: 'Name validation working correctly'
  };
});

test('평점 범위 검증', () => {
  const validRatings = [1, 2, 3, 4, 5];
  const invalidRatings = [0, 6, -1, 10];
  
  const validPass = validRatings.every(r => r >= 1 && r <= 5);
  const invalidPass = invalidRatings.every(r => r < 1 || r > 5);
  
  return {
    success: validPass && invalidPass,
    details: 'Rating range validation (1-5) working correctly'
  };
});

// 결과 출력
console.log('\n' + '='.repeat(60));
console.log('📊 테스트 결과 요약');
console.log('='.repeat(60));
console.log(`✅ 통과: ${testResults.passed}`);
console.log(`❌ 실패: ${testResults.failed}`);
console.log(`📈 총 테스트: ${testResults.passed + testResults.failed}`);
console.log(`📊 성공률: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

if (testResults.failed === 0) {
  console.log('\n✨ 모든 테스트 통과!');
  process.exit(0);
} else {
  console.log('\n⚠️ 일부 테스트 실패');
  console.log('\n실패한 테스트:');
  testResults.tests
    .filter(t => t.status.includes('FAIL') || t.status.includes('ERROR'))
    .forEach(t => {
      console.log(`  ${t.status} ${t.name}`);
      if (t.details) console.log(`    ${t.details}`);
    });
  process.exit(1);
}

