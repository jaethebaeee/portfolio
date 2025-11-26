# 워크플로우 실행 이력 UI 구현 계획

## 📋 개요

워크플로우 실행 추적 및 디버깅을 위한 실행 이력 UI 구현 계획입니다.

**예상 소요 시간**: 3-4시간  
**우선순위**: ⭐⭐⭐ (높음)

---

## 🎯 목표

1. 워크플로우 실행 이력을 시각적으로 확인
2. 실행 상태 (성공/실패/진행중) 추적
3. 실행 시간 및 소요 시간 표시
4. 에러 메시지 및 로그 확인
5. 필터링 및 검색 기능
6. 재실행 기능

---

## 📊 현재 상태 분석

### ✅ 이미 있는 것
- `workflows` 테이블 - 워크플로우 정의
- `patient_responses` 테이블 - 환자 응답 저장
- `webhook_executions` 테이블 - 웹훅 실행 이력 (참고용)

### ❌ 없는 것
- `workflow_executions` 테이블 - 워크플로우 실행 이력
- 워크플로우 실행 시 이력 기록 로직
- 실행 이력 조회 API
- 실행 이력 UI

---

## 🗄️ 1단계: 데이터베이스 스키마 설계

### 1.1 마이그레이션 파일 생성
**파일**: `supabase/migrations/006_workflow_executions.sql`

```sql
-- 워크플로우 실행 이력 테이블
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  
  -- 실행 정보
  trigger_type TEXT, -- 'post_surgery', 'manual', 'scheduled'
  trigger_data JSONB, -- 트리거 관련 데이터 (수술 날짜 등)
  
  -- 실행 결과
  steps_executed JSONB, -- 실행된 단계 정보 [{step_index: 0, day: 1, status: 'sent', sent_at: '...'}]
  messages_sent INTEGER DEFAULT 0, -- 발송된 메시지 수
  messages_failed INTEGER DEFAULT 0, -- 실패한 메시지 수
  
  -- 에러 정보
  error_message TEXT,
  error_details JSONB, -- 상세 에러 정보
  
  -- 성능 메트릭
  execution_time_ms INTEGER, -- 총 실행 시간 (밀리초)
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- 메타데이터
  metadata JSONB DEFAULT '{}'::jsonb, -- 추가 메타데이터
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_workflow_executions_user_id 
  ON workflow_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id 
  ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_patient_id 
  ON workflow_executions(patient_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status 
  ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_created_at 
  ON workflow_executions(created_at DESC);

-- RLS 정책
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workflow executions"
  ON workflow_executions FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own workflow executions"
  ON workflow_executions FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own workflow executions"
  ON workflow_executions FOR UPDATE
  USING (auth.uid()::text = user_id);
```

### 1.2 TypeScript 타입 정의
**파일**: `lib/database.types.ts`에 추가

```typescript
export interface WorkflowExecution {
  id: string;
  user_id: string;
  workflow_id: string;
  patient_id?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  trigger_type?: string;
  trigger_data?: any;
  steps_executed?: Array<{
    step_index: number;
    day: number;
    status: 'sent' | 'failed' | 'skipped';
    sent_at?: string;
    error_message?: string;
  }>;
  messages_sent: number;
  messages_failed: number;
  error_message?: string;
  error_details?: any;
  execution_time_ms?: number;
  started_at?: string;
  completed_at?: string;
  metadata?: any;
  created_at: string;
}
```

---

## 🔧 2단계: 백엔드 로직 구현

### 2.1 워크플로우 실행 이력 유틸리티
**파일**: `lib/workflow-executions.ts` (신규)

**기능**:
- 실행 이력 생성
- 실행 이력 업데이트
- 실행 이력 조회
- 실행 이력 필터링

**주요 함수**:
```typescript
// 실행 이력 생성
export async function createWorkflowExecution(
  userId: string,
  workflowId: string,
  patientId?: string,
  triggerType?: string,
  triggerData?: any
): Promise<WorkflowExecution>

// 실행 이력 업데이트
export async function updateWorkflowExecution(
  userId: string,
  executionId: string,
  updates: Partial<WorkflowExecution>
): Promise<WorkflowExecution>

// 실행 이력 조회
export async function getWorkflowExecutions(
  userId: string,
  filters?: {
    workflowId?: string;
    patientId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  },
  pagination?: {
    page?: number;
    limit?: number;
  }
): Promise<{
  executions: WorkflowExecution[];
  total: number;
  page: number;
  limit: number;
}>

// 특정 실행 이력 조회
export async function getWorkflowExecution(
  userId: string,
  executionId: string
): Promise<WorkflowExecution | null>
```

