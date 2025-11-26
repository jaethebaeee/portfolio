# React Query 사용 가이드

React Query (TanStack Query)가 성공적으로 도입되었습니다. 이 가이드는 기존 코드를 React Query로 마이그레이션하는 방법을 설명합니다.

## ✅ 완료된 작업

1. ✅ React Query 설치 및 Provider 설정
2. ✅ 환자 관련 Query Functions 생성 (`lib/queries/patients.ts`)
3. ✅ 환자 페이지 마이그레이션 완료

## 📚 기본 개념

### Before (기존 방식)
```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetch('/api/patients')
    .then(res => res.json())
    .then(data => {
      setData(data);
      setLoading(false);
    })
    .catch(err => {
      setError(err);
      setLoading(false);
    });
}, []);
```

### After (React Query)
```typescript
const { data, isLoading, error } = usePatients();
```

## 🎯 주요 개선 사항

### 1. 자동 캐싱
- 데이터가 자동으로 캐시됨
- 같은 쿼리는 재사용됨
- 불필요한 API 호출 감소

### 2. 자동 리프레시
- Mutation 후 관련 쿼리 자동 무효화
- 데이터 일관성 유지

### 3. 로딩/에러 상태 관리
- `isLoading`, `isPending`, `error` 자동 제공
- 수동 상태 관리 불필요

### 4. Optimistic Updates
- UI 즉시 업데이트 가능
- 사용자 경험 향상

## 📖 사용 예시

### Query (데이터 조회)

```typescript
import { usePatients } from '@/lib/queries/patients';

function PatientsList() {
  const { data: patients, isLoading, error } = usePatients();

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생</div>;

  return (
    <div>
      {patients.map(patient => (
        <div key={patient.id}>{patient.name}</div>
      ))}
    </div>
  );
}
```

### Mutation (데이터 변경)

```typescript
import { useCreatePatient } from '@/lib/queries/patients';
import { toast } from 'sonner';

function AddPatientForm() {
  const createPatient = useCreatePatient();

  const handleSubmit = async (data) => {
    try {
      await createPatient.mutateAsync(data);
      toast.success('환자가 추가되었습니다.');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 폼 필드 */}
      <button disabled={createPatient.isPending}>
        {createPatient.isPending ? '추가 중...' : '추가'}
      </button>
    </form>
  );
}
```

### 검색 기능

```typescript
import { usePatients } from '@/lib/queries/patients';
import { useState } from 'react';

function PatientsSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // 검색어가 자동으로 필터링됨
  const { data: patients } = usePatients(searchQuery);

  return (
    <div>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="검색..."
      />
      {/* 검색 결과 표시 */}
    </div>
  );
}
```

## 🔧 새로운 Query Functions 추가하기

### 1. Query Functions 파일 생성

`lib/queries/[resource].ts` 파일 생성:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query Keys 정의
export const resourceKeys = {
  all: ['resources'] as const,
  lists: () => [...resourceKeys.all, 'list'] as const,
  list: (filters?: any) => [...resourceKeys.lists(), filters] as const,
  details: () => [...resourceKeys.all, 'detail'] as const,
  detail: (id: string) => [...resourceKeys.details(), id] as const,
};

// Query Function
async function fetchResources(): Promise<Resource[]> {
  const response = await fetch('/api/resources');
  if (!response.ok) throw new Error('Failed to fetch');
  const data = await response.json();
  return data.resources || [];
}

// Mutation Function
async function createResource(data: Partial<Resource>): Promise<Resource> {
  const response = await fetch('/api/resources', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create');
  }
  return response.json();
}

// Hooks
export function useResources() {
  return useQuery({
    queryKey: resourceKeys.list(),
    queryFn: fetchResources,
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
    },
  });
}
```

### 2. 컴포넌트에서 사용

```typescript
import { useResources, useCreateResource } from '@/lib/queries/resources';

