# 🏗️ Deployment Architecture Analysis & Production Strategy

## Executive Summary

This is a **Next.js 15** healthcare workflow automation platform (닥터스플로우) that automates patient communication workflows using Kakao Talk and SMS APIs. The system is designed for **fast deployment** using serverless architecture with **Vercel** and **Supabase**.

---

## 🎯 Core Architecture

### Technology Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes (Serverless Functions)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Clerk (with Google/Kakao OAuth)
- **Messaging APIs**: Kakao Business Messaging, NHN Cloud SMS
- **AI**: Groq (Llama 3.1-70B) for marketing content generation
- **Deployment**: Vercel (with Cron Jobs)
- **UI**: Tailwind CSS + shadcn/ui + React Flow (for visual workflows)

### Architecture Flow
```
┌─────────────────┐
│   Next.js App   │ (Client + API Routes)
└────────┬────────┘
         │
         ├──► Clerk Auth ──────────► User Session
         │
         ├──► Supabase ────────────► PostgreSQL Database
         │
         ├──► Vercel Cron ─────────► /api/cron/trigger
         │                            └─► executeDailyWorkflows()
         │
         ├──► Webhook Endpoints ───► /api/webhooks/[id]
         │                            └─► External Triggers
         │
         └──► Messaging APIs ──────► Kakao Talk / SMS
                                      └─► Smart Failover Logic
```

---

## 📊 Database Schema (Supabase)

### Core Tables

#### 1. **patients**
- Stores patient information (name, phone, email, birth_date, gender)
- Tracks `last_visit_date`, `last_surgery_date`
- Multi-tenant: `user_id` (Clerk ID) for isolation

#### 2. **appointments**
- Links to `patients` via `patient_id`
- Tracks `appointment_date`, `appointment_time`, `status`
- Includes `surgery_type` for workflow targeting
- Status: `scheduled`, `completed`, `cancelled`

#### 3. **workflows**
- **Two Types**:
  - **Legacy Linear**: `steps[]` array with day-based triggers
  - **Visual Workflow**: `visual_data` JSONB with React Flow nodes/edges
- `trigger_type`: `post_surgery` (main), `webhook`, `schedule`
- `target_surgery_type`: Optional filter for specific surgeries
- `is_active`: Enable/disable toggle

#### 4. **workflow_executions**
- Tracks every workflow run
- `status`: `pending`, `running`, `completed`, `failed`
- `execution_data` JSONB: Context variables, logs, metadata
- Links to `workflow_id`, `patient_id`

#### 5. **message_logs**
- All sent messages (Kakao/SMS)
- `status`: `pending`, `sent`, `failed`, `delivered`
- `metadata` JSONB: Links to workflows, campaigns, execution IDs
- Tracks `sent_at`, `delivered_at`, `error_message`

#### 6. **webhooks**
- External trigger endpoints
- `secret`: HMAC-SHA256 signature verification
- `url`: Auto-generated endpoint `/api/webhooks/{id}`
- Links to `workflow_id` (optional)

#### 7. **webhook_executions**
- Audit trail for webhook calls
- Stores `payload`, `response`, `execution_time_ms`

#### 8. **templates** (Legacy Marketing Templates)
- Time-based triggers (`trigger_type`, `trigger_value`, `trigger_unit`)
- `messages` JSONB: Array of TemplateMessage objects

#### 9. **campaigns**
- Batch message campaigns
- `target_patients` JSONB: Array of patient IDs
- `status`: `draft`, `scheduled`, `running`, `completed`, `cancelled`

### Key Indexes
```sql
-- Performance-critical indexes
idx_patients_user_id
idx_appointments_user_id + appointment_date
idx_message_logs_user_id + status + created_at
idx_workflow_executions_user_id + workflow_id + status
idx_webhooks_user_id + enabled
```

---

## 🔄 Workflow Execution System

### Two Execution Engines

