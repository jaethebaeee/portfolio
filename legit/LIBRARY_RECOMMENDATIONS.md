# 라이브러리 및 개선 제안

현재 코드베이스를 분석하여 백엔드와 프론트엔드를 더 부드럽고 효율적으로 만들 수 있는 라이브러리들을 정리했습니다.

## 🎯 우선순위 높음 (즉시 도입 권장)

### 1. **React Query (TanStack Query)** ⭐⭐⭐
**목적**: 데이터 페칭, 캐싱, 동기화

**현재 문제점**:
- `useState` + `useEffect` + `fetch` 조합으로 수동 데이터 관리
- 캐싱 없음 (매번 API 호출)
- 로딩/에러 상태 수동 관리
- 데이터 동기화 어려움

**개선 효과**:
```typescript
// Before (현재)
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
useEffect(() => {
  fetch('/api/patients').then(res => res.json()).then(setData);
}, []);

// After (React Query)
const { data, isLoading, error } = useQuery({
  queryKey: ['patients'],
  queryFn: () => fetch('/api/patients').then(res => res.json())
});
```

**설치**:
```bash
npm install @tanstack/react-query
```

**사용 예시**:
- 환자 목록 자동 캐싱 및 리프레시
- 워크플로우 실행 이력 실시간 업데이트
- Optimistic updates (즉시 UI 업데이트)

---

### 2. **React Hook Form + Zod** ⭐⭐⭐
**목적**: 폼 관리 및 검증

**현재 문제점**:
- `useState`로 폼 상태 수동 관리
- 커스텀 검증 로직 (`lib/input-validation.ts`)
- 리렌더링 최적화 없음
- 타입 안정성 부족

**개선 효과**:
```typescript
// Before (현재)
const [formData, setFormData] = useState({ name: '', phone: '' });
const [errors, setErrors] = useState({});

// After (React Hook Form + Zod)
const form = useForm({
  resolver: zodResolver(patientSchema),
  defaultValues: { name: '', phone: '' }
});
```

**설치**:
```bash
npm install react-hook-form @hookform/resolvers zod
```

**사용 예시**:
- 환자 등록 폼
- 템플릿 편집 폼
- 워크플로우 빌더 폼

**Zod 스키마 예시**:
```typescript
import { z } from 'zod';

export const patientSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다'),
  phone: z.string().regex(/^010-\d{4}-\d{4}$/, '올바른 전화번호 형식이 아닙니다'),
  email: z.string().email().optional(),
});
```

---

### 3. **Zod** ⭐⭐⭐
**목적**: 스키마 검증 (백엔드 + 프론트엔드)

**현재 문제점**:
- 커스텀 검증 로직 (`lib/input-validation.ts`)
- 타입 안정성 부족
- 백엔드/프론트엔드 검증 로직 중복

**개선 효과**:
```typescript
// Before (현재)
const validation = validateRequestBody(body, validationSchemas.sendSMS);

// After (Zod)
const schema = z.object({
  recipientPhone: z.string().regex(/^010-\d{4}-\d{4}$/),
  content: z.string().max(2000),
});
const result = schema.safeParse(body);
```

**설치**:
```bash
npm install zod
```

**사용 예시**:
- API 요청 검증
- 폼 검증
- 환경 변수 검증

---

## 🚀 중간 우선순위 (생산성 향상)

### 4. **use-debounce** ⭐⭐
**목적**: 검색 및 입력 디바운싱

**현재 문제점**:
- 검색 시 매번 API 호출
- 성능 이슈 가능성

**개선 효과**:
```typescript
import { useDebouncedValue } from 'use-debounce';

const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearchTerm] = useDebouncedValue(searchTerm, 500);

useEffect(() => {
  // 500ms 후에만 검색 실행
  searchPatients(debouncedSearchTerm);
}, [debouncedSearchTerm]);
```

**설치**:
```bash
npm install use-debounce
```

---

