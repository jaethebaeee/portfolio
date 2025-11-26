# 🔌 API Reference Guide

Complete API documentation for 닥터스플로우 (DoctorsFlow) platform.

**Base URL**: `https://your-domain.com/api`

**Authentication**: All endpoints require Clerk authentication (except webhook triggers)

---

## 🔐 Authentication

All API routes use Clerk authentication. Include the session cookie in requests.

```typescript
// Next.js Server Component / API Route
import { auth } from '@clerk/nextjs/server';

const { userId } = await auth();
if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

---

## 📋 Workflows API

### List Workflows
```http
GET /api/workflows
```

**Response**:
```json
{
  "workflows": [
    {
      "id": "uuid",
      "user_id": "user_xxx",
      "name": "라식 수술 후 케어",
      "description": "시력 교정 수술 환자 케어",
      "trigger_type": "post_surgery",
      "target_surgery_type": "lasik",
      "steps": [
        {
          "day": 1,
          "type": "survey",
          "title": "통증 확인",
          "message_template": "안녕하세요 {{patient_name}}님..."
        }
      ],
      "visual_data": null,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Status**: ⚠️ **Missing Implementation** - Needs to be created

---

### Create Workflow
```http
POST /api/workflows
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "라식 수술 후 케어",
  "description": "시력 교정 수술 환자 케어",
  "trigger_type": "post_surgery",
  "target_surgery_type": "lasik",
  "steps": [
    {
      "day": 1,
      "type": "survey",
      "title": "통증 확인",
      "message_template": "안녕하세요 {{patient_name}}님, 수술 후 하루가 지났습니다."
    },
    {
      "day": 3,
      "type": "photo",
      "title": "충혈 상태 확인",
      "message_template": "{{patient_name}}님, 회복은 잘 되고 계신가요?"
    }
  ],
  "is_active": true
}
```

**Response**:
```json
{
  "workflow": {
    "id": "uuid",
    "user_id": "user_xxx",
    "name": "라식 수술 후 케어",
    ...
  }
}
```

**Status**: ⚠️ **Missing Implementation** - Needs to be created

---

### Get Workflow Execution History
```http
GET /api/workflows/executions?workflow_id=uuid&patient_id=uuid&status=completed
```

**Query Parameters**:
- `workflow_id` (optional) - Filter by workflow
- `patient_id` (optional) - Filter by patient
- `status` (optional) - `pending` | `running` | `completed` | `failed`
- `limit` (optional) - Default: 50
- `offset` (optional) - Default: 0

**Response**:
```json
{
  "executions": [
    {
      "id": "uuid",
      "workflow_id": "uuid",
      "patient_id": "uuid",
      "trigger_type": "schedule",
      "status": "completed",
      "current_step_index": 1,
      "steps_completed": 1,
      "total_steps": 2,
      "execution_data": {
        "days_passed": 1,
        "log": ["Executed node action-1"]
      },
      "started_at": "2024-01-01T10:00:00Z",
      "completed_at": "2024-01-01T10:00:05Z"
    }
  ],
  "total": 100
}
```

**Status**: ✅ **Implemented**

---

## 🔗 Webhooks API

### List Webhooks
```http
GET /api/webhooks
```

**Response**:
```json
{
  "webhooks": [
    {
      "id": "webhook_xxx",
      "user_id": "user_xxx",
      "name": "예약 시스템 연동",
      "workflow_id": "uuid",
      "url": "https://your-domain.com/api/webhooks/webhook_xxx",
      "enabled": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Status**: ✅ **Implemented**

---

### Create Webhook
```http
POST /api/webhooks
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "예약 시스템 연동",
  "workflow_id": "uuid",
  "enabled": true
}
```

**Response**:
```json
{
  "webhook": {
    "id": "webhook_xxx",
    "name": "예약 시스템 연동",
    "url": "https://your-domain.com/api/webhooks/webhook_xxx",
    "secret": "hex-secret-key",  // Save this securely!
    "enabled": true
  }
}
```

**Status**: ✅ **Implemented**

---

### Trigger Webhook (External)
```http
POST /api/webhooks/{webhook_id}
Content-Type: application/json
x-webhook-signature: HMAC-SHA256-signature
```

**Request Body**:
```json
{
  "patient_id": "uuid",
  "event": "appointment_created",
  "data": {
    "appointment_date": "2024-01-15",
    "surgery_type": "lasik"
  }
}
```

**Signature Calculation**:
```typescript
import crypto from 'crypto';

const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(JSON.stringify(payload))
  .digest('hex');
```

**Response**:
```json
{
  "success": true,
  "execution_id": "uuid",
  "message": "Workflow executed successfully"
}
```

**Status**: ✅ **Implemented**

---

### Get Webhook Executions
```http
GET /api/webhooks/executions?webhook_id=webhook_xxx&status=completed
```

**Query Parameters**:
- `webhook_id` (optional) - Filter by webhook
- `status` (optional) - `pending` | `running` | `completed` | `failed`
- `limit` (optional) - Default: 50
- `offset` (optional) - Default: 0

**Response**:
```json
{
  "executions": [
    {
      "id": "uuid",
      "webhook_id": "webhook_xxx",
      "status": "completed",
      "payload": { ... },
      "response": { ... },
      "execution_time_ms": 150,
      "created_at": "2024-01-01T10:00:00Z",
      "completed_at": "2024-01-01T10:00:00.150Z"
    }
  ]
}
```

**Status**: ✅ **Implemented**

---

## 👥 Patients API

### List Patients
```http
GET /api/patients?limit=50&offset=0&search=홍길동
```

**Query Parameters**:
- `limit` (optional) - Default: 50
- `offset` (optional) - Default: 0
- `search` (optional) - Search by name or phone

**Response**:
```json
{
  "patients": [
    {
      "id": "uuid",
      "name": "홍길동",
      "phone": "01012345678",
      "email": "hong@example.com",
      "birth_date": "1990-01-01",
      "gender": "male",
      "last_visit_date": "2024-01-01",
      "last_surgery_date": "2024-01-01",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100
}
```

**Status**: ✅ **Implemented**

---

### Create Patient
```http
POST /api/patients
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "홍길동",
  "phone": "01012345678",
  "email": "hong@example.com",
  "birth_date": "1990-01-01",
  "gender": "male"
}
```

**Response**:
```json
{
  "patient": {
    "id": "uuid",
    "name": "홍길동",
    ...
  }
}
```

**Status**: ✅ **Implemented**

---

### Get Patient
```http
GET /api/patients/{patient_id}
```

**Status**: ✅ **Implemented**

---

### Update Patient
```http
PATCH /api/patients/{patient_id}
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "홍길동",
  "phone": "01012345678",
  "last_visit_date": "2024-01-15"
}
```

**Status**: ✅ **Implemented**

---

### Delete Patient
```http
DELETE /api/patients/{patient_id}
```

**Status**: ✅ **Implemented**

---

## 📅 Appointments API

### List Appointments
```http
GET /api/appointments?status=completed&date_from=2024-01-01&date_to=2024-01-31
```

**Query Parameters**:
- `status` (optional) - `scheduled` | `completed` | `cancelled`
- `patient_id` (optional) - Filter by patient
- `date_from` (optional) - ISO date string
- `date_to` (optional) - ISO date string
- `limit` (optional) - Default: 50
- `offset` (optional) - Default: 0

**Response**:
```json
{
  "appointments": [
    {
      "id": "uuid",
      "patient_id": "uuid",
      "appointment_date": "2024-01-15",
      "appointment_time": "10:00",
      "type": "라식",
      "status": "completed",
      "surgery_type": "lasik",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Status**: ✅ **Implemented**

---

### Create Appointment
```http
POST /api/appointments
Content-Type: application/json
```

**Request Body**:
```json
{
  "patient_id": "uuid",
  "appointment_date": "2024-01-15",
  "appointment_time": "10:00",
  "type": "라식",
  "status": "scheduled",
  "surgery_type": "lasik"
}
```

**Status**: ✅ **Implemented**

---

## 📨 Messaging API

### Send Kakao Talk Message
```http
POST /api/kakao/send-message
Content-Type: application/json
```

**Request Body**:
```json
{
  "recipient_phone": "01012345678",
  "content": "안녕하세요, 예약 확인 메시지입니다."
}
```

**Response**:
```json
{
  "success": true,
  "message_id": "uuid",
  "channel": "kakao"
}
```

**Status**: ✅ **Implemented**

---

### Send SMS
```http
POST /api/nhn/send-sms
Content-Type: application/json
```

**Request Body**:
```json
{
  "recipient_phone": "01012345678",
  "content": "안녕하세요, 예약 확인 메시지입니다."
}
```

**Response**:
```json
{
  "success": true,
  "message_id": "uuid",
  "channel": "sms"
}
```

**Status**: ✅ **Implemented**

---

### Retry Failed Messages
```http
POST /api/messages/retry
Content-Type: application/json
```

**Request Body**:
```json
{
  "message_log_ids": ["uuid1", "uuid2"]
}
```

**Response**:
```json
{
  "success": true,
  "retried": 2,
  "failed": 0
}
```

**Status**: ✅ **Implemented**

---

## 📊 Message Logs API

### List Message Logs
```http
GET /api/message-logs?status=sent&channel=kakao&patient_id=uuid&limit=50
```

**Query Parameters**:
- `status` (optional) - `pending` | `sent` | `failed` | `delivered`
- `channel` (optional) - `kakao` | `sms`
- `patient_id` (optional) - Filter by patient
- `template_id` (optional) - Filter by template
- `campaign_id` (optional) - Filter by campaign
- `date_from` (optional) - ISO date string
- `date_to` (optional) - ISO date string
- `limit` (optional) - Default: 50
- `offset` (optional) - Default: 0

**Response**:
```json
{
  "logs": [
    {
      "id": "uuid",
      "patient_id": "uuid",
      "channel": "kakao",
      "recipient_phone": "01012345678",
      "message_content": "안녕하세요...",
      "status": "sent",
      "sent_at": "2024-01-01T10:00:00Z",
      "delivered_at": "2024-01-01T10:00:05Z",
      "metadata": {
        "workflow_id": "uuid",
        "step_index": 0
      }
    }
  ],
  "total": 100
}
```

**Status**: ✅ **Implemented**

---

### Get Message Statistics
```http
GET /api/message-logs/stats?date_from=2024-01-01&date_to=2024-01-31
```

**Query Parameters**:
- `date_from` (optional) - ISO date string
- `date_to` (optional) - ISO date string

**Response**:
```json
{
  "total": 1000,
  "sent": 950,
  "failed": 50,
  "delivered": 900,
  "by_channel": {
    "kakao": 600,
    "sms": 400
  },
  "by_status": {
    "sent": 950,
    "failed": 50,
    "delivered": 900
  }
}
```

**Status**: ✅ **Implemented**

---

## 🎯 Campaigns API

### List Campaigns
```http
GET /api/campaigns?status=running
```

**Query Parameters**:
- `status` (optional) - `draft` | `scheduled` | `running` | `completed` | `cancelled`
- `limit` (optional) - Default: 50
- `offset` (optional) - Default: 0

**Response**:
```json
{
  "campaigns": [
    {
      "id": "uuid",
      "name": "신년 할인 캠페인",
      "template_id": "uuid",
      "target_patients": ["uuid1", "uuid2"],
      "status": "running",
      "scheduled_at": "2024-01-01T10:00:00Z",
      "started_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

**Status**: ✅ **Implemented**

---

### Create Campaign
```http
POST /api/campaigns
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "신년 할인 캠페인",
  "description": "신년 맞이 할인 이벤트",
  "template_id": "uuid",
  "target_patients": ["uuid1", "uuid2"],
  "scheduled_at": "2024-01-01T10:00:00Z"
}
```

**Status**: ✅ **Implemented**

---

### Execute Campaign
```http
POST /api/campaigns/{campaign_id}/execute
```

**Response**:
```json
{
  "success": true,
  "sent_count": 100,
  "failed_count": 5,
  "errors": []
}
```

**Status**: ✅ **Implemented**

---

## 🤖 AI Marketing API

### Generate Marketing Content
```http
POST /api/groq/generate-marketing
Content-Type: application/json
```

**Request Body**:
```json
{
  "prompt": "라식 수술 환자에게 보낼 생일 축하 메시지",
  "count": 3
}
```

**Response**:
```json
{
  "success": true,
  "messages": [
    "안녕하세요! 생일을 진심으로 축하드립니다...",
    "생일 축하드립니다! 특별한 날을 기념하여...",
    "생일을 맞이하신 것을 축하드립니다..."
  ]
}
```

**Status**: ✅ **Implemented**

---

## ⏰ Cron API

### Trigger Daily Workflows
```http
GET /api/cron/trigger?key=CRON_SECRET
```

**Authentication**: Query parameter `key` or `Authorization: Bearer CRON_SECRET` header

**Response**:
```json
{
  "success": true,
  "processed_users": 10,
  "details": [
    {
      "userId": "user_xxx",
      "executionCount": 5,
      "logs": ["Executed: 홍길동 (Step 1)", ...]
    }
  ]
}
```

**Status**: ✅ **Implemented**

**Note**: This endpoint is called automatically by Vercel Cron. Manual calls require `CRON_SECRET`.

---

## 🚨 Error Responses

All endpoints return standard error responses:

```json
{
  "error": "Error message here"
}
```

**Status Codes**:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 📝 Rate Limits

Currently **no rate limiting** implemented. Recommended for production:
- API endpoints: 100 requests/minute per user
- Webhook endpoints: 1000 requests/hour per webhook
- Messaging endpoints: 100 messages/minute per user

---

## 🔒 Security Notes

1. **Authentication**: All endpoints require Clerk session (except webhooks)
2. **Webhook Signatures**: Always verify HMAC-SHA256 signature
3. **Cron Secret**: Never expose `CRON_SECRET` in client code
4. **Data Isolation**: All queries filter by `user_id` automatically
5. **Input Validation**: Validate all user inputs server-side

---

## 📚 Related Documentation

- `DEPLOYMENT_ARCHITECTURE_ANALYSIS.md` - Architecture overview
- `WORKFLOW_SYSTEM_QUICK_REFERENCE.md` - Workflow system details
- `BACKEND_ARCHITECTURE.md` - Backend architecture

---

**Last Updated**: 2024
**API Version**: 1.0

