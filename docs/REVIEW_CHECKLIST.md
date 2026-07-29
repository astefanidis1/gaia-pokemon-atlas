# GAIA Foundation Review Checklist

Use this checklist before merging the foundation branch. Checked items are enforced or already verified by the current private-build tooling. Unchecked items still require deliberate human launch review.

## Product direction — manual review

- [ ] The globe is visually and functionally primary on a successful live basemap, not only in fallback mode.
- [ ] The interface feels like GAIA, not a general Pokédex or editing dashboard.
- [ ] Globe, GAIA Live, Index, Records, and Field Log match the locked information architecture.
- [ ] The tone is ominous, realistic, mythic, and beautiful without making every record grim.
- [ ] The first ten minutes naturally produce the intended species → ecology → relationship → archive rabbit hole.
- [x] No Canon Studio, visitor notes, alternate canon, custom expeditions, or automatic geolocation appear publicly.

## First-visit and release surface — automated structure, final human judgment open

- [x] The first visit offers one current canonical route and one functioning regional ecosystem without forcing a tutorial modal.
- [x] Dismissing the Priority World Brief affects only browser-local visitor state.
- [x] The desktop briefing is separate from the civilian controls and does not clip their primary actions.
- [x] The mobile briefing remains below the fallback-message safety boundary.
- [x] Canonical, Open Graph, Twitter/X, install-manifest, and mobile-app metadata are materialized deterministically.
- [x] The 1200 × 630 social card and standard/maskable/touch icons are generated from readable source.
- [x] Social-card text and seal separation received an internal pixel review and correction.
- [ ] The owner approves the final opening composition, share card, page title, and public metadata.

## Canon and editorial separation — automated

- [x] Exact living populations are displayed as authoritative current canon.
- [x] Species, permanent forms, populations, locations, routes, and incidents remain separate entities.
- [x] Editorial dossiers and regional field windows do not silently modify signed census totals.
- [x] Release preparation changes presentation and generated assets only; it does not modify signed canon or ecology.
- [x] Urshifu totals 16 across seven Single Strike and nine Rapid Strike adults.
- [x] Zygarde is treated as one distributed organism.
- [x] Ultra Beast counts describe the named accessible population rather than an infinite multiverse.
- [x] Visitor state never modifies canon.

## Content — manual review

- [ ] All 27 full dossiers feel meaningfully deeper than core records.
- [ ] Founder notes sound distinct without turning the site into a character-driven story.
- [ ] The New England field window feels biologically ordinary and realistic.
- [ ] Tyranitar is absent, Metagross is institutional only, and Dragonite is a rare coastal transient rather than a resident.
- [ ] Mature material serves the world rather than becoming spectacle.
- [ ] All four regional windows feel environmentally distinct rather than reskinned.
- [ ] Seasonal state and ecological relationships add causal realism rather than decorative activity.

## Interaction — automated

- [x] Search opens the correct species, region, habitat, corridor, incident, or archive target.
- [x] Arrow-key search navigation and Enter selection work across mixed result types.
- [x] Species, region, ecology, incident, and archive deep links restore the intended view.
- [x] Install-manifest shortcuts restore GAIA Live, Records, and Index.
- [x] Dossier ecology links lead to the correct regional window or mapped system.
- [x] Date-driven routes display the same canonical state to every visitor.
- [x] Discovered, Observed, and Favorite states persist locally without modifying canon.
- [x] Public records remain searchable without artificial discovery locks.
- [x] Records filters meaningfully separate full dossiers, live tracks, restricted files, and selected core records.
- [x] The census-methodology brief explains exact totals without becoming a tutorial interruption.
- [x] Restricted records reduce public precision without weakening internal canon.
- [x] Regional field windows open, link to dossiers, and focus the globe without requesting location access.

## Browser, accessibility, responsive, and network assurance — automated

- [x] Desktop Chromium, desktop Firefox, mobile Chromium, mobile WebKit, and reduced-motion Chromium complete the required suite.
- [x] The Globe and Records surfaces have no serious or critical axe-core violations in representative desktop and mobile scans.
- [x] Hidden dossiers and dialogs are inert and cannot leak focus to assistive technology.
- [x] Search exposes a valid combobox/listbox relationship.
- [x] Mobile navigation is a fixed five-destination bottom bar and does not create horizontal overflow.
- [x] Desktop civilian and ecology panels remain separated from one another and the surveillance ticker.
- [x] Regional Explorer remains fully visible and contained at common desktop and mobile viewport sizes.
- [x] Mobile fallback and field-window layouts preserve their primary actions without native light-button leakage.
- [x] Reduced-motion preference changes runtime behavior.
- [x] Remote-artwork failure produces an authored species-specific archive reconstruction.
- [x] The service worker registers and uses separate versioned shell, runtime, and artwork caches.
- [x] Artificial weak-network testing reaches a usable Atlas inside the declared timing budget.
- [x] A previously visited Atlas reopens while the browser is fully offline and communicates Offline Archive state.
- [x] CI retains reports, traces, screenshots, generated share artwork, and failure media for review.

## Visual asset policy — automated structure, manual art review

- [x] Artwork source selection is centralized and replaceable.
- [x] Seven deterministic fallback profiles exist for natural-history, marine, tracked, mythic, anomaly, artificial, and sealed subjects.
- [x] A browser broken-image icon is never the intended failure state.
- [x] Restricted fallback imagery does not become more revealing than the record’s access treatment.
- [x] The generated social-preview image received internal composition review.
- [ ] Original bespoke regional plates and dossier scenes receive art-direction review before a future local artwork package is added.
- [ ] Rights, attribution, and replacement procedures are reviewed before any local Pokémon artwork package is distributed.

## Performance and release integrity — automated

- [x] Twelve readable source modules fetch in parallel and execute in the locked reviewed order.
- [x] The critical shell, signed/editorial data, largest text asset, social card, and install icons remain inside declared budgets.
- [x] Service-worker shell complexity remains inside its declared entry budget.
- [x] Release preparation is deterministic and idempotent.
- [x] The future Pages workflow materializes and validates the exact artifact it would deploy.
- [x] Runtime metadata distinguishes canon correction `2026-07-27.1`, ecology `2026-07-28.2`, assets `2026-07-29.1`, assurance `2026-07-29.1`, and RC1 `2026-07-29.1`.
- [x] README local-run instructions prepare and load the exact RC artifact.
- [x] Every Markdown file is valid UTF-8 with no corrupted control bytes.
- [x] `src/app/*.js` and `public/app.js` are synchronized.
- [x] All canon, ecology, integrity, syntax, asset, accessibility, responsive-layout, budget, weak-network, offline, and required-file checks pass before deployment can run.

## Final physical and human launch review — still open

- [ ] Test on at least one physical iPhone, one physical Android phone, one tablet, and one desktop/laptop outside CI.
- [ ] Complete qualitative VoiceOver or NVDA review of navigation order, modal announcements, and dossier reading flow.
- [ ] Test the live basemap, local minimal-globe mode, offline shell, and weak-network recovery on real connections.
- [ ] Test map performance on at least one older or lower-powered device.
- [ ] Review color, motion comfort, touch targets, and scroll behavior on actual displays.
- [ ] Give the private RC to 3–5 fresh-eye visitors without explaining the product first and record where they click, hesitate, and leave.
- [ ] Confirm the legal notice remains quiet but accessible in the footer, About view, and README.
- [ ] Make an explicit decision to merge and deploy; passing CI alone does not authorize launch.
