#!/usr/bin/env node

/**
 * ContextKit MCP Server
 *
 * Exposes the Notebook as MCP tools for AI agents.
 * Uses stdio transport for local communication with Claude Desktop and other MCP clients.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Notebook } from './notebook.js';
import { z } from 'zod';
import { join } from 'node:path';
import { homedir } from 'node:os';

// Get notebook directory from environment or use default (~/.contextkit/)
const notebookDir = process.env.CONTEXTKIT_NOTEBOOK_DIR || join(homedir(), '.contextkit');
const notebookPath = join(notebookDir, 'notebook.jsonl');

// Initialize notebook
const notebook = new Notebook(notebookPath);

// Create MCP server
const server = new McpServer({
  name: 'contextkit',
  version: '1.0.0',
});

// Register add_note tool
server.registerTool(
  'add_note',
  {
    title: 'Add Note',
    description: `Add a new note to the notebook for persistent memory across sessions.

**When to use:**
- Capture knowledge worth remembering beyond this session
- Record decisions and their reasoning (the "why", not just "what")
- Document patterns, strategies, or insights discovered during work
- Store user preferences, domain facts, or project context
- Save lessons learned from successes or failures

**Context engineering principles applied:**
- **Atomic Notes**: One concept per note (50-200 tokens ideal)
- **Token-Efficient**: Compact, focused content - no fluff
- **Descriptive Organization**: Section names provide context for browsing

**Best practices:**
- Start with a clear title or heading (makes content scannable)
- Write for future retrieval - assume no memory of this conversation
- Include enough context to be useful months later
- Use descriptive section names: "user-preferences", "api-patterns", "project-constraints"
- Think: "What would I search for to find this?" - include those terms naturally

Returns the page number of the created note.`,
    inputSchema: {
      section: z.string().describe('Section name - use descriptive, hyphenated names (e.g., user-preferences, api-patterns, project-constraints)'),
      content: z.string().describe('Note content in markdown format'),
    },
  },
  async ({ section, content }) => {
    const pageNumber = await notebook.addNote({ section, content });
    return {
      content: [
        {
          type: 'text',
          text: `Note added successfully as Page ${pageNumber}`,
        },
      ],
    };
  }
);

// Register get_table_of_contents tool
server.registerTool(
  'get_table_of_contents',
  {
    title: 'Get Table of Contents',
    description: `Get the table of contents showing notebook structure and token counts.

**When to use:**
- **Start of every session** - discover what persistent knowledge exists
- Before retrieving notes - browse sections to find relevant domains
- Plan context budget - token counts help manage context window
- Understand knowledge organization - see your information architecture

**Context engineering principles applied:**
- **Just-in-Time Retrieval**: Browse first, then fetch only needed pages
- **Token-Efficient**: Token estimates let you plan within context budget
- **Descriptive Organization**: Section names reveal knowledge domains
- **Self-Documenting**: Shows your notebook's structure at a glance

Returns markdown with:
- Section names (organized alphabetically)
- Page ranges for each section
- Estimated token count per section + total
- First line of each page (helps identify content)

**Recommended workflow:**
1. Call this first to see what exists
2. Identify relevant sections for current task
3. Check token estimates to plan retrieval
4. Use get_page or get_pages to fetch specific content`,
    inputSchema: {},
  },
  async () => {
    const toc = await notebook.getTableOfContents();
    return {
      content: [
        {
          type: 'text',
          text: toc,
        },
      ],
    };
  }
);

// Register get_page tool
server.registerTool(
  'get_page',
  {
    title: 'Get Page',
    description: 'Get a specific page from the notebook by page number. Returns the page content in markdown format.',
    inputSchema: {
      pageNumber: z.number().int().positive().describe('Page number to retrieve'),
    },
  },
  async ({ pageNumber }) => {
    const page = await notebook.getPage(pageNumber);
    return {
      content: [
        {
          type: 'text',
          text: page,
        },
      ],
    };
  }
);

// Register get_pages tool
server.registerTool(
  'get_pages',
  {
    title: 'Get Pages',
    description: 'Get multiple pages from the notebook by page numbers. Returns all pages in markdown format.',
    inputSchema: {
      pageNumbers: z.array(z.number().int().positive()).describe('Array of page numbers to retrieve'),
    },
  },
  async ({ pageNumbers }) => {
    const pages = await notebook.getPages(pageNumbers);
    return {
      content: [
        {
          type: 'text',
          text: pages,
        },
      ],
    };
  }
);

// Register update_page tool
server.registerTool(
  'update_page',
  {
    title: 'Update Page',
    description: `Update an existing page in the notebook.

**When to use:**
- Correct outdated or inaccurate information
- Enhance notes with new details discovered since creation
- Consolidate duplicate or related knowledge into one authoritative note
- Reorganize by moving to a more appropriate section
- Refine for clarity and scannability

**Context engineering principles applied:**
- **Just-in-Time Retrieval**: Keep notes current so future retrieval is accurate
- **Token-Efficient**: Consolidate rather than accumulate - prevent note bloat
- **Atomic Notes**: If updating makes a note cover multiple concepts, split instead

**Compaction strategy:**
- Keep: decisions, strategies, constraints, lessons learned
- Update: when understanding deepens or details emerge
- Split: when one note grows to cover multiple concepts
- Delete: when information becomes obsolete (use delete_page tool)

**Note:** You can update section, content, or both in a single call.`,
    inputSchema: {
      pageNumber: z.number().int().positive().describe('Page number to update'),
      section: z.string().optional().describe('New section name'),
      content: z.string().optional().describe('New content in markdown'),
    },
  },
  async ({ pageNumber, section, content }) => {
    // Filter out undefined values for exactOptionalPropertyTypes
    const updates: { section?: string; content?: string } = {};
    if (section !== undefined) updates.section = section;
    if (content !== undefined) updates.content = content;
    await notebook.updatePage(pageNumber, updates);
    return {
      content: [
        {
          type: 'text',
          text: `Page ${pageNumber} updated successfully`,
        },
      ],
    };
  }
);

// Register delete_page tool
server.registerTool(
  'delete_page',
  {
    title: 'Delete Page',
    description: 'Delete a page from the notebook by page number. This operation cannot be undone.',
    inputSchema: {
      pageNumber: z.number().int().positive().describe('Page number to delete'),
    },
  },
  async ({ pageNumber }) => {
    await notebook.deletePage(pageNumber);
    return {
      content: [
        {
          type: 'text',
          text: `Page ${pageNumber} deleted successfully`,
        },
      ],
    };
  }
);

// Start server with stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr (stdout is used for MCP protocol)
  console.error('ContextKit MCP Server running on stdio');
  console.error(`Notebook path: ${notebookPath}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
