# Supabase 설정 가이드

닥터스플로우 프로젝트에서 Supabase를 데이터베이스로 사용하기 위한 설정 가이드입니다.

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입하고 로그인합니다.
2. "New Project"를 클릭하여 새 프로젝트를 생성합니다.
3. 프로젝트 이름, 데이터베이스 비밀번호, 리전을 설정합니다.
4. 프로젝트가 생성될 때까지 기다립니다 (약 2분 소요).

## 2. API 키 확인

1. 프로젝트 대시보드에서 "Settings" → "API"로 이동합니다.
2. 다음 정보를 복사합니다:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: 공개 키 (클라이언트 사이드에서 사용)
   - **service_role key**: 서비스 롤 키 (서버 사이드에서만 사용, 비밀!)

## 3. 환경 변수 설정

`.env.local` 파일에 다음 변수들을 추가합니다:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

⚠️ **주의**: `SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트 사이드에 노출되면 안 됩니다. 서버 사이드에서만 사용됩니다.

## 4. 데이터베이스 스키마 생성

### 방법 1: Supabase SQL Editor 사용 (권장)

1. Supabase 대시보드에서 "SQL Editor"로 이동합니다.
2. `supabase/migrations/001_initial_schema.sql` 파일의 내용을 복사합니다.
3. SQL Editor에 붙여넣고 "Run" 버튼을 클릭합니다.
4. 모든 테이블과 정책이 생성되었는지 확인합니다.

### 방법 2: Supabase CLI 사용

```bash
# Supabase CLI 설치 (선택사항)
npm install -g supabase

# 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref your-project-ref

# 마이그레이션 실행
supabase db push
```

## 5. 테이블 확인

Supabase 대시보드의 "Table Editor"에서 다음 테이블들이 생성되었는지 확인합니다:

- ✅ `patients` - 환자 정보
- ✅ `appointments` - 예약 정보
- ✅ `templates` - 마케팅 템플릿
- ✅ `campaigns` - 캠페인
- ✅ `message_logs` - 발송 이력

## 6. Row Level Security (RLS) 확인

각 테이블의 "Policies" 탭에서 RLS 정책이 활성화되어 있는지 확인합니다:

- 사용자는 자신의 데이터만 조회/생성/수정/삭제 가능
- `user_id` 필드가 Clerk의 `userId`와 일치하는 데이터만 접근 가능

## 7. 테스트

환자 API를 테스트해봅니다:

```bash
# 환자 목록 조회
curl http://localhost:3000/api/patients

# 환자 생성
curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "홍길동",
    "phone": "010-1234-5678"
  }'
```

## 8. 문제 해결

### RLS 정책 오류

만약 "permission denied" 오류가 발생하면:

1. Supabase 대시보드에서 "Authentication" → "Policies" 확인
2. RLS 정책이 올바르게 설정되었는지 확인
3. `user_id` 필드가 Clerk의 `userId`와 일치하는지 확인

### 연결 오류

- `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 올바른지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인
- 네트워크 연결 상태 확인

## 9. 다음 단계

데이터베이스 설정이 완료되면:

1. ✅ 환자 데이터 관리 기능 사용 가능
2. ✅ 발송 이력 자동 저장
3. ✅ 템플릿을 Supabase에 저장 (localStorage 대신)
4. ✅ 캠페인 관리 기능 사용 가능

## 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase JavaScript 클라이언트](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)