function ResourcesPage() {
  const { data: resources, isLoading } = useResources();
  const createResource = useCreateResource();

  // 사용...
}
```

## 🔄 마이그레이션 체크리스트

기존 컴포넌트를 React Query로 마이그레이션할 때:

- [ ] `useState` + `useEffect` + `fetch` 패턴 제거
- [ ] Query Functions 파일 생성 (`lib/queries/`)
- [ ] `useQuery` 또는 `useMutation` hook 사용
- [ ] 로딩 상태: `isLoading` 또는 `isPending` 사용
- [ ] 에러 처리: `error` 객체 사용
- [ ] Mutation 후 `invalidateQueries` 호출 확인

## 📝 마이그레이션 예시

### Before
```typescript
const [patients, setPatients] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch('/api/patients')
    .then(res => res.json())
    .then(data => {
      setPatients(data.patients);
      setLoading(false);
    });
}, []);

const handleAdd = async (data) => {
  await fetch('/api/patients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  fetchPatients(); // 수동 리프레시
};
```

### After
```typescript
const { data: patients, isLoading } = usePatients();
const createPatient = useCreatePatient();

const handleAdd = async (data) => {
  await createPatient.mutateAsync(data);
  // 자동으로 리프레시됨!
};
```

## 🎨 고급 기능

### Optimistic Updates

```typescript
const updatePatient = useMutation({
  mutationFn: updatePatientAPI,
  onMutate: async (newData) => {
    // 진행 중인 쿼리 취소
    await queryClient.cancelQueries({ queryKey: patientKeys.detail(id) });
    
    // 이전 값 저장
    const previousPatient = queryClient.getQueryData(patientKeys.detail(id));
    
    // Optimistic 업데이트
    queryClient.setQueryData(patientKeys.detail(id), newData);
    
    return { previousPatient };
  },
  onError: (err, newData, context) => {
    // 에러 시 롤백
    queryClient.setQueryData(patientKeys.detail(id), context.previousPatient);
  },
  onSettled: () => {
    // 성공/실패 관계없이 리프레시
    queryClient.invalidateQueries({ queryKey: patientKeys.detail(id) });
  },
});
```

### Infinite Queries (페이지네이션)

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

function useInfinitePatients() {
  return useInfiniteQuery({
    queryKey: ['patients', 'infinite'],
    queryFn: ({ pageParam = 0 }) => fetchPatients({ page: pageParam }),
    getNextPageParam: (lastPage, pages) => lastPage.nextPage,
  });
}
```

## 🐛 문제 해결

### 캐시가 업데이트되지 않을 때

```typescript
// 명시적으로 무효화
queryClient.invalidateQueries({ queryKey: patientKeys.lists() });

// 또는 특정 쿼리만 무효화
queryClient.invalidateQueries({ queryKey: patientKeys.detail(id) });
```

### 수동 리프레시가 필요할 때

```typescript
const { refetch } = usePatients();

// 버튼 클릭 시 리프레시
<button onClick={() => refetch()}>새로고침</button>
```

## 📚 참고 자료

- [React Query 공식 문서](https://tanstack.com/query/latest)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
- 기존 구현 예시: `lib/queries/patients.ts`
- 마이그레이션 예시: `app/[locale]/dashboard/patients/page.tsx`

## 🚀 다음 단계

다음 페이지들을 마이그레이션할 수 있습니다:

1. **예약 페이지** (`app/[locale]/dashboard/appointments/page.tsx`)
2. **캠페인 페이지** (`app/[locale]/dashboard/campaigns/page.tsx`)
3. **웹훅 페이지** (`app/[locale]/dashboard/webhooks/page.tsx`)
4. **이벤트 CRM 페이지** (`app/[locale]/dashboard/event-crm/page.tsx`)

각 페이지에 대해 `lib/queries/[resource].ts` 파일을 생성하고 컴포넌트를 마이그레이션하세요.

