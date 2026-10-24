# Sol and Luna build handoff

Read PRODUCT.md, PLAN.md and docs/API-RESEARCH.md before implementation. The user authorized building both stages with Sol and Luna, and selected Nordic Cookbook on the design board. This task allocation is being executed. Use the approved plan and any later user corrections as authority; consult the final verification report for completed work.

Implementation status: S01–S08 and L01–L05 are complete. The user additionally requested deployment-version updates, implemented with guarded explicit reload and Settings controls. See VERIFICATION.md for checks and scope; GitHub Actions performs the full release suite before deployment.

## Ownership and integration

Sol owns scaffolding, shared contracts, API ingestion, normalization, search and calculation logic, storage, routing and final integration. Luna owns bounded UI features, translations, themes and responsive/accessibility refinement against Sol's stable contracts. Both can contribute tests within their owned areas.

Sol creates the shared interfaces first. Luna must not independently invent food/nutrient IDs, quantity math, storage formats, dependencies or API adapters. Sol must not replace an approved visual direction during integration. Either agent records a contract change and coordinates dependents before changing it.

Shared files (package manifest/lockfile, router, domain types, global tokens, i18n registry) have one designated writer per task. Use isolated branches/worktrees if working concurrently. Integration is sequential. Request no parallel work until dependencies below exist.

## Contract checklist before UI work

Create typed contracts with fixtures for:

- `Locale`: `sv | en`; `ThemeMode`: `light | dark | system`; accent palette separately.
- `FoodSummary`: numeric source ID, both localized names/fallback status, source version, analyzed/calculated kind, path to versioned detail.
- `NutrientDefinition`: canonical key, EuroFIR code, normalized unit, basis, localized label, display group/order, preserved source metadata.
- `NutrientValue`: definition key, number or null, known/unknown status, original source qualifiers. Never coerce missing to zero.
- `FoodDetail`: summary, nutrient values, source version, snapshot ID and provenance.
- `DatasetManifest`: schema version, snapshot ID, fetched timestamp, source URL/license, per-locale counts, data file references/checksums.
- `FoodRepository`: load index, find food by ID, get current manifest; deduplicate in-flight requests, expose explicit loading/not-found/error outcomes. Food detail ID must agree with the requested ID.
- `searchFoods`: deterministic local search over both names; stable IDs and relevance results.
- `scaleNutrients` and `calculateRecipe`: pure functions returning values plus completeness; no display rounding or localization inside them.
- `Recipe`: schema version, ID, title, servings, ingredient IDs/grams, ingredient nutrient snapshots, created/updated timestamps, optional measured final weight and source references.
- `RecipeStore`: asynchronous list/get/save/delete, version migration and surfaced errors. Export/import validates through the same recipe schema.

Keep these as ordinary modules. Do not create a plugin architecture or abstract service framework for one data source.

## Task queue

| ID | Owner | Dependencies | Deliverable | Done when |
| --- | --- | --- | --- | --- |
| S01 | Sol | Plan review | Vite/React/strict TS scaffold, scripts, hash routes, contract types and fixtures | Build/typecheck/test scripts run; preview works under `/foodie/`; no placeholder product claims |
| S02 | Sol | S01 | API sync, normalization, static snapshot and validation | Complete bilingual catalogue verified, energy units distinct, no partial publish, size report recorded |
| S03 | Sol | S01 + S02 | Static repository, local search, nutrient scaling | Both-language queries return stable IDs; meaningful unit tests cover scale, missing values and search ranking |
| L01 | Luna | S01 + visual choice | App shell, semantic theme tokens, settings and sv/en messages | Light/dark/system and accents work at 320–1440 px; state survives switches; contrast checked |
| L02 | Luna | S03 + L01 | Search list, food detail, quantity form, chart and nutrient table | Actual static data used; no duplicated math; keyboard/mobile/error states complete |
| S04 | Sol | S03 | Preferences/favourites, share links and integration | Invalid/removed IDs handled; query/scroll preserved; denied storage does not break lookup |
| L03 | Luna | L02 + S04 | Bilingual/accessibility/responsive pass | Swedish/English text parity, long names, zoom, chart alternatives and touch interaction verified |
| S05 | Sol | S02 + L03 | CI, Pages deployment workflow, release validation | Base paths and deep-link reload tested; build output and performance budgets recorded; stage-one acceptance passes |
| S06 | Sol | Stage one accepted | Recipe calculation domain, IndexedDB store, migrations | Ingredient totals/servings/weights/incomplete data tests pass; save failure and update semantics defined |
| L04 | Luna | S06 | Recipe library/editor using existing search | Add/edit/remove ingredients, quantity errors, summary modes and saved-state feedback work on phone and desktop |
| S07 | Sol | S06 + L04 | Validated JSON export/import and data-refresh comparison | Round trip preserves recipe; malformed imports leave storage unchanged; collision choices are explicit |
| L05 | Luna | S07 | Recipe interaction and localization finish | Long recipes, keyboard/zoom, empty/error and incomplete-nutrient states verified |
| S08 | Sol | L05 | Stage-two integration and release | Full recipe flow passes with persistence, reload, backup and restore |

