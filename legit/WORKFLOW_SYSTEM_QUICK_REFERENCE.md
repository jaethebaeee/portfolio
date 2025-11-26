# 🔄 Workflow System Quick Reference

## Overview

The workflow system automates patient communication based on surgery dates. It supports two execution models:

1. **Legacy Linear Workflows** - Simple day-based steps
2. **Visual Workflows** - Graph-based with React Flow

---

## 🎯 Workflow Types

### 1. Post-Surgery Workflows (`trigger_type: 'post_surgery'`)
- **Trigger**: Automatically runs daily based on `appointment_date`
- **Execution**: Cron job checks `daysPassed` since surgery completion
- **Use Case**: "Happy Call" follow-ups (Day 1, Day 3, Day 7, etc.)

### 2. Webhook Workflows (`trigger_type: 'webhook'`)
- **Trigger**: External HTTP POST to `/api/webhooks/{id}`
- **Execution**: Immediate, synchronous
- **Use Case**: External system integration (booking systems, CRMs)

### 3. Scheduled Workflows (`trigger_type: 'schedule'`)
- **Trigger**: Cron-based scheduling
- **Execution**: Time-based triggers
- **Use Case**: Birthday campaigns, seasonal promotions

---

## 📋 Workflow Data Structure

### Legacy Linear Workflow
```typescript
{
  id: string;
  user_id: string;
  name: string;
  trigger_type: 'post_surgery';
  target_surgery_type?: 'lasik' | 'lasek' | 'blepharoplasty_cos' | ...;
  steps: [
    {
      day: 1,                    // Days after surgery
      type: 'survey' | 'photo',   // Action type
      title: '통증 확인',
      message_template: '안녕하세요 {{patient_name}}님...'
    }
  ];
  is_active: boolean;
  visual_data?: null;            // Not used for legacy
}
```

### Visual Workflow
```typescript
{
  id: string;
  user_id: string;
  name: string;
  trigger_type: 'post_surgery';
  steps: [];                     // Empty for visual workflows
  visual_data: {
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        data: { triggerType: 'surgery_completed' },
        position: { x: 0, y: 0 }
      },
      {
        id: 'delay-1',
        type: 'delay',
        data: { delay: { type: 'days', value: 1 } },
        position: { x: 200, y: 0 }
      },
      {
        id: 'action-1',
        type: 'action',
        data: {
          actionType: 'send_kakao' | 'send_sms',
          message_template: '안녕하세요...'
        },
        position: { x: 400, y: 0 }
      },
      {
        id: 'condition-1',
        type: 'condition',
        data: {
          condition: 'daysPassed > 7',
          operator: '>',
          value: 7
        },
        position: { x: 600, y: 0 }
      }
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'delay-1' },
      { id: 'e2', source: 'delay-1', target: 'action-1' },
      { id: 'e3', source: 'action-1', target: 'condition-1' }
    ]
  };
  is_active: boolean;
}
```

---

## 🔄 Execution Flow

### Daily Cron Execution (`/api/cron/trigger`)

```
1. GET /api/cron/trigger?key=CRON_SECRET
   ↓
2. Get all active workflows (trigger_type='post_surgery')
   ↓
3. For each workflow:
   ├─► Get completed appointments (last 30 days)
   ├─► Filter by surgery_type (if specified)
   ↓
4. For each appointment:
   ├─► Calculate daysPassed = today - appointment_date
   ├─► Check if visual_data exists:
   │   ├─► YES → executeVisualWorkflow()
   │   └─► NO  → executeLegacyWorkflow()
   ↓
5. Legacy Workflow:
   ├─► Find step where step.day === daysPassed
   ├─► Check if already executed (message_logs metadata)
   ├─► Create workflow_execution record
   ├─► Execute action (sendSmartMessage)
   └─► Update execution status
   ↓
6. Visual Workflow:
   ├─► Calculate execution plan (BFS traversal)
   ├─► Find actions scheduled for daysPassed
   ├─► Execute each action
   └─► Update execution status
```

### Webhook Execution (`/api/webhooks/{id}`)

```
1. POST /api/webhooks/{id}
   Headers: x-webhook-signature: HMAC-SHA256
   Body: { patient_id, event, data }
   ↓
2. Verify signature (HMAC-SHA256)
   ↓
3. Get webhook config (workflow_id, enabled)
   ↓
4. Get workflow
   ↓
5. Execute workflow with payload data
   ↓
6. Log execution (webhook_executions table)
```

---

## 📊 Execution Tracking

### workflow_executions Table
```sql
{
  id: UUID,
  user_id: TEXT,
  workflow_id: UUID,
  patient_id: UUID,
  trigger_type: 'webhook' | 'schedule' | 'manual' | 'event',
  status: 'pending' | 'running' | 'completed' | 'failed',
  current_step_index: INTEGER,
  steps_completed: INTEGER,
  total_steps: INTEGER,
  error_message: TEXT,
  execution_data: JSONB {
    days_passed: number,
    planned_actions: string[],
    log: string[]
  },
  started_at: TIMESTAMP,
  completed_at: TIMESTAMP
}
```

