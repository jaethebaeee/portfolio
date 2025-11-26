# API Refactoring Examples

## Before & After Comparison

### Example 1: Simple Route (Patients GET)

#### Before (Original)
```typescript
// app/api/patients/route.ts
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const patients = await getPatients(userId);
    return NextResponse.json({ patients });
  } catch (error: unknown) {
    console.error('환자 목록 조회 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
```

#### After (Refactored)
```typescript
// app/api/patients/route.ts
import { withAuth, successResponse } from '@/lib/api-middleware';
import { getPatients } from '@/lib/patients';

export const GET = withAuth(async (userId, request) => {
  const patients = await getPatients(userId);
  return successResponse({ patients });
});
```

**Reduction:** 20 lines → 4 lines (80% reduction)

---

### Example 2: Route with Rate Limiting & Validation

#### Before (Original)
```typescript
// app/api/kakao/send-message/route.ts
export async function POST(request: NextRequest) {
  try {
    // Rate limiting 적용
    const rateLimitResult = await rateLimit(rateLimitConfigs.api)(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: rateLimitResult.message || '요청이 너무 많습니다...',
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime
        },
        { status: 429, headers: {...} }
      );
    }

    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 요청 본문 파싱 및 검증
    const body = await request.json();
    const validation = validateRequestBody(body, validationSchemas.sendKakaoMessage);

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    const { phoneNumber, content } = validation.sanitizedData;
    
    // Business logic
    const result = await sendKakaoOnly(userId, { recipientPhone: phoneNumber, content });
    
    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
```

#### After (Refactored)
```typescript
// app/api/kakao/send-message/route.ts
import { withAuthRateLimitAndValidation, successResponse, errorResponse } from '@/lib/api-middleware';
import { validationSchemas } from '@/lib/input-validation';
import { sendKakaoOnly } from '@/lib/smart-messaging';

const handler = async (userId: string, body: any, request: NextRequest) => {
  const { phoneNumber, content } = body;
  const result = await sendKakaoOnly(userId, { recipientPhone: phoneNumber, content });
  
  if (result.success) {
    return successResponse(result);
  }
  return errorResponse(result.error || '발송 실패', 400);
};

export const POST = withAuthRateLimitAndValidation(
  handler,
  validationSchemas.sendKakaoMessage
);
```

**Reduction:** 85 lines → 15 lines (82% reduction)

---

## Migration Steps

### Step 1: Identify Route Type

**Type A: Simple Auth Only**
```typescript
export const GET = withAuth(async (userId, request) => {
  // Your logic here
});
```

**Type B: Auth + Rate Limit**
```typescript
export const POST = withRateLimit(async (userId, request) => {
  // Your logic here
});
```

**Type C: Auth + Rate Limit + Validation**
```typescript
export const POST = withAuthRateLimitAndValidation(
  async (userId, body, request) => {
    // Your logic here - body is already validated
  },
  validationSchema
);
```

### Step 2: Update Response Format

**Before:**
```typescript
return NextResponse.json({ patients });
return NextResponse.json({ error: '...' }, { status: 400 });
```

**After:**
```typescript
return successResponse({ patients });
return errorResponse('...', 400);
```

### Step 3: Remove Boilerplate

Remove:
- ✅ Manual auth checks
- ✅ Manual rate limit checks
- ✅ Manual validation
- ✅ Try-catch blocks (handled by middleware)
- ✅ Error response formatting

Keep:
- ✅ Business logic
- ✅ Database operations
- ✅ External API calls

---

## Common Patterns

### Pattern 1: GET with Query Params
```typescript
import { withAuth, successResponse, getQueryParams } from '@/lib/api-middleware';

export const GET = withAuth(async (userId, request) => {
  const params = getQueryParams(request);
  const enabled = params.get('enabled') === 'true';
  
  const templates = await getTemplates(userId, { enabled });
  return successResponse({ templates });
});
```

### Pattern 2: POST with Body
```typescript
import { withAuthRateLimitAndValidation, successResponse } from '@/lib/api-middleware';

export const POST = withAuthRateLimitAndValidation(
  async (userId, body, request) => {
    const patient = await createPatient(userId, body);
    return successResponse({ patient }, 201);
  },
  validationSchemas.createPatient
);
```

### Pattern 3: Error Handling
```typescript
import { withAuth, successResponse, errorResponse } from '@/lib/api-middleware';

export const GET = withAuth(async (userId, request) => {
  try {
    const data = await riskyOperation();
    return successResponse({ data });
  } catch (error) {
    // Middleware handles unexpected errors, but you can handle specific ones
    if (error instanceof SpecificError) {
      return errorResponse('Custom error message', 400);
    }
    throw error; // Let middleware handle it
  }
});
```

---

## Benefits Summary

### Code Reduction
- **Simple routes:** 70-80% reduction
- **Complex routes:** 60-75% reduction
- **Average:** ~70% reduction in boilerplate

### Consistency
- ✅ All routes use same auth pattern
- ✅ All routes use same error format
- ✅ All routes use same rate limiting

### Maintainability
- ✅ Update auth logic in one place
- ✅ Update error format in one place
- ✅ Add new middleware features easily

### Developer Experience
- ✅ Less code to write
- ✅ Less code to test
- ✅ Clearer intent
- ✅ Fewer bugs

---

## Migration Checklist

For each route:
- [ ] Identify route type (A, B, or C)
- [ ] Import appropriate middleware
- [ ] Convert handler function
- [ ] Update response calls
- [ ] Remove boilerplate
- [ ] Test route
- [ ] Update documentation

---

## Next Steps

1. Start with simple routes (Type A)
2. Move to routes with rate limiting (Type B)
3. Finally handle complex routes (Type C)
4. Consider deprecating old message APIs in favor of `/api/messages/send`

