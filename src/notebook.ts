/**
 * Notebook API - Book metaphor implementation
 *
 * Provides high-level API for AI agents to interact with the notebook:
 * - getTableOfContents() - Returns TOC + Index as markdown
 * - getPage(pageNum) - Returns single page as markdown
 * - getPages(pageNums[]) - Returns multiple pages as markdown
 * - search(tags) - Returns matching pages as markdown
 * - addNote({...}) - Writes note, returns page number
 * - updatePage(pageNum, {...}) - Modifies existing page
 * - deletePage(pageNum) - Removes page
 */

import type { Note, RetrievalOptions } from './types.js';

/**
 * Main Notebook class
 */
export class Notebook {
  // TODO: Initialize with NoteStore, page manager, generators, formatters

  constructor(storePath: string) {
    // TODO: Set up components
  }

  /**
   * Get Table of Contents + Index
   * @returns Markdown string with TOC and tag-based index
   */
  async getTableOfContents(): Promise<string> {
    // TODO: Generate and return TOC + Index as markdown
    throw new Error('Not implemented');
  }

  /**
   * Get a single page by number
   * @param pageNum - Page number (derived from note ID)
   * @returns Markdown string with page content
   */
  async getPage(pageNum: number): Promise<string> {
    // TODO: Fetch note, format as markdown page
    throw new Error('Not implemented');
  }

  /**
   * Get multiple pages by numbers
   * @param pageNums - Array of page numbers
   * @returns Markdown string with all pages
   */
  async getPages(pageNums: number[]): Promise<string> {
    // TODO: Fetch notes, format as markdown pages
    throw new Error('Not implemented');
  }

  /**
   * Search for pages by tags and/or sections
   * @param options - Retrieval options (tags, sections, limit)
   * @returns Markdown string with matching pages
   */
  async search(options: RetrievalOptions): Promise<string> {
    // TODO: Filter notes, format as markdown pages
    throw new Error('Not implemented');
  }

  /**
   * Add a new note to the notebook
   * @param note - Note data (without ID, will be generated)
   * @returns Page number of the newly created note
   */
  async addNote(note: Omit<Note, 'id'>): Promise<number> {
    // TODO: Generate ID, save note, return page number
    throw new Error('Not implemented');
  }

  /**
   * Update an existing page
   * @param pageNum - Page number to update
   * @param updates - Partial note data to update
   */
  async updatePage(pageNum: number, updates: Partial<Note>): Promise<void> {
    // TODO: Convert page number to ID, update note
    throw new Error('Not implemented');
  }

  /**
   * Delete a page
   * @param pageNum - Page number to delete
   */
  async deletePage(pageNum: number): Promise<void> {
    // TODO: Convert page number to ID, delete note
    throw new Error('Not implemented');
  }
}
