# MCP Server Setup

This guide shows how to use ContextKit's MCP server with AI agents like Claude Desktop.

## What is MCP?

Model Context Protocol (MCP) is a standard protocol for AI agents to access tools and resources. ContextKit provides an MCP server that exposes the Notebook as tools that AI agents can use to:

- Add notes during conversations
- Retrieve past notes by page number
- Search notes by tags or sections
- Update and organize their knowledge

## Architecture

```
AI Agent (Claude Desktop)
    ↓
MCP Protocol (stdio)
    ↓
ContextKit MCP Server
    ↓
Notebook (JSONL storage)
```

## Installation

### Option 1: Install as npm package (recommended)

```bash
npm install -g contextkit
```

Then use `contextkit-mcp` as the command in your MCP client configuration.

### Option 2: Use from source

```bash
git clone https://github.com/yiglakselman/context-kit.git
cd context-kit
npm install
npm run build
```

Then use `node /path/to/context-kit/dist/mcp-server.js` in your configuration.

## Claude Desktop Configuration

Add this to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "contextkit": {
      "command": "node",
      "args": ["/absolute/path/to/context-kit/dist/mcp-server.js"]
    }
  }
}
```

Or if installed globally:

```json
{
  "mcpServers": {
    "contextkit": {
      "command": "contextkit-mcp"
    }
  }
}
```

### Custom Notebook Path

By default, the notebook is stored at `~/.contextkit/notebook.jsonl`. To use a different location:

```json
{
  "mcpServers": {
    "contextkit": {
      "command": "node",
      "args": ["/path/to/context-kit/dist/mcp-server.js"],
      "env": {
        "CONTEXTKIT_NOTEBOOK_PATH": "/custom/path/to/notebook.jsonl"
      }
    }
  }
}
```

## Available Tools

Once configured, AI agents can use these tools:

### `add_note`
Add a new note to the notebook.

**Parameters:**
- `section` (required): Section name (e.g., "api-patterns", "testing-strategies", "lessons-learned")
- `content` (required): Note content in markdown

**Returns:** Page number of the created note

**Example:**
```typescript
add_note({
  section: "api-patterns",
  content: "# Always paginate APIs\n\nNever assume fixed page count. Always paginate until empty page is returned..."
})
// Returns: "Note added successfully as Page 1"
```

### `get_table_of_contents`
Get the full table of contents with token estimates.

**Parameters:** None

**Returns:** Markdown with sections, page ranges, and estimated token counts

**Example output:**
```markdown
# My Notebook

## Table of Contents

### Api Patterns (Pages 1-5) - ~850 tokens
- Page 1: Always paginate APIs
- Page 2: Rate limiting strategies
- Page 3: Error handling for API failures
- Page 4: Authentication best practices
- Page 5: Response caching strategies

### Testing Strategies (Pages 6-8) - ~420 tokens
- Page 6: Unit testing with Vitest
- Page 7: Integration testing patterns
- Page 8: Mocking external APIs

---
**Total:** 8 pages, ~1270 tokens
```

### `get_page`
Get a specific page by page number.

**Parameters:**
- `pageNumber` (required): Page number to retrieve

**Returns:** Page content in markdown

### `get_pages`
Get multiple pages by page numbers.

**Parameters:**
- `pageNumbers` (required): Array of page numbers

**Returns:** All pages in markdown

### `search_notes`
Search notes by section and/or keywords.

**Parameters:**
- `sections` (optional): Filter by section names
- `query` (optional): Search keywords (matches in section names and content, all keywords must match)
- `limit` (optional): Maximum number of results

**Returns:** Matching pages in markdown

**Examples:**
```typescript
// Search by keywords (full-text search)
search_notes({
  query: "api error handling",
  limit: 5
})

// Search by section
search_notes({
  sections: ["api-patterns"]
})

// Combined search
search_notes({
  sections: ["api-patterns"],
  query: "pagination retry",
  limit: 3
})
```

### `update_page`
Update an existing page.

**Parameters:**
- `pageNumber` (required): Page number to update
- `section` (optional): New section name
- `content` (optional): New content

### `delete_page`
Delete a page from the notebook.

**Parameters:**
- `pageNumber` (required): Page number to delete

**Warning:** This operation cannot be undone.

## Usage Workflow

Recommended workflow for AI agents:

1. **Start session**: Call `get_table_of_contents()` to see what's in the notebook
2. **Retrieve relevant pages**: Use `get_page()` or `search_notes()` to fetch specific knowledge
3. **During work**: Call `add_note()` to capture new insights, patterns, or lessons learned
4. **Update knowledge**: Use `update_page()` to refine existing notes

## Example: How Claude Desktop Uses ContextKit

```
User: "Help me build a pagination feature for my API"

Claude:
1. Calls get_table_of_contents() → Sees "Api Patterns (Pages 1-5)" section
2. Calls search_notes({query: "pagination"}) → Finds Page 1: "Always paginate APIs"
3. Calls get_page(1) → Retrieves the detailed pagination strategy note
4. Uses that knowledge to help the user implement the feature
5. After solving the problem, calls add_note() to record the new implementation pattern
```

## Troubleshooting

### Server not starting

1. Check the path in your config is correct
2. Ensure the project is built: `npm run build`
3. Check stderr logs (server writes to stderr, not stdout)

### Notebook file permissions

The server needs read/write access to the notebook file location. Default is `~/.contextkit/notebook.jsonl`.

### Testing the server

You can test the server manually:

```bash
npm run mcp
```

This will start the server. You should see:
```
ContextKit MCP Server running on stdio
Notebook path: /Users/username/.contextkit/notebook.jsonl
```

Press Ctrl+C to stop.

## Security Notes

- The MCP server uses stdio transport (local only, no network exposure)
- The server has full read/write access to the configured notebook file
- All data is stored locally in JSONL format
- No data leaves your machine

## Implementation Notes

The MCP server implementation uses the latest MCP TypeScript SDK patterns:

- **SDK Version**: `@modelcontextprotocol/sdk` v1.20+
- **API Style**: Modern `McpServer` with `registerTool()` methods
- **Schema Validation**: Zod v3 for type-safe tool parameters
- **Transport**: stdio for local communication with AI agents

The server exposes 7 tools with full Zod schema validation and proper error handling. Each tool includes descriptive titles for better UI presentation in MCP clients.

## Next Steps

- See `examples/basic-usage.ts` for programmatic Notebook API usage
- Read `DEVELOPMENT.md` for architecture details
- Read `README.md` for the big picture
