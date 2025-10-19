/**
 * JSONL storage layer for notes
 *
 * Handles:
 * - Reading notes from JSONL file (one note per line)
 * - Writing notes to JSONL file
 * - CRUD operations (add, get, update, delete)
 */

import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';
import { NoteSchema, type Note } from './types.js';

/**
 * Store for managing notes in JSONL format
 */
export class NoteStore {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  /**
   * Ensure the storage file and its directory exist
   */
  private async ensureFile(): Promise<void> {
    try {
      await fs.access(this.filePath);
    } catch {
      // File doesn't exist, create directory and empty file
      await fs.mkdir(dirname(this.filePath), { recursive: true });
      await fs.writeFile(this.filePath, '', 'utf-8');
    }
  }

  /**
   * Read all notes from the JSONL file
   * @returns Array of all notes
   */
  async list(): Promise<Note[]> {
    await this.ensureFile();

    const content = await fs.readFile(this.filePath, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line.length > 0);

    const notes: Note[] = [];
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        const validated = NoteSchema.parse(parsed);
        notes.push(validated);
      } catch (error) {
        // Skip malformed lines (could log warning in production)
        console.warn(`Skipping malformed JSONL line: ${line}`, error);
      }
    }

    return notes;
  }

  /**
   * Get a single note by ID
   * @param id - Note ID
   * @returns Note if found, null otherwise
   */
  async get(id: string): Promise<Note | null> {
    const notes = await this.list();
    return notes.find(note => note.id === id) ?? null;
  }

  /**
   * Add a new note to the store
   * @param note - Note to add
   * @throws Error if note with same ID already exists
   */
  async add(note: Note): Promise<void> {
    await this.ensureFile();

    // Check for duplicate ID
    const existing = await this.get(note.id);
    if (existing) {
      throw new Error(`Note with ID ${note.id} already exists`);
    }

    // Validate note
    const validated = NoteSchema.parse(note);

    // Append to file
    const jsonLine = JSON.stringify(validated) + '\n';
    await fs.appendFile(this.filePath, jsonLine, 'utf-8');
  }

  /**
   * Update an existing note
   * @param id - Note ID to update
   * @param updates - Partial note data to update
   * @throws Error if note not found
   */
  async update(id: string, updates: Partial<Note>): Promise<void> {
    const notes = await this.list();
    const index = notes.findIndex(note => note.id === id);

    if (index === -1) {
      throw new Error(`Note with ID ${id} not found`);
    }

    // Merge updates with existing note
    const updated = { ...notes[index], ...updates, id }; // Preserve ID

    // Validate updated note
    const validated = NoteSchema.parse(updated);

    // Replace note in array
    notes[index] = validated;

    // Rewrite entire file
    await this.writeAll(notes);
  }

  /**
   * Delete a note by ID
   * @param id - Note ID to delete
   * @throws Error if note not found
   */
  async delete(id: string): Promise<void> {
    const notes = await this.list();
    const filtered = notes.filter(note => note.id !== id);

    if (filtered.length === notes.length) {
      throw new Error(`Note with ID ${id} not found`);
    }

    // Rewrite entire file without the deleted note
    await this.writeAll(filtered);
  }

  /**
   * Write all notes to the file (replaces existing content)
   * @param notes - Array of notes to write
   */
  private async writeAll(notes: Note[]): Promise<void> {
    await this.ensureFile();

    const lines = notes.map(note => JSON.stringify(note)).join('\n');
    const content = notes.length > 0 ? lines + '\n' : '';

    await fs.writeFile(this.filePath, content, 'utf-8');
  }
}
