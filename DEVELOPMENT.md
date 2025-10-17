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

### The Core Problem

**AI agents have amnesia.** Every session, they start fresh. When they solve a problem, learn a pattern, or discover a gotcha - that knowledge disappears when the session ends.

**Specific pain points:**

1. **No persistent memory**
   - Agent solves "how to paginate this API" → next session, makes same mistake again
   - Agent learns "always validate input before processing" → forgets it next time
   - No way to build on past experience

2. **Static, manual prompts**
   - Human writes a system prompt
   - Agent uses it, discovers it's incomplete
   - Human manually rewrites it
   - Cycle repeats - slow, lossy, doesn't scale

3. **Context collapse**
   - Agent has 10 useful strategies
   - Human tries to compress them into system prompt
   - Details get lost ("validate input" instead of "validate input format, check for nulls, ensure UTF-8 encoding, verify length constraints")
   - Brevity bias - over-compression loses critical nuance

4. **Poor reuse**
   - Agent A learns a great debugging workflow
   - Agent B working on similar task can't access it
   - No way to share knowledge between sessions/agents

5. **All-or-nothing context loading**
   - Either load entire knowledge base (waste tokens)
   - Or load nothing (miss relevant knowledge)
   - No smart "retrieve what's relevant right now"

### The Solution

**Give AI agents a notebook and memory system.**

- **Write**: Agents write down decisions, lessons, workflows as they work
- **Store**: Atomic "bullets" stored durably (survives sessions)
- **Retrieve**: Smart retrieval of relevant past knowledge when needed
- **Evolve**: Knowledge base improves through use (reflection + curation)

Instead of starting from scratch each time, agents can say:
> "I've seen this before. Let me check my notes... ah yes, last time I learned to handle pagination this way."

The system achieves this through:
- Atomic "context bullets" stored as structured data
- Dynamic Anthropic-style Markdown assembly at runtime
- Feedback loops (Generator → Reflector → Curator) for continuous improvement

### Key Concepts & Terminology

It's critical to understand how **Memory**, **Context Window**, and **Notebook** relate:

**Memory (Short-lived, Session-scoped)**
- Ephemeral storage during a single agent session
- Limited by hardware specs (RAM)
- Contains conversation history, intermediate states, tool outputs
- Disappears when session ends
- Example: Claude Code's current conversation thread

**Context Window (What goes to the LLM)**
- The actual input sent to the LLM on each request
- Limited by model constraints (e.g., 200K tokens for Claude 3.5 Sonnet)
- Requires careful optimization (token budget management)
- Assembled by the **agent system**, not by Notebook
- Typical components:
  - System prompt (role, instructions)
  - User query (current request)
  - Conversation history (from Memory)
  - Tool definitions (available functions)
  - Retrieved notes (from Notebook) ← **This is where Notebook fits**

**Notebook (Persistent, Cross-session)**
- Durable storage that survives session boundaries
- No size limit from LLM perspective (storage-based)
- Contains optimized, curated notes
- Accessed as a **tool** by agent systems
- Example: ContextKit's JSONL storage with book metaphor

**The Architecture:**
```
AI Agent System (e.g., Claude Code)
├─ Memory (short-lived session state)
├─ Context Window Builder (assembles LLM input)
│  ├─ System prompt
│  ├─ User query
│  ├─ Conversation history (from Memory)
│  ├─ Tool definitions
│  └─ Retrieved notes ← from Notebook
└─ Tools
   └─ Notebook (persistent storage + retrieval)
```

**Key Insight:** Notebook is a tool that provides optimized notes to agent systems. The agent system is responsible for building the context window. Notebook doesn't manage context—it provides persistent, retrievable knowledge that agents can selectively include in their context.

**Optimized Notes:**
- Just the right size of information the agent needs
- Contains links (static or dynamic) to other notes for on-demand expansion
- Example: "For pagination details, see Page 42" (static link) or "For more on {topic}, search tags: api, error-handling" (dynamic link)

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

**V1.0 Scope (First Implementation - Book Metaphor):**
- Define and validate **simplified** schemas (Bullet: 6 fields)
- Implement Bullet Store (JSONL storage)
- Implement **Book metaphor** with pages, Table of Contents, and Index
  - Each bullet = one page (page number derived from bullet ID)
  - Auto-generated TOC (organized by sections)
  - Auto-generated Index (tag-based lookup)
  - Markdown output format (universal for all LLMs)
- Implement Notebook API as a **tool** for AI agents:
  - `getTableOfContents()` - return TOC + Index as markdown
  - `getPage(pageNum)` - return single page as markdown
  - `getPages(pageNums[])` - return multiple pages as markdown
  - `search(tags, sections?)` - return matching pages as markdown
  - `addNote(note)` - write new note, return page number
  - `updatePage(pageNum, updates)` - modify existing page
  - `deletePage(pageNum)` - remove page
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

