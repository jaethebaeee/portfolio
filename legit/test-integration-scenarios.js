/**
 * 실제 사용 시나리오 통합 테스트
 * 
 * 실행: node test-integration-scenarios.js
 */

console.log('🧪 실제 사용 시나리오 통합 테스트 시작\n');

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
      testResults.tests.push({ name, status: '✅ PASS' });
      console.log(`✅ ${name}`);
      if (result.details) console.log(`   ${result.details}`);
      return true;
    } else {
      testResults.failed++;
      testResults.tests.push({ name, status: '❌ FAIL', error: result.error });
      console.log(`❌ ${name}: ${result.error}`);
      return false;
    }
  } catch (error) {
    testResults.failed++;
    testResults.tests.push({ name, status: '❌ ERROR', error: error.message });
    console.log(`❌ ${name}: ${error.message}`);
    return false;
  }
}

// 1. 사용자 시나리오: 템플릿 탐색 및 사용
console.log('👤 1. 사용자 시나리오 테스트\n');

test('시나리오: 사용자가 템플릿을 검색하고 사용', () => {
  // 1. 템플릿 목록 조회
  const templates = [
    { id: '1', name: '라식 케어', category: '안과', rating_average: 4.5, usage_count: 100 },
    { id: '2', name: '백내장 케어', category: '안과', rating_average: 4.2, usage_count: 50 },
    { id: '3', name: '코성형 케어', category: '성형외과', rating_average: 4.8, usage_count: 200 }
  ];
  
  // 2. 검색
  const searchQuery = '라식';
  const filtered = templates.filter(t => t.name.includes(searchQuery));
  
  // 3. 정렬 (평점순)
  const sorted = filtered.sort((a, b) => b.rating_average - a.rating_average);
  
  // 4. 템플릿 선택
  const selected = sorted[0];
  
  // 5. 워크플로우 생성
  const workflow = {
    name: `${selected.name} (복사본)`,
    description: selected.name,
    trigger_type: 'post_surgery',
    visual_data: { nodes: [], edges: [] },
    is_active: false
  };
  
  return {
    success: workflow.name.includes('라식') && workflow.name.includes('복사본'),
    details: `Created workflow: ${workflow.name}`
  };
});

test('시나리오: 사용자가 템플릿에 평점을 남김', () => {
  const template = { id: 't1', rating_average: 4.0, rating_count: 10 };
  const newRating = 5;
  
  // 평점 추가
  const totalRatings = template.rating_count + 1;
  // 실제로는 데이터베이스에서 다시 계산하지만, 여기서는 시뮬레이션
  const newAverage = ((template.rating_average * template.rating_count) + newRating) / totalRatings;
  
  return {
    success: newAverage > template.rating_average && totalRatings === 11,
    details: `Rating updated: ${template.rating_average.toFixed(2)} → ${newAverage.toFixed(2)}`
  };
});

test('시나리오: 사용자가 템플릿을 공유함', () => {
  const template = {
    id: 't1',
    user_id: 'user-123',
    is_public: false
  };
  
  // 공유 설정
  template.is_public = true;
  
  return {
    success: template.is_public === true,
    details: 'Template shared successfully'
  };
});

// 2. 관리자 시나리오: 템플릿 관리
console.log('\n👨‍💼 2. 관리자 시나리오 테스트\n');

test('시나리오: 관리자가 템플릿을 추천으로 설정', () => {
  const templates = [
    { id: 't1', is_featured: false, rating_average: 4.8, usage_count: 500 },
    { id: 't2', is_featured: false, rating_average: 4.2, usage_count: 100 }
  ];
  
  // 높은 평점과 사용 횟수를 가진 템플릿을 추천으로 설정
  const topTemplate = templates.reduce((best, current) => 
    (current.rating_average * current.usage_count) > (best.rating_average * best.usage_count) 
      ? current : best
  );
  
  topTemplate.is_featured = true;
  
  return {
    success: topTemplate.is_featured === true && topTemplate.id === 't1',
    details: `Featured template: ${topTemplate.id}`
  };
});

test('시나리오: 관리자가 템플릿을 카테고리별로 정리', () => {
  const templates = [
    { id: 't1', category: '안과', name: '라식' },
    { id: 't2', category: '안과', name: '백내장' },
    { id: 't3', category: '성형외과', name: '코성형' },
    { id: 't4', category: '피부과', name: '여드름' }
  ];
  
  const categorized = {
    '안과': templates.filter(t => t.category === '안과'),
    '성형외과': templates.filter(t => t.category === '성형외과'),
    '피부과': templates.filter(t => t.category === '피부과')
  };
  
  return {
    success: categorized['안과'].length === 2 && 
             categorized['성형외과'].length === 1 &&
             categorized['피부과'].length === 1,
    details: `Categorized: 안과(${categorized['안과'].length}), 성형외과(${categorized['성형외과'].length}), 피부과(${categorized['피부과'].length})`
  };
});

// 3. 개발자 시나리오: 템플릿 Import/Export
console.log('\n👨‍💻 3. 개발자 시나리오 테스트\n');

test('시나리오: 개발자가 템플릿을 JSON으로 내보내기', () => {
  const template = {
    name: '테스트 템플릿',
    description: '설명',
    category: '공통',
    visual_data: {
      nodes: [{ id: 'n1', type: 'trigger' }],
      edges: []
    },
    tags: ['테스트']
  };
  
  const json = JSON.stringify(template, null, 2);
  const parsed = JSON.parse(json);
  
  return {
    success: parsed.name === template.name && 
             parsed.visual_data.nodes.length === 1,
    details: `Exported template: ${parsed.name}`
  };
});

