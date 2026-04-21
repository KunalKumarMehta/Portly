---
date: 2026-04-21
topic: "Secure GitHub GraphQL Proxy with Netlify Functions"
status: validated
---

## Problem Statement
The client-side GraphQL calls fail because they lack a `GITHUB_TOKEN`. Exposing a token in the browser is a security risk.

## Constraints
- Keep `GITHUB_TOKEN` server-side.
- Use Netlify Functions to bridge the client and GitHub.
- Minimize latency.

## Approach
Create a serverless function `netlify/functions/github-proxy.ts`. 
1. Client sends GraphQL query/variables to `/api/github-proxy`.
2. Function appends `process.env.GITHUB_TOKEN` and forwards to `api.github.com/graphql`.
3. Client receives the response securely.

## Components
1. **Proxy Function (`netlify/functions/github-proxy.ts`)**: Handles POST requests, adds headers, and proxies the payload.
2. **GraphQL Service (`app/server/github.ts`)**: Update to call the local proxy endpoint instead of GitHub directly.

## Data Flow
Client `fetch` -> Netlify Function -> GitHub GraphQL -> Netlify Function -> Client.

## Testing Strategy
- Mock the Netlify Function environment.
- Verify that `GITHUB_TOKEN` is correctly applied in the function.
- Test client error handling when the proxy returns non-200 status.