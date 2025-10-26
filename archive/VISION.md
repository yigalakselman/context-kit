# Context Engineering Playbook (Anthropic × ACE)

> **Note:** This document describes the **full vision** for ContextKit with ACE-style reflection and curation (v1.2+). It is **not the current implementation scope**. See **CLAUDE.md** for the v1.0 implementation plan (simplified schemas, basic CRUD, no reflection/curation loop yet).

*A one‑page cheat sheet + repo‑ready starter kit for curating, retrieving, and evolving context for LLM agents.*

---

## v1.0 Features (Released)

### Core Notebook System
- Simple, focused notebook with book metaphor (pages, TOC)
- JSONL storage with basic CRUD operations
- 7 MCP tools for AI agent integration
- Full-text search (query parameter) and section-based search
- Token size estimates for context planning
- Enhanced tool descriptions for zero-config agent onboarding

---

## v1.1 Features (Planned)

### Starter Notebook (Self-Teaching System) - DEFERRED TO v1.1

**Concept:** Ship with built-in best practices notebook - ContextKit demonstrates its own value by documenting how to use itself!

**Starter notes to include:**

1. **Section: "getting-started"**
   - How to organize notes with descriptive section names
   - When to create a new note vs update an existing one
   - Using the Table of Contents to navigate knowledge
   - Search strategies: keywords vs sections vs combined queries

2. **Section: "best-practices"**
   - Keep notes focused and atomic (one concept per note)
   - Use descriptive titles that extract well from content
   - Use descriptive section names for better organization
   - Update notes rather than creating duplicates
   - When to use different sections (strategies, examples, lessons-learned, etc.)

3. **Section: "examples"**
   - Example: Well-structured strategy note
   - Example: Code snippet with context
   - Example: Lesson-learned from debugging
   - Example: API usage pattern

4. **Section: "meta"**
   - About this notebook system
   - The book metaphor explained (pages, TOC)
   - How notes are stored (JSONL format)
   - MCP tools overview

**Implementation:**
- Include `examples/starter-notebook.jsonl` in package
- Documentation shows how to explore the starter notebook
- Users can delete/modify starter notes or keep them as reference
- Makes ContextKit self-teaching - learn by exploring!

**Benefits:**
- New users understand the system immediately
- Demonstrates the tool's value from first use
- Shows real-world note organization
- Reduces onboarding friction

**Why deferred to v1.1:**
- v1.0 already includes comprehensive tool descriptions (zero-config onboarding)
- README.md provides extensive documentation and examples
- Can gather user feedback on what examples would be most helpful
- Allows focus on core functionality and distribution for v1.0

### Note-Level Templates & Best Practice Patterns

**Concept:** Provide reusable note templates for common knowledge patterns - agents learn structure by example, not enforcement.

**Core idea:**
- Templates are just regular notes in a `template-examples` section
- Agents discover templates via TOC
- No validation/enforcement - flexible guidance, not rigid structure
- Domain-agnostic patterns work across use cases

**Template patterns to include:**

1. **Decision Log Template**
   - Context → Decision → Rationale → Alternatives → Consequences
   - Section: `decision-log`
   - Use: Track important decisions and their reasoning

2. **Skill/Procedure Template**
   - Purpose → Prerequisites → Ordered Steps → Success Criteria → Pitfalls
   - Section: `skills` or `procedures`
   - Use: Document repeatable workflows and ordered sequences

3. **Troubleshooting Template**
   - Symptoms → Investigation → Root Cause → Solution → Prevention
   - Section: `troubleshooting` or `lessons-learned`
   - Use: Build knowledge base of past issues and fixes

4. **User Preference Template**
   - Preference → Context → Examples (good/bad)
   - Section: `user-preferences`
   - Use: Capture user preferences with clear examples

**Benefits:**
- Consistency - similar types of knowledge use similar structure
- Completeness - templates prompt for important information
- Discoverability - agents learn what to capture through examples
- Customizable - users can add domain-specific templates
- No overhead - templates are just notes, no new infrastructure

**Implementation approach:**
- Add `template-examples` section to Starter Notebook
- Include 4-6 common template patterns with examples
- Update tool descriptions to mention template availability
- Users can extend with custom domain templates

