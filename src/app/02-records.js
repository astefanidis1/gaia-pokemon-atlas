  function findBySlug(slug) { return species.find(item => item.slug === slug); }

  function openDossier(item, move = true) {
    if (!item) return;
    state.selected = item;
    state.lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    field.discovered.add(item.id);
    saveField();
    const dossier = $('#dossier');
    dossier.classList.add('open');
    dossier.setAttribute('aria-hidden','false');
    dossier.dataset.tone = editorialDossiers[item.slug]?.tone || item.category.toLowerCase().replace(/[^a-z]+/g,'-');
    document.body.classList.add('dossier-open');
    $('#dossierImage').src = item.image;
    $('#dossierImage').alt = item.name;
    $('#dossierImage').dataset.speciesSlug = item.slug;
    $('#dossierEyebrow').textContent = `NATIONAL INDEX #${String(item.dex).padStart(4,'0')} · ${item.category}`;
    $('#dossierName').textContent = item.name;
    $('#dossierSummary').textContent = item.summary || defaultSummary(item);
    $('#dossierStamp').textContent = item.accessStatus.toUpperCase();
    $('#dossierStamp').style.borderColor = ['Restricted','Sealed'].includes(item.accessStatus) ? '#e66f65' : '#d9bd78';
    $('#dossierStamp').style.color = ['Restricted','Sealed'].includes(item.accessStatus) ? '#ff9b92' : '#d9bd78';
    $('#dossierPopulation').textContent = fmt(item.globalPopulation);
    $('#dossierCensus').textContent = `Census confirmed ${formatVerified(item.censusVerified)} · eggs excluded until hatching`;
    $('#dossierLocation').textContent = locationText(item);
    $('#dossierLocationType').textContent = item.location?.locationType || 'Unknown';
    $('#dossierKnowledge').textContent = item.knowledgeStatus;
    $('#dossierAccess').textContent = item.accessStatus;
    $('#dossierConservation').textContent = item.conservationStatus;
    $('#dossierDanger').textContent = `${item.dangerLevel}/5 · ${item.dangerLabel}`;
    $('#dossierHabitat').textContent = item.habitat;
    $('#dossierOrigin').textContent = item.origin;
    renderDossierActions(item);
    renderDossierSections(item);
    renderRelatedIncidents(item);
    renderDossierLive(item);
    renderEditorialDossier(item);
    updateMarkerSelection();
    setTimeout(() => $('#closeDossier')?.focus({preventScroll:true}), 180);
    if (item.location?.realm === 'Earth') {
      showSelectedGeography(item);
      if (move && state.mapReady) {
        const loc = effectiveLocation(item);
        state.map.flyTo({ center:[loc.lon,loc.lat], zoom: Math.max(3.5,state.map.getZoom()), duration:1300 });
      }
    }
    try { history.replaceState(null,'',`${location.pathname}${location.search}#species=${encodeURIComponent(item.slug)}`); } catch {}
  }

  function closeDossier() {
    $('#dossier').classList.remove('open');
    $('#dossier').setAttribute('aria-hidden','true');
    document.body.classList.remove('dossier-open');
    state.selected = null;
    clearSelectedGeography();
    updateMarkerSelection();
    try { history.replaceState(null,'',location.pathname + location.search); } catch {}
    if (state.lastFocus?.isConnected) state.lastFocus.focus({preventScroll:true});
  }

  function defaultSummary(item) {
    if (item.route) return `${item.name} is under active GAIA tracking along a deterministic seasonal route. Current movement is synchronized to the real calendar.`;
    if (item.location?.realm !== 'Earth') return `${item.name} is a verified ${item.category.toLowerCase()} population associated with ${item.location.label}.`;
    if (item.legacyRangeType === 'Worldwide') return `${item.name} is a globally distributed species with a verified living population of ${fmt(item.globalPopulation)}.`;
    return `${item.name} is monitored through the GAIA Global Census, with its primary ${item.location.locationType.toLowerCase()} recorded at ${item.location.label}.`;
  }

  function formatVerified(value) {
    const date = new Date(`${value}T00:00:00Z`);
    return new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric',timeZone:'UTC'}).format(date);
  }

  function renderDossierActions(item) {
    const favorite = field.favorites.has(item.id);
    const observed = field.observed.has(item.id);
    $('#favoriteButton').classList.toggle('active', favorite);
    $('#favoriteButton').textContent = favorite ? '★ Favorited' : '☆ Favorite';
    $('#observedButton').classList.toggle('active', observed);
    $('#observedButton').textContent = observed ? '● Observed' : '◉ I observed this';
  }

  function renderDossierSections(item) {
    const labels = { ecology:'Ecology',humanRelationship:'Human relationship',history:'Historical record',protocol:'GAIA response protocol' };
    const dossier = item.dossier || {};
    const sections = Object.entries(labels).filter(([key]) => dossier[key]);
    const formSection = item.forms?.length ? `<article><h3>Permanent forms and populations</h3><div class="form-breakdown">${item.forms.map(form => { const pop=item.populationRecords.find(record=>record.formId===form.id); const loc=item.locations.find(place=>place.formId===form.id); return `<div><b>${escapeHTML(form.name)}</b><span>${fmt(pop?.count || form.population)} living</span><small>${escapeHTML(loc?.label || 'Location withheld')}</small></div>`; }).join('')}</div></article>` : '';
    if (!sections.length) {
      $('#dossierSections').innerHTML = formSection + `<article><h3>Ecological summary</h3><p>${escapeHTML(defaultSummary(item))} A complete flagship dossier has not yet been published for civilian access.</p></article>`;
      return;
    }
    $('#dossierSections').innerHTML = formSection + sections.map(([key,label]) => `<article><h3>${label}</h3><p>${escapeHTML(dossier[key])}</p></article>`).join('');
  }

  function renderEditorialDossier(item) {
    const content = editorialDossiers[item.slug];
    const target = $('#dossierEditorial');
    if (!content) { target.innerHTML=''; return; }
    const advisory = content.advisory ? `<aside class="public-advisory"><span>PUBLIC FIELD ADVISORY</span><p>${escapeHTML(content.advisory)}</p></aside>` : '';
    const sections = (content.sections || []).map(section => `<article class="editorial-section"><h3>${escapeHTML(section.title)}</h3><p>${escapeHTML(section.body)}</p></article>`).join('');
    const note = content.founderNote ? `<blockquote class="founder-note"><span>FIELD NOTE · ${escapeHTML(content.founderNote.author)}</span><p>“${escapeHTML(content.founderNote.text)}”</p><cite>${escapeHTML(content.founderNote.role)}</cite></blockquote>` : '';
    const archives = content.archives?.length ? `<section class="archive-section"><span class="eyebrow">LINKED GAIA ARCHIVE</span><div class="archive-list">${content.archives.map(record => `<article><div><b>${escapeHTML(record.code)}</b><span>${escapeHTML(record.classification)}</span></div><h4>${escapeHTML(record.title)}</h4><small>${escapeHTML(record.date)}</small><p>${escapeHTML(record.summary)}</p></article>`).join('')}</div></section>` : '';
    target.innerHTML = advisory + sections + note + archives;
  }

  function renderDossierLive(item) {
    const block = $('#liveBlock');
    if (!item.route) { block.hidden = true; block.innerHTML=''; return; }
    const pos = livePosition(item);
    block.hidden = false;
    block.innerHTML = `<span class="eyebrow">ACTIVE GAIA TRACK</span><h3>${escapeHTML(routePhase(item))}</h3><p>${escapeHTML(pos.currentLabel)} → ${escapeHTML(pos.nextLabel)}</p><div class="track-line"><span>Route completion</span><strong>${Math.round(pos.progress*100)}%</strong><i><b style="width:${pos.progress*100}%"></b></i></div><small>${escapeHTML(item.route.depth || item.route.altitude || '')} · ${escapeHTML(item.route.speed || '')}</small>`;
  }

  function renderRelatedIncidents(item) {
    const related = incidents.filter(event => event.speciesIds.includes(item.id));
    $('#relatedIncidents').innerHTML = related.length ? `<span class="eyebrow">RELATED INCIDENTS</span>${related.map(event => `<button><b>${escapeHTML(event.title)}</b><br><small>${escapeHTML(event.date)} · ${escapeHTML(event.classification)}</small></button>`).join('')}` : '';
  }

  function toggleFavorite() {
    if (!state.selected) return;
    const set = field.favorites;
    set.has(state.selected.id) ? set.delete(state.selected.id) : set.add(state.selected.id);
    saveField(); renderDossierActions(state.selected); renderFieldLog(); toast(set.has(state.selected.id) ? 'Saved to Field Log' : 'Removed from favorites');
  }

  function toggleObserved() {
    if (!state.selected) return;
    const set = field.observed;
    set.has(state.selected.id) ? set.delete(state.selected.id) : set.add(state.selected.id);
    saveField(); renderDossierActions(state.selected); renderFieldLog();
    toast(set.has(state.selected.id) ? 'Observation stored locally' : 'Observation removed');
  }

  async function copyShareLink() {
    if (!state.selected) return;
    const url = `${location.origin}${location.pathname}#species=${encodeURIComponent(state.selected.slug)}`;
    if (navigator.share) {
      try { await navigator.share({ title:`${state.selected.name} · GAIA Atlas`, text:state.selected.summary || defaultSummary(state.selected), url }); toast('Record shared'); return; }
      catch (error) { if (error?.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(url); toast('Record link copied'); }
    catch { toast('Copy unavailable in this browser'); }
  }

  function renderLive() {
    const items = species.filter(item => item.route).map(item => ({ item, pos:livePosition(item) }));
    $('#liveCount').textContent = items.length;
    $('#movingMetric').textContent = items.length;
    $('#worldDate').textContent = currentUTCLabel();
    const featured = items.find(x => x.item.name === 'Lugia') || items[0];
    $('#liveHero').innerHTML = featured ? liveFeature(featured.item,featured.pos) : '';
    $('#liveGrid').innerHTML = items.filter(x => x !== featured).map(({item,pos}) => `<article class="live-card" data-open="${item.slug}"><img src="${item.image}" alt="${escapeHTML(item.name)}" data-species-slug="${item.slug}"><div><span class="eyebrow">${escapeHTML(routePhase(item))}</span><h3>${escapeHTML(item.name)}</h3><p>${escapeHTML(pos.currentLabel)} → ${escapeHTML(pos.nextLabel)}</p><div class="track-line"><span>Canonical route</span><strong>${Math.round(pos.progress*100)}%</strong><i><b style="width:${pos.progress*100}%"></b></i></div></div></article>`).join('');
    $$('[data-open]', $('#view-live')).forEach(card => card.addEventListener('click', () => openDossier(findBySlug(card.dataset.open), false)));
  }

  function liveFeature(item,pos) {
    return `<article class="live-feature" data-open="${item.slug}"><div class="art"><div><span class="eyebrow">PRIMARY ACTIVE TRACK</span><strong>${escapeHTML(item.location.locationType)}</strong></div><img src="${item.image}" alt="${escapeHTML(item.name)}" data-species-slug="${item.slug}"></div><div class="content"><span class="eyebrow">${escapeHTML(routePhase(item))}</span><h3>${escapeHTML(item.name)}</h3><p>${escapeHTML(item.summary || defaultSummary(item))}</p><div class="track-line"><span>${escapeHTML(pos.currentLabel)}</span><strong>${escapeHTML(pos.nextLabel)}</strong><i><b style="width:${pos.progress*100}%"></b></i></div><p><small>${escapeHTML(item.route.depth || item.route.altitude || '')} · ${escapeHTML(item.route.speed || '')}</small></p></div></article>`;
  }

  function renderIndex() {
    const category = $('#indexCategory').value || 'all';
    const realm = $('#indexRealm').value || 'all';
    const list = species.filter(item => (category === 'all' || item.category === category) && (realm === 'all' || item.location.realm === realm)).sort((a,b) => a.dex-b.dex);
    $('#indexBody').innerHTML = list.map(item => `<tr data-index-open="${item.slug}"><td>${String(item.dex).padStart(4,'0')}</td><td><div class="species-cell"><img src="${item.image}" alt="" data-species-slug="${item.slug}"><span><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(item.knowledgeStatus)}${editorialDossiers[item.slug] ? ' · Full dossier' : ''}</small></span></div></td><td>${escapeHTML(item.category)}</td><td>${escapeHTML(locationText(item))}</td><td><strong>${fmt(item.globalPopulation)}</strong></td><td><span class="status-pill ${item.accessStatus}">${escapeHTML(item.accessStatus)}</span></td></tr>`).join('');
    $$('[data-index-open]').forEach(row => row.addEventListener('click', () => openDossier(findBySlug(row.dataset.indexOpen), false)));
  }

  function recordMatchesFilter(item) {
    if (state.recordFilter === 'full') return Boolean(editorialDossiers[item.slug]);
    if (state.recordFilter === 'live') return Boolean(item.route);
    if (state.recordFilter === 'restricted') return ['Restricted','Sealed'].includes(item.accessStatus);
    return true;
  }

  function renderRecordSpotlight(flagship) {
    const target = $('#recordSpotlight');
    const preferred = ['lugia','gengar','mewtwo']
      .map(findBySlug)
      .filter(item => item && editorialDossiers[item.slug]);
    const picks = [...preferred, ...flagship.filter(item => editorialDossiers[item.slug] && !preferred.includes(item))].slice(0,3);
    target.innerHTML = picks.map((item,index) => {
      const content = editorialDossiers[item.slug];
      const archiveCount = content?.archives?.length || 0;
      return `<button class="spotlight-record tone-${itemTone(item)}" data-record="${item.slug}" style="--record-accent:${colors[item.category] || '#8de9f5'}"><span class="spotlight-index">0${index+1}</span><div><span class="eyebrow">FEATURED FULL DOSSIER</span><h3>${escapeHTML(item.name)}</h3><p>${escapeHTML(item.summary || defaultSummary(item))}</p><small>${archiveCount} LINKED ARCHIVE FILES · ${escapeHTML(item.accessStatus)} ACCESS</small></div><img src="${item.image}" alt="" data-species-slug="${item.slug}"></button>`;
    }).join('');
  }

  function renderRecords() {
    const requested = (editorial.flagshipOrder || []).map(findBySlug).filter(Boolean);
    const coreOrder = ['moltres','zapdos','kyogre','rayquaza','giratina','arceus','deoxys','genesect','darkrai','necrozma','urshifu','celesteela'];
    const coreRecords = coreOrder.map(findBySlug).filter(item => item && !requested.includes(item));
    const flagship = [...requested, ...coreRecords];
    renderRecordSpotlight(requested);
    const filtered = flagship.filter(recordMatchesFilter);
    $('#recordGrid').innerHTML = filtered.length ? filtered.map(item => {
      const content = editorialDossiers[item.slug];
      const archiveCount = content?.archives?.length || 0;
      const depth = content ? `FULL DOSSIER · ${archiveCount} ARCHIVE FILES` : 'CORE RECORD';
      return `<article class="record-card tone-${itemTone(item)} ${content ? 'full-dossier' : 'core-record'}" data-record="${item.slug}" style="--record-accent:${colors[item.category] || '#8de9f5'}"><div class="record-art"><img src="${item.image}" alt="" data-species-slug="${item.slug}"><i aria-hidden="true"></i></div><span class="eyebrow">${escapeHTML(item.accessStatus)} RECORD · ${fmt(item.globalPopulation)} LIVING</span><h3>${escapeHTML(item.name)}</h3><p>${escapeHTML(item.summary || defaultSummary(item))}</p><small class="record-depth">${depth}</small></article>`;
    }).join('') : `<div class="record-empty"><span class="eyebrow">NO MATCHING RECORDS</span><h3>This archive filter returned no civilian records.</h3><button data-record-filter-reset>Show all records</button></div>`;
    $$('[data-record]').forEach(card => card.addEventListener('click', () => openDossier(findBySlug(card.dataset.record), false)));
    $('[data-record-filter-reset]')?.addEventListener('click', () => { state.recordFilter='all'; $$('.record-filters button').forEach(button=>button.classList.toggle('active',button.dataset.recordFilter==='all')); renderRecords(); });
    $('#incidentGrid').innerHTML = incidents.map(event => `<article class="incident-card"><span>${escapeHTML(event.date)} · ${escapeHTML(event.classification)}</span><h4>${escapeHTML(event.title)}</h4><p>${escapeHTML(event.summary)}</p></article>`).join('');
    renderRegionalWindows();
  }

  function renderRegionalWindows() {
    const grid = $('#regionGrid');
    if (!grid) return;
    grid.innerHTML = regions.map(region => `<button class="region-card" data-region="${escapeHTML(region.id)}"><span class="eyebrow">${escapeHTML(region.kicker)}</span><h3>${escapeHTML(region.name)}</h3><p>${escapeHTML(region.summary)}</p><div><b>${region.species.length} documented presences</b><small>${region.absences.length} explicit absences</small></div></button>`).join('');
    $$('[data-region]', grid).forEach(button => button.addEventListener('click', () => openRegion(button.dataset.region)));
  }

  function openRegion(id) {
    const region = regionById.get(id);
    if (!region) return;
    state.lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    state.activeRegion = region;
    const content = $('#regionContent');
    content.innerHTML = `<header class="region-hero"><span class="eyebrow">${escapeHTML(region.kicker)}</span><h2 id="regionTitle">${escapeHTML(region.name)}</h2><p>${escapeHTML(region.summary)}</p><small>${escapeHTML(region.method)}</small><button id="regionGlobeButton" class="primary-action">View this region on the globe</button></header><section><span class="eyebrow">ECOLOGICAL ZONES</span><div class="region-zones">${region.zones.map(zone => `<article><b>${escapeHTML(zone.name)}</b><p>${escapeHTML(zone.note)}</p></article>`).join('')}</div></section><section><span class="eyebrow">DOCUMENTED REGIONAL PRESENCE</span><div class="region-species-grid">${region.species.map(entry => regionSpeciesCard(entry,false)).join('')}</div></section><section class="absence-section"><span class="eyebrow">NOTABLE ABSENCES AND LIMITS</span><div class="region-absence-grid">${region.absences.map(entry => regionSpeciesCard(entry,true)).join('')}</div></section>`;
    const modal = $('#regionModal');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    $('#regionGlobeButton').addEventListener('click', () => focusRegionOnMap(region));
    $$('[data-region-species]', content).forEach(button => button.addEventListener('click', () => { const item=findBySlug(button.dataset.regionSpecies); closeRegion(false); openDossier(item,false); }));
    setTimeout(() => $('#closeRegion')?.focus({preventScroll:true}), 120);
  }

  function regionSpeciesCard(entry, absent) {
    const item = findBySlug(entry.slug);
    if (!item) return '';
    return `<button class="region-species-card ${absent ? 'absent' : ''}" data-region-species="${escapeHTML(entry.slug)}"><img src="${item.image}" alt="" data-species-slug="${item.slug}"><div><span>${escapeHTML(absent ? entry.status : `${entry.presence} · ${entry.frequency}`)}</span><h4>${escapeHTML(item.name)}</h4><p>${escapeHTML(entry.note)}</p></div></button>`;
  }

  function closeRegion(restoreFocus = true) {
    const modal = $('#regionModal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
    if (restoreFocus && state.lastFocus?.isConnected) state.lastFocus.focus({preventScroll:true});
  }

  function focusRegionOnMap(region) {
    closeRegion(false);
    state.realm='Earth';
    state.category='all';
    state.access='all';
    $('#realmFilter').value='Earth';
    $('#categoryFilter').value='all';
    $('#accessFilter').value='all';
    setView('globe');
    renderMapMarkers();
    showRegionGeography(region);
    if (state.mapReady) state.map.flyTo({center:region.center,zoom:region.zoom,duration:1300});
    toast(`${region.shortName} field window selected`);
  }

  function showRegionGeography(region) {
    state.activeRegion=region;
    const source=state.map?.getSource?.('gaia-region-focus');
    if (!source || !region?.polygon?.length) return;
    source.setData({type:'FeatureCollection',features:[{type:'Feature',properties:{id:region.id},geometry:{type:'Polygon',coordinates:[[...region.polygon]]}}]});
  }

  function clearRegionGeography() {
    state.activeRegion=null;
    state.map?.getSource?.('gaia-region-focus')?.setData(emptyFeatureCollection());
  }

