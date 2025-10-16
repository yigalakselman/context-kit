# CLAUDE.md — Living Development Document

**Project:** ContextKit
**Owner:** Yigal Akselman
**Status:** 🟡 Development (v1.1 → v1.2)
**Last Updated:** 2025-10-13

---

## 1. WHY — Context & Goals

### Project Name
**ContextKit**

### Summary / Purpose
ContextKit is a modular toolkit for building, evolving, and reusing structured LLM context. It enables language model agents to maintain structured, evolving, high-quality context by implementing an Agentic Context Engineering (ACE) loop of generation, reflection, and curation.

**The Problem:**
Traditional prompt engineering is static and manual, causing:
- Context collapse (details lost through repeated rewriting)
- Brevity bias (over-compressed instructions that omit domain heuristics)
- Poor traceability and reuse of learned strategies
- Expensive re-prompting and inconsistent agent behavior

**The Solution:**
A self-improving context system that curates, stores, and retrieves atomic "context bullets" while dynamically assembling Anthropic-style Markdown context blocks at runtime. The system continuously refines itself using feedback loops (Generator → Reflector → Curator).

### Desired Outcomes / KPIs

| Objective | Metric | Target |
|-----------|--------|--------|
| Maintain structured, interpretable context | % of context conforming to schema | ≥ 95% |
| Improve task accuracy | Δ over baseline LLM prompts | +8–12% |
| Reduce context-update latency | Reflection + curation cycle time | −80% vs. baseline |
| Preserve knowledge | Retention of prior "helpful" bullets after 10 iterations | ≥ 95% |
| Enable explainability | Availability of traceable bullet history | 100% auditable |

### Stakeholders / Owners
- **Owner:** Yigal Akselman
- **Target Users:** Developers building LLM agent systems that need structured, evolving context management

### Current Status
**Phase:** Ideation / Planning

**Reality Check:** This is a greenfield project. No code has been written yet. The README.md contains the Product Requirements Document (PRD) with planned milestones, but implementation has not started.

**Planned Milestones:**
- ⏳ v1.0: Core schemas & retrieval pipeline
- ⏳ v1.1: Dependency & Sequence support
- ⏳ v1.2: Reflection–Curation feedback loop
- ⏳ v1.3: Evaluation Dashboard

---

## 2. WHAT — Requirements

### User Stories

Core functionality:
- [ ] As a developer, I want to store atomic context "bullets" with metadata so that I can build reusable knowledge bases
- [ ] As an agent system, I want to retrieve relevant bullets based on semantic similarity and metadata so that I get contextually appropriate prompts
- [ ] As a developer, I want bullets to respect dependencies (`depends_on`, `conflicts_with`, `supersedes`) so that context remains logically consistent
- [ ] As an agent, I want to execute multi-step sequences with guards and preconditions so that I can handle complex workflows
- [ ] As a system, I want to analyze execution traces and label bullets as helpful/harmful/neutral so that the context improves over time
- [ ] As a curator, I want to integrate feedback deltas incrementally so that the system learns from experience
- [ ] As a developer, I want Anthropic-style Markdown context output so that it integrates seamlessly with existing LLM prompting patterns

Advanced features:
- [ ] As a developer, I want sequence assembly with topological sorting so that multi-step procedures execute in the correct order
- [ ] As a system, I want harmful items auto-quarantined when thresholds are reached so that bad strategies don't propagate
- [ ] As a developer, I want versioned snapshots of context manifests so that I can track evolution over time
- [ ] As a developer, I want to handle ≥10K bullets per agent with <300ms assembly time so that the system scales

### Constraints / Must-Haves

**Technical Constraints (v1.0):**
- Must support simple storage (SQLite or JSONL)
- Must validate all data against JSON Schema
- Should be fast enough for 100-500 bullets (optimize later)
- Must be readable and debuggable (prefer simplicity over performance in v1.0)

