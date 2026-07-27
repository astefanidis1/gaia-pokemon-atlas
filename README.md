# GAIA Atlas

> **The world is inhabited.**

GAIA Atlas is a fan-made, in-universe global Pokémon surveillance and natural-history platform. It treats Pokémon as real inhabitants of modern Earth and combines a cinematic globe, exact living populations, realistic geographic ranges, canonical seasonal movement, government intelligence, historical records, and layered ecological lore.

The project is operated in-universe by **GAIA — the Geospatial Anomaly Intelligence Agency**.

**Institutional motto:** *Nothing is myth once it leaves a trace.*

## Current foundation build

The first GAIA rebuild establishes:

- the public GAIA identity and agency seal;
- Globe, GAIA Live, Index, Records, and Field Log navigation;
- 161 migrated species records;
- separate species, form, population, location, route, and incident entities;
- five deterministic real-calendar migration tracks;
- progressive geographic disclosure by zoom level;
- exact census totals with verification dates;
- Public, Advisory, Restricted, and Sealed access states;
- local Discovered, Observed, and Favorite states;
- flagship dossier content and selected incident records;
- quiet fan-project and rights-holder disclosure.

The original feature-rich showcase remains preserved separately and is not the product direction for the public GAIA rebuild.

## Run locally

```bash
cd public
python -m http.server 8000
```

Then open `http://localhost:8000`.

The app uses MapLibre and OpenFreeMap for the live basemap and remote artwork URLs for Pokémon images. Core Index, Records, and Field Log content remains usable if the basemap is unavailable.

## Canon architecture

The browser release is built from separate canonical entities:

```text
Species → permanent Forms → regional Populations → Locations / Ranges
                                             ↘ deterministic Routes
Species / populations / individuals ↔ Incidents and Records
Visitor state remains permanently separate from canon.
```

Urshifu demonstrates the form model: one species total of 16, split into seven Single Strike adults at Shaolin and nine Rapid Strike adults at Emei.

## Structure

```text
public/                       Public GAIA application
docs/                         Master plan and architecture
scripts/                      Migration and validation tools
archive/showcase-prototype/   Preservation boundary for the pre-GAIA prototype
```

## Source of truth

The full specification is [`docs/GAIA_Atlas_Master_Plan.md`](docs/GAIA_Atlas_Master_Plan.md).

## Licensing and fan-project notice

Original code in this repository is available under the MIT License unless stated otherwise. Pokémon names, characters, artwork, and related intellectual property are not covered by that license and remain the property of their respective rights holders.

GAIA Atlas is an independent, non-commercial, fan-made fictional project. It is not affiliated with or endorsed by Nintendo, Game Freak, Creatures Inc., or The Pokémon Company.
