# GAIA Foundation Review Checklist

Use this checklist before merging the foundation branch.

## Product direction

- [ ] The globe is visually and functionally primary.
- [ ] The interface feels like GAIA, not a general Pokédex or editing dashboard.
- [ ] No Canon Studio, visitor notes, alternate canon, custom expeditions, or automatic geolocation appear publicly.
- [ ] Globe, GAIA Live, Index, Records, and Field Log match the locked information architecture.
- [ ] The tone is ominous, realistic, mythic, and beautiful without making every record grim.

## Canon and editorial separation

- [ ] Exact living populations are displayed as authoritative current canon.
- [ ] Species, permanent forms, populations, locations, routes, and incidents remain separate entities.
- [ ] Editorial dossiers and regional field windows do not silently modify signed census totals.
- [ ] Urshifu totals 16 across seven Single Strike and nine Rapid Strike adults.
- [ ] Zygarde is treated as one distributed organism.
- [ ] Ultra Beast counts describe the named accessible population rather than an infinite multiverse.
- [ ] Visitor state never modifies canon.

## Content

- [ ] All full dossiers feel meaningfully deeper than core records.
- [ ] Founder notes sound distinct without turning the site into a character-driven story.
- [ ] The New England field window feels biologically ordinary and realistic.
- [ ] Tyranitar is absent, Metagross is institutional only, and Dragonite is a rare coastal transient rather than a resident.
- [ ] Mature material serves the world rather than becoming spectacle.
- [ ] All four regional windows feel environmentally distinct rather than reskinned.
- [ ] Seasonal state and ecological relationships add causal realism rather than decorative activity.

## Interaction

- [ ] Search opens the correct species, region, habitat, corridor, incident, or archive target.
- [ ] Arrow-key search navigation and Enter selection work across mixed result types.
- [ ] Species, region, ecology, incident, and archive deep links restore the intended view.
- [ ] Dossier ecology links lead to the correct regional window or mapped system.
- [ ] Date-driven routes display the same canonical state to every visitor.
- [ ] Discovered, Observed, and Favorite states persist locally.
- [ ] Public records remain searchable without artificial discovery locks.
- [ ] Records filters meaningfully separate full dossiers, live tracks, restricted files, and selected core records.
- [ ] The census-methodology brief explains exact totals without turning into a tutorial interruption.
- [ ] Restricted records reduce public precision without weakening internal canon.
- [ ] Regional field windows open, link to dossiers, and focus the globe without requesting location access.

## Quality

- [ ] Desktop and mobile layouts are usable.
- [ ] Mobile bottom navigation does not cover page or dossier content.
- [ ] The application remains navigable when the basemap or remote artwork is unavailable.
- [ ] Local globe mode preserves markers when the external basemap fails.
- [ ] Procedural archive visuals remain readable and recover to remote artwork when possible.
- [ ] The service worker caches only versioned public assets and successful artwork responses.
- [ ] Reduced-motion, focus behavior, keyboard navigation, and contrast receive final review.
- [ ] The legal notice remains quiet but accessible in the footer, About view, and README.
- [ ] Runtime metadata distinguishes the signed canon correction from the ecology editorial version.
- [ ] README local-run instructions load the exact readable source modules.
- [ ] Every Markdown file is valid UTF-8 with no corrupted control bytes.
- [ ] `src/app/*.js` and `public/app.js` are synchronized.
- [ ] All canon, ecology, integrity, syntax, and required-file validation checks pass before merge.