**Technical Constraints (deferred to v1.1+):**
- ⏳ Performance: Assemble context in ≤300ms for 2K bullets
- ⏳ Scalability: Handle ≥10K bullets per agent
- ⏳ Explainability: Every bullet has traceable lineage and dependency graph
- ⏳ Safety: Cascade quarantine on harmful dependencies
- ⏳ Semantic search: Support embeddings for similarity matching
- ⏳ Versioning: All schemas versioned and validated via JSON Schema

**Design Principles:**
- Atomic bullets (single concept per entry)
- Explicit metadata over implicit conventions
- Anthropic-style section structure (role, tools, strategies, checklists, examples, sequences)
- Incremental curation (delta updates, not rewrites)
- Dependency-aware retrieval (resolve graph before rendering)

**V1.0 Scope (First Implementation):**
- Define and validate **simplified** schemas (Bullet: 6 fields, Manifest: 3 fields)
- Implement Bullet Store (choose: SQLite vs JSONL)
- Implement basic Retriever (simple selection: all bullets or filter by tags)
- Implement Formatter (basic Markdown assembly with sections)
- Basic API: `get_context(tags=[])`, `add_bullet()`, `list_bullets()`, `update_bullet()`, `delete_bullet()`
- Prove the concept works end-to-end

**Explicitly Out of Scope for V1.0:**
- Semantic search / embeddings (add in v1.1+)
- Dependency resolution (add in v1.1+)
- Sequence assembly (add in v1.1+)
- Reflection-Curation loop (add in v1.2+)
- Evaluation dashboard (add in v1.3+)
- Graph visualization UI
- Federated playbooks
- Human-in-the-loop editor

### Open Questions

**Critical for v1.0 (must decide now):**
- [x] ~~What programming language?~~ → **TypeScript** (decision logged 2025-10-13)
- [x] ~~What storage backend for v1.0?~~ → **JSONL** (decision logged 2025-10-13)
- [x] ~~What's the project structure?~~ → **Single package** (decision logged 2025-10-13)
- [x] ~~What package manager?~~ → **npm** (decision logged 2025-10-13)

**Defer to v1.1+ (can decide later):**
- [ ] What embedding model for semantic similarity? (OpenAI, Anthropic, local model?)
- [ ] How should we handle embedding generation and caching?
- [ ] Should we support vector databases (Pinecone, Weaviate) or stick with local embeddings + SQLite?
- [ ] What's the deduplication threshold for semantic similarity? (cosine similarity > 0.95?)

**Defer to v1.2+ (can decide later):**
- [ ] What's the threshold for auto-quarantining harmful bullets? (2 harmful votes? 3?)
- [ ] How do we handle conflicts between human edits and automated curation?
- [ ] Should the Reflector be LLM-based or rule-based, or hybrid?

---

## 3. HOW — Architecture

### Core Components

**v1.0 (MVP):**
| Component | Description | Status |
|-----------|-------------|--------|
| **Bullet Store** | Simple storage (JSONL or SQLite) for bullets | ⏳ Not started |
| **Manifest** | Simple config (sections, max_bullets, format) | ⏳ Not started |
| **Retriever** | Basic selection: all bullets or filter by tags/section | ⏳ Not started |
| **Formatter** | Markdown assembler with section headers and bullet lists | ⏳ Not started |

**v1.1+ (Future):**
| Component | Description | Status |
|-----------|-------------|--------|
| **Dependency Resolver** | Resolves `depends_on`, `conflicts_with`, `supersedes` relationships | ⏳ Not started |
| **Sequence Assembler** | Topologically sorts and renders multi-step procedures | ⏳ Not started |

**v1.2+ (Future):**
| Component | Description | Status |
|-----------|-------------|--------|
| **Reflector** | Analyzes execution traces and labels bullets as helpful/harmful/neutral | ⏳ Not started |
| **Curator** | Updates or adds bullets based on reflections (incremental deltas) | ⏳ Not started |

**v1.3+ (Future):**
| Component | Description | Status |
|-----------|-------------|--------|
| **Evaluator** | Benchmarks context quality vs. baseline tasks | ⏳ Not started |

### Data Model

