# 🚀 Quick Start Deployment Guide

**Fastest path to production deployment** for 닥터스플로우 (DoctorsFlow).

---

## ⚡ 5-Minute Deployment Checklist

### Step 1: Environment Setup (2 minutes)

Create `.env.local` file:
```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# Messaging APIs
KAKAO_REST_API_KEY=xxx
NHN_SMS_APP_KEY=xxx
NHN_SMS_SECRET_KEY=xxx
NHN_SMS_SENDER_PHONE=01012345678

# Cron Job
CRON_SECRET=$(openssl rand -hex 32)

# Groq AI (Optional)
GROQ_API_KEY=xxx

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Step 2: Database Setup (2 minutes)

**Option A: Supabase Dashboard**
1. Go to Supabase Dashboard → SQL Editor
2. Run migrations in order:
   - `001_initial_schema.sql`
   - `002_webhooks_and_retry.sql`
   - `002_happy_call_schema.sql`
   - `003_event_crm.sql`
   - `004_surgery_types.sql`
   - `005_consultation_crm.sql`
   - `006_workflow_executions.sql`
   - `006_patient_photos.sql`

**Option B: Supabase CLI**
```bash
supabase link --project-ref your-project-ref
supabase db push
```

### Step 3: Deploy to Vercel (1 minute)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables (via dashboard)
# Go to: Vercel Dashboard → Project → Settings → Environment Variables
# Copy all variables from .env.local
```

### Step 4: Verify Deployment

1. **Check Health**: Visit `https://your-domain.com`
2. **Test Auth**: Try logging in
3. **Test API**: `curl https://your-domain.com/api/patients`
4. **Check Cron**: Verify cron job in Vercel Dashboard → Cron Jobs

---

## 🎯 Core Features Overview

### ✅ Implemented & Ready

1. **Patient Management** - CRUD operations
2. **Appointment Tracking** - Schedule and track appointments
3. **Workflow Automation** - Post-surgery follow-ups
4. **Webhook Integration** - External system triggers
5. **Message Sending** - Kakao Talk + SMS with failover
6. **Campaign Management** - Batch messaging campaigns
7. **Message Logs** - Full audit trail
8. **AI Content Generation** - Groq-powered marketing messages

### ⚠️ Missing (Needs Implementation)

1. **Workflow CRUD APIs** - `GET/POST/PATCH/DELETE /api/workflows`
2. **Rate Limiting** - API rate limits
3. **Health Check Endpoint** - `/api/health`
4. **Monitoring** - Error tracking (Sentry)

---

## 📊 Architecture Summary

```
┌─────────────────────────────────────────┐
│         Next.js 15 (Vercel)             │
│  ┌──────────────┐  ┌──────────────┐   │
│  │   Frontend    │  │  API Routes   │   │
│  │  (React 19)   │  │ (Serverless)  │   │
│  └──────┬───────┘  └──────┬────────┘   │
└─────────┼──────────────────┼────────────┘
          │                  │
          ├──► Clerk Auth    ├──► Supabase DB
          │                  │
          ├──► Kakao API     ├──► NHN SMS API
          │                  │
          └──► Vercel Cron   └──► Groq AI
```

---

## 🔄 Workflow Execution Flow

```
Daily Cron (10 AM UTC)
  ↓
GET /api/cron/trigger?key=SECRET
  ↓
executeDailyWorkflows(userId)
  ├─► Get active workflows
  ├─► Get completed appointments (last 30 days)
  ├─► Calculate daysPassed since surgery
  ├─► Execute matching workflow steps
  └─► Send messages (Kakao → SMS failover)
```

---

## 🔗 Key API Endpoints

### Workflows
- `GET /api/workflows` ⚠️ Missing
- `POST /api/workflows` ⚠️ Missing
- `GET /api/workflows/executions` ✅

### Webhooks
- `GET /api/webhooks` ✅
- `POST /api/webhooks` ✅
- `POST /api/webhooks/{id}` ✅ (External trigger)

### Patients
- `GET /api/patients` ✅
- `POST /api/patients` ✅
- `GET /api/patients/{id}` ✅
- `PATCH /api/patients/{id}` ✅
- `DELETE /api/patients/{id}` ✅

### Messaging
- `POST /api/kakao/send-message` ✅
- `POST /api/nhn/send-sms` ✅
- `POST /api/messages/retry` ✅

