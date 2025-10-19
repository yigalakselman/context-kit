import { describe, it, expect } from 'vitest';
import { getPageNumber, getIdFromPage, generateNextId, extractTitle } from '../src/utils/id.js';

describe('ID utilities', () => {
  describe('getPageNumber', () => {
    it('should extract page number from valid ID', () => {
      expect(getPageNumber('ctx-001')).toBe(1);
      expect(getPageNumber('ctx-042')).toBe(42);
      expect(getPageNumber('ctx-999')).toBe(999);
    });

    it('should throw error for invalid ID format', () => {
      expect(() => getPageNumber('invalid')).toThrow('Invalid note ID format');
      expect(() => getPageNumber('ctx-')).toThrow('Invalid note ID format');
      expect(() => getPageNumber('ctx-abc')).toThrow('Invalid note ID format');
    });
  });

  describe('getIdFromPage', () => {
    it('should generate ID from page number with zero padding', () => {
      expect(getIdFromPage(1)).toBe('ctx-001');
      expect(getIdFromPage(42)).toBe('ctx-042');
      expect(getIdFromPage(999)).toBe('ctx-999');
      expect(getIdFromPage(1000)).toBe('ctx-1000');
    });

    it('should throw error for invalid page numbers', () => {
      expect(() => getIdFromPage(0)).toThrow('Invalid page number');
      expect(() => getIdFromPage(-1)).toThrow('Invalid page number');
      expect(() => getIdFromPage(1.5)).toThrow('Invalid page number');
    });
  });

  describe('generateNextId', () => {
    it('should return ctx-001 for empty array', () => {
      expect(generateNextId([])).toBe('ctx-001');
    });

    it('should generate next ID after maximum', () => {
      expect(generateNextId(['ctx-001'])).toBe('ctx-002');
      expect(generateNextId(['ctx-001', 'ctx-005', 'ctx-003'])).toBe('ctx-006');
      expect(generateNextId(['ctx-042'])).toBe('ctx-043');
    });
  });

  describe('extractTitle', () => {
    it('should extract H1 heading if present', () => {
      expect(extractTitle('# API Pagination Strategy\n\nSome content')).toBe('API Pagination Strategy');
    });

    it('should extract H2 heading if H1 not present', () => {
      expect(extractTitle('## Input Validation\n\nSome content')).toBe('Input Validation');
    });

    it('should use first line if no heading', () => {
      expect(extractTitle('Always validate user input')).toBe('Always validate user input');
    });

    it('should truncate long first lines to 60 chars', () => {
      const longText = 'This is a very long line of text that should be truncated to 60 characters maximum';
      const result = extractTitle(longText);
      expect(result.length).toBeLessThanOrEqual(63); // 60 + '...'
      expect(result).toContain('...');
    });

    it('should return "Untitled" for empty content', () => {
      expect(extractTitle('')).toBe('Untitled');
      expect(extractTitle('   \n\n   ')).toBe('Untitled');
    });
  });
});
