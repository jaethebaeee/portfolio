# 👤 User Flow Documentation

Complete user journey and interaction flows for 닥터스플로우 (DoctorsFlow) platform.

---

## 🚪 Entry Points

### 1. Authentication Flow
```
Landing Page (/)
  ↓
[Sign In / Sign Up]
  ↓
Clerk Authentication
  ├─► Google OAuth
  ├─► Kakao OAuth
  └─► Email/Password
  ↓
Dashboard (/dashboard)
```

---

## 📊 Main Dashboard Flow

### Dashboard Overview
```
Dashboard (/dashboard)
  ├─► Overview Cards (Stats)
  ├─► Recent Activity
  ├─► Quick Actions
  └─► Navigation Sidebar
      ├─► AI 마케팅
      ├─► 템플릿
      ├─► 통계
      ├─► 분석
      ├─► 캠페인
      ├─► 이벤트/생일 CRM
      ├─► 상담 관리 (CRM)
      ├─► 환자
      ├─► 예약
      ├─► 워크플로우 ⭐
      ├─► 웹훅
      └─► 설정
```

---

## 🔄 Workflow Management Flow

### Flow 1: Create New Workflow

```
Dashboard → 워크플로우 (/dashboard/workflows)
  ↓
[Click "새 워크플로우 만들기" Button]
  ↓
Visual Workflow Builder Opens
  ├─► Drag & Drop Nodes
  │   ├─► Trigger Node (시작)
  │   ├─► Delay Node (대기)
  │   ├─► Condition Node (조건)
  │   ├─► Action Node (액션)
  │   │   ├─► Send Kakao Talk
  │   │   └─► Send SMS
  │   └─► End Node
  ├─► Connect Nodes (Edges)
  ├─► Configure Node Properties
  │   ├─► Message Template
  │   ├─► Delay Duration
  │   ├─► Condition Logic
  │   └─► Action Type
  ↓
[Click "저장" Button]
  ↓
Workflow Created
  ├─► Saved to Database
  ├─► Visual Data Stored (JSONB)
  ├─► Steps Converted (for compatibility)
  └─► Success Toast Shown
  ↓
Workflow List Updated
  └─► New Workflow Appears in Grid
```

### Flow 2: Edit Existing Workflow

```
Dashboard → 워크플로우 (/dashboard/workflows)
  ↓
[Click on Workflow Card]
  OR
[Click "편집" Button]
  ↓
Visual Workflow Builder Opens
  ├─► Loads Existing Workflow Data
  ├─► Displays Current Nodes & Edges
  ├─► User Modifies Workflow
  │   ├─► Add/Remove Nodes
  │   ├─► Change Connections
  │   └─► Update Node Properties
  ↓
[Click "저장" Button]
  ↓
Workflow Updated
  ├─► Database Updated
  ├─► Visual Data Updated
  └─► Success Toast Shown
  ↓
Workflow List Refreshed
```

### Flow 3: Delete Workflow

```
Dashboard → 워크플로우 (/dashboard/workflows)
  ↓
[Click "삭제" Button on Workflow Card]
  ↓
[Confirm Dialog: "정말 삭제하시겠습니까?"]
  ├─► [Cancel] → Return to List
  └─► [Confirm]
      ↓
      Workflow Deleted
      ├─► Removed from Database
      ├─► Success Toast Shown
      └─► Workflow List Refreshed
```

### Flow 4: View Execution History

```
Dashboard → 워크플로우 (/dashboard/workflows)
  ↓
[Click "실행 이력" Button]
  ↓
Workflow Executions Page (/dashboard/workflows/executions)
  ├─► Table View of All Executions
  │   ├─► Status Badge (완료/실패/실행중/대기)
  │   ├─► Workflow Name
  │   ├─► Patient Info
  │   ├─► Step Progress
  │   ├─► Duration
  │   ├─► Error Messages
  │   └─► Execution Time
  ├─► Filter by Status
  │   ├─► 모든 상태
  │   ├─► 성공
  │   ├─► 실패
  │   ├─► 실행 중
  │   └─► 대기
  ├─► Refresh Button
  └─► [Click Eye Icon] → View Details Dialog
      ├─► Full Execution Metadata
      ├─► Error Messages
      ├─► Execution Data (JSON)
      └─► Start/End Times
```

