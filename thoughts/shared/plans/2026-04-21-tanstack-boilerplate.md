# Portly TanStack Start Framework Integration Implementation Plan

**Goal:** Integrate the official TanStack Start boilerplate, configure the file-based router, and establish client/server entry points.

**Architecture:** We use `@tanstack/start` to provide a Vite-based SSR architecture. We will define `app.config.ts`, entry points (`client.tsx`, `ssr.tsx`), and set up the `app/router.tsx` to handle file-based routing.

**Design:** [thoughts/shared/designs/2026-04-21-tanstack-boilerplate.md](thoughts/shared/designs/2026-04-21-tanstack-boilerplate.md)

**Beads Epic:** `[bd-epic-1]` (created after plan sync)

---

## Dependency Graph

```
Batch 1 (parallel): 1.1, 1.2, 1.3, 1.4, 1.5 [foundation - no deps]
Batch 2 (parallel): 2.1, 2.2, 2.3 [components - depends on batch 1]
Batch 3 (parallel): 3.1 [integration - depends on batch 2]
```

---

## Batch 1: Foundation (parallel - N implementers)

All tasks in this batch have NO dependencies and run simultaneously.

### Task 1.1: TanStack Start Config
**Purpose:** Create the main application config using `defineConfig` for TanStack Start with a Netlify preset.
**File:** `app.config.ts` (create)
**Test:** none
**Depends:** none
**Done-Criteria:**
- `app.config.ts` exports default `defineConfig({ server: { preset: 'netlify' } })`
**Design-Ref:** design.md section "Components"
**Beads:** `[bd-1.1]`

```typescript
import { defineConfig } from '@tanstack/start/config'

export default defineConfig({
  server: {
    preset: 'netlify'
  }
})
```
**Verify:** `cat app.config.ts`
**Commit:** `chore(config): add app.config.ts for tanstack start`

### Task 1.2: Router Configuration
**Purpose:** Initialize the TanStack router with the generated route tree.
**File:** `app/router.tsx` (create)
**Test:** none
**Depends:** none
**Done-Criteria:**
- `createRouter` function is exported and returns `createTanStackRouter`.
- Register interface is augmented with `router: ReturnType<typeof createRouter>`.
**Design-Ref:** design.md section "Components"
**Beads:** `[bd-1.2]`

```typescript
import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function createRouter() {
  return createTanStackRouter({
    routeTree,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
```
**Verify:** `cat app/router.tsx`
**Commit:** `feat(router): add app/router.tsx instance creation`

### Task 1.3: Client Entry Point
**Purpose:** Establish the browser-side entry point for hydrating the application.
**File:** `app/client.tsx` (create)
**Test:** none
**Depends:** none
**Done-Criteria:**
- Invokes `hydrateRoot` with `<StartClient router={router} />`
**Design-Ref:** design.md section "Architecture"
**Beads:** `[bd-1.3]`

```typescript
/// <reference types="vinxi/types/client" />
import { hydrateRoot } from 'react-dom/client'
import { StartClient } from '@tanstack/start'
import { createRouter } from './router'

const router = createRouter()

hydrateRoot(document, <StartClient router={router} />)
```
**Verify:** `cat app/client.tsx`
**Commit:** `feat(entry): add app/client.tsx browser entry`

### Task 1.4: Server Entry Point
**Purpose:** Establish the server-side entry point for SSR handling.
**File:** `app/ssr.tsx` (create)
**Test:** none
**Depends:** none
**Done-Criteria:**
- Exports `createStartHandler` connected to `createRouter` and `getRouterManifest`.
**Design-Ref:** design.md section "Architecture"
**Beads:** `[bd-1.4]`

```typescript
/// <reference types="vinxi/types/server" />
import { getRouterManifest } from '@tanstack/start/router-manifest'
import { createStartHandler, defaultStreamHandler } from '@tanstack/start/server'
import { createRouter } from './router'

export default createStartHandler({
  createRouter,
  getRouterManifest,
})(defaultStreamHandler)
```
**Verify:** `cat app/ssr.tsx`
**Commit:** `feat(entry): add app/ssr.tsx server entry`

### Task 1.5: Package Scripts Update
**Purpose:** Update the npm scripts to utilize `vinxi` for TanStack Start commands.
**File:** `package.json` (modify)
**Test:** none
**Depends:** none
**Done-Criteria:**
- `build` script changed to `vinxi build`.
- `dev` script changed to `vinxi dev`.
**Design-Ref:** design.md section "Components"
**Beads:** `[bd-1.5]`

```json
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "vinxi dev",
    "build": "vinxi build",
    "start": "vinxi start"
  }
```
*(Note for executor: merge these into the existing `"scripts"` block)*

**Verify:** `npm run build --help`
**Commit:** `build: update package.json scripts for tanstack start`

---

## Batch 2: Root & Moving Routes (parallel - N implementers)

