# GAIA Atlas — Visual Asset Strategy

**Version:** `2026-08-01.2`  
**Status:** Locked private-build policy  
**Scope:** Subject artwork, institutional identity, original evidence visualization, restricted presentation, failure states, and rights resilience

## Principle

Pokémon artwork communicates the subject. **GAIA owns the evidence presentation.**

The Atlas must never look like a loose gallery of images pulled from unrelated sources. Every image appears inside a consistent institutional system, and every missing, reconstructed, classified, or withheld image must feel intentional rather than broken.

## Asset hierarchy

### 1. Primary subject artwork

Standard species artwork resolves through one centralized remote-artwork template in `src/app/02d-assets.js`. Individual components do not invent their own source URLs.

This layer is preferred when available because visitors should recognize the Pokémon immediately. It remains subject identification—not the Atlas’s evidence layer.

### 2. Deterministic institutional release artwork

Readable-source generation produces:

- the 1200 × 630 GAIA social-sharing card;
- standard 192 px and 512 px install icons;
- a maskable install icon;
- the Apple touch icon.

These assets establish a coherent release identity and can be regenerated exactly.

### 3. Original institutional evidence visualization — Pass I complete

World Systems & Evidence Pass I introduces nine original evidence plates generated directly in `src/app/02h-systems-evidence.js`.

The first package covers:

- low-light wildlife camera evidence;
- bathymetry and hydrophone reconstruction;
- electrical induction forensics;
- rail strain, seismic, and electromagnetic survey;
- high-altitude search-and-rescue route reconstruction;
- hydrology and irrigation-system failure mapping;
- archaeological structured-light photogrammetry;
- shielded cognitive telemetry;
- dimensional containment and mass-balance analysis.

Each plate contains:

- a unique evidence code;
- date and source;
- classification and access treatment;
- institutional visual language appropriate to the sensor or discipline;
- meaningful alternative text;
- a verified interpretation;
- a documented legal, engineering, clinical, ecological, rights, or emergency consequence.

The plates use local SVG generated from readable source. They do not depend on remote image URLs and remain available in the cached offline application.

The target reaction is not “nice Pokémon fan art.” It is:

> This looks like evidence produced by an institution that has actually studied this world.

### 4. Future scene-level GAIA evidence art

The first procedural package proves the evidence architecture. A later premium layer should add richer original scenes:

- regional environmental plates;
- satellite and aerial-survey frames with believable terrain;
- imperfect field-camera and low-light surveillance stills;
- dossier headers showing organisms inside real habitat;
- incident diagrams and damage assessments;
- containment and clinical imagery;
- archaeological plates and historical reconstructions;
- infrastructure, agriculture, conservation, and public-safety scenes.

These assets should deepen environmental context rather than simply replacing official character art with another isolated render.

### 5. Authored procedural archive reconstructions

When primary subject artwork fails, stalls, or is withheld, GAIA generates a deterministic species-specific archive reconstruction.

Seven visual profiles remain defined:

- **Natural history** — topographic field lines and conservation styling;
- **Marine** — bathymetric contours and water-system geometry;
- **Active track** — radar rings, route vectors, and live-surveillance styling;
- **Mythic** — constellation and historical-archive treatment;
- **Anomaly** — orbital and dimensional-spectrum geometry;
- **Artificial** — laboratory grid and specimen-system treatment;
- **Sealed** — redacted civilian silhouette with withheld-image language.

These are failure and classification treatments, not substitutes for the new evidence archive.

### 6. Restricted and sealed imagery

Restricted records never receive more revealing evidence through fallback or procedural generation than their public access permits.

Evidence records carry their own access description. Restricted civilian reconstructions communicate the finding while withholding precise coordinates, identities, containment geometry, or sensitive operational detail.

## Sources of truth

`src/app/02d-assets.js` governs:

- subject-art source policy;
- fallback timing and retry behavior;
- seven archive-reconstruction profiles;
- species-to-profile resolution;
- subject-image provenance metadata.

`src/app/02h-systems-evidence.js` governs:

- institutional evidence records;
- evidence codes, sources, classifications, and findings;
- local SVG visualization modes;
- meaningful alternative text;
- evidence-to-system, investigation, species, and region relationships.

`scripts/generate_release_assets.py` governs deterministic social and install artwork.

## Reliability behavior

1. Subject artwork resolves through the centralized template.
2. Missing or stalled subject art receives an authored reconstruction.
3. A recovered source may replace the reconstruction without changing canon or visitor state.
4. Successful subject art is cached after first load.
5. Institutional evidence visualization is generated locally and remains available offline.
6. Release artwork is regenerated and size-validated during preparation.
7. Browser assurance verifies failure treatment, evidence presence, responsive containment, accessibility, and visual-review captures.

## Rights and distribution boundary

GAIA Atlas is an independent, non-commercial fan project. The repository distinguishes original code and original GAIA presentation/evidence assets from Pokémon intellectual property and third-party artwork.

The current build references remote subject artwork rather than committing a copied local Pokémon-art library. The nine evidence plates are original institutional graphics and do not embed third-party scene art.

A future local subject-art cache or richer original scene package requires a deliberate rights, attribution, and distribution review before promoted public launch.

## Visual consistency rules

- Never show a browser broken-image icon.
- Never use one generic badge as the normal fallback for every subject.
- Never expose technical file errors to visitors.
- Never make restricted imagery more revealing through fallback or evidence treatment.
- Keep subject artwork subordinate to classification, geography, evidence, and consequence.
- Preserve warmth for companion and neighborhood species.
- Preserve scale and awe for mythic subjects without turning every record into a poster.
- Use animation only when it communicates tracking, recovery, scanning, or state.
- Evidence must respect established geography, access, scale, behavior, and canon.
- Match visualization language to the actual discipline: sonar should not look like electrical forensics; archaeology should not look like containment telemetry.
- Pair every evidence image with a human-readable finding and consequence.
- Avoid a repetitive “hero poster” composition; favor observation distance, imperfect data, institutional annotation, and environmental context.

## Next original-asset milestone

The strongest next visual package would include:

- six richer regional environmental plates, one for each completed field window;
- six dossier header scenes spanning ordinary, marine, mythic, dangerous, artificial, and anomalous subjects;
- three scene-level incident packages pairing a believable still with the current procedural data plate;
- sealed-subject treatment reviewed across every restricted flagship dossier;
- a documented attribution and replacement process.

The first evidence package closes the “described but not evidenced” architectural gap. The remaining goal is to increase atmosphere and scene realism without sacrificing the clarity, auditability, or offline reliability of the institutional records.
