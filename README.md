# ContextKit

A modular toolkit for building, evolving, and reusing structured LLM context.

**Status:** 🚧 v1.0 in development

---

## What is ContextKit?

ContextKit enables LLM agents to maintain **structured, evolving, high-quality context** by providing a persistent **notebook** modeled like a real book—with pages, Table of Contents, and Index. Agents can write notes, browse what's available, and retrieve relevant pages on-demand, all in universal markdown format.

## The Problem

**AI agents have amnesia.** Every session, they start fresh. When they solve a problem, learn a pattern, or discover a gotcha - that knowledge disappears when the session ends.

**Specific pain points:**
- **No persistent memory** - Agent learns "how to paginate this API" → next session, makes the same mistake again
- **Static prompts** - Human manually rewrites system prompt after every insight, slow and lossy
- **Context collapse** - Details get lost when compressing knowledge ("validate input" instead of the full checklist with all edge cases)
- **Poor reuse** - Knowledge from one agent session can't be shared with another
- **All-or-nothing loading** - Either load entire knowledge base (waste tokens) or load nothing (miss relevant knowledge)

## The Solution

**Give AI agents a persistent notebook.**

ContextKit provides a **notebook tool** that agent systems can integrate:
- **Write** - Record decisions, lessons, workflows as they work
- **Store** - Keep atomic notes durably (survives sessions)
- **Retrieve** - Smart retrieval of relevant past knowledge when needed
- **Evolve** - Knowledge base improves through use (reflection + curation)

Instead of starting from scratch each time, agents can reference their notes:
> "I've seen this before. Let me check my notes... ah yes, last time I learned to handle pagination this way."

### How It Fits

**Important distinction:**
- **Memory** = Short-lived session state (conversation history, limited by hardware)
- **Context Window** = What goes to the LLM (assembled by agent system: prompt + query + history + tools + notes)
- **Notebook** = Persistent storage tool (ContextKit's role—provides notes to agent systems)

ContextKit is the **Notebook**. Agent systems (like Claude Code) handle context assembly and call Notebook as a tool to fetch relevant notes.

---

## Current Status

**v1.0 (In Development):**
- ✅ Note schema defined (6 fields: id, section, content, tags, created_at, metadata)
- ✅ Technology stack decided: TypeScript, JSONL storage, npm
- ✅ Book metaphor adopted (pages, TOC, Index, markdown output)
- 🚧 Implementation: Notebook API, storage layer, formatters

**Future Roadmap:**
- v1.1: Dependency resolution & sequence assembly
- v1.2: Reflection-curation feedback loop (ACE-style)
- v1.3: Evaluation dashboard

---

## Documentation

Our documentation uses a context-optimized structure:

- **[CLAUDE.md](./CLAUDE.md)** - Current session focus (updated as development progresses)
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Comprehensive planning document with architecture, decisions, and full scope
- **[BEST_PRACTICES.md](./BEST_PRACTICES.md)** - Code style guidelines, commands, and testing practices
- **[VISION.md](./VISION.md)** - Future roadmap (v1.2+) with ACE-style features
- **[DOC_MAINTENANCE.md](./DOC_MAINTENANCE.md)** - Guidelines for maintaining documentation

**Philosophy:** Separation of temporal concerns (now/stable/future) and retrieval patterns (always-loaded/just-in-time/reference).

---

## Quick Start

> Coming soon - v1.0 implementation in progress

---

## Core Concepts (Book Metaphor)

**ContextKit models your agent's notebook as a real book** with pages, Table of Contents, and Index.

**Note (Page)** - Each note is one page in the book
```json
{
  "id": "ctx-001",
  "section": "strategies",
  "content": "Always validate user input before processing",
  "tags": ["validation", "security"]
}
```
`ctx-001` → **Page 1**

**Table of Contents** - Auto-generated navigation
```markdown
### Strategies (Pages 1-5)
- Page 1: Input Validation Strategy
- Page 2: Error Handling Strategy

### Examples (Pages 6-10)
- Page 6: API Call Example

## Index (Tags)
- validation: Pages 1, 6
- api: Pages 2, 6
```

**Page Output** - Markdown format (universal for all LLMs)
```markdown
## Page 1: Input Validation Strategy

**Section:** strategies
**Tags:** #validation #security

Always validate user input before processing:
1. Check for null/undefined
2. Verify data types
3. Validate length constraints
4. Sanitize input

**See also:** Page 6 (example)
```

---

## Key Features (Planned)

- 📖 **Book metaphor** - Intuitive pages, TOC, and Index navigation
- 📦 **Atomic storage** - JSONL-based note store (one page = one line)
- 📄 **Universal format** - Markdown output works with all LLMs
- 🔍 **Smart retrieval** - Browse TOC, search by tags, fetch specific pages
- 🎯 **Token-efficient** - Fetch TOC first, then only needed pages
- 📝 **Tool-oriented API** - Designed for AI agent systems to integrate
- 🔄 **Self-improving** (v1.2+) - Reflection-curation feedback loops

---

## Contributing

See [DEVELOPMENT.md](./DEVELOPMENT.md) for implementation status and [BEST_PRACTICES.md](./BEST_PRACTICES.md) for development workflow.

---

## License

TBD

---

## Contact

**Owner:** Yigal Akselman
