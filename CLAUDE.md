# ContextKit - Current Focus

## Active Phase: Project Setup (Phase 1 of 4)

Setting up TypeScript project structure for v1.0 implementation.

---

## Right Now

Clarified core problem statement and documented it in README.md and DEVELOPMENT.md. Ready to begin Phase 1 project setup.

---

## Immediate Next Steps (Phase 1)

1. ✅ Initialize git repository
2. ✅ Add .gitignore
3. ✅ Refactor documentation structure
   - Added core problem statement ("AI agents have amnesia")
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

## Documentation Updates

Update as-you-go, not in batches:

- **This file (CLAUDE.md):** Check off steps ✅, update "Right Now" when context shifts, update "Last Updated"
- **DEVELOPMENT.md:** Append decisions to running log (never edit history)
- **BEST_PRACTICES.md:** Add commands/patterns as discovered
- **README.md:** Update status when milestones complete

💡 See DOC_MAINTENANCE.md for detailed guidelines.

---

**Last Updated:** 2025-10-17
