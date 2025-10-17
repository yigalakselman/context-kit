# ContextKit

A modular toolkit for building, evolving, and reusing structured LLM context.

**Status:** 🚧 v1.0 in development

---

## What is ContextKit?

ContextKit enables LLM agents to maintain **structured, evolving, high-quality context** by storing atomic "context bullets" (strategies, examples, checklists) and dynamically assembling them into Anthropic-style Markdown prompts at runtime.

## The Problem

**AI agents have amnesia.** Every session, they start fresh. When they solve a problem, learn a pattern, or discover a gotcha - that knowledge disappears when the session ends.

**Specific pain points:**
- **No persistent memory** - Agent learns "how to paginate this API" → next session, makes the same mistake again
- **Static prompts** - Human manually rewrites system prompt after every insight, slow and lossy
- **Context collapse** - Details get lost when compressing knowledge ("validate input" instead of the full checklist with all edge cases)
- **Poor reuse** - Knowledge from one agent session can't be shared with another
- **All-or-nothing loading** - Either load entire knowledge base (waste tokens) or load nothing (miss relevant knowledge)

## The Solution

**Give AI agents a notebook and memory system.**

ContextKit enables agents to:
- **Write** - Record decisions, lessons, workflows as they work
- **Store** - Keep atomic "bullets" durably (survives sessions)
- **Retrieve** - Smart retrieval of relevant past knowledge when needed
- **Evolve** - Knowledge base improves through use (reflection + curation)

Instead of starting from scratch each time, agents can reference their notes:
> "I've seen this before. Let me check my notes... ah yes, last time I learned to handle pagination this way."

---

## Current Status

**v1.0 (In Development):**
- ✅ Simplified data schemas (Bullet: 6 fields, Manifest: 3 fields)
- ✅ Technology stack decided: TypeScript, JSONL storage, npm
- 🚧 Implementation: BulletStore, Retriever, Formatter

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

## Core Concepts

**Bullet** - Atomic context entry (strategy, example, checklist item)
```json
{
  "id": "ctx-001",
  "section": "strategies",
  "content": "Always validate user input before processing",
  "tags": ["validation", "security"]
}
```

**Manifest** - Configuration for retrieval and formatting
```json
{
  "sections": ["role", "tools", "strategies", "examples"],
  "max_bullets_per_section": 5
}
```

**Output** - Assembled Markdown context
```markdown
## role
- You are an expert system

## strategies
- Always validate user input before processing
- Log all API calls for debugging
```

---

## Key Features (Planned)

- 📦 **Atomic storage** - JSONL-based bullet store for git-friendly context
- 🎯 **Section-based organization** - Anthropic-style structured prompts
- 🔍 **Smart retrieval** - Filter by tags and sections
- 📝 **Markdown assembly** - Dynamic prompt generation
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
