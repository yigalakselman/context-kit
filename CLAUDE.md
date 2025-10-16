# ContextKit - Current Focus

## Active Phase: Project Setup (Phase 1 of 4)

Setting up TypeScript project structure for v1.0 implementation.

---

## Right Now

Initializing npm package and configuring TypeScript build system.

---

## Immediate Next Steps (Phase 1)

1. ✅ Initialize git repository
2. ✅ Add .gitignore
3. ✅ Refactor documentation structure
4. ⏳ Initialize npm package (package.json)
5. ⏳ Configure TypeScript (tsconfig.json)
6. ⏳ Set up directory structure (src/, tests/, examples/)
7. ⏳ Choose and configure schema validation library
8. ⏳ Choose and configure testing framework

---

## Open Decisions

**Schema Validation:**
- Option A: Zod (TypeScript-first, excellent DX, runtime validation)
- Option B: Ajv (JSON Schema standard, broader compatibility)

**Testing Framework:**
- Option A: Vitest (modern, fast, ESM-native)
- Option B: Jest (established, battle-tested, more ecosystem)

---

## v1.0 Scope Reminder

**Building:**
- Bullet schema (6 fields: id, section, content, tags, created_at, metadata)
- Manifest schema (3 fields: sections, max_bullets_per_section, markdown_format)
- BulletStore (JSONL CRUD operations)
- Retriever (filter by section/tags)
- Formatter (Markdown assembly)

**NOT building (deferred to v1.1+):**
- ❌ Embeddings / semantic search
- ❌ Dependency resolution
- ❌ Sequence assembly
- ❌ Reflection-curation loop

---

## Quick References

- **DEVELOPMENT.md** - Full plan, architecture, decisions, running log
- **BEST_PRACTICES.md** - Code style, commands, testing guidelines
- **VISION.md** - Future roadmap (v1.2+ features)
- **README.md** - Public-facing introduction

---

## Tech Stack (Decided)

- Language: TypeScript (ES modules)
- Storage: JSONL (JSON Lines)
- Package Manager: npm
- Structure: Single package
- Runtime: Node.js

---

**Last Updated:** 2025-10-13
