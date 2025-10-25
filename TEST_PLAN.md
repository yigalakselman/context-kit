# ContextKit v1.0 Test Plan

**Purpose:** Validate all new features after removing tags, adding full-text search, token estimates, and enhanced tool descriptions.

**Tester:** AI Agent with MCP access to ContextKit
**Environment:** Fresh ContextKit notebook instance
**Duration:** ~15-20 minutes

---

## Pre-Test Setup

**IMPORTANT:** Before starting tests, verify MCP connection:
1. Confirm you have access to these ContextKit tools:
   - `add_note`
   - `get_table_of_contents`
   - `get_page`
   - `get_pages`
   - `update_page`
   - `delete_page`

2. Read the tool descriptions - they should contain usage guidance like "When to use:", "Best practices:", etc.

---

## Test Suite 1: Enhanced Tool Descriptions

### Test 1.1: Verify Tool Description Content
**Objective:** Confirm tool descriptions include usage guidance

**Steps:**
1. Read the description for `add_note` tool
2. Check for these sections:
   - "When to use:"
   - "Best practices:"
   - Mentions of section naming conventions
   - Token count guidance (50-200 tokens ideal)

**Expected Result:** Tool description is comprehensive and includes guidance for agents

**Report Format:**
```
✅/❌ Test 1.1: Enhanced tool descriptions
- Has "When to use" section: ✅/❌
- Has "Best practices" section: ✅/❌
- Mentions section naming: ✅/❌
- Mentions token guidance: ✅/❌
```

---

## Test Suite 2: Tags Removed (Breaking Change)

### Test 2.1: Add Note Without Tags
**Objective:** Verify tags field is no longer accepted

**Steps:**
1. Call `get_table_of_contents` to see current state (should be empty)
2. Call `add_note` with only section and content (no tags parameter)
3. Verify note is created successfully

**Test Data:**
```
section: "test-suite-2"
content: "# Test Note\n\nThis note should not have tags."
```

**Expected Result:** Note created successfully, returns page number

**Report Format:**
```
✅/❌ Test 2.1: Add note without tags
- Page number returned: ✅/❌ (Page: ___)
```

### Test 2.2: Verify No Tag Field in Retrieved Page
**Objective:** Confirm pages don't display tag information

**Steps:**
1. Get the page you just created using `get_page`
2. Check the page content

**Expected Result:**
- Page contains "**Section:**" but NO "**Tags:**" line
- Content is displayed correctly

**Report Format:**
```
✅/❌ Test 2.2: No tag field in pages
- Has "**Section:**": ✅/❌
- NO "**Tags:**" line: ✅/❌
```

### Test 2.3: Verify No Index in TOC
**Objective:** Confirm Index (Tags) section is removed from TOC

**Steps:**
1. Call `get_table_of_contents`
2. Check the output

**Expected Result:**
- Contains "# My Notebook"
- Contains "## Table of Contents"
- Does NOT contain "## Index (Tags)"
- Does NOT contain any tag listings

**Report Format:**
```
✅/❌ Test 2.3: No Index in TOC
- Has TOC header: ✅/❌
- NO "## Index (Tags)": ✅/❌
- NO tag listings: ✅/❌
```

---

## Test Suite 3: Token Size Estimates

### Test 3.1: Add Multiple Notes for Token Testing
**Objective:** Create notes of varying sizes

**Steps:**
Add these 3 notes:

**Note 1 (Small):**
```
section: "token-test"
content: "Short note"
```

**Note 2 (Medium):**
```
section: "token-test"
content: "# Medium Note\n\nThis note has more content to test token estimation. It includes multiple sentences and should have a higher token count than the short note. Let's add even more text to make it substantial."
```

**Note 3 (Large):**
```
section: "token-test"
content: "# Large Note\n\n## Introduction\n\nThis is a comprehensive note with multiple sections, code examples, and detailed explanations.\n\n## Code Example\n\n```typescript\nfunction example() {\n  return 'This adds to the token count';\n}\n```\n\n## Conclusion\n\nLarge notes help test token estimation accuracy. The more content we add, the higher the token count should be. This note intentionally has a lot of text to demonstrate token counting at scale."
```

**Expected Result:** All 3 notes created, return page numbers

**Report Format:**
```
✅/❌ Test 3.1: Create notes for token testing
- Note 1 created: ✅/❌ (Page: ___)
- Note 2 created: ✅/❌ (Page: ___)
- Note 3 created: ✅/❌ (Page: ___)
```

