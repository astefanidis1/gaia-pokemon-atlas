# GAIA Atlas — World Systems & Evidence Pass I

**Version:** `2026-08-01.2`  
**Status:** Private development layer  
**Branch:** `agent/gaia-foundation`  
**Promotion state:** Unmerged, undeployed, and unpromoted

## Purpose

World Completion Pass I made GAIA broader, more consistent, and more navigable. The next fresh-eye gap was different: the world was convincingly described, but modern civilization still appeared to exist around Pokémon mostly by implication.

World Systems & Evidence Pass I adds the first public layer explaining how real institutions study, regulate, protect, employ, rescue, compensate for, and investigate Pokémon without turning the Atlas into a generic policy database.

The pass is integrated into existing product surfaces:

- Records contains the complete systems, evidence, investigation, and lineage collections;
- species dossiers expose only the institutions and evidence relevant to that organism;
- regional windows expose the systems active in that ecology;
- universal search resolves systems, evidence, lineages, and investigations;
- every new record has a shareable deep link;
- the top-level navigation remains Globe, GAIA Live, Index, Records, and Field Log.

## Public-world institutional systems

Eight systems establish the first coherent modern civic framework.

### Habitat & Coexistence Law

Defines protected breeding habitat, seasonal closures, migration-corridor continuity, hazardous-species exclusions, and the principle that publishing an exact population does not create a right of approach.

### Registration, Custody & Trainer Responsibility

Separates companionship, managed work, research custody, containment, and independent artificial cognition. Custody is treated as a regulated relationship, not unrestricted ownership.

### Pokémon Clinical & Rehabilitation Network

Treats Pokémon Centers as a coordinated clinical network with species-specific capability, specialist referral, quarantine, rehabilitation, and ethics requirements rather than universal instant-healing infrastructure.

### Agricultural Partnership Certification

Defines when a Pokémon relationship is a legitimate managed partnership rather than extraction from a useful wild population. Welfare, ecological capacity, rest, maintenance, and benefit-sharing are explicit.

### Critical Infrastructure Pokémon Operations

Covers electrical grids, rail, mines, tunnels, shipping, aviation, dams, and communications. No critical facility may depend on undocumented Pokémon labor or behavior as a single point of failure.

### Ranger & Anomalous Emergency Response

Separates ordinary wildlife conflict from events requiring GAIA coordination, including mass movement, severe elemental danger, legendary activity, artificial cognition, and dimensional contamination.

### Wildlife Crime, Trafficking & Artifact Protection

Tracks illegal organisms, eggs, biological material, custody transfers, restricted habitat intelligence, fossils, artifacts, and active legendary seals across borders.

### Catastrophic Risk, Insurance & Public Compensation

Distinguishes natural behavior, negligent custody, infrastructure failure, unlawful disturbance, necessary government response, and exceptional containment events without requiring the organism itself to be treated as blameworthy.

## Original evidence layer

Nine original institutional evidence plates are generated directly by readable application source. They are not external Pokémon illustrations and do not require remote image URLs.

The effective set includes:

1. New England nocturnal-crossing camera evidence involving Umbreon;
2. Aegean bathymetric and hydrophone reconstruction involving Kingdra;
3. Pacific Northwest electrical-induction forensics involving Electivire;
4. Central Honshu rail strain, seismic, and electromagnetic survey involving Aggron and Magnezone;
5. Central Andes search-and-rescue route evidence involving Arcanine;
6. East African Rift hydrology and managed-work evidence involving Vaporeon and Machamp;
7. Regirock seal-chamber photogrammetry;
8. Mewtwo independent-cognition telemetry;
9. Guzzlord dimensional mass-balance containment evidence.

Each plate contains:

- an evidence code;
- date and source;
- classification and access level;
- a readable institutional visualization;
- meaningful alternative text;
- a finding that changes a rule, response, rights determination, or operational standard;
- links to the responsible system, affected species, region, and investigation.

The intended language is evidence rather than poster art: sensor traces, bathymetry, grid events, photogrammetry, containment geometry, route reconstruction, and forensic annotation.

## Investigation chains

Eight new investigations connect event, evidence, institution, species, and consequence:

- North Shore adaptive-lighting collision cluster;
- Cyclades commercial-lane pressure event;
- Cascadia substation induction-overload event;
- Cordillera Blanca storm rescue;
- Rift highland irrigation dependency failure;
- Regirock seal-chamber artifact removal;
- independent artificial cognition custody ruling;
- dimensional mass-transfer containment breach.