### message_logs Table (Linked)
```sql
{
  id: UUID,
  patient_id: UUID,
  channel: 'kakao' | 'sms',
  status: 'pending' | 'sent' | 'failed' | 'delivered',
  metadata: JSONB {
    workflow_id: UUID,
    step_index: number,        // Legacy
    node_id: string,            // Visual
    appointment_id: UUID,
    days_passed: number,
    execution_id: UUID          // Links to workflow_executions
  }
}
```

---

## 🛠️ Key Functions

### `executeDailyWorkflows(userId: string)`
- **Location**: `lib/workflow-execution.ts`
- **Purpose**: Main entry point for daily cron execution
- **Returns**: `{ executionCount: number, logs: string[] }`

### `executeVisualWorkflow(workflow, patient, appointment, context)`
- **Location**: `lib/visual-workflow-engine.ts`
- **Purpose**: Execute graph-based workflow
- **Returns**: `{ executed: boolean, log: string }`

### `calculateExecutionPlan(nodes, edges)`
- **Location**: `lib/visual-workflow-engine.ts`
- **Purpose**: BFS traversal to calculate when each node executes
- **Returns**: `{ node: GraphNode, day: number }[]`

### `sendSmartMessage(userId, request, context)`
- **Location**: `lib/smart-messaging.ts`
- **Purpose**: Send message with Kakao → SMS failover
- **Returns**: `{ success: boolean, channel: 'kakao' | 'sms', error?: string }`

---

## 🔍 Duplicate Prevention

### How It Works
1. Before executing a step, check `message_logs`:
   ```sql
   SELECT id FROM message_logs
   WHERE patient_id = ?
   AND metadata->>'workflow_id' = ?
   AND metadata->>'step_index' = ?  -- or node_id for visual
   AND metadata->>'appointment_id' = ?
   ```

2. If record exists → Skip execution
3. If not → Execute and log

### Metadata Structure
```json
{
  "workflow_id": "uuid",
  "step_index": 0,              // Legacy workflows
  "node_id": "action-1",        // Visual workflows
  "appointment_id": "uuid",
  "days_passed": 1,
  "execution_id": "uuid"        // Links to workflow_executions
}
```

---

## ⚙️ Configuration

### Cron Schedule (`vercel.json`)
```json
{
  "crons": [{
    "path": "/api/cron/trigger?key=CRON_SECRET",
    "schedule": "0 10 * * *"  // 10 AM UTC daily
  }]
}
```

### Environment Variables
```bash
CRON_SECRET=your-random-secret
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## 🐛 Common Issues

### Issue: Duplicate Messages
**Cause**: Race condition in cron execution
**Fix**: Add database-level locking or idempotency keys

### Issue: Workflow Not Executing
**Checklist**:
1. Is `is_active = true`?
2. Is `trigger_type = 'post_surgery'`?
3. Are there completed appointments?
4. Is `daysPassed` matching a step day?
5. Has it already been executed? (check message_logs)

### Issue: Visual Workflow Not Executing
**Checklist**:
1. Does `visual_data` exist?
2. Is there a trigger node?
3. Are edges properly connected?
4. Is the execution plan calculated correctly?

---

## 📈 Performance Notes

### Query Optimization
- Current: Fetches last 30 days of appointments
- **Optimization**: Use date range based on max delay in workflow
- Example: If max delay is 7 days, only fetch last 7 days

### Execution Time
- Average: ~50-200ms per patient
- Bottleneck: External API calls (Kakao/SMS)
- **Solution**: Use queue system for async processing

### Scaling
- Current: Sequential execution per user
- **Future**: Parallel execution with worker pool
- **Future**: Batch processing for large patient lists

---

## 🎯 Best Practices

1. **Idempotency**: Always check `message_logs` before sending
2. **Error Handling**: Log all failures in `workflow_executions`
3. **Monitoring**: Track execution success rate
4. **Testing**: Test workflows with test patients before production
5. **Documentation**: Document workflow logic in workflow description

---

## 📚 Related Files

- `lib/workflow-execution.ts` - Main execution engine
- `lib/visual-workflow-engine.ts` - Visual workflow engine
- `lib/workflows.ts` - CRUD operations
- `lib/smart-messaging.ts` - Message sending
- `lib/conditional-logic.ts` - Condition evaluation
- `app/api/cron/trigger/route.ts` - Cron endpoint
- `app/api/webhooks/[id]/route.ts` - Webhook endpoint
- `app/api/workflows/executions/route.ts` - Execution history API

---

**Last Updated**: 2024

