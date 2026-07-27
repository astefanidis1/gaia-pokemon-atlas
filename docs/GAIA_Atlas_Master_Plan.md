# GAIA Atlas — Master Product & World-Building Plan

**Version:** 1.1  
**Status:** Creative direction and implementation architecture locked  
**Project owner:** Alex  
**Organization:** GAIA — Geospatial Anomaly Intelligence Agency

## Executive vision

GAIA Atlas is an in-universe, adult-oriented global Pokémon surveillance and natural-history platform that treats Pokémon as real inhabitants of modern Earth.

It combines a beautiful 3D globe, real-world geography, exact living populations, deterministic seasonal movement, ecological and historical world-building, government and scientific intelligence, personal discovery, and deeply layered lore.

The intended reaction is:

> Holy shit—someone built NORAD for Pokémon.

The project should feel less like a fan wiki and more like a real surveillance network, research institution, natural-history archive, and classified intelligence system that happens to document Pokémon.

## North-star experience

Visitors freely explore a world that already exists.

They should be able to:

1. Open the globe without being forced through a story.
2. Navigate to a place that matters to them.
3. Discover ordinary regional species and rare tracked entities.
4. Open avatar markers, ranges, corridors, and dossiers.
5. Learn where a Pokémon is, why it is there, how many exist, how it behaves, and how humans respond to it.
6. Save discoveries to a personal Field Log.
7. Return later and find that seasonal positions, activity, alerts, or world conditions have changed.

Lore is discovered naturally rather than assigned through missions.

## Locked identity

GAIA Atlas is both a public interactive experience and a serious speculative ecology and intelligence atlas.

It is not primarily:

- a private database editor;
- a community wiki;
- a guided narrative game;
- a child-focused Pokédex;
- a generic analytics dashboard.

The long-term ambition is **Complete Pokémon Earth**: every Pokémon species, evolutionary stage, regional form, and meaningful permanent form integrated into the real world.

Canon remains centrally curated. Visitors cannot rewrite locations, populations, or lore.

## In-universe framing

The public site exists inside the fictional universe. GAIA is a multinational organization that tracks Pokémon populations, migrations, ecological effects, anomalous incidents, extraterrestrial organisms, and civilization-level threats.

Displayed present-day population totals are authoritative canon. If the Atlas says 15 Articuno are alive, then 15 are alive.

Historical context may accompany the exact current figure, including former abundance, major declines, recoveries, births, deaths, captivity, or extinction risk.

## Brand system

**GAIA:** Geospatial Anomaly Intelligence Agency

- **GAIA Atlas:** complete public platform
- **GAIA Live:** current positions, migrations, alerts, and active conditions
- **GAIA Records:** full dossiers and archived incidents
- **GAIA Index:** searchable species catalogue
- **GAIA Field Log:** personal discovery collection

**Landing statement:** The world is inhabited.

**Motto:** Nothing is myth once it leaves a trace.

### Visual identity

- obsidian black;
- deep ocean navy;
- cold tracking cyan;
- tarnished institutional gold;
- warning amber;
- restricted-record red;
- archival ivory.

The logo should be a circular agency seal using latitude/longitude lines, a tracking aperture or eye, a broken orbital path, four founder points, and a hidden G in negative space. It must not resemble a Poké Ball.

## Tone

The site should feel ominous, realistic, mythic, and beautiful.

Tone adapts by subject:

- neighborhood species: warmer naturalist tone;
- ordinary wild species: wildlife and conservation;
- ancient species: museum and archaeology;
- artificial species: laboratory and intelligence;
- dangerous species: emergency management and public safety;
- legendaries: folklore, surveillance, awe, and restricted research;
- Ultra Beasts: extraterrestrial biology and dimensional containment;
- creation-level entities: cosmic and partially incomprehensible.

Mature lore may include fatalities, predation, severe injuries, destroyed settlements, experimentation, trafficking, cults, ecological collapse, containment failures, military action, and forensic detail when relevant. Horror serves the world rather than becoming the attraction.

