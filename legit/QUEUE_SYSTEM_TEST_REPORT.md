# Queue System Test Report

**Date:** December 2024  
**Status:** ✅ System Ready for Testing

---

## ✅ Test Data Created

### Patient
- **ID:** `bed5d447-125b-4f6d-bb5b-0c0211770a4b`
- **Name:** 테스트 환자
- **Phone:** 010-1234-5678
- **Email:** test@example.com

### Appointment
- **ID:** `bdc92522-405b-4b64-86bc-04510776adcc`
- **Patient ID:** `bed5d447-125b-4f6d-bb5b-0c0211770a4b`
- **Date:** 2025-11-26
- **Time:** 10:00:00
- **Type:** 라식
- **Status:** completed ✅

---

## ✅ Database Structure Verified

### workflow_jobs Table
The table has all required columns:
- ✅ `id` (text, primary key)
- ✅ `workflow_id` (uuid)
- ✅ `patient_id` (uuid)
- ✅ `appointment_id` (uuid)
- ✅ `job_data` (jsonb)
- ✅ `execution_context` (jsonb)
- ✅ `delay_config` (jsonb)
- ✅ `status` (text)
- ✅ `scheduled_for` (timestamp with time zone) ⭐ **Key for delayed jobs**
- ✅ `retry_count`, `max_retries`
- ✅ `created_at`, `updated_at`, `completed_at`

### workflow_executions Table
- ✅ Table exists and ready to record execution results

---

## ✅ Cron Configuration Verified

### vercel.json
```json
{
  "crons": [
    {
      "path": "/api/cron/process-delayed-jobs",
      "schedule": "* * * * *"  // Every minute ✅
    }
  ]
}
```

### Cron Endpoint
- **Path:** `/api/cron/process-delayed-jobs`
- **Method:** GET
- **Auth:** Requires `CRON_SECRET` in query param or Authorization header
- **Function:** Processes delayed jobs from `workflow_jobs` table

---

## 🧪 How to Test

### Option 1: Using Test UI (Recommended)

1. **Navigate to Test Page**
   ```
   http://localhost:3000/dashboard/test/queue-test
   ```

2. **Select Test Data**
   - Patient: "테스트 환자" (010-1234-5678)
   - Appointment: 2025-11-26 10:00 라식

3. **Create Test Workflow**
   - Click "1분 지연 워크플로우 생성"
   - Wait for success message

4. **Verify Job Created**
   ```sql
   SELECT 
     id,
     workflow_id,
     patient_id,
     status,
     scheduled_for,
     created_at
   FROM workflow_jobs
   ORDER BY created_at DESC
   LIMIT 1;
   ```
   - Should see job with `status = 'pending'`
   - `scheduled_for` should be ~1 minute from now

5. **Wait 1 Minute**
   - Cron job runs every minute
   - Job should be processed automatically

6. **Verify Execution**
   ```sql
   -- Check if job was processed
   SELECT 
     id,
     status,
     completed_at,
     error_message
   FROM workflow_jobs
   WHERE status IN ('completed', 'failed')
   ORDER BY completed_at DESC
   LIMIT 1;

   -- Check execution record
   SELECT 
     id,
     workflow_id,
     patient_id,
     status,
     execution_data
   FROM workflow_executions
   ORDER BY created_at DESC
   LIMIT 1;
   ```

7. **Check Message Logs**
   ```sql
   SELECT 
     id,
     recipient_phone,
     content,
     channel,
     status,
     sent_at
   FROM message_logs
   ORDER BY sent_at DESC
   LIMIT 1;
   ```

### Option 2: Manual API Test

```bash
# 1. Create test workflow (requires authentication)
curl -X POST http://localhost:3000/api/test/queue-test \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-clerk-session]" \
  -d '{
    "patientId": "bed5d447-125b-4f6d-bb5b-0c0211770a4b",
    "appointmentId": "bdc92522-405b-4b64-86bc-04510776adcc"
  }'

# 2. Manually trigger cron (for testing)
curl -X GET "http://localhost:3000/api/cron/process-delayed-jobs?key=demo-secret" \
  -H "Authorization: Bearer demo-secret"
```

