# Discovery extension design documentation

Checked 2026-10-24 against the current implementation and supplied review captures. This is an extension of **Nordic Cookbook**, not a new visual direction. Root `DESIGN.md` remains the normative token reference; `.impeccable/design.json` remains schema version 2. Neither requires new primitive values for this extension.

## Consistency result

The extension preserves the warm paper canvas, berry navigation/actions, botanical selection, Fraunces headings, system sans controls, fine row separators and quiet reading panels. New components consume existing theme variables. No new font, palette, shadow vocabulary, raster asset or icon system was introduced. The existing SVG gram-share chart retains its meaning; explanatory nutrient thresholds are separate.

This is a documentation consistency finding, not the independent finish-review verdict or fresh browser verification. The three targeted corrections are present in source and the refreshed recipe captures: the catalogue is collapsible, preview actions wrap on mobile, and preview/save transitions direct attention through scrolling and focus. The independent reviewer subsequently reported a ship verdict with all three fixes resolved. The coordinating agent also reported 34 browser scenarios passed (32 in the final full run plus two corrected-assertion reruns); those results were not rerun by this documentation check.

## Extension components

| Component | Implemented convention |
| --- | --- |
| Protein and fibre highlights | Two native `details` disclosures on a surface-2 layer, separated from nutrient rows by a fine rule. Bold summaries state the assessment in words. Expanded text supplies thresholds, computed basis, provenance and the EU source link. Two columns become one at 680px. Assessment remains per 100 g regardless of the portion input. |
| Nutrient explorer (`#/discover`) | A restrained page with a 1000px maximum width. A labelled native select and existing pressed-choice buttons select nutrient and basis. Controls stack at 680px. A semantic three-column table presents rank, linked food with metadata, and right-aligned tabular amounts with explicit comparison units. Coverage, source and exclusions are explained above the table. At 390px row padding and rank width tighten; names and units wrap. |
| Starter catalogue | Six original bilingual templates use separated editorial rows, secondary preview actions and the existing botanical active surface. A native `details` element controls the catalogue; its summary includes the template count. Mobile rows stack their content and action. This is published template content, visually distinct from the saved local library. |
| Starter preview | The existing reading-panel treatment contains ingredients, ordered instructions and per-serving estimates, with CC0 template and CC BY food-data attribution. Save a copy and Close preview stay in a dedicated wrapping action group; at 680px they share available width and wrap without squeezing the title. The preview remains visible on mobile despite the general detail-panel hiding rule. |
| Preview and editor attention | Opening a preview scrolls its section into view and focuses the title (`tabIndex=-1`). Saving a copy closes the preview, collapses the catalogue, and scrolls/focuses the saved recipe editor. Preview and saved-library anchors use a 96px scroll margin. Saved recipes also have a direct jump button that preserves the hash route and focuses the library heading. These behaviours are source-confirmed; still captures cannot prove focus movement. |
| Saved instructions | Ordered instructions sit above ingredients within the existing editor, separated with a fine rule and followed by the estimation/provenance note. Local-copy text is user-owned and does not change when the interface language changes. |
| Four-item navigation | The new Explore route uses the existing active navigation treatment and `aria-current`. At 360px the brand and full-width navigation occupy two rows with evenly spaced 44px links; the supported minimum remains 320px. Existing small-screen label wrapping and icon hiding are retained. |

## Evidence checked

Source and contracts: `PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/DEVELOPMENT.md`, `DESIGN.md`, `.impeccable/design.json`, `.impeccable/surfaces/src-app-tsx.md`, `src/App.tsx`, and `src/styles/global.css`. The Impeccable document reference was consulted to preserve canonical token ownership and distinguish an ordinary extension from a system regeneration. The sidecar parses as JSON and retains its existing seven primitive previews; no extension primitives were duplicated into it.

Visually inspected all eight supplied PNGs in this directory:

- `explorer-desktop.png`, `explorer-mobile.png`, `explorer-english-dark-320.png`: ranking hierarchy, comparison controls, units, theme continuity and narrow header.
- `broccoli-mobile.png`: threshold disclosures, provenance and continuity with the food detail/chart.
- Refreshed `starter-desktop.png`, `starter-mobile.png`, `starter-english-dark-320.png`, `saved-desktop.png`: catalogue, wrapping preview actions, separate saved library and editor instructions.

The explorer captures are unusually tall and their overview rendering is scaled down; source and recorded measurements support the narrow-layout assessment. `measurements.json` records eight captures at 1440×1000, 390×844 and 320×740 with no recorded overflow or browser errors. `measurements-recipes.json` supersedes its four recipe entries after the corrections, likewise recording no overflow or browser errors. These are supplied Chromium 156.0.8078.4 measurements, not a fresh run or evidence for other engines.

## Advisory drift retained

The incumbent stylesheet already uses more font sizes than the compact frontmatter hierarchy, including small metadata/legend sizes and several local serif heading sizes. It also contains a 14px import-review radius outside the named radius subset, and distinct header/dialog shadows alongside the shared panel shadow. These are pre-existing documentation/implementation granularity differences, not regressions introduced by discovery. The new starter heading size (1.28rem) is another local component adjustment close to the existing title role. No consolidation, contrast overhaul or unsolicited drift repair was performed.

No application edits, browser sessions, application tests, commits or deployment actions were made by this documentation check. Only this review document was written; root tokens and the sidecar were preserved.
