---
name: onboard
description: 'Refresh the Beside Pet web onboarding and command reference from current repository sources. Trigger: "/onboard", "온보딩 문서 최신화", "CLI 목록 갱신".'
---

# Keep web onboarding current

Use this skill when a newcomer needs an accurate entry point or the user asks to refresh onboarding. The deliverable is the smallest necessary update to `README.md`, `docs/cli-reference.md`, and the relevant architecture pages.

1. Read `git status --short` and preserve unrelated changes. Read `AGENTS.md`, `README.md`, `docs/cli-reference.md`, `package.json`, `next.config.ts`, and relevant pages in `docs/`. Use `app/`, `features/`, `lib/api/`, tests, and workflows to verify behavior; use `pnpm docs:search` to find the reason for a non-obvious decision.
2. Compare every `package.json` script with the CLI reference. Keep the invocation, purpose, and whether it changes files or external state accurate. Record a direct CLI only if the repository actually uses it. Confirm the API connection and local port from current configuration; do not assume that the API repository's setup commands belong here.
3. Update only the pages whose claims changed. `AGENTS.md` routes agents, `README.md` introduces the product, `docs/cli-reference.md` lists commands, and architecture pages explain design. Link to the owning source instead of repeating whole rules or histories. Keep server secrets and pet conversation data out of the client guide.
4. Verify the command list against `package.json`, changed local links against existing files, and changed Markdown for obvious formatting errors. Run `pnpm docs:check` for document metadata. Documentation work alone does not require a production test suite.
5. Report the updated pages, the source of each substantive correction, and anything still unverified.

A command listing is not permission to run it. A `main` push deploys automatically; follow `AGENTS.md` before any external change.