#### 1. **Legacy Linear Workflow** (`lib/workflow-execution.ts`)
- Simple day-based steps: `[{day: 1, type: 'survey'}, {day: 3, type: 'photo'}]`
- Execution: Daily cron checks `daysPassed` since surgery
- Matches `workflow.steps[].day === daysPassed`

#### 2. **Visual Workflow Engine** (`lib/visual-workflow-engine.ts`)
- React Flow graph-based: nodes (trigger, action, delay, condition) + edges
- Graph traversal: BFS from trigger node, calculates execution plan
- Supports delays, conditions, branching
- More flexible but more complex

### Execution Flow

```
Daily Cron (10:00 AM UTC)
  ↓
GET /api/cron/trigger?key=CRON_SECRET
  ↓
executeDailyWorkflows(userId)
  ├─► Fetch active workflows (trigger_type='post_surgery')
  ├─► Fetch completed appointments (last 30 days)
  ├─► For each appointment:
  │   ├─► Calculate daysPassed = today - appointment_date
  │   ├─► Check if visual_data exists → Visual Engine
  │   └─► Else → Legacy Linear Engine
  │       ├─► Find step where step.day === daysPassed
  │       ├─► Check if already executed (message_logs metadata)
  │       ├─► Create workflow_execution record
  │       ├─► Execute action (sendSmartMessage)
  │       └─► Update execution status
  └─► Return execution summary
```

### Smart Messaging (`lib/smart-messaging.ts`)
- **Failover Logic**: Kakao → SMS (automatic fallback)
- Tries Kakao Talk first
- On failure, automatically sends SMS
- Logs both attempts in `message_logs`

---

## 🚀 API Endpoints Structure

### Core APIs

#### **Workflow Management**
- `GET /api/workflows` - List workflows (missing - needs implementation)
- `POST /api/workflows` - Create workflow (missing)
- `GET /api/workflows/[id]` - Get workflow (missing)
- `PATCH /api/workflows/[id]` - Update workflow (missing)
- `DELETE /api/workflows/[id]` - Delete workflow (missing)
- `GET /api/workflows/executions` - Execution history

#### **Webhook APIs** ✅
- `GET /api/webhooks` - List webhooks
- `POST /api/webhooks` - Create webhook
- `POST /api/webhooks/[id]` - Trigger webhook (external)
- `GET /api/webhooks/executions` - Execution history

#### **Cron Trigger** ✅
- `GET /api/cron/trigger?key=SECRET` - Daily workflow execution
- Scheduled via `vercel.json`: `0 10 * * *` (10 AM UTC daily)

#### **Messaging APIs** ✅
- `POST /api/kakao/send-message` - Send Kakao Talk
- `POST /api/nhn/send-sms` - Send SMS
- `POST /api/messages/retry` - Retry failed messages

#### **Patient Management** ✅
- `GET /api/patients` - List patients
- `POST /api/patients` - Create patient
- `GET /api/patients/[id]` - Get patient
- `PATCH /api/patients/[id]` - Update patient
- `DELETE /api/patients/[id]` - Delete patient

#### **Campaign APIs** ✅
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `POST /api/campaigns/[id]/execute` - Execute campaign

#### **Message Logs** ✅
- `GET /api/message-logs` - List logs (with filters)
- `GET /api/message-logs/stats` - Statistics

---

## 🔐 Security & Authentication

### Clerk Integration
- All API routes use `auth()` from `@clerk/nextjs/server`
- Returns `401` if not authenticated
- `user_id` extracted from Clerk session

### Data Isolation
- All queries filter by `user_id`
- Supabase RLS policies (though bypassed server-side with Service Role)
- Application-level isolation enforced

### Webhook Security
- HMAC-SHA256 signature verification
- Secret stored in database, never exposed
- Signature in header: `x-webhook-signature`

### Cron Security
- `CRON_SECRET` environment variable
- Query param: `?key=SECRET` or Header: `Authorization: Bearer SECRET`
- Dev fallback: `demo-secret` (development only)

