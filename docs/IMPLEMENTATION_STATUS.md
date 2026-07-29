# GAIA Atlas — Implementation Status

**Branch:** `agent/gaia-foundation`  
**Status:** Private Release Candidate 1 (`2026-07-29.1`)  
**Product source of truth:** `docs/GAIA_Atlas_Master_Plan.md`

## Implemented in this branch

- GAIA visual identity, seal, motto, agency framing, founders, and quiet fan-project notice
- Globe-first navigation with GAIA Live, Index, Records, and Field Log
- Separate Species, permanent Form, Population, Location, Route, and Incident entities
- 161 verified species records, 2 permanent Urshifu forms, 162 reconciled populations, 162 locations, 5 deterministic routes, and 3 incidents
- Exact census totals with separate verification, knowledge, and access states
- Discovered, Observed, and Favorite browser-local visitor states
- **27 full dossiers** with ecology, advisories, founder notes, and archive records
- **4 regional field windows**: New England, Aegean / Eastern Mediterranean, Pacific Northwest, and Central Honshu
- Regional Explorer with resident, seasonal, and managed-partner comparison filters
- **16 mapped habitat systems and 12 ecological corridors**
- Real-calendar seasonal cycles for all four regions and intensity profiles for all mapped ecology features
- **16 ecological relationships** covering predation, pollination, infrastructure, working partnerships, nutrient transfer, and coexistence
- Clickable habitat and corridor layers with seasonal state, linked species, and regional navigation
- New England habitat and corridor geometry, bringing every regional window onto the same ecology architecture
- Universal search across species, locations, regions, habitats, corridors, incidents, and archive records
- Shareable hash links for species, regions, ecology features, incidents, and archive files
- Dossier ecology cross-references linking species to documented regions, habitats, corridors, and relationships
- Centralized visual asset policy `2026-07-29.1` with one replaceable artwork source and seven deterministic GAIA reconstruction profiles
- Classification-aware natural-history, marine, active-track, mythic, anomaly, artificial, and sealed fallback imagery
- Deterministically generated 1200 × 630 social-sharing card plus standard, maskable, and Apple install icons
- Production canonical, Open Graph, Twitter/X, install-manifest, and mobile-app metadata
- First-visit **Priority World Brief** pairing one canonical active track with one complete regional ecosystem without forcing a modal or blocking exploration
- Authored Coordinate Unresolved 404 page and Civilian Archive Mode offline page
- Separate versioned shell, runtime, and artwork caches with live network-state communication
- Cached offline reopening after a successful visit
- Ordered parallel loading of twelve readable browser modules, eliminating the sequential startup waterfall
- Responsive desktop/mobile presentation, keyboard navigation, modal focus containment, reduced-motion support, and contrast adaptations
- Mobile fixed-bottom navigation and compact globe terminal; desktop panel-collision controls at common viewport heights
- Public census methodology, status-key brief, visual-evidence policy, and explicit canon/editorial/asset/assurance/RC build metadata
- Signed Phase 3 editorial payload chained to the exact Phase 2 version
- Strict UTF-8 documentation and release-metadata integrity validation
- Static performance budgets for critical shell, data payload, largest text asset, social/install assets, and service-worker complexity
- Runtime budgets for deliberately weak-network usability and fully offline cached reopening
- GitHub Pages deployment workflow gated behind canon, editorial, ecology, documentation, syntax, loader, asset, accessibility, responsive-layout, performance, weak-network, offline, and browser checks

## Validated

- Canon reconciliation and foreign-key validation passed
- Phase 2 world-density validation passed
- Phase 3 checksum, version chain, dossier, region, species, geometry, seasonality, and relationship validation passed
- All four regions resolve to their exact final presence, absence, habitat, and corridor counts
- All 28 geometry features have valid real-calendar season profiles
- Readable JavaScript source and the deterministic public loader are synchronized
- Documentation is checked as strict UTF-8 and the Phase 3 report is protected against corruption
- Release metadata identifies canon correction `2026-07-27.1`, ecology layer `2026-07-28.2`, visual policy `2026-07-29.1`, assurance layer `2026-07-29.1`, and RC1 `2026-07-29.1`
- Python compilation and complete concatenated JavaScript syntax checks pass in CI
- Playwright runs on desktop Chromium, desktop Firefox, mobile Chromium, mobile WebKit, and reduced-motion Chromium
- Primary Globe and Records surfaces pass serious/critical axe-core checks in representative desktop and mobile scans
- Species, region, ecology, incident, and archive deep links restore their intended context
- Artwork-network failure produces an authored species-specific GAIA reconstruction rather than a broken image
- Responsive assertions prevent desktop panel/ticker collisions, hide dense ecology controls on mobile, preserve the Regional Explorer action, and enforce fixed mobile navigation
- First-visit RC checks verify a current route, a regional ecosystem, production metadata, valid install manifest, and no forced tutorial modal
- Artificial weak-network testing reaches a usable local-globe state inside the defined budget
- A previously visited Atlas reopens from its cached shell with the browser fully offline and reports Offline Archive state
- The final RC matrix passed **24 active scenarios** across the five browser/device profiles, with only deliberate project-specific skips
- CI-generated desktop/mobile captures and the generated social card were manually reviewed; the review found and corrected terminal typography, mobile fallback clearance, and share-card text collision before this status was recorded

## Intentionally deferred

- Broader common-species range and density coverage across additional parts of Earth
- Full dossier depth for every species
- Additional environmental and individual movement systems
- Original bespoke regional plates and dossier scenes beyond the current procedural/official-art presentation
- Physical-device testing and qualitative screen-reader review beyond automated emulation and rule checks
- Real weak-cellular and older-device GPU/map-performance testing outside CI
- A small fresh-eye human beta with people who have not been told how GAIA works
- Public observation infrastructure, only after the core experience is mature
- Final merge, deployment, and public-launch approval

## Review boundary

This branch remains intentionally unmerged and undeployed. RC1 is production-shaped and technically validated, but passing CI does not authorize release. Physical-device review, qualitative assistive-technology review, fresh-eye beta feedback, and an explicit owner decision remain required before merging or deploying.
