# GAIA Atlas Foundation Changelog

## Visual asset and experience-assurance phase — July 29, 2026

### Added

- Centralized visual asset manifest `2026-07-29.1` with one replaceable official-artwork URL policy
- Seven authored deterministic archive-reconstruction profiles: natural history, marine, active track, mythic, anomaly, artificial, and sealed
- Species-specific procedural silhouettes, profile motifs, retry behavior, source metadata, and About-page visual-evidence policy
- Eleven-module readable browser architecture, including separate asset and assurance layers
- Playwright projects for desktop Chromium, desktop Firefox, mobile Chromium, mobile WebKit, and reduced-motion Chromium
- axe-core serious/critical accessibility checks on representative desktop and mobile surfaces
- Automated species, region, ecology, incident, and archive deep-link restoration checks
- Remote-artwork failure simulation and authored-fallback verification
- Responsive composition checks covering desktop panel separation, ticker clearance, Regional Explorer containment, fixed mobile navigation, and fallback-message clearance
- CI-uploaded browser reports, traces, failure media, and successful desktop/mobile review captures
- Deployment gating on the complete structural and experience-assurance suite

### Corrected through browser and screenshot review

- Search input now exposes a valid combobox relationship to its listbox results
- Closed dossiers and dialogs become inert so hidden controls cannot receive assistive focus
- Skip-link, footer, regional-card, Regional Explorer, and field-window action contrast now survive browser-native button defaults
- Reduced-motion preference changes runtime motion behavior rather than existing only as a stylesheet promise
- Authored archive fallback state no longer races with the fallback SVG load event
- Mobile navigation now resolves to a fixed five-destination bottom bar
- Dense ecology controls are removed from the small-screen globe while Regional Explorer remains directly available
- Mobile fallback and field-window layouts were re-composed around real viewport height
- Desktop Earth-surveillance and ecology panels no longer overlap
- The desktop civilian terminal remains clear of the surveillance ticker and keeps its Regional Explorer action fully visible at common laptop heights
- GitHub Actions browser tooling moved to the current Node 24 runtime

## Atlas continuity pass — July 28, 2026

### Added

- Universal search across species, locations, regional windows, habitats, corridors, incidents, and linked archive records
- Shareable deep links for species, regions, ecology features, incidents, and archive files
- Connected World Ecology sections inside dossiers, linking species directly to their documented regions and mapped systems
- Explicit civilian build metadata separating canon correction `2026-07-27.1` from ecology layer `2026-07-28.2`
- Strict UTF-8 documentation and release-integrity validation in CI

### Corrected

- Restored the corrupted `WORLD_ECOLOGY_PHASE_3.md` as readable source-of-truth documentation
- Replaced the stale runtime canon label with explicit canon and ecology versions
- Removed the obsolete `public/code/` architecture description from `POLISH_PASS.md`
- Corrected local-development instructions to serve the repository root and open `/public/`
- Advanced the service-worker cache and deterministic loader to include the continuity module and styles

## Pre-launch refinement — July 27, 2026

### Added

- GAIA census-methodology brief explaining persistent signatures, sensor reconciliation, population audit, and public precision
- Public status key for Actively Tracked, Verified, Archived / Contact Lost, and access classifications
- Live surveillance ticker across the five deterministic movement routes
- Local minimal-globe mode that preserves canonical markers when the external basemap fails
- Twelve selected core records alongside the twelve full flagship dossiers
- Records filters for all records, full dossiers, active tracks, and restricted access
- Three featured full-dossier spotlights
- Species-specific procedural archive visuals after remote-artwork timeout
- Late recovery to remote artwork when the original asset becomes available
- Service-worker caching for the public shell and successfully loaded official-artwork responses

### Refined

- Record cards now vary more clearly by subject tone and access state
- Full dossiers are surfaced in search and Index metadata
- Map activity feels live without introducing fictional visitor-generated events
- Pre-launch styling is isolated in a versioned refinement layer so the stable foundation stylesheet remains easy to audit
- The deployed application now loads the same readable source modules reviewed in the repository instead of an opaque compressed code payload

## Foundation polish — July 27, 2026

### Added

- Twelve launch-quality flagship dossiers
- Twenty-four additional deep-dossier sections
- Founder field notes and twenty-four linked archive records
- Public field advisories tailored to each flagship species
- New England Coastal Forest regional field window
- Twelve documented regional presences and four explicit regional absences
- Manual region-to-globe focus without automatic geolocation
- Mobile bottom navigation and safe-area handling
- Keyboard search-result navigation and focus restoration
- Modal focus containment, skip navigation, reduced-motion support, and higher-contrast adaptation
- Native share-sheet support with clipboard fallback
- Readable application source and deterministic public-loader tooling
- Editorial, regional, and source/loader synchronization checks in CI

### Refined

- Records now distinguish full dossiers from core records
- Dossier tone and accent styling adapts by subject
- Map legend and public-status communication are clearer
- Remote-artwork failure states use a consistent GAIA fallback treatment
- The loading sequence communicates census, route, and access initialization

## Foundation draft — July 27, 2026

### Added

- GAIA agency identity, public information architecture, and visual system
- Canonical species, permanent-form, population, location, route, and incident layers
- Migrated exceptional-species roster with exact present-day census totals
- Deterministic seasonal movement for the first five tracked species
- Progressive geographic disclosure and non-Earth realm views
- Personal browser-local Field Log
- Flagship dossier and incident-record presentation
- Canon checksum, population reconciliation, and reference validation
- Automated pull-request validation and GitHub Pages deployment workflows

### Corrected during implementation

- Urshifu is represented as one species with a total population of 16 and two permanent form populations: seven Single Strike adults at Shaolin and nine Rapid Strike adults at Emei.
- Visitor discovery remains a personal record rather than a content lock.
- Public access classification is distinct from GAIA knowledge status.
- Population verification dates are distinct from continuously updated seasonal position.
- Articuno, Zapdos, Moltres, and Lugia resolve to `Actively Tracked` whenever their canonical current-position routes are active. The correction is versioned separately, applied by the browser loader, and enforced by deployment validation.

### Preserved

- The pre-GAIA showcase prototype remains outside the new public architecture and is not overwritten by this branch.
