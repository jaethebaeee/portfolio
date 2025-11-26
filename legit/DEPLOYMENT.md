# 🚀 DoctorsFlow 배포 가이드 (Phase 1)

**DoctorsFlow**를 실제 운영 환경(Production)에 배포하기 위한 상세 가이드입니다.
이 문서는 **Vercel** (Frontend/Backend) 및 **Supabase** (Database) 환경을 기준으로 작성되었습니다.

---

## 📋 1. 필수 준비물 (Prerequisites)

배포를 시작하기 전에 아래 계정과 정보가 필요합니다.

1.  **Vercel 계정**: 프론트엔드 및 API 호스팅
2.  **Supabase 프로젝트**: 데이터베이스 및 인증 관리
3.  **Clerk 계정**: 사용자 인증 및 관리
4.  **카카오 개발자 계정**: 카카오 로그인 및 메시지 전송
5.  **Coolsms (Solapi) 또는 NHN Cloud 계정**: 문자 메시지 발송

---

## 🗄️ 2. Supabase 설정 (Database)

1.  **새 프로젝트 생성**: Supabase 대시보드에서 새 프로젝트를 생성합니다.
2.  **SQL 마이그레이션 적용**:
    *   프로젝트 루트의 `supabase/migrations/` 폴더 내의 SQL 파일들을 순서대로 실행합니다.
    *   Supabase 대시보드 > SQL Editor에서 쿼리를 복사/붙여넣기하여 실행하세요.
    *   **필수 순서**: `001_initial_schema.sql` ... `009_doctor_management.sql` 등 모든 파일.
3.  **Storage 버킷 생성**:
    *   Supabase Storage에서 `patient-photos`라는 이름으로 **Public Bucket**을 생성합니다.
    *   (옵션) 보안 정책(Policy)을 설정하여 인증된 사용자만 업로드하도록 제한할 수 있습니다.

---

## 🔐 3. 환경 변수 설정 (Environment Variables)

Vercel 배포 시 아래 환경 변수들을 설정해야 합니다. (`.env.local` 참조)

### 필수 (Critical)
| 변수명 | 설명 | 비고 |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | Supabase 설정 > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | Supabase 설정 > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | **절대 노출 금지** |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk 공개 키 | Clerk 대시보드 |
| `CLERK_SECRET_KEY` | Clerk 비밀 키 | Clerk 대시보드 |
| `CRON_SECRET` | Vercel Cron 인증용 비밀 키 | 임의의 긴 문자열 생성 |

### 메시징 연동 (Messaging)
| 변수명 | 설명 | 비고 |
| :--- | :--- | :--- |
| `SOLAPI_API_KEY` | Coolsms API Key | 메시지 발송용 |
| `SOLAPI_API_SECRET` | Coolsms API Secret | |
| `SOLAPI_SENDER_PHONE` | 발신번호 (사전 등록 필수) | |

### 카카오 로그인 (Kakao Login)
*   **Clerk 대시보드**에서 설정하며, 별도 환경 변수는 필요 없습니다.
*   단, `KAKAO_LOGIN_SETUP.md`를 참고하여 **Kakao Developers**에서 Redirect URI 설정을 마쳐야 합니다.

---

## 🚀 4. Vercel 배포 (Deployment)

1.  **GitHub 리포지토리 연결**: Vercel 대시보드에서 `New Project` > DoctorsFlow 리포지토리 선택.
2.  **환경 변수 입력**: 위에서 준비한 환경 변수들을 모두 입력합니다.
3.  **배포 시작**: `Deploy` 버튼 클릭.

### ✅ Vercel Cron Job 확인
배포가 완료되면, Vercel 대시보드 > **Settings** > **Cron Jobs** 탭으로 이동하세요.
*   `0 1 * * *` (UTC 01:00 = KST 10:00) 스케줄이 등록되어 있어야 합니다.
*   `CRON_SECRET` 환경 변수가 올바르게 설정되어 있다면, 매일 오전 10시에 자동으로 `/api/cron/trigger`가 호출됩니다.

---

## 🔌 5. 네이버 예약 연동 (Chrome Extension)

이 시스템은 공식 API가 없는 네이버 예약을 연동하기 위해 **Chrome Extension**을 사용합니다.

1.  `extension/` 폴더를 다운로드합니다.
2.  병원 PC의 Chrome 브라우저에서 `chrome://extensions` 접속.
3.  **개발자 모드** 켜기.
4.  **압축해제된 확장 프로그램 로드** 클릭 후 `extension/` 폴더 선택.
5.  **확장 프로그램 설정**:
    *   확장 프로그램 팝업 클릭 > **User ID** 입력 (Supabase/Clerk의 User ID).
    *   네이버 스마트플레이스 예약 관리 페이지 접속 시 자동으로 데이터가 동기화됩니다.

---

## ✅ 6. 최종 점검 리스트 (Checklist)

- [ ] **로그인 테스트**: 카카오톡 아이디로 로그인이 잘 되는가?
- [ ] **환경 변수 검증**: `/dashboard/settings/env-check` 페이지에서 모든 항목이 ✅인지 확인.
- [ ] **메시지 발송 테스트**: 본인 번호로 테스트 메시지 발송 (카카오톡 -> 실패 시 문자).
- [ ] **자동화 테스트**: 워크플로우를 만들고 Cron Job을 수동 실행(`Test` 버튼)하여 발송 확인.
- [ ] **사진 업로드**: 환자 상세 페이지에서 사진 업로드가 잘 되는가?

---

**축하합니다! 이제 DoctorsFlow가 실제 병원 운영을 도울 준비가 되었습니다.** 🎉
