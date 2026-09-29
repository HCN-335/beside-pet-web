---
name: prd
description: 'Write a Beside Pet web feature PRD as a GitHub issue with acceptance and review gates. Trigger: "/prd", "PRD 작성".'
---

# PRD

The active PRD lives in a GitHub issue in `HCN-335/beside-pet-web`. Keep a local draft until the owner has reviewed its scope; then publish the approved text with `gh issue create --body-file`. Link cross-repository dependencies explicitly.

1. Read the affected code, `AGENTS.md`, relevant rules, and related records through `pnpm docs:search`. Preserve existing branch and user changes.
2. Draft the user outcome, present behavior, scope, exclusions, dependencies, implementation tasks, acceptance criteria, exact verification commands, and any human confirmation needed before merge or deployment. For API integration changes, include auth cookies, JSON/SSE behavior, React state, and Next.js server rendering.
3. Show the draft to the owner. After approval, create the GitHub issue. The issue checkboxes track task completion; CI and the PR are the mechanical verdict.
4. Hand one leaf issue to `/implement-prd`. Stable rationale belongs in an ADR; a completed issue is the history of the work, not the permanent architecture guide.
