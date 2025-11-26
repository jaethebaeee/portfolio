# 🔍 Additional Issues Found - Security, Performance & Optimization

**Date**: 2024  
**Priority**: ⚠️ **IMPORTANT** - Should fix before scaling

---

## Issue #4: ⚠️ Missing Rate Limiting on Workflow APIs

### **Files**: 
- `app/api/workflows/[id]/route.ts` (GET, PATCH, DELETE)
- `app/api/workflows/batch-execute/route.ts` (POST)

### **Problem**:
Workflow APIs don't have rate limiting, unlike messaging APIs. This allows:
- **DoS attacks**: Spam workflow creation/updates
- **Resource exhaustion**: Batch execute with huge patient lists
- **Cost attacks**: Trigger expensive operations repeatedly

### **Current Code**:
```typescript
// app/api/workflows/[id]/route.ts
export async function PATCH(request: NextRequest, ...) {
  const { userId } = await auth();
  // NO RATE LIMITING!
  const body = await request.json();
  // ... process update
}
```

### **Fix Required**:
```typescript
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';

export async function PATCH(request: NextRequest, ...) {
  // Add rate limiting
  const rateLimitResult = await rateLimit(rateLimitConfigs.api)(request);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: rateLimitResult.message },
      { status: 429 }
    );
  }
  
  const { userId } = await auth();
  // ... rest of code
}
```

### **Impact**:
- **Severity**: 🟡 **MEDIUM**
- **Risk**: DoS attacks, resource exhaustion
- **Fix Time**: 15 minutes per endpoint
- **Priority**: Fix before production launch

---

## Issue #5: ⚠️ Missing Input Validation on Workflow Updates

### **File**: `app/api/workflows/[id]/route.ts` (PATCH method)

### **Problem**:
No validation on workflow update inputs:
- `visual_data` structure not validated (could be malformed)
- `steps` array structure not validated
- `trigger_type` not validated against enum
- `target_surgery_type` not validated

### **Current Code**:
```typescript
const body = await request.json();
const updates: Partial<Workflow> = {};
if (body.name !== undefined) updates.name = body.name;
if (body.visual_data !== undefined) updates.visual_data = body.visual_data; // NO VALIDATION!
if (body.steps !== undefined) updates.steps = body.steps; // NO VALIDATION!
```

### **Fix Required**:
```typescript
import { validateRequestBody, validationSchemas } from '@/lib/input-validation';

const body = await request.json();
const validation = validateRequestBody(body, {
  name: { type: 'string', maxLength: 200, sanitize: true },
  visual_data: { 
    type: 'object', 
    validate: (val) => {
      if (!val || typeof val !== 'object') return false;
      if (!Array.isArray(val.nodes)) return false;
      if (!Array.isArray(val.edges)) return false;
      return true;
    }
  },
  trigger_type: { 
    type: 'string', 
    enum: ['post_surgery', 'appointment', 'manual', 'keyword_received'] 
  },
  // ... other validations
});

if (!validation.isValid) {
  return NextResponse.json(
    { error: validation.errors.join(', ') },
    { status: 400 }
  );
}
```

### **Impact**:
- **Severity**: 🟡 **MEDIUM**
- **Risk**: Data corruption, runtime errors, security issues
- **Fix Time**: 1 hour
- **Priority**: Fix before production

---

## Issue #6: ⚠️ Missing Limit on Batch Execute Patient IDs

### **File**: `app/api/workflows/batch-execute/route.ts`

### **Problem**:
No limit on `patientIds` array size. User could send:
- 10,000 patient IDs → Timeout, resource exhaustion
- Memory issues with large arrays
- Database query overload

### **Current Code**:
```typescript
const { workflowId, patientIds } = await req.json();

if (!workflowId || !patientIds || !Array.isArray(patientIds) || patientIds.length === 0) {
  return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
}

// NO LIMIT CHECK!
const { data: patients } = await supabase
  .from('patients')
  .select('*')
  .in('id', patientIds) // Could be 10,000+ IDs!
```

### **Fix Required**:
```typescript
const MAX_BATCH_SIZE = 100; // Reasonable limit

const { workflowId, patientIds } = await req.json();

if (!workflowId || !patientIds || !Array.isArray(patientIds) || patientIds.length === 0) {
  return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
}

if (patientIds.length > MAX_BATCH_SIZE) {
  return NextResponse.json(
    { 
      error: `Batch size exceeds maximum of ${MAX_BATCH_SIZE} patients`,
      maxBatchSize: MAX_BATCH_SIZE
    },
    { status: 400 }
  );
}

// Process in chunks if needed
const chunks = [];
for (let i = 0; i < patientIds.length; i += MAX_BATCH_SIZE) {
  chunks.push(patientIds.slice(i, i + MAX_BATCH_SIZE));
}
```

### **Impact**:
- **Severity**: 🟡 **MEDIUM**
- **Risk**: Timeout errors, memory issues, DoS attacks
- **Fix Time**: 20 minutes
- **Priority**: Fix before production

---

## Issue #7: ⚠️ Missing Pagination on Inbox Conversations

### **File**: `app/[locale]/dashboard/inbox/page.tsx`

### **Problem**:
Fetches ALL conversations without pagination:
- Could load 1000+ conversations → Slow page load
- Memory issues on client side
- Poor UX for clinics with many conversations

### **Current Code**:
```typescript
const fetchConversations = async () => {
  const { data, error } = await supabase
    .from('conversations')
    .select(`*, patient:patients(*)`)
    .eq('user_id', userId)
    .order('last_message_at', { ascending: false });
    // NO LIMIT! NO PAGINATION!
}
```

