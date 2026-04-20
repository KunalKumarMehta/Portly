---
date: 2026-04-21
topic: "Portfolio UI and Analysis Integration"
status: validated
---

## Problem Statement
The application currently successfully routes to a user's portfolio page and fetches basic profile data, but only renders raw JSON. We need to fetch their repositories, run the analysis engine to determine top skills and projects, and present this in a polished resume format.

## Constraints
- Must use existing Tailwind CSS setup.
- Client-side data fetching only (SSR removed due to build issues).
- Keep API calls within rate limits (fetch profile and repos simultaneously).

## Approach
Implement a two-step data pipeline in the route loader/component: fetch raw data, then analyze it. Use the resulting `PortfolioData` object to drive a responsive, component-based UI.

## Architecture & Components
1. **Data Layer (`app/server/github.ts`)**: Add `fetchUserRepositories` to pull public repos.
2. **Analysis Layer (`app/server/analyzer.ts`)**: Ensure `analyzeProfile` correctly processes the profile and repo arrays into `PortfolioData`.
3. **UI Layer (`app/routes/portfolio/$username.tsx`)**:
   - `ProfileHeader`: Renders avatar, name, bio, and high-level stats.
   - `SkillsSection`: Displays top languages as badges or bars.
   - `ProjectGrid`: Displays top-ranked repositories as cards with stars/forks metrics.

## Data Flow
1. User visits `/portfolio/kunal`.
2. Route component mounts and triggers `useEffect` (or TanStack Router's `loader` if applicable on client).
3. Fetch calls `api.github.com/users/kunal` and `api.github.com/users/kunal/repos`.
4. Responses are passed to `analyzeProfile(profile, repos)`.
5. The returned `PortfolioData` state updates, triggering a render of the UI components.

## Testing Strategy
- Unit test the GitHub API fetch functions with mocked responses.
- Verify the analyzer correctly ranks a mock set of repositories.
- Use simple Vitest component tests to ensure the UI renders without crashing given valid `PortfolioData`.