**Bullet Schema (v1.0 - Simplified):**
```json
{
  "id": "ctx-001",
  "section": "strategies",
  "content": "Always validate user input before processing",
  "tags": ["validation", "security"],
  "created_at": "2025-10-13T10:00:00Z",
  "metadata": {}
}
```

**Field Descriptions:**
- `id` (required): Unique identifier (e.g., "ctx-001")
- `section` (required): Section name (role, tools, strategies, examples, etc.)
- `content` (required): The actual context text (supports markdown, including code blocks)
- `tags` (optional): Array of strings for filtering/categorization
- `created_at` (optional): ISO 8601 timestamp
- `metadata` (optional): Escape hatch for future extensions without schema breaks

**What's deferred to later versions:**
- ❌ Separate `code` object → embed code in `content` as markdown code blocks
- ❌ `source`, `first_seen`, `last_used` → add when reflection loop exists (v1.2+)
- ❌ `depends_on`, `conflicts_with`, `supersedes` → add with dependency resolution (v1.1+)
- ❌ `sequence_id`, `step_index`, `guards`, `optional` → add with sequence assembly (v1.1+)
- ❌ `counters` (helpful/harmful) → add with reflection loop (v1.2+)

**Manifest Schema (v1.0 - Simplified):**
```json
{
  "sections": ["role", "tools", "strategies", "examples"],
  "max_bullets_per_section": 5,
  "markdown_format": {
    "header_prefix": "## ",
    "bullet_prefix": "- "
  }
}
```

**Field Descriptions:**
- `sections`: Ordered list of section names to render
- `max_bullets_per_section`: Hard cap on bullets per section (controls token budget)
- `markdown_format`: Basic formatting options for output

**What's deferred to later versions:**
- ❌ `ranking_weights` → start simple (newest first, or basic tag matching)
- ❌ `dependency_policy` → add with dependency resolution (v1.1+)
- ❌ `sequence_policy` → add with sequence assembly (v1.1+)
- ❌ `code_block_language_default` → not needed if code lives in content markdown

**Example v1.0 Output:**
```markdown
## role
- You are an expert system for managing invoices

## strategies
- Always validate user input before processing
- Log all API calls for debugging
- Use pagination for large datasets

## examples
- To fetch invoices: `GET /api/invoices?page=1`
```

### Architecture Flow

**v1.0 (Simple):**
```
User Request
      ↓
  Retriever (filter bullets by tags/section)
      ↓
  Formatter (assemble Markdown)
      ↓
  Context Output (Anthropic-style prompt)
```

**v1.2+ (Full ACE Loop):**
```
User/Task Input
      ↓
   Generator (executes task with current context)
      ↓
   Reflector (analyzes trace, tags bullets)
      ↓
   Curator (merges deltas, adds/updates bullets)
      ↓
  Bullet Store (persists changes)
      ↓
   Retriever (selects top-K, resolves dependencies)
      ↓
   Formatter (assembles Markdown)
      ↓
   [Context ready for next Generator execution]
```

### Example Workflow (v1.0)

1. **Developer** adds bullets to JSONL file (manually or via API)
2. **Application** calls `getContext({ tags: ["validation", "api"] })`
3. **Retriever** filters bullets by tags and section
4. **Formatter** assembles Markdown with proper section headers
5. **Application** uses context in LLM prompt

### Example Workflow (v1.2+ - Future)

1. **Generator** executes task using current context
2. **Reflector** analyzes success/failure and tags bullets
3. **Curator** merges deltas, adds improved steps or dependencies
4. **Retriever** resolves dependencies and sequences
5. **Formatter** builds the final Markdown context
6. **Evaluator** measures performance and adaptation cost

### Tech Stack

**Language:** ✅ **TypeScript**
- Type safety for schemas and APIs
- Excellent tooling (VS Code, TSC, ESLint)
- Rich ecosystem (JSON Schema validators, testing frameworks)
- Easy integration with Node.js and browser environments
- Future-ready for web UIs and MCP servers

