# API and hosting research

Checked 2026-10-24. Separate documented facts, observed responses and proposed design choices. Recheck provider terms and operational behaviour before production use.

## Livsmedelsverket

The user-provided [open-data landing page](https://www.livsmedelsverket.se/om-oss/psidata/livsmedelsdatabasen/) returned HTTP 403 to the research browser. The official [Swagger UI](https://dataportal.livsmedelsverket.se/livsmedel/swagger/index.html), [OpenAPI JSON](https://dataportal.livsmedelsverket.se/livsmedel/swagger/v1/swagger.json), and sample API requests were accessible.

Documented API facts: the list uses offset/limit pagination and `sprak=1` for Swedish or `sprak=2` for English. There is no text-search parameter in the inspected list schema. Foods have a number and update version; nutrient records carry a EuroFIR code, unit, value and measurement metadata. `viktGram` is documented as 100. The specification identifies the license as [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.sv). Preserve attribution, link the license and indicate app transformations.

Base URL: `https://dataportal.livsmedelsverket.se/livsmedel/api/v1`.

| Endpoint | Purpose |
| --- | --- |
| `/api-info` | API version/status information |
| `/livsmedel?offset=0&limit=100&sprak=1` | Paginated Swedish food catalogue |
| `/livsmedel?offset=0&limit=100&sprak=2` | Paginated English food catalogue |
| `/livsmedel/{nummer}?sprak=1` | One food |
| `/livsmedel/{nummer}/naringsvarden?sprak=1` | Its nutrient records |
| `/livsmedel/{nummer}/klassificeringar?sprak=1` | Classification information |
| `/livsmedel/{nummer}/ravaror?sprak=1` | Raw-material information |
| `/livsmedel/{nummer}/ingredienser?sprak=1` | Ingredients for applicable calculated foods; not a consumer recipe/instruction catalogue |

Observed via public HTTP GET requests, without credentials:

- API status was `active`, version `1.0.0`, release date `2024-03-18`.
- Two-item list requests in both languages returned `totalRecords: 2606`. This is an observation, not a hard-coded product count.
- Food ID 1 was “Nöt talg” / “Beef tallow”; ID 2 was “Gris späck” / “Pork lard 85% fat”.
- Food 1 returned 59 nutrient rows in each sampled language. It included `ENERC` in kcal and kJ, `PROT` in g, `CHO` in g and `FAT` in g. Localized abbreviations differ, so they must not be used as stable IDs.
- Food 1 had energy 884 kcal and 3700 kJ per 100 g, fat 100 g, protein 0 g, available carbohydrates 0 g. These are the real sample values used in the planning sketches, not a general conversion rule.
- Several nutrient rows had null matrix metadata despite a numeric value and `viktGram: 100`. Preserve that distinction in normalization.
- Requests with `Origin: https://example.github.io` received `Access-Control-Allow-Origin: https://example.github.io` for API-info, both list languages, and sampled nutrient endpoints.

Evidence limits: this was an HTTP header check, not a deployed-browser end-to-end test. It does not prove future CORS policy, every origin/endpoint, availability, rate limits or full-dataset consistency. No full dataset was downloaded. The OpenAPI security fields were absent and sample requests worked without keys. No documented bulk-request quota or guaranteed update cadence was established.

Implementation decision: use the API in the data-refresh job, and serve versioned static data from Pages. Verify full import completeness and data size before implementing performance optimizations. Do not silently fall back to incomplete or invented records.

## Recipe services

| Service | Fit | Important conditions | Recommendation |
| --- | --- | --- | --- |
| TheMealDB | Accessible recipe discovery and ingredient lists; easy prototype | Guide calls key `1` a development/test key and recommends supporter access for public production. Terms and artwork attribution still apply. | First candidate for a later prototype; verify Swedish coverage and publishing terms before selecting. |
| Spoonacular | Broad recipe search, including by ingredients | Current pricing lists free access at 50 points/day. FAQ limits user-requested caching to one hour and requires deletion when access ends. | Consider if catalogue/search quality justifies a private-key service and ongoing provider dependency. |
| Edamam | Large recipe search with normalized ingredients | Third-party web recipes link to original cooking instructions; owned-content offerings differ. Attribution and strict plan-dependent storage restrictions apply. | A later commercial option, not a simple permanent local recipe mirror. |

Primary sources: [TheMealDB guide](https://www.themealdb.com/docs_api_guide.php), [TheMealDB terms](https://themealdb.com/terms_of_use.php), [Spoonacular pricing and caching FAQ](https://spoonacular.com/food-api/pricing), [Edamam Recipe Search API](https://developer.edamam.com/edamam-recipe-api).

None of these sources establishes that a food name or recipe ingredient can be mapped automatically and accurately to a Livsmedelsverket food ID. That requires explicit matching and quantity review in Foodie. No reviewed source establishes complete Swedish recipe coverage. Publicly accessible API is not synonymous with unrestricted open data.

## Hosting

[GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) serves static HTML/CSS/JavaScript. Project sites normally use an owner/repository URL, so application asset paths must handle a repository subpath.

[Vite deployment guidance](https://vite.dev/guide/static-deploy) describes setting `base` to `/<repo>/` for a project site and deploying the built output using GitHub Actions. Use hash routing to avoid depending on server-side SPA rewrites.

[GitHub's workflow documentation](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/disable-and-enable-workflows?tool=cli) notes that scheduled workflows in public repositories are disabled after 60 days without repository activity. Therefore expose dataset age and keep manual refresh available.

The proposed architecture is an engineering recommendation based on these capabilities, not a guarantee of API uptime, Pages latency, zero operating cost under every GitHub plan, or automatic update freshness.