S02/S03 and L01 can proceed independently after S01 and visual approval. L02 waits for the data contract and working domain modules. L04 waits for recipe semantics and storage. External recipe APIs are a separate future ticket, not an implicit part of any task above.

## Meaningful test cases

Use clearly labelled synthetic fixtures for arithmetic; recorded upstream fixtures check adapters. Avoid network-dependent unit tests.

- 150 g of a synthetic food with 10 g protein/100 g yields 15 g; 50 g yields 5 g; source record stays unchanged.
- Synthetic recipe: A = 10 g protein/100 g at 150 g; B = 20 g/100 g at 50 g. Total = 25 g; two servings = 12.5 g each; mixture 200 g = 12.5 g/100 g. Final measured weight 160 g yields 15.625 g/100 g while total remains 25 g. These are arithmetic tests, not nutrition claims.
- Same `ENERC` code in kcal and kJ creates two records, neither overwrites the other. Localized abbreviations and differing row order must not affect joins.
- Zero, absent nutrient, null matrix metadata, explicit non-food basis, duplicate identities, non-finite values and unknown nutrient codes have explicit outcomes.
- Donut includes only PROT/CHO/FAT; no sugar/saturated-fat double count; all-zero and missing-macro states work; serving changes retain proportions.
- Swedish `12,5` and English `12.5` inputs parse consistently; partial text editing, negatives and ambiguous separators cannot create NaN output.
- Search works for accented Swedish names, alternate-language names, no matches, and raw/cooked variants. “No matches” is distinct from failed index loading.
- Switching food quickly never shows stale nutrient details for a different selected ID.
- Under a simulated failing upstream API, an ordinary app build still uses its checked-in snapshot. A failed refresh never replaces the valid snapshot.
- Imported JSON round-trips, rejects unsupported schema and oversized files, handles ID collision, and never erases existing recipes on validation failure.
- End-to-end: search → detail → 150 g → language/theme change → reload → back; later create recipe → save → reload → export → import as copy.
- GitHub Pages: non-root base URL, pasted hash deep link, asset/data paths, reload, unavailable food, stale-tab recovery; no private key in built JS.

Before each release, run typecheck, lint, relevant domain/component tests, production build, and targeted Playwright flows. Inspect mobile and desktop together, fix material issues in a batch, and confirm once. Record results and any gaps in the handoff; do not claim success from a build alone.

## Copyable prompts

### Sol: stage one foundation

> Read PRODUCT.md, PLAN.md, docs/API-RESEARCH.md and docs/BUILD-HANDOFF.md. Implement S01–S03 for Foodie: React/TypeScript/Vite, static Livsmedelsverket data, bilingual local search and pure nutrient calculations. Follow verified API units and IDs; download/validate a complete snapshot with bounded requests. Do not add a running backend or a recipe API. Define shared contracts and fixtures before UI integration. Keep application builds independent of upstream availability. Run meaningful tests, typecheck and build; report data coverage, snapshot size, remaining uncertainties, and the files/contracts Luna can use. Treat unresolved visual direction as independent of data work.

### Luna: stage one interface

> Read PRODUCT.md, PLAN.md and docs/BUILD-HANDOFF.md, plus the selected visual direction and Sol's implemented contracts. Implement L01–L03 when their dependencies are ready: responsive food search/detail, labelled macro donut, quantity input, Swedish/English strings and themed UI. Consume existing repository and calculation functions; do not invent nutrition values or alter domain/storage contracts. Keep raw/cooked names visible and handle loading, empty, missing and failure states. Verify keyboard use, contrast, mobile layout and long translated content. Report checks and integration requirements to Sol.

### Sol: stage one integration

> Complete S04–S05 against the integrated stage-one app. Verify quantity math, bilingual search, storage failure, stale request protection, themes, attribution, performance budgets and GitHub Pages base paths. Prepare the Actions workflow and exact deployment steps. Distinguish a locally tested production build from an actual deployed verification. Resolve integration failures and leave stage two unimplemented until stage one is accepted.

### Sol and Luna: stage two

> After stage-one acceptance, use S06–S08 and L04–L05 from docs/BUILD-HANDOFF.md. Sol owns calculation/persistence/import contracts; Luna owns recipe UI on those contracts. Use grams, device-local saving and JSON export/import. Explicitly represent missing nutrients and ingredient-mixture estimates. Do not silently apply cooking corrections or introduce an external recipe provider. Verify persistence and export/import before claiming completion.

## Completion report expected from each builder

State task IDs completed, user-visible behaviour, changed contracts/files, tests actually run, checks not run, known limitations and the next unblocked task. Include dataset version for data work and screenshots for UI work. Update this queue's status when work is done; do not mark proposed work complete in advance.
