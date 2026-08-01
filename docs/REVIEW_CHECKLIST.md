# GAIA Foundation Review Checklist

Use this checklist before merging the foundation branch. Checked items are enforced or already verified by the current private-build tooling. Unchecked items still require deliberate owner judgment before promotion or launch.

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
- [x] The social card reports the current six-region world rather than the former four-region state.
- [ ] Alex approves the final opening composition, share card, page title, and public metadata.

## Canon and editorial separation — automated

- [x] Exact living populations are displayed as authoritative current canon.
- [x] Species, permanent forms, populations, locations, routes, and incidents remain separate entities.
- [x] Editorial dossiers and regional field windows do not silently modify signed census totals.
- [x] Release and World Completion preparation change presentation and editorial ecology only; they do not modify signed population canon.
- [x] Phase 4 is chained to the exact Phase 3 ecology version and protected by a separate checksum.
- [x] Urshifu totals 16 across seven Single Strike and nine Rapid Strike adults.
- [x] Zygarde is treated as one distributed organism.
- [x] Ultra Beast counts describe the named accessible population rather than an infinite multiverse.
- [x] Visitor state never modifies canon.

## Publication depth — automated structure, manual editorial review

- [x] Every species is presented as either a Full GAIA Dossier or a complete Civilian Summary Record.
- [x] Civilian Summary Records contain population, geography, ecology, danger, conservation, access, and publication-scope context.
- [x] Public records never state that their real or complete dossier has not yet been published.
- [x] Record cards and Index rows identify publication depth consistently.
- [ ] All 27 full dossiers feel meaningfully deeper than Civilian Summary Records.
- [ ] Founder notes sound distinct without turning the site into a character-driven story.
- [ ] Mature material serves the world rather than becoming spectacle.

## Regional world ecology — automated structure, manual realism review

- [x] Six regional windows resolve to their exact final presence, absence, habitat, and corridor counts.
- [x] New England, Aegean / Eastern Mediterranean, Pacific Northwest, Central Honshu, Central Andes, and East African Rift Highlands are all searchable and navigable.
- [x] All 42 mapped geometry features have complete January–December seasonality.
- [x] Twenty-four ecological relationships reference species documented inside their region.
- [x] Tyranitar is absent from New England, Metagross is institutional only, and Dragonite is a rare coastal transient rather than a resident.
- [ ] All six regional windows feel environmentally distinct rather than reskinned.
- [ ] Central Andes ordinary ecology feels vertically structured and culturally grounded rather than generically mountainous.
- [ ] East African Rift ecology feels like a highland/wetland/agricultural system rather than generic savanna shorthand.
- [ ] Seasonal state and ecological relationships add causal realism rather than decorative activity.

## Current world state — automated

- [x] GAIA Live retains the five deterministic canonical routes.
- [x] GAIA Live also displays all six current regional seasonal conditions.
- [x] Active and peak habitats/corridors derive from existing calendar profiles.
- [x] Relationship cards rotate deterministically from the published relationship layer.
- [x] No fake visitor activity or randomly fabricated breaking news is presented as canon.

## Field Log and personal observation — automated

- [x] Discovered, Observed, and Favorite states persist locally without modifying canon.
- [x] Observed requires selecting an existing public canonical Earth location or current route zone.
- [x] Observation date, location, and location type are preserved in the Field Log.
- [x] Sealed, non-Earth, Archived, Contact Lost, and wholly withheld records cannot receive false in-person observations.
- [x] Legacy species-only observed entries are preserved as explicitly legacy local records.
- [x] Visitors cannot add locations, free text, uploads, or evidence claims.

## Search, Index, archives, and navigation — automated

