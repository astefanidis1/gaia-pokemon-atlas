# GAIA Atlas Foundation Changelog

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
- Readable application source and deterministic public-bundle build tooling
- Editorial, regional, and source/bundle synchronization checks in CI

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

- Urshifu is represented as one species with a total population of 16 and two permanent form populations: seven Single Strike adults and nine Rapid Strike adults.
- Visitor discovery remains a personal record rather than a content lock.
- Public access classification is distinct from GAIA knowledge status.
- Population verification dates are distinct from continuously updated seasonal position.
- Articuno, Zapdos, Moltres, and Lugia resolve to `Actively Tracked` whenever their canonical current-position routes are active. The correction is versioned separately, applied by the browser loader, and enforced by deployment validation.

### Preserved

- The pre-GAIA showcase prototype remains outside the new public architecture and is not overwritten by this branch.
