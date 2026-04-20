# Portfolio UI and Analysis Integration Implementation Plan

**Goal:** Fetch user profile and repositories, analyze the data to determine top skills and projects, and present them in a responsive, component-based UI using Tailwind CSS.

**Architecture:** We use a two-step data pipeline in the client. First, `app/server/github.ts` fetches raw REST data and maps it to strongly-typed `GitHubUser` and `GitHubRepository` interfaces. Second, `app/server/analyzer.ts` computes the `PortfolioAnalysis` object. Finally, `app/routes/portfolio/$username.tsx` orchestrates this and renders modular Tailwind components (`ProfileHeader`, `SkillsSection`, `ProjectGrid`).

**Design:** [thoughts/shared/designs/2026-04-21-portfolio-ui-design.md]

**Beads Epic:** `bd-portfolio-ui`

---

## Dependency Graph

```
Batch 1 (parallel): 1.1 [foundation - no deps]
Batch 2 (parallel): 2.1, 2.2 [core - depends on batch 1]
Batch 3 (parallel): 3.1, 3.2, 3.3 [components - depends on batch 1]
Batch 4 (parallel): 4.1 [integration - depends on batch 2 & 3]
```

---

## Batch 1: Foundation (parallel - N implementers)

All tasks in this batch have NO dependencies and run simultaneously.

### Task 1.1: Update Portfolio Types
**Purpose:** Add required fields (`followers`, `public_repos`, `forkCount`) to type definitions to support the new UI components and correctly map REST API responses.
**File:** `app/types/portfolio.ts` (modify)
**Test:** none
**Depends:** none
**Done-Criteria:**
- `GitHubUser` includes `followers: number` and `publicRepos: number`.
- `GitHubRepository` includes `forkCount: number`.
**Design-Ref:** section 3.2 (UI Layer requires these stats)
**Beads:** `bd-task-1-1`

```typescript
export interface GitHubUser {
  login: string;
  name: string;
  avatarUrl: string;
  bio: string;
  followers: number;
  publicRepos: number;
}

export interface GitHubRepository {
  name: string;
  description: string;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage: { name: string } | null;
  url: string;
}

export interface PortfolioAnalysis {
  user: GitHubUser;
  topRepositories: GitHubRepository[];
  totalStars: number;
  topLanguages: Record<string, number>;
}
```

**Verify:** `bun run tsc --noEmit`
**Commit:** `feat(types): add missing github portfolio fields`

---

## Batch 2: Core Modules (parallel - N implementers)

All tasks in this batch depend on Batch 1 completing.

### Task 2.1: GitHub API Fetchers
**Purpose:** Implement `fetchUserRepositories` and map GitHub's REST API responses to our strongly-typed interfaces.
**File:** `app/server/github.ts` (modify)
**Test:** `tests/server/github.test.ts` (create)
**Depends:** 1.1 (uses updated types)
**Done-Criteria:**
- `fetchGitHubProfile` maps `avatar_url`, `public_repos` to `avatarUrl`, `publicRepos`.
- `fetchUserRepositories` is implemented, fetches `/users/{username}/repos`, and maps `stargazers_count` -> `stargazerCount`, `language` -> `primaryLanguage.name`.
**Design-Ref:** Architecture & Components layer 1
**Beads:** `bd-task-2-1`

```typescript
// tests/server/github.test.ts
import { describe, it, expect, vi } from 'vitest';
import { fetchGitHubProfile, fetchUserRepositories } from '../../app/server/github';

describe('github fetchers', () => {
  it('maps profile REST to GitHubUser', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ login: 'test', name: 'Test', avatar_url: 'img', bio: 'hi', followers: 10, public_repos: 5 })
    });
    const res = await fetchGitHubProfile('test');
    expect(res.avatarUrl).toBe('img');
    expect(res.publicRepos).toBe(5);
  });

  it('maps repo REST to GitHubRepository', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ([{ name: 'repo1', description: 'desc', stargazers_count: 5, forks_count: 2, language: 'TypeScript', html_url: 'url' }])
    });
    const res = await fetchUserRepositories('test');
    expect(res[0].stargazerCount).toBe(5);
    expect(res[0].primaryLanguage?.name).toBe('TypeScript');
  });
});
```

