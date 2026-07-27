  function updateFieldMetrics() {
    $('#fieldCount').textContent = field.discovered.size;
    $('#discoveredTotal').textContent = field.discovered.size;
    $('#observedTotal').textContent = field.observed.size;
    $('#favoriteTotal').textContent = field.favorites.size;
    $('#completionTotal').textContent = `${Math.round(field.discovered.size/species.length*100)}%`;
  }

  function renderFieldLog() {
    updateFieldMetrics();
    let ids;
    if (state.fieldTab === 'undiscovered') ids = species.filter(item => !field.discovered.has(item.id)).map(item => item.id);
    else ids = [...field[state.fieldTab]];
    const list = ids.map(id => byId.get(id)).filter(Boolean).sort((a,b)=>a.dex-b.dex);
    $('#fieldGrid').innerHTML = list.length ? list.map(item => `<button class="field-card ${state.fieldTab === 'undiscovered' ? 'unknown' : ''}" data-field-open="${item.slug}"><img src="${item.image}" alt=""><strong>${state.fieldTab === 'undiscovered' ? 'Undiscovered' : escapeHTML(item.name)}</strong><small>${state.fieldTab === 'undiscovered' ? `Index #${String(item.dex).padStart(4,'0')}` : escapeHTML(item.category)}</small></button>`).join('') : `<div class="empty-state"><h3>No records here yet.</h3><p>Explore the globe or index to build your personal Field Log.</p></div>`;
    $$('[data-field-open]').forEach(card => card.addEventListener('click', () => openDossier(findBySlug(card.dataset.fieldOpen), false)));
  }

  function renderSearch() {
    const query = $('#searchInput').value.trim().toLowerCase();
    const results = $('#searchResults');
    if (!query) { results.classList.remove('open'); results.innerHTML=''; $('#searchInput').setAttribute('aria-expanded','false'); state.searchIndex=-1; return; }
    state.searchMatches = species.filter(item => [item.name,item.category,item.habitat,item.origin,item.location.label,item.group].join(' ').toLowerCase().includes(query)).slice(0,10);
    state.searchIndex = state.searchMatches.length ? 0 : -1;
    results.innerHTML = state.searchMatches.length ? state.searchMatches.map((item,index) => `<button id="search-result-${index}" class="search-result ${index===0?'selected':''}" data-search="${item.slug}" role="option" aria-selected="${index===0}"><img src="${item.image}" alt=""><span><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(item.location.label)}</small></span><b>${compact(item.globalPopulation)}</b></button>`).join('') : `<div class="search-result"><span>No GAIA record matches “${escapeHTML(query)}”.</span></div>`;
    results.classList.add('open');
    $('#searchInput').setAttribute('aria-expanded','true');
    if(state.searchIndex>=0) $('#searchInput').setAttribute('aria-activedescendant',`search-result-${state.searchIndex}`);
    $$('[data-search]').forEach(button => button.addEventListener('click', () => chooseSearch(button.dataset.search)));
  }

  function chooseSearch(slug) {
    const item = findBySlug(slug);
    $('#searchResults').classList.remove('open');
    $('#searchInput').setAttribute('aria-expanded','false');
    $('#searchInput').removeAttribute('aria-activedescendant');
    $('#searchInput').value = item.name;
    if (item.location.realm !== state.realm) {
      state.realm = item.location.realm;
      $('#realmFilter').value = state.realm;
      renderMapMarkers();
    }
    setView('globe');
    openDossier(item, true);
  }

  function setView(view) {
    state.view = view;
    $$('.view').forEach(section => section.classList.toggle('active', section.id === `view-${view}`));
    $$('.nav-button').forEach(button => { const active=button.dataset.view===view; button.classList.toggle('active',active); active ? button.setAttribute('aria-current','page') : button.removeAttribute('aria-current'); });
    document.body.dataset.view=view;
    if (view === 'live') renderLive();
    if (view === 'index') renderIndex();
    if (view === 'records') renderRecords();
    if (view === 'fieldlog') renderFieldLog();
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function populateControls() {
    const categories = [...new Set(species.map(item => item.category))].sort();
    for (const id of ['categoryFilter','indexCategory']) {
      const select = $(`#${id}`);
      categories.forEach(category => select.insertAdjacentHTML('beforeend', `<option>${escapeHTML(category)}</option>`));
    }
    $('#earthMetric').textContent = species.filter(item => item.location.realm === 'Earth').length;
    $('#singularMetric').textContent = species.filter(item => item.globalPopulation === 1).length;
  }

  function setMapStatus(text) { $('#mapStatus span').textContent = text; }
  function showMapFallback() { $('#mapFallback').hidden = false; setMapStatus('Geospatial basemap unavailable'); }

  function fitVisible() {
    if (!state.mapReady || state.realm !== 'Earth') return;
    const items = visibleEarthSpecies();
    if (!items.length) return;
    const bounds = new maplibregl.LngLatBounds();
    items.forEach(item => { const loc=effectiveLocation(item); bounds.extend([loc.lon,loc.lat]); });
    state.map.fitBounds(bounds,{padding:80,maxZoom:4,duration:900});
  }

  function resetMap() {
    clearRegionGeography();
    if (!state.mapReady) return;
    state.map.flyTo({center:[5,18],zoom:1.55,duration:900});
  }

  function toggleProjection() {
    if (!state.mapReady) return;
    state.projection = state.projection === 'globe' ? 'mercator' : 'globe';
    state.map.setProjection({type:state.projection});
    toast(state.projection === 'globe' ? 'Globe projection active' : 'Flat projection active');
  }

  function openAbout() { state.lastFocus=document.activeElement instanceof HTMLElement?document.activeElement:null; const modal=$('#aboutModal'); modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); $('#aboutButton').setAttribute('aria-expanded','true'); document.body.classList.add('modal-open'); setTimeout(()=>$('#closeAbout')?.focus({preventScroll:true}),100); }
  function closeAbout() { const modal=$('#aboutModal'); modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); $('#aboutButton').setAttribute('aria-expanded','false'); document.body.classList.remove('modal-open'); if(state.lastFocus?.isConnected)state.lastFocus.focus({preventScroll:true}); }

  function toast(message) {
    const element = $('#toast'); element.textContent = message; element.classList.add('show');
    clearTimeout(toast.timer); toast.timer = setTimeout(() => element.classList.remove('show'), 2200);
  }

  function clearFieldLog() {
    if (!confirm('Reset Discovered, Observed, and Favorites stored in this browser?')) return;
    field.discovered.clear(); field.observed.clear(); field.favorites.clear(); saveField(); renderFieldLog(); toast('Local Field Log reset');
  }

  function trapModalFocus(event) {
    const modal = [$('#regionModal'),$('#aboutModal')].find(element => element?.classList.contains('open'));
    if (!modal) return;
    const focusable = $$('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',modal).filter(element => !element.disabled && element.offsetParent !== null);
    if (!focusable.length) return;
    const first=focusable[0], last=focusable[focusable.length-1];
    if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
  }

  function bind() {
    $$('.nav-button').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
    $('#homeButton').addEventListener('click', () => { setView('globe'); state.realm='Earth'; $('#realmFilter').value='Earth'; renderMapMarkers(); clearRegionGeography(); resetMap(); });
    $('#aboutButton').addEventListener('click', openAbout); $('#footerAbout').addEventListener('click', openAbout); $('#closeAbout').addEventListener('click', closeAbout);
    $('#aboutModal').addEventListener('click', event => { if (event.target.id === 'aboutModal') closeAbout(); });
    $('#featuredRegionButton')?.addEventListener('click', () => openRegion('new-england'));
    $('#closeRegion')?.addEventListener('click', () => closeRegion());
    $('#regionModal')?.addEventListener('click', event => { if(event.target.id==='regionModal')closeRegion(); });
    $('#closeDossier').addEventListener('click', closeDossier);
    $('#favoriteButton').addEventListener('click', toggleFavorite); $('#observedButton').addEventListener('click', toggleObserved); $('#shareButton').addEventListener('click', copyShareLink);
    $('#realmFilter').addEventListener('change', event => { state.realm=event.target.value; renderMapMarkers(); });
    $('#categoryFilter').addEventListener('change', event => { state.category=event.target.value; renderMapMarkers(); });
    $('#accessFilter').addEventListener('change', event => { state.access=event.target.value; renderMapMarkers(); });
    $('#trackedOnly').addEventListener('change', event => { state.trackedOnly=event.target.checked; renderMapMarkers(); });
    $('#rangeToggle').addEventListener('change', event => { state.rangeEnabled=event.target.checked; if(state.selected)showSelectedGeography(state.selected); });
    $('#projectionButton').addEventListener('click', toggleProjection); $('#fitButton').addEventListener('click', fitVisible); $('#resetButton').addEventListener('click', resetMap);
    $('#indexCategory').addEventListener('change', renderIndex); $('#indexRealm').addEventListener('change', renderIndex);
    $('#searchInput').addEventListener('input', renderSearch);
    $('#searchInput').addEventListener('keydown', event => {
      if (['ArrowDown','ArrowUp'].includes(event.key) && state.searchMatches.length) {
        event.preventDefault();
        state.searchIndex = (state.searchIndex + (event.key==='ArrowDown'?1:-1) + state.searchMatches.length) % state.searchMatches.length;
        $$('.search-result[data-search]').forEach((button,index)=>{ const selected=index===state.searchIndex; button.classList.toggle('selected',selected); button.setAttribute('aria-selected',String(selected)); });
        $('#searchInput').setAttribute('aria-activedescendant',`search-result-${state.searchIndex}`);
      }
      if (event.key==='Enter' && state.searchMatches[state.searchIndex>=0?state.searchIndex:0]) chooseSearch(state.searchMatches[state.searchIndex>=0?state.searchIndex:0].slug);
      if(event.key==='Escape'){ $('#searchResults').classList.remove('open'); $('#searchInput').setAttribute('aria-expanded','false'); }
    });
    document.addEventListener('keydown', event => { if(event.key==='Tab')trapModalFocus(event); if(event.key==='/' && document.activeElement !== $('#searchInput')){event.preventDefault();$('#searchInput').focus();} if(event.key==='Escape'){ if($('#regionModal').classList.contains('open'))closeRegion(); else if($('#aboutModal').classList.contains('open'))closeAbout(); else closeDossier(); } });
    document.addEventListener('click', event => { if(!event.target.closest('.search-shell'))$('#searchResults').classList.remove('open'); });
    $$('.field-tabs button').forEach(button => button.addEventListener('click', () => { state.fieldTab=button.dataset.field; $$('.field-tabs button').forEach(x=>x.classList.toggle('active',x===button)); renderFieldLog(); }));
    $('#clearFieldLog').addEventListener('click', clearFieldLog);
    window.addEventListener('online',()=>setMapStatus('Network restored · synchronizing basemap'));
    window.addEventListener('offline',()=>setMapStatus('Offline mode · local archive available'));
    window.addEventListener('hashchange', openFromHash);
  }

  function openFromHash() {
    const match = location.hash.match(/species=([^&]+)/);
    if (match) {
      const item = findBySlug(decodeURIComponent(match[1]));
      if (item) openDossier(item, false);
    }
  }


  function fallbackArtwork(name = 'GAIA') {
    const initial = String(name || 'G').trim().charAt(0).toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><radialGradient id="g"><stop stop-color="#183748"/><stop offset="1" stop-color="#08131c"/></radialGradient></defs><circle cx="120" cy="120" r="106" fill="url(#g)" stroke="#d9bd78" stroke-width="3"/><circle cx="120" cy="120" r="76" fill="none" stroke="#8de9f5" stroke-opacity=".28"/><text x="120" y="147" text-anchor="middle" font-family="Georgia,serif" font-size="82" fill="#eaf1ee">${initial}</text></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  document.addEventListener('error', event => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.dataset.fallbackApplied) return;
    image.dataset.fallbackApplied = '1';
    image.src = fallbackArtwork(image.alt || 'GAIA');
  }, true);

  function init() {
    $('#app').hidden = false;
    const loadingStatus=$('#loadingStatus');
    if(loadingStatus){ setTimeout(()=>loadingStatus.textContent='Resolving current seasonal positions…',180); setTimeout(()=>loadingStatus.textContent='Opening civilian access network…',420); }
    populateControls(); bind(); renderLive(); renderIndex(); renderRecords(); renderFieldLog(); initMap();
    setTimeout(() => { $('#loading').style.opacity='0'; setTimeout(() => { $('#loading').remove(); state.map?.resize?.(); openFromHash(); }, 420); }, 650);
  }

  init();
});