**Design principles:**
- Learn by example, not enforcement
- Note-level structure, not notebook-level constraints
- Flexibility over rigidity
- Domain-agnostic but customizable for specific domains

---

## 1) Core Principles

* **Small, structured system prompt.** Split into *Role*, *Rules*, *Tools*, *Output Contract*.
* **Token‑efficient tools.** Narrow scope, compact outputs, optional `verbosity`.
* **Just‑in‑time retrieval.** Fetch only what’s needed; don’t preload everything.
* **Compaction policy.** Keep goals/decisions/open issues; drop transient chatter.
* **External memory (playbook).** Durable, structured nuggets with metadata.

---

## 2) Evolving Playbook (ACE‑style)

**Never rewrite monolithically.** Grow via **delta bullets**; periodically **refine/dedupe**.

**Three roles**

* **Generator:** Solves task, logs which bullets were used.
* **Reflector:** Diagnoses errors/successes → extracts actionable lessons.
* **Curator:** Adds *only new* bullets, tags/merges/dupes; updates counters.

**When to add bullets**

* New strategy, failure mode, API schema clarification, or checklist item.
* Evidence: execution feedback, unit tests, ground truth (if available), or human review.

---

## 3) Retrieval Policy (Simple + Effective)

* Rank candidates by **(helpful − harmful)** → **semantic match** → **recency**.
* Hard caps per call: **Top 12 bullets** + **Top 1 checklist** + **≤1 schema block**.
* Always include **format/schema snippets** when tools/APIs are involved.

---

## 4) Guardrails

* **No full rewrites.** Only localized delta updates.
* **Quarantine harmful items.** If `harmful ≥ 2`, auto‑suppress pending review.
* **Source‑of‑truth rules.** E.g., resolve identities from *Contacts* API, not free text.
* **Pagination checklist.** Loop until exhaustion; never fixed‑range pagination.

---

## 5) Tiny KPIs to Track

* **Tokens/decision** (keep low while accuracy stays high).
* **Useful‑bullet hit rate** (bullets cited that Reflector marks helpful).
* **Regression alarms** (harmful counters spike after new deltas).
* **Adaptation latency & $** vs baseline.

---

## 6) Data Model (JSON Schema)

Use JSONL for bullets + a manifest for playbook metadata.

### 6.1 Bullet (one nugget)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "PlaybookBullet",
  "type": "object",
  "required": ["id", "section", "content", "counters", "first_seen"],
  "properties": {
    "id": {"type": "string", "description": "Unique bullet id, e.g., ctx-00123"},
    "section": {"type": "string", "enum": ["strategies", "apis", "checklists", "examples", "gotchas" ]},
    "content": {"type": "string", "minLength": 1},
    "tags": {"type": "array", "items": {"type": "string"}},
    "source": {"type": "string", "enum": ["reflection", "incident", "human", "import"]},
    "first_seen": {"type": "string", "format": "date"},
    "last_used": {"type": ["string", "null"], "format": "date"},
    "counters": {
      "type": "object",
      "required": ["helpful", "harmful", "neutral"],
      "properties": {
        "helpful": {"type": "integer", "minimum": 0},
        "harmful": {"type": "integer", "minimum": 0},
        "neutral": {"type": "integer", "minimum": 0}
      }
    },
    "evidence": {"type": "array", "items": {"type": "string", "description": "Trace ids, test names, links"}}
  }
}
```

### 6.2 Playbook Manifest

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "PlaybookManifest",
  "type": "object",
  "required": ["name", "version", "policies", "limits"],
  "properties": {
    "name": {"type": "string"},
    "version": {"type": "string"},
    "policies": {
      "type": "object",
      "properties": {
        "retrieval_caps": {
          "type": "object",
          "properties": {
            "max_bullets": {"type": "integer", "default": 12},
            "max_checklists": {"type": "integer", "default": 1},
            "max_schema_blocks": {"type": "integer", "default": 1}
          }
        },
        "quarantine_threshold": {"type": "integer", "default": 2},
        "dedupe": {"type": "string", "enum": ["semantic", "lexical", "hybrid"], "default": "semantic"}
      }
    },
    "limits": {
      "type": "object",
      "properties": {
        "per_call_token_budget": {"type": "integer"},
        "per_session_summarization_every_n_turns": {"type": "integer"}
      }
    }
  }
}
```

