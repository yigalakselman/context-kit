/**
 * Markdown formatters for book metaphor output
 *
 * Generates:
 * - Table of Contents (organized by sections)
 * - Index (tag-based lookup)
 * - Individual pages (with headers, tags, content)
 * - Multiple pages (combined output)
 */

import type { Note } from './types.js';
import { getPageNumber, extractTitle } from './utils/id.js';

/**
 * Section information for TOC
 */
interface SectionInfo {
  name: string;
  pages: Array<{
    pageNum: number;
    title: string;
  }>;
}

/**
 * Generate Table of Contents from notes
 * Organized by sections with page ranges
 */
export function generateTOC(notes: Note[]): string {
  if (notes.length === 0) {
    return '# My Notebook\n\n_Empty notebook - no notes yet_\n';
  }

  // Group notes by section
  const sections = new Map<string, SectionInfo>();

  for (const note of notes) {
    if (!sections.has(note.section)) {
      sections.set(note.section, {
        name: note.section,
        pages: [],
      });
    }

    const sectionInfo = sections.get(note.section)!;
    sectionInfo.pages.push({
      pageNum: getPageNumber(note.id),
      title: extractTitle(note.content),
    });
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

  for (const section of sortedSections) {
    const pageNums = section.pages.map(p => p.pageNum);
    const minPage = Math.min(...pageNums);
    const maxPage = Math.max(...pageNums);
    const pageRange = minPage === maxPage ? `Page ${minPage}` : `Pages ${minPage}-${maxPage}`;

    // Section header with capitalized name
    const sectionName = section.name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    lines.push(`### ${sectionName} (${pageRange})`);

    // List all pages in section
    for (const page of section.pages) {
      lines.push(`- Page ${page.pageNum}: ${page.title}`);
    }

    lines.push(''); // Empty line between sections
  }

  return lines.join('\n');
}

/**
 * Generate Index from notes (tag-based lookup)
 */
export function generateIndex(notes: Note[]): string {
  // Build tag → pages mapping
  const tagIndex = new Map<string, number[]>();

  for (const note of notes) {
    if (!note.tags || note.tags.length === 0) continue;

    const pageNum = getPageNumber(note.id);

    for (const tag of note.tags) {
      if (!tagIndex.has(tag)) {
        tagIndex.set(tag, []);
      }
      tagIndex.get(tag)!.push(pageNum);
    }
  }

  // If no tags found, show empty state
  if (tagIndex.size === 0) {
    return '## Index (Tags)\n\n_No tags yet_\n';
  }

  // Sort tags alphabetically
  const sortedTags = Array.from(tagIndex.entries()).sort(([a], [b]) => a.localeCompare(b));

  const lines = ['## Index (Tags)', ''];

  for (const [tag, pages] of sortedTags) {
    // Sort pages and remove duplicates
    const uniquePages = [...new Set(pages)].sort((a, b) => a - b);
    const pageList = uniquePages.map(p => `Page ${p}`).join(', ');
    lines.push(`- **${tag}**: ${pageList}`);
  }

  lines.push(''); // Trailing newline

  return lines.join('\n');
}

/**
 * Format a single note as a page
 */
export function formatPage(note: Note): string {
  const pageNum = getPageNumber(note.id);
  const title = extractTitle(note.content);

  const lines = [`## Page ${pageNum}: ${title}`, ''];

  // Section and tags metadata
  const sectionName = note.section
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  lines.push(`**Section:** ${sectionName}`);

  if (note.tags && note.tags.length > 0) {
    const tagList = note.tags.map(tag => `#${tag}`).join(' ');
    lines.push(`**Tags:** ${tagList}`);
  }

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
 * Generate complete Table of Contents + Index
 */
export function generateTableOfContents(notes: Note[]): string {
  const toc = generateTOC(notes);
  const index = generateIndex(notes);

  return `${toc}\n${index}`;
}
