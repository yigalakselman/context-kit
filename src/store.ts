/**
 * JSONL storage layer for notes
 *
 * Handles:
 * - Reading notes from JSONL file (one note per line)
 * - Writing notes to JSONL file
 * - CRUD operations (add, get, update, delete)
 */

import type { Note } from './types.js';

/**
 * Store for managing notes in JSONL format
 */
export class NoteStore {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  // TODO: Implement CRUD operations
  // - add(note: Note): Promise<void>
  // - get(id: string): Promise<Note | null>
  // - list(): Promise<Note[]>
  // - update(id: string, updates: Partial<Note>): Promise<void>
  // - delete(id: string): Promise<void>
}
