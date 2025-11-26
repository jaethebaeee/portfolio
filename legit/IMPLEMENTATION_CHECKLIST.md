# 워크플로우 템플릿 라이브러리 구현 체크리스트

## ✅ 완료된 작업

### 1. 데이터베이스 스키마
- [x] `workflow_templates` 테이블 생성
- [x] `workflow_template_ratings` 테이블 생성
- [x] `workflow_template_usage` 테이블 생성
- [x] RLS 정책 설정
- [x] 트리거 함수 (평점 평균 자동 업데이트, 사용 횟수 자동 업데이트)
- [x] 인덱스 생성

### 2. 전문과목별 템플릿
- [x] 안과: 라식/라섹, 백내장, **녹내장** (신규)
- [x] 성형외과: 코성형, 눈성형, **리프팅** (신규)
- [x] 피부과: **여드름 치료**, **레이저 치료** (신규)
- [x] 공통: 예약 리마인더, 생일 쿠폰, 후기 요청 등

### 3. 라이브러리 함수
- [x] `getPublicTemplates()` - 공개 템플릿 조회 (필터링, 정렬)
- [x] `getUserTemplates()` - 사용자 템플릿 조회
- [x] `getTemplate()` - 템플릿 상세 조회
- [x] `createTemplate()` - 템플릿 생성
- [x] `updateTemplate()` - 템플릿 업데이트
- [x] `deleteTemplate()` - 템플릿 삭제
- [x] `shareTemplate()` - 템플릿 공유 설정
- [x] `rateTemplate()` - 템플릿 평점 추가/수정
- [x] `getTemplateRatings()` - 템플릿 평점 조회
- [x] `getUserRating()` - 사용자 평점 조회
- [x] `recordTemplateUsage()` - 사용 이력 기록
- [x] `createWorkflowFromTemplate()` - 템플릿에서 워크플로우 생성
- [x] `exportWorkflowAsTemplate()` - 워크플로우를 템플릿으로 내보내기
- [x] `exportTemplateAsJSON()` - 템플릿 JSON 내보내기
- [x] `importTemplateFromJSON()` - JSON에서 템플릿 가져오기

### 4. API 라우트
- [x] `GET /api/workflow-templates` - 템플릿 목록 조회
- [x] `POST /api/workflow-templates` - 템플릿 생성
- [x] `GET /api/workflow-templates/[id]` - 템플릿 상세 조회
- [x] `PATCH /api/workflow-templates/[id]` - 템플릿 업데이트
- [x] `DELETE /api/workflow-templates/[id]` - 템플릿 삭제
- [x] `POST /api/workflow-templates/[id]/share` - 템플릿 공유 설정
- [x] `POST /api/workflow-templates/[id]/rate` - 템플릿 평점 추가/수정
- [x] `POST /api/workflow-templates/[id]/use` - 템플릿 사용 (워크플로우 생성)
- [x] `POST /api/workflow-templates/import` - JSON에서 템플릿 가져오기

### 5. UI 컴포넌트
- [x] `WorkflowTemplateMarketplace` 컴포넌트 생성
  - [x] 템플릿 검색 기능
  - [x] 카테고리 필터 (안과, 성형외과, 피부과, 공통)
  - [x] 전문과목 필터
  - [x] 정렬 옵션 (최신순, 평점순, 사용순)
  - [x] 추천 템플릿 필터
  - [x] 템플릿 미리보기 다이얼로그
  - [x] 템플릿 사용 기능 (워크플로우 생성)
  - [x] 템플릿 평점 및 코멘트
  - [x] 템플릿 공유 설정
  - [x] 템플릿 JSON 내보내기/가져오기

### 6. 페이지 통합
- [x] `/dashboard/workflows/templates` 페이지 생성
- [x] 워크플로우 페이지에 마켓플레이스 링크 추가

### 7. 타입 정의
- [x] `WorkflowTemplate` 인터페이스 업데이트 (피부과 추가)
- [x] `WorkflowTemplateRecord` 인터페이스 생성
- [x] `TemplateRating` 인터페이스 생성
- [x] `TemplateUsage` 인터페이스 생성
- [x] `database.types.ts`에 새 테이블 타입 추가

### 8. 시드 스크립트
- [x] `scripts/seed-workflow-templates.ts` 생성
- [x] 기본 템플릿을 데이터베이스에 자동 추가

### 9. 문서화
- [x] `WORKFLOW_TEMPLATES_LIBRARY.md` 생성
- [x] 구현 가이드 및 사용 방법 문서화

## 🔍 검증 완료

- [x] 린트 오류 없음
- [x] 타입 오류 없음
- [x] 모든 import 경로 정확
- [x] API 라우트 구조 정확
- [x] 컴포넌트 props 타입 정확

## 📋 배포 전 체크리스트

### 데이터베이스
1. [ ] Supabase 마이그레이션 실행
   ```bash
   supabase migration up
   ```
   또는 Supabase Dashboard에서 `013_workflow_templates_library.sql` 실행

2. [ ] 기본 템플릿 시드 실행
   ```bash
   npx tsx scripts/seed-workflow-templates.ts
   ```

### 테스트
1. [ ] 템플릿 목록 조회 테스트
2. [ ] 템플릿 검색 및 필터링 테스트
3. [ ] 템플릿 사용 (워크플로우 생성) 테스트
4. [ ] 템플릿 평점 추가 테스트
5. [ ] 템플릿 공유 설정 테스트
6. [ ] 템플릿 JSON 내보내기/가져오기 테스트
7. [ ] RLS 정책 테스트 (권한 확인)

### UI 테스트
1. [ ] 마켓플레이스 페이지 접근 테스트
2. [ ] 템플릿 카드 표시 확인
3. [ ] 필터 및 검색 기능 확인
4. [ ] 템플릿 미리보기 다이얼로그 확인
5. [ ] 평점 다이얼로그 확인
6. [ ] Import/Export 기능 확인

## 🚀 사용 방법

### 1. 마이그레이션 실행
```bash
# Supabase CLI 사용
supabase migration up

# 또는 Supabase Dashboard에서 직접 실행
```

### 2. 기본 템플릿 시드
```bash
npx tsx scripts/seed-workflow-templates.ts
```

### 3. 마켓플레이스 접근
- 워크플로우 페이지에서 "템플릿 마켓플레이스" 버튼 클릭
- 또는 직접 `/dashboard/workflows/templates` 접근

### 4. 템플릿 사용
1. 마켓플레이스에서 원하는 템플릿 선택
2. "사용하기" 버튼 클릭
3. 워크플로우가 생성되고 편집 페이지로 이동

### 5. 템플릿 공유
1. 워크플로우를 템플릿으로 내보내기
2. 템플릿 이름과 설명 입력
3. 공개 설정 선택
4. 템플릿 생성

## 📝 참고 사항

- 시스템 템플릿은 수정/삭제 불가
- 공개 템플릿은 모든 사용자가 조회 가능
- 사용자는 자신의 템플릿만 수정/삭제 가능
- 평점은 1-5점 범위
- 한 사용자는 한 템플릿에 대해 한 번만 평점 가능 (수정 가능)

## 🔧 문제 해결

### 템플릿이 표시되지 않는 경우
1. 마이그레이션이 실행되었는지 확인
2. 시드 스크립트가 실행되었는지 확인
3. RLS 정책이 올바르게 설정되었는지 확인

### 평점이 업데이트되지 않는 경우
1. 트리거 함수가 생성되었는지 확인
2. 데이터베이스 로그 확인

### Import/Export 오류
1. JSON 형식이 올바른지 확인
2. 필수 필드가 포함되어 있는지 확인