### 5. **date-fns-tz** ⭐⭐
**목적**: 타임존 처리 (이미 date-fns 사용 중)

**현재**: `date-fns` 사용 중이지만 타임존 처리 없음

**설치**:
```bash
npm install date-fns-tz
```

**사용 예시**:
- 예약 시간 타임존 처리
- 환자 생일 처리

---

### 6. **react-hot-toast** 또는 **sonner** (이미 사용 중) ⭐
**현재**: `sonner` 사용 중 ✅

**추가 기능**:
- Promise 기반 토스트
- 로딩 상태 표시

---

### 7. **framer-motion** ⭐⭐
**목적**: 애니메이션 및 전환 효과

**현재**: 기본 CSS 애니메이션만 사용

**개선 효과**:
- 페이지 전환 애니메이션
- 모달 애니메이션
- 리스트 아이템 애니메이션

**설치**:
```bash
npm install framer-motion
```

**사용 예시**:
- 워크플로우 실행 이력 목록 애니메이션
- 환자 카드 호버 효과
- 로딩 스켈레톤 애니메이션

---

### 8. **react-error-boundary** ⭐⭐
**목적**: 에러 바운더리 및 에러 처리

**현재**: 에러 처리 수동 관리

**설치**:
```bash
npm install react-error-boundary
```

**사용 예시**:
```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <PatientsPage />
</ErrorBoundary>
```

---

## 📊 데이터 처리 및 내보내기

### 9. **papaparse** ⭐⭐
**목적**: CSV 파싱 및 생성

**사용 예시**:
- 환자 목록 CSV 내보내기
- 실행 이력 CSV 내보내기
- CSV 파일로 환자 일괄 등록

**설치**:
```bash
npm install papaparse
npm install --save-dev @types/papaparse
```

---

### 10. **xlsx** 또는 **exceljs** ⭐
**목적**: Excel 파일 처리

**사용 예시**:
- Excel 리포트 생성
- Excel 파일로 데이터 내보내기

**설치**:
```bash
npm install xlsx
# 또는
npm install exceljs
```

---

## 🔧 백엔드 개선

### 11. **zod** (백엔드 검증) ⭐⭐⭐
**목적**: API 요청 검증

**현재**: 커스텀 검증 로직 사용

**개선 효과**:
```typescript
// app/api/patients/route.ts
import { z } from 'zod';

const createPatientSchema = z.object({
  name: z.string().min(1),
  phone: z.string().regex(/^010-\d{4}-\d{4}$/),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = createPatientSchema.safeParse(body);
  
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.errors },
      { status: 400 }
    );
  }
  
  // result.data는 타입 안전
}
```

---

### 12. **@vercel/kv** 또는 **ioredis** ⭐⭐
**목적**: Rate Limiting 개선 (현재 메모리 기반)

**현재**: 인메모리 Map 사용 (`lib/rate-limit.ts`)

**개선 효과**:
- 서버리스 환경에서도 작동
- 여러 인스턴스 간 공유
- 영구 저장

**설치**:
```bash
npm install @vercel/kv
# 또는
npm install ioredis
```

---

### 13. **pino** 또는 **winston** ⭐⭐
**목적**: 구조화된 로깅

**현재**: `console.log/error` 사용

**개선 효과**:
- 구조화된 로그
- 로그 레벨 관리
- 프로덕션 환경 최적화

**설치**:
```bash
npm install pino pino-pretty
# 또는
npm install winston
```

---

### 14. **@sentry/nextjs** ⭐⭐
**목적**: 에러 추적 및 모니터링

**설치**:
```bash
npm install @sentry/nextjs
```

**사용 예시**:
- 프로덕션 에러 자동 추적
- 성능 모니터링
- 사용자 피드백 수집

---

## 🎨 UI/UX 개선

### 15. **react-virtual** 또는 **@tanstack/react-virtual** ⭐⭐
**목적**: 가상 스크롤 (대용량 리스트)

