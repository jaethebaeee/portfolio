# Coolsms (SOLAPI) SMS API 설정 가이드

## 개요

Coolsms는 한국에서 가장 인기 있는 SMS API 제공업체 중 하나로, 99.9%의 높은 배송률과 한국 규제 준수를 제공합니다. NHN Cloud SMS와 함께 사용할 수 있는 대안 SMS 제공업체입니다.

## 특징

- **99.9% 배송률** (한국 내)
- **한국어 문자 지원** 완벽 지원
- **대량 메시지 캠페인** 지원
- **배송 영수증 및 분석** 제공
- **전화번호 검증** 기능
- **예약 메시지** 지원
- **한국 규제 준수**
- **국제 제공업체보다 저렴한 비용**

## 환경 변수 설정

`.env.local` 파일에 다음 변수들을 추가하세요:

```env
# Coolsms API 설정 (선택사항 - NHN SMS와 함께 사용 가능)
COOLSMS_API_KEY=your_coolsms_api_key_here
COOLSMS_API_SECRET=your_coolsms_api_secret_here
COOLSMS_SENDER_PHONE=15771603  # 발신번호 (선택사항, 기본값: 15771603)
```

## Coolsms 계정 설정

### 1. Coolsms 계정 생성

1. [Coolsms](https://coolsms.co.kr/) 접속
2. 회원가입 및 로그인
3. 실명 인증 및 사업자 정보 등록

### 2. API 키 발급

1. Coolsms 콘솔 접속
2. **API 설정** > **API 키 관리** 메뉴 선택
3. **새 API 키 생성** 버튼 클릭
4. API 키와 시크릿 키 발급
5. `COOLSMS_API_KEY` ← API 키 복사
6. `COOLSMS_API_SECRET` ← 시크릿 키 복사

### 3. 발신번호 등록

1. Coolsms 콘솔 > **발신번호 관리**
2. 발신번호 등록 및 승인 요청
3. 승인된 발신번호를 `COOLSMS_SENDER_PHONE`에 설정 (선택사항)

### 4. 잔액 충전

1. Coolsms 콘솔 > **충전하기**
2. 신용카드 또는 계좌이체로 잔액 충전
3. SMS 발송 단가는 약 20-30원 (메시지 길이에 따라 변동)

## API 사용 방법

### 스마트 메시징에서 사용

```typescript
import { sendSmartMessage } from '@/lib/smart-messaging';

// Coolsms를 SMS 제공업체로 사용
const result = await sendSmartMessage(userId, {
  recipientPhone: '01012345678',
  content: '테스트 메시지',
}, context, 'coolsms');
```

### SMS만 발송

```typescript
import { sendSMSOnly } from '@/lib/smart-messaging';

// Coolsms로 SMS만 발송
const result = await sendSMSOnly(userId, {
  recipientPhone: '01012345678',
  content: '테스트 메시지',
}, context, 'coolsms');
```

### 직접 API 사용

```typescript
import { sendCoolsmsTestSMS } from '@/lib/coolsms';

// 테스트 SMS 발송
const result = await sendCoolsmsTestSMS('01012345678', '테스트 메시지');
```

## 현재 구현 상태

### 개발 모드

- 전화번호가 없으면 모의 응답 반환
- 실제 API 호출 실패 시에도 성공으로 처리 (시뮬레이션)

### 프로덕션 모드

- 실제 Coolsms API 호출
- 수신자 전화번호 필수
- 발송 결과 반환

## 메시지 유형

Coolsms는 다음 메시지 유형을 지원합니다:

- **SMS**: 90바이트 이내 텍스트 (한글 45자)
- **LMS**: 2,000바이트 이내 텍스트 (긴 메시지)
- **MMS**: 이미지 첨부 가능

현재 구현에서는 메시지 길이에 따라 자동으로 SMS/LMS를 선택합니다.

## 요금 정보

- **SMS**: 약 20-25원/건
- **LMS**: 약 50-60원/건
- **MMS**: 약 150-200원/건

> 💡 **팁**: NHN SMS와 Coolsms를 함께 사용하여 비용 최적화 및 안정성 확보 가능

## API 엔드포인트

### Coolsms SMS 발송 (향후 구현 예정)

```
POST /api/coolsms/send-sms
Content-Type: application/json

{
  "recipientPhone": "01012345678",  // 수신자 전화번호 (선택사항)
  "content": "발송할 메시지 내용"    // 메시지 내용 (선택사항)
}
```

## 공급업체 비교

| 기능 | NHN Cloud SMS | Coolsms (SOLAPI) |
|------|---------------|------------------|
| 배송률 | 99.5% | 99.9% |
| 한국어 지원 | 완벽 | 완벽 |
| 대량 발송 | 지원 | 지원 |
| 분석 기능 | 기본 | 상세 |
| 비용 | 중간 | 저렴 |
| 설정 복잡도 | 중간 | 간단 |
| 국제 발송 | 지원 | 지원 |

## 주의사항

1. **발신번호 등록**: 실제 발송을 위해서는 Coolsms에서 발신번호를 등록하고 승인받아야 합니다.

2. **실명 인증**: 개인/사업자 실명 인증이 필요합니다.

3. **잔액 관리**: SMS 발송 시 실시간 차감되므로 잔액을 충분히 유지하세요.

4. **메시지 길이**: 90바이트를 초과하면 LMS로 자동 전환됩니다.

5. **스팸 방지**: 동일한 내용의 반복 발송은 제한될 수 있습니다.

6. **개인정보**: 실제 사용 시 개인정보 보호법을 준수하여 사용자 동의를 받아야 합니다.

## 문제 해결

### API 키 오류

- `COOLSMS_API_KEY`와 `COOLSMS_API_SECRET`가 올바르게 설정되었는지 확인
- Coolsms 콘솔에서 API 키가 활성화되어 있는지 확인

### 발송 실패

- 발신번호가 등록되고 승인되었는지 확인
- 잔액이 충분한지 확인
- 수신자 전화번호 형식이 올바른지 확인 (하이픈 없이 숫자만)

### 잔액 조회

```typescript
import { getCoolsmsBalance } from '@/lib/coolsms';

const balance = await getCoolsmsBalance();
console.log('현재 잔액:', balance.balance);
```

## 참고 자료

- [Coolsms 공식 사이트](https://coolsms.co.kr/)
- [Coolsms 개발자 문서](https://developers.solapi.com/)
- [SOLAPI SDK](https://github.com/solapi)
- [Coolsms 콘솔](https://console.coolsms.co.kr/)

## 다음 단계

1. Coolsms 계정 생성 및 API 키 발급
2. 환경 변수 설정
3. 테스트 발송
4. 프로덕션에서 NHN SMS와 함께 사용 고려
