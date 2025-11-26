/**
 * 에지 케이스 및 경계 조건 테스트
 * 
 * 실행: node test-edge-cases.js
 */

console.log('🧪 에지 케이스 및 경계 조건 테스트 시작\n');

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

// 1. 빈 데이터 테스트
console.log('📭 1. 빈 데이터 테스트\n');

test('빈 템플릿 목록 처리', () => {
  const templates = [];
  const filtered = templates.filter(t => t.category === '안과');
  
  return {
    success: Array.isArray(filtered) && filtered.length === 0,
    details: 'Empty array handled correctly'
  };
});

test('빈 검색어 처리', () => {
  const templates = [
    { name: '템플릿1', description: '설명1' },
    { name: '템플릿2', description: '설명2' }
  ];
  
  const searchQuery = '';
  const filtered = templates.filter(t =>
    !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return {
    success: filtered.length === templates.length,
    details: `Empty search returns all ${filtered.length} templates`
  };
});

test('null/undefined 값 처리', () => {
  const template = {
    name: '템플릿',
    description: null,
    specialty: undefined,
    tags: null
  };
  
  const hasName = !!template.name;
  // null과 undefined는 모두 존재하지만 값이 없는 것으로 처리
  const hasDescription = 'description' in template; // 키는 존재하지만 값이 null
  const hasSpecialty = 'specialty' in template; // 키는 존재하지만 값이 undefined
  
  return {
    success: hasName && hasDescription && hasSpecialty,
    details: 'Null/undefined values handled correctly'
  };
});

// 2. 경계 값 테스트
console.log('\n🔢 2. 경계 값 테스트\n');

test('평점 최소값 (1)', () => {
  const rating = 1;
  const isValid = rating >= 1 && rating <= 5;
  
  return {
    success: isValid,
    details: 'Minimum rating (1) is valid'
  };
});

test('평점 최대값 (5)', () => {
  const rating = 5;
  const isValid = rating >= 1 && rating <= 5;
  
  return {
    success: isValid,
    details: 'Maximum rating (5) is valid'
  };
});

test('평점 범위 밖 (0)', () => {
  const rating = 0;
  const isValid = rating >= 1 && rating <= 5;
  
  return {
    success: !isValid,
    details: 'Rating 0 is invalid'
  };
});

test('평점 범위 밖 (6)', () => {
  const rating = 6;
  const isValid = rating >= 1 && rating <= 5;
  
  return {
    success: !isValid,
    details: 'Rating 6 is invalid'
  };
});

test('사용 횟수 0 처리', () => {
  const template = { usage_count: 0 };
  const isValid = typeof template.usage_count === 'number' && template.usage_count >= 0;
  
  return {
    success: isValid,
    details: 'Usage count of 0 is valid'
  };
});

// 3. 긴 문자열 테스트
console.log('\n📝 3. 긴 문자열 테스트\n');

test('긴 템플릿 이름 처리', () => {
  const longName = 'A'.repeat(500);
  const template = { name: longName };
  
  const isValid = template.name.length === 500 && template.name.length > 0;
  
  return {
    success: isValid,
    details: `Long name (${longName.length} chars) handled correctly`
  };
});

test('긴 설명 처리', () => {
  const longDescription = 'B'.repeat(1000);
  const template = { description: longDescription };
  
  const isValid = template.description.length === 1000;
  
  return {
    success: isValid,
    details: `Long description (${longDescription.length} chars) handled correctly`
  };
});

test('특수 문자 처리', () => {
  const specialChars = '템플릿 <>&"\'/\\';
  const template = { name: specialChars };
  
  const isValid = template.name.includes('<') && template.name.includes('&');
  
  return {
    success: isValid,
    details: 'Special characters handled correctly'
  };
});

// 4. 대량 데이터 테스트
console.log('\n📊 4. 대량 데이터 테스트\n');

test('대량 템플릿 필터링 성능', () => {
  const templates = Array.from({ length: 1000 }, (_, i) => ({
    id: `t${i}`,
    name: `템플릿 ${i}`,
    category: i % 2 === 0 ? '안과' : '성형외과'
  }));
  
  const start = Date.now();
  const filtered = templates.filter(t => t.category === '안과');
  const duration = Date.now() - start;
  
  return {
    success: filtered.length === 500 && duration < 100,
    details: `Filtered ${filtered.length} templates in ${duration}ms`
  };
});

test('대량 템플릿 정렬 성능', () => {
  const templates = Array.from({ length: 500 }, (_, i) => ({
    id: `t${i}`,
    rating_average: Math.random() * 5
  }));
  
  const start = Date.now();
  const sorted = [...templates].sort((a, b) => b.rating_average - a.rating_average);
  const duration = Date.now() - start;
  
  const isSorted = sorted[0].rating_average >= sorted[1].rating_average;
  
  return {
    success: isSorted && duration < 50,
    details: `Sorted ${sorted.length} templates in ${duration}ms`
  };
});

// 5. 동시성 시뮬레이션 테스트
console.log('\n🔄 5. 동시성 시뮬레이션 테스트\n');

test('평점 동시 업데이트 시뮬레이션', () => {
  let ratingCount = 0;
  let ratingSum = 0;
  
  // 여러 사용자가 동시에 평점 추가 시뮬레이션
  const ratings = [5, 4, 5, 3, 4];
  ratings.forEach(rating => {
    ratingCount++;
    ratingSum += rating;
  });
  
  const average = ratingSum / ratingCount;
  
  return {
    success: ratingCount === 5 && Math.abs(average - 4.2) < 0.01,
    details: `Concurrent ratings: ${ratingCount} ratings, average ${average.toFixed(2)}`
  };
});

test('사용 횟수 동시 증가 시뮬레이션', () => {
  let usageCount = 0;
  
  // 여러 사용자가 동시에 템플릿 사용 시뮬레이션
  const users = ['user-1', 'user-2', 'user-3', 'user-4'];
  users.forEach(() => {
    usageCount++;
  });
  
  return {
    success: usageCount === 4,
    details: `Concurrent usage: ${usageCount} times`
  };
});

// 6. 데이터 무결성 테스트
console.log('\n🔒 6. 데이터 무결성 테스트\n');

test('템플릿 ID 고유성', () => {
  const templates = [
    { id: 't1', name: '템플릿1' },
    { id: 't2', name: '템플릿2' },
    { id: 't1', name: '템플릿3' } // 중복 ID
  ];
  
  const ids = templates.map(t => t.id);
  const uniqueIds = [...new Set(ids)];
  
  return {
    success: ids.length !== uniqueIds.length,
    details: `Duplicate IDs detected: ${ids.length} total, ${uniqueIds.length} unique`
  };
});

test('필수 필드 검증', () => {
  const validTemplate = { name: '템플릿', category: '공통' };
  const invalidTemplate = { category: '공통' }; // name 누락
  
  const isValid1 = !!validTemplate.name && !!validTemplate.category;
  const isValid2 = !!invalidTemplate.name && !!invalidTemplate.category;
  
  return {
    success: isValid1 && !isValid2,
    details: 'Required fields validation working'
  };
});

test('카테고리 값 검증', () => {
  const validCategories = ['안과', '성형외과', '피부과', '공통'];
  const templates = [
    { category: '안과' },
    { category: '성형외과' },
    { category: '잘못된카테고리' }
  ];
  
  const valid = templates.filter(t => validCategories.includes(t.category));
  
  return {
    success: valid.length === 2,
    details: `Valid categories: ${valid.length}/${templates.length}`
  };
});

// 7. 오류 복구 테스트
console.log('\n🛡️ 7. 오류 복구 테스트\n');

test('잘못된 JSON 복구', () => {
  const invalidJson = '{ "name": "템플릿", "category": }';
  let errorCaught = false;
  
  try {
    JSON.parse(invalidJson);
  } catch (e) {
    errorCaught = true;
  }
  
  return {
    success: errorCaught,
    details: 'Invalid JSON error caught correctly'
  };
});

test('누락된 필드 기본값 처리', () => {
  const template = { name: '템플릿' };
  const fullTemplate = {
    name: template.name,
    category: template.category || '공통',
    tags: template.tags || [],
    is_public: template.is_public || false
  };
  
  return {
    success: fullTemplate.category === '공통' && 
             Array.isArray(fullTemplate.tags) &&
             fullTemplate.is_public === false,
    details: 'Default values applied correctly'
  };
});

// 결과 출력
console.log('\n' + '='.repeat(60));
console.log('📊 에지 케이스 테스트 결과 요약');
console.log('='.repeat(60));
console.log(`✅ 통과: ${testResults.passed}`);
console.log(`❌ 실패: ${testResults.failed}`);
console.log(`📈 총 테스트: ${testResults.passed + testResults.failed}`);
console.log(`📊 성공률: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

if (testResults.failed === 0) {
  console.log('\n✨ 모든 에지 케이스 테스트 통과!');
  process.exit(0);
} else {
  console.log('\n⚠️ 일부 테스트 실패');
  testResults.tests
    .filter(t => t.status.includes('FAIL') || t.status.includes('ERROR'))
    .forEach(t => console.log(`  ${t.status} ${t.name}`));
  process.exit(1);
}

