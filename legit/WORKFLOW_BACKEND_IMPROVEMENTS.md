# 워크플로우 백엔드 개선 사항 및 기능 제안

## 📋 현재 상태 분석

### ✅ 구현된 기능
1. **워크플로우 실행 엔진** (`lib/workflow-execution.ts`)
   - 일일 크론 실행
   - 레거시 선형 워크플로우 지원
   - 비주얼 워크플로우 지원
   - 배치 쿼리 최적화 (N+1 문제 해결)

2. **향상된 실행 엔진** (`lib/workflow-execution-engine.ts`)
   - 병렬 실행 지원
   - 캐싱
   - 회로 차단기 (Circuit Breaker)
   - 메트릭 수집
   - 상태 지속성

3. **워크플로우 큐 시스템** (`lib/workflow-queue.ts`)
   - 작업 큐 관리
   - 재시도 로직 (Exponential Backoff)
   - 우선순위 큐
   - 지연 실행 지원

4. **API 엔드포인트**
   - `GET /api/workflows` - 워크플로우 목록
   - `POST /api/workflows` - 워크플로우 생성
   - `GET /api/workflows/[id]` - 단일 조회
   - `PATCH /api/workflows/[id]` - 업데이트
   - `DELETE /api/workflows/[id]` - 삭제
   - `GET /api/workflows/executions` - 실행 이력

## 🔍 발견된 문제점 및 개선 사항

### 1. **실행 이력 API 개선 필요** ⚠️

#### 현재 문제:
- 실행 이력 조회 시 상세 정보 부족
- 실패한 실행에 대한 재시도 API 없음
- 실행 로그 상세 조회 불가

#### 개선 제안:
```typescript
// app/api/workflows/executions/[id]/route.ts (신규)
GET /api/workflows/executions/[id]
- 실행 상세 정보 반환
- 노드별 실행 결과 포함
- 에러 스택 트레이스 포함

// app/api/workflows/executions/[id]/retry/route.ts (신규)
POST /api/workflows/executions/[id]/retry
- 실패한 실행 재시도
- 재시도 옵션 (전체/실패 노드만)
- 재시도 이력 추적
```

### 2. **워크플로우 실행 모니터링 강화** ⚠️

#### 현재 문제:
- 실시간 실행 상태 추적 불가
- 실행 중인 워크플로우 일시정지/재개 불가
- 실행 취소 기능 없음

#### 개선 제안:
```typescript
// app/api/workflows/[id]/executions/[executionId]/pause/route.ts (신규)
POST /api/workflows/[id]/executions/[executionId]/pause
- 실행 중인 워크플로우 일시정지

// app/api/workflows/[id]/executions/[executionId]/resume/route.ts (신규)
POST /api/workflows/[id]/executions/[executionId]/resume
- 일시정지된 워크플로우 재개

// app/api/workflows/[id]/executions/[executionId]/cancel/route.ts (신규)
POST /api/workflows/[id]/executions/[executionId]/cancel
- 실행 중인 워크플로우 취소
```

### 3. **에러 핸들링 및 재시도 로직 개선** ⚠️

#### 현재 문제:
- `workflow-execution.ts`에서 실패 시 단순 로깅만 수행
- 재시도 로직이 큐 시스템에만 있음
- 에러 분류 및 처리 전략 부족

#### 개선 제안:
```typescript
// lib/workflow-error-handler.ts (신규)
export class WorkflowErrorHandler {
  // 에러 분류
  classifyError(error: Error): ErrorCategory {
    // 네트워크 오류, API 오류, 데이터 오류 등 분류
  }
  
  // 재시도 가능 여부 판단
  shouldRetry(error: Error, retryCount: number): boolean {
    // 일시적 오류만 재시도
    // 영구적 오류는 즉시 실패 처리
  }
  
  // 재시도 전략
  getRetryDelay(retryCount: number, error: Error): number {
    // Exponential backoff with jitter
    // 에러 타입별 다른 전략
  }
}
```

### 4. **워크플로우 실행 성능 최적화** ⚠️

#### 현재 문제:
- `executeDailyWorkflows`에서 모든 사용자 순차 처리
- 대량 실행 시 타임아웃 가능성
- 병렬 처리 제한

