# 🟡 Clerk + Kakao Login 연동 가이드

한국 병원/의료진이 **카카오톡 아이디**로 쉽게 로그인할 수 있도록 설정하는 가이드입니다.

## 1. 카카오 개발자 센터 설정 (Kakao Developers)

1.  [Kakao Developers](https://developers.kakao.com/) 접속 및 로그인
2.  **내 애플리케이션** > **애플리케이션 추가하기**
3.  **앱 이름**: `DoctorsFlow` (또는 병원명), **사업자명**: 입력
4.  생성된 앱 선택 후 **요약 정보**에서 `REST API 키` 복사 (나중에 Clerk에 입력 필요)
5.  **플랫폼** > **Web** 설정
    *   사이트 도메인 등록:
        *   `http://localhost:3000` (개발용)
        *   `https://your-production-domain.com` (배포용)
6.  **카카오 로그인** > **활성화 설정**을 `ON`으로 변경
7.  **카카오 로그인** > **Redirect URI** 등록
    *   Clerk 대시보드에서 제공하는 URI를 입력해야 합니다 (2단계 참조).
8.  **동의항목** 설정
    *   `닉네임` (필수)
    *   `프로필 사진` (선택)
    *   `카카오계정(이메일)` (권장) - 이메일 기반 계정 연동 시 필요
    *   `카카오계정(전화번호)` (권장) - **중요**: 병원 마케팅 시 '본인 인증된 번호'로 활용 가능 (비즈니스 채널 검수 필요)

## 2. Clerk 대시보드 설정

1.  [Clerk Dashboard](https://dashboard.clerk.com/) 접속
2.  **User & Authentication** > **Social Connections** 이동
3.  **Add connection** 클릭 후 `Kakao` 검색 및 선택
4.  **Kakao 설정 입력**:
    *   **Client ID**: 카카오 `REST API 키` 입력
    *   **Client Secret**: 카카오 **보안** > **Client Secret**에서 코드 생성 후 입력 (활성화 필요)
5.  **Authorized Redirect URI** 복사
    *   이 주소를 카카오 개발자 센터의 **Redirect URI**에 붙여넣기 하세요.
6.  **Save** 클릭하여 저장

## 3. 코드 확인 (이미 적용됨)

`app/[locale]/sign-in/[[...sign-in]]/page.tsx` 파일에 카카오 버튼 스타일링이 이미 적용되어 있습니다.

```tsx
// app/[locale]/sign-in/[[...sign-in]]/page.tsx
socialButtonsBlockButton__kakao: "bg-[#FEE500] text-black hover:bg-[#FDD835]",
```

설정이 완료되면 로그인 화면에 노란색 **"Continue with Kakao"** 버튼이 자동으로 나타납니다.

## 4. (옵션) 카카오 싱크 (Biz Channel)

병원 마케팅을 위해 환자의 **전화번호**를 자동으로 수집하려면:
1.  카카오 비즈니스 센터에서 **비즈 앱**으로 전환 심사 완료.
2.  동의항목에서 `전화번호`를 '필수' 또는 '선택'으로 설정.
3.  Clerk가 로그인 시 전화번호를 받아와 `user.phoneNumbers`에 저장합니다.

---
✅ **Tip**: 카카오 로그인은 한국 사용자 경험(UX)의 핵심입니다. 반드시 활성화하세요!