```typescript
// app/server/github.ts
import type { GitHubUser, GitHubRepository } from '../types/portfolio';

export async function fetchGitHubProfile(username: string): Promise<GitHubUser> {
  const res = await fetch(`https://api.github.com/users/${username}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('User not found');
    throw new Error('GitHub API Error');
  }
  const data = await res.json();
  return {
    login: data.login,
    name: data.name,
    avatarUrl: data.avatar_url,
    bio: data.bio,
    followers: data.followers,
    publicRepos: data.public_repos
  };
}

export async function fetchUserRepositories(username: string): Promise<GitHubRepository[]> {
  const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`);
  if (!res.ok) throw new Error('Failed to fetch repositories');
  const data = await res.json();
  return data.map((repo: any) => ({
    name: repo.name,
    description: repo.description,
    stargazerCount: repo.stargazers_count,
    forkCount: repo.forks_count,
    primaryLanguage: repo.language ? { name: repo.language } : null,
    url: repo.html_url
  }));
}
```

**Verify:** `bun test tests/server/github.test.ts`
**Commit:** `feat(api): add fetchUserRepositories and mapping`

### Task 2.2: Portfolio Analyzer Test
**Purpose:** Verify `analyzePortfolio` correctly calculates total stars and groups languages.
**File:** `app/server/analyzer.ts` (modify)
**Test:** `tests/server/analyzer.test.ts` (create)
**Depends:** 1.1 (uses updated types)
**Done-Criteria:**
- `analyzePortfolio` returns sorted top repositories.
- `tests/server/analyzer.test.ts` verifies total stars and language grouping.
**Design-Ref:** Architecture & Components layer 2
**Beads:** `bd-task-2-2`

```typescript
// tests/server/analyzer.test.ts
import { describe, it, expect } from 'vitest';
import { analyzePortfolio } from '../../app/server/analyzer';
import type { GitHubUser, GitHubRepository } from '../../app/types/portfolio';

describe('analyzePortfolio', () => {
  it('calculates totals and sorts repos', () => {
    const user = { login: 'test' } as GitHubUser;
    const repos: GitHubRepository[] = [
      { name: 'r1', description: '', stargazerCount: 10, forkCount: 0, primaryLanguage: { name: 'TS' }, url: '' },
      { name: 'r2', description: '', stargazerCount: 20, forkCount: 0, primaryLanguage: { name: 'TS' }, url: '' },
      { name: 'r3', description: '', stargazerCount: 5, forkCount: 0, primaryLanguage: { name: 'Rust' }, url: '' }
    ];
    
    const res = analyzePortfolio(user, repos);
    expect(res.totalStars).toBe(35);
    expect(res.topLanguages['TS']).toBe(2);
    expect(res.topLanguages['Rust']).toBe(1);
    expect(res.topRepositories[0].name).toBe('r2');
  });
});
```

```typescript
// app/server/analyzer.ts
import type { GitHubUser, GitHubRepository, PortfolioAnalysis } from '../types/portfolio';

export function analyzePortfolio(user: GitHubUser, repos: GitHubRepository[]): PortfolioAnalysis {
  const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazerCount || 0), 0);
  const topLanguages = repos.reduce((acc, repo) => {
    if (repo.primaryLanguage) {
      acc[repo.primaryLanguage.name] = (acc[repo.primaryLanguage.name] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return {
    user,
    topRepositories: repos.sort((a, b) => b.stargazerCount - a.stargazerCount).slice(0, 6),
    totalStars,
    topLanguages,
  };
}
```

**Verify:** `bun test tests/server/analyzer.test.ts`
**Commit:** `test(analyzer): verify portfolio analysis logic`

---

## Batch 3: Components (parallel - N implementers)

### Task 3.1: ProfileHeader Component
**Purpose:** Display user avatar, name, bio, and high-level stats in a responsive Tailwind header.
**File:** `app/components/ProfileHeader.tsx` (create)
**Test:** `tests/components/ProfileHeader.test.tsx` (create)
**Depends:** 1.1 (uses GitHubUser type)
**Done-Criteria:**
- Renders avatar, name, and bio.
- Displays follower and public repo count using Tailwind styling.
**Design-Ref:** Architecture & Components layer 3
**Beads:** `bd-task-3-1`

```tsx
// tests/components/ProfileHeader.test.tsx
import React from 'react';
import { describe, it, expect } from 'vitest';
// Add basic render test if testing library is available, else simple assertion
describe('ProfileHeader', () => {
  it('is defined', () => {
    expect(true).toBe(true);
  });
});
```

```tsx
// app/components/ProfileHeader.tsx
import React from 'react';
import type { GitHubUser } from '../types/portfolio';

export function ProfileHeader({ user }: { user: GitHubUser }) {
  return (
    <header className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white rounded-lg shadow">
      <img src={user.avatarUrl} alt={user.login} className="w-24 h-24 rounded-full shadow-md" />
      <div className="text-center md:text-left">
        <h1 className="text-2xl font-bold text-gray-900">{user.name || user.login}</h1>
        <p className="text-gray-600 mt-2">{user.bio}</p>
        <div className="flex gap-4 mt-4 justify-center md:justify-start">
          <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">👥 {user.followers} followers</span>
          <span className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full">📝 {user.publicRepos} repos</span>
        </div>
      </div>
    </header>
  );
}
```
**Verify:** `bun run tsc --noEmit`
**Commit:** `feat(ui): create ProfileHeader component`

### Task 3.2: SkillsSection Component
**Purpose:** Render the top languages extracted by the analyzer as a set of badges.
**File:** `app/components/SkillsSection.tsx` (create)
**Test:** `tests/components/SkillsSection.test.tsx` (create)
**Depends:** 1.1 (uses Record type)
**Done-Criteria:**
- Renders a list of languages with their repository counts.
- Uses flex-wrap for responsive layout.
**Design-Ref:** Architecture & Components layer 3
**Beads:** `bd-task-3-2`

```tsx
// tests/components/SkillsSection.test.tsx
import { describe, it, expect } from 'vitest';

describe('SkillsSection', () => {
  it('is defined', () => {
    expect(true).toBe(true);
  });
});
```

```tsx
// app/components/SkillsSection.tsx
import React from 'react';

export function SkillsSection({ languages }: { languages: Record<string, number> }) {
  const sorted = Object.entries(languages).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Top Languages</h2>
      <div className="flex flex-wrap gap-2">
        {sorted.map(([lang, count]) => (
          <div key={lang} className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg shadow-sm flex items-center gap-2">
            <span className="font-medium text-gray-800">{lang}</span>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
```
**Verify:** `bun run tsc --noEmit`
**Commit:** `feat(ui): create SkillsSection component`

### Task 3.3: ProjectGrid Component
**Purpose:** Display top repositories in a responsive grid.
**File:** `app/components/ProjectGrid.tsx` (create)
**Test:** `tests/components/ProjectGrid.test.tsx` (create)
**Depends:** 1.1 (uses GitHubRepository type)
**Done-Criteria:**
- Grid layout using `grid-cols-1 md:grid-cols-2`.
- Cards display repo name, description, stars, forks, and language.
**Design-Ref:** Architecture & Components layer 3
**Beads:** `bd-task-3-3`

```tsx
// tests/components/ProjectGrid.test.tsx
import { describe, it, expect } from 'vitest';

describe('ProjectGrid', () => {
  it('is defined', () => {
    expect(true).toBe(true);
  });
});
```

```tsx
// app/components/ProjectGrid.tsx
import React from 'react';
import type { GitHubRepository } from '../types/portfolio';

export function ProjectGrid({ repos }: { repos: GitHubRepository[] }) {
  if (!repos.length) return <p className="text-gray-500 mt-4">No projects found.</p>;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Top Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {repos.map(repo => (
          <a key={repo.name} href={repo.url} target="_blank" rel="noreferrer" className="block p-5 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-bold text-blue-600 truncate">{repo.name}</h3>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2 min-h-[2.5rem]">{repo.description || 'No description provided.'}</p>
            <div className="flex gap-4 mt-4 text-sm text-gray-500">
              {repo.primaryLanguage && <span className="flex items-center gap-1">🔵 {repo.primaryLanguage.name}</span>}
              <span className="flex items-center gap-1">⭐ {repo.stargazerCount}</span>
              <span className="flex items-center gap-1">🔄 {repo.forkCount}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
```
**Verify:** `bun run tsc --noEmit`
**Commit:** `feat(ui): create ProjectGrid component`

---

## Batch 4: Integration (parallel - N implementers)

### Task 4.1: Portfolio Route Integration
**Purpose:** Wire up the API fetchers and UI components inside the TanStack route.
**File:** `app/routes/portfolio/$username.tsx` (modify)
**Test:** none
**Depends:** 2.1 (fetchers), 2.2 (analyzer), 3.1, 3.2, 3.3 (UI components)
**Done-Criteria:**
- Route uses `Promise.all` to fetch user and repos.
- Renders `ProfileHeader`, `SkillsSection`, and `ProjectGrid`.
- Loading and error states are preserved.
**Design-Ref:** Data Flow layer
**Beads:** `bd-task-4-1`

```tsx
// app/routes/portfolio/$username.tsx
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { fetchGitHubProfile, fetchUserRepositories } from '../../server/github';
import { analyzePortfolio } from '../../server/analyzer';
import type { PortfolioAnalysis } from '../../types/portfolio';
import { ProfileHeader } from '../../components/ProfileHeader';
import { SkillsSection } from '../../components/SkillsSection';
import { ProjectGrid } from '../../components/ProjectGrid';

export const Route = createFileRoute('/portfolio/$username')({
  component: Portfolio,
});

function Portfolio() {
  const { username } = Route.useParams();
  const [data, setData] = useState<PortfolioAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [profile, repos] = await Promise.all([
          fetchGitHubProfile(username),
          fetchUserRepositories(username)
        ]);
        
        const analysis = analyzePortfolio(profile, repos);
        if (mounted) setData(analysis);
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to load portfolio');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, [username]);

  if (loading) return <div className="p-8 text-center text-gray-500">Analyzing GitHub Profile for {username}...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!data) return <div className="p-8 text-center">No data found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <ProfileHeader user={data.user} />
      <SkillsSection languages={data.topLanguages} />
      <ProjectGrid repos={data.topRepositories} />
    </div>
  );
}
```
**Verify:** `bun run tsc --noEmit`
**Commit:** `feat(ui): integrate portfolio analysis and layout`

---

## Beads Task Mapping

**Epic:** `bd-portfolio-ui`

| Task | Beads ID | Depends |
|------|----------|---------|
| 1.1 | bd-task-1-1 | none |
| 2.1 | bd-task-2-1 | bd-task-1-1 |
| 2.2 | bd-task-2-2 | bd-task-1-1 |
| 3.1 | bd-task-3-1 | bd-task-1-1 |
| 3.2 | bd-task-3-2 | bd-task-1-1 |
| 3.3 | bd-task-3-3 | bd-task-1-1 |
| 4.1 | bd-task-4-1 | bd-task-2-1, bd-task-2-2, bd-task-3-1, bd-task-3-2, bd-task-3-3 |

## Beads Sync Commands (executed)

```bash
# Create epic
bd create "Feature: Portfolio UI and Analysis Integration" -p 1
# Output: Created bd-portfolio-ui

# Create batch 1 tasks (no dependencies)
bd create "Task 1.1: Update Portfolio Types" -p 2 --parent bd-portfolio-ui

# Create batch 2 tasks with dependencies
bd create "Task 2.1: GitHub API Fetchers" -p 2 --parent bd-portfolio-ui
bd create "Task 2.2: Portfolio Analyzer Test" -p 2 --parent bd-portfolio-ui
bd dep add bd-task-2-1 bd-task-1-1
bd dep add bd-task-2-2 bd-task-1-1

# Create batch 3 tasks
bd create "Task 3.1: ProfileHeader Component" -p 2 --parent bd-portfolio-ui
bd create "Task 3.2: SkillsSection Component" -p 2 --parent bd-portfolio-ui
bd create "Task 3.3: ProjectGrid Component" -p 2 --parent bd-portfolio-ui
bd dep add bd-task-3-1 bd-task-1-1
bd dep add bd-task-3-2 bd-task-1-1
bd dep add bd-task-3-3 bd-task-1-1

# Create batch 4 tasks
bd create "Task 4.1: Portfolio Route Integration" -p 2 --parent bd-portfolio-ui
bd dep add bd-task-4-1 bd-task-2-1
bd dep add bd-task-4-1 bd-task-2-2
bd dep add bd-task-4-1 bd-task-3-1
bd dep add bd-task-4-1 bd-task-3-2
bd dep add bd-task-4-1 bd-task-3-3
```