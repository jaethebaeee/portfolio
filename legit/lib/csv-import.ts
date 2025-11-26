/**
 * CSV 환자 데이터 가져오기 유틸리티
 * 
 * 기능:
 * - CSV 파일 파싱 및 검증
 * - 한국어/영어 컬럼 헤더 자동 매핑
 * - 전화번호, 날짜 형식 검증 및 정규화
 * - PIPA 준수: 중복 환자 감지 및 업데이트 옵션
 */

import { CreatePatientInput } from './patients';
import Papa from 'papaparse';

export interface CSVColumn {
  original: string; // 원본 컬럼 이름
  mapped: keyof CreatePatientInput | 'skip'; // 매핑된 필드
  required: boolean;
}

export interface CSVImportRow {
  rowNumber: number;
  data: Partial<CreatePatientInput>;
  errors: string[];
  warnings: string[];
  isDuplicate?: boolean; // 기존 환자와 중복 (전화번호 기준)
}

export interface CSVImportResult {
  total: number;
  valid: number;
  invalid: number;
  duplicates: number;
  rows: CSVImportRow[];
  columnMapping: CSVColumn[];
}

// 한국어/영어 컬럼 헤더 매핑
const COLUMN_MAPPINGS: Record<string, keyof CreatePatientInput> = {
  // 이름
  '이름': 'name',
  '성명': 'name',
  '환자명': 'name',
  'name': 'name',
  'patient name': 'name',
  'patient_name': 'name',
  
  // 전화번호
  '전화번호': 'phone',
  '연락처': 'phone',
  '휴대폰': 'phone',
  '핸드폰': 'phone',
  'phone': 'phone',
  'mobile': 'phone',
  'phone number': 'phone',
  'phone_number': 'phone',
  'contact': 'phone',
  
  // 이메일
  '이메일': 'email',
  '메일': 'email',
  'email': 'email',
  'e-mail': 'email',
  
  // 생년월일
  '생년월일': 'birth_date',
  '생일': 'birth_date',
  '출생일': 'birth_date',
  'birth date': 'birth_date',
  'birth_date': 'birth_date',
  'birthday': 'birth_date',
  'dob': 'birth_date',
  'date of birth': 'birth_date',
  
  // 성별
  '성별': 'gender',
  'gender': 'gender',
  'sex': 'gender',
  
  // 최근 방문일
  '최근방문일': 'last_visit_date',
  '최근 방문일': 'last_visit_date',
  '마지막방문': 'last_visit_date',
  'last visit': 'last_visit_date',
  'last_visit_date': 'last_visit_date',
  'last visit date': 'last_visit_date',
  
  // 최근 수술일
  '최근수술일': 'last_surgery_date',
  '최근 수술일': 'last_surgery_date',
  '수술일': 'last_surgery_date',
  'last surgery': 'last_surgery_date',
  'last_surgery_date': 'last_surgery_date',
  'last surgery date': 'last_surgery_date',
  'surgery date': 'last_surgery_date',
  
  // 메모
  '메모': 'notes',
  '비고': 'notes',
  '특이사항': 'notes',
  'notes': 'notes',
  'note': 'notes',
  'memo': 'notes',
  'remarks': 'notes',
  'comments': 'notes',
};

/**
 * 전화번호 정규화 (한국 형식)
 * 010-1234-5678 → 01012345678
 * 010 1234 5678 → 01012345678
 * +82-10-1234-5678 → 01012345678
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // 공백, 하이픈, 괄호 제거
  let normalized = phone.replace(/[\s\-()]/g, '');
  
  // +82 또는 82로 시작하는 경우 0으로 변경
  if (normalized.startsWith('+82')) {
    normalized = '0' + normalized.substring(3);
  } else if (normalized.startsWith('82')) {
    normalized = '0' + normalized.substring(2);
  }
  
  return normalized;
}

/**
 * 전화번호 검증 (한국 형식)
 */
export function validatePhoneNumber(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  
  // 010, 011, 016, 017, 018, 019로 시작하는 10-11자리
  const mobilePattern = /^01[0-9]{8,9}$/;
  // 02, 031-064로 시작하는 지역번호
  const landlinePattern = /^0(2|[3-6][0-9])[0-9]{7,8}$/;
  
  return mobilePattern.test(normalized) || landlinePattern.test(normalized);
}

