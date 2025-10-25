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
- Capture architecture decisions and their rationale
- Record code patterns and best practices discovered during work
- Save bug investigation findings and solutions
- Store user preferences and project context
- Document lessons learned from errors or challenges

**Best practices:**
- Use descriptive section names (e.g., "mcp-setup", "testing-vitest", "architecture-decisions")
- Keep notes focused and atomic (one concept per note, 50-200 tokens ideal)
- Start content with a clear title or heading
- Write for future retrieval - include enough context to be useful months later

Returns the page number of the created note.`,
    inputSchema: {
      section: z.string().describe('Section name - use descriptive, hyphenated names (e.g., mcp-setup, testing-vitest, architecture-decisions)'),
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
- At the start of a session - understand what knowledge exists in the notebook
- Before retrieving notes - see available sections and their sizes
- To plan context usage - check token counts before loading content
- When deciding what to search for - discover relevant sections

Returns markdown with:
- Section names organized alphabetically
- Page ranges for each section
- Estimated token count per section and total
- Helps you make smart decisions about what to retrieve

**Tip:** Always call this first to understand notebook structure.`,
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
- Correct or enhance existing notes
- Add new information to previous decisions
- Reorganize notes by moving to different sections
- Refine content based on new learnings

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