---

## 📦 Deployment Strategy (Fastest Path)

### 1. **Vercel Deployment** (Recommended)

#### Prerequisites
```bash
# Environment Variables (.env.local → Vercel Dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Messaging APIs
KAKAO_REST_API_KEY=
NHN_SMS_APP_KEY=
NHN_SMS_SECRET_KEY=
NHN_SMS_SENDER_PHONE=

# Cron
CRON_SECRET=your-random-secret-here

# Groq AI
GROQ_API_KEY=

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

#### Deployment Steps
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Link project
vercel

# 3. Set environment variables (via dashboard or CLI)
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

# 4. Deploy
vercel --prod

# 5. Configure Cron Job (already in vercel.json)
# Vercel automatically schedules /api/cron/trigger
```

#### Vercel Cron Configuration (`vercel.json`)
```json
{
  "crons": [{
    "path": "/api/cron/trigger?key=YOUR_CRON_SECRET",
    "schedule": "0 10 * * *"  // 10 AM UTC daily
  }]
}
```

### 2. **Database Setup (Supabase)**

#### Migration Steps
```bash
# 1. Install Supabase CLI
npm install -g supabase

# 2. Link project
supabase link --project-ref your-project-ref

# 3. Run migrations
supabase db push

# Or manually run SQL files in Supabase Dashboard → SQL Editor
# Order: 001_initial_schema.sql → 002_webhooks_and_retry.sql → ... → 006_workflow_executions.sql
```

#### Required Migrations (in order)
1. `001_initial_schema.sql` - Core tables (patients, appointments, templates, campaigns, message_logs)
2. `002_webhooks_and_retry.sql` - Webhooks + message_logs metadata
3. `002_happy_call_schema.sql` - Workflows table
4. `003_event_crm.sql` - Event campaigns
4. `004_surgery_types.sql` - Surgery type enum
5. `005_consultation_crm.sql` - Consultation tracking
6. `006_workflow_executions.sql` - Execution tracking
6. `006_patient_photos.sql` - Photo uploads

### 3. **External Cron Alternative** (If Vercel Cron unavailable)

Use **cron-job.org** or **EasyCron**:
- URL: `https://your-domain.com/api/cron/trigger?key=YOUR_SECRET`
- Schedule: Daily at 10:00 AM UTC
- Method: GET

---

## ⚡ Performance Optimizations

### Database Queries
- ✅ Indexes on `user_id`, `status`, `created_at`
- ✅ GIN index on `metadata` JSONB for fast lookups
- ⚠️ **Optimization Needed**: `executeDailyWorkflows` queries last 30 days - consider date range optimization

### API Response Times
- Serverless functions: Cold start ~100-300ms
- Database queries: <50ms (with indexes)
- External APIs: Kakao (~200ms), SMS (~300ms)

### Caching Strategy (Future)
- Cache workflow definitions (Redis/Vercel KV)
- Cache patient data (short TTL)
- Cache API tokens (Kakao/NHN) - already implemented

---

## 🐛 Known Issues & Missing Features

### Missing API Endpoints
- ❌ `GET /api/workflows` - List workflows
- ❌ `POST /api/workflows` - Create workflow
- ❌ `PATCH /api/workflows/[id]` - Update workflow
- ❌ `DELETE /api/workflows/[id]` - Delete workflow

### Potential Issues
1. **Race Conditions**: Multiple cron runs could trigger duplicate messages
   - **Fix**: Use database locks or idempotency keys
2. **Error Handling**: Some API routes lack comprehensive error handling
3. **Rate Limiting**: No rate limiting on public endpoints
4. **Webhook Retry**: No automatic retry for failed webhook executions

### Recommended Improvements
1. **Queue System**: Use Vercel Queue or BullMQ for async message sending
2. **Monitoring**: Add Sentry or similar for error tracking
3. **Logging**: Structured logging (Winston/Pino)
4. **Testing**: Unit tests for workflow execution logic