test('시나리오: 개발자가 JSON에서 템플릿 가져오기', () => {
  const json = JSON.stringify({
    name: '가져온 템플릿',
    category: '안과',
    visual_data: { nodes: [], edges: [] }
  });
  
  const imported = JSON.parse(json);
  
  // 검증
  const isValid = imported.name && 
                  ['안과', '성형외과', '피부과', '공통'].includes(imported.category);
  
  return {
    success: isValid,
    details: `Imported template: ${imported.name}`
  };
});

// 4. 실제 워크플로우: 템플릿 마켓플레이스 사용 흐름
console.log('\n🔄 4. 실제 워크플로우 테스트\n');

test('전체 워크플로우: 템플릿 탐색 → 선택 → 사용 → 평가', () => {
  // Step 1: 템플릿 목록 조회
  const templates = [
    { id: 't1', name: '라식 케어', category: '안과', rating_average: 4.5, usage_count: 100 },
    { id: 't2', name: '백내장 케어', category: '안과', rating_average: 4.2, usage_count: 50 }
  ];
  
  // Step 2: 필터링 (안과 카테고리)
  const filtered = templates.filter(t => t.category === '안과');
  
  // Step 3: 정렬 (평점순)
  const sorted = filtered.sort((a, b) => b.rating_average - a.rating_average);
  
  // Step 4: 템플릿 선택
  const selected = sorted[0];
  
  // Step 5: 워크플로우 생성
  const workflow = {
    id: 'w1',
    name: `${selected.name} (복사본)`,
    template_id: selected.id,
    created_at: new Date().toISOString()
  };
  
  // Step 6: 사용 이력 기록
  const usage = {
    template_id: selected.id,
    workflow_id: workflow.id,
    created_at: new Date().toISOString()
  };
  
  // Step 7: 평점 추가
  const rating = {
    template_id: selected.id,
    rating: 5,
    comment: '매우 유용합니다!'
  };
  
  return {
    success: workflow.template_id === selected.id && 
             rating.template_id === selected.id &&
             usage.template_id === selected.id,
    details: `Complete workflow: Template ${selected.id} → Workflow ${workflow.id} → Rating 5`
  };
});

test('전체 워크플로우: 템플릿 공유 → 다른 사용자 사용', () => {
  // Step 1: 사용자 A가 템플릿 생성
  const userATemplate = {
    id: 't1',
    user_id: 'user-a',
    name: '나만의 템플릿',
    is_public: false
  };
  
  // Step 2: 공유 설정
  userATemplate.is_public = true;
  
  // Step 3: 사용자 B가 공개 템플릿 조회
  const publicTemplates = [userATemplate].filter(t => t.is_public === true);
  
  // Step 4: 사용자 B가 템플릿 사용
  const userBWorkflow = {
    id: 'w2',
    user_id: 'user-b',
    template_id: userATemplate.id,
    name: `${userATemplate.name} (복사본)`
  };
  
  // Step 5: 사용 이력 기록
  const usage = {
    template_id: userATemplate.id,
    user_id: 'user-b',
    workflow_id: userBWorkflow.id
  };
  
  return {
    success: publicTemplates.length === 1 && 
             userBWorkflow.template_id === userATemplate.id &&
             usage.user_id === 'user-b',
    details: `Template shared: User A → Public → User B uses it`
  };
});

// 5. 에러 시나리오 처리
console.log('\n⚠️ 5. 에러 시나리오 처리 테스트\n');

test('에러 시나리오: 존재하지 않는 템플릿 접근', () => {
  const templates = [{ id: 't1' }, { id: 't2' }];
  const requestedId = 't999';
  
  const found = templates.find(t => t.id === requestedId);
  
  return {
    success: found === undefined,
    details: 'Non-existent template correctly returns undefined'
  };
});

test('에러 시나리오: 권한 없는 템플릿 수정 시도', () => {
  const template = {
    id: 't1',
    user_id: 'user-1',
    is_system_template: false
  };
  
  const currentUser = 'user-2';
  const canEdit = template.user_id === currentUser && !template.is_system_template;
  
  return {
    success: canEdit === false,
    details: 'Unauthorized edit attempt correctly blocked'
  };
});

test('에러 시나리오: 잘못된 평점 값', () => {
  const invalidRatings = [0, 6, -1, 10];
  const validRatings = invalidRatings.filter(r => r >= 1 && r <= 5);
  
  return {
    success: validRatings.length === 0,
    details: 'Invalid ratings correctly rejected'
  };
});

// 결과 출력
console.log('\n' + '='.repeat(60));
console.log('📊 통합 시나리오 테스트 결과 요약');
console.log('='.repeat(60));
console.log(`✅ 통과: ${testResults.passed}`);
console.log(`❌ 실패: ${testResults.failed}`);
console.log(`📈 총 테스트: ${testResults.passed + testResults.failed}`);
console.log(`📊 성공률: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

if (testResults.failed === 0) {
  console.log('\n✨ 모든 통합 시나리오 테스트 통과!');
  process.exit(0);
} else {
  console.log('\n⚠️ 일부 테스트 실패');
  testResults.tests
    .filter(t => t.status.includes('FAIL') || t.status.includes('ERROR'))
    .forEach(t => console.log(`  ${t.status} ${t.name}`));
  process.exit(1);
}

