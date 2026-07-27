# GAIA Atlas

> **The world is inhabited.**

GAIA Atlas is a fan-made, in-universe global Pokémon surveillance and natural-history platform. It treats Pokémon as real inhabitants of modern Earth and combines a cinematic globe, exact living populations, realistic geographic ranges, canonical seasonal movement, government intelligence, historical records, and layered ecological lore.

The project is operated in-universe by **GAIA — the Geospatial Anomaly Intelligence Agency**.

**Institutional motto:** *Nothing is myth once it leaves a trace.*

## Current foundation build

The current GAIA foundation establishes:

- the public GAIA identity and agency seal;
- Globe, GAIA Live, Index, Records, and Field Log navigation;
- 161 migrated species records;
- separate species, form, population, location, route, and incident entities;
- five deterministic real-calendar migration tracks;
- progressive geographic disclosure by zoom level;
- exact census totals with verification dates;
- Public, Advisory, Restricted, and Sealed access states;
- local Discovered, Observed, and Favorite states;
- twelve launch-quality flagship dossiers with founder notes and linked archive files;
- the first Regional Field Window: New England Coastal Forest;
- keyboard search navigation, focus management, reduced-motion support, and a mobile bottom navigation system;
- quiet fan-project and rights-holder disclosure.

The original feature-rich showcase remains preserved separately and is not the product direction for the public GAIA rebuild.

## Run locally

```bash
cd public
python -m http.server 8000
```

Then open `http://localhost:8000`.

The app uses MapLibre and OpenFreeMap for the live basemap and remote artwork URLs for Pokémon images. Core Index, Records, regional ecology, and Field Log content remains usable if the basemap or remote artwork is unavailable.

## Development

Readable application source lives in `src/app/*.js`. The compact browser bundle is deterministic and should always be regenerated through:

```bash
python scripts/build_public.py
python scripts/validate_gaia.py
```

CI fails if `public/app.js` does not match the readable source.

## Canon architecture

```text
Species → permanent Forms → regional Populations → Locations / Ranges
                                             ↘ deterministic Routes
Species / populations / individuals ↔ Incidents and Records
Visitor state remains permanently separate from canon.

Signed population canon + versioned corrections
                         + editorial dossiers / regional field windows
```

Editorial and regional layers can deepen the world without silently changing exact census totals.

Urshifu demonstrates the form model: one species total of 16, split into seven Single Strike adults at Shaolin and nine Rapid Strike adults at Emei.

## Structure

```text
src/                          Readable application source
public/                       Deployable GAIA application
data/                         Versioned project data where applicable
docs/                         Master plan, status, and review guidance
scripts/                      Deterministic build and validation tools
archive/showcase-prototype/   Preservation boundary for the pre-GAIA prototype
```

## Source of truth

The full specification is [`docs/GAIA_Atlas_Master_Plan.md`](docs/GAIA_Atlas_Master_Plan.md).

## Licensing and fan-project notice

Original code in this repository is available under the MIT License unless stated otherwise. Pokémon names, characters, artwork, and related intellectual property are not covered by that license and remain the property of their respective rights holders.

GAIA Atlas is an independent, non-commercial, fan-made fictional project. It is not affiliated with or endorsed by Nintendo, Game Freak, Creatures Inc., or The Pokémon Company.
