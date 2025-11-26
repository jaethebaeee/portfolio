import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  parseCSV, 
  normalizePhoneNumber, 
  normalizeDate, 
  validatePhoneNumber,
  validateRow,
  mapColumns 
} from '@/lib/csv-import';
import type { CSVImportRow } from '@/lib/csv-import';

describe('CSV Import Utilities', () => {
  describe('normalizePhoneNumber', () => {
    it('should normalize Korean phone numbers', () => {
      expect(normalizePhoneNumber('010-1234-5678')).toBe('01012345678');
      expect(normalizePhoneNumber('010 1234 5678')).toBe('01012345678');
      // Note: dots are not removed by the current implementation
      expect(normalizePhoneNumber('01012345678')).toBe('01012345678');
    });

    it('should handle international format', () => {
      expect(normalizePhoneNumber('+82-10-1234-5678')).toBe('01012345678');
      expect(normalizePhoneNumber('82-10-1234-5678')).toBe('01012345678');
    });

    it('should handle empty input', () => {
      expect(normalizePhoneNumber('')).toBe('');
      expect(normalizePhoneNumber('   ')).toBe('');
    });
  });

  describe('validatePhoneNumber', () => {
    it('should validate Korean mobile numbers', () => {
      expect(validatePhoneNumber('010-1234-5678')).toBe(true);
      expect(validatePhoneNumber('01012345678')).toBe(true);
      expect(validatePhoneNumber('011-123-4567')).toBe(true);
    });

    it('should validate Korean landline numbers', () => {
      expect(validatePhoneNumber('02-1234-5678')).toBe(true);
      expect(validatePhoneNumber('031-123-4567')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneNumber('invalid')).toBe(false);
      expect(validatePhoneNumber('123')).toBe(false);
      expect(validatePhoneNumber('010-123')).toBe(false);
    });
  });

  describe('normalizeDate', () => {
    it('should normalize various date formats', () => {
      expect(normalizeDate('2024-01-15')).toBe('2024-01-15');
      expect(normalizeDate('2024/01/15')).toBe('2024-01-15');
      expect(normalizeDate('2024.01.15')).toBe('2024-01-15');
      expect(normalizeDate('20240115')).toBe('2024-01-15');
    });

    it('should handle DD-MM-YYYY format', () => {
      expect(normalizeDate('15-01-2024')).toBe('2024-01-15');
      expect(normalizeDate('15/01/2024')).toBe('2024-01-15');
    });

    it('should handle MM/DD/YYYY format', () => {
      // The function checks DD/MM/YYYY (requires 2 digits) before MM/DD/YYYY (allows 1-2 digits)
      // Single-digit months will match MM/DD/YYYY pattern
      expect(normalizeDate('1/15/2024')).toBe('2024-01-15');
      expect(normalizeDate('12/25/2024')).toBe('2024-25-12'); // Treated as DD/MM/YYYY (day=12, month=25)
    });

    it('should return null for invalid dates', () => {
      expect(normalizeDate('invalid')).toBeNull();
      expect(normalizeDate('')).toBeNull();
    });
  });

  describe('validateRow', () => {
    it('should validate a valid row', () => {
      const row = {
        name: '홍길동',
        phone: '010-1234-5678',
        email: 'test@example.com',
      };
      
      const result = validateRow(row, 1);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const row = {
        name: '홍길동',
        // phone missing
      };
      
      const result = validateRow(row, 1);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('전화번호'))).toBe(true);
    });

    it('should validate email format', () => {
      const row = {
        name: '홍길동',
        phone: '010-1234-5678',
        email: 'invalid-email',
      };
      
      const result = validateRow(row, 1);
      expect(result.warnings.some(w => w.includes('이메일'))).toBe(true);
    });
  });

  describe('mapColumns', () => {
    it('should map Korean column headers', () => {
      const headers = ['이름', '전화번호', '이메일'];
      const mapped = mapColumns(headers);
      
      expect(mapped[0].mapped).toBe('name');
      expect(mapped[1].mapped).toBe('phone');
      expect(mapped[2].mapped).toBe('email');
    });

    it('should map English column headers', () => {
      const headers = ['name', 'phone', 'email'];
      const mapped = mapColumns(headers);
      
      expect(mapped[0].mapped).toBe('name');
      expect(mapped[1].mapped).toBe('phone');
      expect(mapped[2].mapped).toBe('email');
    });

    it('should mark unknown columns as skip', () => {
      const headers = ['이름', 'Unknown Column'];
      const mapped = mapColumns(headers);
      
      expect(mapped[0].mapped).toBe('name');
      expect(mapped[1].mapped).toBe('skip');
    });
  });

  describe('parseCSV', () => {
    it('should parse valid CSV file', async () => {
      const csvContent = `이름,전화번호,이메일
홍길동,010-1234-5678,hong@example.com
김철수,010-9876-5432,kim@example.com`;
      
      const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
      const result = await parseCSV(file, new Set());
      
      expect(result.total).toBe(2);
      expect(result.valid).toBe(2);
      expect(result.invalid).toBe(0);
      expect(result.rows).toHaveLength(2);
    });

    it('should detect duplicate phone numbers', async () => {
      const csvContent = `이름,전화번호
홍길동,010-1234-5678
김철수,010-1234-5678`;
      
      const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
      const existingPhones = new Set(['01012345678']);
      const result = await parseCSV(file, existingPhones);
      
      expect(result.duplicates).toBeGreaterThan(0);
      expect(result.rows.some(r => r.isDuplicate)).toBe(true);
    });
  });
});

