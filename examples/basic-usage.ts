/**
 * Basic usage example for ContextKit Notebook
 *
 * Demonstrates:
 * - Creating a notebook
 * - Adding notes
 * - Retrieving Table of Contents
 * - Fetching pages
 * - Searching by tags
 * - Updating and deleting pages
 */

import { Notebook } from '../src/index.js';
import { join } from 'node:path';

async function main() {
  // Create a notebook (stored in ./data/my-notebook.jsonl)
  const notebook = new Notebook(join(process.cwd(), 'data', 'my-notebook.jsonl'));

  console.log('=== ContextKit Example: AI Agent Notebook ===\n');

  // Add some notes
  console.log('📝 Adding notes to the notebook...\n');

  const page1 = await notebook.addNote({
    section: 'strategies',
    content: `# API Pagination Strategy

Always paginate APIs until empty page is returned. Never assume a fixed number of pages.

**Key points:**
1. Start with page=1
2. Loop until response is empty or has 0 items
3. Increment page counter each iteration
4. Handle rate limiting (429 responses)`,
    tags: ['api', 'pagination', 'best-practices'],
  });

  console.log(`✅ Added Page ${page1}: API Pagination Strategy`);

  const page2 = await notebook.addNote({
    section: 'examples',
    content: `# Pagination Implementation Example

\`\`\`typescript
async function fetchAllUsers() {
  let page = 1;
  let allUsers = [];

  while (true) {
    const response = await fetch(\`/api/users?page=\${page}\`);
    const users = await response.json();

    if (users.length === 0) break;

    allUsers.push(...users);
    page++;
  }

  return allUsers;
}
\`\`\``,
    tags: ['api', 'pagination', 'code', 'typescript'],
  });

  console.log(`✅ Added Page ${page2}: Pagination Implementation Example`);

  const page3 = await notebook.addNote({
    section: 'lessons-learned',
    content: `When API returns 429 (rate limit), implement exponential backoff:
- First retry: wait 1 second
- Second retry: wait 2 seconds
- Third retry: wait 4 seconds
- Max retries: 5 attempts`,
    tags: ['api', 'error-handling', 'rate-limiting'],
  });

  console.log(`✅ Added Page ${page3}: Rate Limiting Lesson\n`);

  // Get Table of Contents
  console.log('📚 Table of Contents + Index:\n');
  const toc = await notebook.getTableOfContents();
  console.log(toc);

  // Fetch a specific page
  console.log('\n📄 Fetching Page 1:\n');
  const pageContent = await notebook.getPage(1);
  console.log(pageContent);

  // Fetch multiple pages
  console.log('\n📄 Fetching Pages 1 and 2:\n');
  const multiplePages = await notebook.getPages([1, 2]);
  console.log(multiplePages);

  // Search by tags
  console.log('\n🔍 Searching for notes tagged with "api":\n');
  const apiNotes = await notebook.search({ tags: ['api'] });
  console.log(apiNotes);

  // Search by section
  console.log('\n🔍 Searching for "examples" section:\n');
  const examples = await notebook.search({ sections: ['examples'] });
  console.log(examples);

  // Update a page
  console.log('\n✏️  Updating Page 3 with additional information...\n');
  await notebook.updatePage(3, {
    content: `When API returns 429 (rate limit), implement exponential backoff:
- First retry: wait 1 second
- Second retry: wait 2 seconds
- Third retry: wait 4 seconds
- Fourth retry: wait 8 seconds
- Max retries: 5 attempts

**Updated:** Added fourth retry step for better resilience.`,
  });

  const updatedPage = await notebook.getPage(3);
  console.log(updatedPage);

  console.log('\n✅ Example complete! Check ./data/my-notebook.jsonl to see the stored notes.');
}

main().catch(console.error);
