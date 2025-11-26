# 백엔드 아키텍처 문서

닥터스플로우 프로젝트의 백엔드 인프라 및 데이터 흐름에 대한 문서입니다.

## 🏗️ 아키텍처 개요

```
┌─────────────┐
│   Client    │ (Next.js App Router)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ API Routes  │ (/app/api/*)
└──────┬──────┘
       │
       ├──► Clerk Auth (인증)
       ├──► Supabase (데이터베이스)
       ├──► Kakao API (카카오톡 발송)
       ├──► NHN SMS API (SMS 발송)
       └──► Groq API (AI 문구 생성)
```

## 🔐 인증 시스템

### Clerk
- **역할**: 사용자 인증 및 세션 관리
- **통합**: Next.js 미들웨어를 통한 자동 인증
- **소셜 로그인**: Google, Kakao 지원
- **사용 위치**: 모든 API 라우트에서 `auth()` 함수로 사용자 확인

### Supabase RLS
- **현재 상태**: RLS 정책이 설정되어 있으나, Clerk를 사용하므로 서버 사이드에서는 Service Role Key로 RLS 우회
- **보안**: 애플리케이션 레벨에서 `user_id` 필터링으로 데이터 격리

## 💾 데이터베이스 구조

### 테이블

1. **patients** - 환자 정보
   - `id` (UUID, PK)
   - `user_id` (TEXT) - Clerk user ID
   - `name`, `phone`, `email`, `birth_date`, `gender`
   - `last_visit_date`, `last_surgery_date`
   - `notes`, `created_at`, `updated_at`

2. **appointments** - 예약 정보
   - `id` (UUID, PK)
   - `user_id` (TEXT)
   - `patient_id` (UUID, FK → patients)
   - `appointment_date`, `appointment_time`
   - `type`, `status`, `notes`
   - `created_at`, `updated_at`

3. **templates** - 마케팅 템플릿
   - `id` (UUID, PK)
   - `user_id` (TEXT)
   - `name`, `description`
   - `trigger_type`, `trigger_value`, `trigger_unit`
   - `messages` (JSONB) - TemplateMessage[] 배열
   - `enabled`, `created_at`, `updated_at`

4. **campaigns** - 캠페인
   - `id` (UUID, PK)
   - `user_id` (TEXT)
   - `name`, `description`
   - `template_id` (UUID, FK → templates)
   - `target_patients` (JSONB) - UUID 배열
   - `scheduled_at`, `status`
   - `started_at`, `completed_at`
   - `created_at`, `updated_at`

5. **message_logs** - 발송 이력
   - `id` (UUID, PK)
   - `user_id` (TEXT)
   - `patient_id` (UUID, FK → patients, nullable)
   - `template_id` (UUID, FK → templates, nullable)
   - `campaign_id` (UUID, FK → campaigns, nullable)
   - `channel` ('kakao' | 'sms')
   - `recipient_phone`, `message_content`
   - `status` ('pending' | 'sent' | 'failed' | 'delivered')
   - `error_message`, `sent_at`, `delivered_at`
   - `created_at`

## 🔄 데이터 흐름

### 1. 환자 생성
```
Client → POST /api/patients
  → Clerk Auth 확인
  → createPatient(userId, input)
  → Supabase INSERT
  → Response
```

### 2. 메시지 발송
```
Client → POST /api/kakao/send-message
  → Clerk Auth 확인
  → createMessageLog() [pending]
  → sendTestMessage() [Kakao API]
  → updateMessageLogStatus() [sent/failed]
  → Response
```

### 3. 발송 이력 조회
```
Client → GET /api/message-logs
  → Clerk Auth 확인
  → getMessageLogs(userId, filters)
  → Supabase SELECT (user_id 필터링)
  → Response
```

## 🔌 API 엔드포인트

### 환자 관리
- `GET /api/patients` - 환자 목록 조회
- `POST /api/patients` - 환자 생성
- `GET /api/patients/[id]` - 환자 단일 조회
- `PATCH /api/patients/[id]` - 환자 업데이트
- `DELETE /api/patients/[id]` - 환자 삭제

### 발송 이력
- `GET /api/message-logs` - 발송 이력 조회 (필터링 지원)
- `GET /api/message-logs/stats` - 발송 통계

### 메시지 발송
- `POST /api/kakao/send-message` - 카카오톡 발송
- `POST /api/nhn/send-sms` - SMS 발송

### AI 문구 생성
- `POST /api/groq/generate-marketing` - 마케팅 문구 생성

## 🛡️ 보안 고려사항

1. **인증**: 모든 API 라우트에서 Clerk `auth()` 확인
2. **데이터 격리**: `user_id` 필드로 사용자별 데이터 분리
3. **환경 변수**: 민감한 키는 서버 사이드에서만 사용
4. **에러 처리**: 상세한 에러 메시지는 프로덕션에서 숨김

## 📊 성능 최적화

1. **인덱스**: 자주 조회되는 필드에 인덱스 생성
   - `user_id`, `phone`, `status`, `created_at` 등
2. **페이지네이션**: 발송 이력 조회 시 `limit`/`offset` 지원
3. **비동기 처리**: 발송 이력 저장은 실패해도 메시지 발송은 계속 진행

## 🔮 향후 개선 사항

1. **템플릿 실행 엔진**: 스케줄러를 통한 자동 발송
2. **변수 치환**: 템플릿의 `{{variable}}` 치환 로직
3. **배치 발송**: 여러 환자에게 동시 발송
4. **재시도 로직**: 실패한 발송 자동 재시도
5. **웹훅**: 발송 완료/실패 알림

## 📝 참고

- Supabase는 선택적입니다. 환경 변수가 없어도 애플리케이션은 작동하지만, 데이터베이스 기능은 사용할 수 없습니다.
- 개발 환경에서는 실제 API 호출 대신 모의 응답을 반환할 수 있습니다.

