/**
 * Utilities for converting between note IDs and page numbers
 *
 * The book metaphor uses page numbers derived from note IDs:
 * - ctx-001 → Page 1
 * - ctx-042 → Page 42
 * - ctx-007 → Page 7
 */

/**
 * Extract page number from a note ID
 * @param id - Note ID (e.g., "ctx-001")
 * @returns Page number (e.g., 1)
 * @throws Error if ID format is invalid
 */
export function getPageNumber(id: string): number {
  const match = id.match(/^ctx-(\d+)$/);
  if (!match || !match[1]) {
    throw new Error(`Invalid note ID format: ${id}. Expected format: ctx-NNN`);
  }
  return parseInt(match[1], 10);
}

/**
 * Generate note ID from a page number
 * @param pageNum - Page number (e.g., 1)
 * @returns Note ID (e.g., "ctx-001")
 */
export function getIdFromPage(pageNum: number): string {
  if (pageNum < 1 || !Number.isInteger(pageNum)) {
    throw new Error(`Invalid page number: ${pageNum}. Must be a positive integer.`);
  }
  return `ctx-${pageNum.toString().padStart(3, '0')}`;
}

/**
 * Generate the next available ID from a list of existing IDs
 * @param existingIds - Array of existing note IDs
 * @returns Next available ID (e.g., if max is ctx-042, returns ctx-043)
 */
export function generateNextId(existingIds: string[]): string {
  if (existingIds.length === 0) {
    return 'ctx-001';
  }

  const pageNumbers = existingIds.map(getPageNumber);
  const maxPage = Math.max(...pageNumbers);
  return getIdFromPage(maxPage + 1);
}

/**
 * Extract title from note content (first line or first H1/H2)
 * Used for TOC generation
 * @param content - Note content in markdown
 * @returns Title string (fallback to "Untitled" if none found)
 */
export function extractTitle(content: string): string {
  const lines = content.trim().split('\n');

  // Try to find H1 or H2 heading
  for (const line of lines) {
    const h1Match = line.match(/^#\s+(.+)$/);
    if (h1Match?.[1]) return h1Match[1].trim();

    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match?.[1]) return h2Match[1].trim();
  }

  // Fallback to first non-empty line, truncated to 60 chars
  const firstLine = lines.find(line => line.trim().length > 0);
  if (firstLine) {
    const truncated = firstLine.trim().slice(0, 60);
    return truncated.length < firstLine.trim().length ? `${truncated}...` : truncated;
  }

  return 'Untitled';
}

/**
 * Estimate token count for a string using rule of thumb (4 chars ≈ 1 token)
 * This is a simple approximation for context planning.
 * @param text - Text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokens(text: string): number {
  // Simple heuristic: ~4 characters per token
  // This is conservative and works reasonably well for English text
  return Math.ceil(text.length / 4);
}