### Test 3.2: Verify Token Counts in TOC
**Objective:** Confirm TOC shows token estimates per section and total

**Steps:**
1. Call `get_table_of_contents`
2. Look for token information

**Expected Result:**
- Each section shows format: "### Section Name (Pages X-Y) - ~NNN tokens"
- Bottom shows: "**Total:** X pages, ~NNN tokens"
- Token counts are reasonable (not 0, not absurdly high)

**Report Format:**
```
✅/❌ Test 3.2: Token counts in TOC
- Sections show "~NNN tokens": ✅/❌
- Total line shows "~NNN tokens": ✅/❌
- Token counts look reasonable: ✅/❌
- Example section token count: ___
- Total token count: ___
```

---

## Test Suite 4: Core Functionality (Regression Tests)

### Test 4.1: Update Page
**Objective:** Verify update still works

**Steps:**
1. Pick any page created earlier (note the page number)
2. Call `update_page` with new content:
```
pageNumber: <page from step 1>
content: "# Updated Content\n\nThis note was updated during testing."
section: "updated-section"
```
3. Retrieve the page with `get_page`

**Expected Result:**
- Update succeeds
- Retrieved page shows new content
- Section changed to "updated-section"

**Report Format:**
```
✅/❌ Test 4.1: Update page
- Update successful: ✅/❌
- Content updated: ✅/❌
- Section updated: ✅/❌
```

### Test 4.2: Delete Page
**Objective:** Verify deletion works

**Steps:**
1. Pick a test page to delete
2. Call `delete_page` with the page number
3. Try to retrieve the deleted page with `get_page`

**Expected Result:**
- Delete succeeds
- Attempting to get deleted page returns error

**Report Format:**
```
✅/❌ Test 4.2: Delete page
- Delete successful: ✅/❌
- Get deleted page returns error: ✅/❌
```

### Test 4.3: Get Multiple Pages
**Objective:** Test batch retrieval

**Steps:**
1. Create 3 new notes (any content)
2. Note their page numbers: [X, Y, Z]
3. Call `get_pages` with array: [X, Y, Z]

**Expected Result:**
- Returns all 3 pages
- Separated by "---" dividers
- Pages in correct order

**Report Format:**
```
✅/❌ Test 4.3: Get multiple pages
- All 3 pages returned: ✅/❌
- Has separator "---": ✅/❌
- Pages in order: ✅/❌
```

---

## Test Suite 5: Edge Cases

### Test 5.1: Empty Notebook TOC
**Objective:** Verify TOC handles empty notebook gracefully

**NOTE:** This test requires starting with a fresh/empty notebook. Skip if not possible.

**Steps:**
1. Call `get_table_of_contents` on empty notebook

**Expected Result:**
- Returns: "# My Notebook\n\n_Empty notebook - no notes yet_"
- Does NOT crash or error

**Report Format:**
```
✅/❌/⏭️ Test 5.1: Empty notebook TOC (skipped if not feasible)
- Shows empty message: ✅/❌/⏭️
- No crash: ✅/❌/⏭️
```

---

## Final Report Template

After completing all tests, provide a summary:

```markdown
# ContextKit v1.0 Test Results

**Test Date:** <timestamp>
**Tester:** <agent name>
**Total Tests:** <number>
**Passed:** <number>
**Failed:** <number>
**Skipped:** <number>

## Summary by Test Suite

1. Enhanced Tool Descriptions: <passed>/<total>
2. Tags Removed: <passed>/<total>
3. Token Size Estimates: <passed>/<total>
4. Core Functionality: <passed>/<total>
5. Edge Cases: <passed>/<total>

## Failed Tests (if any)

<list failed tests with details>

## Notable Observations

<any unexpected behavior, performance issues, or suggestions>

## Recommendation

✅ PASS - Ready for release
❌ FAIL - Issues need resolution
⚠️ PASS WITH NOTES - Works but has minor issues
```

---

## Success Criteria

**v1.0 is ready for release if:**
- ✅ All Tool Description tests pass (Suite 1)
- ✅ All Tags Removed tests pass (Suite 2)
- ✅ Token estimates appear correctly (Suite 3)
- ✅ Core functionality intact (Suite 4)
- ✅ No critical failures in edge cases (Suite 5)

**Total acceptable failures: 0-2 non-critical tests**

---

**Good luck with testing! 🧪**
