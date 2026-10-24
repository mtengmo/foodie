# Working on Foodie

Foodie is a React/TypeScript/Vite web app hosted at `https://foodie.tengmo.com` on GitHub Pages. It searches a static snapshot of Livsmedelsverket data and calculates device-local recipes. There is no running backend or service worker.

## Read first

1. [PRODUCT.md](PRODUCT.md) — users, scope and confirmed product requirements.
2. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — implemented modules, data flows and contracts.
3. [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) — change recipes, verification and deployment.
4. For interface work, [DESIGN.md](DESIGN.md) and the relevant brief under `.impeccable/surfaces/`.

Read [docs/API-RESEARCH.md](docs/API-RESEARCH.md) when changing ingestion or providers. [PLAN.md](PLAN.md) and [docs/BUILD-HANDOFF.md](docs/BUILD-HANDOFF.md) describe the original build; proposed file layouts and completed tasks there are not a current backlog. [docs/VERIFICATION.md](docs/VERIFICATION.md) records release evidence, not proof that later changes passed.

## Boundaries

- Keep nutrition/search calculations in `src/domain/`; reuse them from UI. Keep browser persistence in `src/storage/`, static-data access in `src/data/`, and deployment-version checks in `src/update/`.
- `src/App.tsx` currently contains routing, screens and recipe orchestration. Extract focused components as needed for the requested change; do not assume the feature folders proposed in PLAN.md already exist.
- The browser reads same-origin static JSON. Upstream API calls belong in `scripts/sync-data.mjs`, not search keystrokes or component effects.
- Treat nutrient identity as code + unit + measurement basis. `ENERC` kcal and kJ are separate values. Missing is not zero; source energy is not replaced by macro-derived estimates.
- Recipes retain ingredient nutrient snapshots. Updating food data requires the existing explicit comparison/apply flow. Never silently recalculate old recipes against a new dataset.
- Preserve IndexedDB data, JSON compatibility and update guards. Do not clear user storage to solve a migration or rendering bug.
- Translate user-facing changes in both Swedish and English. Preserve theme contrast, keyboard operation and the 320px stacked navigation.
- Use `import.meta.env.BASE_URL` for assets/data. Production uses `/` and `public/CNAME`; routes use hashes so pasted links work on static hosting.
- Keep API keys and other secrets out of client code and static files. No backend, account system, service worker or new external recipe provider is part of the existing architecture.

## Working and verification

Inspect the relevant implementation before editing. Keep changes scoped and update the affected architecture/product/design document when a durable decision changes. Distinguish actual behavior from proposed work.

Use `npm run typecheck`, `npm test`, `npm run build`, and relevant `npm run test:e2e` cases for application changes. Run `npm run data:validate` for snapshot/ingestion changes. See DEVELOPMENT.md for exact commands and the release matrix. Documentation-only changes need link/content checks, not a full browser run.

Do not run a full upstream data sync for ordinary UI or calculation work. Normal builds use the checked-in snapshot. Do not hand-edit generated nutrition values or commit `.data-cache/`, `dist/`, `node_modules/` or browser-test output.

If the user requests parallel agent work, agree shared contracts and file ownership first. Sol's foundation/domain and Luna's interface split remains useful; `App.tsx`, package/lock files, shared types and global styles must have one writer at a time. Do not start additional agents solely because the original project used them.

Finish with what changed, checks actually run, remaining limitations and commit/deployment status when relevant. A local build is not a verified deployment.
