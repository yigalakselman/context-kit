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

// Default notebook path: ~/.contextkit/notebook.jsonl
const DEFAULT_NOTEBOOK_PATH = join(homedir(), '.contextkit', 'notebook.jsonl');

// Get notebook path from environment or use default
const notebookPath = process.env.CONTEXTKIT_NOTEBOOK_PATH || DEFAULT_NOTEBOOK_PATH;

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
    description: 'Add a new note to the notebook. Returns the page number of the created note.',
    inputSchema: {
      section: z.string().describe('Section name (e.g., strategies, examples, lessons-learned)'),
      content: z.string().describe('Note content in markdown format'),
      tags: z.array(z.string()).optional().describe('Array of tags for indexing'),
    },
  },
  async ({ section, content, tags }) => {
    const pageNumber = await notebook.addNote({ section, content, tags });
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
    description: 'Get the full table of contents and index for the notebook. Returns markdown with sections, page ranges, and tag index.',
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

// Register search_notes tool
server.registerTool(
  'search_notes',
  {
    title: 'Search Notes',
    description: 'Search notes by section and/or tags. Returns matching pages in markdown format.',
    inputSchema: {
      sections: z.array(z.string()).optional().describe('Filter by section names'),
      tags: z.array(z.string()).optional().describe('Filter by tags (matches ANY tag)'),
      limit: z.number().int().positive().optional().describe('Maximum number of results'),
    },
  },
  async ({ sections, tags, limit }) => {
    // Filter out undefined values for exactOptionalPropertyTypes
    const searchOptions: { sections?: string[]; tags?: string[]; limit?: number } = {};
    if (sections !== undefined) searchOptions.sections = sections;
    if (tags !== undefined) searchOptions.tags = tags;
    if (limit !== undefined) searchOptions.limit = limit;
    const results = await notebook.search(searchOptions);
    return {
      content: [
        {
          type: 'text',
          text: results,
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
    description: 'Update an existing page in the notebook. You can update section, content, and/or tags.',
    inputSchema: {
      pageNumber: z.number().int().positive().describe('Page number to update'),
      section: z.string().optional().describe('New section name'),
      content: z.string().optional().describe('New content in markdown'),
      tags: z.array(z.string()).optional().describe('New tags array'),
    },
  },
  async ({ pageNumber, section, content, tags }) => {
    // Filter out undefined values for exactOptionalPropertyTypes
    const updates: { section?: string; content?: string; tags?: string[] } = {};
    if (section !== undefined) updates.section = section;
    if (content !== undefined) updates.content = content;
    if (tags !== undefined) updates.tags = tags;
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
