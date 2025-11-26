# 템플릿 실행 엔진 가이드

템플릿 실행 엔진은 마케팅 템플릿을 실제로 실행하여 메시지를 발송하는 핵심 시스템입니다.

## 주요 기능

### 1. 변수 치환
템플릿 메시지의 `{{variable}}` 형식 변수를 실제 값으로 치환합니다.

**지원되는 변수:**
- `{{patient_name}}` - 환자 이름
- `{{patient_phone}}` - 환자 전화번호
- `{{patient_email}}` - 환자 이메일
- `{{appointment_date}}` - 예약 날짜 (예: 2024년 1월 15일)
- `{{appointment_time}}` - 예약 시간 (예: 14:30)
- `{{appointment_type}}` - 예약 유형
- `{{days_since_surgery}}` - 수술 후 경과 일수
- `{{days_until_birthday}}` - 생일까지 남은 일수
- `{{months_since_last_visit}}` - 마지막 방문 후 경과 개월수
- `{{coupon_code}}` - 쿠폰 코드 (자동 생성)
- `{{coupon_expiry}}` - 쿠폰 만료일
- `{{phone_number}}` - 병원 전화번호
- `{{booking_link}}` - 예약 링크
- `{{review_link}}` - 후기 작성 링크
- `{{naver_review_link}}` - Naver 리뷰 링크

### 2. 템플릿 실행
템플릿의 모든 메시지를 순차적으로 실행하고 결과를 반환합니다.

### 3. 트리거 조건 확인
템플릿의 트리거 조건을 확인하여 실행 여부를 결정합니다.

## API 사용법

### 템플릿 실행

```typescript
POST /api/templates/execute

{
  "template": {
    "id": "template-1",
    "name": "예약 완료 리마인더",
    "messages": [...],
    "enabled": true,
    ...
  },
  "patientId": "patient-uuid",
  "appointmentId": "appointment-uuid", // 선택사항
  "customVariables": { // 선택사항
    "custom_var": "value"
  }
}
```

**응답:**
```json
{
  "success": true,
  "sentCount": 2,
  "failedCount": 0,
  "errors": []
}
```

### 스케줄러 실행

```typescript
POST /api/templates/schedule

// 모든 템플릿 실행
{}

// 특정 트리거 타입만 실행
{
  "triggerType": "days_after_surgery"
}
```

**응답:**
```json
{
  "processed": 10,
  "executed": 3,
  "errors": []
}
```

## 트리거 타입별 동작

### 1. `appointment_completed`
- **조건**: 예약이 완료되었을 때
- **사용**: 예약 생성 API에서 직접 호출

### 2. `days_after_surgery`
- **조건**: 수술 후 정확히 N일째
- **예시**: `value: 3` → 수술 후 정확히 3일째

### 3. `days_before_birthday`
- **조건**: 생일 N일 전
- **예시**: `value: 3` → 생일 3일 전

### 4. `months_since_last_visit`
- **조건**: 마지막 방문 후 N개월 이상 경과
- **예시**: `value: 3` → 3개월 이상 미방문

### 5. `review_request`
- **조건**: 수동 실행 또는 별도 로직 필요
- **사용**: 수동으로 실행하거나 특정 이벤트 후 실행

## 코드 예시

### 직접 템플릿 실행

```typescript
import { executeTemplate, TemplateVariableContext } from '@/lib/template-engine';
import { MarketingTemplate } from '@/lib/template-types';

const context: TemplateVariableContext = {
  patient: {
    id: 'patient-1',
    name: '홍길동',
    phone: '010-1234-5678',
    birth_date: '1990-01-15',
    ...
  },
  appointment: {
    id: 'appointment-1',
    appointment_date: '2024-01-20',
    appointment_time: '14:30',
    ...
  },
};

const result = await executeTemplate(
  userId,
  template,
  context,
  patient.id
);
```

### 변수 치환만 수행

```typescript
import { generateTemplateVariables, replaceTemplateVariables } from '@/lib/template-engine';

const variables = generateTemplateVariables({
  patient: patientData,
  appointment: appointmentData,
});

const content = '안녕하세요 {{patient_name}}님! 예약일시는 {{appointment_date}} {{appointment_time}}입니다.';
const replaced = replaceTemplateVariables(content, variables);
// 결과: "안녕하세요 홍길동님! 예약일시는 2024년 1월 20일 14:30입니다."
```

## 스케줄러 설정

실제 프로덕션 환경에서는 cron job이나 별도의 백그라운드 서비스를 사용해야 합니다.

### Vercel Cron Jobs 예시

`vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/templates/schedule",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### Node.js Cron 예시

```typescript
import cron from 'node-cron';

// 매일 오전 9시에 실행
cron.schedule('0 9 * * *', async () => {
  // 모든 사용자에 대해 스케줄러 실행
  for (const userId of userIds) {
    await runScheduler(userId);
  }
});
```

## 주의사항

1. **발송 이력**: 모든 메시지 발송은 자동으로 이력에 기록됩니다.
2. **에러 처리**: 발송 실패 시에도 이력이 기록되며, 에러 메시지가 포함됩니다.
3. **Rate Limiting**: API 호출 시 rate limiting이 적용됩니다.
4. **환경 변수**: Kakao 및 NHN SMS API 키가 설정되어 있어야 합니다.

## 향후 개선 사항

1. **배치 발송**: 여러 환자에게 동시 발송
2. **재시도 로직**: 실패한 발송 자동 재시도
3. **발송 시간 최적화**: 환자별 선호 시간대 고려
4. **A/B 테스트**: 여러 버전의 메시지 테스트

