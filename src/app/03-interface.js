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
    $('#fieldGrid').innerHTML = list.length ? list.map(item => `<button class="field-card ${state.fieldTab === 'undiscovered' ? 'unknown' : ''}" data-field-open="${item.slug}"><img src="${item.image}" alt="" data-species-slug="${item.slug}"><strong>${state.fieldTab === 'undiscovered' ? 'Undiscovered' : escapeHTML(item.name)}</strong><small>${state.fieldTab === 'undiscovered' ? `Index #${String(item.dex).padStart(4,'0')}` : escapeHTML(item.category)}</small></button>`).join('') : `<div class="empty-state"><h3>No records here yet.</h3><p>Explore the globe or index to build your personal Field Log.</p></div>`;
    $$('[data-field-open]').forEach(card => card.addEventListener('click', () => openDossier(findBySlug(card.dataset.fieldOpen), false)));
  }

  function renderSearch() {
    const query = $('#searchInput').value.trim().toLowerCase();
    const results = $('#searchResults');
    if (!query) { results.classList.remove('open'); results.innerHTML=''; $('#searchInput').setAttribute('aria-expanded','false'); state.searchIndex=-1; return; }
    state.searchMatches = species.filter(item => [item.name,item.category,item.habitat,item.origin,item.location.label,item.group].join(' ').toLowerCase().includes(query)).slice(0,10);
    state.searchIndex = state.searchMatches.length ? 0 : -1;
    results.innerHTML = state.searchMatches.length ? state.searchMatches.map((item,index) => `<button id="search-result-${index}" class="search-result ${index===0?'selected':''}" data-search="${item.slug}" role="option" aria-selected="${index===0}"><img src="${item.image}" alt="" data-species-slug="${item.slug}"><span><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(item.location.label)}</small></span><b>${compact(item.globalPopulation)}</b></button>`).join('') : `<div class="search-result"><span>No GAIA record matches “${escapeHTML(query)}”.</span></div>`;
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

  function renderSurveillanceTicker() {
    const ticker = $('#surveillanceTicker');
    if (!ticker) return;
    const tracked = species.filter(item => item.route).map(item => ({ item, pos: livePosition(item) }));
    ticker.innerHTML = `<span class="ticker-label"><i></i>LIVE SURVEILLANCE</span><div class="ticker-track">${tracked.map(({item,pos}) => `<button data-ticker-species="${item.slug}"><i></i><span><b>${escapeHTML(item.name)}</b><small>${escapeHTML(pos.currentLabel)} → ${escapeHTML(pos.nextLabel)}</small></span><strong>${Math.round(pos.progress*100)}%</strong></button>`).join('')}<span class="ticker-census"><b>${fmt(species.length)}</b><small>species records reconciled</small></span></div>`;
    $$('[data-ticker-species]', ticker).forEach(button => button.addEventListener('click', () => openDossier(findBySlug(button.dataset.tickerSpecies), false)));
  }

  function openMethod() {
    state.lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const modal = $('#methodModal');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    setTimeout(() => $('#closeMethod')?.focus({preventScroll:true}), 100);
  }

  function closeMethod() {
    const modal = $('#methodModal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
    if (state.lastFocus?.isConnected) state.lastFocus.focus({preventScroll:true});
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
    const modal = [$('#regionModal'),$('#aboutModal'),$('#methodModal')].find(element => element?.classList.contains('open'));
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
    $('#censusMethodButton')?.addEventListener('click', openMethod);
    $('#statusKeyButton')?.addEventListener('click', openMethod);
    $('#closeMethod')?.addEventListener('click', closeMethod);
    $('#methodModal')?.addEventListener('click', event => { if (event.target.id === 'methodModal') closeMethod(); });
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
    $$('.record-filters button').forEach(button => button.addEventListener('click', () => { state.recordFilter=button.dataset.recordFilter; $$('.record-filters button').forEach(x=>x.classList.toggle('active',x===button)); renderRecords(); }));
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
    document.addEventListener('keydown', event => { if(event.key==='Tab')trapModalFocus(event); if(event.key==='/' && document.activeElement !== $('#searchInput')){event.preventDefault();$('#searchInput').focus();} if(event.key==='Escape'){ if($('#regionModal').classList.contains('open'))closeRegion(); else if($('#methodModal').classList.contains('open'))closeMethod(); else if($('#aboutModal').classList.contains('open'))closeAbout(); else closeDossier(); } });
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


  function fallbackArtwork(reference = 'GAIA') {
    const item = species.find(entry => entry.slug === reference || entry.name === reference);
    const name = item?.name || String(reference || 'GAIA');
    const initial = name.trim().charAt(0).toUpperCase();
    const accent = colors[item?.category] || '#8de9f5';
    const dex = item ? `INDEX ${String(item.dex).padStart(4,'0')}` : 'GAIA ARCHIVE';
    const category = item?.category || 'IMAGE SIGNAL LOST';
    const glyph = item?.route ? '⌁' : item?.location?.realm !== 'Earth' ? '◇' : item?.globalPopulation === 1 ? '◆' : '◉';
    const safeName = escapeHTML(name.toUpperCase());
    const safeCategory = escapeHTML(category.toUpperCase());
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><defs><radialGradient id="glow"><stop stop-color="${accent}" stop-opacity=".28"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient></defs><circle cx="160" cy="145" r="132" fill="url(#glow)"/><circle cx="160" cy="145" r="108" fill="none" stroke="${accent}" stroke-opacity=".62" stroke-width="2"/><circle cx="160" cy="145" r="82" fill="none" stroke="#eaf1ee" stroke-opacity=".25" stroke-dasharray="5 9"/><path d="M160 27v30M160 233v30M42 145h30M248 145h30" stroke="${accent}" stroke-opacity=".48"/><text x="160" y="179" text-anchor="middle" font-family="Georgia,serif" font-size="108" fill="#eaf1ee" fill-opacity=".92">${initial}</text><text x="160" y="64" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" fill="${accent}">${glyph}</text><rect x="52" y="258" width="216" height="38" rx="19" fill="#071019" fill-opacity=".82" stroke="${accent}" stroke-opacity=".38"/><text x="160" y="276" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" letter-spacing="1.6" fill="#eaf1ee">${safeName}</text><text x="160" y="290" text-anchor="middle" font-family="Arial,sans-serif" font-size="7.5" letter-spacing="1.2" fill="#9eb1b7">${dex} · ${safeCategory}</text></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  function applyArtworkFallback(image) {
    if (!(image instanceof HTMLImageElement) || image.dataset.fallbackApplied) return;
    const original = image.dataset.originalSrc || image.currentSrc || image.src;
    image.dataset.originalSrc = original;
    image.dataset.fallbackApplied = '1';
    image.classList.add('archive-fallback');
    image.parentElement?.classList.add('fallback-art');
    image.src = fallbackArtwork(image.dataset.speciesSlug || image.alt || 'GAIA');
    setTimeout(() => {
      if (!navigator.onLine || image.dataset.originalRestored) return;
      const retry = new Image();
      retry.onload = () => { image.dataset.originalRestored='1'; image.src=original; image.classList.remove('archive-fallback'); image.parentElement?.classList.remove('fallback-art'); };
      retry.src = original;
    }, 12000);
  }

  function armArtworkFallback(image) {
    if (!(image instanceof HTMLImageElement) || !image.dataset.speciesSlug || image.dataset.fallbackArmed) return;
    image.dataset.fallbackArmed = '1';
    image.dataset.originalSrc = image.currentSrc || image.src;
    const timer = setTimeout(() => {
      if (!image.complete || image.naturalWidth === 0) applyArtworkFallback(image);
    }, 3000);
    image.addEventListener('load', () => clearTimeout(timer), { once:true });
    image.addEventListener('error', () => { clearTimeout(timer); applyArtworkFallback(image); }, { once:true });
  }

  document.addEventListener('error', event => applyArtworkFallback(event.target), true);
  const artworkObserver = new MutationObserver(mutations => {
    for (const mutation of mutations) for (const node of mutation.addedNodes) {
      if (!(node instanceof Element)) continue;
      if (node.matches?.('img[data-species-slug]')) armArtworkFallback(node);
      node.querySelectorAll?.('img[data-species-slug]').forEach(armArtworkFallback);
    }
  });
  artworkObserver.observe(document.documentElement, { childList:true, subtree:true });

  function init() {
    $('#app').hidden = false;
    const loadingStatus=$('#loadingStatus');
    if(loadingStatus){ setTimeout(()=>loadingStatus.textContent='Resolving current seasonal positions…',180); setTimeout(()=>loadingStatus.textContent='Opening civilian access network…',420); }
    populateControls(); bind(); renderLive(); renderIndex(); renderRecords(); renderFieldLog(); renderSurveillanceTicker(); initMap();
    document.querySelectorAll('img[data-species-slug]').forEach(armArtworkFallback);
    if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
    setInterval(renderSurveillanceTicker, 60000);
    setTimeout(() => { $('#loading').style.opacity='0'; setTimeout(() => { $('#loading').remove(); state.map?.resize?.(); openFromHash(); }, 420); }, 650);
  }

  init();
});
