# 워크플로우 백엔드 추가 개선 사항

## 🔍 추가로 발견된 개선 사항

### 1. **워크플로우 생성/업데이트 시 검증 통합** ⚠️

#### 현재 문제:
- API에서 워크플로우 검증 로직이 없음
- 잘못된 워크플로우가 저장될 수 있음
- 실행 시점에만 에러 발견

#### 개선 제안:
```typescript
// app/api/workflows/route.ts 개선
export async function POST(request: NextRequest) {
  // ... 기존 코드 ...
  
  // 워크플로우 검증 추가
  if (body.visual_data) {
    const { validateWorkflow } = await import('@/lib/workflow-validation');
    const { Node, Edge } = await import('@xyflow/react');
    
    const validation = validateWorkflow(
      body.visual_data.nodes || [],
      body.visual_data.edges || []
    );
    
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: '워크플로우 검증 실패',
          validationErrors: validation.errors,
          nodeErrors: validation.nodeErrors
        },
        { status: 400 }
      );
    }
  }
  
  // ... 나머지 코드 ...
}
```

### 2. **변수 치환 보안 검증** ⚠️

#### 현재 문제:
- 사용자 입력이 변수로 직접 치환됨
- XSS 공격 가능성
- SQL Injection 가능성 (변수가 쿼리에 사용되는 경우)

#### 개선 제안:
```typescript
// lib/variable-sanitizer.ts (신규)
export class VariableSanitizer {
  // HTML 이스케이프
  static escapeHtml(value: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return value.replace(/[&<>"']/g, m => map[m]);
  }
  
  // 변수 값 검증 및 정제
  static sanitizeVariable(key: string, value: any): string {
    if (typeof value !== 'string') {
      value = String(value);
    }
    
    // 길이 제한
    if (value.length > 1000) {
      value = value.substring(0, 1000);
    }
    
    // 특수 문자 제거 (필요한 경우)
    // value = value.replace(/[<>]/g, '');
    
    return value;
  }
  
  // 변수 치환 (안전한 방식)
  static replaceVariables(
    template: string,
    variables: Record<string, any>,
    options: { escapeHtml?: boolean } = {}
  ): string {
    let result = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const sanitized = this.sanitizeVariable(key, value);
      const finalValue = options.escapeHtml ? this.escapeHtml(sanitized) : sanitized;
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), finalValue);
    });
    
    return result;
  }
}
```

### 3. **중복 실행 방지 로직 강화** ⚠️

#### 현재 문제:
- `message_logs` 조회가 개별적으로 수행됨
- Race condition 가능성
- 트랜잭션 보장 없음

