# Foodie

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React with TypeScript and Vite, selected by the user. Deploy as a static web app on GitHub Pages.

## Users

Everyday users looking up foods and home cooks building recipes. Swedish is the default language; English must also be supported.

## Product Purpose

Foodie lets users search Livsmedelsverket's food data and view nutrient information. Stage one focuses on this search-and-inspect workflow. Stage two combines foods into recipes and calculates their nutrients.

## Capabilities and Constraints

- Search for foods using Livsmedelsverket's open API as the data source.
- Present nutrient information for a selected food.
- Include pie charts of nutrient information; the proposed chart basis is specified in PLAN.md for review.
- Deliver food lookup first, then a recipe builder with nutrient calculations.
- Save recipes on the current device, with JSON export/import. Accounts and cross-device synchronization are outside the agreed scope.
- The web app must be quick and usable on mobile and desktop. No native app is needed.
- Support Swedish and English, a modern colourful interface, and themes.
- External recipe APIs are an investigation for a later stage, not a dependency of food lookup or manual recipe creation.

## Brand Commitments

The product name is Foodie.

The user requests a modern, attractive, colourful interface with themes and selected Nordic Cookbook on the design board: warm oat surfaces, deep green, berry and ochre accents, and editorial typography.

## Evidence on Hand

The repository had no application code or product assets at initialization. Livsmedelsverket is the confirmed food data source. Public API documentation and sample responses were inspected on 2026-10-24; see docs/API-RESEARCH.md for evidence and limitations.

## Product Principles

- Keep food search and nutrient inspection central to the first release.
- Present nutrient information traceable to Livsmedelsverket, with explicit measurement units and portion basis.
- Use pie charts as part of the nutrient presentation.
- Deliver the recipe builder after the food lookup is complete.
- Keep the core workflow fast on mobile and desktop, in either supported language.
