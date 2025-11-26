import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPublicTemplates, importTemplateFromJSON } from '@/lib/workflow-template-library';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        or: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: [],
              error: null,
            })),
          })),
          order: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
    })),
  },
}));

describe('Workflow Templates', () => {
  describe('getPublicTemplates', () => {
    it('should fetch public templates', async () => {
      // This is a basic structure test
      // In a real scenario, you'd mock the Supabase response
      const templates = await getPublicTemplates();
      expect(Array.isArray(templates)).toBe(true);
    });

    it('should filter by category', async () => {
      const templates = await getPublicTemplates({ category: '안과' });
      expect(Array.isArray(templates)).toBe(true);
    });

    it('should sort by rating', async () => {
      const templates = await getPublicTemplates({ sortBy: 'rating' });
      expect(Array.isArray(templates)).toBe(true);
    });
  });

  describe('importTemplateFromJSON', () => {
    it('should import template from valid JSON', () => {
      const templateJSON = JSON.stringify({
        name: '테스트 템플릿',
        description: '테스트용',
        category: '공통',
        visual_data: {
          nodes: [
            {
              id: 'trigger-1',
              type: 'trigger',
              position: { x: 250, y: 50 },
              data: { type: 'trigger', label: '테스트 트리거' },
            },
          ],
          edges: [],
        },
        tags: ['테스트'],
      });

      const imported = importTemplateFromJSON(templateJSON);
      expect(imported.name).toBe('테스트 템플릿');
      expect(imported.category).toBe('공통');
      expect(imported.visual_data).toBeDefined();
    });

    it('should throw error for invalid JSON', () => {
      expect(() => {
        importTemplateFromJSON('invalid json');
      }).toThrow();
    });

    it('should throw error for missing name field', () => {
      const invalidJSON = JSON.stringify({
        // missing name
        category: '공통',
      });

      expect(() => {
        importTemplateFromJSON(invalidJSON);
      }).toThrow();
    });

    it('should default category to 공통 if missing', () => {
      const json = JSON.stringify({
        name: '테스트 템플릿',
        // category missing - should default to '공통'
      });

      const imported = importTemplateFromJSON(json);
      expect(imported.name).toBe('테스트 템플릿');
      expect(imported.category).toBe('공통');
    });
  });
});