/**
 * 날짜 정규화 (YYYY-MM-DD 형식으로 변환)
 * 지원 형식:
 * - YYYY-MM-DD
 * - YYYY/MM/DD
 * - YYYY.MM.DD
 * - YYYYMMDD
 * - DD-MM-YYYY (유럽 형식)
 * - MM/DD/YYYY (미국 형식)
 */
export function normalizeDate(dateStr: string): string | null {
  if (!dateStr) return null;
  
  const str = dateStr.trim();
  
  // YYYY-MM-DD 형식 (이미 정규화됨)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  
  // YYYY/MM/DD 또는 YYYY.MM.DD
  if (/^\d{4}[\/\.]\d{2}[\/\.]\d{2}$/.test(str)) {
    return str.replace(/[\/\.]/g, '-');
  }
  
  // YYYYMMDD
  if (/^\d{8}$/.test(str)) {
    return `${str.substring(0, 4)}-${str.substring(4, 6)}-${str.substring(6, 8)}`;
  }
  
  // DD-MM-YYYY 또는 DD/MM/YYYY
  const ddmmyyyyMatch = str.match(/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/);
  if (ddmmyyyyMatch) {
    return `${ddmmyyyyMatch[3]}-${ddmmyyyyMatch[2]}-${ddmmyyyyMatch[1]}`;
  }
  
  // MM/DD/YYYY (미국 형식)
  const mmddyyyyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mmddyyyyMatch) {
    const month = mmddyyyyMatch[1].padStart(2, '0');
    const day = mmddyyyyMatch[2].padStart(2, '0');
    return `${mmddyyyyMatch[3]}-${month}-${day}`;
  }
  
  return null;
}

/**
 * 날짜 검증
 */
export function validateDate(dateStr: string): boolean {
  const normalized = normalizeDate(dateStr);
  if (!normalized) return false;
  
  const date = new Date(normalized);
  return !isNaN(date.getTime());
}

/**
 * 성별 정규화
 */
export function normalizeGender(gender: string): 'male' | 'female' | 'other' | null {
  if (!gender) return null;
  
  const lower = gender.toLowerCase().trim();
  
  // 남성
  if (['남', '남성', 'male', 'm', 'man'].includes(lower)) {
    return 'male';
  }
  
  // 여성
  if (['여', '여성', 'female', 'f', 'woman'].includes(lower)) {
    return 'female';
  }
  
  return 'other';
}

/**
 * 컬럼 헤더를 필드로 자동 매핑
 */
export function mapColumns(headers: string[]): CSVColumn[] {
  return headers.map(header => {
    const normalized = header.toLowerCase().trim();
    const mapped = COLUMN_MAPPINGS[normalized];
    
    return {
      original: header,
      mapped: mapped || 'skip',
      required: mapped === 'name' || mapped === 'phone',
    };
  });
}

/**
 * CSV 행 데이터 검증
 */
export function validateRow(
  data: Partial<CreatePatientInput>,
  rowNumber: number
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 필수 필드 검증
  if (!data.name || data.name.trim().length === 0) {
    errors.push('이름은 필수 항목입니다');
  } else if (data.name.trim().length < 2) {
    errors.push('이름은 최소 2자 이상이어야 합니다');
  }
  
  if (!data.phone || data.phone.trim().length === 0) {
    errors.push('전화번호는 필수 항목입니다');
  } else if (!validatePhoneNumber(data.phone)) {
    errors.push('올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)');
  }
  
  // 이메일 형식 검증 (선택)
  if (data.email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(data.email)) {
      warnings.push('이메일 형식이 올바르지 않습니다');
    }
  }
  
  // 날짜 검증
  if (data.birth_date && !validateDate(data.birth_date)) {
    errors.push('생년월일 형식이 올바르지 않습니다 (예: 1990-01-01)');
  }
  
  if (data.last_visit_date && !validateDate(data.last_visit_date)) {
    warnings.push('최근 방문일 형식이 올바르지 않습니다');
  }
  
  if (data.last_surgery_date && !validateDate(data.last_surgery_date)) {
    warnings.push('최근 수술일 형식이 올바르지 않습니다');
  }
  
  // 성별 검증
  if (data.gender && !['male', 'female', 'other'].includes(data.gender)) {
    warnings.push('성별 값이 올바르지 않습니다 (남/여/male/female)');
  }
  
  return { errors, warnings };
}

