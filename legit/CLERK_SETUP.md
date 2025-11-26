# Clerk 소셜 로그인 설정 가이드

## Google 소셜 로그인 설정

### 1. Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **API 및 서비스** > **사용자 인증 정보**로 이동
4. **사용자 인증 정보 만들기** > **OAuth 클라이언트 ID** 선택
5. 애플리케이션 유형: **웹 애플리케이션** 선택
6. 승인된 리디렉션 URI 추가:
   ```
   https://your-clerk-domain.clerk.accounts.dev/v1/oauth_callback
   ```
   (Clerk Dashboard에서 확인 가능)
7. Client ID와 Client Secret 복사

### 2. Clerk Dashboard 설정

1. [Clerk Dashboard](https://dashboard.clerk.com) 접속
2. **User & Authentication** > **Social Connections** 이동
3. **Google** 연결 활성화
4. Google Cloud Console에서 복사한 **Client ID**와 **Client Secret** 입력
5. 저장

## Kakao 소셜 로그인 설정

### 1. Kakao Developers 설정

1. [Kakao Developers](https://developers.kakao.com) 접속
2. 내 애플리케이션 > 애플리케이션 추가하기
3. 앱 이름, 사업자명 입력 후 저장
4. **앱 키** > **REST API 키** 복사
5. **플랫폼** > **Web 플랫폼 등록**
   - 사이트 도메인: `http://localhost:3000` (개발용)
   - 배포 시 실제 도메인 추가
6. **제품 설정** > **카카오 로그인** 활성화
7. **Redirect URI** 등록:
   ```
   https://your-clerk-domain.clerk.accounts.dev/v1/oauth_callback
   ```
   (Clerk Dashboard에서 확인 가능)

### 2. Clerk Dashboard 설정

1. Clerk Dashboard > **User & Authentication** > **Social Connections**
2. **Kakao** 연결 활성화
3. Kakao Developers에서 복사한 **REST API 키** 입력
4. 저장

## 한국어 설정 확인

코드에서 이미 한국어가 설정되어 있습니다:
- `localization={{ locale: 'ko-KR' }}` 설정됨
- Clerk Dashboard에서도 기본 언어를 한국어로 설정 권장

## 테스트

1. 개발 서버 실행: `npm run dev`
2. `http://localhost:3000/sign-in` 접속
3. Google 또는 Kakao 버튼 클릭하여 소셜 로그인 테스트

## 주의사항

- 소셜 로그인은 Clerk Dashboard에서 활성화해야만 표시됩니다
- 개발 환경에서는 `localhost:3000`을 Kakao Redirect URI에 등록해야 합니다
- 프로덕션 배포 시 실제 도메인을 등록해야 합니다

