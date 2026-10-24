# Agent development guide

Start with [AGENTS.md](../AGENTS.md) and the [implemented architecture](ARCHITECTURE.md). This guide describes how to change the existing app. It is not a task list for rebuilding the first release.

## Local setup

Use Node 22 as the CI baseline and the npm lockfile.

```sh
npm ci
npm run dev
```

Use the URL printed by Vite. For the production preview used by Playwright:

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort --base=/
```

Normal setup/build does not need an API key or an upstream food download. If a preview already runs, verify its base URL and built output before reusing it. A stale `/foodie/` preview is not the same as the current root-domain deployment.

## Where to make a change

| Task | Start here | Preserve/check |
| --- | --- | --- |
| Search behavior | `src/domain/index.ts`, search UI in `src/App.tsx` | Both languages, stable IDs, relevance, true result counts and pagination |
| Nutrient calculation/chart | Domain functions/types, then App chart UI | Units/bases, missing vs zero, incomplete recipes, source energy, text alternatives |
| Nutrient highlights/rankings | `src/domain/discovery.ts`, `src/data/discovery.ts`, `scripts/discovery-rankings.mjs` | Exact thresholds/identities, snapshot match, stable ties, coverage and lazy transfer |
| Starter recipes | `src/data/starter-recipes.ts`, recipe UI/storage | Edible preparation state, bilingual instructions, fresh IDs on each copy, old JSON compatibility |
| New screen or component | `src/App.tsx`, messages, global styles | Hash navigation, both languages/themes, mobile and keyboard operation |
| Recipe editing/persistence | `src/storage/recipes.ts`, recipe orchestration in App | Optimistic ordering, failed-save feedback, import validation, update guards |
| Dataset changes | `scripts/sync-data.mjs`, validator and retention script | Full validation before publication, ID/language joins, source attribution |
| Version updates | `src/update/`, Vite version plugin, UI integration | One build identity, explicit reload, pending/failed-write protection |
| Hosting | `vite.config.ts`, `public/CNAME`, deployment workflow | Root base, custom domain, static deep links and live assets |

When splitting App.tsx, extract one cohesive unit at a time and preserve existing routes/state behavior. Domain types remain shared; do not create a second calculation implementation in a component.

## Verification by scope

| Change | Minimum relevant checks |
| --- | --- |
| Documentation only | Relative links, paths, commands and consistency with source; `git diff --check` |
| Domain/calculation or storage contracts | Typecheck, relevant unit tests, production build; affected recipe/browser flows |
| UI/translation/theme | Typecheck/build, affected browser scenarios; desktop and mobile inspection; relevant axe checks |
| Ingestion or snapshot | Data validation, domain/fixture and retention tests, build; inspect counts/manifest/provenance |
| Update/reload safety | Update unit tests plus browser update and failed-save scenarios |
| Routing/base/deployment | Production build and browser suite, followed by live smoke verification after deployment |

Commands currently provided:

```sh
npm run typecheck
npm test
npm run data:validate
npm run build
npx playwright install chromium webkit
npm run test:e2e
```

Linux CI installs browser system dependencies with `npx playwright install --with-deps chromium webkit`. There is currently no `lint` script; do not report a lint pass that did not run. Playwright expects a built production app, starts a root-base preview on port 4173, and runs one worker across Chromium/WebKit projects.

For a focused change, run the relevant tests first:

```sh
npx vitest run tests/domain.test.ts
npx playwright test e2e/updates.spec.ts
npx playwright test e2e/foodie.spec.ts --grep "phone food"
```

The release browser suite covers food quantities, bilingual search, favourites, recipe arithmetic and persistence, JSON backup/import, storage denial, full result reachability, chart keyboard selection, system appearance, update prompts and failed-save guards. Accessibility checks cover light/dark and forest themes, including mobile views.

Check 320px and 390px widths, not just a large phone. At 360px and below the header deliberately stacks brand/navigation to avoid system-font-dependent overflow. Wait for fonts and responsive state to settle before measuring or capturing. Keep real values and units together; test long English and Swedish labels.

`node scripts/capture-ui.mjs` creates review screenshots using real source foods and a synthetic recipe in a fresh browser context. `node scripts/capture-discovery.mjs` captures the explorer, food highlights and starter preview/copy in Swedish/light and English/dark at desktop and phone widths, including 320px. Their default preview URL is `http://127.0.0.1:4173/`; `FOODIE_REVIEW_URL` overrides it. Finish the production build before launching browser tests or capture scripts. Do not overwrite accepted visual evidence casually or treat a screenshot as proof of arithmetic correctness.

## Changes to persistent formats

Before changing Recipe, FoodDetail, the import envelope, IndexedDB version or preference keys:

1. Identify which existing saved records/exports the change affects.
2. Preserve old fixtures and specify migration or safe rejection behavior.
3. Validate before destructive writes; keep replacement-import backup semantics.
4. Verify save/reload, import/export round trip, ID collisions, invalid input and failed storage.
5. Update ARCHITECTURE.md and any affected user-facing explanation.

Do not use storage clearing as a migration. Do not silently replace stored ingredient snapshots with current API data. New storage operations should register pending writes and preserve failure guards before any app-update reload.

## Refreshing nutrition data

Only perform a full sync when the task calls for new data or ingestion verification:

```sh
npm run data:sync
npm run data:validate
# Recheck unchanged source records too:
npm run data:sync -- --full
```

Review changed IDs, language joins, dictionary identities, checksums, source dates and snapshot size. Treat `.data-cache/` as an ignored optimization, never the authoritative published dataset. Do not commit partial output after a failed sync. Retention must remain restricted to validated snapshot folders beneath `public/data/`.

The refresh Action runs monthly and can be dispatched manually; its output is a PR, not an automatic merge. App release updates and nutrition-data updates are separate mechanisms.

## Working with multiple agents

Delegate when the user requests it or applicable instructions call for it. A useful split is foundation/domain/data/storage work for Sol and interface/translation/theme work for Luna, with one integration owner. This is a division of work, not a restriction on what either model can do.

Agree types and component inputs before dependent work starts. Assign one writer to shared files, especially App.tsx, global styles, package/lock files, Vite config and domain types. Use isolated worktrees when needed and integrate sequentially. Each handoff should state files/contracts changed, checks actually run and remaining dependencies.

## Release and documentation maintenance

Respect the user's requested commit/push/deploy scope. A push to main triggers the full release workflow. Watch its conclusion; if it fails, inspect the failed step and fix the cause rather than disabling the check. Failure artifacts retain browser reports/traces for seven days.

After a successful deployment, check `https://foodie.tengmo.com` in a browser: a direct hash food link, loaded data/asset responses, quantity scaling, language switching and the live `version.json`. Confirm that displayed app version and deployed manifest agree. Distinguish local checks, CI checks and live checks in the completion report.

Keep documentation responsibilities separate:

- PRODUCT.md: confirmed product intent and constraints.
- DESIGN.md and `.impeccable/design.json`: implemented visual system.
- ARCHITECTURE.md: current modules, persistent contracts, data flows and durable technical decisions.
- DEVELOPMENT.md and AGENTS.md: working instructions and relevant checks.
- API-RESEARCH.md: dated source/provider findings; reverify changing external facts for new decisions.
- PLAN.md and BUILD-HANDOFF.md: original delivery context and future proposals, clearly distinguished from shipped features.
- VERIFICATION.md: dated evidence; append/update it for a meaningful release rather than pretending an old result applies to new code.