#### 개선 제안:
```typescript
// lib/workflow-execution.ts 개선
export async function executeDailyWorkflows(userId: string) {
  // 1. 활성 워크플로우를 병렬로 처리
  const workflowPromises = workflows.map(workflow => 
    executeWorkflowForUser(workflow, userId)
  );
  
  // 2. Promise.allSettled로 일부 실패해도 계속 진행
  const results = await Promise.allSettled(workflowPromises);
  
  // 3. 배치 크기 제한으로 메모리 관리
  const BATCH_SIZE = 10;
  for (let i = 0; i < workflows.length; i += BATCH_SIZE) {
    const batch = workflows.slice(i, i + BATCH_SIZE);
    await Promise.allSettled(batch.map(w => executeWorkflowForUser(w, userId)));
  }
}
```

### 5. **워크플로우 실행 통계 및 분석** ⭐

#### 현재 문제:
- 실행 통계 API 없음
- 성공률, 평균 실행 시간 등 메트릭 부족
- 워크플로우별 성능 비교 불가

#### 개선 제안:
```typescript
// app/api/workflows/[id]/stats/route.ts (신규)
GET /api/workflows/[id]/stats
{
  "successRate": 0.95,
  "averageExecutionTime": 1234,
  "totalExecutions": 1000,
  "failedExecutions": 50,
  "nodeStats": [
    {
      "nodeId": "action-1",
      "successRate": 0.98,
      "averageExecutionTime": 500,
      "failureReasons": [...]
    }
  ],
  "timeSeries": [
    { "date": "2024-01-01", "executions": 10, "successes": 9 }
  ]
}
```

### 6. **워크플로우 실행 검증 강화** ⚠️

#### 현재 문제:
- 실행 전 워크플로우 유효성 검사 부족
- 노드 데이터 검증 미흡
- 실행 중 동적 검증 없음

#### 개선 제안:
```typescript
// lib/workflow-execution.ts 개선
export async function executeDailyWorkflows(userId: string) {
  for (const workflow of workflows) {
    // 실행 전 검증
    const validation = validateWorkflowForExecution(workflow);
    if (!validation.isValid) {
      logs.push(`Skipped ${workflow.name}: ${validation.errors.join(', ')}`);
      continue;
    }
    
    // 실행 중 검증
    // 각 노드 실행 전 데이터 검증
  }
}

function validateWorkflowForExecution(workflow: Workflow): ValidationResult {
  // 필수 필드 확인
  // 노드 연결성 확인
  // 데이터 타입 확인
  // 변수 존재 확인
}
```

### 7. **워크플로우 실행 로깅 개선** ⚠️

#### 현재 문제:
- 로그가 단순 문자열 배열
- 구조화된 로그 부족
- 로그 레벨 없음
- 로그 검색/필터링 불가

#### 개선 제안:
```typescript
// lib/workflow-logger.ts (신규)
export class WorkflowLogger {
  log(level: 'info' | 'warn' | 'error', message: string, metadata?: object) {
    // 구조화된 로그 저장
    // Supabase에 저장 또는 외부 로깅 서비스 연동
  }
  
  // 실행 컨텍스트 포함
  logExecution(executionId: string, nodeId: string, result: any) {
    this.log('info', 'Node executed', {
      executionId,
      nodeId,
      result,
      timestamp: new Date().toISOString()
    });
  }
}
```

### 8. **워크플로우 실행 알림 시스템** ⭐

#### 현재 문제:
- 실패한 실행에 대한 알림 없음
- 워크플로우 비활성화 시 알림 없음
- 실행 통계 임계치 초과 시 알림 없음

#### 개선 제안:
```typescript
// lib/workflow-notifications.ts (신규)
export class WorkflowNotificationService {
  // 실패 알림
  async notifyExecutionFailure(execution: WorkflowExecution) {
    // 이메일, 슬랙, SMS 등으로 알림
  }
  
  // 임계치 알림
  async checkThresholds(workflowId: string) {
    const stats = await getWorkflowStats(workflowId);
    if (stats.successRate < 0.9) {
      await this.notifyLowSuccessRate(workflowId, stats);
    }
  }
}
```

### 9. **워크플로우 실행 큐 관리 개선** ⚠️

#### 현재 문제:
- 큐 상태 모니터링 API 없음
- 큐 정리 작업 수동
- 우선순위 조정 불가