---

## 7) Ranking & Dedupe (Pseudo‑code)

```python
# inputs: bullets, query_embedding, now
candidates = [b for b in bullets if not quarantined(b)]
for b in candidates:
    b.score = 2*b.counters.helpful - 3*b.counters.harmful
    b.score += cosine(b.embedding, query_embedding) * 2.0
    b.score += recency_boost(b.last_used, now)
# semantic dedupe (keep highest score among near‑duplicates)
selected = []
for b in sorted(candidates, key=lambda x: x.score, reverse=True):
    if all(cosine(b.embedding, s.embedding) < 0.9 for s in selected):
        selected.append(b)
return cap(selected, bullets=12, checklists=1, schemas=1)
```

---

## 8) Prompts (drop‑in scaffolds)

### 8.1 Generator (uses playbook)

```
SYSTEM
You are an AI agent. Follow the Output Contract. Use the Playbook below selectively.

[ROLE]
• Complete the user task via tools and structured reasoning.

[TOOLS]
• Call tools with minimal inputs; request `verbosity: "summary"` unless detail is needed.

[PLAYBOOK]
{{PLAYBOOK_TOP_K}}

[OUTPUT CONTRACT]
• Return final answer first, then bullet list of steps; include any schemas used.
```

### 8.2 Reflector (diagnostics → lessons)

```
SYSTEM
You critique the last run and extract actionable lessons.

INPUTS
• Trace (reasoning + tool IO)
• Outcome (tests/feedback/GT if available)
• Bullets used (ids)

TASKS
1) Identify specific error patterns (pagination, schema mismatch, wrong source‑of‑truth, etc.).
2) For each, write a one‑sentence, reusable lesson.
3) Tag used bullets as helpful/harmful/neutral.
4) Propose NEW bullets only if not already covered.

OUTPUT (JSON)
{
  "lessons": ["Always paginate until empty page is returned."],
  "bullet_tags": [{"id":"ctx-00123","tag":"helpful"}],
  "new_bullets": [
    {"section":"checklists","content":"Before identity matching, fetch contacts from authoritative API."}
  ]
}
```

### 8.3 Curator (delta updates only)

```
SYSTEM
You update the playbook incrementally. Do NOT rewrite existing content.

INPUTS
• Current playbook bullets
• Reflector output (lessons, bullet_tags, new_bullets)

TASKS
• Append new bullets (assign ids, add metadata).
• Increment counters per tags.
• Dedupe (semantic ≥ 0.9 → keep highest‑quality one).

OUTPUT (JSON)
{ "ops": [
  {"type":"ADD","section":"checklists","content":"Loop until pagination returns no results."},
  {"type":"TAG","id":"ctx-00077","delta":{"helpful":+1}}
]}
```

---

## 9) Checklists (ready to paste)

**Execution**

* [ ] Authenticate before calling app APIs
* [ ] Confirm source‑of‑truth per field (identity, balances, dates)
* [ ] Paginate until empty / null token
* [ ] Validate output schema/units before submit

**Compaction**

* [ ] Keep decisions/goals/open issues
* [ ] Remove raw logs unless likely reused
* [ ] Refresh session summary every N turns

---

## 10) File Layout (suggested)

```
/playbook
  bullets.jsonl        # one JSON per line (see schema)
  manifest.json        # retrieval caps, dedupe policy, quotas
  embeddings/          # optional cached vector index
/prompts
  generator.txt
  reflector.txt
  curator.txt
/policies
  compaction.md
  sourcing.md
```

---

### Quick Start

1. Create `playbook/bullets.jsonl` with 3–5 high‑value bullets (strategies, schema, checklist).
2. Drop the three prompts into `/prompts`.
3. Implement retrieval (rank + dedupe) and caps.
4. After each run, call Reflector → Curator to append deltas.
5. Monitor KPIs; quarantine harmful items automatically.
