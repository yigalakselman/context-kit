import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { NoteStore } from '../src/store.js';
import type { Note } from '../src/types.js';

describe('NoteStore', () => {
  let testFilePath: string;
  let store: NoteStore;

  beforeEach(async () => {
    // Create a temporary file path for testing
    testFilePath = join(tmpdir(), `contextkit-test-${Date.now()}.jsonl`);
    store = new NoteStore(testFilePath);
  });

  afterEach(async () => {
    // Clean up test file
    try {
      await fs.unlink(testFilePath);
    } catch {
      // File might not exist, ignore
    }
  });

  describe('add', () => {
    it('should add a note to empty store', async () => {
      const note: Note = {
        id: 'ctx-001',
        section: 'strategies',
        content: 'Always validate input',
        tags: ['validation'],
      };

      await store.add(note);

      const retrieved = await store.get('ctx-001');
      expect(retrieved).toEqual(note);
    });

    it('should throw error when adding duplicate ID', async () => {
      const note: Note = {
        id: 'ctx-001',
        section: 'strategies',
        content: 'Test',
      };

      await store.add(note);

      await expect(store.add(note)).rejects.toThrow('already exists');
    });

    it('should validate note schema', async () => {
      const invalidNote = {
        id: '', // Invalid: empty string
        section: 'strategies',
        content: 'Test',
      } as Note;

      await expect(store.add(invalidNote)).rejects.toThrow();
    });
  });

  describe('get', () => {
    it('should return null for non-existent note', async () => {
      const result = await store.get('ctx-999');
      expect(result).toBeNull();
    });

    it('should retrieve existing note', async () => {
      const note: Note = {
        id: 'ctx-001',
        section: 'strategies',
        content: 'Test content',
      };

      await store.add(note);
      const retrieved = await store.get('ctx-001');

      expect(retrieved).toEqual(note);
    });
  });

  describe('list', () => {
    it('should return empty array for new store', async () => {
      const notes = await store.list();
      expect(notes).toEqual([]);
    });

    it('should return all notes', async () => {
      const note1: Note = {
        id: 'ctx-001',
        section: 'strategies',
        content: 'Note 1',
      };

      const note2: Note = {
        id: 'ctx-002',
        section: 'examples',
        content: 'Note 2',
        tags: ['test'],
      };

      await store.add(note1);
      await store.add(note2);

      const notes = await store.list();
      expect(notes).toHaveLength(2);
      expect(notes).toContainEqual(note1);
      expect(notes).toContainEqual(note2);
    });
  });

  describe('update', () => {
    it('should update existing note', async () => {
      const note: Note = {
        id: 'ctx-001',
        section: 'strategies',
        content: 'Original content',
      };

      await store.add(note);

      await store.update('ctx-001', {
        content: 'Updated content',
        tags: ['new-tag'],
      });

      const updated = await store.get('ctx-001');
      expect(updated).toEqual({
        id: 'ctx-001',
        section: 'strategies',
        content: 'Updated content',
        tags: ['new-tag'],
      });
    });

    it('should preserve ID even if update tries to change it', async () => {
      const note: Note = {
        id: 'ctx-001',
        section: 'strategies',
        content: 'Test',
      };

      await store.add(note);

      await store.update('ctx-001', {
        id: 'ctx-999', // Try to change ID
        content: 'Updated',
      });

      const updated = await store.get('ctx-001');
      expect(updated?.id).toBe('ctx-001'); // ID should not change
    });

    it('should throw error for non-existent note', async () => {
      await expect(store.update('ctx-999', { content: 'Test' })).rejects.toThrow('not found');
    });
  });

  describe('delete', () => {
    it('should delete existing note', async () => {
      const note: Note = {
        id: 'ctx-001',
        section: 'strategies',
        content: 'Test',
      };

      await store.add(note);
      await store.delete('ctx-001');

      const retrieved = await store.get('ctx-001');
      expect(retrieved).toBeNull();
    });

    it('should throw error for non-existent note', async () => {
      await expect(store.delete('ctx-999')).rejects.toThrow('not found');
    });

    it('should not affect other notes', async () => {
      const note1: Note = {
        id: 'ctx-001',
        section: 'strategies',
        content: 'Note 1',
      };

      const note2: Note = {
        id: 'ctx-002',
        section: 'strategies',
        content: 'Note 2',
      };

      await store.add(note1);
      await store.add(note2);
      await store.delete('ctx-001');

      const notes = await store.list();
      expect(notes).toHaveLength(1);
      expect(notes[0]).toEqual(note2);
    });
  });
});