- [x] Search opens the correct species, region, habitat, corridor, incident, or archive target.
- [x] Arrow-key search navigation and Enter selection work across mixed result types.
- [x] Species, region, ecology, incident, and archive deep links restore the intended view.
- [x] Install-manifest shortcuts restore GAIA Live, Records, and Index.
- [x] Dossier ecology links lead to the correct regional window or mapped system.
- [x] Date-driven routes display the same canonical state to every visitor.
- [x] Public records remain searchable without artificial discovery locks.
- [x] Records filters meaningfully separate full dossiers, live tracks, restricted files, and Civilian Summary Records.
- [x] Index filters cover category, realm, danger, mobility, and publication depth.
- [x] Index sorting supports number, population, danger, and species name.
- [x] Index rows are keyboard-openable.
- [x] Archive cards open as readable in-universe documents with previous/next navigation and shareable state.
- [x] The census-methodology brief explains exact totals without becoming a tutorial interruption.
- [x] Restricted records reduce public precision without weakening internal canon.
- [x] Regional field windows open, link to dossiers, and focus the globe without requesting location access.

## Browser, accessibility, responsive, and network assurance — automated

- [x] Desktop Chromium, desktop Firefox, mobile Chromium, mobile WebKit, and reduced-motion Chromium complete the required suite.
- [x] The Globe and Records surfaces have no serious or critical axe-core violations in representative desktop and mobile scans.
- [x] Hidden dossiers and dialogs are inert and cannot leak focus to assistive technology.
- [x] Observation and archive-reader dialogs contain focus and close through Escape.
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

## Visual asset policy — automated structure, manual evidence-art review

- [x] Artwork source selection is centralized and replaceable.
- [x] Seven deterministic fallback profiles exist for natural-history, marine, tracked, mythic, anomaly, artificial, and sealed subjects.
- [x] A browser broken-image icon is never the intended failure state.
- [x] Restricted fallback imagery does not become more revealing than the record’s access treatment.
- [x] The generated social-preview image received internal composition review.
- [ ] Original regional environmental plates receive art-direction review.
- [ ] Original field-camera, satellite, laboratory, historical, containment, and incident evidence images receive art-direction review.
- [ ] Rights, attribution, and replacement procedures are reviewed before any local Pokémon artwork package is distributed.

## Performance and release integrity — automated

- [x] Thirteen readable source modules fetch in parallel and execute in the locked reviewed order.
- [x] The critical shell, signed/editorial data, largest text asset, social card, and install icons remain inside declared budgets.
- [x] Service-worker shell complexity remains inside its declared entry budget.
- [x] Release preparation is deterministic and idempotent.
- [x] The future Pages workflow materializes and validates the exact artifact it would deploy.
- [x] Runtime metadata distinguishes canon correction `2026-07-27.1`, ecology `2026-07-28.2`, World Completion `2026-08-01.1`, assets `2026-07-29.1`, assurance `2026-07-29.1`, and RC1 `2026-07-29.1`.
- [x] README local-run instructions prepare and load the exact private artifact.
- [x] Every Markdown file is valid UTF-8 with no corrupted control bytes.
- [x] `src/app/*.js` and `public/app.js` are synchronized.
- [x] All canon, ecology, completion, integrity, syntax, asset, accessibility, responsive-layout, budget, weak-network, offline, and required-file checks pass before deployment can run.

## Final owner-device and promotion review — still open

- [ ] Test on Alex’s physical Android phone and primary desktop/laptop.
- [ ] Test on at least one physical iPhone and tablet when conveniently available.
- [ ] Complete qualitative VoiceOver or NVDA review of navigation order, modal announcements, and dossier reading flow.
- [ ] Test the successful live basemap, local minimal-globe mode, offline shell, and weak-network recovery on real connections.
- [ ] Test map performance on at least one older or lower-powered device.
- [ ] Review color, motion comfort, touch targets, and scroll behavior on actual displays.
- [ ] Confirm the legal notice and ZANDROS founder credit remain quiet, accessible, and non-disruptive.
- [ ] Decide whether more world systems and evidence imagery are required before the site is promoted.
- [ ] Make an explicit decision to merge, deploy, and promote; passing CI alone does not authorize launch.
