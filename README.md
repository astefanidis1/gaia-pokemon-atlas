# GAIA Atlas

> **The world is inhabited.**

GAIA Atlas is a fan-made, in-universe global Pokémon surveillance and natural-history platform. It treats Pokémon as real inhabitants of modern Earth and combines a cinematic globe, exact living populations, geographic ranges, deterministic seasonal movement, institutional records, historical files, ecological systems, and modern coexistence infrastructure.

The project is operated in-universe by **GAIA — the Geospatial Anomaly Intelligence Agency**.

**Institutional motto:** *Nothing is myth once it leaves a trace.*

## Current private build

The current branch combines:

- Release Candidate 1 (`2026-07-29.1`);
- World Completion Pass I (`2026-08-01.1`);
- World Systems & Evidence Pass I (`2026-08-01.2`).

It remains a draft, unmerged, undeployed, and unpromoted.

The current private build establishes:

- the public GAIA identity, seal, motto, founders, and quiet fan-project notice;
- Globe, GAIA Live, Index, Records, and Field Log navigation;
- **161 signed species records**, 2 permanent Urshifu forms, 162 reconciled populations, 162 locations, 5 deterministic migration tracks, and the foundation incident archive;
- exact census totals with verification dates and separate knowledge/access states;
- local Discovered, canonical-location Observed, and Favorite visitor states;
- **27 Full GAIA Dossiers** with founder notes, advisories, archive files, and ecology links;
- a complete **Civilian Summary Record** tier for every remaining species;
- **six Regional Field Windows**: New England, Aegean / Eastern Mediterranean, Pacific Northwest, Central Honshu, Central Andes, and East African Rift Highlands;
- **24 mapped habitat systems, 18 ecological corridors, and 24 causal ecological relationships**;
- complete real-calendar seasonality for all 42 mapped ecology features;
- an expanded **GAIA Live** surface combining migration, current regional conditions, active ecology, and relationships;
- a Regional Explorer for residents, seasonal visitors, managed partners, habitats, and corridors;
- **Universal search** and shareable deep links across species, locations, regions, ecology, incidents, archives, institutions, evidence, investigations, and lineage pilots;
- location-specific observation records stored only in the visitor’s browser, with impossible or withheld observations blocked;
- readable archive documents with classification, abstract, cross-reference facts, previous/next navigation, and shareable state;
- Index filtering by category, realm, danger, mobility, and publication depth, with multiple sorting modes;
- **eight modern-world institutional systems** covering habitat law, custody, clinical care, agriculture, critical infrastructure, emergency response, wildlife crime, and public compensation;
- **nine original GAIA evidence plates** generated from readable source as camera, sonar, electrical, seismic, hydrology, archaeology, laboratory, route, and containment records;
- **eight investigation chains** connecting an event to evidence, responsible institutions, affected species, and a documented operational consequence;
- **three evolutionary-family pilots** for the Ralts, Dratini, and Goomy lines, establishing stage-specific ecology without inventing provisional population totals;
- species-dossier and regional-window links into the relevant institutions, evidence, investigations, and lineages;
- a centralized visual asset policy with one replaceable subject-art source and seven authored archive-reconstruction profiles;
- deterministic GAIA social artwork, install icons, maskable icon, and Apple touch icon;
- production canonical, Open Graph, Twitter/X, install-manifest, and mobile-app metadata;
- authored Coordinate Unresolved and Civilian Archive Mode failure states;
- a dedicated versioned offline worker caching the application shell, all readable modules, signed/editorial data, and generated assets;
- ordered parallel loading of **16 readable browser modules**;
- hard performance budgets for shell weight, data weight, largest assets, cache complexity, weak-network usability, and offline reopening;
- Playwright assurance across desktop Chromium, desktop Firefox, mobile Chromium, mobile WebKit, and reduced-motion Chromium;
- axe-core serious/critical accessibility scans, geometry containment tests, keyboard navigation, deep-link restoration, artwork-failure checks, weak-network behavior, offline reopening, and visual-review captures;
- a restrained ZANDROS music link inside Alex’s founder biography.

The original feature-rich showcase remains preserved separately and is not the product direction for the public GAIA rebuild.

## Important canon correction boundary

The immutable Phase 4 transport remains protected by its original semantic checksums. Validation exposed two inherited editorial references—Rotom and Squirtle—that were absent from the signed 161-species census.

GAIA now preserves the signed historical bytes while applying explicit effective-world correction `2026-08-01.2`:

- Rotom references become **Electivire**;
- Squirtle references become **Lapras**;
- the abandoned Squirtle lineage draft is replaced with the **Ralts → Kirlia → Gardevoir** pilot;
- one orphan incident identifier with no foundation or new case record is removed from effective institutional links.

These corrections do not add an organism or change any exact population. Runtime and structural tests verify that every effective species, region, system, evidence, and incident reference resolves.

