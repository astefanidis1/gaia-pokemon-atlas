# GAIA Atlas — Release Candidate 1

**Status:** Private, draft, unmerged, and undeployed  
**RC version:** `2026-07-29.1`  
**Branch:** `agent/gaia-foundation`

## Purpose

Release Candidate 1 converts the validated living-world build into a production-shaped artifact without launching it. The phase concentrates on the first sixty seconds, share presentation, install identity, startup performance, weak-network behavior, and offline recovery.

No signed population canon, regional ecology payload, dossier text, route, or incident record is changed by this phase.

## First-visit experience

The Globe now contains an embedded **Priority World Brief** rather than a tutorial modal. It presents:

- one deterministic current migration record selected from the canonical five tracked routes;
- its current UTC-synchronized movement phase and next route position;
- one complete regional ecosystem with presence, habitat, and corridor counts;
- direct entry into the live dossier or regional field window.

The briefing can be dismissed and restored. Dismissal is stored only in the visitor's browser. It never blocks the Atlas or changes GAIA canon.

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

The social card and install icons are generated from readable Python source using only the standard library. They are not opaque design files that must be manually recreated.

## Failure and offline behavior

- The previous redirect-only 404 has been replaced by an authored **Coordinate Unresolved** GAIA error state.
- A dedicated **Civilian Archive Mode** offline page explains what remains available.
- The service worker now separates shell, runtime, and artwork caches.
- Same-origin shell assets use cache-first behavior.
- navigation uses a bounded network attempt followed by the cached Atlas or offline page;
- MapLibre runtime files are retained after a successful visit;
- official artwork uses stale-while-revalidate caching;
- old GAIA cache generations are removed during activation.

The Atlas is expected to reopen after one successful visit even when the browser is placed fully offline. Live tiles and uncached remote artwork may remain unavailable, while records, regional ecology, and the local Field Log continue functioning.

## Startup improvement

Readable source modules are still executed in their locked order, but they are fetched in parallel rather than through a sequential request waterfall. Local development now attempts each source root as one group instead of producing one failed request before every module fallback.

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

The existing Chromium, Firefox, mobile Chromium, mobile WebKit, reduced-motion, accessibility, search, deep-link, artwork-failure, and visual-layout suites remain active.

RC1 adds checks that:

- the first visit exposes a current track and regional ecosystem without forcing a modal;
- production Open Graph, Twitter, canonical, manifest, and touch-icon metadata exist;
- the install manifest is valid and includes a maskable icon;
- the Atlas reaches a usable local-globe state under a deliberately weak connection;
- the cached Atlas reopens while the browser is fully offline;
- the offline network state is visibly communicated.

The future Pages workflow cannot deploy until all RC checks pass.

## Human review still required

RC1 does not claim to replace:

- testing on physical phones and tablets;
- real screen-reader narrative review;
- older-device GPU and map-performance testing;
- genuine weak-cellular testing outside emulation;
- a small fresh-eye beta with people who have not been told how GAIA works;
- the explicit decision to merge or launch.

## Release boundary

This is a release candidate, not a release. The draft PR and `main` remain separate. Public deployment still requires an explicit later decision after RC evidence and fresh-eye feedback are reviewed.
