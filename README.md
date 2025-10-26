# ContextKit

A persistent notebook for AI agents with book metaphor (pages, TOC). Features token estimates and zero-config onboarding.

**Status:** ✅ v1.0 Complete & Tested

---

## What is ContextKit?

ContextKit enables LLM agents to maintain **structured, evolving, high-quality context** by providing a persistent **notebook** modeled like a real book—with pages and Table of Contents. Agents can write notes, browse what's available, and retrieve relevant pages on-demand, all in universal markdown format.

## The Problem

**AI agents have amnesia.** Every session, they start fresh. When they solve a problem, learn a pattern, or discover a gotcha - that knowledge disappears when the session ends.

**Specific pain points:**
- **No persistent memory** - Agent learns "how to paginate this API" → next session, makes the same mistake again
- **Static prompts** - Human manually rewrites system prompt after every insight, slow and lossy
- **Context collapse** - Details get lost when compressing knowledge
- **Poor reuse** - Knowledge from one agent session can't be shared with another
- **All-or-nothing loading** - Either load entire knowledge base (waste tokens) or load nothing (miss relevant knowledge)

## The Solution

**Give AI agents a persistent notebook.**

ContextKit provides a **notebook tool** that agent systems can integrate via [Model Context Protocol (MCP)](https://modelcontextprotocol.io):
- **Write** - Record decisions, lessons, workflows as they work
- **Store** - Keep atomic notes durably (survives sessions)
- **Retrieve** - Browse TOC and retrieve relevant pages on demand
- **Plan** - Token estimates help agents manage context usage

Instead of starting from scratch each time, agents can reference their notes:
> "I've seen this before. Let me check my notes... ah yes, last time I learned to handle pagination this way."

---

## Current Status

**v1.0 Features (Complete & Tested):**
- ✅ Simplified note schema (id, section, content, created_at, metadata)
- ✅ Book metaphor (pages, TOC with token estimates, markdown output)
- ✅ Token size estimates (~4 chars/token heuristic for context planning)
- ✅ Configurable notebook directory (multi-project support)
- ✅ Notebook API (add, retrieve, update, delete)
- ✅ JSONL storage layer (simple, git-friendly)
- ✅ MCP server with enhanced tool descriptions (zero-config agent onboarding)
- ✅ 41 unit tests passing
- ✅ Comprehensive integration testing

**Architecture Decisions (v1.0):**
- **Removed tags** - Simpler schema, more LLM-native (use descriptive section names instead)
- **Removed Index** - Browse via TOC instead
- **Removed search** - TOC browsing sufficient for v1.0, simpler mental model
- **Enhanced tool descriptions** - Built-in usage guidance for any MCP-compatible agent

**Future Roadmap:**
- v1.1: Starter notebook with note templates (decision logs, skills/procedures, troubleshooting patterns), semantic search (if needed based on feedback)
- v1.2: Cross-references and note relationships
- v1.3: Reflection-curation feedback loop (ACE-style)

---

## Quick Start

### For AI Agents (MCP Server)

**Recommended approach:** Use ContextKit as an MCP server for Claude Desktop, Cursor, or any MCP-compatible agent.

1. **Install globally:**
```bash
npm install -g contextkit
```

2. **Configure your MCP client** (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "contextkit": {
      "command": "contextkit-mcp"
    }
  }
}
```

**Multi-project setup:**
```json
{
  "mcpServers": {
    "contextkit-project-a": {
      "command": "contextkit-mcp",
      "env": {
        "CONTEXTKIT_NOTEBOOK_DIR": "/path/to/project-a/.contextkit"
      }
    },
    "contextkit-global": {
      "command": "contextkit-mcp"
    }
  }
}
```

The agent will have access to 6 MCP tools with built-in usage guidance:
- `add_note` - Record new knowledge (with best practices guidance)
- `get_table_of_contents` - Browse notebook structure with token counts
- `get_page` - Retrieve specific pages
- `get_pages` - Retrieve multiple pages at once
- `update_page` - Modify existing notes
- `delete_page` - Remove notes

**Zero configuration needed** - tool descriptions include comprehensive usage guidance!

### As a Library

```bash
npm install contextkit
```

```typescript
import { Notebook } from 'contextkit';