An investigation is not merely a dramatic paragraph. Each one identifies:

- the observed event;
- the evidence supporting the interpretation;
- the systems activated or changed;
- the affected species;
- a documented legal, engineering, clinical, ecological, rights, or compensation outcome.

The investigations also enter the existing GAIA incident archive so species dossiers and Records can cross-reference them naturally.

An early draft referenced `gaia-i-2020-041`, which existed in neither the foundation archive nor the eight new investigations. Effective correction `2026-08-01.2` removes the orphan link rather than inventing a retroactive event.

## Evolutionary-family pilots

This pass establishes three schema and editorial pilots without altering the signed 161-species census.

### Ralts cognitive development line

Models the Ralts → Kirlia → Gardevoir progression through changing cognition, emotional perception, social independence, consent, education, clinical care, and custody responsibility.

### Dratini pelagic development line

Models concealed freshwater juveniles, estuarine transition, adult ocean and aerial movement, cross-border jurisdiction, protected nursery precision, and trafficking risk.

### Goomy wetland development line

Models humidity-dependent juvenile ecology, mineral and marsh dependence, stage-specific drought effects, sensor overlap during moisture-driven congregation, and managed adult agricultural partnerships.

The pilots deliberately do **not** publish invented provisional totals for unintegrated stages. Each stage states its census treatment, and public stage totals remain pending a later signed Evolutionary Families expansion.

## Reference-correction boundary

Initial drafting inherited or introduced several references that did not match the signed effective world:

- Rotom was absent from the signed 161-species census and is corrected to Electivire;
- Squirtle was absent from the signed census and the regional reference is corrected to Lapras;
- the resulting temporary Lapras lineage draft is replaced with the Gardevoir lineage pilot;
- abbreviated Pacific Northwest and Central Honshu region IDs are corrected to their exact current identifiers;
- the orphan 2020 incident identifier is removed.

The raw source remains auditable. `src/app/02i-systems-reference-corrections.js` applies effective correction `2026-08-01.2` before any deferred Systems rendering occurs. Corrected investigations are also synchronized into the shared incident archive so dossiers, search, and institutional records read one object.

No correction changes an exact population or adds an organism.

## Product behavior

### Records

Records gains four collections:

- World Systems;
- GAIA Evidence Archive;
- Investigation Chains;
- Evolutionary Family Pilots.

### Dossiers

Relevant species receive an **Institutional World Context** section containing only applicable systems, evidence plates, investigations, and lineage pilot.

### Regional windows

Each completed region receives a **Regional Institutions & Evidence** section based on its documented systems and evidence records.

### Universal search and deep links

New targets use:

- `#system=<id>`
- `#evidence=<id>`
- `#investigation=<id>`
- `#lineage=<id>`

Search results identify each target as SYSTEM, EVIDENCE, CASE, or LINEAGE.

## Canon boundary

This pass may:

- add incident and document-level world-building;
- explain law, infrastructure, medicine, work, enforcement, and compensation;
- add original procedural evidence visualization;
- establish future lineage schema and editorial rules;
- apply explicit reference corrections while retaining signed historical transport.

It may not:

- add a species to the signed census;
- change an exact population;
- create a provisional juvenile count;
- alter a location, route, or permanent form;
- allow visitor evidence or public canon editing;
- imply that custody removes cognition, welfare, habitat, or rights obligations.

`scripts/validate_world_systems.py` verifies counts, cross-references, correction behavior, local evidence generation, archive integrity, and the no-population-mutation boundary.

## Assurance

The pass has dedicated Playwright coverage for:

- collection counts and effective reference integrity;
- system → evidence → investigation → species exploration;
- dossier and regional integration;
- lineage stage accounting;
- universal search and deep links;
- desktop/mobile geometry containment;
- serious and critical axe-core scans;
- desktop and mobile visual-review captures.

The existing weak-network, offline, artwork-failure, reduced-motion, and release suites remain active.

## Remaining evidence and systems work

Pass I establishes the architecture and first complete public examples. Later systems work should add:

- richer field-camera and satellite scenes;
- aviation and airspace policy;
- maritime rescue and ocean-monitoring systems;
- urban building codes and fire standards;
- education, public transit, housing, and workplace accommodation;
- courts, rights disputes, and international jurisdiction;
- deeper trafficking finance and forensic chains;
- more clinical specialties and species-specific medicine;
- additional evolutionary families with signed stage populations;
- more independent investigations and linked document sequences.

The site remains unpromoted until Alex explicitly decides it is finished enough to release.