### 2.2 워크플로우 실행 시 이력 기록
**수정할 파일들**:
- 워크플로우 실행 로직이 있는 곳에 이력 기록 추가
- 예: 워크플로우가 트리거될 때마다 실행 이력 생성

**예시 위치**:
- 수술 후 워크플로우 자동 실행 시
- 수동으로 워크플로우 실행 시
- API를 통한 워크플로우 실행 시

---

## 🌐 3단계: API 엔드포인트 구현

### 3.1 실행 이력 목록 조회 API
**파일**: `app/api/workflows/[id]/executions/route.ts` (신규)

**엔드포인트**: `GET /api/workflows/[id]/executions`

**쿼리 파라미터**:
- `page` - 페이지 번호 (기본: 1)
- `limit` - 페이지당 항목 수 (기본: 20)
- `status` - 상태 필터 (pending, running, completed, failed)
- `startDate` - 시작 날짜
- `endDate` - 종료 날짜
- `patientId` - 환자 ID 필터

**응답**:
```json
{
  "executions": [...],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

### 3.2 특정 실행 이력 조회 API
**파일**: `app/api/workflows/[id]/executions/[executionId]/route.ts` (신규)

**엔드포인트**: `GET /api/workflows/[id]/executions/[executionId]`

**응답**: 단일 실행 이력 객체

### 3.3 실행 이력 재실행 API
**파일**: `app/api/workflows/[id]/executions/[executionId]/retry/route.ts` (신규)

**엔드포인트**: `POST /api/workflows/[id]/executions/[executionId]/retry`

**기능**: 실패한 실행을 재시도

---

## 🎨 4단계: UI 컴포넌트 구현

### 4.1 실행 이력 목록 페이지
**파일**: `app/[locale]/dashboard/workflows/[id]/executions/page.tsx` (신규)

**기능**:
- 실행 이력 목록 표시
- 상태별 필터링
- 날짜 범위 필터링
- 페이지네이션
- 각 실행 항목 클릭 시 상세 보기

**UI 구성**:
```
┌─────────────────────────────────────────┐
│ 워크플로우 실행 이력                     │
├─────────────────────────────────────────┤
│ [필터] [상태] [날짜] [검색]             │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ ✅ 성공 | 2025-01-15 14:30        │ │
│ │ 환자: 홍길동 | 3개 메시지 발송     │ │
│ │ 실행 시간: 1.2초                  │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ ❌ 실패 | 2025-01-15 13:20        │ │
│ │ 환자: 김철수 | 에러: API 오류      │ │
│ │ [재시도] 버튼                      │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ [< 이전] [1] [2] [3] [다음 >]         │
└─────────────────────────────────────────┘
```

### 4.2 실행 이력 상세 다이얼로그
**파일**: `components/workflow-execution-detail.tsx` (신규)

**기능**:
- 실행 상세 정보 표시
- 실행된 단계별 상태
- 에러 메시지 및 로그
- 요청/응답 페이로드 (있는 경우)
- 재실행 버튼

**UI 구성**:
```
┌─────────────────────────────────────────┐
│ 실행 이력 상세                          │
├─────────────────────────────────────────┤
│ 상태: ✅ 완료                          │
│ 시작: 2025-01-15 14:30:00             │
│ 완료: 2025-01-15 14:30:01             │
│ 소요 시간: 1.2초                       │
├─────────────────────────────────────────┤
│ 실행된 단계:                            │
│ • Day 1 - 설문 (✅ 발송 완료)          │
│ • Day 3 - 사진 요청 (✅ 발송 완료)     │
├─────────────────────────────────────────┤
│ 발송 통계:                              │
│ • 성공: 3개                             │
│ • 실패: 0개                             │
├─────────────────────────────────────────┤
│ [닫기] [재실행]                        │
└─────────────────────────────────────────┘
```

### 4.3 실행 이력 카드 컴포넌트
**파일**: `components/workflow-execution-card.tsx` (신규)

**기능**:
- 실행 이력 요약 표시
- 상태 배지
- 클릭 시 상세 다이얼로그 열기

### 4.4 워크플로우 페이지에 실행 이력 링크 추가
**파일**: `app/[locale]/dashboard/workflows/page.tsx` (수정)

**변경사항**:
- 각 워크플로우 카드에 "실행 이력 보기" 버튼 추가
- 실행 이력 페이지로 이동하는 링크

---

## 📝 5단계: 워크플로우 실행 로직 수정

### 5.1 워크플로우 실행 시 이력 기록
워크플로우가 실행될 때마다 실행 이력을 생성하도록 수정

**수정할 위치**:
- 워크플로우 자동 실행 로직
- 수동 실행 API
- 웹훅을 통한 실행

**예시 흐름**:
```typescript
// 1. 실행 이력 생성
const execution = await createWorkflowExecution(
  userId,
  workflowId,
  patientId,
  'post_surgery',
  { surgery_date: '2025-01-15' }
);

