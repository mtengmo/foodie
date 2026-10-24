# Release verification — 2026-10-24

Foodie was built with Sol and Luna for `https://foodie.tengmo.com`. The implementation includes bilingual food lookup, responsive nutrient views, quantity scaling, accessible macro charts, device-local recipes, JSON backup/restore, themes and explicit app-update prompts.

## Checks completed locally

- TypeScript and production Vite build passed, with root asset paths and `public/CNAME` copied into the output.
- All 16 domain/data/update tests passed.
- All 22 browser scenarios were exercised in Chromium and WebKit. The initial complete run passed 19 and identified three CSS failures; targeted reruns passed all corrected cases, plus new computed chart-width and dark-mobile contrast assertions.
- Automated WCAG checks passed on light food detail, dark settings, dark forest settings, dark mobile food detail, and mobile recipe controls in both engines.
- Verified source kcal/kJ values independently, decimal gram quantities, recipe arithmetic, reload persistence, bilingual search, favourites, missing-food errors, malformed imports, JSON round trips, storage denial, result pagination, keyboard chart selection, theme changes and 320px/390px layouts.
- Update tests confirmed that a different deployed version prompts without automatic reload, explicit reload preserves the route, and failed recipe saves block updating.
- Data validation passed for 2,606 foods in each language and 61 nutrient identities, with index/dictionary checksums. Search index: 83,382 bytes gzip. Source-qualified details load per food rather than at startup.
- Production JavaScript: about 85 KB gzip; CSS: about 5 KB gzip. Fraunces fonts are self-hosted. These are bundle measurements, not field Core Web Vitals claims.

## Visual review

The independent finish reviewer returned **ship** for the reviewed findings after corrections to duplicate ingredient controls, result reachability, mobile form layout, macro units/selection, dark link contrast and update banner styling. Final evidence is in `.impeccable/review/`; the implemented system is recorded in DESIGN.md and `.impeccable/design.json`.

## Deployment and ongoing updates

The GitHub Actions deployment runs dataset validation, domain tests, the production build and the complete Chromium/WebKit suite before publishing. Pages is configured for `foodie.tengmo.com`; DNS points to `mtengmo.github.io`, its HTTPS certificate is approved, and HTTPS enforcement is enabled. Deployment success is checked after pushing; local checks alone do not establish publication.

Every app build emits a unique `version.json`. Open tabs check for a different deployment at startup, foreground/online events and at five-minute intervals, with a manual check in Settings. Reload is explicit and guarded against pending/failed recipe writes and unfinished fields. Food-data refresh is separate: a monthly/manual Action proposes a validated snapshot PR, whose merge deploys the update.

## Limits

Browser checks used desktop engines and responsive viewports, not physical phones. Recipes remain on the current browser/device unless exported. Calculations sum edible ingredient weights and do not model cooking losses. External recipe discovery, accounts and guaranteed offline operation are outside this release.