const notebook = new Notebook('./my-notebook.jsonl');

// Add a note (use descriptive section names)
const pageNum = await notebook.addNote({
  section: 'api-pagination-strategies',
  content: '# API Pagination Best Practices\n\nAlways paginate until empty page...'
});

// Get table of contents (includes token estimates)
const toc = await notebook.getTableOfContents();
// Shows: "### Api Pagination Strategies (Page 1) - ~150 tokens"

// Retrieve specific pages
const page = await notebook.getPage(1);

// Retrieve multiple pages at once
const pages = await notebook.getPages([1, 2, 3]);
```

---

## Core Concepts

### Book Metaphor

**ContextKit models your agent's notebook as a real book** with pages and Table of Contents.

#### Note (Page)
Each note is one page in the book with a simplified schema:

```typescript
{
  id: "ctx-001",           // → Page 1
  section: "api-patterns", // Descriptive, hyphenated section name
  content: "# Retry Logic\n\nImplement exponential backoff...",
  created_at: "2025-10-24T10:00:00Z",
  metadata?: {}            // Optional extensibility
}
```

**Best practices:**
- Use descriptive section names (e.g., "mcp-server-setup", "testing-vitest")
- Keep notes atomic (50-200 tokens ideal, one concept per note)
- Start content with clear title/heading
- Write for future retrieval (include context)

#### Table of Contents
Auto-generated with token estimates for context planning:

```markdown
# My Notebook

## Table of Contents

### Api Patterns (Pages 1-3) - ~450 tokens
- Page 1: Retry Logic with Exponential Backoff
- Page 2: Rate Limiting Strategies
- Page 3: Circuit Breaker Pattern

### Database Optimization (Pages 4-5) - ~320 tokens
- Page 4: Connection Pooling
- Page 5: Query Optimization

---
**Total:** 5 pages, ~770 tokens
```

#### Page Output
Markdown format (universal for all LLMs):

```markdown
## Page 1: Retry Logic with Exponential Backoff

**Section:** Api Patterns

# Retry Logic with Exponential Backoff

Implement retry logic with exponential backoff for transient failures:

1. Initial retry after 1 second
2. Double wait time for each retry
3. Cap at 60 seconds max
4. Limit to 5 total attempts

\`\`\`typescript
async function retryWithBackoff(fn, maxRetries = 5) {
  // implementation...
}
\`\`\`
```

### Token Estimates

ContextKit provides token estimates (~4 characters per token) to help agents plan context usage:

- **In TOC:** Each section shows estimated token count
- **Total:** Overall notebook size displayed
- **Planning:** Agents can decide what to retrieve based on available context

---

## Key Features

- 📖 **Book metaphor** - Intuitive pages and TOC navigation
- 📦 **Atomic storage** - JSONL-based (one page = one line, git-friendly)
- 📄 **Universal format** - Markdown output works with all LLMs
- 📊 **Token estimates** - Plan context usage intelligently
- 🎯 **Smart retrieval** - Browse TOC first, then fetch only needed pages
- 🔧 **Multi-project** - Configurable notebook directory via env var
- 📝 **MCP-native** - Designed for AI agent integration
- 💡 **Zero-config** - Tool descriptions include usage guidance
- ✅ **Well-tested** - 41 unit tests + integration testing

---

## Configuration

### Notebook Directory

By default, notebooks are stored in `~/.contextkit/notebook.jsonl`.

**Change location via environment variable:**

```bash
export CONTEXTKIT_NOTEBOOK_DIR="/path/to/project/.contextkit"
contextkit-mcp
```