#### 개선 제안:
```typescript
// lib/workflow-duplicate-prevention.ts (신규)
export class WorkflowDuplicatePrevention {
  // 배치로 중복 체크
  static async checkBatchExecutions(
    supabase: any,
    executions: Array<{
      workflowId: string;
      patientId: string;
      appointmentId: string;
      nodeId?: string;
      stepIndex?: number;
    }>
  ): Promise<Set<string>> {
    if (executions.length === 0) return new Set();
    
    // 모든 체크 키 생성
    const checkKeys = executions.map(exec => 
      `${exec.workflowId}-${exec.patientId}-${exec.appointmentId}-${exec.nodeId || exec.stepIndex}`
    );
    
    // 배치 쿼리로 한 번에 확인
    const patientIds = [...new Set(executions.map(e => e.patientId))];
    const workflowIds = [...new Set(executions.map(e => e.workflowId))];
    
    const { data: existingLogs } = await supabase
      .from('message_logs')
      .select('patient_id, metadata')
      .in('patient_id', patientIds)
      .in('metadata->workflow_id', workflowIds);
    
    // 실행된 키 세트 생성
    const executedKeys = new Set<string>();
    existingLogs?.forEach(log => {
      const meta = log.metadata as any;
      const key = `${meta.workflow_id}-${log.patient_id}-${meta.appointment_id}-${meta.node_id || meta.step_index}`;
      if (checkKeys.includes(key)) {
        executedKeys.add(key);
      }
    });
    
    return executedKeys;
  }
  
  // 원자적 실행 체크 및 실행
  static async executeWithDuplicateCheck(
    supabase: any,
    execution: {
      workflowId: string;
      patientId: string;
      appointmentId: string;
      nodeId?: string;
      stepIndex?: number;
    },
    executeFn: () => Promise<any>
  ): Promise<{ executed: boolean; result?: any; skipped: boolean }> {
    // 원자적 체크를 위한 고유 키
    const executionKey = `${execution.workflowId}-${execution.patientId}-${execution.appointmentId}-${execution.nodeId || execution.stepIndex}`;
    
    // 데이터베이스 레벨에서 중복 방지 (고유 제약 조건 또는 SELECT FOR UPDATE)
    // 또는 Redis를 사용한 분산 락
    
    try {
      // 실행
      const result = await executeFn();
      return { executed: true, result, skipped: false };
    } catch (error: any) {
      if (error.message?.includes('duplicate') || error.message?.includes('already exists')) {
        return { executed: false, skipped: true };
      }
      throw error;
    }
  }
}
```

### 4. **조건 평가 에러 핸들링 개선** ⚠️

#### 현재 문제:
- 조건 평가 실패 시 기본값으로 처리
- 에러 로깅 부족
- 디버깅 어려움

#### 개선 제안:
```typescript
// lib/conditional-logic.ts 개선
export function evaluateCondition(
  condition: Condition,
  variables: Record<string, string>,
  options: { 
    onError?: 'throw' | 'default' | 'log';
    defaultValue?: boolean;
  } = {}
): boolean {
  try {
    const varValue = variables[condition.variable];
    
    if (varValue === undefined) {
      if (options.onError === 'throw') {
        throw new Error(`Variable ${condition.variable} not found`);
      }
      if (options.onError === 'log') {
        console.warn(`Variable ${condition.variable} not found, using default: ${options.defaultValue ?? false}`);
      }
      return options.defaultValue ?? false;
    }
    
    // ... 기존 평가 로직 ...
    
  } catch (error: any) {
    if (options.onError === 'throw') {
      throw error;
    }
    if (options.onError === 'log') {
      console.error(`Condition evaluation failed:`, error);
    }
    return options.defaultValue ?? false;
  }
}
```

### 5. **배치 실행 API 개선** ⚠️

#### 현재 문제:
- 배치 크기 제한이 하드코딩됨
- 에러 핸들링 부족
- 진행 상황 추적 불가

#### 개선 제안:
```typescript
// app/api/workflows/batch-execute/route.ts 개선
export async function POST(req: NextRequest) {
  // ... 기존 코드 ...
  
  const body = await req.json();
  const { workflowId, patientIds, options = {} } = body;
  
  const batchOptions = {
    batchSize: options.batchSize || 20,
    maxConcurrency: options.maxConcurrency || 5,
    timeout: options.timeout || 30000,
    continueOnError: options.continueOnError ?? true
  };
  
  // 워크플로우 큐 사용으로 개선
  const { workflowQueue } = await import('@/lib/workflow-queue');
  const jobIds: string[] = [];
  
  for (const patient of patients) {
    const mockAppointment = { /* ... */ };
    
    const jobId = await workflowQueue.enqueue(
      workflow,
      patient,
      mockAppointment,
      { daysPassed: 0 },
      {
        priority: 'normal',
        tags: ['batch-execution', `batch-${Date.now()}`]
      }
    );
    
    jobIds.push(jobId);
  }
  
  return NextResponse.json({
    success: true,
    queued: jobIds.length,
    jobIds: jobIds.slice(0, 10), // 처음 10개만 반환
    message: `${jobIds.length} jobs queued for execution`
  });
}
```