## Founding team

### Alex — Co-Founder

**Companion:** Umbreon

Alex co-founded GAIA and designed much of its global geospatial tracking and population-modeling infrastructure. His work focuses on migratory reconstruction, anomalous movement patterns, fragmented field intelligence, and translating complex evidence into a living model of the Pokémon world. He is frequently accompanied by Umbreon during nocturnal surveys and low-visibility investigations.

### Dr. Nia Okafor — Co-Founder

Extraterrestrial biology, Ultra Beasts, and dimensional ecology. Companion: Xatu.

### Dr. Elena Varga — Co-Founder

Conservation ecology, population recovery, and human–Pokémon coexistence. Companion: Meganium.

### Dr. Kenji Arata — Co-Founder

Mythoarchaeology, ancient civilizations, and legendary historical records. Companion: Bronzong.

The founders appear through restrained biographies, authorship credits, field notes, and archive annotations. The project is not character-driven.

## Canonical entity model

The architecture must distinguish:

- **Species:** biological identity, taxonomy, lineage, global population, and general biology.
- **Form:** a permanent biologically or ecologically meaningful form.
- **Population:** a geographic, behavioral, or genetic group belonging to a species or form.
- **Individual:** a uniquely tracked organism when identity matters.
- **Location/Range:** independent point, polygon, route, altitude/depth band, off-world body, or dimensional anchor.
- **Route:** a deterministic sequence of seasonal geographic states.
- **Incident:** a dated event connecting entities and places.
- **Document:** an in-universe report, memo, translation, forensic file, or note.
- **Visitor state:** Discovered, Observed, and Favorite data, permanently separated from canon.

This separation is mandatory before expansion toward the complete Pokédex.

## Map semantics

Rare or singular records may represent:

- current confirmed position;
- last confirmed position;
- fixed residence;
- containment site;
- dimensional anchor;
- primary refuge;
- seasonal aggregation;
- known population center;
- historical recovery site.

Common species must not be represented by one misleading pin. They use shaded ranges, regional density, seasonal distributions, migration corridors, and urban/rural habitat distinctions.

Public labels may simplify the formal type into Tracked Position, Primary Range, Seasonal Range, Restricted Site, Fixed Habitat, Migration Corridor, or Dimensional Contact Point.

## Population methodology

- Wild and captive living individuals both count.
- Eggs do not count until hatching.
- Juveniles count.
- Evolutionary stages are separate populations.
- Temporally displaced individuals count while present in the current timeline.
- Independent conscious artificial or cloned beings count separately.
- Projections, illusions, remote shells, and temporary manifestations do not.
- Stakataka counts as one organism.
- Zygarde counts as one distributed organism; Cells are body components.
- Ultra Beast figures refer to the known living population in the named accessible world, colony, or region—not an infinite multiverse.
- Mega Evolution, Gigantamax, and Terastal states are transformations, not separate populations.
- Regional forms are separate ecological populations.
- Permanent biologically distinct forms may receive separate records.
- Cosmetic forms remain grouped.

Each stage may show both its own population and its evolutionary-lineage total without double-counting.

## Why GAIA can know exact totals

GAIA operates a global bioenergetic census mesh combining orbital aura-spectrum sensors, Pokédex identification networks, registered Poké Ball telemetry, field stations, marine monitoring, dimensional detectors, ecological surveys, and captivity registries.

Every independently living Pokémon produces a persistent and individually distinguishable bioenergetic resonance. GAIA reconciles signals and removes duplicates.

This explains why eggs are excluded, clones count independently, projections do not, Zygarde Cells resolve as one distributed signature, and accessible Ultra Beast populations can be counted.

Exceptional interference, dimensional occlusion, deliberate masking, or unknown biology may interrupt contact, but these are notable exceptions rather than constant uncertainty.

## Public access and classified data

Visitors use GAIA's civilian portal, not an unrestricted secret terminal.

### Knowledge status

- Verified
- Actively Tracked
- Archived
- Contact Lost
- Anomalous

### Public access status

