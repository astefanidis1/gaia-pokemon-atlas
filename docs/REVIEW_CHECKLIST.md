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

- [ ] All twelve flagship dossiers feel meaningfully deeper than core records.
- [ ] Founder notes sound distinct without turning the site into a character-driven story.
- [ ] The New England field window feels biologically ordinary and realistic.
- [ ] Tyranitar is absent, Metagross is institutional only, and Dragonite is a rare coastal transient rather than a resident.
- [ ] Mature material serves the world rather than becoming spectacle.

## Interaction

- [ ] Search opens the correct dossier and arrow-key navigation works.
- [ ] Date-driven routes display the same canonical state to every visitor.
- [ ] Discovered, Observed, and Favorite states persist locally.
- [ ] Public records remain searchable without artificial discovery locks.
- [ ] Records filters meaningfully separate full dossiers, live tracks, restricted files, and selected core records.
- [ ] The census-methodology brief explains exact totals without turning into a tutorial interruption.
- [ ] Restricted records reduce public precision without weakening internal canon.
- [ ] The regional field window opens, links to dossiers, and focuses the globe without requesting location access.

## Quality

- [ ] Desktop and mobile layouts are usable.
- [ ] Mobile bottom navigation does not cover page or dossier content.
- [ ] The application remains navigable when the basemap or remote artwork is unavailable.
- [ ] Local globe mode preserves markers when the external basemap fails.
- [ ] Procedural archive visuals remain readable and recover to remote artwork when possible.
- [ ] The service worker caches only versioned public assets and successful artwork responses.
- [ ] Reduced-motion, focus behavior, keyboard navigation, and contrast receive final review.
- [ ] The legal notice remains quiet but accessible in the footer, About view, and README.
- [ ] `src/app/*.js` and `public/app.js` are synchronized.
- [ ] Validation checks pass before merge.