---

## 📊 Expected Results

### After Creating Test Workflow

1. **workflow_jobs table:**
   - New row with `status = 'pending'`
   - `scheduled_for` = current time + 1 minute
   - `workflow_id` = ID of created test workflow
   - `patient_id` = test patient ID
   - `appointment_id` = test appointment ID

2. **workflows table:**
   - New workflow named "Queue Test Workflow (1분 지연)"
   - `visual_data` contains nodes and edges
   - `enabled` = true

### After 1 Minute (Cron Processes Job)

1. **workflow_jobs table:**
   - Job `status` changes to `'completed'` or `'failed'`
   - `completed_at` timestamp set
   - If failed: `error_message` populated

2. **workflow_executions table:**
   - New execution record
   - `status` = 'completed' or 'failed'
   - `execution_data` contains log messages

3. **message_logs table:**
   - New SMS message log
   - `recipient_phone` = '010-1234-5678'
   - `content` = "큐 테스트 메시지입니다. 1분 후 발송되었습니다."
   - `channel` = 'sms'
   - `status` = 'sent' or 'failed'

---

## 🔍 Verification Queries

### Check Current Jobs
```sql
SELECT 
  id,
  workflow_id,
  patient_id,
  status,
  scheduled_for,
  created_at,
  CASE 
    WHEN scheduled_for > NOW() THEN scheduled_for - NOW()
    ELSE 'READY TO EXECUTE'
  END as time_until_execution
FROM workflow_jobs
WHERE status = 'pending'
ORDER BY scheduled_for ASC;
```

### Check Recent Executions
```sql
SELECT 
  we.id,
  we.workflow_id,
  we.patient_id,
  we.status,
  we.execution_data->>'log' as log,
  we.created_at
FROM workflow_executions we
ORDER BY we.created_at DESC
LIMIT 10;
```

### Check Message Logs
```sql
SELECT 
  id,
  recipient_phone,
  content,
  channel,
  status,
  sent_at,
  error_message
FROM message_logs
ORDER BY sent_at DESC
LIMIT 10;
```

---

## ✅ System Status

| Component | Status | Notes |
|-----------|--------|-------|
| Test Data | ✅ Ready | Patient and appointment created |
| Database Tables | ✅ Ready | workflow_jobs and workflow_executions exist |
| Cron Configuration | ✅ Ready | Configured to run every minute |
| Test Endpoint | ✅ Ready | `/api/test/queue-test` available |
| Test UI | ✅ Ready | `/dashboard/test/queue-test` available |
| Queue System | ✅ Ready | WorkflowQueue class implemented |
| Message Sending | ✅ Ready | SMS/Kakao integration available |

---

## 🚀 Next Steps

1. **Test the Queue System**
   - Use the test UI at `/dashboard/test/queue-test`
   - Create a 1-minute delay workflow
   - Verify it executes after 1 minute

2. **Monitor Results**
   - Check `workflow_jobs` table for job status
   - Check `workflow_executions` table for execution logs
   - Check `message_logs` table for sent messages

3. **Verify Cron Job**
   - In production, Vercel Cron will call `/api/cron/process-delayed-jobs` every minute
   - In development, you can manually trigger it with the demo-secret

4. **Create Real Workflows**
   - Once testing is successful, create real marketing automation workflows
   - Use the visual workflow builder at `/dashboard/workflows`

---

## 📝 Test Checklist

- [ ] Test data created (patient + appointment)
- [ ] Database tables verified
- [ ] Cron configuration verified
- [ ] Test endpoint accessible
- [ ] Test UI accessible
- [ ] Create test workflow via UI
- [ ] Verify job created in workflow_jobs
- [ ] Wait 1 minute for cron to process
- [ ] Verify job executed
- [ ] Verify execution record created
- [ ] Verify SMS message sent
- [ ] Check message logs

---

**Status:** ✅ Ready for Testing  
**Test Data:** Available  
**System:** Fully Configured