// 2. 워크플로우 실행
try {
  const result = await executeWorkflow(workflow, patient);
  
  // 3. 실행 이력 업데이트
  await updateWorkflowExecution(userId, execution.id, {
    status: 'completed',
    messages_sent: result.sentCount,
    messages_failed: result.failedCount,
    steps_executed: result.steps,
    execution_time_ms: Date.now() - startTime,
    completed_at: new Date().toISOString(),
  });
} catch (error) {
  // 4. 실패 시 이력 업데이트
  await updateWorkflowExecution(userId, execution.id, {
    status: 'failed',
    error_message: error.message,
    error_details: error,
    completed_at: new Date().toISOString(),
  });
}
```

---

## 🎯 구현 순서

### Phase 1: 데이터베이스 및 백엔드 (1-2시간)
1. ✅ 마이그레이션 파일 생성 및 적용
2. ✅ TypeScript 타입 정의 추가
3. ✅ `lib/workflow-executions.ts` 구현
4. ✅ API 엔드포인트 구현

### Phase 2: UI 구현 (1-2시간)
5. ✅ 실행 이력 목록 페이지
6. ✅ 실행 이력 상세 다이얼로그
7. ✅ 실행 이력 카드 컴포넌트
8. ✅ 워크플로우 페이지에 링크 추가

### Phase 3: 통합 (30분-1시간)
9. ✅ 워크플로우 실행 로직에 이력 기록 추가
10. ✅ 테스트 및 버그 수정

---

## 📋 체크리스트

### 데이터베이스
- [ ] 마이그레이션 파일 생성
- [ ] 마이그레이션 적용
- [ ] RLS 정책 테스트
- [ ] 인덱스 확인

### 백엔드
- [ ] `lib/workflow-executions.ts` 구현
- [ ] API 엔드포인트 구현
- [ ] 에러 핸들링
- [ ] 타입 정의

### 프론트엔드
- [ ] 실행 이력 목록 페이지
- [ ] 실행 이력 상세 다이얼로그
- [ ] 실행 이력 카드 컴포넌트
- [ ] 필터링 기능
- [ ] 페이지네이션
- [ ] 재실행 기능

### 통합
- [ ] 워크플로우 실행 시 이력 기록
- [ ] 테스트
- [ ] 에러 처리

---

## 🎨 UI 디자인 가이드

### 색상
- ✅ 성공: `text-green-600`, `bg-green-50`
- ❌ 실패: `text-red-600`, `bg-red-50`
- ⏳ 진행중: `text-blue-600`, `bg-blue-50`
- ⏸️ 대기: `text-gray-600`, `bg-gray-50`

### 아이콘
- 성공: `CheckCircle2`
- 실패: `XCircle`
- 진행중: `Loader2` (애니메이션)
- 대기: `Clock`

### 레이아웃
- 카드 기반 디자인
- 호버 효과
- 반응형 디자인
- 다크 모드 지원

---

## 🔍 추가 기능 (선택사항)

### 고급 필터링
- [ ] 환자 이름으로 검색
- [ ] 실행 시간 범위 필터
- [ ] 메시지 발송 수 필터

### 통계 대시보드
- [ ] 실행 성공률 차트
- [ ] 일별 실행 수 차트
- [ ] 평균 실행 시간

### 내보내기
- [ ] CSV 내보내기
- [ ] PDF 리포트 생성

---

## 📚 참고 파일

- `supabase/migrations/002_webhooks_and_retry.sql` - 웹훅 실행 이력 참고
- `app/[locale]/dashboard/webhooks/page.tsx` - 웹훅 UI 참고
- `lib/webhook.ts` - 웹훅 유틸리티 참고
- `lib/workflow-types.ts` - 워크플로우 타입 정의

---

## ⚠️ 주의사항

1. **RLS 정책**: 사용자는 자신의 실행 이력만 볼 수 있어야 함
2. **성능**: 많은 실행 이력이 있을 경우 페이지네이션 필수
3. **에러 처리**: API 호출 실패 시 사용자 친화적 메시지 표시
4. **타입 안정성**: TypeScript 타입을 정확히 정의

---

**작성일**: 2025-01-XX  
**예상 완료일**: 구현 시작 후 3-4시간  
**우선순위**: 높음 ⭐⭐⭐

