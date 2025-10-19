/**
 * Type definitions for ContextKit v1.0 (Book Metaphor)
 */

import { z } from 'zod';

/**
 * Zod schema for Note validation
 */
export const NoteSchema = z.object({
  /** Unique identifier (e.g., "ctx-001") → becomes page number (Page 1) */
  id: z.string().min(1),

  /** Section name for TOC organization (strategies, examples, lessons-learned, etc.) */
  section: z.string().min(1),

  /** The note content in markdown (supports code blocks, lists, etc.) */
  content: z.string().min(1),

  /** Array of strings for Index generation and filtering */
  tags: z.array(z.string()).optional(),

  /** ISO 8601 timestamp */
  created_at: z.string().datetime({ offset: true }).optional(),

  /** Escape hatch for future extensions (links, cross-references, etc.) */
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * TypeScript type inferred from Zod schema
 *
 * @example
 * {
 *   "id": "ctx-001",
 *   "section": "strategies",
 *   "content": "Always validate user input before processing",
 *   "tags": ["validation", "security"],
 *   "created_at": "2025-10-17T10:00:00Z",
 *   "metadata": {}
 * }
 */
export type Note = z.infer<typeof NoteSchema>;

/**
 * Options for retrieving pages from the notebook
 */
export interface RetrievalOptions {
  /** Filter by section names */
  sections?: string[];

  /** Filter by tags (returns pages matching ANY of the tags) */
  tags?: string[];

  /** Limit number of results */
  limit?: number;
}