### 6. **비주얼 워크플로우 엔진 에러 핸들링 개선** ⚠️

#### 현재 문제:
- 에러 발생 시 전체 실행이 중단될 수 있음
- 부분 실패 처리 부족
- 에러 상세 정보 부족

#### 개선 제안:
```typescript
// lib/visual-workflow-engine.ts 개선
export async function executeVisualWorkflow(...) {
  // ... 기존 코드 ...
  
  const nodeResults: Array<{
    nodeId: string;
    success: boolean;
    error?: string;
    duration?: number;
  }> = [];
  
  for (const action of todaysActions) {
    const nodeStartTime = Date.now();
    try {
      // ... 실행 로직 ...
      
      nodeResults.push({
        nodeId: action.node.id,
        success: true,
        duration: Date.now() - nodeStartTime
      });
    } catch (error: any) {
      hasErrors = true;
      const errorMessage = error.message || 'Unknown error';
      
      // 에러 분류
      const { WorkflowErrorHandler } = await import('./workflow-error-handler');
      const errorCategory = WorkflowErrorHandler.classifyError(errorMessage);
      
      nodeResults.push({
        nodeId: action.node.id,
        success: false,
        error: errorMessage,
        duration: Date.now() - nodeStartTime
      });
      
      logMessages.push(`Failed node ${action.node.id} [${errorCategory}]: ${errorMessage}`);
      
      // 재시도 가능한 에러인지 확인
      const shouldRetry = WorkflowErrorHandler.shouldRetry(errorMessage, 0);
      if (shouldRetry) {
        // 재시도 큐에 추가
        // ...
      }
    }
  }
  
  // 실행 데이터에 노드별 결과 포함
  if (executionId) {
    await supabase
      .from('workflow_executions')
      .update({
        execution_data: {
          ...executionData,
          nodeResults,
          log: logMessages
        }
      })
      .eq('id', executionId);
  }
  
  // ... 나머지 코드 ...
}
```

### 7. **약물 알림 스케줄링 로직 개선** ⚠️

#### 현재 문제:
- `message_logs`에 스케줄된 항목 저장 (비효율적)
- 중복 스케줄링 가능
- 시간대 처리 부족

#### 개선 제안:
```typescript
// lib/visual-workflow-engine.ts의 scheduleMedicationReminders 개선
async function scheduleMedicationReminders(...) {
  // 워크플로우 큐 사용으로 개선
  const { workflowQueue } = await import('./workflow-queue');
  
  for (let day = 0; day < medication.duration; day++) {
    const reminderDate = new Date(startDate);
    reminderDate.setDate(reminderDate.getDate() + day);
    
    for (const time of medication.times) {
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledTime = new Date(reminderDate);
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      // 시간대 처리 (환자 시간대 고려)
      // const patientTimezone = patient.timezone || 'Asia/Seoul';
      // const scheduledTimeInTimezone = convertToTimezone(scheduledTime, patientTimezone);
      
      // 큐에 작업 추가
      await workflowQueue.enqueue(
        workflow,
        patient,
        appointment,
        {
          daysPassed: day,
          medicationReminder: true,
          medicationName: medication.name,
          scheduledTime: scheduledTime.toISOString()
        },
        {
          scheduledFor: scheduledTime.getTime(),
          tags: ['medication-reminder', `medication-${medication.name}`],
          priority: 'high'
        }
      );
    }
  }
}
```

### 8. **워크플로우 실행 로깅 개선** ⚠️

#### 현재 문제:
- 로그가 단순 문자열 배열
- 구조화된 로그 부족
- 로그 레벨 없음