- Public
- Advisory
- Restricted
- Redacted
- Sealed

GAIA may retain exact canonical data internally while the public interface displays delayed coordinates, broader zones, redacted names, or lower-resolution positions where believable.

## Progressive geographic disclosure

A complete Pokémon Earth cannot show thousands of avatar pins simultaneously.

### Planetary view

Show major alerts, actively tracked legendary or anomalous entities, major migrations, off-world events, and broad overlays.

### Continental view

Add important regional populations, rare species, protected habitats, and regional activity.

### Regional view

Add common fully evolved species, density layers, corridors, and urban/rural distinctions.

### Local view

Add ordinary species, juveniles where available, fine ranges, local sites, and seasonal variation.

Zoom-aware decluttering, clustering, progressive loading, and geometry simplification are required architecture.

## Seasonal and live movement

Movement is deterministic and canonical. Everyone viewing the site on the same date sees the same world state.

Mobile entities require route coordinates, seasonal timing, direction, stopovers, resting periods, speed class, current state, last update, and next projected region.

Fixed entities remain fixed. Migratory species follow real routes. Irregular or supernatural entities may follow special schedules or long periods of lost contact.

Later integrations may respond to time of day, lunar phase, storms, volcanism, ocean conditions, or geomagnetic activity when those systems materially improve lore.

## Core product surfaces

### Globe

The main interface. Visitors rotate, zoom, search places and species, inspect ranges and routes, and open records. There is no automatic geolocation or Near Me request.

### GAIA Live

Current movement, active migrations, unusual activity, public warnings, population changes, seasonal arrivals, and environmental relationships.

### GAIA Index

A complete searchable catalogue with filters for category, region, population, danger, discovery state, lineage, mobility, and realm.

### GAIA Records

Adaptive dossiers containing the sections relevant to each species: population, geography, ecology, behavior, reproduction, diet, intelligence, human relationship, legal status, conservation, threat, government response, history, mythology, incidents, unresolved anomalies, lineages, founder notes, and archives.

### GAIA Field Log

- **Discovered:** dossier opened.
- **Observed:** visitor marks an existing canonical location as personally observed.
- **Favorite:** visitor bookmarks a record.

Visitors cannot add locations, submit free text, alter range data, upload evidence, or affect canon.

Discovery never locks public content. Undiscovered silhouettes may appear in the Field Log, while search and map exploration remain free.

## Explicit public non-goals

Remove or reserve for private tooling:

- public canon editing;
- Canon Studio;
- alternate-canon import/export;
- visitor notes;
- free-text sightings;
- public location submissions;
- public edit suggestions;
- custom expeditions;
- guided story campaigns;
- voting on facts;
- automatic geolocation;
- developer diagnostics;
- analytics dashboards that overpower the map.

## Lore architecture

- **Layer 1:** name, image, location, population, movement, danger, and summary.
- **Layer 2:** ecology, behavior, history, and human relationship.
- **Layer 3:** incidents, memos, expedition records, forensic files, translations, photos, and founder notes.
- **Layer 4:** hidden cross-references involving shared events, migration alignments, coverups, ancient civilizations, rival theories, and cosmic relationships.

Lore is never dependent on a guided story order.

## Complete Pokémon Earth roadmap

1. **Exceptional Species Foundation:** legendaries, mythicals, Ultra Beasts, pseudos, artificial one-offs, rare evolved species, and iconic widespread species.
2. **Fully Evolved Global Ecology:** add remaining final evolutions first.
3. **Evolutionary Families:** add base and middle stages with lineage and juvenile ecology.
4. **Regional and Permanent Forms:** add distinct ecological variants.
5. **Complete Global Pokédex:** every species and meaningful form.
6. **World Systems:** deepen governments, law, infrastructure, industry, ecosystems, and history.

## Technical direction

- GitHub repository and version control
- static public deployment, preferably Cloudflare Pages or equivalent
- MapLibre GL JS map engine
- versioned JSON core records
- GeoJSON ranges and routes
- deterministic UTC movement engine
- local browser storage for the initial Field Log
- small serverless backend only when public observation counters are ready
- centralized replaceable artwork manifest
- graceful fallback when 3D rendering or live tiles fail

