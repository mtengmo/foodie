# Recipe pilot verification

2026-10-24: catalogue expanded from six to twelve recipes, with korvstroganoff and rice, entrecôte with sweet potato, a sweet potato side, and three curated Wikibooks adaptations. Source revisions, editorial gram amounts and ingredient proxies are recorded in [RECIPE-SOURCES.md](../../../docs/RECIPE-SOURCES.md).

- TypeScript check and production build passed.
- 31 unit tests passed, including every bilingual recipe's ingredient mapping and complete macro/energy estimates, licensed-copy round trips, invalid source URL rejection and legacy recipe compatibility.
- 38 Chromium/WebKit scenarios passed, including requested recipe previews, saved source credits, exported licence metadata and narrow English/dark accessibility.
- Three full-page captures show the actual preview with its catalogue collapsed: desktop korvstroganoff, Swedish phone Greek salad and 320px English/dark hummus. All were opened and inspected; measurements show no horizontal overflow.
- The mechanical detector returned no findings for the changed App.tsx.
- Independent finish reviewer: **ship within the reviewed scope**, with no blocking attribution readability/layout defect. This verdict covers the three captures and inspected rendering code, not independent legal or arithmetic validation.
- No CSS, design primitive or shipping image changed. The existing design system is preserved.

These are local checks; deployment and live verification are checked separately after push.