---

## 🤖 Workflow Execution Flow (Automated)

### Daily Cron Execution Flow

```
Vercel Cron Job (10:00 AM UTC Daily)
  ↓
GET /api/cron/trigger?key=CRON_SECRET
  ↓
executeDailyWorkflows(userId)
  ├─► Fetch Active Workflows
  │   └─► Filter: is_active = true, trigger_type = 'post_surgery'
  ├─► Fetch Completed Appointments
  │   └─► Last 30 days, status = 'completed'
  ├─► For Each Appointment:
  │   ├─► Calculate daysPassed = today - appointment_date
  │   ├─► Check Workflow Type:
  │   │   ├─► Visual Workflow?
  │   │   │   └─► executeVisualWorkflow()
  │   │   │       ├─► Calculate Execution Plan (BFS)
  │   │   │       ├─► Find Actions for daysPassed
  │   │   │       └─► Execute Actions
  │   │   └─► Legacy Linear Workflow?
  │   │       └─► executeLegacyWorkflow()
  │   │           ├─► Find Step where step.day === daysPassed
  │   │           └─► Execute Step
  │   ├─► Check if Already Executed
  │   │   └─► Query message_logs metadata
  │   ├─► Create Execution Record
  │   │   └─► workflow_executions table
  │   ├─► Execute Action
  │   │   └─► sendSmartMessage()
  │   │       ├─► Try Kakao Talk First
  │   │       └─► Fallback to SMS if Failed
  │   ├─► Log Message
  │   │   └─► message_logs table
  │   └─► Update Execution Status
  │       ├─► Success → status = 'completed'
  │       └─► Failure → status = 'failed', error_message
  └─► Return Summary
      ├─► executionCount
      └─► logs[]
```

### Visual Workflow Execution Details

```
executeVisualWorkflow()
  ├─► Load visual_data (nodes & edges)
  ├─► Find Trigger Node
  ├─► Calculate Execution Plan
  │   └─► BFS Traversal:
  │       ├─► Start from Trigger
  │       ├─► Follow Edges
  │       ├─► Calculate Delays
  │       └─► Map Actions to Days
  ├─► Filter Actions for Today (daysPassed)
  ├─► For Each Action:
  │   ├─► Check if Already Executed
  │   ├─► Execute Action
  │   │   ├─► Send Kakao/SMS
  │   │   └─► Log Result
  │   └─► Update Metadata
  └─► Update Execution Status
```

---

## 🔗 Webhook Trigger Flow

### External System Integration

```
External System (Booking System, CRM, etc.)
  ↓
POST /api/webhooks/{webhook_id}
Headers:
  ├─► x-webhook-signature: HMAC-SHA256
  └─► Content-Type: application/json
Body:
  ├─► patient_id: UUID
  ├─► event: "appointment_created"
  └─► data: {...}
  ↓
Webhook Endpoint (/api/webhooks/[id]/route.ts)
  ├─► Verify Signature
  ├─► Get Webhook Config
  ├─► Get Associated Workflow
  ├─► Create Execution Record
  ├─► Execute Workflow
  │   └─► With Payload Data
  └─► Log Execution
      └─► webhook_executions table
```

---

## 👥 Patient Management Flow

### Create Patient & Trigger Workflow

