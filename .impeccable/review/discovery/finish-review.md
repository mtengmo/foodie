# Nutrient discovery finish review

Date: 2026-10-24. Code-led extension of the existing Nordic Cookbook interface; no new visual world or approved comp.

The independent reviewer inspected eight full-page captures, current App.tsx/CSS, the product/design contract and craft floor. Initial disposition: fix. Three material issues were identified: selecting a starter left its preview off-screen, the catalogue buried existing recipe controls, and the mobile preview heading/actions were squeezed side by side.

One correction batch added preview heading focus/scroll, early recipe actions and a saved-recipes jump, a catalogue that collapses for existing recipes/after copying, and a stacked mobile preview header. The four recipe views were recaptured and independently reviewed. Final disposition: **ship** at the scope of the three listed findings, all scored resolved. The initially running browser checks subsequently passed.

## Verification

- TypeScript check and production build passed.
- 29 unit/domain/data-loader/recipe compatibility tests passed.
- All 34 Chromium/WebKit scenarios passed across the final full run and focused rerun. Two initial failures were from an assertion that incorrectly required the entire long preview to fit in one viewport; it now checks the focused heading below the sticky navigation. Both corrected cases passed.
- Automated accessibility checks cover food/settings themes, the explorer and mobile starter preview.
- Snapshot validation passed for 2,606 foods and 61 nutrient identities. Rankings cover ten identities; derived data is 60,956 bytes raw / 13,140 bytes gzip.
- Screenshots report no browser errors or horizontal overflow, including English/dark at 320px. Initial captures are recorded in measurements.json; the corrected recipe capture batch is recorded in measurements-recipes.json.
- The mechanical detector ran once. Its output contained only advisory documented-system drift (mainly existing small typography steps, radius/shadow values, plus compact navigation/highlight text). No new palette, font family or visual-world replacement was introduced.

This is local verification evidence. The GitHub Actions run and live deployment are checked separately after push.

A subsequent routing check found that the saved-library jump must not use a fragment anchor with the hash router. It now uses a button that scrolls/focuses the heading without changing `#/recipes`. Both browser engines passed the extended recipe-copy scenario, and the reviewer reconfirmed **ship** for all three scoped findings against refreshed recipe evidence. The documentation was rechecked; design tokens and component conventions remain unchanged.
