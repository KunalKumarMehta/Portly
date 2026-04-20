---
date: 2026-04-21
topic: "Portly TanStack Start GitHub Portfolio"
status: validated
---

## Problem Statement
Need TanStack Start app. Auto-gen portfolio via GitHub API. Deploy Netlify.

## Constraints
- TanStack Start framework.
- Remote: KunalKumarMehta/Portly.git.
- Netlify deployment via netlify.toml.

## Approach
1. Init TanStack Start project (React, Router, Tailwind).
2. Create GitHub API fetcher utility.
3. Build dynamic route `/[username]` to render portfolio.
4. Add `netlify.toml` for Netlify build command and publish dir.

## Architecture
- **Frontend**: TanStack Router pages.
- **Backend**: TanStack Start server functions for GitHub API (prevents CORS, hides logic).
- **Hosting**: Netlify Edge / Serverless.

## Components
- `Home`: Username input form.
- `PortfolioView`: Displays GitHub user stats, top pinned/starred repositories, language breakdown.
- `RepoCard`: Individual project display.

## Data Flow
User enters name → Redirect to `/$user` → Server function fetches `api.github.com/users/$user` & `/repos` → Returns to client → Renders UI.

## Error Handling
- GitHub API rate limits → Show fallback/error UI.
- User not found → 404 page.

## Testing Strategy
- Manual test with known GitHub handles (e.g., `torvalds`, `KunalKumarMehta`).
- Verify Netlify build locally.
