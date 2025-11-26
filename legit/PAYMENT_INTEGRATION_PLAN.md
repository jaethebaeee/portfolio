# 결제 시스템 도입 계획 (추후 도입)

## 1. 선정 기술: PortOne (구 아임포트)

### 선정 이유
1. **표준화된 연동**: KG이니시스, 토스페이먼츠, 나이스페이먼츠 등 국내 주요 PG사와의 연동 표준입니다.
2. **개발 효율성**: 예약금 결제 기능 구현 시 개발 공수가 가장 적게 듭니다.
3. **유연성**: 추후 PG사를 변경하더라도 코드 수정이 최소화됩니다.

## 2. 주요 구현 대상 기능

### 예약금 결제 (Deposit Payment)
- **목적**: 노쇼 방지 및 예약 확정
- **프로세스**:
  1. 예약 생성 시 결제 요청
  2. PortOne SDK를 통한 결제 창 호출
  3. 결제 성공 시 예약 상태 '확정'으로 변경
  4. 결제 실패 시 예약 상태 '대기' 또는 '취소' 처리

### 결제 취소 및 환불
- 관리자 페이지에서 예약 취소 시 자동 환불 처리 연동
- 부분 환불 (위약금 제외 후 환불) 로직 고려

## 3. 기술 스택 및 라이브러리

- **Client**: PortOne JS SDK V2
- **Server**: PortOne REST API (Node.js/TypeScript)
- **Database**: `payments` 테이블 추가 필요 (결제 고유 ID, 주문 번호, 금액, 상태, 결제 수단 등)

## 4. 데이터베이스 스키마 초안 (예상)

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID REFERENCES reservations(id),
  merchant_uid VARCHAR(255) NOT NULL UNIQUE, -- 주문 번호
  imp_uid VARCHAR(255), -- 아임포트 결제 고유 번호
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL, -- paid, ready, failed, cancelled
  pg_provider VARCHAR(50),
  pay_method VARCHAR(50),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 5. 참고 문서
- [PortOne 개발자 가이드](https://developers.portone.io/docs/ko/readme)
- [PortOne V2 API Reference](https://developers.portone.io/api/rest-v2)