#### 개선 제안:
```typescript
// lib/workflow-logger.ts (신규)
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface WorkflowLogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  nodeId?: string;
  executionId?: string;
  metadata?: Record<string, any>;
}

export class WorkflowLogger {
  private logs: WorkflowLogEntry[] = [];
  
  log(level: LogLevel, message: string, metadata?: Record<string, any>) {
    this.logs.push({
      level,
      message,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  }
  
  debug(message: string, metadata?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, metadata);
  }
  
  info(message: string, metadata?: Record<string, any>) {
    this.log(LogLevel.INFO, message, metadata);
  }
  
  warn(message: string, metadata?: Record<string, any>) {
    this.log(LogLevel.WARN, message, metadata);
  }
  
  error(message: string, error?: Error, metadata?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, {
      ...metadata,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined
    });
  }
  
  getLogs(): WorkflowLogEntry[] {
    return [...this.logs];
  }
  
  getLogsByLevel(level: LogLevel): WorkflowLogEntry[] {
    return this.logs.filter(log => log.level === level);
  }
  
  clear() {
    this.logs = [];
  }
}
```

## 🚀 우선순위별 구현 계획

### 즉시 구현 (High Priority) ⭐⭐⭐

1. **워크플로우 생성/업데이트 시 검증 통합**
   - API에 검증 로직 추가
   - 잘못된 워크플로우 저장 방지

2. **변수 치환 보안 검증**
   - XSS 방지
   - 입력 값 검증 및 정제

3. **중복 실행 방지 로직 강화**
   - 배치 중복 체크
   - 원자적 실행 보장

### 중기 구현 (Medium Priority) ⭐⭐

4. **조건 평가 에러 핸들링 개선**
   - 에러 로깅 강화
   - 기본값 처리 개선

5. **배치 실행 API 개선**
   - 워크플로우 큐 통합
   - 진행 상황 추적

6. **비주얼 워크플로우 엔진 에러 핸들링 개선**
   - 부분 실패 처리
   - 노드별 결과 추적

### 장기 구현 (Low Priority) ⭐

7. **약물 알림 스케줄링 로직 개선**
   - 큐 시스템 통합
   - 시간대 처리

8. **워크플로우 실행 로깅 개선**
   - 구조화된 로그
   - 로그 레벨

## 📝 구현 예시

### 워크플로우 검증 통합

```typescript
// app/api/workflows/route.ts
import { validateWorkflow } from '@/lib/workflow-validation';
import { Node, Edge } from '@xyflow/react';

export async function POST(request: NextRequest) {
  // ... 기존 인증 코드 ...
  
  const body = await request.json();
  
  // 워크플로우 검증
  if (body.visual_data) {
    const nodes = (body.visual_data.nodes || []) as Node[];
    const edges = (body.visual_data.edges || []) as Edge[];
    
    const validation = validateWorkflow(nodes, edges);
    
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: '워크플로우 검증 실패',
          validationErrors: validation.errors,
          warnings: validation.warnings,
          nodeErrors: validation.nodeErrors
        },
        { status: 400 }
      );
    }
  }
  
  // ... 나머지 코드 ...
}
```

### 변수 치환 보안

```typescript
// lib/variable-sanitizer.ts (신규)
export class VariableSanitizer {
  static sanitizeVariable(key: string, value: any): string {
    if (typeof value !== 'string') {
      value = String(value);
    }
    
    // 길이 제한
    if (value.length > 1000) {
      value = value.substring(0, 1000);
    }
    
    return value;
  }
  
  static replaceVariables(
    template: string,
    variables: Record<string, any>
  ): string {
    let result = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const sanitized = this.sanitizeVariable(key, value);
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), sanitized);
    });
    
    return result;
  }
}
```

## 📊 예상 효과

### 보안 강화
- XSS 공격 방지
- 잘못된 입력 값 필터링
- 워크플로우 무결성 보장

### 안정성 개선
- 중복 실행 방지 강화
- 부분 실패 처리
- 에러 추적 개선

### 사용자 경험 개선
- 명확한 에러 메시지
- 검증 실패 시 즉시 피드백
- 실행 상태 추적