Data should be separated into species, populations, individuals, geography, routes, lore, incidents, assets, and visitor interaction data.

Every release should include a canon version, data date, changelog, schema migration if needed, and automated validation.

## Public launch target

The first public GAIA release should include:

- the complete current exceptional roster;
- GAIA identity and founders;
- globe-first exploration;
- formal point/range/route semantics;
- a first group of date-driven tracked entities;
- local Discovered and Favorite states;
- the dossier framework;
- roughly 12 flagship dossiers at full depth;
- enough ordinary regional ecology that populated areas do not feel empty;
- stable shareable URLs and social-preview cards;
- the quiet legal footer and About page.

Recommended flagship dossiers include Articuno, Lugia, Mewtwo, Zygarde, Gengar, Arcanine, Dragonite, Rotom, Guzzlord, Regirock, Umbreon, and Squirtle.

## Canonical time model

Seasonal position uses the real calendar and canonical UTC.

Population totals do not automatically simulate births and deaths. Each count retains a census verification date. Deliberate changes require a changelog reason such as birth, death, discovery, reclassification, or correction.

## Observation rollout

Launch with Discovered, Favorite, and Observed stored locally.

Public eye counts come later through a low-maintenance backend with anonymous identity, rate limits, and one confirmation per user/location. Counts are labeled civilian attestations and never affect GAIA's evidence or canon.

## Editorial workflow

Private records use Draft, Under Review, Canon Locked, Published, and Retired states.

Automated checks cover duplicate IDs, population reconciliation, coordinates, lineage links, route continuity, realm assignment, classifications, images, accessibility, and dead cross-references.

Material canon changes retain the previous value, new value, reason, effective date, and canon version.

## Accessibility and performance

Required:

- keyboard navigation;
- readable contrast;
- meaningful alternative text;
- screen-reader labels;
- reduced-motion mode;
- no mandatory audio;
- mobile-first testing;
- slower-device fallbacks;
- catalogue access when the globe cannot render;
- data loading by realm, region, zoom, or feature type rather than one monolithic payload.

## Legal and asset resilience

GAIA Atlas is an independent, non-commercial, fan-made fictional project and is not affiliated with Nintendo, Game Freak, Creatures Inc., or The Pokémon Company.

The disclaimer belongs quietly in the footer, About page, and README—not in an immersion-breaking opening modal.

Artwork references must be centralized so assets can be replaced without rewriting the application. Original code may be MIT-licensed; Pokémon intellectual property and third-party assets are excluded.

## Product principles

1. The globe comes first.
2. Beauty before visible complexity.
3. Lore is discovered, not assigned.
4. Canon remains authoritative.
5. Specificity creates reality.
6. Mystery is selective.
7. The world changes.
8. Every species belongs somewhere.
9. Mature does not mean relentlessly grim.
10. Features must improve exploration, realism, lore depth, personal discovery, or revisitability.

## Immediate development sequence

1. Archive the existing showcase prototype unchanged.
2. Separate public and private-development features.
3. Establish the canonical entity schema.
4. Rebrand the public shell as GAIA.
5. Rebuild navigation around Globe, Live, Index, Records, and Field Log.
6. Implement access status, map semantics, and progressive disclosure.
7. Convert selected species into species/population/individual records.
8. Complete the first date-driven routes.
9. Create flagship dossiers.
10. Test, publish, and expand.

## Final definition

> GAIA Atlas is a dark, cinematic, in-universe global Pokémon surveillance and natural-history platform. Operated by the Geospatial Anomaly Intelligence Agency, it maps the real Earth, tracks rare and migratory Pokémon through a canonical date-driven world state, models common species through realistic geographic ranges, and presents exact living populations as objective canon. Visitors freely explore, uncover layered ecological and historical lore, build a personal Field Log, and return to a world that changes with the real calendar.
