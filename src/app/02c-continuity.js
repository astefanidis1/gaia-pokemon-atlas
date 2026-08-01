/* GAIA atlas continuity: universal search, deep links, and ecology cross-references. */
  queueMicrotask(() => {
    const CANON_VERSION = '2026-07-27.1';
    const ECOLOGY_VERSION = '2026-07-28.2';
    const SEARCH_LIMIT = 12;

    if (!document.querySelector('link[data-gaia-continuity]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'continuity.css';
      link.dataset.gaiaContinuity = 'true';
      document.head.appendChild(link);
    }

    const footer = $('footer');
    if (footer?.firstChild) {
      footer.firstChild.nodeValue = `GAIA CIVILIAN ACCESS NETWORK · CANON ${CANON_VERSION} · ECOLOGY ${ECOLOGY_VERSION} · `;
    }
    const legal = $('.legal', $('#aboutModal'));
    if (legal && !$('.build-meta', $('#aboutModal'))) {
      legal.insertAdjacentHTML('beforebegin', `<p class="build-meta">CIVILIAN BUILD · CANON ${CANON_VERSION} · ECOLOGY ${ECOLOGY_VERSION} · 161 SPECIES · 27 FULL DOSSIERS</p>`);
    }

    const text = value => {
      if (Array.isArray(value)) return value.map(text).join(' ');
      if (value && typeof value === 'object') return Object.values(value).map(text).join(' ');
      return String(value ?? '');
    };
    const normalize = value => text(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const geometryRows = [];
    for (const region of regions) {
      for (const kind of ['habitats', 'corridors']) {
        for (const feature of region.geometry?.[kind] || []) geometryRows.push({ region, kind, feature });
      }
    }

    const searchTargets = [];
    const addTarget = target => searchTargets.push({ ...target, slug:target.key, searchText:normalize(target.terms) });

    species.forEach(item => {
      const dossier = editorialDossiers[item.slug] || {};
      const relatedIncidents = incidents.filter(event => event.speciesIds?.includes(item.id));
      addTarget({
        key:`species:${item.slug}`, kind:'species', id:item.slug, title:item.name,
        subtitle:`${item.category} · ${locationText(item)}`, badge:editorialDossiers[item.slug] ? 'DOSSIER' : 'SPECIES', image:item.image,
        terms:[item.name,item.category,item.habitat,item.origin,item.group,item.summary,item.location,item.locations,dossier,relatedIncidents]
      });
    });

    regions.forEach(region => addTarget({
      key:`region:${region.id}`, kind:'region', id:region.id, regionId:region.id, title:region.name,
      subtitle:`${region.species.length} presences · ${region.geometry?.habitats?.length || 0} habitats · ${region.geometry?.corridors?.length || 0} corridors`, badge:'REGION',
      terms:[region.name,region.shortName,region.kicker,region.summary,region.method,region.zones,region.species,region.absences]
    }));

    geometryRows.forEach(({region,kind,feature}) => addTarget({
      key:`ecology:${feature.id}`, kind:'ecology', id:feature.id, regionId:region.id, featureId:feature.id,
      title:feature.name, subtitle:`${kind === 'habitats' ? 'Habitat system' : 'Ecological corridor'} · ${region.shortName || region.name}`,
      badge:kind === 'habitats' ? 'HABITAT' : 'CORRIDOR',
      terms:[feature.name,feature.note,feature.seasonal,feature.species?.map(slug => findBySlug(slug)?.name),region.name,region.shortName,region.geometrySeasonality?.[feature.id]]
    }));

    incidents.forEach(event => addTarget({
      key:`incident:${event.id}`, kind:'incident', id:event.id, title:event.title,
      subtitle:`${event.date} · ${event.classification}`, badge:'INCIDENT',
      terms:[event.title,event.summary,event.classification,event.date,event.speciesIds?.map(id => byId.get(id)?.name)]
    }));

    Object.entries(editorialDossiers).forEach(([speciesSlug,dossier]) => {
      (dossier.archives || []).forEach((archive,index) => addTarget({
        key:`archive:${speciesSlug}:${index}`, kind:'archive', id:`${speciesSlug}:${index}`, speciesSlug,
        archiveCode:archive.code, archiveTitle:archive.title, title:archive.title,
        subtitle:`${archive.code} · ${findBySlug(speciesSlug)?.name || speciesSlug}`, badge:'ARCHIVE',
        terms:[archive,dossier.advisory,findBySlug(speciesSlug)?.name]
      }));
    });

    const scoreTarget = (target, query) => {
      const title = normalize(target.title);
      if (title === query) return 120;
      if (title.startsWith(query)) return 95;
      if (title.includes(query)) return 75;
      const words = query.split(/\s+/).filter(Boolean);
      return words.every(word => target.searchText.includes(word)) ? 45 + words.length : 0;
    };

    const renderSearchTarget = (target,index) => {
      const visual = target.image
        ? `<img src="${escapeHTML(target.image)}" alt="" data-species-slug="${escapeHTML(target.id)}">`
        : `<span class="search-glyph ${escapeHTML(target.kind)}" aria-hidden="true">${target.kind === 'region' ? '◎' : target.kind === 'ecology' ? '⌁' : target.kind === 'incident' ? '!' : '▤'}</span>`;
      return `<button id="search-result-${index}" class="search-result search-${escapeHTML(target.kind)} ${index === 0 ? 'selected' : ''}" data-search="${escapeHTML(target.key)}" role="option" aria-selected="${index === 0}">${visual}<span><strong>${escapeHTML(target.title)}</strong><small>${escapeHTML(target.subtitle)}</small></span><b class="search-kind">${escapeHTML(target.badge)}</b></button>`;
    };

    const oldRenderSearch = renderSearch;
    renderSearch = function renderUniversalSearch() {
      const query = normalize($('#searchInput').value);
      const results = $('#searchResults');
      if (!query) {
        results.classList.remove('open'); results.innerHTML='';
        $('#searchInput').setAttribute('aria-expanded','false');
        $('#searchInput').removeAttribute('aria-activedescendant');
        state.searchMatches=[]; state.searchIndex=-1; return;
      }
      state.searchMatches = searchTargets
        .map(target => ({ target, score:scoreTarget(target,query) }))
        .filter(row => row.score > 0)
        .sort((a,b) => b.score-a.score || a.target.title.localeCompare(b.target.title))
        .slice(0,SEARCH_LIMIT)
        .map(row => row.target);
      state.searchIndex = state.searchMatches.length ? 0 : -1;
      results.innerHTML = state.searchMatches.length
        ? state.searchMatches.map(renderSearchTarget).join('')
        : `<div class="search-result"><span>No GAIA record matches “${escapeHTML($('#searchInput').value.trim())}”.</span></div>`;
      results.classList.add('open');
      $('#searchInput').setAttribute('aria-expanded','true');
      if (state.searchIndex >= 0) $('#searchInput').setAttribute('aria-activedescendant',`search-result-${state.searchIndex}`);
      $$('[data-search]',results).forEach(button => button.addEventListener('click',()=>chooseSearch(button.dataset.search)));
    };
    $('#searchInput').removeEventListener('input',oldRenderSearch);
    $('#searchInput').addEventListener('input',renderSearch);

    function featureContext(regionId,featureId) {
      const region = regionById.get(regionId);
      if (!region) return null;
      for (const kind of ['habitats','corridors']) {
        const feature = (region.geometry?.[kind] || []).find(row => row.id === featureId);
        if (feature) return {region,kind,feature};
      }
      return null;
    }

    function openEcologyTarget(regionId,featureId,writeHash=true,attempt=0) {
      const context = featureContext(regionId,featureId);
      if (!context) return;
      const {region,kind,feature} = context;
      state.realm='Earth'; state.category='all'; state.access='all';
      $('#realmFilter').value='Earth'; $('#categoryFilter').value='all'; $('#accessFilter').value='all';
      setView('globe'); renderMapMarkers(); showRegionGeography(region);
      if (!state.mapReady && attempt < 25) {
        setTimeout(()=>openEcologyTarget(regionId,featureId,writeHash,attempt+1),200);
        return;
      }
      if (state.mapReady) state.map.flyTo({center:region.center,zoom:Math.max(region.zoom || 4,4),duration:700});
      const current = geometrySeason(region,feature.id);
      setTimeout(()=>openEcologyInspector({
        id:feature.id,regionId:region.id,regionName:region.shortName || region.name,name:feature.name,note:feature.note,
        color:feature.color,seasonal:feature.seasonal || '',seasonStatus:current.status,seasonNote:current.note || '',
        species:JSON.stringify(feature.species || []),featureKind:kind === 'habitats' ? 'Habitat system' : 'Ecological corridor'
      }),120);
      if (writeHash) history.replaceState(null,'',`${location.pathname}${location.search}#ecology=${encodeURIComponent(feature.id)}`);
    }

    function openIncidentTarget(id,writeHash=true) {
      const event = incidents.find(row => row.id === id);
      if (!event) return;
      setView('records'); renderRecords();
      const card = $$('.incident-card').find(row => $('h4',row)?.textContent === event.title);
      if (card) { card.classList.add('continuity-hit'); card.scrollIntoView({behavior:'smooth',block:'center'}); setTimeout(()=>card.classList.remove('continuity-hit'),2600); }
      if (writeHash) history.replaceState(null,'',`${location.pathname}${location.search}#incident=${encodeURIComponent(id)}`);
    }

    function openArchiveTarget(target,writeHash=true) {
      const item = findBySlug(target.speciesSlug);
      if (!item) return;
      setView('records'); openDossier(item,false);
      setTimeout(()=>{
        const card = $$('.archive-list article').find(row => row.textContent.includes(target.archiveCode) || row.textContent.includes(target.archiveTitle));
        if (card) { card.classList.add('continuity-hit'); card.scrollIntoView({behavior:'smooth',block:'center'}); setTimeout(()=>card.classList.remove('continuity-hit'),2600); }
      },220);
      if (writeHash) history.replaceState(null,'',`${location.pathname}${location.search}#archive=${encodeURIComponent(target.id)}`);
    }

    chooseSearch = function chooseUniversalSearch(key) {
      const target = searchTargets.find(row => row.key === key) || searchTargets.find(row => row.kind === 'species' && row.id === key);
      if (!target) return;
      $('#searchResults').classList.remove('open'); $('#searchInput').setAttribute('aria-expanded','false');
      $('#searchInput').removeAttribute('aria-activedescendant'); $('#searchInput').value=target.title;
      if (target.kind === 'species') {
        const item=findBySlug(target.id); if(!item)return;
        if(item.location.realm!==state.realm){state.realm=item.location.realm;$('#realmFilter').value=state.realm;renderMapMarkers();}
        setView('globe'); openDossier(item,true); return;
      }
      if (target.kind === 'region') { openRegion(target.regionId); return; }
      if (target.kind === 'ecology') { openEcologyTarget(target.regionId,target.featureId); return; }
      if (target.kind === 'incident') { openIncidentTarget(target.id); return; }
      if (target.kind === 'archive') openArchiveTarget(target);
    };

    const baseOpenRegion = openRegion;
    openRegion = function openLinkedRegion(id) {
      baseOpenRegion(id);
      if (regionById.has(id)) history.replaceState(null,'',`${location.pathname}${location.search}#region=${encodeURIComponent(id)}`);
    };

    const baseFocusRegionOnMap = focusRegionOnMap;
    focusRegionOnMap = function focusLinkedRegion(region) {
      baseFocusRegionOnMap(region);
      if (region?.id) history.replaceState(null,'',`${location.pathname}${location.search}#region=${encodeURIComponent(region.id)}`);
    };

    const baseOpenEcologyInspector = openEcologyInspector;
    openEcologyInspector = function openLinkedEcologyInspector(properties) {
      baseOpenEcologyInspector(properties);
      if (properties?.id) history.replaceState(null,'',`${location.pathname}${location.search}#ecology=${encodeURIComponent(properties.id)}`);
    };

    function ecologyReferences(speciesSlug) {
      const found = [];
      for (const region of regions) {
        const present = region.species?.some(entry => entry.slug === speciesSlug);
        const features = geometryRows.filter(row => row.region.id === region.id && row.feature.species?.includes(speciesSlug));
        const relations = (relationshipsByRegion.get(region.id) || []).filter(row => row.species?.includes(speciesSlug));
        if (present || features.length || relations.length) found.push({region,features,relations});
      }
      return found;
    }

    const baseRenderEditorialDossier = renderEditorialDossier;
    renderEditorialDossier = function renderLinkedEditorialDossier(item) {
      baseRenderEditorialDossier(item);
      const references = ecologyReferences(item.slug);
      if (!references.length) return;
      const target = $('#dossierEditorial');
      target.insertAdjacentHTML('beforeend',`<section class="dossier-ecology-links"><span class="eyebrow">CONNECTED WORLD ECOLOGY</span><p>Follow ${escapeHTML(item.name)} into the regional systems, seasonal corridors, and field windows where its role is documented.</p><div>${references.map(({region,features,relations})=>`<article><button data-dossier-region="${escapeHTML(region.id)}"><b>${escapeHTML(region.name)}</b><small>${features.length} mapped systems · ${relations.length} relationships</small></button>${features.map(({feature,kind})=>`<button data-dossier-ecology="${escapeHTML(feature.id)}" data-dossier-region-id="${escapeHTML(region.id)}"><span>${kind === 'habitats' ? 'Habitat' : 'Corridor'}</span><strong>${escapeHTML(feature.name)}</strong></button>`).join('')}</article>`).join('')}</div></section>`);
      $$('[data-dossier-region]',target).forEach(button=>button.addEventListener('click',()=>{closeDossier();openRegion(button.dataset.dossierRegion);}));
      $$('[data-dossier-ecology]',target).forEach(button=>button.addEventListener('click',()=>{closeDossier();openEcologyTarget(button.dataset.dossierRegionId,button.dataset.dossierEcology);}));
    };

    const oldOpenFromHash = openFromHash;
    openFromHash = function openContinuityHash() {
      const hash = location.hash.slice(1);
      let match = hash.match(/^species=([^&]+)/);
      if (match) { oldOpenFromHash(); return; }
      match = hash.match(/^region=([^&]+)/);
      if (match) { openRegion(decodeURIComponent(match[1])); return; }
      match = hash.match(/^ecology=([^&]+)/);
      if (match) {
        const featureId=decodeURIComponent(match[1]);
        const row=geometryRows.find(item=>item.feature.id===featureId);
        if(row)openEcologyTarget(row.region.id,featureId,false);
        return;
      }
      match = hash.match(/^incident=([^&]+)/);
      if (match) { openIncidentTarget(decodeURIComponent(match[1]),false); return; }
      match = hash.match(/^archive=([^&]+)/);
      if (match) {
        const id=decodeURIComponent(match[1]);
        const target=searchTargets.find(row=>row.kind==='archive'&&row.id===id);
        if(target)openArchiveTarget(target,false);
      }
    };
    window.removeEventListener('hashchange',oldOpenFromHash);
    window.addEventListener('hashchange',openFromHash);
  });
