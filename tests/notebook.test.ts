import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Notebook } from '../src/notebook.js';

describe('Notebook (Integration)', () => {
  let testFilePath: string;
  let notebook: Notebook;

  beforeEach(async () => {
    testFilePath = join(tmpdir(), `contextkit-test-${Date.now()}-${Math.random()}.jsonl`);
    notebook = new Notebook(testFilePath);
  });

  afterEach(async () => {
    try {
      await fs.unlink(testFilePath);
    } catch {
      // File might not exist
    }
  });

  it('should add notes and generate TOC', async () => {
    // Add some notes
    await notebook.addNote({
      section: 'strategies',
      content: '# API Pagination\n\nAlways paginate until empty.',
      tags: ['api', 'pagination'],
    });

    await notebook.addNote({
      section: 'examples',
      content: 'Example code for pagination',
      tags: ['api', 'code'],
    });

    // Get TOC
    const toc = await notebook.getTableOfContents();

    expect(toc).toContain('# My Notebook');
    expect(toc).toContain('## Table of Contents');
    expect(toc).toContain('### Strategies');
    expect(toc).toContain('### Examples');
    expect(toc).toContain('## Index (Tags)');
    expect(toc).toContain('**api**:');
    expect(toc).toContain('**pagination**:');
  });

  it('should retrieve pages by page number', async () => {
    const pageNum = await notebook.addNote({
      section: 'strategies',
      content: 'Test content',
      tags: ['test'],
    });

    const page = await notebook.getPage(pageNum);

    expect(page).toContain(`## Page ${pageNum}`);
    expect(page).toContain('Test content');
    expect(page).toContain('**Tags:** #test');
  });

  it('should retrieve multiple pages', async () => {
    const page1 = await notebook.addNote({
      section: 'strategies',
      content: 'First note',
    });

    const page2 = await notebook.addNote({
      section: 'strategies',
      content: 'Second note',
    });

    const pages = await notebook.getPages([page1, page2]);

    expect(pages).toContain('First note');
    expect(pages).toContain('Second note');
    expect(pages).toContain('---'); // Separator
  });

  it('should search by tags', async () => {
    await notebook.addNote({
      section: 'strategies',
      content: 'API pagination strategy',
      tags: ['api', 'pagination'],
    });

    await notebook.addNote({
      section: 'examples',
      content: 'Validation example',
      tags: ['validation'],
    });

    await notebook.addNote({
      section: 'strategies',
      content: 'API error handling',
      tags: ['api', 'errors'],
    });

    // Search for 'api' tag
    const results = await notebook.search({ tags: ['api'] });

    expect(results).toContain('API pagination strategy');
    expect(results).toContain('API error handling');
    expect(results).not.toContain('Validation example');
  });

  it('should search by sections', async () => {
    await notebook.addNote({
      section: 'strategies',
      content: 'Strategy 1',
    });

    await notebook.addNote({
      section: 'examples',
      content: 'Example 1',
    });

    // Search for strategies only
    const results = await notebook.search({ sections: ['strategies'] });

    expect(results).toContain('Strategy 1');
    expect(results).not.toContain('Example 1');
  });

  it('should limit search results', async () => {
    await notebook.addNote({
      section: 'strategies',
      content: 'Note 1',
      tags: ['test'],
    });

    await notebook.addNote({
      section: 'strategies',
      content: 'Note 2',
      tags: ['test'],
    });

    await notebook.addNote({
      section: 'strategies',
      content: 'Note 3',
      tags: ['test'],
    });

    const results = await notebook.search({ tags: ['test'], limit: 2 });

    // Should only contain 2 notes
    const noteCount = (results.match(/## Page/g) || []).length;
    expect(noteCount).toBe(2);
  });

  it('should update pages', async () => {
    const pageNum = await notebook.addNote({
      section: 'strategies',
      content: 'Original content',
      tags: ['original'],
    });

    await notebook.updatePage(pageNum, {
      content: 'Updated content',
      tags: ['updated'],
    });

    const page = await notebook.getPage(pageNum);

    expect(page).toContain('Updated content');
    expect(page).toContain('#updated');
    expect(page).not.toContain('Original content');
    expect(page).not.toContain('#original');
  });

  it('should delete pages', async () => {
    const pageNum = await notebook.addNote({
      section: 'strategies',
      content: 'To be deleted',
    });

    await notebook.deletePage(pageNum);

    await expect(notebook.getPage(pageNum)).rejects.toThrow('not found');
  });

  it('should generate sequential page numbers', async () => {
    const page1 = await notebook.addNote({
      section: 'strategies',
      content: 'First',
    });

    const page2 = await notebook.addNote({
      section: 'strategies',
      content: 'Second',
    });

    const page3 = await notebook.addNote({
      section: 'strategies',
      content: 'Third',
    });

    expect(page1).toBe(1);
    expect(page2).toBe(2);
    expect(page3).toBe(3);
  });
});
