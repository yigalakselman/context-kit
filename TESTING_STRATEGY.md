# ContextKit Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for ContextKit v1.0, covering three distinct testing phases as part of Phase 3 (Testing & Polish).

**Testing Goals:**
1. Verify all MCP tools work correctly when called by AI agents
2. Ensure the programmatic API works for library consumers
3. Validate the npm package is ready for publication

---

## Phase 1: Unit & Integration Testing (✅ COMPLETED)

**Framework:** Vitest
**Status:** 48 tests passing
**Coverage:** Core components

### What Was Tested

1. **NoteStore** - JSONL CRUD operations
   - Writing notes to JSONL format
   - Reading notes from JSONL
   - Updating existing notes
   - Deleting notes (soft delete)
   - ID generation (ctx-001, ctx-002, etc.)

2. **Formatters** - Markdown generation
   - Page formatting (title extraction, metadata display)
   - Table of Contents generation (sections, alphabetical)
   - Index generation (tags → page numbers)
   - Edge cases (empty notebooks, missing tags)

3. **Notebook API** - High-level operations
   - addNote() - create new notes, return page numbers
   - getTableOfContents() - generate TOC + Index markdown
   - getPage() / getPages() - retrieve specific pages
   - search() - query by tags and/or sections
   - updatePage() - modify existing pages
   - deletePage() - remove pages

### How to Run

```bash
npm test          # Run all unit tests
npm test -- --ui  # Run with Vitest UI
npm run coverage  # Generate coverage report (if configured)
```

---

## Phase 2: MCP Tools Testing (✅ COMPLETED)

**Method:** Direct MCP tool invocation via Claude Code
**Status:** All 7 tools verified working
**Test Date:** 2025-10-19

### What Was Tested

#### 1. Initial State Check
- **Tool:** `get_table_of_contents`
- **Test:** Verify empty notebook returns proper empty state message
- **Result:** ✅ Returns "Empty notebook - no notes yet"

#### 2. Adding Notes
- **Tool:** `add_note`
- **Tests:**
  - Add note to "strategies" section with 3 tags
  - Add note to "examples" section with code content
  - Add note to "lessons-learned" section
- **Results:** ✅ All notes added successfully (Pages 1, 2, 3 returned)

#### 3. Table of Contents Generation
- **Tool:** `get_table_of_contents`
- **Test:** Verify TOC organizes by section, Index organizes by tags
- **Result:** ✅ Proper sections (alphabetical), complete tag index

#### 4. Single Page Retrieval
- **Tool:** `get_page`
- **Test:** Retrieve Page 1
- **Result:** ✅ Formatted markdown with section, tags, and content

#### 5. Multi-Page Retrieval
- **Tool:** `get_pages`
- **Test:** Retrieve Pages 2 and 3 in one call
- **Result:** ✅ Both pages returned with separator (`---`)

#### 6. Search by Tags
- **Tool:** `search_notes`
- **Tests:**
  - Search for tag "testing" → found Page 3
  - Search for tag "react" + "javascript" → found Page 2
- **Result:** ✅ Correct pages returned

#### 7. Search by Section
- **Tool:** `search_notes`
- **Test:** Search section "strategies"
- **Result:** ✅ Found Page 1

#### 8. Combined Search
- **Tool:** `search_notes`
- **Test:** Search tags ["react", "javascript"] + section "examples"
- **Result:** ✅ Found Page 2 (matches both criteria)

#### 9. Update Page
- **Tool:** `update_page`
- **Test:** Update Page 1 content and add "caching" tag
- **Result:** ✅ Page updated, new tag appears in index

#### 10. Delete Page
- **Tool:** `delete_page`
- **Test:** Delete Page 2
- **Result:** ✅ Page removed from TOC and index

#### 11. Storage Verification
- **Location:** `~/.contextkit/notebook.jsonl`
- **Test:** Verify JSONL file structure and content
- **Result:** ✅ Proper format, updated ctx-001, deleted ctx-002, preserved ctx-003

### Key Findings

- ✅ All CRUD operations working correctly
- ✅ Page numbering (ctx-001 → Page 1) accurate
- ✅ Section organization alphabetical and correct
- ✅ Tag indexing complete and accurate
- ✅ Markdown formatting clean and readable
- ✅ Multi-criteria search (AND logic) works as expected
- ✅ JSONL persistence and file management working

