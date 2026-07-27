# GAIA Atlas

> **The world is inhabited.**

GAIA Atlas is a fan-made, in-universe global Pokémon surveillance and natural-history platform. It imagines Pokémon as real inhabitants of modern Earth and combines a cinematic globe, exact living populations, ecological ranges, seasonal movement, government intelligence, historical records, and deeply layered lore.

The project is operated in-universe by **GAIA — the Geospatial Anomaly Intelligence Agency**.

**Institutional motto:** *Nothing is myth once it leaves a trace.*

## Project status

The original showcase prototype is being preserved while the application is rebuilt around the finalized GAIA product direction.

Current priorities:

1. Archive the original prototype unchanged.
2. Establish the canonical species / population / individual data model.
3. Rebrand the public shell as GAIA Atlas.
4. Rebuild the experience around Globe, GAIA Live, Index, Records, and Field Log.
5. Introduce deterministic seasonal tracking and progressive geographic disclosure.
6. Develop flagship dossiers before expanding toward the complete Pokédex.

## Repository structure

```text
archive/showcase-prototype/  Original interactive prototype and build tools
docs/                        Master plan, architecture, and canon methodology
src/                         GAIA rebuild source code (added during development)
data/                        Versioned canon records and map geometry
scripts/                     Validation and build tooling
```

## Master plan

The complete creative, world-building, product, technical, and release specification lives in:

[`docs/GAIA_Atlas_Master_Plan.md`](docs/GAIA_Atlas_Master_Plan.md)

That document is the project’s source of truth. Major changes that contradict it should be recorded explicitly rather than introduced through accidental feature drift.

## Founding team

- **Alex — Co-Founder:** geospatial tracking, population modeling, and anomalous movement reconstruction; accompanied by Umbreon
- **Dr. Nia Okafor — Co-Founder:** extraterrestrial biology, Ultra Beasts, and dimensional ecology; accompanied by Xatu
- **Dr. Elena Varga — Co-Founder:** conservation ecology, population recovery, and human–Pokémon coexistence; accompanied by Meganium
- **Dr. Kenji Arata — Co-Founder:** mythoarchaeology, ancient civilizations, and legendary historical records; accompanied by Bronzong

## Development

The archived prototype is a static web application built with HTML, CSS, JavaScript, MapLibre GL JS, D3, GeoJSON, and Python build/validation scripts. The GAIA rebuild will preserve the best of that work while separating public exploration from private canon-authoring tools.

## Licensing

Original source code in this repository is available under the MIT License unless a file states otherwise.

Pokémon names, characters, artwork, and related intellectual property are not covered by the MIT License and remain the property of their respective rights holders. Third-party map data, libraries, and artwork retain their own licenses and terms.

## Fan-project notice

GAIA Atlas is an independent, non-commercial, fan-made fictional project. Pokémon and related properties belong to their respective rights holders. This project is not affiliated with or endorsed by Nintendo, Game Freak, Creatures Inc., or The Pokémon Company.
