# GAIA Atlas — Visual Asset Strategy

**Version:** `2026-08-01.1`  
**Status:** Locked private-build policy  
**Scope:** Subject artwork, institutional release identity, evidence imagery, restricted presentation, failure states, and rights resilience

## Principle

Pokémon artwork communicates the subject. **GAIA owns the evidence presentation.**

The Atlas should never look like a loose gallery of images pulled from unrelated sources. Every image appears inside a consistent institutional system, and every missing or withheld image must feel intentional rather than broken.

## Asset hierarchy

### 1. Primary subject artwork

The current private build resolves standard species artwork through one centralized official-artwork URL template. Individual components no longer need to carry or invent source URLs.

This layer is preferred when available because visitors should recognize the Pokémon immediately.

### 2. Deterministic institutional release artwork

Release Candidate 1 introduced readable-source generation for:

- the 1200 × 630 GAIA social-sharing card;
- standard 192 px and 512 px install icons;
- a maskable install icon;
- the Apple touch icon.

These assets establish a coherent public identity and can be regenerated exactly. The social card has received internal pixel review and now reports the current six-region world state.

This layer is considered complete as institutional release identity. It does **not** replace scene-level evidence imagery.

### 3. Future original GAIA evidence visuals

The next premium layer should consist of original assets created specifically for the Atlas:

- regional environmental plates;
- satellite and aerial-survey frames;
- field-camera and low-light surveillance stills;
- dossier header scenes showing subjects inside believable environments;
- incident diagrams and damage assessments;
- containment and laboratory imagery;
- archaeological plates and historical reconstructions;
- infrastructure, agriculture, conservation, and public-safety evidence.

These assets should emphasize the world around the subject rather than merely replacing official character art with another isolated render.

The target reaction is not “nice Pokémon fan art.” It is:

> This looks like evidence that this organism exists in a functioning modern world.

### 4. Authored procedural archive reconstructions

When primary artwork fails, stalls, or is deliberately withheld, GAIA generates a species-specific archive reconstruction. The reconstruction uses the subject’s index number as a deterministic seed, so two species do not receive the same silhouette.

Seven visual profiles are defined:

- **Natural history** — topographic field lines and conservation styling;
- **Marine** — bathymetric contours and water-system geometry;
- **Active track** — radar rings, route vectors, and live-surveillance styling;
- **Mythic** — constellation and historical-archive treatment;
- **Anomaly** — orbital and dimensional-spectrum geometry;
- **Artificial** — laboratory grid and specimen-system treatment;
- **Sealed** — redacted civilian silhouette with withheld-image language.

These are not decorative random placeholders. Profile selection derives from public access, realm, classification, origin, habitat, and active-route status.

### 5. Restricted and sealed imagery

Restricted records do not automatically expose a clear subject image merely because an external artwork source is available.

The current policy treats Restricted and Sealed records through the **Sealed** profile when reconstruction is required. A future editorial override may force redaction even when source artwork loads, but that decision must be explicit per record rather than inferred casually.

## Centralized runtime policy

`src/app/02d-assets.js` is the current source of truth for:

- asset-policy version;
- remote artwork template;
- fallback timing and retry timing;
- classification profiles;
- species-to-profile resolution;
- deterministic archive reconstruction;
- image provenance metadata.

`scripts/generate_release_assets.py` is the source of truth for deterministic institutional release images and icons.

The runtime policy exposes `window.GAIA_ASSET_POLICY` for testing and future private tooling.

## Reliability behavior

1. The species record is resolved through the centralized artwork template.
2. Images are given a profile and policy version.
3. A source that errors or remains unresolved past the grace period is replaced with an authored reconstruction.
4. The original source is retried later when the device is online.
5. A successful retry restores the primary artwork without changing canon or visitor state.
6. The service worker caches successful remote artwork responses after first load.
7. Institutional release artwork is regenerated and size-validated during release preparation.

## Rights and distribution boundary

GAIA Atlas is an independent, non-commercial fan project. The repository must continue distinguishing original code and original GAIA presentation assets from Pokémon intellectual property and third-party artwork.

The current build references remote artwork rather than committing a copied local artwork library. A future local cache or original-image package requires a deliberate rights, attribution, and distribution review before promoted public launch.

## Visual consistency rules

- Never show a browser broken-image icon.
- Never use one generic letter badge as the normal fallback for every subject.
- Never expose file-source or technical error language to the visitor.
- Never make restricted imagery more revealing through a fallback than through the normal record.
- Keep subject art subordinate to record classification, geography, and evidence context.
- Preserve recognizable warmth for companion and neighborhood species.
- Preserve awe and scale for mythic subjects without turning every card into a poster.
- Use animation only when it communicates tracking, recovery, or state.
- Evidence scenes must respect the established geography, access level, scale, behavior, and current canon of their subject.
- Avoid repetitive poster compositions; favor observation distance, environmental context, imperfect evidence, and institutional annotation.

## Next original-asset milestone

Before Alex promotes the site, the strongest next visual package would include:

- six regional environmental plates, one for each completed field window;
- six dossier header scenes spanning ordinary, mythic, marine, artificial, dangerous, and anomalous subjects;
- three incident or archive evidence images demonstrating surveillance, archaeology, and containment;
- sealed-subject silhouette rules reviewed against every restricted flagship dossier;
- a documented attribution and replacement process.

The procedural and release systems are strong enough to protect product quality. They are not intended to replace the eventual evidence-art layer.
