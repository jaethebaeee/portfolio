# Delay Node Additional Improvements

## Additional Issues Found and Fixed

### 1. UI Support for Business Days ✅
**Problem**: Node config panel didn't support `business_days` delay type.

**Fixed**:
- Added `business_days` option to delay type selector
- Added checkboxes for `skipWeekends` and `skipHolidays` options
- Added validation: max 30 days for days/business_days
- Added helpful description text

**Files**:
- `components/workflow/node-config-panel.tsx`

### 2. Delay Node Display ✅
**Problem**: Delay nodes didn't show `business_days` label or options.

**Fixed**:
- Updated `delayLabels` to include `business_days: '영업일'`
- Added display of skipWeekends/skipHolidays options in node display
- Updated both `DelayNode` and `EnhancedDelayNode` components

**Files**:
- `components/workflow/delay-node.tsx`
- `components/workflow/enhanced-delay-node.tsx`

### 3. Type Definitions ✅
**Problem**: `WorkflowNodeData.delay` type didn't include `business_days` or options.

**Fixed**:
- Updated type definition to include `business_days`
- Added `skipWeekends?: boolean` and `skipHolidays?: boolean` options

**Files**:
- `lib/workflow-types.ts`

### 4. Execution Plan Calculation ✅
**Problem**: `calculateExecutionPlan` only handled `days` type, not `business_days`.

**Fixed**:
- Updated to handle `business_days` type
- Added comment explaining minutes/hours are handled by queue scheduling

**Files**:
- `lib/visual-workflow-engine.ts`

### 5. Scheduled Jobs Processing ✅
**Problem**: Delayed jobs stored in database weren't being processed automatically.

**Fixed**:
- Added `loadScheduledJobs()` method to `WorkflowQueue`
- Updated `scheduleDelayedJob()` to rely on cron for long delays (>1 hour)
- Added cron endpoint `/api/cron/process-delayed-jobs` (runs every minute)
- Updated main cron job to load scheduled jobs first

**Files**:
- `lib/workflow-queue.ts` - Added `loadScheduledJobs()` method
- `app/api/cron/process-delayed-jobs/route.ts` (new)
- `app/api/cron/trigger/route.ts` - Calls `loadScheduledJobs()`
- `vercel.json` - Added new cron schedule

## Complete Feature List

### Delay Types Supported
1. ✅ **Minutes** - Precise minute-based delays
2. ✅ **Hours** - Hour-based delays
3. ✅ **Days** - Calendar day delays
4. ✅ **Business Days** - Skips weekends and holidays

### Business Days Features
- ✅ Skip weekends (Saturday/Sunday)
- ✅ Skip Korean holidays (using holiday API)
- ✅ Configurable options (can enable/disable each)
- ✅ Accurate date calculation

### Validation
- ✅ Maximum 30 days limit
- ✅ Warning for delays > 7 days
- ✅ UI validation (prevents invalid input)
- ✅ Runtime validation (async, checks holidays)

### Context Preservation
- ✅ Full execution context stored in database
- ✅ Patient/appointment snapshot preserved
- ✅ Resume from correct node after delay
- ✅ Original execution ID tracked

### Scheduling
- ✅ Short delays (<1 hour): setTimeout
- ✅ Long delays (>1 hour): Database + Cron
- ✅ Cron job processes scheduled jobs every minute
- ✅ Handles server restarts (jobs in database)

## Testing Checklist

### UI Testing
- [ ] Can select "영업일" (business_days) in delay type dropdown
- [ ] Checkboxes appear for skipWeekends/skipHolidays
- [ ] Max value validation works (30 days limit)
- [ ] Delay node displays correctly with business_days
- [ ] Shows skipWeekends/skipHolidays info in node display

### Functionality Testing
- [ ] Minutes delay works correctly
- [ ] Hours delay works correctly
- [ ] Days delay works correctly
- [ ] Business days skips weekends
- [ ] Business days skips Korean holidays
- [ ] Execution context is preserved
- [ ] Resume from node works after delay
- [ ] Scheduled jobs are processed by cron

### Edge Cases
- [ ] Delay > 30 days shows error
- [ ] Delay = 0 shows error
- [ ] Negative delay shows error
- [ ] Missing delay config shows error
- [ ] Server restart doesn't lose scheduled jobs
- [ ] Multiple delays in same workflow work correctly

## Cron Configuration

### Vercel Cron Jobs
```json
{
  "crons": [
    {
      "path": "/api/cron/trigger",
      "schedule": "0 1 * * *"  // Daily at 1 AM
    },
    {
      "path": "/api/cron/process-delayed-jobs",
      "schedule": "* * * * *"  // Every minute
    }
  ]
}
```

### Environment Variables Required
```bash
CRON_SECRET=your-random-secret-key
HOLIDAY_API_KEY=your-holiday-api-key  # Optional, uses defaults if not set
```

## Database Schema

### workflow_jobs Table (Updated)
```sql
-- New columns added in migration 014
execution_context JSONB DEFAULT '{}'::jsonb
resume_from_node_id TEXT
original_execution_id UUID
delay_config JSONB
```

### Indexes
```sql
idx_workflow_jobs_resume_node
idx_workflow_jobs_execution_context (GIN)
idx_workflow_jobs_original_execution
idx_workflow_jobs_scheduled_for  -- For cron queries
```

## Usage Examples

### Basic Delay (Minutes)
```typescript
{
  delay: {
    type: 'minutes',
    value: 30
  }
}
// Executes 30 minutes after previous node
```

### Business Days Delay
```typescript
{
  delay: {
    type: 'business_days',
    value: 3,
    skipWeekends: true,
    skipHolidays: true
  }
}
// Executes 3 business days later (skips weekends/holidays)
```

### Workflow Example
```
Trigger: 수술 완료
  ↓
Delay: 6 hours
  ↓
Action: 수술 당일 안내 메시지
  ↓
Delay: 3 business_days (주말/공휴일 제외)
  ↓
Action: 첫 내원 안내
```

## Performance Considerations

1. **Holiday API Calls**: Business days calculation calls holiday API
   - Cached per year to reduce API calls
   - Falls back to default holidays if API unavailable

2. **Database Queries**: Cron job queries scheduled jobs
   - Indexed on `scheduled_for` for fast queries
   - Limits to 100 jobs per run to prevent overload

3. **Memory Usage**: In-memory queue for short delays
   - Only keeps jobs scheduled < 1 hour in memory
   - Long delays stored in database only

## Future Enhancements

1. **Delay Preview**: Show exact execution date/time in UI
2. **Delay History**: Track when delays were scheduled/executed
3. **Delay Notifications**: Alert users before delay executes
4. **Delay Analytics**: Track delay effectiveness
5. **Custom Holidays**: Allow clinics to define custom holidays
6. **Timezone Support**: Handle different timezones properly

