/**
 * 공휴일 API 유틸리티
 * 공공데이터포털 API 사용
 * 
 * 참고: 실제 사용 시 공공데이터포털에서 API 키 발급 필요
 * https://www.data.go.kr/
 */

const HOLIDAY_API_KEY = process.env.HOLIDAY_API_KEY || '';
const HOLIDAY_API_URL = 'http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService';

/**
 * 공휴일 정보 인터페이스
 */
export interface HolidayInfo {
  dateName: string; // 공휴일 이름
  locdate: string; // 날짜 (YYYYMMDD)
  isHoliday: 'Y' | 'N';
}

/**
 * 특정 연도의 공휴일 목록 조회
 */
export async function getHolidays(year: number): Promise<HolidayInfo[]> {
  if (!HOLIDAY_API_KEY) {
    console.warn('HOLIDAY_API_KEY가 설정되지 않았습니다. 공휴일 정보를 가져올 수 없습니다.');
    return getDefaultHolidays(year); // 기본 공휴일 반환
  }

  try {
    const url = `${HOLIDAY_API_URL}/getHoliDeInfo`;
    const params = new URLSearchParams({
      ServiceKey: HOLIDAY_API_KEY,
      solYear: year.toString(),
      numOfRows: '100',
      _type: 'json',
    });

    const response = await fetch(`${url}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`공휴일 API 호출 실패: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.response?.body?.items?.item) {
      return Array.isArray(data.response.body.items.item)
        ? data.response.body.items.item
        : [data.response.body.items.item];
    }

    return getDefaultHolidays(year);
  } catch (error) {
    console.error('공휴일 조회 오류:', error);
    return getDefaultHolidays(year);
  }
}

/**
 * 특정 날짜가 공휴일인지 확인
 */
export async function isHoliday(date: Date): Promise<boolean> {
  const year = date.getFullYear();
  const holidays = await getHolidays(year);
  
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  return holidays.some((holiday) => holiday.locdate === dateStr);
}

/**
 * 기본 공휴일 목록 (API 키가 없을 때 사용)
 */
function getDefaultHolidays(year: number): HolidayInfo[] {
  // 한국의 주요 공휴일 (고정)
  const fixedHolidays: Array<{ month: number; day: number; name: string }> = [
    { month: 1, day: 1, name: '신정' },
    { month: 3, day: 1, name: '삼일절' },
    { month: 5, day: 5, name: '어린이날' },
    { month: 6, day: 6, name: '현충일' },
    { month: 8, day: 15, name: '광복절' },
    { month: 10, day: 3, name: '개천절' },
    { month: 10, day: 9, name: '한글날' },
    { month: 12, day: 25, name: '크리스마스' },
  ];

  return fixedHolidays.map((holiday) => ({
    dateName: holiday.name,
    locdate: `${year}${String(holiday.month).padStart(2, '0')}${String(holiday.day).padStart(2, '0')}`,
    isHoliday: 'Y' as const,
  }));
}

/**
 * 예약 가능한 날짜인지 확인 (공휴일 제외)
 */
export async function isAvailableDate(date: Date): Promise<{
  available: boolean;
  reason?: string;
}> {
  const isHolidayDate = await isHoliday(date);
  
  if (isHolidayDate) {
    return {
      available: false,
      reason: '공휴일에는 예약할 수 없습니다.',
    };
  }

  // 주말 체크
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      available: false,
      reason: '주말에는 예약할 수 없습니다.',
    };
  }

  return { available: true };
}

/**
 * 다음 N일 중 예약 가능한 날짜 목록 반환
 */
export async function getAvailableDates(
  startDate: Date,
  days: number = 30
): Promise<Date[]> {
  const availableDates: Date[] = [];
  const currentDate = new Date(startDate);

  for (let i = 0; i < days; i++) {
    const checkDate = new Date(currentDate);
    checkDate.setDate(currentDate.getDate() + i);

    const { available } = await isAvailableDate(checkDate);
    if (available) {
      availableDates.push(checkDate);
    }
  }

  return availableDates;
}

