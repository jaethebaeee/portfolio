# 워크플로우 템플릿 라이브러리 구현

## 개요

워크플로우 템플릿 마켓플레이스 기능을 구현했습니다. 클리닉들이 워크플로우 템플릿을 공유하고, 평가하며, 가져오고 내보낼 수 있는 종합적인 시스템입니다.

## 구현된 기능

### 1. 데이터베이스 스키마

**파일**: `supabase/migrations/013_workflow_templates_library.sql`

- `workflow_templates`: 템플릿 메인 테이블
  - 공개/비공개 설정
  - 추천 템플릿 표시
  - 시스템 기본 템플릿 지원
  - 사용 횟수, 평점 통계

- `workflow_template_ratings`: 템플릿 평점 테이블
  - 1-5점 평점 시스템
  - 코멘트 기능

- `workflow_template_usage`: 템플릿 사용 이력
  - 어떤 클리닉이 어떤 템플릿을 사용했는지 추적

### 2. 전문과목별 템플릿

**파일**: `lib/workflow-templates.ts`

#### 안과 (Ophthalmology)
- ✅ 라식/라섹 종합 케어 (30일)
- ✅ 백내장 수술 종합 케어 (30일)
- ✅ **녹내장 수술 종합 케어 (90일)** - 신규 추가

#### 성형외과 (Plastic Surgery)
- ✅ 코성형 종합 회복 케어 (60일)
- ✅ 눈성형(쌍꺼풀) 관리
- ✅ **리프팅 수술 종합 케어 (90일)** - 신규 추가

#### 피부과 (Dermatology) - 신규 추가
- ✅ **여드름 치료 케어 (30일)**
- ✅ **레이저 치료 케어 (14일)**

#### 공통
- ✅ 고령 환자 예약 사전 리마인더
- ✅ 일반 예약 완료 리마인더
- ✅ 생일 할인 쿠폰 발송
- ✅ 후기 요청 워크플로우
- ✅ 노쇼(No-Show) 회복
- ✅ 상담 후 미예약 고객 케어

### 3. 템플릿 라이브러리 함수

**파일**: `lib/workflow-template-library.ts`

주요 함수:
- `getPublicTemplates()`: 공개 템플릿 조회 (필터링, 정렬 지원)
- `getUserTemplates()`: 사용자 템플릿 조회
- `createTemplate()`: 템플릿 생성
- `shareTemplate()`: 템플릿 공유 설정
- `rateTemplate()`: 템플릿 평점 추가/수정
- `createWorkflowFromTemplate()`: 템플릿에서 워크플로우 생성
- `exportTemplateAsJSON()`: 템플릿 JSON 내보내기
- `importTemplateFromJSON()`: JSON에서 템플릿 가져오기

### 4. API 라우트

#### GET `/api/workflow-templates`
- 공개 템플릿 목록 조회
- 쿼리 파라미터:
  - `type`: `public` (기본) 또는 `my`
  - `category`: 카테고리 필터
  - `specialty`: 전문과목 필터
  - `search`: 검색어
  - `featured`: 추천만 보기 (`true`)
  - `sortBy`: 정렬 (`rating`, `usage`, `recent`)

#### POST `/api/workflow-templates`
- 새 템플릿 생성

#### GET `/api/workflow-templates/[id]`
- 템플릿 상세 조회

#### PATCH `/api/workflow-templates/[id]`
- 템플릿 업데이트

#### DELETE `/api/workflow-templates/[id]`
- 템플릿 삭제

#### POST `/api/workflow-templates/[id]/share`
- 템플릿 공유 설정

#### POST `/api/workflow-templates/[id]/rate`
- 템플릿 평점 추가/수정

#### POST `/api/workflow-templates/[id]/use`
- 템플릿을 사용하여 워크플로우 생성

#### POST `/api/workflow-templates/import`
- JSON에서 템플릿 가져오기

### 5. 템플릿 마켓플레이스 컴포넌트

**파일**: `components/workflow-template-marketplace.tsx`

주요 기능:
- ✅ 템플릿 검색 및 필터링
- ✅ 카테고리별 필터 (안과, 성형외과, 피부과, 공통)
- ✅ 정렬 옵션 (최신순, 평점순, 사용순)
- ✅ 추천 템플릿 필터
- ✅ 템플릿 미리보기
- ✅ 템플릿 사용 (워크플로우 생성)
- ✅ 템플릿 평점 및 코멘트
- ✅ 템플릿 공유 설정
- ✅ 템플릿 JSON 내보내기/가져오기