**사용 예시**:
- 환자 목록 (1000+ 항목)
- 실행 이력 목록
- 메시지 로그

**설치**:
```bash
npm install @tanstack/react-virtual
```

---

### 16. **react-dropzone** ⭐
**목적**: 파일 업로드

**사용 예시**:
- 환자 사진 업로드
- CSV 파일 업로드
- Excel 파일 업로드

**설치**:
```bash
npm install react-dropzone
```

---

### 17. **react-select** 또는 **@radix-ui/react-select** (이미 사용 중) ⭐
**현재**: `@radix-ui/react-select` 사용 중 ✅

**추가 기능**:
- 다중 선택
- 검색 가능한 셀렉트
- 비동기 옵션 로딩

---

## 📱 모바일 및 접근성

### 18. **@radix-ui/react-toast** (sonner가 이미 사용 중) ⭐
**현재**: `sonner` 사용 중 ✅

---

### 19. **react-aria** 또는 **@react-aria/** ⭐
**목적**: 접근성 개선

**설치**:
```bash
npm install react-aria
```

---

## 🔄 상태 관리 (선택사항)

### 20. **zustand** ⭐
**목적**: 경량 상태 관리

**사용 예시**:
- 전역 UI 상태 (사이드바 열림/닫힘)
- 사용자 설정
- 테마 상태

**설치**:
```bash
npm install zustand
```

**vs React Query**:
- React Query: 서버 상태 (API 데이터)
- Zustand: 클라이언트 상태 (UI 상태)

---

## 📦 설치 스크립트 (우선순위 높음)

```bash
# 필수 (우선순위 높음)
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install react-hook-form @hookform/resolvers zod
npm install use-debounce

# 중간 우선순위
npm install framer-motion
npm install react-error-boundary
npm install papaparse @types/papaparse
npm install date-fns-tz

# 백엔드 개선
npm install pino pino-pretty
npm install @sentry/nextjs

# 선택사항
npm install @tanstack/react-virtual
npm install react-dropzone
npm install zustand
```

---

## 🎯 구현 우선순위

### Phase 1 (즉시 - 가장 큰 영향)
1. ✅ **React Query** - 데이터 페칭 개선
2. ✅ **React Hook Form + Zod** - 폼 관리 개선
3. ✅ **Zod** - 검증 로직 통합

### Phase 2 (단기 - 생산성 향상)
4. ✅ **use-debounce** - 검색 성능 개선
5. ✅ **framer-motion** - UX 개선
6. ✅ **react-error-boundary** - 에러 처리 개선

### Phase 3 (중기 - 고급 기능)
7. ✅ **papaparse** - CSV 내보내기
8. ✅ **@vercel/kv** - Rate Limiting 개선
9. ✅ **pino** - 로깅 개선

### Phase 4 (장기 - 선택사항)
10. ✅ **@sentry/nextjs** - 에러 추적
11. ✅ **@tanstack/react-virtual** - 성능 최적화
12. ✅ **zustand** - 상태 관리

---

## 💡 사용 예시

### React Query 설정
```typescript
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1분
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### React Hook Form + Zod 사용
```typescript
// components/patient-form.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const patientSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다'),
  phone: z.string().regex(/^010-\d{4}-\d{4}$/, '올바른 전화번호 형식이 아닙니다'),
  email: z.string().email().optional(),
});

export function PatientForm() {
  const form = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof patientSchema>) => {
    // API 호출
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input {...form.register('name')} />
      {form.formState.errors.name && (
        <span>{form.formState.errors.name.message}</span>
      )}
      {/* ... */}
    </form>
  );
}
```

---

## 📚 참고 자료

- [React Query 공식 문서](https://tanstack.com/query/latest)
- [React Hook Form 공식 문서](https://react-hook-form.com/)
- [Zod 공식 문서](https://zod.dev/)
- [Framer Motion 공식 문서](https://www.framer.com/motion/)

---

**작성일**: 2025-01-XX  
**다음 리뷰**: Phase 1 완료 후