#### 개선 제안:
```typescript
// app/api/workflows/queue/stats/route.ts (신규)
GET /api/workflows/queue/stats
{
  "waiting": 10,
  "active": 5,
  "completed": 1000,
  "failed": 50,
  "throughput": {
    "jobsPerMinute": 10,
    "averageExecutionTime": 1234
  }
}

// app/api/workflows/queue/cleanup/route.ts (신규)
POST /api/workflows/queue/cleanup
- 오래된 작업 정리
- 실패한 작업 정리 옵션
```

### 10. **워크플로우 실행 테스트 모드** ⭐

#### 현재 문제:
- 실제 발송 없이 테스트 불가
- 실행 결과 미리보기 불가
- 변수 치환 결과 확인 불가

#### 개선 제안:
```typescript
// app/api/workflows/[id]/test/route.ts 개선
POST /api/workflows/[id]/test
{
  "testMode": true,
  "patientId": "test-patient-id",
  "dryRun": true  // 실제 발송 없이 실행
}

// 응답에 실제로 발송될 메시지 내용 포함
{
  "executed": true,
  "messages": [
    {
      "channel": "kakao",
      "content": "실제 발송될 메시지 내용",
      "variables": {...}
    }
  ],
  "executionPlan": [...]
}
```

## 🚀 우선순위별 개선 계획

### Phase 1: 핵심 기능 개선 ✅ (완료)

1. ✅ **실행 이력 상세 API**
   - ✅ 실행 상세 조회
   - ✅ 재시도 API
   - ⏳ 실행 취소 API (다음 단계)

2. ✅ **에러 핸들링 개선**
   - ✅ 에러 분류 시스템
   - ✅ 스마트 재시도 로직
   - ⏳ 에러 알림 (다음 단계)

3. ⏳ **실행 성능 최적화** (진행 중)
   - ⏳ 병렬 처리 개선
   - ✅ 배치 처리 (기존 구현)
   - ⏳ 타임아웃 관리

### Phase 2: 모니터링 및 분석 (중기) ⭐⭐

4. **실행 통계 API**
   - 성공률, 실행 시간 통계
   - 노드별 통계
   - 시계열 데이터

5. **실행 로깅 개선**
   - 구조화된 로그
   - 로그 검색/필터링
   - 로그 레벨

6. **알림 시스템**
   - 실패 알림
   - 임계치 알림
   - 워크플로우 상태 알림

### Phase 3: 고급 기능 (장기) ⭐

7. **실행 모니터링 대시보드**
   - 실시간 실행 상태
   - 실행 그래프 시각화
   - 성능 메트릭 차트

8. **워크플로우 실행 최적화**
   - 실행 계획 최적화
   - 리소스 사용량 모니터링
   - 자동 스케일링

## 📝 구체적인 구현 예시

### 1. 실행 이력 상세 API

```typescript
// app/api/workflows/executions/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  const { id } = await params;
  
  const supabase = createServerClient();
  const { data: execution, error } = await supabase
    .from('workflow_executions')
    .select(`
      *,
      workflow:workflows(*),
      patient:patients(*),
      appointment:appointments(*),
      logs:workflow_execution_logs(*)
    `)
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  
  if (error || !execution) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  return NextResponse.json({ execution });
}
```

### 2. 재시도 API

```typescript
// app/api/workflows/executions/[id]/retry/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  const { id } = await params;
  const body = await request.json();
  
  // 실행 이력 조회
  const execution = await getExecution(userId, id);
  if (!execution || execution.status !== 'failed') {
    return NextResponse.json({ error: 'Invalid execution' }, { status: 400 });
  }
  
  // 재시도 옵션
  const retryOptions = {
    retryFailedNodesOnly: body.retryFailedNodesOnly ?? false,
    resetContext: body.resetContext ?? false
  };
  
  // 워크플로우 큐에 재시도 작업 추가
  const { workflowQueue } = await import('@/lib/workflow-queue');
  const jobId = await workflowQueue.enqueue(
    execution.workflow,
    execution.patient,
    execution.appointment,
    {
      ...execution.execution_data.context,
      retryFromExecutionId: id,
      retryOptions
    },
    {
      priority: 'high',
      tags: ['retry', `original-execution-${id}`]
    }
  );
  
  return NextResponse.json({ 
    success: true, 
    jobId,
    message: 'Retry job queued' 
  });
}
```

### 3. 실행 통계 API