**Storage (v1.0):** ✅ **JSONL** (JSON Lines)
- One bullet per line, newline-delimited JSON
- Human-readable and git-friendly (easy diffs)
- Simple implementation (no native dependencies)
- Good enough for 100-500 bullets
- Easy to inspect, edit, and debug
- Migration path to SQLite in v1.1+ if needed for performance/queries

**Project Structure:** ✅ **Single package**
- Simple, focused structure for v1.0
- Can split into monorepo later if needed (e.g., separate CLI, web UI, core)
- Easier to reason about and maintain initially

**Package Manager:** ✅ **npm**
- Default, ubiquitous, maximum compatibility
- Simple, well-documented
- No additional installation required
- Good enough for v1.0

**Build/Runtime:**
- Node.js runtime
- TypeScript compiler (tsc)
- ESM modules (modern standard)

**Testing:**
- Vitest (fast, modern) or Jest (established)

**Schema Validation:**
- Zod (TypeScript-first) or Ajv (JSON Schema standard)

**Embedding (v1.1+):**
- Defer decision until v1.1

**LLM for Reflector (v1.2+):**
- Defer decision until v1.2

---

## 4. IMPLEMENTATION — Code & Configuration

**Section placeholder** — to be populated as development progresses.

Key areas to document:
- Project structure
- Core modules and their responsibilities
- API contracts (`get_context()`, `update_reflection()`, etc.)
- Configuration files and environment variables
- Testing strategy

---

## 5. DEPLOYMENT — Shipping & Operations

**Section placeholder** — to be populated when approaching production readiness.

Key areas to document:
- Installation instructions
- Deployment options (local, server, cloud)
- Performance monitoring
- Backup and recovery
- Version migration paths

---

## 6. ORCHESTRATION — Team & Agent Coordination

**Section placeholder** — to be populated as collaboration needs emerge.

Key areas to document:
- Development workflow
- Code review process
- Release cadence
- Documentation maintenance

---

## 7. RUNNING LOG — Decisions & Progress

> **2025-10-13** — Claude: Created initial Living Development Document (CLAUDE.md) structure. Documented WHY (project purpose, KPIs), WHAT (user stories, constraints, open questions), and HOW (architecture, data models). Established foundation for iterative development documentation.

> **2025-10-13** — Claude: Corrected status after reality check. Confirmed this is a greenfield project with no implementation yet. Updated CLAUDE.md to reflect actual current state (Ideation/Planning phase), not aspirational milestones from README.md PRD. Reorganized open questions by priority and milestone. Focused v1.0 scope on core functionality: schemas, basic storage, retrieval, and formatting.

> **2025-10-13** — Yigal + Claude: **Simplified data model for v1.0.** Reduced Bullet schema from 18 fields to 6 fields (id, section, content, tags, created_at, metadata). Reduced Manifest schema from 5 complex objects to 3 simple fields (sections, max_bullets_per_section, markdown_format). Rationale: Start simple, prove the concept end-to-end, then add complexity incrementally. Deferred: code objects, dependencies, sequences, counters, ranking weights, and all reflection/curation features to v1.1+. This dramatically reduces v1.0 implementation complexity while maintaining clear migration path via `metadata` escape hatch.

> **2025-10-13** — Yigal: **Chose TypeScript as implementation language.** Rationale: Type safety for schemas and APIs, excellent tooling ecosystem, easy integration with Node.js and future web/MCP interfaces, rich library support for JSON Schema validation and testing. This positions ContextKit well for future extension (web UIs, MCP servers, embeddings via TypeScript-friendly APIs).

> **2025-10-13** — Yigal: **Chose JSONL (JSON Lines) for v1.0 storage.** Rationale: Human-readable and git-friendly (easy to inspect diffs), simple implementation (no native dependencies), sufficient for 100-500 bullets, easy to debug. Trade-offs accepted: no built-in queries (load into memory), slower than SQLite for large datasets. Migration path to SQLite exists for v1.1+ if performance becomes an issue.

