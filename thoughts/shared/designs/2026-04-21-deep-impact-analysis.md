---
date: 2026-04-21
topic: "Deep Impact Analysis with GitHub GraphQL"
status: validated
---

## Problem Statement
Current analysis is shallow (stars/repos only). We need to analyze actual developer behavior: contribution frequency, pull request activity, and impact on repositories they don't own (OSS contributions).

## Constraints
- GitHub GraphQL API (v4) required.
- Requires personal access token (fallback to public if missing, but results limited).
- Client-side execution of GraphQL queries.

## Approach: Deep Analysis Engine
Shift from "Repository Inventory" to "Contribution Forensics". Use the `contributionsCollection` to measure:
1. **Activity Density:** Commit streaks and frequency via `contributionCalendar`.
2. **External Impact:** Pull requests made to non-owned repositories.
3. **Reviewer Quality:** Number of PR reviews given, indicating seniority/trust.

## Components
1. **GraphQL Client (`app/server/github.ts`)**: Unified function to execute GraphQL queries.
2. **Deep Analyzer (`app/server/analyzer.ts`)**: 
   - `calculateImpactScore()`: Weighted sum of stars from contributed repos.
   - `extractWorkPatterns()`: Identifies if the user is a "lone wolf" or "collaborator".
3. **Enhanced UI**:
   - `ContributionHeatmap`: Visualizing activity over time.
   - `ImpactMetrics`: Displaying "External Contributions" and "Reviews Given".

## Data Flow
1. Fetch `contributionYears` to determine career span.
2. Fetch `contributionsCollection` for active years.
3. Pass aggregate data to analyzer.
4. Render "Professional Impact Portfolio".

## Testing Strategy
- Mock complex GraphQL responses for various user profiles (Maintainer, Student, Enterprise dev).
- Unit test weighting logic for the `ImpactScore`.