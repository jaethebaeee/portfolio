#!/bin/bash

# 모든 테스트 실행 스크립트
# 실행: bash run-all-tests.sh

echo "🚀 워크플로우 템플릿 라이브러리 전체 테스트 시작"
echo "=================================================="
echo ""

total_passed=0
total_failed=0
total_tests=0

# 테스트 파일 목록
tests=(
  "test-template-import-export.js"
  "test-workflow-templates-comprehensive.js"
  "test-api-routes-structure.js"
  "test-component-props.js"
  "test-database-queries.js"
  "test-edge-cases.js"
  "test-conditional-nodes.js"
)

# 각 테스트 실행
for test_file in "${tests[@]}"; do
  if [ -f "$test_file" ]; then
    echo "📋 실행 중: $test_file"
    echo "----------------------------------------"
    node "$test_file"
    exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
      echo "✅ $test_file: 통과"
      ((total_passed++))
    else
      echo "❌ $test_file: 실패"
      ((total_failed++))
    fi
    echo ""
    ((total_tests++))
  else
    echo "⚠️  파일 없음: $test_file"
    ((total_failed++))
    ((total_tests++))
  fi
done

# 최종 결과
echo "=================================================="
echo "📊 전체 테스트 결과"
echo "=================================================="
echo "✅ 통과: $total_passed"
echo "❌ 실패: $total_failed"
echo "📈 총 테스트 스위트: $total_tests"

if [ $total_failed -eq 0 ]; then
  echo ""
  echo "✨ 모든 테스트 통과!"
  exit 0
else
  echo ""
  echo "⚠️  일부 테스트 실패"
  exit 1
fi

