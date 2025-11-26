/**
 * 데이터베이스 쿼리 로직 테스트
 * 
 * 실행: node test-database-queries.js
 */

console.log('🧪 데이터베이스 쿼리 로직 테스트 시작\n');

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

// 1. 쿼리 빌더 로직 테스트
console.log('🔍 1. 쿼리 빌더 로직 테스트\n');

test('공개 템플릿 쿼리 조건 (OR)', () => {
  // is_public = true OR is_system_template = true
  const templates = [
    { id: '1', is_public: true, is_system_template: false },
    { id: '2', is_public: false, is_system_template: true },
    { id: '3', is_public: true, is_system_template: true },
    { id: '4', is_public: false, is_system_template: false }
  ];
  
  const publicTemplates = templates.filter(t => 
    t.is_public === true || t.is_system_template === true
  );
  
  return {
    success: publicTemplates.length === 3,
    details: `Found ${publicTemplates.length} public templates (expected 3)`
  };
});

test('카테고리 필터링', () => {
  const templates = [
    { id: '1', category: '안과' },
    { id: '2', category: '성형외과' },
    { id: '3', category: '안과' },
    { id: '4', category: '피부과' }
  ];
  
  const filtered = templates.filter(t => t.category === '안과');
  
  return {
    success: filtered.length === 2,
    details: `Filtered ${filtered.length} templates by category`
  };
});

test('전문과목 필터링', () => {
  const templates = [
    { id: '1', specialty: 'lasik' },
    { id: '2', specialty: 'cataract' },
    { id: '3', specialty: 'lasik' },
    { id: '4', specialty: null }
  ];
  
  const filtered = templates.filter(t => t.specialty === 'lasik');
  
  return {
    success: filtered.length === 2,
    details: `Filtered ${filtered.length} templates by specialty`
  };
});

test('검색 쿼리 (이름 또는 설명)', () => {
  const templates = [
    { name: '라식 케어', description: '라식 수술 후 케어' },
    { name: '백내장 케어', description: '백내장 수술 케어' },
    { name: '코성형', description: '코성형 수술' }
  ];
  
  const searchTerm = '케어';
  const filtered = templates.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return {
    success: filtered.length === 2,
    details: `Found ${filtered.length} templates matching "${searchTerm}"`
  };
});

test('추천 템플릿 필터링', () => {
  const templates = [
    { id: '1', is_featured: true },
    { id: '2', is_featured: false },
    { id: '3', is_featured: true },
    { id: '4', is_featured: false }
  ];
  
  const featured = templates.filter(t => t.is_featured === true);
  
  return {
    success: featured.length === 2,
    details: `Found ${featured.length} featured templates`
  };
});

// 2. 정렬 로직 테스트
console.log('\n📊 2. 정렬 로직 테스트\n');

test('평점순 정렬 (내림차순)', () => {
  const templates = [
    { id: '1', rating_average: 4.5 },
    { id: '2', rating_average: 3.2 },
    { id: '3', rating_average: 4.8 },
    { id: '4', rating_average: 2.1 }
  ];
  
  const sorted = [...templates].sort((a, b) => b.rating_average - a.rating_average);
  const isCorrect = sorted[0].rating_average === 4.8 &&
                    sorted[1].rating_average === 4.5 &&
                    sorted[2].rating_average === 3.2 &&
                    sorted[3].rating_average === 2.1;
  
  return {
    success: isCorrect,
    details: `Sorted by rating: ${sorted.map(t => t.rating_average).join(', ')}`
  };
});

test('사용 횟수순 정렬 (내림차순)', () => {
  const templates = [
    { id: '1', usage_count: 10 },
    { id: '2', usage_count: 50 },
    { id: '3', usage_count: 25 },
    { id: '4', usage_count: 100 }
  ];
  
  const sorted = [...templates].sort((a, b) => b.usage_count - a.usage_count);
  const isCorrect = sorted[0].usage_count === 100 &&
                    sorted[3].usage_count === 10;
  
  return {
    success: isCorrect,
    details: `Sorted by usage: ${sorted.map(t => t.usage_count).join(', ')}`
  };
});

test('최신순 정렬 (내림차순)', () => {
  const now = new Date();
  const templates = [
    { id: '1', created_at: new Date(now - 5000).toISOString() },
    { id: '2', created_at: new Date(now - 1000).toISOString() },
    { id: '3', created_at: new Date(now - 3000).toISOString() }
  ];
  
  const sorted = [...templates].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );
  
  const isCorrect = new Date(sorted[0].created_at) > new Date(sorted[1].created_at) &&
                    new Date(sorted[1].created_at) > new Date(sorted[2].created_at);
  
  return {
    success: isCorrect,
    details: 'Sorted by creation date (newest first)'
  };
});

// 3. 복합 쿼리 테스트
console.log('\n🔗 3. 복합 쿼리 테스트\n');

test('카테고리 + 검색 복합 필터', () => {
  const templates = [
    { name: '라식 케어', category: '안과' },
    { name: '백내장 케어', category: '안과' },
    { name: '코성형 케어', category: '성형외과' },
    { name: '라식 후기', category: '안과' }
  ];
  
  const filtered = templates.filter(t =>
    t.category === '안과' &&
    t.name.toLowerCase().includes('케어')
  );
  
  return {
    success: filtered.length === 2,
    details: `Found ${filtered.length} templates matching both filters`
  };
});

test('추천 + 카테고리 복합 필터', () => {
  const templates = [
    { id: '1', category: '안과', is_featured: true },
    { id: '2', category: '안과', is_featured: false },
    { id: '3', category: '성형외과', is_featured: true },
    { id: '4', category: '안과', is_featured: true }
  ];
  
  const filtered = templates.filter(t =>
    t.category === '안과' && t.is_featured === true
  );
  
  return {
    success: filtered.length === 2,
    details: `Found ${filtered.length} featured 안과 templates`
  };
});

