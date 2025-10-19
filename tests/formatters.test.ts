import { describe, it, expect } from 'vitest';
import {
  generateTOC,
  generateIndex,
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
      tags: ['api', 'pagination'],
    },
    {
      id: 'ctx-007',
      section: 'examples',
      content: '# Pagination Example\n\n```js\nconst data = await fetch();\n```',
      tags: ['api', 'pagination', 'code'],
    },
    {
      id: 'ctx-042',
      section: 'lessons-learned',
      content: 'When API returns 429, use exponential backoff',
      tags: ['api', 'error-handling'],
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
        { id: 'ctx-001', section: 'strategies', content: 'Test 1', tags: [] },
        { id: 'ctx-005', section: 'strategies', content: 'Test 2', tags: [] },
      ];

      const toc = generateTOC(notes);

      expect(toc).toContain('Pages 1-5');
    });
  });

  describe('generateIndex', () => {
    it('should generate tag-based index', () => {
      const index = generateIndex(sampleNotes);

      expect(index).toContain('## Index (Tags)');
      expect(index).toContain('**api**: Page 1, Page 7, Page 42');
      expect(index).toContain('**pagination**: Page 1, Page 7');
      expect(index).toContain('**error-handling**: Page 42');
      expect(index).toContain('**code**: Page 7');
    });

    it('should sort tags alphabetically', () => {
      const index = generateIndex(sampleNotes);
      const lines = index.split('\n').filter(line => line.startsWith('- **'));

      const tags = lines.map(line => line.match(/\*\*([^*]+)\*\*/)?.[1] || '');

      // Check alphabetical order
      for (let i = 1; i < tags.length; i++) {
        expect(tags[i].localeCompare(tags[i - 1])).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle notes without tags', () => {
      const notes: Note[] = [{ id: 'ctx-001', section: 'strategies', content: 'Test' }];

      const index = generateIndex(notes);

      expect(index).toContain('No tags yet');
    });

    it('should handle empty notes array', () => {
      const index = generateIndex([]);

      expect(index).toContain('No tags yet');
    });
  });

  describe('formatPage', () => {
    it('should format page with title, section, tags, and content', () => {
      const page = formatPage(sampleNotes[0]);

      expect(page).toContain('## Page 1: API Pagination Strategy');
      expect(page).toContain('**Section:** Strategies');
      expect(page).toContain('**Tags:** #api #pagination');
      expect(page).toContain('Always paginate until empty page');
    });

    it('should handle notes without tags', () => {
      const note: Note = {
        id: 'ctx-001',
        section: 'strategies',
        content: 'Test content',
      };

      const page = formatPage(note);

      expect(page).not.toContain('**Tags:**');
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
    it('should combine TOC and Index', () => {
      const full = generateTableOfContents(sampleNotes);

      expect(full).toContain('# My Notebook');
      expect(full).toContain('## Table of Contents');
      expect(full).toContain('## Index (Tags)');
      expect(full).toContain('### Strategies');
      expect(full).toContain('**api**:');
    });
  });
});
