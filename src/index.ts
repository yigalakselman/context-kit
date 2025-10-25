/**
 * ContextKit - A modular toolkit for building, evolving, and reusing structured LLM context
 *
 * v1.0: Notebook component with book metaphor (pages, TOC, index)
 */

// Main Notebook class
export { Notebook } from './notebook.js';

// Types
export type { Note } from './types.js';
export { NoteSchema } from './types.js';

// Lower-level components (for advanced usage)
export { NoteStore } from './store.js';
export { getPageNumber, getIdFromPage, generateNextId, extractTitle, estimateTokens } from './utils/id.js';
export {
  generateTOC,
  formatPage,
  formatPages,
  generateTableOfContents,
} from './formatters.js';