### MCP Server Configuration

The MCP server is ready for Claude Desktop integration:
- **Command:** `npx contextkit-mcp` (or global: `contextkit-mcp`)
- **Transport:** stdio
- **Config Location:** `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
- **Documentation:** See MCP_SETUP.md

---

## Phase 3: Library API Testing (⏳ PENDING)

**Method:** Run example scripts and edge-case tests
**Goal:** Verify programmatic API works for library consumers

### Test Plan

#### 1. Basic Usage Example
**Script:** `examples/basic-usage.ts`
**How to Run:**
```bash
node dist/examples/basic-usage.js
```

**What It Tests:**
- Creating a Notebook instance
- Adding multiple notes programmatically
- Retrieving pages and TOC
- Search functionality
- Basic error handling

**Expected Output:**
- Console logs showing successful operations
- No errors or exceptions
- Clean exit (code 0)

#### 2. Edge Case Testing

Create a new test script: `examples/edge-cases.ts`

**Tests to Include:**

1. **Empty Notebook Operations**
   - Get TOC from empty notebook
   - Try to get page 1 when none exists (should return null or error)
   - Search in empty notebook (should return empty array)

2. **Boundary Cases**
   - Add note without tags (tags = [])
   - Add note with empty content
   - Get page with invalid number (0, negative, very large)
   - Get pages with empty array ([])

3. **Invalid Operations**
   - Update non-existent page number
   - Delete non-existent page number
   - Search with no criteria (no tags, no section)

4. **Data Integrity**
   - Add 100 notes, verify all page numbers are sequential
   - Delete middle page, verify page numbers remain stable
   - Update page, verify only that page changed

**Expected Behaviors:**
- Graceful error messages (not crashes)
- Null/empty returns for missing data
- Consistent page numbering after deletions
- No data corruption in JSONL file

#### 3. Concurrent Operations (Optional)

Test if multiple operations can be safely queued:
```typescript
const notebook = new Notebook();
await Promise.all([
  notebook.addNote({...}),
  notebook.addNote({...}),
  notebook.addNote({...})
]);
```

**Goal:** Ensure no race conditions or data loss

### Success Criteria

- ✅ `basic-usage.ts` runs without errors
- ✅ All edge cases handled gracefully
- ✅ No unhandled exceptions or crashes
- ✅ Consistent behavior with MCP tool testing
- ✅ Clear error messages for invalid inputs

---

## Phase 4: Package Testing (⏳ PENDING)

**Method:** npm pack, tarball inspection, local installation
**Goal:** Ensure package is ready for npm publish

### Test Plan

#### 1. Package Creation
```bash
npm pack
```

**Generates:** `contextkit-0.1.0.tgz`

#### 2. Tarball Inspection

Extract and inspect contents:
```bash
tar -tzf contextkit-0.1.0.tgz
```

**Verify Includes:**
- ✅ `package/` directory
- ✅ `package/dist/` (compiled JavaScript)
- ✅ `package/dist/mcp-server.js` (MCP server entry point)
- ✅ `package/package.json`
- ✅ `package/README.md`
- ✅ `package/LICENSE` (if exists)
- ✅ `package/MCP_SETUP.md` (MCP documentation)

**Verify Excludes:**
- ❌ `package/src/` (TypeScript source - should not be in tarball)
- ❌ `package/tests/` (test files)
- ❌ `package/node_modules/`
- ❌ `package/.git/`
- ❌ `package/tsconfig.json`
- ❌ `package/vitest.config.ts`

**Note:** Use `.npmignore` or `files` field in package.json to control what gets published.

#### 3. Local Installation Test

Install globally from tarball:
```bash
npm install -g ./contextkit-0.1.0.tgz
```

**Verify:**
- ✅ Installation completes without errors
- ✅ `contextkit-mcp` command is available globally
- ✅ Running `which contextkit-mcp` shows correct path
- ✅ Command starts without errors (may need to Ctrl+C to exit stdio mode)

**Test Command:**
```bash
contextkit-mcp
# Should start MCP server (wait for stdin)
# Press Ctrl+C to exit
```

#### 4. Metadata Validation

Review `package.json` for completeness:

```json
{
  "name": "contextkit",
  "version": "0.1.0",  // Bump to 1.0.0 when ready
  "description": "...", // Should be clear and concise
  "keywords": [...],    // Should include: notebook, mcp, ai, agents, context
  "license": "...",     // Choose appropriate license
  "author": "...",
  "repository": {...},  // GitHub repo URL
  "bugs": {...},        // Issues URL
  "homepage": "...",    // README or docs URL
  "bin": {
    "contextkit-mcp": "./dist/mcp-server.js"
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {...},     // Modern module exports
  "engines": {
    "node": ">=18.0.0"  // Specify minimum Node version
  }
}
```

**Check:**
- ✅ All URLs are correct
- ✅ Version follows semver
- ✅ Dependencies are correctly listed (not devDependencies)
- ✅ Bin path points to correct file
- ✅ Main and types fields point to correct entry points

#### 5. Dependency Check

```bash
npm ls --all
```

**Verify:**
- ✅ No extraneous packages
- ✅ No security vulnerabilities (`npm audit`)
- ✅ Dependencies are production-ready versions (not pre-release)

#### 6. Cleanup Test

Uninstall and verify cleanup:
```bash
npm uninstall -g contextkit
which contextkit-mcp  # Should return nothing
```

### Success Criteria

- ✅ Tarball contains only necessary files
- ✅ Global installation works
- ✅ `contextkit-mcp` command available and functional
- ✅ package.json metadata complete and accurate
- ✅ No security vulnerabilities
- ✅ Clean uninstallation

---

## Testing Checklist

Use this checklist to track progress:

### Unit & Integration Tests
- [x] All tests passing (48/48)
- [x] No skipped or pending tests
- [x] Coverage meets expectations

### MCP Tools Tests
- [x] get_table_of_contents verified
- [x] add_note verified
- [x] get_page verified
- [x] get_pages verified
- [x] search_notes verified (tags, sections, combined)
- [x] update_page verified
- [x] delete_page verified
- [x] Storage file verified (~/.contextkit/notebook.jsonl)

### Library API Tests
- [ ] basic-usage.ts runs successfully
- [ ] Edge case script created and tested
- [ ] Error handling verified
- [ ] Concurrent operations tested (optional)

### Package Tests
- [ ] npm pack executed
- [ ] Tarball contents inspected
- [ ] Correct files included
- [ ] Unnecessary files excluded
- [ ] Global installation tested
- [ ] contextkit-mcp command verified
- [ ] package.json metadata validated
- [ ] Dependencies checked
- [ ] npm audit passed

---

## Tools & Commands Reference

### Testing Commands
```bash
# Unit tests
npm test
npm test -- --ui
npm test -- --coverage

# Build
npm run build

# Library API tests
node dist/examples/basic-usage.js
node dist/examples/edge-cases.js  # Create this

# Package tests
npm pack
tar -tzf contextkit-0.1.0.tgz
npm install -g ./contextkit-0.1.0.tgz
which contextkit-mcp
contextkit-mcp  # Test MCP server starts
npm uninstall -g contextkit
npm audit
```

### MCP Testing (via Claude Code)
```typescript
// Already integrated - use MCP tools directly:
// mcp__contextkit__add_note
// mcp__contextkit__get_table_of_contents
// mcp__contextkit__get_page
// mcp__contextkit__get_pages
// mcp__contextkit__search_notes
// mcp__contextkit__update_page
// mcp__contextkit__delete_page
```

---

## Next Steps After Testing

Once all three phases are complete:

1. **Documentation Review**
   - Verify all code examples in docs are correct
   - Ensure paths reference dist/ correctly
   - Add troubleshooting section for common issues
   - Update README with installation and usage

2. **Final Polish**
   - Fix any issues found during testing
   - Improve error messages if needed
   - Update version to 1.0.0 in package.json
   - Create git tag: `v1.0.0`

3. **Release Preparation**
   - Write CHANGELOG.md
   - Prepare npm publish command
   - Consider dry-run: `npm publish --dry-run`

---

**Last Updated:** 2025-10-19
**Current Phase:** Phase 3 - Library API & Package Testing
**Status:** MCP Testing Complete ✅
