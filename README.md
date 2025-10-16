# ContextKit

A modular toolkit for building, evolving, and reusing structured LLM context.

**Status:** 🚧 v1.0 in development

---

## What is ContextKit?

ContextKit enables LLM agents to maintain **structured, evolving, high-quality context** by storing atomic "context bullets" (strategies, examples, checklists) and dynamically assembling them into Anthropic-style Markdown prompts at runtime.

**The Problem:**
Traditional prompt engineering is static and manual, causing:
- Context collapse (details lost through repeated rewriting)
- Brevity bias (over-compressed instructions that omit domain heuristics)
- Poor traceability and reuse of learned strategies

**The Solution:**
A self-improving context system that curates, stores, and retrieves atomic knowledge items, assembling them on-demand into structured, section-based prompts.

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

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Comprehensive planning document with architecture, decisions, and full v1.0 scope
- **[VISION.md](./VISION.md)** - Full ACE-style vision (v1.2+) with reflection-curation loops and advanced features
- **[BEST_PRACTICES.md](./BEST_PRACTICES.md)** - Code style guidelines, commands, and testing practices

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