### 6. 시드 스크립트

**파일**: `scripts/seed-workflow-templates.ts`

기본 템플릿들을 데이터베이스에 추가하는 스크립트입니다.

실행 방법:
```bash
npx tsx scripts/seed-workflow-templates.ts
```

## 사용 방법

### 1. 데이터베이스 마이그레이션 실행

```bash
# Supabase CLI 사용 시
supabase migration up

# 또는 Supabase Dashboard에서 직접 실행
# supabase/migrations/013_workflow_templates_library.sql
```

### 2. 기본 템플릿 시드

```bash
npx tsx scripts/seed-workflow-templates.ts
```

### 3. 마켓플레이스 컴포넌트 사용

```tsx
import { WorkflowTemplateMarketplace } from '@/components/workflow-template-marketplace';

export default function TemplatesPage() {
  return (
    <div>
      <WorkflowTemplateMarketplace
        onCreateWorkflow={(template) => {
          // 워크플로우 생성 후 처리
          router.push('/dashboard/workflows');
        }}
      />
    </div>
  );
}
```

### 4. 템플릿 공유하기

1. 워크플로우를 생성/수정
2. "템플릿으로 내보내기" 기능 사용
3. 템플릿 이름과 설명 입력
4. 공개 설정 선택
5. 템플릿 생성

### 5. 템플릿 가져오기/내보내기

**내보내기:**
1. 템플릿 마켓플레이스에서 원하는 템플릿 선택
2. "내보내기" 버튼 클릭
3. JSON 파일 다운로드

**가져오기:**
1. "가져오기" 버튼 클릭
2. JSON 파일 선택
3. 템플릿이 마켓플레이스에 추가됨

## 데이터베이스 스키마

### workflow_templates
```sql
- id: uuid (PK)
- user_id: text (null = 시스템 템플릿)
- name: text
- description: text
- category: text (안과, 성형외과, 피부과, 공통)
- specialty: text (lasik, cataract, glaucoma, etc.)
- target_surgery_type: text
- visual_data: jsonb (React Flow nodes/edges)
- steps: jsonb (Legacy linear workflow steps)
- is_public: boolean
- is_featured: boolean
- is_system_template: boolean
- usage_count: integer
- rating_average: numeric(3,2)
- rating_count: integer
- tags: text[]
- preview_image_url: text
- created_at: timestamp
- updated_at: timestamp
```

### workflow_template_ratings
```sql
- id: uuid (PK)
- template_id: uuid (FK)
- user_id: text
- rating: integer (1-5)
- comment: text
- created_at: timestamp
- UNIQUE(template_id, user_id)
```

### workflow_template_usage
```sql
- id: uuid (PK)
- template_id: uuid (FK)
- user_id: text
- workflow_id: uuid (FK, nullable)
- created_at: timestamp
```

## 보안 (RLS 정책)

- 공개 템플릿은 모든 사용자가 조회 가능
- 사용자는 자신의 템플릿만 생성/수정/삭제 가능
- 시스템 템플릿은 수정/삭제 불가
- 평점은 모든 사용자가 조회 가능하지만, 자신의 평점만 수정 가능
- 사용 이력은 자신의 이력만 조회 가능

## 향후 개선 사항

1. **템플릿 버전 관리**: 템플릿 업데이트 이력 추적
2. **템플릿 포크**: 다른 사용자의 템플릿을 기반으로 수정
3. **템플릿 검증**: 템플릿 품질 검증 시스템
4. **템플릿 카테고리 확장**: 더 많은 전문과목 추가
5. **템플릿 미리보기 이미지**: 시각적 미리보기 지원
6. **템플릿 통계 대시보드**: 인기 템플릿, 트렌드 분석

## 관련 파일

- `supabase/migrations/013_workflow_templates_library.sql` - 데이터베이스 스키마
- `lib/workflow-template-library.ts` - 템플릿 라이브러리 함수
- `lib/workflow-templates.ts` - 기본 템플릿 정의
- `components/workflow-template-marketplace.tsx` - 마켓플레이스 UI
- `app/api/workflow-templates/**` - API 라우트
- `scripts/seed-workflow-templates.ts` - 시드 스크립트

