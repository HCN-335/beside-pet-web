---
name: implement-prd
description: 'Implement one approved Beside Pet web leaf PRD in an isolated worktree and open a PR. Trigger: "/implement-prd", "이 PRD 구현해", a GitHub issue URL.'
---

# Implement one PRD

1. Read the approved issue and its dependencies. Use a dedicated `feat/<issue>-<scope>` branch and worktree based on the approved base branch; do not add migration work to the existing harness PR by accident.
2. Work through the issue tasks in dependency order. Search related ADR/dev-log records, read owning rules, and use `/tdd` for production changes. Record actual verification results in the PR body and mark issue checkboxes only when their criteria are met.
3. Run focused tests while coding, then the affected repository quality commands. Preserve failing output and fix gates rather than bypassing them. Check that React states, API boundaries, and Next.js server rendering remain sound.
4. Commit and push the leaf branch, open a PR linked to the issue, and wait for CI. Leave a clear handoff: what changed, tested behavior, API/deployment impact, and review points. Stop for `/review-worktree`; do not merge here.

`main` pushes deploy to production. Implementation authority does not authorize that deployment.