**Multi-project setup** (MCP config):

```json
{
  "mcpServers": {
    "project-a": {
      "command": "contextkit-mcp",
      "env": {
        "CONTEXTKIT_NOTEBOOK_DIR": "${HOME}/projects/project-a/.contextkit"
      }
    },
    "project-b": {
      "command": "contextkit-mcp",
      "env": {
        "CONTEXTKIT_NOTEBOOK_DIR": "${HOME}/projects/project-b/.contextkit"
      }
    },
    "global": {
      "command": "contextkit-mcp"
      // Uses default: ~/.contextkit/
    }
  }
}
```

This allows agents to access project-specific notebooks alongside a global notebook.

---

## Documentation

### Active Documentation
- **[CLAUDE.md](./CLAUDE.md)** - Current development status and quick reference
- **[TEST_PLAN.md](./TEST_PLAN.md)** - Comprehensive test plan for validation

### Archived Documentation
Historical documentation available in `archive/` for reference:
- **[archive/DEVELOPMENT.md](./archive/DEVELOPMENT.md)** - Full plan, architecture, decisions
- **[archive/MCP_SETUP.md](./archive/MCP_SETUP.md)** - Detailed MCP server setup guide
- **[archive/BEST_PRACTICES.md](./archive/BEST_PRACTICES.md)** - Code style and testing practices
- **[archive/VISION.md](./archive/VISION.md)** - Future roadmap (v1.2+ features)
- **[archive/TESTING_STRATEGY.md](./archive/TESTING_STRATEGY.md)** - Testing approach and results

---

## Context Engineering Principles

ContextKit is built on principles for LLM-native knowledge management:

1. **Atomic Notes** - One concept per note, independently retrievable
2. **Just-in-Time Retrieval** - Fetch only what's needed when needed
3. **Token-Efficient** - Compact, focused content
4. **Descriptive Organization** - Section names provide context (no ambiguous tags)
5. **Self-Documenting** - Tool descriptions guide agents on usage

---

## API Reference

### Notebook Class

```typescript
class Notebook {
  constructor(storePath: string)

  // Core operations
  addNote(note: Omit<Note, 'id'>): Promise<number>
  getPage(pageNum: number): Promise<string>
  getPages(pageNums: number[]): Promise<string>
  getTableOfContents(): Promise<string>
  updatePage(pageNum: number, updates: Partial<Omit<Note, 'id'>>): Promise<void>
  deletePage(pageNum: number): Promise<void>
}

interface Note {
  id: string
  section: string
  content: string
  created_at?: string
  metadata?: Record<string, unknown>
}
```

### MCP Tools

All tools include comprehensive usage guidance in their descriptions:

- `add_note(section, content)` → returns page number
- `get_table_of_contents()` → returns TOC with token estimates
- `get_page(pageNumber)` → returns formatted page
- `get_pages(pageNumbers)` → returns multiple pages
- `update_page(pageNumber, section?, content?)` → updates page
- `delete_page(pageNumber)` → removes page

---

## Contributing

ContextKit is developed with AI agents in mind. See [CLAUDE.md](./CLAUDE.md) for current development status.

### Development Setup

```bash
git clone https://github.com/yourusername/context-kit.git
cd context-kit
npm install
npm run build
npm test
```

### Scripts

```bash
npm run build        # Compile TypeScript
npm run typecheck    # Type checking only
npm test             # Run unit tests
npm run test:watch   # Watch mode
npm run mcp          # Start MCP server locally
npm run clean        # Remove build artifacts
```

---

## License

MIT

---

## Contact

**Author:** Yigal Akselman

**Issues:** [GitHub Issues](https://github.com/yourusername/context-kit/issues)

---

## Acknowledgments

Built with:
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io) - AI agent integration standard
- [Zod](https://zod.dev) - TypeScript-first schema validation
- [Vitest](https://vitest.dev) - Modern testing framework
