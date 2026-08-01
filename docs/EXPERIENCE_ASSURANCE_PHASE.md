# GAIA Atlas — Experience Assurance Phase

**Status:** Automated private-build assurance  
**Branch:** `agent/gaia-foundation`

## Purpose

This phase checks whether the Atlas behaves like a finished public product across representative desktop, mobile, keyboard, reduced-motion, artwork-failure, and assistive-technology conditions.

It is deliberately separate from the signed canon and editorial payloads. Test failures can block deployment, but test code cannot modify population totals, locations, routes, dossiers, or ecology.

## Automated browser matrix

The private branch is tested through Playwright in:

- Chromium desktop at a large 1440-pixel viewport;
- Firefox desktop;
- Chromium mobile using a Pixel-class profile;
- WebKit mobile using an iPhone-class profile;
- Chromium desktop with reduced-motion preference enabled.

This matrix is device emulation, not a claim that physical hardware testing is complete.

## Core scenarios

Automated checks cover:

- application boot and loading-screen completion;
- no uncaught JavaScript errors during primary navigation;
- no unexpected horizontal overflow;
- Globe, Live, Index, Records, and Field Log reachability;
- keyboard shortcut and arrow-key search interaction;
- mixed search results for species, regions, and ecology features;
- species, region, habitat/corridor, incident, and archive deep links;
- dossier opening and closing;
- Regional Explorer and regional modal navigation;
- mobile bottom-navigation reachability;
- focus placement inside dialogs;
- reduced-motion preference detection;
- authored artwork fallback when the remote artwork network is unavailable;
- serious and critical accessibility violations through axe-core;
- representative desktop and mobile screenshots for human review.

## CI behavior

The browser-assurance job runs only after the structural validation job succeeds.

It installs pinned Playwright and axe-core dependencies, serves the repository root locally, runs the multi-project test suite, and uploads:

- Playwright’s HTML report;
- failure traces and screenshots;
- successful desktop and mobile review captures.

The artifacts are retained even when the job fails so the interface can be inspected rather than diagnosed from text alone.

## What automated tests cannot prove

The following still require real human and physical-device review before public launch:

- touch comfort on actual phones and tablets;
- screen-reader narrative quality, not merely rule compliance;
- color appearance on varied displays;
- motion comfort over extended browsing;
- map performance on older hardware;
- network behavior on real weak cellular connections;
- whether the interface feels emotionally convincing and beautiful to a first-time visitor.

Automation protects against regressions. It does not replace taste, field testing, or a genuine fresh-eye review.

## Launch threshold

A release candidate should not merge while:

- any structural or signed-data validator fails;
- any required browser project fails its core smoke test;
- serious or critical axe violations remain unexplained;
- mobile navigation is obscured or causes horizontal overflow;
- remote-artwork failure produces broken-image UI;
- screenshot review reveals a major visual regression.
