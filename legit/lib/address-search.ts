/**
 * 주소 검색 API 유틸리티
 * Kakao 주소 검색 API 사용
 * 
 * 참고: Kakao Developers에서 REST API 키 발급 필요
 * https://developers.kakao.com/
 */

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY || '';

/**
 * 주소 검색 결과
 */
export interface AddressSearchResult {
  address_name: string; // 전체 주소
  road_address_name?: string; // 도로명 주소
  jibun_address_name?: string; // 지번 주소
  x: string; // 경도
  y: string; // 위도
  zone_no?: string; // 우편번호
}

/**
 * 주소 검색
 */
export async function searchAddress(query: string): Promise<AddressSearchResult[]> {
  if (!KAKAO_REST_API_KEY) {
    console.warn('KAKAO_REST_API_KEY가 설정되지 않았습니다.');
    return [];
  }

  try {
    const url = 'https://dapi.kakao.com/v2/local/search/address.json';
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
      },
      // Next.js에서 fetch 캐싱 방지
      cache: 'no-store',
    } as RequestInit);

    if (!response.ok) {
      throw new Error(`주소 검색 API 호출 실패: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.documents && Array.isArray(data.documents)) {
      return data.documents.map((doc: any) => ({
        address_name: doc.address_name,
        road_address_name: doc.road_address?.address_name,
        jibun_address_name: doc.address?.address_name,
        x: doc.x,
        y: doc.y,
        zone_no: doc.road_address?.zone_no || doc.address?.zone_no,
      }));
    }

    return [];
  } catch (error) {
    console.error('주소 검색 오류:', error);
    return [];
  }
}

/**
 * 키워드로 장소 검색 (병원 위치 찾기 등)
 */
export async function searchPlace(query: string): Promise<AddressSearchResult[]> {
  if (!KAKAO_REST_API_KEY) {
    console.warn('KAKAO_REST_API_KEY가 설정되지 않았습니다.');
    return [];
  }

  try {
    const url = 'https://dapi.kakao.com/v2/local/search/keyword.json';
    const params = new URLSearchParams({
      query,
      size: '5',
    });

    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
      },
      cache: 'no-store',
    } as RequestInit);

    if (!response.ok) {
      throw new Error(`장소 검색 API 호출 실패: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.documents && Array.isArray(data.documents)) {
      return data.documents.map((doc: any) => ({
        address_name: doc.address_name,
        road_address_name: doc.road_address_name,
        x: doc.x,
        y: doc.y,
      }));
    }

    return [];
  } catch (error) {
    console.error('장소 검색 오류:', error);
    return [];
  }
}