/**
 * CSV 파일 파싱 및 검증
 */
export async function parseCSV(
  file: File,
  existingPhones?: Set<string>,
  customColumnMapping?: Record<string, string>
): Promise<CSVImportResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        try {
          const headers = results.meta.fields || [];

          // 커스텀 매핑이 제공된 경우 사용, 그렇지 않으면 자동 매핑
          let columnMapping: CSVColumn[];
          if (customColumnMapping) {
            columnMapping = headers.map(header => ({
              original: header,
              mapped: (customColumnMapping[header] as keyof CreatePatientInput) || 'skip',
              required: customColumnMapping[header] === 'name' || customColumnMapping[header] === 'phone',
            }));
          } else {
            columnMapping = mapColumns(headers);
          }

          const rows: CSVImportRow[] = results.data.map((row, index) => {
            const data: Partial<CreatePatientInput> = {};

            // 컬럼 매핑에 따라 데이터 변환
            columnMapping.forEach(col => {
              if (col.mapped === 'skip') return;

              const value = row[col.original]?.trim();
              if (!value) return;

              switch (col.mapped) {
                case 'name':
                  data.name = value;
                  break;
                  
                case 'phone':
                  data.phone = normalizePhoneNumber(value);
                  break;
                  
                case 'email':
                  data.email = value;
                  break;
                  
                case 'birth_date':
                  data.birth_date = normalizeDate(value) || undefined;
                  break;
                  
                case 'gender':
                  data.gender = normalizeGender(value) || undefined;
                  break;
                  
                case 'last_visit_date':
                  data.last_visit_date = normalizeDate(value) || undefined;
                  break;
                  
                case 'last_surgery_date':
                  data.last_surgery_date = normalizeDate(value) || undefined;
                  break;
                  
                case 'notes':
                  data.notes = value;
                  break;
              }
            });
            
            // 검증
            const { errors, warnings } = validateRow(data, index + 2); // +2 for header + 0-index
            
            // 중복 검사
            const isDuplicate = existingPhones && data.phone 
              ? existingPhones.has(data.phone)
              : false;
            
            if (isDuplicate) {
              warnings.push('이미 등록된 전화번호입니다 (업데이트 옵션을 선택하세요)');
            }
            
            return {
              rowNumber: index + 2,
              data,
              errors,
              warnings,
              isDuplicate,
            };
          });
          
          const valid = rows.filter(r => r.errors.length === 0).length;
          const invalid = rows.filter(r => r.errors.length > 0).length;
          const duplicates = rows.filter(r => r.isDuplicate).length;
          
          resolve({
            total: rows.length,
            valid,
            invalid,
            duplicates,
            rows,
            columnMapping,
          });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`CSV 파싱 오류: ${error.message}`));
      },
    });
  });
}

/**
 * 샘플 CSV 생성 (템플릿 다운로드용)
 */
export function generateSampleCSV(): string {
  const headers = [
    '이름',
    '전화번호',
    '이메일',
    '생년월일',
    '성별',
    '최근 방문일',
    '최근 수술일',
    '메모',
  ];
  
  const sampleData = [
    [
      '김민수',
      '010-1234-5678',
      'minsu.kim@example.com',
      '1985-03-15',
      '남',
      '2024-11-20',
      '2024-10-15',
      '백내장 수술 환자',
    ],
    [
      '이지은',
      '010-9876-5432',
      'jieun.lee@example.com',
      '1992-07-22',
      '여',
      '2024-11-15',
      '',
      '라식 상담 예정',
    ],
    [
      '박준호',
      '010-5555-6666',
      '',
      '1978-11-30',
      '남',
      '2024-10-10',
      '2024-09-01',
      '정기 검진',
    ],
  ];
  
  // CSV 생성
  const rows = [headers, ...sampleData];
  return rows.map(row => row.join(',')).join('\n');
}

/**
 * CSV 다운로드 트리거
 */
export function downloadSampleCSV() {
  const csv = generateSampleCSV();
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }); // UTF-8 BOM for Excel
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'patients_import_template.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

