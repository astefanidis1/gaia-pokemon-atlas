# GAIA Atlas Foundation Changelog

## World Completion Pass I — August 1, 2026

### Added

- Separately checksummed editorial layer `2026-08-01.1`, chained to exact ecology version `2026-07-28.2`
- Central Andes Cloud-Forest Corridor field window with 18 presences, 5 explicit limits, 4 habitats, 3 corridors, and complete Southern Hemisphere seasonality
- East African Rift Highland Mosaic field window with 18 presences, 5 explicit limits, 4 habitats, 3 corridors, and long-rain / dry-season / short-rain interpretation
- Eight new causal ecological relationships across Andean and Rift highland systems
- Final Pass I totals of 6 regional windows, 24 habitats, 18 corridors, and 24 relationships without changing any exact population
- Complete Civilian Summary Record publication tier for every species without a full GAIA dossier
- Publication-tier labels distinguishing Full GAIA Dossiers from complete civilian summaries
- Expanded GAIA Live world state covering five routes, six regional conditions, active ecology systems, and rotating causal relationships
- Canonical-location observation modal with current route zones, automatic date, update/remove behavior, and browser-local storage
- Observation blocking for sealed, non-Earth, archived, contact-lost, and fully withheld records
- Field Log observation cards containing canonical location, location type, and observation date
- In-universe archive-document reader with code, classification, abstract, cross-reference facts, previous/next navigation, dossier return, and shareable links
- GAIA Index filters for danger, mobility, and publication depth plus population, danger, and name sorting
- World Completion browser scenarios for summary records, world-state Live, observations, archive reading, Index behavior, and new-region search
- Restrained ZANDROS music credit inside Alex’s founder biography with a protected external link

### Corrected

- Removed the public sentence saying that a complete flagship dossier had not yet been published
- Reframed shallow records as intentional publication products rather than incomplete versions of full dossiers
- Rebuilt Observed from a species-level checkbox into a canonical-location personal record
- Expanded GAIA Live beyond the misleading implication that only five tracked entities constituted the current world state
- Shortened the mobile search placeholder to remain readable on small screens
- Advanced the readable application architecture to thirteen ordered modules
- Advanced the offline shell to include World Completion code, styling, and editorial data
- Updated deterministic social-card metrics from four to six regional ecosystems
- Removed stale static version labels and obsolete ecology-time footer replacement logic

### Validation boundary

- Phase 4 validation protects the new payload checksum, version chain, counts, coordinates, species references, full January–December seasonality, and relationships
- Existing signed population canon, permanent forms, routes, dossiers, incidents, and Phase 3 ecology remain unchanged
- Future deployment remains gated on the complete structural, browser, accessibility, weak-network, offline, and World Completion suite
- Repository visibility is separate from launch status: the branch remains unmerged, undeployed, and unpromoted

## Release Candidate 1 — July 29, 2026

### Added

- Embedded Priority World Brief pairing one UTC-synchronized canonical movement record with one complete regional ecosystem
- Local dismissal/restoration of the briefing without a tutorial gate or canon mutation
- Production-shaped document title, description, canonical URL, Open Graph, Twitter/X, mobile-app, and install-manifest metadata
- Deterministically generated 1200 × 630 GAIA social-sharing card
- Deterministically generated 192 px, 512 px, maskable, and Apple-touch install icons
- Web-app manifest with direct shortcuts to GAIA Live, Records, and Index
- Authored Coordinate Unresolved 404 page
- Authored Civilian Archive Mode offline page
- Separate shell, runtime, and artwork cache generations
- Network-state communication through Network Active and Offline Archive treatments
- Hard static budgets for shell weight, data weight, largest text asset, social/install assets, and service-worker complexity
- Browser-enforced timing budgets for weak-network usability and cached offline reopening
- RC-specific Playwright scenarios for first visit, production metadata, manifest validity, artificial network latency, and complete offline mode
- Deterministic release-preparation and release-validation scripts
- Release Candidate documentation and deployment evidence artifacts

### Improved through RC review

- Twelve readable source modules now fetch in parallel while retaining their locked execution order
- Local development no longer produces one failed source request before every fallback module
- The first-visit briefing moved out of the desktop civilian terminal into a separate cinematic map overlay
- Mobile first-visit briefing was compacted below the fallback-message safety boundary
- The application now registers its service worker rather than merely shipping one
- Service-worker navigation uses a bounded live attempt before falling back to the cached Atlas or offline page
- MapLibre runtime files and successful artwork requests can be reused after the network disappears
- Regional Explorer launch typography now reads cleanly at common desktop heights
- Fallback explanation text no longer stretches behind the civilian terminal
- Social-card evidence copy was shortened to preserve clear separation from the GAIA seal

### Validated

- Static Release Candidate metadata, assets, cache structure, and performance budgets passed on the first structural run
- Browser failures in early RC iterations exposed and corrected semantic footer misuse, desktop containment, missing service-worker registration, and a six-pixel mobile fallback collision
- Final RC matrix passed 24 active scenarios across desktop Chromium, desktop Firefox, mobile Chromium, mobile WebKit, and reduced-motion Chromium
- Artificial weak-network and fully offline cached-reopen scenarios passed
- No signed population, route, dossier, incident, or ecology payload was changed

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
