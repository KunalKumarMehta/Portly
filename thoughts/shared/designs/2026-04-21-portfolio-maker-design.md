---
date: 2026-04-21
topic: "TanStack Start GitHub Portfolio Maker"
status: validated
---

## Problem Statement
需TanStack Start網，析GitHub建履歷。佈署Netlify。

## Constraints
GitHub API限速。SSR/Edge兼容。

## Approach
用TanStack Start + GitHub GraphQL API。GraphQL取深層貢獻，履歷方出眾。不用REST（太淺）。

## Architecture
- 框架：TanStack Start (SSR)
- 樣式：Tailwind CSS
- 佈署：Netlify

## Components
- `Auth`：GitHub OAuth登入
- `Analyzer`：析Repo與語言
- `PortfolioGen`：生履歷視圖

## Data Flow
登入→獲Token→查GraphQL→緩存數據→渲履歷。

## Error Handling
API限速→緩存+退避。Token失效→重登。

## Testing Strategy
Mock GitHub API。驗證組件渲染。

## Open Questions
無。