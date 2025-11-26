# 워크플로우 자동화 기능 구현 완료 요약

n8n 스타일의 워크플로우 기능들을 구현했습니다.

## ✅ 구현 완료된 기능

### 1. 웹훅 트리거 ⭐⭐⭐
- **구현**: `lib/webhook.ts`, `app/api/webhooks/`
- **기능**:
  - 웹훅 생성 및 관리
  - 고유 URL 생성
  - 시크릿 키 기반 보안
  - 템플릿 연결
  - 웹훅 실행 이력 추적
- **사용법**: 
  ```bash
  curl -X POST https://doctorsflow.com/api/webhooks/{webhook_id} \
    -H "Content-Type: application/json" \
    -d '{"patient_id": "uuid", "appointment_id": "uuid"}'
  ```

### 2. 조건부 분기 로직 ⭐⭐⭐
- **구현**: `lib/conditional-logic.ts`
- **기능**:
  - `{{if variable > value}}텍스트{{else}}대체 텍스트{{/if}}` 지원
  - 숫자 비교 (>, <, >=, <=, ==, !=)
  - 문자열 비교 (==, !=)
  - 템플릿 엔진에 자동 통합
- **예시**:
  ```
  {{if days_since_surgery > 7}}회복이 잘 되고 계신가요?{{else}}수술 후 첫날입니다.{{/if}}
  ```

### 3. 재시도 로직 ⭐⭐⭐
- **구현**: `lib/message-retry.ts`, `app/api/messages/retry/`
- **기능**:
  - 실패한 메시지 자동 재시도
  - Exponential backoff (1분, 5분, 30분)
  - 최대 재시도 횟수 제한 (3회)
  - 재시도 이력 추적
- **사용법**: 
  ```bash
  POST /api/messages/retry
  ```

### 4. 웹훅 관리 페이지
- **구현**: `app/[locale]/dashboard/webhooks/page.tsx`
- **기능**:
  - 웹훅 목록 표시
  - 웹훅 생성/삭제
  - 활성화/비활성화 토글
  - 웹훅 URL 복사
  - 사용 예시 표시

## 📋 데이터베이스 스키마 추가

### 웹훅 테이블
- `webhooks` - 웹훅 정보 저장
- `webhook_executions` - 웹훅 실행 이력
- `message_logs.metadata` - 재시도 메타데이터 (JSONB)

## 🎯 사용 예시

### 조건부 템플릿 예시
```typescript
// 템플릿 메시지
const template = {
  content: `{{if days_since_surgery > 7}}
회복이 잘 되고 계신가요? 후기를 남겨주시면 감사하겠습니다.
{{else}}
수술 후 첫날입니다. 충분히 휴식하시고 무리하지 마세요.
{{/if}}

예약 문의: {{phone_number}}`
};

// days_since_surgery = 10인 경우
// 결과: "회복이 잘 되고 계신가요? 후기를 남겨주시면 감사하겠습니다.\n\n예약 문의: 02-1234-5678"

// days_since_surgery = 3인 경우
// 결과: "수술 후 첫날입니다. 충분히 휴식하시고 무리하지 마세요.\n\n예약 문의: 02-1234-5678"
```

### 웹훅 사용 예시
```bash
# 웹훅 생성
POST /api/webhooks
{
  "name": "예약 시스템 연동",
  "workflow_id": "template-1"
}

# 웹훅 트리거
POST /api/webhooks/{webhook_id}
{
  "patient_id": "patient-uuid",
  "appointment_id": "appointment-uuid",
  "variables": {
    "custom_message": "특별 안내"
  }
}
```

## 🚀 다음 단계 제안

### Phase 2: 고급 워크플로우 기능
1. **시각적 워크플로우 빌더** (React Flow 사용)
   - 드래그 앤 드롭 노드
   - 노드 간 연결
   - 워크플로우 시각화

2. **필터링 노드**
   - 환자 세그먼테이션
   - 조건별 필터링

3. **지연/대기 노드**
   - 특정 시간 후 실행
   - 큐 시스템

### Phase 3: 통합 기능
4. **외부 API 통합**
   - Google Sheets 연동
   - Slack 알림
   - Discord 알림

5. **데이터 동기화**
   - 주기적 동기화
   - 실시간 동기화

## 💡 추가 아이디어

- **워크플로우 템플릿**: 자주 사용하는 워크플로우 저장
- **워크플로우 테스트 모드**: 실제 발송 없이 테스트
- **워크플로우 일시정지**: 특정 기간 동안 일시정지
- **워크플로우 버전 관리**: 변경 이력 추적

## 📊 구현 효과

- **자동화**: 외부 시스템과 자동 연동 가능
- **유연성**: 조건부 로직으로 맞춤형 메시지
- **안정성**: 재시도 로직으로 발송 성공률 향상
- **추적성**: 웹훅 실행 이력으로 디버깅 용이

