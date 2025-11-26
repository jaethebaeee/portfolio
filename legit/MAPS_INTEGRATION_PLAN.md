# 지도/위치 서비스 도입 계획 (Kakao Maps)

## 1. 선정 기술: Kakao Maps API

### 선정 이유
1. **사용자 친화적 UI**: 한국인 99%에게 익숙한 인터페이스를 제공하여 사용자 경험(UX)을 극대화합니다.
2. **필수 기능**: 병원 위치 찾기 및 길찾기 링크 전송은 예약 환자에게 필수적인 기능입니다.
3. **경제성**: 넉넉한 무료 쿼터를 제공하여 초기 도입 및 운영 비용 부담이 적습니다.

## 2. 주요 구현 대상 기능

### 병원 위치 표시 (Web Embed)
- **목적**: 홈페이지/랜딩 페이지 내 병원 위치 시각화
- **기능**:
  - 병원 위치에 마커 표시
  - 약도 및 주변 랜드마크 표시
  - 줌 인/아웃 컨트롤
  - '큰 지도로 보기' 버튼 제공

### 길찾기 링크 전송 (AlimTalk 연동)
- **목적**: 예약 확정 메시지 발송 시 길찾기 편의 제공
- **기능**:
  - 알림톡 버튼에 '길찾기' 기능 연동
  - 클릭 시 카카오맵 앱 자동 실행 및 목적지(병원) 자동 설정
  - 대중교통/자가용 경로 탐색 바로 연결

## 3. 기술 스택 및 구현 방법

### Web SDK (JavaScript)
- **용도**: 웹페이지 내 지도 임베딩
- **구현**:
  - `react-kakao-maps-sdk` (React 래퍼 라이브러리) 활용 고려
  - 커스텀 오버레이를 통한 병원 정보(진료 시간, 전화번호) 표시

### URL Scheme / Web URL
- **용도**: 알림톡/문자 내 길찾기 링크
- **형식**:
  - Web: `https://map.kakao.com/link/to/병원명,위도,경도`
  - App Scheme: `kakaomap://route?ep=위도,경도&by=CAR` (자가용)

## 4. 설정 및 준비 사항
- Kakao Developers 애플리케이션 생성 (이미 메시지 API용으로 생성된 앱 활용 가능)
- 플랫폼(Web) 사이트 도메인 등록 필수
- JavaScript 키 발급 및 `.env.local` 설정

## 5. 참고 문서
- [Kakao Maps API 가이드](https://apis.map.kakao.com/web/guide/)
- [Kakao Maps URL Scheme](https://apis.map.kakao.com/web/guide/#urlscheme)