## Run the private build locally

Materialize the production-shaped metadata and deterministic image package, then serve the repository root so the public loader can access the readable modules under `src/app/`:

```bash
python scripts/prepare_release_candidate.py
python -m http.server 8000
```

Open `http://localhost:8000/public/`.

The app uses MapLibre and OpenFreeMap for its primary basemap. Pokémon subject art resolves through the centralized policy in `src/app/02d-assets.js`. A local globe style preserves canonical markers if the external basemap fails. Authored GAIA reconstructions replace missing or withheld subject art. Original institutional evidence plates are generated locally by `src/app/02h-systems-evidence.js` and do not depend on remote image URLs.

After one successful visit, `public/sw-world-completion.js` preserves the exact current shell, data layers, readable modules, and previously acquired runtime/artwork resources for offline use.

## Development and validation

Readable application source lives in `src/app/*.js`. The browser fetches all 16 modules in parallel and executes them in a locked reviewed order.

Run the structural and release checks through:

```bash
python scripts/prepare_release_candidate.py
python scripts/build_public.py --check
python scripts/validate_gaia.py
python scripts/validate_phase2.py
python scripts/validate_phase3.py
python scripts/validate_phase4.py
python scripts/validate_world_systems.py
python scripts/validate_project_integrity.py
python scripts/validate_release_candidate.py
```

Install the pinned browser-assurance dependencies and run the complete experience matrix through:

```bash
npm install
npx playwright install
npm run test:experience
```

CI generates the release image package, materializes the exact production-shaped HTML, verifies signed and corrected canon layers, compiles Python tooling, syntax-checks every JavaScript module, validates Markdown as strict UTF-8, enforces performance budgets, and runs the complete browser/network/offline/completion/systems matrix. Successful and failed runs retain browser reports, traces, screenshots, and generated social artwork for review.

The future Pages workflow repeats the same gate before any deployment is permitted.

## Canon architecture

```text
Species → permanent Forms → regional Populations → Locations / Ranges
                                             ↘ deterministic Routes
Species / populations / individuals ↔ Incidents and Records
Visitor state remains permanently separate from canon.

Signed population canon
    + versioned canon corrections
    + signed editorial / regional expansions
    + seasonal ecology and relationship layers
    + signed World Completion transport
    + explicit effective-world reference corrections
    + institutions, evidence, investigations, and lineage pilots
    + public continuity, visual policy, and release assurance
```

Editorial, ecology, institutional, navigation, evidence, and release layers may deepen or correct references. They cannot silently change exact census totals.

Urshifu demonstrates the permanent-form model: one species total of 16, split into seven Single Strike adults at Shaolin and nine Rapid Strike adults at Emei.

## Structure

```text
src/app/                       Readable ordered browser modules
public/                        Deployable GAIA application
public/assets/                 Seal and deterministic release artwork/icons
public/data/                   Signed and versioned canon/editorial transport
scripts/                       Deterministic preparation and validation tools
tests/                         Browser, layout, accessibility, network, offline, and visual assurance
docs/                          Master plan, phase records, status, and review guidance
performance-budgets.json       Private-release size and timing ceilings
archive/showcase-prototype/    Preserved pre-GAIA prototype
```

## Source of truth

The full specification is [`docs/GAIA_Atlas_Master_Plan.md`](docs/GAIA_Atlas_Master_Plan.md).

Supporting phase and review documents include:

- [`docs/WORLD_SYSTEMS_EVIDENCE_PASS_1.md`](docs/WORLD_SYSTEMS_EVIDENCE_PASS_1.md)
- [`docs/WORLD_COMPLETION_PASS_1.md`](docs/WORLD_COMPLETION_PASS_1.md)
- [`docs/WORLD_COMPLETION_PAYLOAD.md`](docs/WORLD_COMPLETION_PAYLOAD.md)
- [`docs/RELEASE_CANDIDATE_1.md`](docs/RELEASE_CANDIDATE_1.md)
- [`docs/VISUAL_ASSET_STRATEGY.md`](docs/VISUAL_ASSET_STRATEGY.md)
- [`docs/EXPERIENCE_ASSURANCE_PHASE.md`](docs/EXPERIENCE_ASSURANCE_PHASE.md)
- [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md)
- [`docs/REVIEW_CHECKLIST.md`](docs/REVIEW_CHECKLIST.md)

## Licensing and fan-project notice

Original code and original GAIA presentation assets in this repository are available under the MIT License unless stated otherwise. Pokémon names, characters, artwork, and related intellectual property are not covered by that license and remain the property of their respective rights holders.

GAIA Atlas is an independent, non-commercial, fan-made fictional project. It is not affiliated with or endorsed by Nintendo, Game Freak, Creatures Inc., or The Pokémon Company.
