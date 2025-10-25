import { describe, it, expect } from 'vitest';
import {
  generateTOC,
  formatPage,
  formatPages,
  generateTableOfContents,
} from '../src/formatters.js';
import type { Note } from '../src/types.js';

describe('Formatters', () => {
  const sampleNotes: Note[] = [
    {
      id: 'ctx-001',
      section: 'strategies',
      content: '# API Pagination Strategy\n\nAlways paginate until empty page.',
    },
    {
      id: 'ctx-007',
      section: 'examples',
      content: '# Pagination Example\n\n```js\nconst data = await fetch();\n```',
    },
    {
      id: 'ctx-042',
      section: 'lessons-learned',
      content: 'When API returns 429, use exponential backoff',
    },
  ];

  describe('generateTOC', () => {
    it('should generate TOC organized by sections', () => {
      const toc = generateTOC(sampleNotes);

      expect(toc).toContain('# My Notebook');
      expect(toc).toContain('## Table of Contents');
      expect(toc).toContain('### Examples (Page 7)');
      expect(toc).toContain('### Lessons Learned (Page 42)');
      expect(toc).toContain('### Strategies (Page 1)');
    });

    it('should list pages with titles', () => {
      const toc = generateTOC(sampleNotes);

      expect(toc).toContain('- Page 1: API Pagination Strategy');
      expect(toc).toContain('- Page 7: Pagination Example');
      expect(toc).toContain('- Page 42: When API returns 429');
    });

    it('should handle empty notes array', () => {
      const toc = generateTOC([]);

      expect(toc).toContain('# My Notebook');
      expect(toc).toContain('Empty notebook');
    });

    it('should show page range for sections with multiple pages', () => {
      const notes: Note[] = [
        { id: 'ctx-001', section: 'strategies', content: 'Test 1' },
        { id: 'ctx-005', section: 'strategies', content: 'Test 2' },
      ];

      const toc = generateTOC(notes);

      expect(toc).toContain('Pages 1-5');
    });
  });

  describe('formatPage', () => {
    it('should format page with title, section, and content', () => {
      const page = formatPage(sampleNotes[0]);

      expect(page).toContain('## Page 1: API Pagination Strategy');
      expect(page).toContain('**Section:** Strategies');
      expect(page).toContain('Always paginate until empty page');
    });

    it('should format simple notes', () => {
      const note: Note = {
        id: 'ctx-001',
        section: 'strategies',
        content: 'Test content',
      };

      const page = formatPage(note);

      expect(page).toContain('## Page 1: Test content');
      expect(page).toContain('**Section:** Strategies');
      expect(page).toContain('Test content');
    });

    it('should capitalize multi-word section names', () => {
      const note: Note = {
        id: 'ctx-001',
        section: 'lessons-learned',
        content: 'Test',
      };

      const page = formatPage(note);

      expect(page).toContain('**Section:** Lessons Learned');
    });
  });

  describe('formatPages', () => {
    it('should format multiple pages with separators', () => {
      const pages = formatPages(sampleNotes);

      expect(pages).toContain('## Page 1: API Pagination Strategy');
      expect(pages).toContain('---');
      expect(pages).toContain('## Page 7: Pagination Example');
      expect(pages).toContain('## Page 42: When API returns 429');
    });

    it('should sort pages by page number', () => {
      const unordered = [sampleNotes[2], sampleNotes[0], sampleNotes[1]]; // 42, 1, 7
      const pages = formatPages(unordered);

      const page1Index = pages.indexOf('## Page 1');
      const page7Index = pages.indexOf('## Page 7');
      const page42Index = pages.indexOf('## Page 42');

      expect(page1Index).toBeLessThan(page7Index);
      expect(page7Index).toBeLessThan(page42Index);
    });

    it('should handle empty array', () => {
      const pages = formatPages([]);

      expect(pages).toContain('No pages found');
    });
  });

  describe('generateTableOfContents', () => {
    it('should generate complete TOC', () => {
      const full = generateTableOfContents(sampleNotes);

      expect(full).toContain('# My Notebook');
      expect(full).toContain('## Table of Contents');
      expect(full).toContain('### Strategies');
      expect(full).toContain('### Examples');
      expect(full).toContain('### Lessons Learned');
    });
  });
});