---

## 📈 Scaling Considerations

### Current Limits
- **Vercel**: 100GB bandwidth/month (Hobby), unlimited (Pro)
- **Supabase**: 500MB database (Free), 8GB (Pro)
- **Serverless Functions**: 10s timeout (Hobby), 60s (Pro)

### Scaling Strategy
1. **Database**: Upgrade Supabase plan for larger datasets
2. **Cron Jobs**: Consider separate worker service for heavy workloads
3. **Message Queue**: Use Vercel Queue or external queue (BullMQ + Redis)
4. **CDN**: Static assets already cached via Vercel Edge Network

---

## 🔍 Monitoring & Debugging

### Key Metrics to Track
1. **Workflow Execution**: Success rate, execution time
2. **Message Delivery**: Kakao vs SMS fallback rate
3. **API Performance**: Response times, error rates
4. **Database**: Query performance, connection pool usage

### Debugging Tools
- **Vercel Logs**: `vercel logs`
- **Supabase Logs**: Dashboard → Logs
- **Clerk Dashboard**: User sessions, auth events
- **Message Logs**: `/api/message-logs` endpoint

### Health Check Endpoint (Recommended)
```typescript
// app/api/health/route.ts
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkSupabase(),
      kakao: await checkKakaoAPI(),
      sms: await checkSMSAPI()
    }
  });
}
```

---

## 🎯 Fastest Deployment Checklist

### Pre-Deployment
- [ ] Set all environment variables in Vercel
- [ ] Run all Supabase migrations
- [ ] Test Clerk authentication locally
- [ ] Verify API keys (Kakao, NHN, Groq)
- [ ] Set `CRON_SECRET` to random value
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain

### Deployment
- [ ] Deploy to Vercel: `vercel --prod`
- [ ] Verify cron job is scheduled (Vercel Dashboard → Cron Jobs)
- [ ] Test webhook endpoint: `POST /api/webhooks/[id]`
- [ ] Test manual workflow execution
- [ ] Monitor first cron run (next day at 10 AM UTC)

### Post-Deployment
- [ ] Check Vercel logs for errors
- [ ] Verify database connections
- [ ] Test patient creation flow
- [ ] Test message sending (Kakao + SMS)
- [ ] Monitor workflow execution logs

---

## 📚 Key Files Reference

### Core Workflow Files
- `lib/workflow-execution.ts` - Daily workflow executor
- `lib/visual-workflow-engine.ts` - Visual workflow engine
- `lib/workflows.ts` - Workflow CRUD operations
- `lib/smart-messaging.ts` - Message sending with failover

### API Routes
- `app/api/cron/trigger/route.ts` - Cron endpoint
- `app/api/webhooks/[id]/route.ts` - Webhook trigger
- `app/api/workflows/executions/route.ts` - Execution history

### Database
- `lib/database.types.ts` - TypeScript types
- `lib/supabase.ts` - Supabase client
- `supabase/migrations/*.sql` - Schema migrations

### Configuration
- `vercel.json` - Cron job configuration
- `next.config.ts` - Next.js config
- `.env.local` - Environment variables (not committed)

---

## 🚨 Critical Deployment Notes

1. **Cron Secret**: Must be strong random string, never commit to Git
2. **Database Migrations**: Run in order, test in staging first
3. **API Rate Limits**: Monitor Kakao/NHN API usage
4. **Error Handling**: Set up alerts for failed workflow executions
5. **Backup Strategy**: Supabase automatic backups (Pro plan)

---

## 📞 Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Clerk Docs**: https://clerk.com/docs
- **Kakao API**: https://developers.kakao.com/docs
- **NHN SMS API**: https://docs.nhncloud.com/en/Notification/SMS/ko/api-guide/

---

**Last Updated**: 2024
**Architecture Version**: 1.0
**Deployment Target**: Production-ready (with noted improvements)

