# Web command reference

Run these from the `beside-pet-web` root with Node.js 24 and pnpm 10.26.2. `package.json` is the source of truth for scripts. This index describes commands; it does not authorize a deployment.

| Command | Purpose and effect |
| --- | --- |
| `pnpm install` | Install locked dependencies; `postinstall` attempts `lefthook install`. |
| `pnpm dev` | Start the Next.js development server on port 3001. |
| `pnpm build` | Build the production web app. |
| `pnpm start` | Serve a production build on port 3001. |
| `pnpm lint` | Check repository files with Biome without writing fixes. |
| `pnpm format` | Format repository files with Biome; writes files. |
| `pnpm lint:fix` | Apply Biome fixes; writes files. |
| `pnpm typecheck` | Type-check and reject unused TypeScript locals and parameters. |
| `pnpm test` | Run the Vitest suite. Use `pnpm exec vitest run <path>` for one changed test file. |
| `pnpm guard` | Explain Polydeukes disciplines and validate documentation records. |
| `pnpm docs:search "term"` | Search indexed ADR and dev-log records. |
| `pnpm docs:list` | List indexed records. |
| `pnpm docs:show <id>` | Read one indexed record. |
| `pnpm docs:index` | Rebuild the gitignored `docs/docs.db` from tracked Markdown. |
| `pnpm docs:check` | Validate documentation records. |

`postinstall` is invoked by `pnpm install`; it is not a separate onboarding step. `pnpm exec pdks explain` displays the active and draft disciplines. See [AGENTS.md](../AGENTS.md) for task routing and [.claude/skills/](../.claude/skills/) for repeatable procedures.

## Local run

1. Start the Beside Pet API on port 3000 using its own [repository](https://github.com/HCN-335/beside-pet-api) instructions.
2. Run `pnpm install` and `pnpm dev` here. Open `http://localhost:3001`.

The browser communicates with the API through `lib/api/` and `lib/http/`. Keep the model API key on the server; the web repository must not contain it.

## Delivery

[quality.yml](../.github/workflows/quality.yml) checks a pull request. A push to `main` starts [deploy.yml](../.github/workflows/deploy.yml), which builds and deploys the web app. Keep changes on a review branch until deployment is approved.
