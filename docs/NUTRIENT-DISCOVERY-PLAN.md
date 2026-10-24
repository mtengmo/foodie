# Nutrient discovery and starter recipes

Status: implementation authorized 2026-10-24. Protein/fibre assessments and ten-nutrient rankings are implemented. The catalogue has expanded to twelve starter recipes, including a [three-recipe Wikibooks pilot](RECIPE-SOURCES.md). Vitamin/mineral badges, category filters, portion rankings and recipe badges remain future work. Current contracts are documented in [ARCHITECTURE.md](ARCHITECTURE.md); the sections below preserve the design rationale and future constraints.

## Product direction

Help people answer three questions: What does this food contribute? Which foods contain more of a chosen nutrient? What can I cook with them? Keep exact amounts, preparation state and measurement basis visible. Do not introduce an overall healthy/unhealthy score or personal dietary targets.

## 1. Nutrient highlights

Use nutrient-specific reference rules, not a universal low/medium/high scale. Show `Source of / Källa till` and `High in / Rik på` when supported. Below the source threshold, show the amount without a negative badge; unknown or unsupported data means `Not assessed / Ej bedömt`, never low or zero. Initially support protein and fibre, followed by explicitly mapped vitamins/minerals.

| Nutrient | Source threshold | High threshold |
| --- | --- | --- |
| Protein | At least 12% of food energy from protein | At least 20% |
| Fibre | At least 3 g/100 g OR 1.5 g/100 kcal | At least 6 g/100 g OR 3 g/100 kcal |
| Named vitamin/mineral, ordinary solid food | At least 15% of its EU nutrient reference value per 100 g | At least 30% |

Protein energy percentage uses protein grams × 4 kcal divided by source kcal × 100, with matching per-100-g identities. This does not replace displayed source energy or change the existing gram-share macro chart. Require known, valid inputs and positive energy for energy-based rules; zero/unknown energy cannot support those rules. Fibre can still qualify through the mass-based branch. Evaluate unrounded values, including exact boundaries.

Vitamin/mineral reference values must come from a versioned, cited mapping to exact source nutrient code, unit and basis. Do not equate different nutrient forms without verifying compatibility. Drinks have different rules and require per-100-ml data: current mass data must not be converted by assuming density 1. Gate this feature on reviewed food classification; ambiguous foods, concentrates and unrealistic consumption amounts need explicit handling before badges ship. A selected portion must not change a per-100-g classification.

Badges are explanatory threshold comparisons, not an assessment of the whole food. Include an accessible explanation with the actual calculation, basis, rule source and data date. Show at most three highlights, with all eligible results available on expansion. Choose a deterministic editorial order, not an unexplained numerical health score. For broccoli, calculate highlights from the selected raw/cooked record rather than hard-coding that all broccoli is rich in a nutrient.

For a later vitamin/mineral portion bar, label `% of EU reference value`, not `% of your needs`; values can exceed 100%. Do not reuse that scale for protein. Low-salt/sugar/fat labels are a separate future ruleset, not the inverse of high-nutrient labels.

## 2. Top foods by nutrient

Add a nutrient explorer with up to 100 foods for protein, fibre and supported vitamins/minerals. Default to highest amount per 100 g edible portion. Offer per 100 kcal as a clearly labelled alternative where source energy is known and positive. These rankings are separate from badge eligibility: protein density by weight and protein energy share answer different questions.

- Display rank, bilingual food name, preparation state as provided by the source, exact amount/unit and basis. Link to existing food details.
- Exclude unknown values and incompatible bases; explain coverage. Do not invent entries to reach 100. Use food ID as a stable tie-breaker and explain that rounding can display ties.
- Keep raw, cooked, dried and fortified records distinct. Do not imply that 100 g of dried herbs is a normal serving.
- Begin with an honestly labelled all-foods view. Add vegetables, legumes, fish and other category filters only after a reliable classification map exists; the current index does not supply a reviewed taxonomy. Never silently infer reliable categories from name substrings.
- Filter the eligible catalogue before selecting the top 100, so category results are not restricted to the global top 100.
- Defer per-portion ranking until reviewed comparable portion definitions exist. Entered gram quantities remain available in food details.