**v1.0 (Book Metaphor):**
| Component | Description | Status |
|-----------|-------------|--------|
| **Bullet Store** | JSONL storage for notes (one note per line) | ⏳ Not started |
| **Page Manager** | Maps bullet IDs to page numbers (ctx-001 → Page 1) | ⏳ Not started |
| **TOC Generator** | Auto-generates Table of Contents from bullets (organized by sections) | ⏳ Not started |
| **Index Generator** | Auto-generates tag-based index for quick lookup | ⏳ Not started |
| **Markdown Formatter** | Formats pages, TOC, and index as markdown | ⏳ Not started |
| **Notebook API** | High-level tool interface for AI agents | ⏳ Not started |

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

### Data Model (Book Metaphor)

**Note Schema (v1.0 - Bullet = Page):**
```json
{
  "id": "ctx-001",
  "section": "strategies",
  "content": "Always validate user input before processing",
  "tags": ["validation", "security"],
  "created_at": "2025-10-17T10:00:00Z",
  "metadata": {}
}
```

**Field Descriptions:**
- `id` (required): Unique identifier (e.g., "ctx-001") → becomes page number (Page 1)
- `section` (required): Section name for TOC organization (strategies, examples, lessons-learned, etc.)
- `content` (required): The note content in markdown (supports code blocks, lists, etc.)
- `tags` (optional): Array of strings for Index generation and filtering
- `created_at` (optional): ISO 8601 timestamp
- `metadata` (optional): Escape hatch for future extensions (links, cross-references, etc.)

**Page Number Mapping:**
- `ctx-001` → Page 1
- `ctx-042` → Page 42
- `ctx-007` → Page 7
- ID numeric suffix becomes page number (stable, persistent)
- Gaps are normal (like torn-out pages in a real notebook)

**What's deferred to later versions:**
- ❌ Cross-reference links (`metadata.see_also`) → v1.1+
- ❌ Dynamic links (`metadata.related_query`) → v1.1+
- ❌ `source`, `first_seen`, `last_used` → add when reflection loop exists (v1.2+)
- ❌ `depends_on`, `conflicts_with`, `supersedes` → add with dependency resolution (v1.1+)
- ❌ `counters` (helpful/harmful) → add with reflection loop (v1.2+)

**Example v1.0 Output (Book Format):**

*When agent calls `notebook.getTableOfContents()`:*
```markdown
# My Notebook

## Table of Contents

### Strategies (Pages 1-5)
- Page 1: API Pagination Strategy
- Page 2: Input Validation Strategy
- Page 3: Error Handling Strategy

### Examples (Pages 6-10)
- Page 6: REST API Call Example
- Page 7: Pagination Implementation
- Page 8: Error Response Handling

### Lessons Learned (Pages 15-20)
- Page 15: Rate Limiting Backoff

## Index (Tags)
- api: Pages 1, 3, 6, 7, 15
- error-handling: Pages 3, 8, 15
- pagination: Pages 1, 7
- validation: Pages 2
```

*When agent calls `notebook.getPages([1, 7])`:*
```markdown
## Page 1: API Pagination Strategy

**Section:** strategies
**Tags:** #api #pagination

Always paginate APIs until empty page is returned. Never assume a fixed number of pages.

**See also:** Page 7 (example implementation)

---

## Page 7: Pagination Implementation

**Section:** examples
**Tags:** #api #pagination

\```javascript
async function fetchAllUsers() {
  let page = 1;
  let users = [];

  while (true) {
    const response = await fetch(`/api/users?page=${page}`);
    const data = await response.json();

    if (data.length === 0) break;

    users.push(...data);
    page++;
  }

  return users;
}
\```

**See also:** Page 1 (pagination strategy)
```

### Architecture Flow

