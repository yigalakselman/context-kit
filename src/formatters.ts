/**
 * Markdown formatters for book metaphor output
 *
 * Generates:
 * - Table of Contents (organized by sections)
 * - Individual pages (with headers, content)
 * - Multiple pages (combined output)
 */

import type { Note } from './types.js';
import { getPageNumber, extractTitle, estimateTokens } from './utils/id.js';

/**
 * Section information for TOC
 */
interface SectionInfo {
  name: string;
  pages: Array<{
    pageNum: number;
    title: string;
  }>;
  tokens: number; // Total tokens in this section
}

/**
 * Generate Table of Contents from notes
 * Organized by sections with page ranges and token counts
 */
export function generateTOC(notes: Note[]): string {
  if (notes.length === 0) {
    return '# My Notebook\n\n_Empty notebook - no notes yet_\n';
  }

  // Group notes by section and calculate tokens
  const sections = new Map<string, SectionInfo>();

  for (const note of notes) {
    if (!sections.has(note.section)) {
      sections.set(note.section, {
        name: note.section,
        pages: [],
        tokens: 0,
      });
    }

    const sectionInfo = sections.get(note.section)!;
    sectionInfo.pages.push({
      pageNum: getPageNumber(note.id),
      title: extractTitle(note.content),
    });
    // Add tokens for this note (section + content)
    sectionInfo.tokens += estimateTokens(note.section + note.content);
  }

  // Sort pages within each section by page number
  for (const section of sections.values()) {
    section.pages.sort((a, b) => a.pageNum - b.pageNum);
  }

  // Format TOC
  const lines = ['# My Notebook', '', '## Table of Contents', ''];

  // Sort sections alphabetically
  const sortedSections = Array.from(sections.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Calculate total tokens
  const totalTokens = sortedSections.reduce((sum, section) => sum + section.tokens, 0);

  for (const section of sortedSections) {
    const pageNums = section.pages.map(p => p.pageNum);
    const minPage = Math.min(...pageNums);
    const maxPage = Math.max(...pageNums);
    const pageRange = minPage === maxPage ? `Page ${minPage}` : `Pages ${minPage}-${maxPage}`;

    // Section header with capitalized name and token count
    const sectionName = section.name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    lines.push(`### ${sectionName} (${pageRange}) - ~${section.tokens} tokens`);

    // List all pages in section
    for (const page of section.pages) {
      lines.push(`- Page ${page.pageNum}: ${page.title}`);
    }

    lines.push(''); // Empty line between sections
  }

  // Add total at the end
  const totalPages = notes.length;
  lines.push('---');
  lines.push(`**Total:** ${totalPages} ${totalPages === 1 ? 'page' : 'pages'}, ~${totalTokens} tokens`);
  lines.push('');

  return lines.join('\n');
}

/**
 * Format a single note as a page
 */
export function formatPage(note: Note): string {
  const pageNum = getPageNumber(note.id);
  const title = extractTitle(note.content);

  const lines = [`## Page ${pageNum}: ${title}`, ''];

  // Section metadata
  const sectionName = note.section
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  lines.push(`**Section:** ${sectionName}`);
  lines.push(''); // Empty line before content

  // Content
  lines.push(note.content.trim());

  lines.push(''); // Trailing newline

  return lines.join('\n');
}

/**
 * Format multiple notes as pages with separators
 */
export function formatPages(notes: Note[]): string {
  if (notes.length === 0) {
    return '_No pages found_\n';
  }

  // Sort notes by page number
  const sorted = [...notes].sort((a, b) => getPageNumber(a.id) - getPageNumber(b.id));

  const pages = sorted.map(note => formatPage(note));

  return pages.join('---\n\n');
}

/**
 * Generate complete Table of Contents
 */
export function generateTableOfContents(notes: Note[]): string {
  return generateTOC(notes);
}
