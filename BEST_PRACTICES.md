# ContextKit - Development Best Practices

This file contains stable coding guidelines, commands, and practices. Load this when actively writing code.

---

## Code Style

### TypeScript
- Use **ES modules** (import/export), not CommonJS (require)
- Use **explicit types** for all public APIs and function signatures
- Prefer **interfaces** for object shapes, **types** for unions/intersections
- Use **strict mode** (enable all strict TypeScript checks)

### Naming Conventions
- **Classes/Interfaces**: PascalCase (e.g., `BulletStore`, `Manifest`)
- **Functions/Variables**: camelCase (e.g., `formatMarkdown`, `bulletId`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_BULLETS`, `DEFAULT_SECTION`)
- **Files**: lowercase with hyphens (e.g., `bullet-store.ts`, `retriever.ts`)

### Functions
- Keep functions small and focused (single responsibility)
- Use descriptive names that indicate what the function does
- Prefer pure functions when possible
- Document complex logic with comments

### Error Handling
- Throw errors for invalid input (fail fast)
- Use custom error classes when appropriate
- Always validate input at API boundaries
- Provide clear error messages with context

---

## Project Structure

```
/
├── src/
│   ├── types.ts          # Bullet and Manifest type definitions
│   ├── store.ts          # BulletStore class (JSONL CRUD)
│   ├── retriever.ts      # Retriever class (filter bullets)
│   ├── formatter.ts      # Formatter class (Markdown assembly)
│   ├── index.ts          # Main API exports
│   └── utils/            # Utility functions
├── tests/
│   ├── store.test.ts     # BulletStore tests
│   ├── retriever.test.ts # Retriever tests
│   └── formatter.test.ts # Formatter tests
├── examples/
│   └── basic-usage.ts    # Example usage
└── data/                 # Example JSONL files (gitignored)
```

---

## Commands

### Build
```bash
npm run build         # Compile TypeScript to dist/
npm run typecheck     # Run TypeScript type checking (without emitting files)
npm run clean         # Remove dist/ directory
```

### Test
```bash
npm test              # Run all tests (Vitest)
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Development
```bash
# Install dependencies
npm install

# Build and typecheck
npm run build
npm run typecheck

# Run tests
npm test
```

---

## Tools & Libraries

### Schema Validation: Zod
- **Why:** TypeScript-first design, excellent DX, runtime validation + type inference
- **Usage:** Define schemas with `z.object()`, infer types with `z.infer<typeof Schema>`
- **Example:**
```typescript
import { z } from 'zod';

export const NoteSchema = z.object({
  id: z.string().min(1),
  section: z.string().min(1),
  content: z.string().min(1),
});

export type Note = z.infer<typeof NoteSchema>;
```

### Testing: Vitest
- **Why:** ESM-native, fast, modern, similar API to Jest
- **Usage:** Write tests with `describe()`, `it()`, `expect()`
- **Example:**
```typescript
import { describe, it, expect } from 'vitest';

describe('NoteStore', () => {
  it('should store and retrieve notes', () => {
    // Test implementation
  });
});
```

---

## Testing Guidelines

### General Principles
- Write tests alongside implementation (not after)
- Use descriptive test names: `should return filtered bullets when tags match`
- Follow AAA pattern: Arrange, Act, Assert
- Test edge cases and error conditions
- Keep tests independent (no shared state)

### Test Organization
```typescript
describe('BulletStore', () => {
  describe('add()', () => {
    it('should append bullet to JSONL file', () => {
      // Test implementation
    });

    it('should throw error when bullet is invalid', () => {
      // Test implementation
    });
  });
});
```

### What to Test
- ✅ Public API behavior
- ✅ Edge cases (empty arrays, null values, etc.)
- ✅ Error conditions
- ✅ Input validation
- ❌ Implementation details
- ❌ Third-party library behavior

---

## JSONL Format

One JSON object per line, newline-delimited:

```jsonl
{"id":"ctx-001","section":"strategies","content":"Always validate input","tags":["validation"]}
{"id":"ctx-002","section":"examples","content":"Use pagination for large datasets","tags":["api"]}
```

**Reading:**
- Read file line by line
- Parse each line as JSON
- Filter/transform as needed

**Writing:**
- Serialize object to JSON
- Append newline character
- Append to file

---

## IMPORTANT: v1.0 Scope Constraints

**DO NOT implement:**
- ❌ Semantic search / embeddings (v1.1+)
- ❌ Dependency resolution (`depends_on`, `conflicts_with`) (v1.1+)
- ❌ Sequence assembly (v1.1+)
- ❌ Reflection-curation loop (v1.2+)
- ❌ Counters (helpful/harmful) (v1.2+)
- ❌ Complex ranking algorithms (v1.1+)

**DO implement (v1.0):**
- ✅ Basic CRUD for bullets (add, list, get, update, delete)
- ✅ Simple filtering (by section, by tags)
- ✅ Markdown formatting (sections with bullet lists)
- ✅ Schema validation (validate Bullet and Manifest)
- ✅ File I/O (read/write JSONL)

**When in doubt:** Keep it simple. Defer complexity to future versions.

---

## Git Workflow

### Commit Messages
- Use present tense: "Add feature" not "Added feature"
- Be descriptive but concise
- Include context and rationale when needed
- No emoji or decorations

### Commits
- Commit frequently with logical groupings
- Each commit should be a cohesive unit of work
- Review changes before committing (`git diff`)

---

**Last Updated:** 2025-10-13
