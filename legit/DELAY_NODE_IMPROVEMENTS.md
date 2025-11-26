# Delay Node Execution Improvements

## Overview
Improved delay node execution system to properly handle execution context, support business days, and validate delays.

## Changes Made

### 1. Execution Context Storage ✅
**Problem**: Delay nodes didn't preserve patient/appointment context when scheduling delayed executions.

**Solution**:
- Added `execution_context` JSONB column to `workflow_jobs` table
- Stores full snapshot of workflow, patient, appointment, and context data
- Ensures delayed executions have complete context when resumed

**Files**:
- `supabase/migrations/014_improve_workflow_jobs_context.sql`
- `lib/workflow-queue.ts` - Updated `persistJob()` and `processJob()`

### 2. Delay Calculation Improvements ✅
**Problem**: Delay calculations only worked for "days", not minutes/hours properly. No business days support.

**Solution**:
- Created `lib/delay-calculation.ts` utility
- Supports: `minutes`, `hours`, `days`, `business_days`
- Business days skip weekends and Korean holidays
- Proper async handling for holiday API calls

**Features**:
- `calculateDelayMs()` - Calculates delay in milliseconds
- `calculateExecutionDate()` - Returns exact execution date
- `calculateBusinessDaysMs()` - Skips weekends/holidays
- `validateDelay()` - Validates delay configuration
- `formatDelay()` - Formats delay for display

**Files**:
- `lib/delay-calculation.ts` (new)

### 3. Delay Validation ✅
**Problem**: No validation for maximum delay limits.

**Solution**:
- Added 30-day maximum delay validation
- Warning for delays > 7 days
- Validation happens at runtime (async) and in node config (sync check)

**Files**:
- `lib/delay-calculation.ts` - `validateDelay()`
- `lib/node-validation.ts` - Updated `validateDelayNode()`

### 4. Business Days Support ✅
**Problem**: No way to skip weekends/holidays in delays.

**Solution**:
- Added `business_days` delay type
- Automatically skips weekends (Saturday, Sunday)
- Optionally skips Korean holidays (using `holiday-api.ts`)
- Configurable: `skipWeekends`, `skipHolidays`

**Usage**:
```typescript
{
  type: 'business_days',
  value: 3,
  skipWeekends: true,
  skipHolidays: true
}
```

**Files**:
- `lib/delay-calculation.ts` - `calculateBusinessDaysMs()`

### 5. Context Restoration ✅
**Problem**: Delayed executions couldn't restore original patient/appointment context.

**Solution**:
- Store full execution context in `workflow_jobs.execution_context`
- Restore context when processing delayed jobs
- Preserve `resumeFromNodeId` and `originalExecutionId`

**Files**:
- `lib/workflow-queue.ts` - Updated `processJob()` to restore context
- `lib/visual-workflow-engine.ts` - Store context when scheduling delays

## Database Schema Changes

### New Columns in `workflow_jobs`:
```sql
execution_context JSONB DEFAULT '{}'::jsonb
resume_from_node_id TEXT
original_execution_id UUID
delay_config JSONB
```

### New Indexes:
```sql
idx_workflow_jobs_resume_node
idx_workflow_jobs_execution_context (GIN)
idx_workflow_jobs_original_execution
```

## Usage Examples

### Basic Delay (Minutes/Hours/Days)
```typescript
// Delay node configuration
{
  delay: {
    type: 'hours',
    value: 6
  }
}
```

### Business Days Delay
```typescript
// Delay node configuration
{
  delay: {
    type: 'business_days',
    value: 3,
    skipWeekends: true,
    skipHolidays: true
  }
}
```

### Execution Context Storage
When a delay node schedules continuation:
```typescript
const executionContext = {
  workflow: { id, user_id, name, visual_data },
  patient: { id, name, phone, email, ... },
  appointment: { id, appointment_date, surgery_type, ... },
  context: { daysPassed, triggerType, executionId },
  delayNode: { id, delay }
};
```

## Migration Steps

1. **Run Database Migration**:
   ```bash
   # Apply migration
   supabase migration up 014_improve_workflow_jobs_context
   ```

2. **No Code Changes Required**:
   - Existing workflows continue to work
   - New delay nodes automatically use improved system
   - Business days support is opt-in

## Testing Checklist

- [ ] Basic delay (minutes) works correctly
- [ ] Basic delay (hours) works correctly
- [ ] Basic delay (days) works correctly
- [ ] Business days delay skips weekends
- [ ] Business days delay skips holidays
- [ ] Execution context is stored correctly
- [ ] Execution context is restored correctly
- [ ] Delay validation rejects > 30 days
- [ ] Delay validation warns for > 7 days
- [ ] Resume from node works after delay

## Future Improvements

1. **Better Queue System**: Consider BullMQ or pg_cron for more reliable scheduling
2. **Delay Visualization**: Show delay timeline in workflow builder
3. **Delay Preview**: Preview execution date before saving
4. **Delay History**: Track when delays were scheduled and executed
5. **Delay Notifications**: Alert users when delays are about to execute

## Related Files

- `lib/delay-calculation.ts` - Delay calculation utilities
- `lib/visual-workflow-engine.ts` - Delay node execution
- `lib/workflow-queue.ts` - Job queue with context storage
- `lib/node-validation.ts` - Delay node validation
- `lib/holiday-api.ts` - Korean holiday API integration
- `supabase/migrations/014_improve_workflow_jobs_context.sql` - Database migration

