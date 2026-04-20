# Deep Impact Analysis Implementation Plan

**Goal:** Migrate GitHub data fetching to GraphQL and enhance the UI with contribution-based metrics like external impact and reviewer quality.

**Architecture:** 
- **Data Layer:** Replaces REST `fetch` calls with a unified GraphQL client in `app/server/github.ts`. Uses `contributionsCollection` for historical data.
- **Analysis Layer:** Enhances `app/server/analyzer.ts` to calculate a weighted `ImpactScore` based on career span, external PRs, and code reviews.
- **UI Layer:** Introduces `ContributionHeatmap` and `ImpactMetrics` components to visualize the deep analysis results.

**Design:** [thoughts/shared/designs/2026-04-21-deep-impact-analysis.md](thoughts/shared/designs/2026-04-21-deep-impact-analysis.md)

**Beads Epic:** `[bd-pending]` (Sync failed: bd command not found)

---

## Dependency Graph

```
Batch 1 (parallel): 1.1 [types]
Batch 2 (parallel): 2.1 [graphql client], 2.2 [analyzer logic]
Batch 3 (parallel): 3.1 [Heatmap UI], 3.2 [Metrics UI]
Batch 4 (parallel): 4.1 [Integration]
```

---

## Batch 1: Foundation (parallel - 1 implementer)

### Task 1.1: Deep Impact Types
**Purpose:** Update types to support GraphQL response shapes and new analysis metrics.
**File:** `app/types/portfolio.ts` (modify)
**Test:** none
**Depends:** none
**Done-Criteria:**
- `GitHubUser` includes `contributionYears`, `externalImpact`, and `reviewerQuality`.
- `ContributionDay` interface defined for heatmap.
- `PortfolioAnalysis` includes `impactScore` and `workPatterns`.
**Design-Ref:** design.md section 21, 24-25
**Beads:** `[bd-pending.1]`

```typescript
export interface ContributionDay {
  date: string;
  contributionCount: number;
  color: string;
}

export interface GitHubUser {
  login: string;
  name: string;
  avatarUrl: string;
  bio: string;
  followers: number;
  publicRepos: number;
  url: string;
  contributionYears: number[];
  externalContributions: number;
  reviewsGiven: number;
  contributionCalendar: ContributionDay[];
}

export interface GitHubRepository {
  name: string;
  description: string;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage: { name: string } | null;
  url: string;
  isExternal: boolean;
}

export interface PortfolioAnalysis {
  user: GitHubUser;
  topRepositories: GitHubRepository[];
  totalStars: number;
  topLanguages: Record<string, number>;
  impactScore: number;
  workPattern: 'Lone Wolf' | 'Collaborator' | 'Maintainer';
}
```

---

## Batch 2: Core Logic (parallel - 2 implementers)

### Task 2.1: GraphQL Client Migration
**Purpose:** Replace REST fetching with GitHub GraphQL API (v4) to retrieve contribution data.
**File:** `app/server/github.ts` (modify)
**Test:** `tests/server/github.test.ts` (create)
**Depends:** 1.1
**Done-Criteria:**
- `fetchGitHubProfile` uses GraphQL query for user info and `contributionsCollection`.
- `fetchUserRepositories` uses GraphQL to identify external vs owned repos.
- Handles `GITHUB_TOKEN` environment variable.
**Design-Ref:** design.md section 22, 30
**Beads:** `[bd-pending.2]`

```typescript
// tests/server/github.test.ts
import { describe, it, expect, vi } from 'vitest';
import { fetchGitHubProfile } from '../../app/server/github';

describe('fetchGitHubProfile', () => {
  it('fetches user and contribution data via GraphQL', async () => {
    // Mock fetch with GraphQL response
    const data = await fetchGitHubProfile('octocat');
    expect(data).toHaveProperty('contributionCalendar');
    expect(data).toHaveProperty('externalContributions');
  });
});

// app/server/github.ts (Partial implementation logic)
const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

const USER_QUERY = `
  query($login: String!) {
    user(login: $login) {
      name
      bio
      avatarUrl
      contributionsCollection {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
              color
            }
          }
        }
        totalPullRequestContributions
        totalPullRequestReviewContributions
      }
      repositories(first: 100, orderBy: {field: PUSHED_AT, direction: DESC}) {
        nodes {
          name
          stargazerCount
          forkCount
          primaryLanguage { name }
          url
          isInOrganization
        }
      }
    }
  }
`;
```

### Task 2.2: Deep Analyzer Implementation
**Purpose:** Implement impact scoring and work pattern detection logic.
**File:** `app/server/analyzer.ts` (modify)
**Test:** `tests/server/analyzer.test.ts` (modify)
**Depends:** 1.1
**Done-Criteria:**
- `calculateImpactScore()` weights: Stars (1x), External PRs (5x), Reviews (3x).
- `extractWorkPatterns()` identifies 'Collaborator' if reviews/external PRs > 20% of total.
**Design-Ref:** design.md section 23-25
**Beads:** `[bd-pending.3]`

```typescript
// app/server/analyzer.ts logic
export function calculateImpactScore(user: GitHubUser, repos: GitHubRepository[]): number {
  const repoStars = repos.reduce((sum, r) => sum + r.stargazerCount, 0);
  return repoStars + (user.externalContributions * 5) + (user.reviewsGiven * 3);
}

export function extractWorkPattern(user: GitHubUser): PortfolioAnalysis['workPattern'] {
  const totalImpactActions = user.externalContributions + user.reviewsGiven;
  if (totalImpactActions > 50) return 'Maintainer';
  if (user.externalContributions > 10) return 'Collaborator';
  return 'Lone Wolf';
}
```

---

## Batch 3: Visual Components (parallel - 2 implementers)

### Task 3.1: Contribution Heatmap Component
**Purpose:** Visualize the activity density from the GraphQL `contributionCalendar`.
**File:** `app/components/ContributionHeatmap.tsx` (create)
**Test:** `tests/components/ContributionHeatmap.test.tsx` (create)
**Depends:** 1.1, 2.1
**Done-Criteria:**
- Renders a grid of days colored by activity level.
- Tooltip displays date and count on hover.
**Design-Ref:** design.md section 27
**Beads:** `[bd-pending.4]`

### Task 3.2: Impact Metrics Component
**Purpose:** Display high-level stats like "External Contributions" and "Reviews Given".
**File:** `app/components/ImpactMetrics.tsx` (create)
**Test:** `tests/components/ImpactMetrics.test.tsx` (create)
**Depends:** 1.1, 2.2
**Done-Criteria:**
- Displays "Impact Score" prominently.
- Show badges for work patterns (e.g., "Collaborator").
**Design-Ref:** design.md section 28
**Beads:** `[bd-pending.5]`

---

## Batch 4: Integration (parallel - 1 implementer)

### Task 4.1: Profile Page Integration
**Purpose:** Wire up the new analyzer and components to the main profile view.
**File:** `app/routes/profile.$username.tsx` (modify)
**Test:** none
**Depends:** 2.1, 2.2, 3.1, 3.2
**Done-Criteria:**
- Profile page calls updated `fetchGitHubProfile` and `analyzePortfolio`.
- Renders `ImpactMetrics` and `ContributionHeatmap` sections.
**Design-Ref:** design.md section 34
**Beads:** `[bd-pending.6]`

---

## Beads Sync Commands (Failed)

*Note: The `bd` command was not found in the environment. Manual task tracking required until Beads is available.*

```bash
# Expected commands if bd was available:
# bd create "Feature: Deep Impact Analysis" -p 1
# bd create "Task 1.1: Deep Impact Types" -p 2 --parent [epic-id]
# ... and so on
```
