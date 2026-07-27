# GAIA Atlas — Launch Polish Pass

The foundation branch now includes the first launch-quality editorial and interaction layer without changing the signed population canon.

## Content added

- Twelve full flagship dossiers
- Twenty-four additional deep-dossier sections
- Distinct founder field notes
- Twenty-four linked archive records
- Species-specific public field advisories
- New England Coastal Forest regional field window
- Twelve documented regional presences and four explicit absences

## Experience refined

- Mobile bottom navigation with safe-area handling
- Keyboard search-result navigation
- Focus restoration and modal focus containment
- Skip navigation, reduced-motion support, and higher-contrast adaptation
- Native share-sheet support with clipboard fallback
- Clearer map legend, access-status, loading, and artwork-fallback language

## Validation model

Readable JavaScript lives under `src/app/`. The compact browser payload under `public/code/` is decompressed during CI and compared directly with that source, avoiding environment-dependent compression-byte comparisons while still proving deployed code equality.

Canon, corrections, editorial dossiers, regional references, Python scripts, JavaScript syntax, and required public files are all validated before deployment.
