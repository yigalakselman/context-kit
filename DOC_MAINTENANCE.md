# Documentation Maintenance Guide

This guide explains how and when to update each documentation file. These rules are for both humans and AI agents working on the project.

---

## Core Principle: Update-as-you-go

**Don't batch documentation updates.** Update immediately when context changes.

Think of documentation as **external memory** - keep it current so future sessions can pick up where you left off.

---

## CLAUDE.md - Session Context

**Purpose:** "What are we doing RIGHT NOW"

### When to Update

- ✅ At phase transitions (Phase 1 → Phase 2 → Phase 3)
- ✅ When completing tasks from "Immediate Next Steps"
- ✅ When resolving "Open Decisions"
- ✅ When starting new focus areas
- ✅ At the end of each work session (update "Right Now")

### What to Update

1. **Checkboxes** - Mark completed steps with ✅
2. **"Right Now" section** - Describe current activity in 1-2 sentences
3. **"Open Decisions"** - Remove when decided, add new ones as they arise
4. **"Active Phase"** - Change when moving to next phase
5. **"Last Updated"** - Always update timestamp

### How to Update

**Good:**
```markdown
4. ✅ Initialize npm package (package.json)
5. ⏳ Configure TypeScript (tsconfig.json)  ← Currently here
```

**Bad:** Don't rewrite entire sections, just edit what changed.

### Example Update Flow

```
# Before starting work
"Right Now: Initializing npm package..."

# During work
Mark step 4 as ✅

# After completing work
"Right Now: Configured TypeScript with strict mode..."
Update "Last Updated: 2025-10-14"
```

---

## BEST_PRACTICES.md - Coding Guidelines

**Purpose:** "How do we code"

### When to Update

- ✅ When adding npm scripts or commands
- ✅ When establishing code patterns or conventions
- ✅ When discovering gotchas or edge cases
- ✅ When team discusses and agrees on standards
- ✅ When adding new tools or dependencies

### What to Update

1. **Commands section** - Add new npm scripts
2. **Code Style** - Refine rules, add examples
3. **Testing Guidelines** - Add patterns discovered through testing
4. **Project Structure** - When directories/files are added
5. **IMPORTANT section** - Add critical constraints or gotchas

### How to Update

**Append, don't rewrite.** Add to existing sections.

**Good:**
```markdown
### Build
```bash
npm run build         # Compile TypeScript to dist/
npm run typecheck     # Run TypeScript type checking
npm run watch         # Watch mode for development (added 2025-10-14)
```

**Include context:**
- Date added (if significant)
- Why the rule exists (if not obvious)
- Examples to illustrate

### Example: Adding a New Command

```markdown
## Commands

### Development
```bash
npm run dev           # Run in development mode with hot reload
```
*Added 2025-10-14: Uses tsx for fast TypeScript execution*
```

---

## DEVELOPMENT.md - Planning Document

**Purpose:** "The full plan and decision history"

### When to Update

- ✅ When making major decisions (tech choices, architecture)
- ✅ When completing milestones (mark components as completed)
- ✅ When pivoting or changing scope significantly
- ✅ When discovering important insights
- ✅ When answering "Open Questions"

### What to Update

1. **Running Log (Section 7)** - ALWAYS append, never edit
2. **Component Status Tables** - Mark as completed or in-progress
3. **Current Status** - Update phase when transitioning
4. **Open Questions** - Mark as resolved, move to log

### How to Update

**Running Log - ALWAYS APPEND:**
```markdown
> **2025-10-14** — Claude: **Chose Zod for schema validation.** Rationale: TypeScript-first design provides excellent DX, runtime validation, and type inference. Ajv considered but Zod's composability better fits v1.0 needs.
```

**Component Status - EDIT:**
```markdown
| **Bullet Store** | Simple storage (JSONL or SQLite) for bullets | ✅ Completed |
```

**NEVER:**
- Don't edit past log entries
- Don't delete decisions (even if they change)
- Don't reorganize the structure

---

## README.md - Public Introduction

**Purpose:** "What is this project"

### When to Update

- ✅ When project status changes (development → beta → release)
- ✅ When quick start instructions become available
- ✅ When adding/removing major features
- ✅ When documentation structure changes
- ✅ When releasing new versions

### What to Update

1. **Status badge** - Change from 🚧 to ✅ when ready
2. **Quick Start section** - Add instructions when v1.0 is usable
3. **Feature list** - Update as features are completed
4. **Documentation links** - Keep accurate references

### How to Update

Keep it **concise and user-friendly**. README is for newcomers.

**Good:**
```markdown
**Status:** ✅ v1.0 released

