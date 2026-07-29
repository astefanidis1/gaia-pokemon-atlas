# GAIA Atlas

> **The world is inhabited.**

GAIA Atlas is a fan-made, in-universe global Pokémon surveillance and natural-history platform. It treats Pokémon as real inhabitants of modern Earth and combines a cinematic globe, exact living populations, realistic geographic ranges, canonical seasonal movement, government intelligence, historical records, and layered ecological lore.

The project is operated in-universe by **GAIA — the Geospatial Anomaly Intelligence Agency**.

**Institutional motto:** *Nothing is myth once it leaves a trace.*

## Current private build

The current GAIA build establishes:

- the public GAIA identity and agency seal;
- Globe, GAIA Live, Index, Records, and Field Log navigation;
- 161 migrated species records with separate species, form, population, location, route, and incident entities;
- five deterministic real-calendar migration tracks;
- exact census totals with verification dates and separate knowledge/access states;
- local Discovered, Observed, and Favorite visitor states;
- **27 full dossiers** with founder notes, public advisories, and linked archives;
- **four Regional Field Windows**: New England, the Aegean / Eastern Mediterranean, the Pacific Northwest, and Central Honshu;
- a Regional Explorer for comparing residents, seasonal visitors, and managed partners;
- **16 mapped habitat systems and 12 ecological corridors**;
- real-calendar seasonal interpretation for every mapped ecology feature;
- **16 ecological relationships** covering predation, pollination, infrastructure, working partnerships, and other ecosystem functions;
- clickable habitat and corridor layers with species links and regional detail;
- **Universal search** across species, locations, regional windows, habitats, corridors, incidents, and linked archive files;
- shareable deep links for species, regions, ecology features, incidents, and archive records;
- dossier-to-ecosystem links that connect a species directly to its documented field windows and mapped systems;
- a centralized **visual asset policy** with one replaceable artwork source, seven authored fallback profiles, deterministic species-specific silhouettes, and restricted-image treatment;
- Playwright browser assurance across desktop Chromium, desktop Firefox, mobile Chromium, mobile WebKit, and reduced-motion Chromium;
- axe-core serious/critical accessibility checks, viewport-overflow checks, keyboard navigation tests, deep-link tests, artwork-failure tests, and review screenshots;
- keyboard navigation, focus management, reduced-motion support, mobile navigation, and offline shell caching;
- quiet fan-project and rights-holder disclosure.

The original feature-rich showcase remains preserved separately and is not the product direction for the public GAIA rebuild.

## Run locally

Serve the repository root so the public loader can access the exact readable modules under `src/app/`:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/public/`.

The app uses MapLibre and OpenFreeMap for its primary basemap. Pokémon subject art is resolved through the centralized policy in `src/app/02d-assets.js`. A local globe style preserves canonical markers if the external basemap fails. Classification-specific GAIA archive reconstructions appear when remote artwork is unavailable or withheld, and successful assets are cached by the service worker after first load.

## Development

Readable application source lives in `src/app/*.js`. The public loader is generated from the exact reviewed module list and should be checked through:

```bash
python scripts/build_public.py --check
python scripts/validate_gaia.py
python scripts/validate_phase2.py
python scripts/validate_phase3.py
python scripts/validate_project_integrity.py
```

Install the pinned browser-assurance dependencies and run the experience matrix through:

```bash
npm install
npx playwright install
npm run test:experience
```

CI compiles the Python tooling, concatenates and syntax-checks every readable JavaScript module, validates all Markdown as strict UTF-8, verifies the asset and loader policy, runs the complete Playwright matrix, applies axe-core accessibility checks, and uploads browser reports plus desktop/mobile review captures.

## Canon architecture

```text
Species → permanent Forms → regional Populations → Locations / Ranges
                                             ↘ deterministic Routes
Species / populations / individuals ↔ Incidents and Records
Visitor state remains permanently separate from canon.

Signed population canon + versioned corrections
                         + signed editorial / regional expansions
                         + seasonal ecology and relationship layers
                         + public navigation and continuity layer
                         + replaceable visual presentation policy
```

Editorial, regional, ecology, navigation, visual, and testing layers deepen or protect the experience without silently changing exact census totals.

Urshifu demonstrates the form model: one species total of 16, split into seven Single Strike adults at Shaolin and nine Rapid Strike adults at Emei.

## Structure

```text
src/                          Readable application source
public/                       Deployable GAIA application
data/                         Versioned project data where applicable
docs/                         Master plan, status, asset, and review guidance
scripts/                      Deterministic build and validation tools
tests/                        Playwright experience and accessibility assurance
archive/showcase-prototype/   Preservation boundary for the pre-GAIA prototype
```

## Source of truth

The full specification is [`docs/GAIA_Atlas_Master_Plan.md`](docs/GAIA_Atlas_Master_Plan.md).

Supporting private-build plans include:

- [`docs/VISUAL_ASSET_STRATEGY.md`](docs/VISUAL_ASSET_STRATEGY.md)
- [`docs/EXPERIENCE_ASSURANCE_PHASE.md`](docs/EXPERIENCE_ASSURANCE_PHASE.md)
- [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md)
- [`docs/REVIEW_CHECKLIST.md`](docs/REVIEW_CHECKLIST.md)

## Licensing and fan-project notice

Original code in this repository is available under the MIT License unless stated otherwise. Pokémon names, characters, artwork, and related intellectual property are not covered by that license and remain the property of their respective rights holders.

GAIA Atlas is an independent, non-commercial, fan-made fictional project. It is not affiliated with or endorsed by Nintendo, Game Freak, Creatures Inc., or The Pokémon Company.