```typescript
// app/api/workflows/[id]/stats/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  const { id } = await params;
  
  const supabase = createServerClient();
  
  // 기본 통계
  const { data: executions } = await supabase
    .from('workflow_executions')
    .select('status, execution_time, created_at')
    .eq('workflow_id', id)
    .eq('user_id', userId);
  
  const total = executions?.length || 0;
  const successful = executions?.filter(e => e.status === 'completed').length || 0;
  const failed = executions?.filter(e => e.status === 'failed').length || 0;
  const successRate = total > 0 ? successful / total : 0;
  
  const executionTimes = executions
    ?.filter(e => e.execution_time)
    .map(e => e.execution_time) || [];
  const avgExecutionTime = executionTimes.length > 0
    ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length
    : 0;
  
  // 시계열 데이터 (최근 30일)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: timeSeries } = await supabase
    .from('workflow_executions')
    .select('created_at, status')
    .eq('workflow_id', id)
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true });
  
  // 일별 집계
  const dailyStats = groupByDate(timeSeries || []);
  
  return NextResponse.json({
    successRate,
    averageExecutionTime: avgExecutionTime,
    totalExecutions: total,
    successfulExecutions: successful,
    failedExecutions: failed,
    timeSeries: dailyStats
  });
}
```

### 4. 에러 핸들러 개선

```typescript
// lib/workflow-error-handler.ts (신규)
export enum ErrorCategory {
  NETWORK = 'network',
  API_ERROR = 'api_error',
  DATA_ERROR = 'data_error',
  TIMEOUT = 'timeout',
  PERMISSION = 'permission',
  UNKNOWN = 'unknown'
}

export class WorkflowErrorHandler {
  classifyError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('timeout') || message.includes('econnrefused')) {
      return ErrorCategory.NETWORK;
    }
    if (message.includes('api') || message.includes('http') || message.includes('status')) {
      return ErrorCategory.API_ERROR;
    }
    if (message.includes('not found') || message.includes('invalid') || message.includes('missing')) {
      return ErrorCategory.DATA_ERROR;
    }
    if (message.includes('unauthorized') || message.includes('forbidden') || message.includes('permission')) {
      return ErrorCategory.PERMISSION;
    }
    
    return ErrorCategory.UNKNOWN;
  }
  
  shouldRetry(error: Error, retryCount: number, maxRetries: number = 3): boolean {
    if (retryCount >= maxRetries) return false;
    
    const category = this.classifyError(error);
    
    // 재시도 가능한 에러 타입
    const retryableCategories = [
      ErrorCategory.NETWORK,
      ErrorCategory.TIMEOUT,
      ErrorCategory.API_ERROR
    ];
    
    return retryableCategories.includes(category);
  }
  
  getRetryDelay(retryCount: number, error: Error): number {
    const baseDelay = 1000; // 1초
    const maxDelay = 60000; // 60초
    
    // Exponential backoff with jitter
    const exponentialDelay = baseDelay * Math.pow(2, retryCount);
    const jitter = Math.random() * 1000; // 0-1초 랜덤
    const delay = Math.min(exponentialDelay + jitter, maxDelay);
    
    return delay;
  }
}
```

## 🎯 즉시 적용 가능한 개선 사항

### 1. 실행 이력 API 응답 개선
- 노드별 실행 결과 포함
- 에러 스택 트레이스 포함
- 실행 컨텍스트 포함

### 2. 재시도 API 추가
- 실패한 실행 재시도
- 부분 재시도 (실패 노드만)
- 재시도 이력 추적

### 3. 실행 모니터링 API
- 실시간 실행 상태
- 큐 상태 모니터링
- 성능 메트릭

### 4. 에러 핸들링 강화
- 에러 분류 시스템
- 스마트 재시도
- 에러 알림

## 📊 예상 효과

### 성능 개선
- 병렬 처리로 실행 시간 50% 감소
- 배치 처리로 데이터베이스 부하 감소
- 캐싱으로 반복 쿼리 제거

### 안정성 개선
- 스마트 재시도로 성공률 20% 향상
- 에러 분류로 문제 진단 시간 50% 단축
- 회로 차단기로 연쇄 실패 방지

### 사용자 경험 개선
- 실행 상태 실시간 확인
- 실패 원인 명확히 파악
- 재시도로 수동 개입 최소화