```
Dashboard → 환자 (/dashboard/patients)
  ↓
[Click "환자 추가" Button]
  ↓
Create Patient Form
  ├─► Name (필수)
  ├─► Phone (필수)
  ├─► Email
  ├─► Birth Date
  ├─► Gender
  └─► Notes
  ↓
[Submit]
  ↓
Patient Created
  ↓
Dashboard → 예약 (/dashboard/appointments)
  ↓
[Create Appointment]
  ├─► Select Patient
  ├─► Appointment Date
  ├─► Appointment Time
  ├─► Type (라식, 성형수술 등)
  ├─► Surgery Type
  └─► Status: "scheduled"
  ↓
[After Surgery]
  ↓
[Update Appointment Status → "completed"]
  ↓
⏰ Next Day (Cron Job Runs)
  ↓
Workflow Automatically Executes
  ├─► Day 1: Survey Message
  ├─► Day 3: Photo Request
  └─► Day 7: Follow-up
```

---

## 📨 Message Sending Flow

### Smart Failover Flow

```
sendSmartMessage()
  ├─► Step 1: Try Kakao Talk
  │   ├─► Get Kakao Access Token
  │   ├─► Send Message via Kakao API
  │   ├─► Success?
  │   │   ├─► Log: channel='kakao', status='sent'
  │   │   └─► Return Success
  │   └─► Failed?
  │       ├─► Log: channel='kakao', status='failed'
  │       └─► Continue to Step 2
  │
  └─► Step 2: Fallback to SMS
      ├─► Get NHN SMS Access Token
      ├─► Send Message via SMS API
      ├─► Success?
      │   ├─► Log: channel='sms', status='sent'
      │   └─► Return Success
      └─► Failed?
          ├─► Log: channel='sms', status='failed'
          └─► Return Failure
```

---

## 📊 Monitoring & Analytics Flow

### View Statistics

```
Dashboard → 통계 (/dashboard/statistics)
  ├─► Message Statistics
  │   ├─► Total Messages
  │   ├─► Sent/Failed Counts
  │   ├─► By Channel (Kakao/SMS)
  │   └─► Daily Trends Chart
  ├─► Campaign Performance
  └─► Workflow Execution Stats
      ├─► Success Rate
      ├─► Average Duration
      └─► Error Rate
```

### View Execution Details

```
Dashboard → 워크플로우 → 실행 이력
  ↓
[Click Eye Icon on Execution Row]
  ↓
Execution Details Dialog Opens
  ├─► Status Badge
  ├─► Workflow Name
  ├─► Patient Information
  ├─► Trigger Type
  ├─► Step Progress (current/total)
  ├─► Duration
  ├─► Start Time
  ├─► End Time
  ├─► Error Message (if failed)
  └─► Execution Data (JSON)
      ├─► days_passed
      ├─► planned_actions
      └─► log[]
```

---

## 🎯 Campaign Flow

### Create & Execute Campaign

```
Dashboard → 캠페인 (/dashboard/campaigns)
  ↓
[Click "새 캠페인 만들기"]
  ↓
Campaign Creation Form
  ├─► Name
  ├─► Description
  ├─► Select Template
  ├─► Select Target Patients
  └─► Schedule Date (optional)
  ↓
[Save Campaign]
  ↓
Campaign Created (status: 'draft')
  ↓
[Click "실행" Button]
  ↓
Campaign Execution
  ├─► For Each Target Patient:
  │   ├─► Execute Template
  │   ├─► Replace Variables
  │   ├─► Send Message (Smart Failover)
  │   └─► Log Result
  ├─► Update Status: 'running' → 'completed'
  └─► Show Results
      ├─► Sent Count
      ├─► Failed Count
      └─► Errors
```

---

## 🔐 Security Flow

### Authentication & Authorization

```
Every API Request
  ↓
Middleware Check
  ├─► Clerk Session Valid?
  │   ├─► No → Return 401
  │   └─► Yes → Continue
  ├─► Extract userId from Session
  └─► Pass to API Route
      ↓
API Route Handler
  ├─► Verify userId
  ├─► Filter Queries by user_id
  ├─► Validate Ownership
  └─► Execute Request
```

### Webhook Security

