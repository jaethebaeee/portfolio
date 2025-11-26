# 무료 API 기능 구현 가이드

## 📦 필요한 패키지 설치

```bash
# QR 코드 생성
npm install qrcode @types/qrcode

# 기타는 API 호출만 사용 (추가 패키지 불필요)
```

## 🔑 API 키 발급 가이드

### 1. 공휴일 API (공공데이터포털)
1. [공공데이터포털](https://www.data.go.kr/) 회원가입
2. "공휴일 정보" 검색
3. API 신청 및 키 발급
4. `.env.local`에 추가:
```env
HOLIDAY_API_KEY=your_holiday_api_key_here
```

### 2. Kakao Map API
1. [Kakao Developers](https://developers.kakao.com/) 로그인
2. 애플리케이션 생성
3. 플랫폼 설정 (웹 도메인 등록)
4. JavaScript 키 발급
5. `.env.local`에 추가:
```env
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_key_here
```

### 3. Kakao 주소 검색 API
- 이미 `KAKAO_REST_API_KEY` 사용 중이면 추가 설정 불필요
- 같은 REST API 키 사용

## 🚀 구현 예시

### 공휴일 체크 기능
```typescript
// 예약 페이지에서 사용
import { isAvailableDate, getAvailableDates } from '@/lib/holiday-api';

// 예약 가능 여부 확인
const checkDate = new Date('2024-01-01');
const { available, reason } = await isAvailableDate(checkDate);

// 예약 가능한 날짜 목록 가져오기
const availableDates = await getAvailableDates(new Date(), 30);
```

### QR 코드 생성
```typescript
// 예약 생성 시 QR 코드 생성
import { generateAppointmentQRCode } from '@/lib/qr-code';

const qrCodeImage = await generateAppointmentQRCode(
  appointmentId,
  patientName,
  appointmentDate,
  appointmentTime
);
// qrCodeImage는 base64 이미지 데이터 URL
```

### Kakao Map 표시
```typescript
// 컴포넌트에서 사용
import { loadKakaoMapScript, getDefaultHospitalLocation } from '@/lib/kakao-map';

useEffect(() => {
  loadKakaoMapScript().then(() => {
    // 지도 초기화
    const location = getDefaultHospitalLocation();
    const container = document.getElementById('map');
    const options = {
      center: new kakao.maps.LatLng(location.lat, location.lng),
      level: 3,
    };
    const map = new kakao.maps.Map(container, options);
  });
}, []);
```

### 주소 검색
```typescript
// 환자 등록 폼에서 사용
import { searchAddress } from '@/lib/address-search';

const handleAddressSearch = async (query: string) => {
  const results = await searchAddress(query);
  // 결과를 드롭다운으로 표시
};
```

## 📝 환경 변수 추가

`.env.local`에 다음 변수들을 추가하세요:

```env
# 공휴일 API (공공데이터포털)
HOLIDAY_API_KEY=your_holiday_api_key_here

# Kakao Map API
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_key_here

# Kakao 주소 검색 (기존 KAKAO_REST_API_KEY 사용)
# KAKAO_REST_API_KEY=your_kakao_rest_api_key_here (이미 설정됨)
```

## 🎯 통합 예시

### 예약 페이지에 공휴일 체크 통합
```typescript
// app/[locale]/dashboard/appointments/page.tsx
import { isAvailableDate } from '@/lib/holiday-api';

const handleDateSelect = async (date: Date) => {
  const { available, reason } = await isAvailableDate(date);
  if (!available) {
    toast.error(reason);
    return;
  }
  // 예약 진행
};
```

### 예약 확인서에 QR 코드 추가
```typescript
// 예약 상세 페이지
import { generateAppointmentQRCode } from '@/lib/qr-code';

const qrCode = await generateAppointmentQRCode(
  appointment.id,
  patient.name,
  appointment.appointment_date,
  appointment.appointment_time
);

// <img src={qrCode} alt="예약 QR 코드" />
```

## 💡 추가 기능 아이디어

1. **공휴일 자동 안내**: 공휴일 전날 자동으로 안내 메시지 발송
2. **QR 코드 체크인**: 현장에서 QR 코드 스캔으로 예약 확인
3. **지도 기반 거리 계산**: 환자 거리별 맞춤 메시지
4. **주소 기반 지역 마케팅**: 지역별 맞춤 캠페인

