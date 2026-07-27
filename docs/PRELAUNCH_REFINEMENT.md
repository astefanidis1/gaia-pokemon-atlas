# GAIA Atlas — Pre-launch Refinement Pass

The project remains private by design. This pass addresses the weaknesses identified during the fresh-eye review without expanding scope randomly or weakening the signed canon model.

## Product improvements

- Added a concise GAIA census-methodology brief and public status key.
- Expanded Records from twelve full dossiers to a curated 24-record archive with meaningful filters.
- Added three featured dossier spotlights so first-time visitors encounter the deepest content quickly.
- Added a live surveillance ticker driven only by the five canonical deterministic routes.
- Added a local minimal-globe mode so marker exploration survives an external basemap failure.

## Asset reliability

- Remote species artwork receives a three-second grace window.
- Missing or stalled artwork is replaced with a species-specific procedural GAIA archive visual rather than a generic letter badge.
- The original remote asset is retried later and restored when it becomes available.
- A versioned service worker caches the application shell and successful official-artwork responses after first load.

## Technical safeguards

- Readable source remains under `src/app/`.
- The public loader is regenerated deterministically from the readable source-module list during validation.
- The Pages workflow stages those exact reviewed modules into the deployable public artifact.
- Canon, corrections, editorial dossiers, regional records, service-worker syntax, and required public files are checked before deployment.
- Stable foundation styles remain in `styles.css`; the private pre-launch layer is isolated in `refinement.css` for easier review and rollback.

## Remaining private-roadmap priorities

- Expand ordinary ecology beyond the first New England field window.
- Add more full dossiers without flattening their quality.
- Improve map density through verified ranges and corridors rather than decorative fake activity.
- Complete assistive-technology and physical-device testing.
- Revisit launch only when the private build feels meaningfully stronger than the current already-deployable foundation.
