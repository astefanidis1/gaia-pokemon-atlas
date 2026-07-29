# GAIA Atlas — Launch Polish Pass

The foundation branch includes the first launch-quality editorial and interaction layer without changing the signed population canon.

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

Readable JavaScript lives under `src/app/*.js`. `public/app.js` contains the deterministic ordered module list used by the browser. GitHub Pages stages those exact reviewed modules into `public/source/`, while repository-root local development can load the same files directly from `src/app/`.

`scripts/build_public.py --check` confirms that the public loader and readable source-module list remain synchronized. CI then validates canon, corrections, editorial dossiers, regional references, Python scripts, concatenated JavaScript syntax, service-worker syntax, and all required deployment files before deployment is permitted.
