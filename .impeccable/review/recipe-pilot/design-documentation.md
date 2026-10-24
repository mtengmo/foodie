# Recipe pilot design documentation

Checked 2026-10-24. This ordinary content extension preserves **Nordic Cookbook** and the existing preview/editor conventions. The catalogue now contains twelve bilingual recipes: nine original Foodie recipes and three identified Wikibooks adaptations. Requested originals include korvstroganoff with rice, entrecôte with roasted sweet potato, and a separate roasted sweet potato side.

## Conventions retained

- Existing catalogue rows, native disclosure/count, selected tint, reading panel, serif hierarchy, quantity rows and wrapping preview actions are reused. No CSS, visual tokens, fonts, shadows, imagery or sidecar primitives were added for this pilot.
- `RecipeAttribution` uses existing small supporting text and underlined links. Recipe-text licensing is a separate paragraph from nutrition-data attribution. Adaptations show the pinned source title, contributor credit and a localized change notice; original text links to CC0. Nutrition data links separately to Livsmedelsverket and CC BY 4.0.
- The same attribution component appears in preview and the saved editor. The saved copy retains its source, licence and adaptation notice; switching interface language does not translate user-owned copy text. Links open in a new tab with `rel="noreferrer"`.
- Attribution wraps naturally within the existing panel. Desktop keeps preview actions beside the title; mobile wraps or stacks the action group. At 320px the established two-row navigation remains. Ingredient notes identify preparation state and gram amounts; estimates and cooking-loss limitations remain explicit.

## Evidence checked

Read `PRODUCT.md`, `DESIGN.md`, `docs/RECIPE-SOURCES.md`, the current `src/data/starter-recipes.ts` and `RecipeAttribution` call sites/implementation in `src/App.tsx`. Applied the previously read Impeccable document reference: existing primitives stay owned by root frontmatter, and this content extension does not warrant regenerating the design system. Parsed `.impeccable/design.json`: schema version 2, seven existing component previews. Root design files were preserved.

Visually inspected the supplied captures in this directory:

| Capture | Scope observed |
| --- | --- |
| `korvstroganoff-desktop.png` | 1440px preview, twelve-recipe count, CC0/nutrition attribution separation, ingredient states, instructions and aligned per-serving nutrients. |
| `greek-salad-mobile.png` | 390px Swedish adaptation: source/licence links, contributor credit, change notice, wrapped actions and ingredient notes fit the existing reading panel. |
| `hummus-english-dark-320.png` | 320px English dark adaptation: stacked header/actions and readable wrapping of source credit, change notice, ingredient notes and nutrients. |

`measurements.json` records no horizontal overflow for the three captures at 1440×1000, 390×844 and 320×740. The coordinating agent reports 31 unit and 38 browser tests passing, and an independent ship verdict for the narrow readability scope. Those tests were not rerun here. Still captures do not independently prove link destinations, copy/export persistence or keyboard behaviour; the source inspection supports the documented conventions.

The previous advisory font-size/radius/shadow granularity differences remain outside this extension; no drift repair was made. This check wrote only this review document and performed no browser run, application test, commit or deployment. No new system tokens or root design-document changes are required.
