/**
 * Kakao Map API 유틸리티
 * 
 * 참고: Kakao Developers에서 JavaScript 키 발급 필요
 * https://developers.kakao.com/
 */

const KAKAO_MAP_API_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || '';

/**
 * Kakao Map 스크립트 로드
 */
export function loadKakaoMapScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('브라우저 환경에서만 사용 가능합니다.'));
      return;
    }

    // 이미 로드되어 있는지 확인
    if ((window as any).kakao && (window as any).kakao.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&autoload=false`;
    script.async = true;
    
    script.onload = () => {
      if ((window as any).kakao) {
        (window as any).kakao.maps.load(() => {
          resolve();
        });
      } else {
        reject(new Error('Kakao Map 스크립트 로드 실패'));
      }
    };
    
    script.onerror = () => {
      reject(new Error('Kakao Map 스크립트 로드 실패'));
    };

    document.head.appendChild(script);
  });
}

/**
 * 병원 위치 정보 (설정 가능)
 */
export interface HospitalLocation {
  name: string;
  address: string;
  lat: number; // 위도
  lng: number; // 경도
  phone: string;
}

/**
 * 기본 병원 위치 (설정에서 변경 가능)
 */
export function getDefaultHospitalLocation(): HospitalLocation {
  return {
    name: '닥터스플로우 안과·성형외과',
    address: '서울특별시 강남구 테헤란로 123',
    lat: 37.5665, // 예시 좌표
    lng: 127.0780, // 예시 좌표
    phone: '02-1234-5678',
  };
}

/**
 * Kakao Map URL 생성 (길찾기)
 */
export function generateKakaoMapURL(location: HospitalLocation): string {
  return `https://map.kakao.com/link/map/${location.name},${location.lat},${location.lng}`;
}

/**
 * Kakao 길찾기 URL 생성
 */
export function generateKakaoDirectionsURL(
  destination: HospitalLocation,
  startLocation?: { lat: number; lng: number }
): string {
  if (startLocation) {
    return `https://map.kakao.com/link/route/${startLocation.lat},${startLocation.lng}/${destination.lat},${destination.lng}`;
  }
  return `https://map.kakao.com/link/to/${destination.name},${destination.lat},${destination.lng}`;
}

