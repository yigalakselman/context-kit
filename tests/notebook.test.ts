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
    });

    await notebook.addNote({
      section: 'examples',
      content: 'Example code for pagination',
    });

    // Get TOC
    const toc = await notebook.getTableOfContents();

    expect(toc).toContain('# My Notebook');
    expect(toc).toContain('## Table of Contents');
    expect(toc).toContain('### Strategies');
    expect(toc).toContain('### Examples');
  });

  it('should retrieve pages by page number', async () => {
    const pageNum = await notebook.addNote({
      section: 'strategies',
      content: 'Test content',
    });

    const page = await notebook.getPage(pageNum);

    expect(page).toContain(`## Page ${pageNum}`);
    expect(page).toContain('Test content');
    expect(page).toContain('**Section:** Strategies');
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

  it('should update pages', async () => {
    const pageNum = await notebook.addNote({
      section: 'strategies',
      content: 'Original content',
    });

    await notebook.updatePage(pageNum, {
      content: 'Updated content',
      section: 'examples',
    });

    const page = await notebook.getPage(pageNum);

    expect(page).toContain('Updated content');
    expect(page).toContain('**Section:** Examples');
    expect(page).not.toContain('Original content');
    expect(page).not.toContain('**Section:** Strategies');
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
