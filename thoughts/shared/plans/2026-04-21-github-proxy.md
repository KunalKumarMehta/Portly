# GitHub GraphQL Proxy Implementation Plan

**Goal:** Implement a Netlify Function proxy to securely handle GitHub GraphQL API calls without exposing `GITHUB_TOKEN` to the browser.

**Architecture:** A serverless function acts as an intermediary. The client calls `/api/github-proxy`, which appends the `GITHUB_TOKEN` from environment variables and forwards the request to GitHub.

**Design:** [Link to thoughts/shared/designs/2026-04-21-github-proxy-design.md]

**Beads Epic:** `[bd-pending]` (Manual sync required as `bd` command not found)

---

## Dependency Graph

```
Batch 1 (parallel): 1.1 [function skeleton], 1.2 [test setup]
Batch 2 (parallel): 2.1 [proxy logic]
Batch 3 (parallel): 3.1 [service update]
Batch 4 (parallel): 4.1 [integration test]
```

---

## Batch 1: Foundation (parallel - 2 implementers)

### Task 1.1: Netlify Function Skeleton
**Purpose:** Create the entry point for the Netlify Function.
**File:** `netlify/functions/github-proxy.ts` (create)
**Test:** `tests/functions/github-proxy.test.ts` (create)
**Depends:** none
**Done-Criteria:**
- File exists at `netlify/functions/github-proxy.ts`
- Exports a `handler` function following Netlify's signature
- Returns a 405 if method is not POST
**Design-Ref:** design.md section 3.1
**Beads:** `[bd-pending.1]`

```typescript
import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Skeleton ready' }),
  };
};
```

```typescript
import { describe, it, expect } from 'vitest';
import { handler } from '../../netlify/functions/github-proxy';

describe('github-proxy handler skeleton', () => {
  it('should return 405 for GET requests', async () => {
    const event = { httpMethod: 'GET' } as any;
    const response = await handler(event, {} as any);
    expect(response?.statusCode).toBe(405);
  });

  it('should return 200 for POST requests', async () => {
    const event = { httpMethod: 'POST' } as any;
    const response = await handler(event, {} as any);
    expect(response?.statusCode).toBe(200);
  });
});
```

**Verify:** `bun test tests/functions/github-proxy.test.ts`
**Commit:** `feat(proxy): add github-proxy function skeleton`

---

## Batch 2: Core Logic (parallel - 1 implementer)

### Task 2.1: Implement Proxy Forwarding
**Purpose:** Add logic to forward requests to GitHub with the secret token.
**File:** `netlify/functions/github-proxy.ts` (modify)
**Test:** `tests/functions/github-proxy.test.ts` (modify)
**Depends:** 1.1 (enhances skeleton)
**Done-Criteria:**
- Reads `GITHUB_TOKEN` from `process.env`
- Forwards `query` and `variables` from request body to `https://api.github.com/graphql`
- Appends `Authorization` header with token
- Returns GitHub's response or appropriate error
**Design-Ref:** design.md section 3.1
**Beads:** `[bd-pending.2]`

```typescript
import { Handler } from '@netlify/functions';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return { statusCode: 500, body: JSON.stringify({ error: 'GITHUB_TOKEN not configured' }) };
  }

  try {
    const { query, variables } = JSON.parse(event.body || '{}');

    const response = await fetch(GITHUB_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```

**Verify:** `bun test tests/functions/github-proxy.test.ts`
**Commit:** `feat(proxy): implement github-proxy forwarding logic`

---

## Batch 3: Service Integration (parallel - 1 implementer)

### Task 3.1: Update GitHub Service to use Proxy
**Purpose:** Redirect client-side calls from GitHub API to the local proxy.
**File:** `app/server/github.ts` (modify)
**Test:** `tests/server/github.test.ts` (modify)
**Depends:** 2.1 (proxy must exist for actual use, though mocks allow parallel dev)
**Done-Criteria:**
- Changes `GITHUB_GRAPHQL_URL` to `/.netlify/functions/github-proxy` (or local equivalent)
- Removes `process.env.GITHUB_TOKEN` check from `fetchGraphQL` (as it's now server-side)
- Updates tests to verify calls to the new endpoint
**Design-Ref:** design.md section 3.2
**Beads:** `[bd-pending.3]`

```typescript
// app/server/github.ts
// Change:
// const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
// To:
const GITHUB_GRAPHQL_URL = '/.netlify/functions/github-proxy';

// In fetchGraphQL:
// Remove token logic, just send the body.
```

**Verify:** `bun test tests/server/github.test.ts`
**Commit:** `refactor(github): route calls through local proxy`

---

## Batch 4: Integration (parallel - 1 implementer)

### Task 4.1: End-to-End Proxy Verification
**Purpose:** Verify that the service correctly interacts with the proxy.
**File:** `tests/integration/github-proxy.test.ts` (create)
**Test:** `tests/integration/github-proxy.test.ts`
**Depends:** 3.1
**Done-Criteria:**
- Mocks the fetch call from the function to GitHub
- Verifies that `fetchGitHubProfile` results in a call to the proxy
- Verifies that the proxy adds the token and forwards to GitHub
**Design-Ref:** design.md section 3.3
**Beads:** `[bd-pending.4]`

**Verify:** `bun test tests/integration/github-proxy.test.ts`
**Commit:** `test(proxy): add end-to-end integration test`

---

## Beads Task Mapping

**Epic:** `bd-pending` (Manual sync needed)

| Task | Beads ID | Depends |
|------|----------|---------|
| 1.1 | bd-pending.1 | none |
| 2.1 | bd-pending.2 | bd-pending.1 |
| 3.1 | bd-pending.3 | bd-pending.2 |
| 4.1 | bd-pending.4 | bd-pending.3 |
