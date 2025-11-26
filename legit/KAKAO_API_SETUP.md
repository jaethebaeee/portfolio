# Kakao Business Messaging API 설정 가이드

## 환경 변수 설정

`.env.local` 파일에 다음 변수를 추가하세요:

```env
KAKAO_REST_API_KEY=your_kakao_rest_api_key_here
```

## Kakao REST API 키 발급

1. [Kakao Developers](https://developers.kakao.com) 접속
2. 내 애플리케이션 > 애플리케이션 선택 또는 생성
3. **앱 키** > **REST API 키** 복사
4. `.env.local` 파일에 `KAKAO_REST_API_KEY`로 설정

## Kakao Business Messaging API 사용

### 현재 구현 상태

현재 코드는 기본적인 Kakao API 연동 구조를 포함하고 있습니다:

1. **액세스 토큰 발급**: REST API 키를 사용하여 액세스 토큰 발급
2. **메시지 발송 API**: Kakao Talk 메시지 발송 엔드포인트 호출

### 실제 메시지 발송을 위한 추가 설정

실제로 카카오톡 메시지를 발송하려면 다음 중 하나가 필요합니다:

#### 옵션 1: Kakao Talk 친구톡 (앱 사용자에게만 발송 가능)

- 앱 사용자가 앱에 연결되어 있어야 함
- 사용자 UUID 필요
- 비즈니스 계정 불필요

#### 옵션 2: Kakao AlimTalk (알림톡)

- Kakao Business 계정 필요
- 템플릿 승인 필요
- 전화번호로 발송 가능
- 비즈니스 인증 필요

### 테스트 발송 기능

대시보드의 "카톡 테스트 발송" 버튼을 클릭하면:

1. 개발 모드 (`NODE_ENV=development`):
   - 실제 API 호출을 시도하지만, 전화번호가 없으면 모의 응답 반환
   - 콘솔에 발송 예정 메시지 로그 출력

2. 프로덕션 모드:
   - 실제 API 호출 시도
   - 전화번호 필수
   - Kakao Business 계정 및 설정 필요

### 실제 발송을 위한 코드 수정

실제로 메시지를 발송하려면:

1. **전화번호 입력 기능 추가**:
   - 대시보드에 전화번호 입력 필드 추가
   - 또는 사용자 프로필에서 전화번호 가져오기

2. **Kakao Business 계정 설정**:
   - [Kakao Business](https://business.kakao.com)에서 계정 생성
   - AlimTalk 템플릿 등록 및 승인

3. **API 엔드포인트 수정**:
   - `lib/kakao.ts`의 `sendKakaoAlimTalk` 함수 사용
   - 템플릿 ID 설정

## 참고 자료

- [Kakao Developers 문서](https://developers.kakao.com/docs)
- [Kakao Business Messaging API](https://developers.kakao.com/docs/latest/ko/kakaotalk-rest-api)
- [AlimTalk 가이드](https://developers.kakao.com/docs/latest/ko/kakaotalk-rest-api/alimtalk)

## 주의사항

- 개발 환경에서는 실제 메시지가 발송되지 않을 수 있습니다
- 프로덕션 환경에서 사용하려면 Kakao Business 계정이 필요합니다
- 메시지 발송 전에 사용자 동의 및 개인정보 처리 방침 확인이 필요합니다