**v1.0 (Book Metaphor):**
```
Agent wants context
      ↓
  1. Call notebook.getTableOfContents()
      ↓
  2. Agent reads TOC + Index (sees what's available)
      ↓
  3. Agent decides which pages to fetch
      ↓
  4. Call notebook.getPages([1, 7, 15]) or notebook.search(tags: ["pagination"])
      ↓
  5. Receive pages as markdown
      ↓
  6. Agent system assembles full context:
     - System prompt
     - User query
     - Tool definitions
     - Retrieved pages from notebook
      ↓
  7. Send to LLM

[Agent learns something new]
      ↓
  8. Call notebook.addNote({section, content, tags})
      ↓
  9. Returns page number (e.g., Page 42)
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

### Example Workflow (v1.0 - Book Metaphor)

**Scenario: Agent needs to implement API pagination**

1. **Agent** calls `notebook.getTableOfContents()`
   - Receives TOC with all sections and page ranges
   - Sees Index showing `pagination: Pages 1, 7`

2. **Agent** decides to fetch pagination-related pages
   - Calls `notebook.getPages([1, 7])`
   - Receives Page 1 (strategy) and Page 7 (example) as markdown

3. **Agent system** assembles LLM context:
   ```
   System Prompt: You are a coding assistant...
   User Query: Implement pagination for /api/users endpoint
   Tools: [read_file, write_file, bash]
   Context from Notebook:
     [Page 1 and Page 7 markdown content here]
   ```

4. **Agent** implements pagination successfully

5. **Agent** learns new insight: "When API returns 429, use exponential backoff"
   - Calls `notebook.addNote({
       section: "lessons-learned",
       content: "When API returns 429, implement exponential backoff...",
       tags: ["api", "error-handling", "rate-limiting"]
     })`
   - Returns `42` (new page number)

6. **Next session**: Agent can find this by:
   - Reading TOC → sees "Lessons Learned (Pages 15-42)"
   - Searching Index → sees `rate-limiting: Pages 42`
   - Calling `notebook.getPage(42)`

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

> **2025-10-17** — Yigal + Claude: **Clarified note-taking as core to ContextKit.** User confirmed that agent note-taking is not a future feature but fundamental to what ContextKit is. This reinforces that the v1.2+ ACE loop (reflection-curation) is the full vision, while v1.0 provides the infrastructure (storage, retrieval, formatting) that enables agents to build their notebooks.

> **2025-10-17** — Yigal + Claude: **Documented core problem statement.** Added comprehensive problem framing to both README.md and DEVELOPMENT.md. Key insight: "AI agents have amnesia" - they can't retain knowledge across sessions. ContextKit solves this by giving agents a persistent notebook where they can write, store, retrieve, and evolve their learned knowledge. This problem statement now clearly articulates why ContextKit exists and what pain points it addresses.

> **2025-10-17** — Yigal + Claude: **Clarified Notebook's role as a tool for agent systems.** Key insight: Notebook is a tool that agent systems integrate, not the context manager itself. Agent systems handle context window assembly (system prompt, user query, tools, conversation history). Notebook provides persistent storage and retrieval of optimized notes. This separation of concerns keeps Notebook simple and flexible, allowing it to work with any agent architecture.

> **2025-10-17** — Yigal + Claude: **Adopted book metaphor for v1.0 design.** Major architectural decision: Model notebook as a real book with Table of Contents, Index, and numbered pages. Each bullet becomes a page (page number derived from ID: ctx-001 → Page 1). All output is markdown (universal format for LLMs). API becomes tool-oriented: `getTableOfContents()`, `getPage(n)`, `getPages([...])`, `search(tags)`, `addNote()`. Benefits: (1) Universal format - all LLMs understand markdown, (2) Self-documenting - agent can browse TOC to see what's available, (3) Token-efficient - fetch TOC first, then only needed pages, (4) Natural navigation - page numbers + index + TOC give multiple entry points, (5) Intuitive metaphor - "turn to page 5" vs "fetch bullet ctx-005". This simplifies v1.0 significantly while providing excellent UX for agents. Removed Manifest schema (no longer needed).

> **2025-10-17** — Yigal + Claude: **Documented Memory vs Context Window vs Notebook terminology.** Added dedicated "Key Concepts & Terminology" section to clarify critical distinctions: (1) Memory = short-lived session state (ephemeral, hardware-limited, conversation history), (2) Context Window = actual input to LLM (assembled by agent system, token-limited, includes prompt + query + history + tools + notes), (3) Notebook = persistent storage tool (ContextKit's role, cross-session, provides optimized notes). Key insight: Agent systems build context windows; Notebook is a tool they call to retrieve notes. Also documented concept of "optimized notes" with static/dynamic links. This clarifies ContextKit's scope and prevents confusion about its role in agent architectures.

> **2025-10-17** — Yigal + Claude: **Completed Phase 1: Project Setup.** Successfully initialized npm package (contextkit v0.1.0), configured TypeScript with strict mode and ES2022 modules, set up directory structure (src/, tests/, examples/), chose **Zod** for schema validation (TypeScript-first, type inference, excellent DX), and chose **Vitest** for testing (ESM-native, fast, modern). Created initial file structure with placeholder components: types.ts (Note schema with Zod), store.ts (NoteStore), notebook.ts (main API), index.ts (exports). Updated package.json with build/test scripts. Updated BEST_PRACTICES.md with commands and tool documentation. Project is now ready for Phase 2 (Core Implementation). All decisions documented in CLAUDE.md.

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
