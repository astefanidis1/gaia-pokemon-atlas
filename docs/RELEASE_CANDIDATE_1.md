# GAIA Atlas — Release Candidate 1

**Status:** Completed private release foundation; superseded in product depth by World Completion Pass I  
**RC version:** `2026-07-29.1`  
**Current completion layer:** `2026-08-01.1`  
**Branch:** `agent/gaia-foundation`

## Purpose

Release Candidate 1 converted the validated living-world build into a production-shaped artifact without launching it. The phase concentrated on the first sixty seconds, share presentation, install identity, startup performance, weak-network behavior, and offline recovery.

RC1 remains the release-engineering foundation beneath World Completion Pass I. No signed population canon, regional ecology payload, dossier text, route, or incident record was changed by the RC phase.

## First-visit experience

The Globe contains an embedded **Priority World Brief** rather than a tutorial modal. It presents:

- one deterministic current migration record selected from the canonical five tracked routes;
- its current UTC-synchronized movement phase and next route position;
- one complete regional ecosystem with presence, habitat, and corridor counts;
- direct entry into the live dossier or regional field window.

The briefing can be dismissed and restored. Dismissal is stored only in the visitor's browser. It never blocks the Atlas or changes GAIA canon.

World Completion Pass I later expanded the available regional set from four to six while preserving this first-visit architecture.

## Production identity

RC preparation deterministically materializes:

- a stronger document title and search description;
- canonical and Open Graph URLs;
- a 1200 × 630 GAIA social-sharing image;
- Twitter/X large-card metadata;
- application and Apple mobile metadata;
- a web-app manifest;
- 192 px, 512 px, maskable, and Apple-touch icons;
- explicit Release Candidate metadata.

The social card and install icons are generated from readable Python source using only the standard library. They are not opaque design files that must be manually recreated. The current generated card now reports six regional ecosystems and identifies the World Completion private build.

## Failure and offline behavior

- The previous redirect-only 404 was replaced by an authored **Coordinate Unresolved** GAIA error state.
- A dedicated **Civilian Archive Mode** offline page explains what remains available.
- The service worker separates shell, runtime, and artwork caches.
- Same-origin shell assets use cache-first behavior.
- Navigation uses a bounded network attempt followed by the cached Atlas or offline page.
- MapLibre runtime files are retained after a successful visit.
- Official artwork uses stale-while-revalidate caching.
- Old GAIA cache generations are removed during activation.

The Atlas is expected to reopen after one successful visit even when the browser is placed fully offline. Live tiles and uncached remote artwork may remain unavailable, while records, regional ecology, and the local Field Log continue functioning.

## Startup improvement

Readable source modules execute in their locked order but fetch in parallel rather than through a sequential request waterfall. The module list has since grown from twelve to thirteen with the World Completion layer while retaining the same reviewed-loading model.

## Performance budgets

`performance-budgets.json` defines hard ceilings for:

- critical shell size;
- signed/editorial data payload size;
- the largest text asset;
- social-preview size;
- install-icon size;
- service-worker shell complexity;
- weak-network time to a usable Atlas;
- cached offline reopen time.

`scripts/validate_release_candidate.py` enforces the static budgets. Playwright enforces the time-based budgets under artificial latency and complete offline mode.

## Automated RC scenarios

The Chromium, Firefox, mobile Chromium, mobile WebKit, reduced-motion, accessibility, search, deep-link, artwork-failure, and visual-layout suites remain active.

RC1 added checks that:

- the first visit exposes a current track and regional ecosystem without forcing a modal;
- production Open Graph, Twitter, canonical, manifest, and touch-icon metadata exist;
- the install manifest is valid and includes a maskable icon;
- the Atlas reaches a usable local-globe state under a deliberately weak connection;
- the cached Atlas reopens while the browser is fully offline;
- the offline network state is visibly communicated.

World Completion Pass I adds a separate test file for record tiers, expanded Live, location-specific observations, archive reading, Index depth, and new regional ecology.

The future Pages workflow cannot deploy until all RC and World Completion checks pass.

## Human review still required

The release infrastructure does not claim to replace:

- testing on Alex’s physical devices;
- real screen-reader narrative review;
- older-device GPU and map-performance testing;
- genuine weak-cellular testing outside emulation;
- original evidence-image art direction;
- the explicit decision to merge, deploy, or promote.

## Release boundary

This remains a private development build, not a promoted release. The repository may remain publicly viewable, but the draft PR and `main` remain separate and the site remains undeployed. Promotion requires Alex’s explicit later decision.