## Quick Start
\```bash
npm install contextkit
\```
```

**Bad:** Don't add implementation details (those belong in DEVELOPMENT.md)

---

## VISION.md - Future Roadmap

**Purpose:** "Where are we going (v1.2+)"

### When to Update

- ✅ Rarely - this is stable aspirational content
- ✅ When v1.2+ scope changes significantly
- ✅ When adding new future features to consider

### What to Update

**Usually:** Just read, don't edit

**Occasionally:** Add note at top if v1.0 reveals insights about future features

---

## Update Checklist

After significant work, verify:

- [ ] CLAUDE.md - Checkboxes updated, "Right Now" current
- [ ] BEST_PRACTICES.md - New commands/patterns added
- [ ] DEVELOPMENT.md - Major decisions logged
- [ ] README.md - Status accurate (if changed)

---

## Anti-Patterns to Avoid

❌ **Batching updates** - "I'll update docs later"
- Updates get forgotten or incomplete
- Context is lost

❌ **Over-documenting** - Writing essays in CLAUDE.md
- Keep CLAUDE.md lean (~60-80 lines)
- Move details to DEVELOPMENT.md or BEST_PRACTICES.md

❌ **Editing history** - Changing past log entries
- Running log is append-only
- History shows evolution, don't erase it

❌ **Forgetting timestamps** - Not updating "Last Updated"
- Timestamps help understand staleness
- Always update when making changes

---

## Examples

### Scenario 1: Completed a setup task

**Update CLAUDE.md:**
```diff
- 4. ⏳ Initialize npm package (package.json)
+ 4. ✅ Initialize npm package (package.json)
  5. ⏳ Configure TypeScript (tsconfig.json)

- Right Now: Initializing npm package...
+ Right Now: Configuring TypeScript with strict mode...

- **Last Updated:** 2025-10-13
+ **Last Updated:** 2025-10-14
```

**Update BEST_PRACTICES.md:**
```markdown
### Build
\```bash
npm run build     # Compile TypeScript to dist/
\```
```

### Scenario 2: Made a major decision

**Update DEVELOPMENT.md (append to running log):**
```markdown
> **2025-10-14** — Claude: **Chose Vitest for testing framework.** Rationale: ESM-native, fast, modern API similar to Jest. Better TypeScript integration than Jest. Vite-powered for fast hot module reload during test development.
```

**Update CLAUDE.md (remove from open decisions):**
```diff
## Open Decisions

- **Schema Validation:**
  - Option A: Zod ✅ **DECIDED** (see DEVELOPMENT.md)

- **Testing Framework:**
-  - Option A: Vitest (modern, fast, ESM-native)
-  - Option B: Jest (established, battle-tested)
+  - Option A: Vitest ✅ **DECIDED** (see DEVELOPMENT.md)
```

### Scenario 3: Completed a phase

**Update CLAUDE.md:**
```diff
- ## Active Phase: Project Setup (Phase 1 of 4)
+ ## Active Phase: Core Implementation (Phase 2 of 4)

- Right Now: Configuring build system...
+ Right Now: Implementing BulletStore with JSONL operations...

## Immediate Next Steps (Phase 2)
1. ⏳ Define TypeScript types for schemas
2. ⏳ Implement BulletStore class...
```

**Update DEVELOPMENT.md:**
```markdown
> **2025-10-15** — Claude: **Completed Phase 1 (Project Setup).** Successfully initialized npm package, configured TypeScript with strict mode, set up testing with Vitest, and chose Zod for schema validation. Project structure created. Ready to begin Phase 2 (Core Implementation).
```

---

## Questions?

If unsure whether to update:
- Ask: "Will this help the next session pick up where I left off?"
- If yes → update
- If no → skip

**When in doubt, err on the side of updating.** Better to over-communicate than under-communicate.

---

**Last Updated:** 2025-10-13