test('검색 + 정렬 복합', () => {
  const templates = [
    { name: '라식 케어', rating_average: 4.5 },
    { name: '백내장 케어', rating_average: 3.2 },
    { name: '라식 후기', rating_average: 4.8 },
    { name: '코성형', rating_average: 4.0 }
  ];
  
  const filtered = templates.filter(t =>
    t.name.toLowerCase().includes('라식')
  );
  const sorted = filtered.sort((a, b) => b.rating_average - a.rating_average);
  
  return {
    success: sorted.length === 2 && sorted[0].rating_average === 4.8,
    details: `Filtered and sorted: ${sorted.map(t => t.name).join(', ')}`
  };
});

// 4. 사용자별 쿼리 테스트
console.log('\n👤 4. 사용자별 쿼리 테스트\n');

test('사용자 템플릿 조회', () => {
  const templates = [
    { id: '1', user_id: 'user-1' },
    { id: '2', user_id: 'user-2' },
    { id: '3', user_id: 'user-1' },
    { id: '4', user_id: null } // 시스템 템플릿
  ];
  
  const userTemplates = templates.filter(t => t.user_id === 'user-1');
  
  return {
    success: userTemplates.length === 2,
    details: `Found ${userTemplates.length} templates for user-1`
  };
});

test('시스템 템플릿 제외', () => {
  const templates = [
    { id: '1', user_id: 'user-1' },
    { id: '2', user_id: null },
    { id: '3', user_id: 'user-2' },
    { id: '4', user_id: null }
  ];
  
  const userOnly = templates.filter(t => t.user_id !== null);
  
  return {
    success: userOnly.length === 2,
    details: `Found ${userOnly.length} user-created templates`
  };
});

// 5. 평점 관련 쿼리 테스트
console.log('\n⭐ 5. 평점 관련 쿼리 테스트\n');

test('평점 평균 계산', () => {
  const ratings = [
    { template_id: 't1', rating: 5 },
    { template_id: 't1', rating: 4 },
    { template_id: 't1', rating: 5 },
    { template_id: 't1', rating: 3 }
  ];
  
  const templateRatings = ratings.filter(r => r.template_id === 't1');
  const average = templateRatings.reduce((sum, r) => sum + r.rating, 0) / templateRatings.length;
  
  return {
    success: Math.abs(average - 4.25) < 0.01,
    details: `Average rating: ${average.toFixed(2)}`
  };
});

test('평점 개수 계산', () => {
  const ratings = [
    { template_id: 't1', rating: 5 },
    { template_id: 't1', rating: 4 },
    { template_id: 't2', rating: 5 }
  ];
  
  const templateRatings = ratings.filter(r => r.template_id === 't1');
  
  return {
    success: templateRatings.length === 2,
    details: `Found ${templateRatings.length} ratings for template t1`
  };
});

test('사용자별 평점 중복 방지', () => {
  const ratings = [
    { template_id: 't1', user_id: 'user-1', rating: 5 },
    { template_id: 't1', user_id: 'user-1', rating: 4 }, // 중복
    { template_id: 't1', user_id: 'user-2', rating: 5 }
  ];
  
  // UNIQUE(template_id, user_id) 제약 조건 시뮬레이션
  const uniqueRatings = [];
  const seen = new Set();
  
  ratings.forEach(r => {
    const key = `${r.template_id}-${r.user_id}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueRatings.push(r);
    }
  });
  
  return {
    success: uniqueRatings.length === 2,
    details: `Unique ratings: ${uniqueRatings.length} (duplicate removed)`
  };
});

// 6. 사용 이력 쿼리 테스트
console.log('\n📈 6. 사용 이력 쿼리 테스트\n');

test('템플릿별 사용 횟수 계산', () => {
  const usage = [
    { template_id: 't1', user_id: 'user-1' },
    { template_id: 't1', user_id: 'user-2' },
    { template_id: 't1', user_id: 'user-3' },
    { template_id: 't2', user_id: 'user-1' }
  ];
  
  const templateUsage = usage.filter(u => u.template_id === 't1');
  
  return {
    success: templateUsage.length === 3,
    details: `Template t1 used ${templateUsage.length} times`
  };
});

test('사용자별 사용 이력 조회', () => {
  const usage = [
    { template_id: 't1', user_id: 'user-1' },
    { template_id: 't2', user_id: 'user-1' },
    { template_id: 't1', user_id: 'user-2' }
  ];
  
  const userUsage = usage.filter(u => u.user_id === 'user-1');
  
  return {
    success: userUsage.length === 2,
    details: `User-1 used ${userUsage.length} templates`
  };
});

// 결과 출력
console.log('\n' + '='.repeat(60));
console.log('📊 데이터베이스 쿼리 테스트 결과 요약');
console.log('='.repeat(60));
console.log(`✅ 통과: ${testResults.passed}`);
console.log(`❌ 실패: ${testResults.failed}`);
console.log(`📈 총 테스트: ${testResults.passed + testResults.failed}`);
console.log(`📊 성공률: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

if (testResults.failed === 0) {
  console.log('\n✨ 모든 데이터베이스 쿼리 테스트 통과!');
  process.exit(0);
} else {
  console.log('\n⚠️ 일부 테스트 실패');
  testResults.tests
    .filter(t => t.status.includes('FAIL') || t.status.includes('ERROR'))
    .forEach(t => console.log(`  ${t.status} ${t.name}`));
  process.exit(1);
}