### Logs
- `GET /api/message-logs` ✅
- `GET /api/message-logs/stats` ✅

---

## 🗄️ Database Schema Highlights

### Core Tables
- `patients` - Patient information
- `appointments` - Appointment tracking
- `workflows` - Workflow definitions (linear + visual)
- `workflow_executions` - Execution tracking
- `message_logs` - Message audit trail
- `webhooks` - Webhook configurations
- `webhook_executions` - Webhook audit trail
- `campaigns` - Marketing campaigns
- `templates` - Legacy marketing templates

### Key Relationships
```
patients ← appointments ← workflows
                ↓
         workflow_executions
                ↓
         message_logs
```

---

## 🔐 Security Checklist

- [x] Clerk authentication on all API routes
- [x] User data isolation (`user_id` filtering)
- [x] Webhook signature verification (HMAC-SHA256)
- [x] Cron secret protection
- [ ] Rate limiting (TODO)
- [ ] Input validation (partial)

---

## 📈 Performance Notes

### Current Limits
- **Vercel Hobby**: 100GB bandwidth/month, 10s function timeout
- **Supabase Free**: 500MB database, 2GB bandwidth/month
- **Serverless Cold Start**: ~100-300ms

### Optimization Tips
1. **Database**: Use indexes (already implemented)
2. **Caching**: Cache API tokens (already implemented)
3. **Queue**: Consider Vercel Queue for async processing
4. **CDN**: Static assets cached via Vercel Edge

---

## 🐛 Common Issues & Solutions

### Issue: Cron Job Not Running
**Solution**: 
1. Check `vercel.json` cron configuration
2. Verify `CRON_SECRET` is set
3. Check Vercel Dashboard → Cron Jobs

### Issue: Database Connection Failed
**Solution**:
1. Verify Supabase environment variables
2. Check Supabase project status
3. Verify RLS policies (if using client-side)

### Issue: Messages Not Sending
**Solution**:
1. Check Kakao/NHN API keys
2. Verify phone number format
3. Check message_logs for error messages

### Issue: Workflow Not Executing
**Solution**:
1. Verify `is_active = true`
2. Check `trigger_type = 'post_surgery'`
3. Verify appointments are `status = 'completed'`
4. Check `daysPassed` matches workflow step days

---

## 📚 Documentation Files

1. **DEPLOYMENT_ARCHITECTURE_ANALYSIS.md** - Complete architecture overview
2. **WORKFLOW_SYSTEM_QUICK_REFERENCE.md** - Workflow system details
3. **API_REFERENCE.md** - Complete API documentation
4. **BACKEND_ARCHITECTURE.md** - Backend architecture details

---

## 🎯 Next Steps After Deployment

1. **Create Test Workflow**: Set up a test workflow with a test patient
2. **Monitor First Cron Run**: Check logs after first daily execution
3. **Set Up Alerts**: Configure error notifications
4. **Test Webhook**: Create a webhook and test external trigger
5. **Load Test**: Test with multiple patients and workflows

---

## 🚨 Production Checklist

### Pre-Launch
- [ ] All environment variables set
- [ ] Database migrations completed
- [ ] Cron job scheduled and tested
- [ ] API keys verified (Kakao, NHN, Groq)
- [ ] Error monitoring set up (Sentry recommended)
- [ ] Backup strategy configured

### Post-Launch
- [ ] Monitor first cron execution
- [ ] Check error logs daily
- [ ] Monitor API usage (rate limits)
- [ ] Track message delivery rates
- [ ] Review workflow execution logs

---

## 📞 Support Resources

- **Vercel**: https://vercel.com/docs
- **Supabase**: https://supabase.com/docs
- **Clerk**: https://clerk.com/docs
- **Kakao API**: https://developers.kakao.com/docs
- **NHN SMS**: https://docs.nhncloud.com/en/Notification/SMS/ko/api-guide/

---

## 💡 Pro Tips

1. **Use Vercel Pro** for production (60s timeout, better performance)
2. **Set up Supabase Pro** for larger datasets and backups
3. **Monitor API costs** - Kakao/SMS APIs charge per message
4. **Test failover** - Verify SMS fallback works when Kakao fails
5. **Document workflows** - Keep workflow logic documented

---

**Ready to deploy?** Follow the 5-minute checklist above! 🚀

**Last Updated**: 2024