### **Fix Required**:
```typescript
const [page, setPage] = useState(1);
const PAGE_SIZE = 20;

const fetchConversations = async () => {
  const rangeStart = (page - 1) * PAGE_SIZE;
  const rangeEnd = rangeStart + PAGE_SIZE - 1;
  
  const { data, error, count } = await supabase
    .from('conversations')
    .select(`*, patient:patients(*)`, { count: 'exact' })
    .eq('user_id', userId)
    .order('last_message_at', { ascending: false })
    .range(rangeStart, rangeEnd);
    
  // Add pagination controls in UI
}
```

### **Impact**:
- **Severity**: 🟡 **MEDIUM** (Performance)
- **Risk**: Slow page loads, memory issues, poor UX
- **Fix Time**: 1-2 hours (includes UI changes)
- **Priority**: Fix before scaling to 50+ clinics

---

## Issue #8: ⚠️ Hardcoded 30-Day Limit Should Be Configurable

### **File**: `lib/workflow-execution.ts`

### **Problem**:
Hardcoded 30-day limit for appointment queries:
- Workflows with longer delays (e.g., 6 months) won't execute
- Not configurable per workflow
- Should be based on workflow's max delay

### **Current Code**:
```typescript
// Optimization: Limit to last 30 days for now
const dateFrom = new Date(today);
dateFrom.setDate(today.getDate() - 30);
query = query.gte('appointment_date', dateFrom.toISOString().split('T')[0]);
```

### **Fix Required**:
```typescript
// Calculate date range based on workflow's max delay
const maxDelayDays = workflow.steps 
  ? Math.max(...workflow.steps.map(s => s.day || 0))
  : workflow.visual_data 
    ? calculateMaxDelayFromVisualData(workflow.visual_data)
    : 30;

// Add buffer (e.g., 7 days) for safety
const dateFrom = new Date(today);
dateFrom.setDate(today.getDate() - maxDelayDays - 7);

query = query.gte('appointment_date', dateFrom.toISOString().split('T')[0]);
```

### **Impact**:
- **Severity**: 🟡 **MEDIUM** (Functionality)
- **Risk**: Workflows with long delays won't execute
- **Fix Time**: 1 hour
- **Priority**: Fix before workflows with >30 day delays are used

---

## Issue #9: ⚠️ Missing Error Handling Standardization

### **Files**: Multiple API routes

### **Problem**:
Inconsistent error handling across APIs:
- Some return generic "Internal Server Error"
- Some return detailed error messages
- Some log errors, some don't
- Inconsistent error response format

### **Examples**:
```typescript
// app/api/workflows/executions/route.ts
catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
  return NextResponse.json({ error: errorMessage }, { status: 500 });
}

// app/api/workflows/batch-execute/route.ts
catch (error: any) {
  console.error('Batch execution error:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  // Generic message, loses error details
}
```

### **Fix Required**:
Create standardized error handler:
```typescript
// lib/api-error-handler.ts
export function handleApiError(error: unknown, context?: string): NextResponse {
  const isDev = process.env.NODE_ENV === 'development';
  
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: any = undefined;
  
  if (error instanceof Error) {
    message = error.message;
    
    // Map known errors to status codes
    if (error.message.includes('not found')) statusCode = 404;
    if (error.message.includes('unauthorized')) statusCode = 401;
    if (error.message.includes('validation')) statusCode = 400;
  }
  
  if (isDev && context) {
    details = { context, stack: error instanceof Error ? error.stack : undefined };
  }
  
  if (isDev) {
    console.error(`[${context || 'API'}] Error:`, error);
  }
  
  return NextResponse.json(
    { error: message, ...(details && { details }) },
    { status: statusCode }
  );
}

// Usage:
catch (error: unknown) {
  return handleApiError(error, 'workflow-executions');
}
```

### **Impact**:
- **Severity**: 🟢 **LOW** (Code Quality)
- **Risk**: Inconsistent UX, harder debugging
- **Fix Time**: 2-3 hours (refactor all endpoints)
- **Priority**: Nice to have, but improves maintainability

---

## 📋 Summary & Priority

### **High Priority** (Fix Before Production):
1. ✅ **Issue #4**: Rate limiting on workflow APIs (15 min × 3 endpoints = 45 min)
2. ✅ **Issue #5**: Input validation on workflow updates (1 hour)
3. ✅ **Issue #6**: Batch execute patient ID limit (20 minutes)

### **Medium Priority** (Fix Before Scaling):
4. ⚠️ **Issue #7**: Pagination on inbox conversations (1-2 hours)
5. ⚠️ **Issue #8**: Configurable date range limit (1 hour)

### **Low Priority** (Nice to Have):
6. ⚠️ **Issue #9**: Error handling standardization (2-3 hours)

---

## 🎯 Recommended Action Plan

### **Phase 1: Critical Fixes** (2 hours)
- Add rate limiting to all workflow APIs
- Add input validation to workflow PATCH endpoint
- Add batch size limit to batch-execute endpoint

### **Phase 2: Performance Fixes** (2-3 hours)
- Add pagination to inbox conversations
- Make date range limit configurable based on workflow delays

### **Phase 3: Code Quality** (2-3 hours)
- Standardize error handling across all APIs
- Add consistent logging

---

**Total Estimated Time**: 6-8 hours for all fixes

**Status**: ⚠️ **IMPORTANT ISSUES - FIX BEFORE SCALING**