> **2025-10-13** — Yigal: **Chose single package structure for v1.0.** Rationale: Simpler to set up and maintain initially, easier to reason about. Can refactor into monorepo later if needed (e.g., when adding separate CLI, web UI, or MCP server packages). Keep it simple for now.

> **2025-10-13** — Yigal: **Chose npm as package manager.** Rationale: Default, ubiquitous, maximum compatibility. Simple and well-documented. No additional installation required. Optimizes for simplicity over performance for v1.0.

> **2025-10-13** — Yigal + Claude: **Refactored documentation for context efficiency.** Reorganized to eliminate duplication between README.md and CLAUDE.md. README.md simplified to ~100 lines (was ~350), now serves as concise public-facing introduction. CLAUDE.md enhanced as single source of truth with v1.0 workflows and non-functional requirements. VISION.md positioned as v1.2+ roadmap. Impact: ~60% reduction in duplication, clearer separation of concerns (public intro vs. implementation details vs. future vision).

> **2025-10-13** — Yigal + Claude: **Restructured documentation following Anthropic guidance and ACE principles.** Renamed CLAUDE.md → DEVELOPMENT.md (comprehensive planning, 400 lines). Created new CLAUDE.md (dynamic session context, ~60 lines) that tracks current phase and immediate next steps. Created BEST_PRACTICES.md (stable coding guidelines, loaded just-in-time). Rationale: Perfect separation of temporal concerns (now/stable/future) and retrieval patterns (always-loaded/just-in-time/reference). CLAUDE.md now practices what we preach: atomic, just-in-time, focused on current work. This is our own context engineering in action.

> **2025-10-13** — Yigal + Claude: **Added documentation maintenance guidelines.** Created DOC_MAINTENANCE.md with comprehensive rules for when/what/how to update each documentation file. Added short update guide to CLAUDE.md (always visible to agent). Hybrid approach: essential rules always-loaded, detailed guidelines just-in-time. Core principle: update-as-you-go, documentation is external memory. This ensures documentation stays current and useful across sessions.

---

## Notes

This document follows the Living Development Document (LDD) approach:
- **Living:** Updated continuously as the project evolves
- **Single source of truth:** All decisions and rationale captured here
- **Decision log:** Section 7 records all significant choices with timestamps
- **Iterative:** Sections expand as needed, not all at once
- **Thinking tool:** Writing reveals assumptions, complexity, and simpler approaches

**Next steps (v1.0 Implementation):**

**Phase 1: Project Setup**
1. Initialize npm package with `package.json`
2. Configure TypeScript with `tsconfig.json`
3. Set up directory structure (`src/`, `tests/`, `examples/`)
4. Add `.gitignore` for Node.js/TypeScript
5. Choose and configure schema validation library (Zod or Ajv)
6. Choose and configure testing framework (Vitest or Jest)

**Phase 2: Core Implementation**
7. Define TypeScript types for Bullet and Manifest schemas
8. Implement BulletStore class with JSONL read/write operations:
   - `add(bullet)` - append to JSONL file
   - `list(filters?)` - read all bullets, apply filters
   - `get(id)` - retrieve single bullet
   - `update(id, bullet)` - rewrite JSONL with updated bullet
   - `delete(id)` - rewrite JSONL without bullet
9. Implement Retriever class:
   - `retrieve(section?, tags?)` - filter bullets by section and/or tags
   - Respect `max_bullets_per_section` from manifest
10. Implement Formatter class:
   - `format(bullets, manifest)` - generate Markdown output
   - Apply section headers and bullet formatting
11. Implement high-level API/facade:
   - `getContext(tags?)` - end-to-end context generation

**Phase 3: Validation & Testing**
12. Write unit tests for each component
13. Write integration test for full flow (add bullets → retrieve → format)
14. Create example usage script demonstrating v1.0 capabilities
15. Document API in README or Section 4 of CLAUDE.md

**Phase 4: Polish & Commit**
16. Add error handling and validation
17. Write basic usage documentation
18. Create initial git commit with all v1.0 code
19. Log completion in Section 7
