# Foodie

A bilingual Swedish/English food explorer and device-local recipe calculator, built with React, TypeScript and Vite. Nutrition comes from the Swedish Food Agency (Livsmedelsverket), attributed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Foodie normalizes and scales the source records; it does not model cooking losses.

Food details explain protein/fibre thresholds. The nutrient explorer ranks up to 100 foods for ten nutrients per 100 g or per 100 kcal. Six bilingual starter recipes can be previewed and copied into the local recipe library with instructions. See the [discovery feature plan and remaining work](docs/NUTRIENT-DISCOVERY-PLAN.md).

## Project documentation

Agents should start with [AGENTS.md](AGENTS.md), then the [implemented architecture](docs/ARCHITECTURE.md) and [development guide](docs/DEVELOPMENT.md). [PRODUCT.md](PRODUCT.md) records product requirements; [DESIGN.md](DESIGN.md) records the visual system. [API research](docs/API-RESEARCH.md) and [release verification](docs/VERIFICATION.md) supply dated evidence. The [original plan](PLAN.md) and [build handoff](docs/BUILD-HANDOFF.md) are delivery history, not a current task backlog.

## Run


```sh
npm ci
npm run dev
npm test
npm run data:validate
npm run build
npm run preview
```

Normal builds use the checked-in snapshot in `public/data/` and require no upstream API connection. The interface shows the snapshot date. Search uses both languages locally; details load individually. Hash routes support static hosting.

## Refresh source data

```sh
npm run data:sync
npm run data:validate
# Periodically verify every source row, including unchanged versions:
npm run data:sync -- --full
```

The sync paginates both catalogues, joins stable food IDs, uses four bounded workers with retries/backoff, preserves source qualifiers and separates nutrients by EuroFIR code, unit and basis. Null matrix metadata uses the API's documented 100 g edible-food default and is marked in each record. Explicit alternative bases are retained but not scaled as food-mass nutrients. A cache reuses unchanged source versions; the scheduled refresh uses full verification. A manifest is published only after all records validate. Failed refreshes must not be committed. The data Action proposes a PR rather than changing deployment directly.

Recipes use IndexedDB on the current device and retain their ingredient nutrient snapshot. JSON imports are validated before writing, reject unsupported versions and files above 5 MB, and offer explicit merge/copy/replace modes. Merge refuses ID collisions; replacement writes a local backup first and fails safely if that backup cannot be stored. Browser storage can be cleared by the browser or user: export backups for records you wish to retain. No accounts or cross-device synchronization are included.

## Hosting

`.github/workflows/deploy.yml` validates, builds and deploys to GitHub Pages. The custom domain is `https://foodie.tengmo.com`, recorded in `public/CNAME`; the production base is `/`. The workflow has a manual trigger. To host at a repository subpath instead, build with `npm run build -- --base=/foodie/` and use the matching preview base. Successful local checks do not establish that a deployment has finished.

## Calculation rules

Source energy is displayed independently in kcal and kJ. Quantity scaling uses edible grams / 100 without intermediate rounding. Recipe totals, per-serving and per-100-g estimates retain incomplete coverage. A measured final weight changes only the per-100-g denominator. The macro chart includes protein, available carbohydrate and total fat by weight, excluding water, fibre, alcohol and other components; it is unavailable when a macro is missing.

Data refresh retains the current snapshot and one previous validated snapshot (about two months with monthly refreshes). Cleanup only removes recognized snapshot directories with a verified completion manifest, after the new manifest is published. Very old open tabs may need to reload to use the current dataset; saved recipes retain their own ingredient nutrient snapshots.

## App updates

Each build emits `version.json` and embeds the same version in the client. The app checks at startup, when brought to the foreground or back online, and every five minutes while visible. Automatic checks are throttled; Settings also provides a manual check. A different deployed version produces a Swedish/English update prompt. Reload happens only after the user chooses Update, retaining the URL and saved recipes. Pending or failed recipe writes and unfinished ingredient fields block updating. No service worker or offline-cache installation is required.

The monthly food-data refresh is separate: it opens a validated snapshot pull request. Merging that PR deploys a new app/data build and existing tabs can then use the update prompt.
