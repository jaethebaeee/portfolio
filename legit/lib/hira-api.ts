/**
 * HIRA (건강보험심사평가원) API Integration
 * 
 * Uses the Public Data Portal (data.go.kr) API for Hospital/Pharmacy Information.
 * Service: Health Insurance Review & Assessment Service - Hospital/Pharmacy Info Service
 */

const HIRA_API_KEY = process.env.HIRA_API_KEY || process.env.HOLIDAY_API_KEY || '';
const HIRA_API_BASE_URL = 'http://apis.data.go.kr/B551182/hospInfoServicev2';

export interface HiraHospitalItem {
  yadmNm: string; // Hospital Name (e.g. "서울아산병원")
  addr: string;   // Address
  telno: string;  // Telephone Number
  clCd: string;   // Clinic Code (e.g. "01" for Superior General Hospital)
  clCdNm: string; // Clinic Code Name (e.g. "상급종합병원")
  xPos: string;   // X Coordinate
  yPos: string;   // Y Coordinate
}

export interface HiraSearchResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: HiraHospitalItem[] | HiraHospitalItem;
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

export async function searchHospitals(query: string): Promise<HiraHospitalItem[]> {
  if (!HIRA_API_KEY) {
    console.warn('HIRA_API_KEY (or HOLIDAY_API_KEY) is not set.');
    return [];
  }

  // Ensure query is URL encoded
  const encodedQuery = encodeURIComponent(query);

  try {
    // getHospBasisList: Basic Hospital Information List
    const url = `${HIRA_API_BASE_URL}/getHospBasisList`;
    const params = new URLSearchParams({
      ServiceKey: HIRA_API_KEY, // ServiceKey is usually passed decoded if using direct HTTP client, but encoded if sticking to string concatenation manually. 
      // Note: public data portal keys often come URL-encoded. If it has %, it is encoded.
      // However, fetch usually encodes values. Let's try passing it directly.
      // Important: ServiceKey handling in node-fetch/next-fetch can be tricky. 
      // Often best to append manually if the key contains special chars.
      yadmNm: query,
      numOfRows: '10',
      pageNo: '1',
      _type: 'json' // Request JSON response
    });

    // NOTE: The data.go.kr ServiceKey often needs to be passed EXACTLY as provided (decoded) if using URLSearchParams,
    // OR encoded if appending to string. 
    // Usually standard is: URLSearchParams encodes everything. So we should provide DECODED key.
    // If env var is "A%3D%3D", that is encoded. Decoded is "A==".
    // Since we don't know the format of the user's key, we might need a workaround or try both.
    // For now, let's assume standard usage.
    
    // Workaround for ServiceKey: URLSearchParams encodes it again which breaks it often.
    // We construct the URL manually for the ServiceKey.
    
    const queryString = `?ServiceKey=${HIRA_API_KEY}&yadmNm=${encodedQuery}&numOfRows=10&pageNo=1&_type=json`;
    const fullUrl = `${url}${queryString}`;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
        console.error(`HIRA API Error: ${response.status} ${response.statusText}`);
        return [];
    }
    
    // Check if content-type is json
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/xml")) {
        // Fallback or Error: Sometimes they ignore _type=json and return XML on error
        const text = await response.text();
        console.warn('HIRA API returned XML instead of JSON:', text.substring(0, 200));
        return [];
    }

    const data = await response.json() as HiraSearchResponse;

    if (data.response?.header?.resultCode !== '00') {
        console.error(`HIRA API Result Error: ${data.response?.header?.resultMsg}`);
        return [];
    }

    const items = data.response?.body?.items?.item;

    if (!items) return [];

    return Array.isArray(items) ? items : [items];

  } catch (error) {
    console.error('Failed to search hospitals:', error);
    return [];
  }
}