Generate a compact derived ranking asset from the validated snapshot at build/data-refresh time. Load it only when the explorer is opened; never download all food detail files to rank in the browser. Include schema version, snapshot ID, rule version and nutrient identities. Validate references and values against the source snapshot, publish atomically with it, and avoid mixing snapshot versions. Set and measure a compressed transfer budget before implementation (initial target under 200 KB for the explorer's initial data).

## 3. Premade recipes

Start with six to eight original, bilingual recipes, for example broccoli–lentil soup, broccoli–chickpea salad, salmon with potatoes and broccoli, bean chilli, overnight oats and a tofu stir-fry. These are candidates, not tested recipes or verified nutrient claims. Review quantities, instructions, yield and ingredient mappings before release. No external recipe API or backend is needed.

Keep published templates separate from the user's IndexedDB recipes. Each template has a stable ID/revision, Swedish/English title and instructions, servings, ingredient edible grams, exact food IDs and preparation-state notes, provenance/license and optional measured final weight. Generate nutrient previews through the existing calculation functions. Flag incomplete nutrients and describe results as estimates; do not invent cooking retention or final yield.

`Save a copy / Spara en kopia` creates a fresh local recipe ID with frozen ingredient food details using the existing validation and save flow. It must never overwrite another recipe. Catalogue updates must not alter saved copies. Decide how instructions and template provenance are retained before adding fields: the current recipe format does not provide a complete template/instructions contract. Any persisted schema change requires backwards-compatible import handling, migration fixtures and export tests.

Templates should be useful on their own before adding nutrient filters. Later, filter by verified nutrient highlights and ingredients; avoid claiming allergen-free status from incomplete food metadata. Recipes assembled from raw ingredients cannot reliably claim cooked per-100-g concentration without a suitable measured yield. Delay recipe badges until these conditions and completeness checks are covered.

## Implementation sequence and acceptance

1. **Rules and contracts:** add pure domain assessment functions and cited/versioned rule data. Test boundary values, unknown/zero energy, incompatible units, unsupported food classes and portion invariance. Confirm nutrient mapping and classification prerequisites before enabling vitamin badges.
2. **Food highlights:** add translated badges and calculation explanations to food details. Preserve mobile layout, theme contrast, keyboard access and current chart semantics.
3. **Explorer:** add generated snapshot-bound ranking data, repository loading and a hash route. Test sorting, ties, missing data, category-before-limit behavior, snapshot mismatch and failed loads. Verify network size and no bulk detail fetches.
4. **Starter catalogue:** author/review templates, introduce any required recipe schema migration, then implement preview and explicit copy. Test old JSON imports, distinct copy IDs, failed writes, reload guards, and independence from future catalogue updates.
5. **Integration:** run the checks in [DEVELOPMENT.md](DEVELOPMENT.md), including bilingual mobile/desktop browser flows. Update actual architecture only as features ship.

Suggested ownership if parallel agents are explicitly requested: Sol handles domain rules, generated assets and persistence contracts; Luna handles screens and localization against agreed contracts. Assign one writer to App.tsx and shared types. Do not begin with simultaneous edits to those files.

## Sources and review

Checked 2026-10-24. Recheck the official conditions before implementation; meeting a numeric threshold alone does not establish that every use of a nutrition claim is appropriate.

- [European Commission: nutrition claims](https://food.ec.europa.eu/food-safety/labelling-and-nutrition/nutrition-and-health-claims/nutrition-claims_en): protein and fibre conditions.
- [Livsmedelsverket Kontrollwiki: Näringspåståenden](https://kontrollwiki.livsmedelsverket.se/artikel/471): vitamin/mineral reference thresholds, beverage distinctions and consumption-context requirements.
- [Regulation (EU) 1169/2011](https://eur-lex.europa.eu/eli/reg/2011/1169/oj): Annex XIII reference values; verify the applicable consolidated text and compatible nutrient forms when implementing the mapping.
