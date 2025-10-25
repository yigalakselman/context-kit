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

  /** Section name for TOC organization (e.g., mcp-setup, testing-vitest, architecture-decisions) */
  section: z.string().min(1),

  /** The note content in markdown (supports code blocks, lists, etc.) */
  content: z.string().min(1),

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
 *   "section": "best-practices",
 *   "content": "# Input Validation\n\nAlways validate user input before processing to prevent security issues.",
 *   "created_at": "2025-10-17T10:00:00Z",
 *   "metadata": {}
 * }
 */
export type Note = z.infer<typeof NoteSchema>;