```
Webhook Request
  ↓
Extract Signature Header
  ├─► x-webhook-signature
  ↓
Calculate Expected Signature
  ├─► HMAC-SHA256(payload, secret)
  ↓
Compare Signatures
  ├─► Match? → Continue
  └─► No Match? → Return 401
```

---

## 📱 Mobile/Responsive Flow

### Mobile Navigation

```
Mobile View (< 768px)
  ├─► Sidebar Collapsed (Hamburger Menu)
  ├─► Cards Stack Vertically
  ├─► Table Scrollable Horizontally
  └─► Dialogs Full Screen
```

---

## 🚨 Error Handling Flow

### Error Scenarios

```
1. Workflow Execution Failure
   ├─► Log Error in workflow_executions
   ├─► Set status = 'failed'
   ├─► Store error_message
   └─► User Can View in Execution History

2. Message Send Failure
   ├─► Try Kakao → Failed
   ├─► Try SMS → Failed
   ├─► Log Both Attempts
   └─► Can Retry Manually

3. Webhook Failure
   ├─► Log in webhook_executions
   ├─► Set status = 'failed'
   └─► Store error_message

4. Authentication Failure
   ├─► Redirect to Sign In
   └─► Show Error Message
```

---

## 🔄 Retry Flow

### Manual Retry

```
Dashboard → 메시지 로그
  ↓
[Filter: status = 'failed']
  ↓
[Select Failed Messages]
  ↓
[Click "재시도" Button]
  ↓
Retry Process
  ├─► Check Retry Count (< 3)
  ├─► Check Retry Interval
  ├─► Resend Message
  └─► Update Status
```

---

## 📈 Key User Journeys

### Journey 1: First-Time User Setup

```
1. Sign Up → Dashboard
2. Create First Patient
3. Create First Appointment
4. Create First Workflow
   ├─► Use Visual Builder
   ├─► Add Trigger (Post-Surgery)
   ├─► Add Delay (1 day)
   ├─► Add Action (Send Kakao)
   └─► Save Workflow
5. Wait for Appointment Completion
6. View Execution History (Next Day)
```

### Journey 2: Daily Operations

```
1. Login → Dashboard
2. Check Today's Executions
3. Review Failed Messages
4. Retry Failed Messages (if needed)
5. Create New Campaigns
6. Monitor Statistics
```

### Journey 3: External Integration

```
1. Create Webhook
   ├─► Name: "예약 시스템 연동"
   ├─► Link to Workflow
   └─► Copy Webhook URL & Secret
2. Configure External System
   ├─► Set Webhook URL
   ├─► Set Secret Key
   └─► Test Connection
3. External System Triggers Webhook
4. Workflow Executes Automatically
5. View Results in Execution History
```

---

## 🎨 UI Component Flow

### Visual Workflow Builder

```
Workflow Builder Opens
  ├─► Canvas Area (React Flow)
  ├─► Node Palette (Sidebar)
  │   ├─► Trigger Node
  │   ├─► Delay Node
  │   ├─► Condition Node
  │   └─► Action Node
  ├─► Properties Panel (Right Sidebar)
  │   ├─► Node Configuration
  │   ├─► Message Template Editor
  │   └─► Variable Autocomplete
  └─► Toolbar
      ├─► Save Button
      ├─► Cancel Button
      └─► Preview Button
```

---

## 📝 Summary

### Main User Flows:

1. **Workflow Creation** → Visual Builder → Save → Auto Execution
2. **Execution Monitoring** → View History → Check Details → Retry if Needed
3. **Campaign Management** → Create → Execute → Monitor Results
4. **Patient Management** → Create → Add Appointment → Trigger Workflow
5. **External Integration** → Create Webhook → Configure → Auto Trigger

### Key Features:

- ✅ Visual workflow builder (drag & drop)
- ✅ Automatic daily execution (cron)
- ✅ Webhook triggers (external systems)
- ✅ Smart failover (Kakao → SMS)
- ✅ Execution history & monitoring
- ✅ Error handling & retry logic

---

**Last Updated**: 2024

