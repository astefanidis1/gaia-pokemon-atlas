# Showcase Prototype Archive

This directory is reserved for the pre-GAIA showcase build that established the original interactive globe, Pokémon avatar markers, filters, catalogue, cosmic views, comparison tools, range visualization, and offline fallback.

## Archive policy

- The preserved prototype is historical reference material.
- It should remain functionally unchanged once imported.
- New GAIA development belongs outside this directory.
- Useful systems may be ported into the GAIA architecture, but the archive itself should not become the production application.
- Large generated standalone files should not be treated as editable source.

## Original prototype contents

The archived project includes:

- `index.html`
- `styles.css`
- `app.js`
- `features.js`
- `range-explorer.js`
- `fallback-globe.js`
- `data.json` and generated `data.js`
- world geometry and vendored D3
- build, validation, smoke-test, and local-server scripts
- a generated standalone HTML release
- the original 161-entry population database

## Import note

The original prototype bundle was produced before this repository was created. Its large generated and binary assets are intentionally isolated from the new source architecture. When imported, they should be placed beneath this directory without changing the new root-level GAIA structure.
