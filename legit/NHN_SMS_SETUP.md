# NHN Cloud SMS API 설정 가이드

## 환경 변수 설정

`.env.local` 파일에 다음 변수들을 추가하세요:

```env
NHN_SMS_APP_KEY=your_nhn_sms_app_key_here
NHN_SMS_SECRET_KEY=your_nhn_sms_secret_key_here
NHN_SMS_SENDER_PHONE=01012345678  # 발신번호 (선택사항, 기본값 사용 가능)
```

## NHN Cloud SMS 계정 설정

### 1. NHN Cloud 계정 생성

1. [NHN Cloud](https://www.nhncloud.com) 접속
2. 회원가입 및 로그인
3. 콘솔 접속

### 2. SMS 서비스 활성화

1. NHN Cloud 콘솔에서 **SMS** 서비스 선택
2. 서비스 신청 및 승인 대기
3. 승인 완료 후 **앱 키** 및 **Secret 키** 발급

### 3. 앱 키 및 Secret 키 확인

1. NHN Cloud 콘솔 > **SMS** > **앱 키 관리**
2. **앱 키** (APP_KEY) 복사 → `NHN_SMS_APP_KEY`에 설정
3. **Secret 키** (SECRET_KEY) 복사 → `NHN_SMS_SECRET_KEY`에 설정

### 4. 발신번호 등록

1. NHN Cloud 콘솔 > **SMS** > **발신번호 관리**
2. 발신번호 등록 및 승인
3. 승인된 발신번호를 `NHN_SMS_SENDER_PHONE`에 설정 (선택사항)

## API 사용 방법

### 대시보드에서 테스트

1. 대시보드 접속
2. **문자 테스트** 버튼 클릭
3. "성형 수술 D-1 리마인더" SMS 발송 시도

### API 엔드포인트

```typescript
POST /api/nhn/send-sms
Content-Type: application/json

{
  "recipientPhone": "01012345678"  // 수신자 전화번호 (선택사항)
}
```

## 현재 구현 상태

### 개발 모드

- 전화번호가 없으면 모의 응답 반환
- 실제 API 호출 실패 시에도 성공으로 처리 (시뮬레이션)

### 프로덕션 모드

- 실제 NHN Cloud SMS API 호출
- 수신자 전화번호 필수
- 발송 결과 반환

## 메시지 내용

현재 테스트 메시지: **"성형 수술 D-1 리마인더"**

메시지 내용을 변경하려면 `lib/nhn-sms.ts`의 `sendTestSMS` 함수에서 수정하세요.

## 주의사항

1. **발신번호 등록**: 실제 발송을 위해서는 NHN Cloud에서 발신번호를 등록하고 승인받아야 합니다.

2. **서비스 승인**: SMS 서비스 사용을 위해서는 NHN Cloud에서 서비스 승인이 필요할 수 있습니다.

3. **과금**: SMS 발송 시 건당 과금이 발생합니다. 테스트 시 주의하세요.

4. **전화번호 형식**: 전화번호는 하이픈(-) 없이 숫자만 입력하세요 (예: 01012345678).

5. **개인정보**: 실제 사용 시 개인정보 보호법을 준수하여 사용자 동의를 받아야 합니다.

## 참고 자료

- [NHN Cloud SMS 가이드](https://docs.nhncloud.com/ko/Notification/SMS/ko/api-guide/)
- [NHN Cloud 콘솔](https://console.nhncloud.com)

## 문제 해결

### 액세스 토큰 발급 실패

- `NHN_SMS_APP_KEY`와 `NHN_SMS_SECRET_KEY`가 올바르게 설정되었는지 확인
- NHN Cloud 콘솔에서 키가 활성화되어 있는지 확인

### SMS 발송 실패

- 발신번호가 등록되고 승인되었는지 확인
- 수신자 전화번호 형식이 올바른지 확인 (하이픈 없이 숫자만)
- NHN Cloud 콘솔에서 서비스 상태 확인

