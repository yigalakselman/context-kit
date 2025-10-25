/**
 * Notebook API - Book metaphor implementation
 *
 * Provides high-level API for AI agents to interact with the notebook:
 * - getTableOfContents() - Returns TOC as markdown
 * - getPage(pageNum) - Returns single page as markdown
 * - getPages(pageNums[]) - Returns multiple pages as markdown
 * - addNote({...}) - Writes note, returns page number
 * - updatePage(pageNum, {...}) - Modifies existing page
 * - deletePage(pageNum) - Removes page
 */

import type { Note } from './types.js';
import { NoteStore } from './store.js';
import { getIdFromPage, getPageNumber, generateNextId } from './utils/id.js';
import { generateTableOfContents, formatPage, formatPages } from './formatters.js';

/**
 * Main Notebook class
 */
export class Notebook {
  private store: NoteStore;

  constructor(storePath: string) {
    this.store = new NoteStore(storePath);
  }

  /**
   * Get Table of Contents
   * @returns Markdown string with TOC organized by sections
   */
  async getTableOfContents(): Promise<string> {
    const notes = await this.store.list();
    return generateTableOfContents(notes);
  }

  /**
   * Get a single page by number
   * @param pageNum - Page number (derived from note ID)
   * @returns Markdown string with page content
   * @throws Error if page not found
   */
  async getPage(pageNum: number): Promise<string> {
    const id = getIdFromPage(pageNum);
    const note = await this.store.get(id);

    if (!note) {
      throw new Error(`Page ${pageNum} not found`);
    }

    return formatPage(note);
  }

  /**
   * Get multiple pages by numbers
   * @param pageNums - Array of page numbers
   * @returns Markdown string with all pages
   */
  async getPages(pageNums: number[]): Promise<string> {
    const notes: Note[] = [];

    for (const pageNum of pageNums) {
      const id = getIdFromPage(pageNum);
      const note = await this.store.get(id);

      if (note) {
        notes.push(note);
      }
      // Skip missing pages silently (could log warning)
    }

    return formatPages(notes);
  }

  /**
   * Add a new note to the notebook
   * @param note - Note data (without ID, will be generated)
   * @returns Page number of the newly created note
   */
  async addNote(note: Omit<Note, 'id'>): Promise<number> {
    // Generate next available ID
    const existingNotes = await this.store.list();
    const existingIds = existingNotes.map(n => n.id);
    const newId = generateNextId(existingIds);

    // Add created_at timestamp if not provided
    const timestamp = note.created_at || new Date().toISOString();

    // Create full note with ID
    const fullNote: Note = {
      ...note,
      id: newId,
      created_at: timestamp,
    };

    await this.store.add(fullNote);

    return getPageNumber(newId);
  }

  /**
   * Update an existing page
   * @param pageNum - Page number to update
   * @param updates - Partial note data to update
   */
  async updatePage(pageNum: number, updates: Partial<Omit<Note, 'id'>>): Promise<void> {
    const id = getIdFromPage(pageNum);

    // Ensure ID is not in updates (preserve original ID)
    const safeUpdates = { ...updates };
    delete (safeUpdates as Partial<Note>).id;

    await this.store.update(id, safeUpdates);
  }

  /**
   * Delete a page
   * @param pageNum - Page number to delete
   */
  async deletePage(pageNum: number): Promise<void> {
    const id = getIdFromPage(pageNum);
    await this.store.delete(id);
  }
}
