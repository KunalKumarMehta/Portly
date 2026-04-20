---
date: 2026-04-21
topic: "Portly TanStack Start Framework Integration"
status: validated
---

## Problem Statement
The initial implementation provided component logic but lacked the actual TanStack Start (Vinxi/Vite) framework boilerplate, entry points, and build configuration, resulting in a placeholder deployment.

## Approach
Integrate the official TanStack Start boilerplate, configure the file-based router, establish client/server entry points, and update the build script to compile the application for Netlify.

## Architecture
- **Bundler**: Vite via `@tanstack/start`.
- **Router**: `@tanstack/react-router` with file-based routing.
- **Entry Points**: `app/client.tsx` (browser) and `app/ssr.tsx` (server).

## Components
- **`app/router.tsx`**: Creates the router instance.
- **`app/routes/__root.tsx`**: Root layout document including HTML, Meta, Scripts.
- **`app.config.ts`**: TanStack Start config.
- **`package.json`**: Update build script to `tanstack-start build` (or `vinxi build`).

## Data Flow
Vite/Vinxi builds `.output/public` and `.output/server` → Netlify serves static assets from `.output/public` and routes SSR requests to Netlify Edge Functions.

## Next Steps
Planner will map out the boilerplate file creation and build script updates. Executor will implement them.