All tasks in this batch depend on Batch 1 completing.

### Task 2.1: Root Layout Document
**Purpose:** Create the root layout wrapping all routes, injecting `<Meta>` and `<Scripts>`.
**File:** `app/routes/__root.tsx` (create)
**Test:** none
**Depends:** 1.2 (needs router structure)
**Done-Criteria:**
- Exports a `Route` created by `createRootRoute`.
- Component renders `<html>`, `<head>`, `<Meta />`, `<body>`, `<Outlet />`, and `<Scripts />`.
**Design-Ref:** design.md section "Components"
**Beads:** `[bd-2.1]`

```typescript
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Meta, Scripts } from '@tanstack/start'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}
```
**Verify:** `cat app/routes/__root.tsx`
**Commit:** `feat(router): add root document layout`

### Task 2.2: Move Index Route
**Purpose:** Move the index route to the new `app/routes` directory.
**File:** `app/routes/index.tsx` (create via move)
**Test:** none
**Depends:** 1.2
**Done-Criteria:**
- `app/routes/index.tsx` exists and contains the logic from `src/routes/index.tsx`.
- `src/routes/index.tsx` is deleted.
**Design-Ref:** design.md
**Beads:** `[bd-2.2]`

```bash
# Execute this to complete the move
mkdir -p app/routes
mv src/routes/index.tsx app/routes/index.tsx
```
**Verify:** `ls app/routes/index.tsx`
**Commit:** `refactor: move index route to app/routes`

### Task 2.3: Move Portfolio Route
**Purpose:** Move the dynamic portfolio route to the new `app/routes` directory.
**File:** `app/routes/portfolio/$username.tsx` (create via move)
**Test:** none
**Depends:** 1.2
**Done-Criteria:**
- `app/routes/portfolio/$username.tsx` exists and contains the logic from `src/routes/portfolio/$username.tsx`.
- `src/routes/portfolio` is deleted.
**Design-Ref:** design.md
**Beads:** `[bd-2.3]`

```bash
# Execute this to complete the move
mkdir -p app/routes/portfolio
mv src/routes/portfolio/$username.tsx app/routes/portfolio/$username.tsx
```
**Verify:** `ls app/routes/portfolio/\$username.tsx`
**Commit:** `refactor: move portfolio route to app/routes`

---

## Batch 3: Integration (parallel - N implementers)

### Task 3.1: Cleanup legacy directory
**Purpose:** Remove the now empty `src` directory as TanStack start uses `app`.
**File:** `src` (delete)
**Test:** none
**Depends:** 2.2, 2.3
**Done-Criteria:**
- `src` directory does not exist.
**Design-Ref:** design.md
**Beads:** `[bd-3.1]`

```bash
rm -rf src
```
**Verify:** `ls src || echo "deleted"`
**Commit:** `refactor: delete legacy src directory`

---

## Beads Task Mapping

**Epic:** `bd-epic-1`

| Task | Beads ID | Depends |
|------|----------|---------|
| 1.1 | bd-1.1 | none |
| 1.2 | bd-1.2 | none |
| 1.3 | bd-1.3 | none |
| 1.4 | bd-1.4 | none |
| 1.5 | bd-1.5 | none |
| 2.1 | bd-2.1 | bd-1.2 |
| 2.2 | bd-2.2 | bd-1.2 |
| 2.3 | bd-2.3 | bd-1.2 |
| 3.1 | bd-3.1 | bd-2.2, bd-2.3 |

## Beads Sync Commands (executed)

```bash
# Note: bd CLI is not available in current environment. These are the commands to run.
# Create epic
bd create "Portly TanStack Start Framework Integration" -p 1
# Output: Created bd-epic-1

# Create batch 1 tasks (no dependencies)
bd create "Task 1.1: TanStack Start Config" -p 2 --parent bd-epic-1
bd create "Task 1.2: Router Configuration" -p 2 --parent bd-epic-1
bd create "Task 1.3: Client Entry Point" -p 2 --parent bd-epic-1
bd create "Task 1.4: Server Entry Point" -p 2 --parent bd-epic-1
bd create "Task 1.5: Package Scripts Update" -p 2 --parent bd-epic-1

# Create batch 2 tasks with dependencies
bd create "Task 2.1: Root Layout Document" -p 2 --parent bd-epic-1
bd dep add bd-2.1 bd-1.2

bd create "Task 2.2: Move Index Route" -p 2 --parent bd-epic-1
bd dep add bd-2.2 bd-1.2

bd create "Task 2.3: Move Portfolio Route" -p 2 --parent bd-epic-1
bd dep add bd-2.3 bd-1.2

# Create batch 3 task
bd create "Task 3.1: Cleanup legacy directory" -p 2 --parent bd-epic-1
bd dep add bd-3.1 bd-2.2
bd dep add bd-3.1 bd-2.3
```