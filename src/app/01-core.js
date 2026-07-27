window.GAIA_DATA_READY.then(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const fmt = n => new Intl.NumberFormat('en-US').format(Number(n || 0));
  const compact = n => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(n || 0));
  const escapeHTML = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));

  const species = (window.GAIA_SPECIES || []).map(item => ({ ...item }));
  const forms = window.GAIA_FORMS || [];
  const populations = window.GAIA_POPULATIONS || [];
  const locations = window.GAIA_LOCATIONS || [];
  const routes = window.GAIA_ROUTES || [];
  const incidents = window.GAIA_INCIDENTS || [];
  const editorial = window.GAIA_EDITORIAL || { dossiers:{}, regions:[], flagshipOrder:[] };
  const editorialDossiers = editorial.dossiers || {};
  const regions = editorial.regions || [];
  const regionById = new Map(regions.map(region => [region.id, region]));
  const byId = new Map(species.map(item => [item.id, item]));
  const groupBy = (rows, key) => rows.reduce((map, row) => { const id=row[key]; if(!map.has(id))map.set(id,[]); map.get(id).push(row); return map; }, new Map());
  const populationsBySpecies = groupBy(populations, 'speciesId');
  const locationsBySpecies = groupBy(locations, 'speciesId');
  const formsBySpecies = groupBy(forms, 'speciesId');
  const routeBySpecies = new Map(routes.map(item => [item.speciesId, item]));

  species.forEach(item => {
    item.populationRecords = populationsBySpecies.get(item.id) || [];
    item.locations = locationsBySpecies.get(item.id) || [];
    item.forms = formsBySpecies.get(item.id) || [];
    item.populationRecord = item.populationRecords[0];
    item.location = item.locations[0];
    item.route = routeBySpecies.get(item.id);
  });

  const state = {
    view: 'globe',
    realm: 'Earth',
    category: 'all',
    access: 'all',
    trackedOnly: false,
    rangeEnabled: true,
    map: null,
    mapReady: false,
    projection: 'globe',
    markers: new Map(),
    selected: null,
    fieldTab: 'discovered',
    searchMatches: [],
    searchIndex: -1,
    lastFocus: null,
    activeRegion: null,
    recordFilter: 'all',
    minimalMap: false,
  };

  const field = loadField();
  const colors = {
    Legendary: '#d9bd78', Mythical: '#d895cf', 'Ultra Beast': '#b696ff',
    'Pseudo-Legendary': '#8de9f5', 'Rare / Powerful': '#8ec99a'
  };

  function loadField() {
    try {
      const saved = JSON.parse(localStorage.getItem('gaia-field-log-v1') || '{}');
      return {
        discovered: new Set(saved.discovered || []),
        observed: new Set(saved.observed || []),
        favorites: new Set(saved.favorites || []),
      };
    } catch {
      return { discovered: new Set(), observed: new Set(), favorites: new Set() };
    }
  }

  function saveField() {
    try {
      localStorage.setItem('gaia-field-log-v1', JSON.stringify({
        discovered: [...field.discovered], observed: [...field.observed], favorites: [...field.favorites]
      }));
    } catch {
      // Personal state still works for the current session when storage is blocked.
    }
    updateFieldMetrics();
  }

  function dayProgress(periodDays = 365.2425, offset = 0) {
    const now = new Date();
    const yearStart = Date.UTC(now.getUTCFullYear(), 0, 1);
    const day = (now.getTime() - yearStart) / 86400000;
    return ((day / periodDays) + offset) % 1;
  }

  function normalizeLon(lon) {
    let x = lon;
    while (x > 180) x -= 360;
    while (x < -180) x += 360;
    return x;
  }

  function interpolateRoute(route) {
    if (!route?.waypoints?.length) return null;
    const progress = dayProgress(route.period_days, route.phase_offset || 0);
    const segmentCount = route.waypoints.length - 1;
    const scaled = progress * segmentCount;
    const index = Math.min(segmentCount - 1, Math.floor(scaled));
    const local = scaled - index;
    const a = route.waypoints[index];
    const b = route.waypoints[index + 1];
    let deltaLon = b.lon - a.lon;
    if (deltaLon > 180) deltaLon -= 360;
    if (deltaLon < -180) deltaLon += 360;
    return {
      lat: a.lat + (b.lat - a.lat) * local,
      lon: normalizeLon(a.lon + deltaLon * local),
      progress,
      segmentProgress: local,
      currentLabel: a.label,
      nextLabel: b.label,
      index,
    };
  }

  function livePosition(item) {
    return item.route ? interpolateRoute(item.route) : null;
  }

  function effectiveLocation(item) {
    const live = livePosition(item);
    if (live) return { ...item.location, lat: live.lat, lon: live.lon, label: live.currentLabel, live };
    return item.location;
  }

  function locationText(item) {
    const loc = effectiveLocation(item);
    if (loc?.live) return `${loc.live.currentLabel} → ${loc.live.nextLabel}`;
    if (item.locations?.length > 1) return item.locations.map(place => place.label).join(' · ');
    return loc?.label || 'Location withheld';
  }

  function currentUTCLabel() {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric'
    }).format(new Date()) + ' UTC';
  }

  function routePhase(item) {
    const pos = livePosition(item);
    if (!pos) return '';
    const month = new Date().getUTCMonth();
    if (month <= 1 || month === 11) return 'Winter movement phase';
    if (month <= 4) return 'Spring migration phase';
    if (month <= 7) return 'Summer range phase';
    return 'Autumn migration phase';
  }

  function visibleEarthSpecies() {
    const zoom = state.map?.getZoom?.() ?? 1.6;
    return species.filter(item => {
      if (item.location?.realm !== 'Earth') return false;
      if (state.category !== 'all' && item.category !== state.category) return false;
      if (state.access !== 'all' && item.accessStatus !== state.access) return false;
      if (state.trackedOnly && !item.route) return false;
      if (item.route) return true;
      if (zoom < 2.2) return item.globalPopulation <= 5;
      if (zoom < 3.0) return item.globalPopulation <= 100 || ['Legendary','Mythical','Ultra Beast'].includes(item.category);
      if (zoom < 4.2) return item.legacyRangeType !== 'Worldwide' || item.globalPopulation <= 10000;
      return true;
    });
  }

  function allFilteredRealmSpecies() {
    return species.filter(item => {
      if (item.location?.realm !== state.realm) return false;
      if (state.category !== 'all' && item.category !== state.category) return false;
      if (state.access !== 'all' && item.accessStatus !== state.access) return false;
      if (state.trackedOnly && !item.route) return false;
      return true;
    });
  }

  function itemTone(item) {
    return editorialDossiers[item?.slug]?.tone || item?.category?.toLowerCase().replace(/[^a-z]+/g,'-') || 'field';
  }

  function markerElement(item) {
    const element = document.createElement('button');
    element.className = `gaia-marker ${item.route ? 'live' : ''} ${['Restricted','Sealed'].includes(item.accessStatus) ? 'restricted' : ''}`;
    element.type = 'button';
    element.setAttribute('aria-label', `Open ${item.name} record`);
    element.style.borderColor = colors[item.category] || '#8de9f5';
    const image = document.createElement('img');
    image.src = item.image;
    image.alt = '';
    image.dataset.speciesSlug = item.slug;
    image.loading = 'lazy';
    image.decoding = 'async';
    element.appendChild(image);
    if (item.route || item.globalPopulation <= 5) {
      const label = document.createElement('span');
      label.className = 'marker-label';
      label.textContent = item.name;
      element.appendChild(label);
    }
    element.addEventListener('click', event => {
      event.stopPropagation();
      openDossier(item, false);
    });
    return element;
  }

  function initMap() {
    if (!window.maplibregl) return showMapFallback();
    try {
      const map = new maplibregl.Map({
        container: 'map', style: 'https://tiles.openfreemap.org/styles/liberty',
        center: [5, 18], zoom: 1.55, projection: 'globe', attributionControl: true,
      });
      state.map = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
      const timeout = setTimeout(() => { if (!state.mapReady) activateMinimalMap(); }, 9000);
      map.on('load', () => {
        clearTimeout(timeout);
        state.mapReady = true;
        addGeoSources();
        renderMapMarkers();
        setMapStatus('Global census layer synchronized');
      });
      map.on('zoomend', renderMapMarkers);
      map.on('moveend', () => updateMarkerSelection());
      map.on('error', event => {
        if (!state.mapReady && event?.error) setMapStatus('Basemap reconnecting…');
      });
    } catch {
      showMapFallback();
    }
  }

  function minimalMapStyle() {
    return {
      version: 8,
      sources: {},
      layers: [{ id:'gaia-local-background', type:'background', paint:{ 'background-color':'#050b11' } }]
    };
  }

  function activateMinimalMap() {
    if (!state.map || state.minimalMap) return showMapFallback();
    state.minimalMap = true;
    setMapStatus('External basemap unavailable · opening local globe mode');
    try {
      state.map.once('style.load', () => {
        state.mapReady = true;
        addGeoSources();
        renderMapMarkers();
        $('#mapFallback').hidden = true;
        document.body.classList.add('minimal-map');
        setMapStatus('Local globe mode · canonical markers remain active');
      });
      state.map.setStyle(minimalMapStyle());
    } catch {
      showMapFallback();
    }
  }

  function addGeoSources() {
    if (!state.mapReady) return;
    state.map.addSource('gaia-selected-range', { type: 'geojson', data: emptyFeatureCollection() });
    state.map.addLayer({ id: 'gaia-selected-fill', type: 'fill', source: 'gaia-selected-range', paint: { 'fill-color':'#68cddd','fill-opacity':.08 } });
    state.map.addLayer({ id: 'gaia-selected-line', type: 'line', source: 'gaia-selected-range', paint: { 'line-color':'#8de9f5','line-width':1.5,'line-opacity':.55,'line-dasharray':[3,2] } });
    state.map.addSource('gaia-live-route', { type: 'geojson', data: emptyFeatureCollection() });
    state.map.addLayer({ id: 'gaia-live-route-line', type: 'line', source: 'gaia-live-route', paint: { 'line-color':'#d9bd78','line-width':2,'line-opacity':.7,'line-dasharray':[2,2] } });
    state.map.addSource('gaia-region-focus', { type:'geojson', data:emptyFeatureCollection() });
    state.map.addLayer({ id:'gaia-region-fill', type:'fill', source:'gaia-region-focus', paint:{ 'fill-color':'#d9bd78','fill-opacity':.055 } });
    state.map.addLayer({ id:'gaia-region-line', type:'line', source:'gaia-region-focus', paint:{ 'line-color':'#d9bd78','line-width':1.6,'line-opacity':.7,'line-dasharray':[4,2] } });
  }

  function emptyFeatureCollection() { return { type:'FeatureCollection', features:[] }; }

  function renderMapMarkers() {
    if (state.realm !== 'Earth') {
      if (state.mapReady) { for (const marker of state.markers.values()) marker.remove(); state.markers.clear(); }
      renderRealmOverlay(); updateVisibleCount(); return;
    }
    removeRealmOverlay();
    if (!state.mapReady) return;
    for (const marker of state.markers.values()) marker.remove();
    state.markers.clear();
    const items = visibleEarthSpecies();
    items.forEach(item => {
      const loc = effectiveLocation(item);
      if (!Number.isFinite(loc?.lat) || !Number.isFinite(loc?.lon)) return;
      const element = markerElement(item);
      const marker = new maplibregl.Marker({ element, anchor:'bottom' }).setLngLat([loc.lon, loc.lat]).addTo(state.map);
      state.markers.set(item.id, marker);
    });
    updateMarkerSelection();
    updateVisibleCount(items.length);
    setMapStatus(`${items.length} records resolved at this zoom`);
  }

  function updateMarkerSelection() {
    for (const [id, marker] of state.markers) {
      marker.getElement().classList.toggle('selected', state.selected?.id === id);
    }
  }

  function renderRealmOverlay() {
    removeRealmOverlay();
    const overlay = document.createElement('div');
    overlay.id = 'realmOverlay';
    overlay.className = 'realm-overlay';
    const items = allFilteredRealmSpecies();
    overlay.innerHTML = `<div class="realm-overlay-heading"><span class="eyebrow">${escapeHTML(state.realm)}</span><h2>${state.realm === 'Dimension' ? 'Higher-dimensional contact' : 'Known off-world populations'}</h2><p>${items.length} verified records. Orbital placement is schematic; every named anchor is canonical.</p></div><div class="realm-card-grid">${items.map(item => `<button class="cosmic-card" data-species="${item.slug}"><img src="${item.image}" alt=""><span>${escapeHTML(item.category)}</span><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(item.location.label)}</small><b>${fmt(item.globalPopulation)} living</b></button>`).join('')}</div>`;
    $('#view-globe').appendChild(overlay);
    $$('[data-species]', overlay).forEach(button => button.addEventListener('click', () => openDossier(findBySlug(button.dataset.species), false)));
  }

  function removeRealmOverlay() { $('#realmOverlay')?.remove(); }

  function updateVisibleCount(forced) {
    const count = forced ?? allFilteredRealmSpecies().length;
    $('#visibleCount').textContent = `${count} record${count === 1 ? '' : 's'} visible`;
    const copy = {
      Earth:'Rare individuals appear as tracked markers. Distributed species resolve progressively as you zoom.',
      'Solar System':'Verified colonies and singular organisms located within the Solar System.',
      'Deep Space':'Instrument-accessible populations beyond the Solar System.',
      Dimension:'Contact anchors for organisms whose primary existence is not spatially conventional.'
    };
    $('#realmSummary small').textContent = copy[state.realm];
    $('#realmSummary .panel-kicker').textContent = `${state.realm.toUpperCase()} SURVEILLANCE`;
  }

  function geoCircle(lon, lat, radiusKm, points = 72) {
    const coords = [];
    const earth = 6371;
    const angular = radiusKm / earth;
    const latRad = lat * Math.PI / 180;
    const lonRad = lon * Math.PI / 180;
    for (let i = 0; i <= points; i++) {
      const bearing = 2 * Math.PI * i / points;
      const lat2 = Math.asin(Math.sin(latRad) * Math.cos(angular) + Math.cos(latRad) * Math.sin(angular) * Math.cos(bearing));
      const lon2 = lonRad + Math.atan2(Math.sin(bearing) * Math.sin(angular) * Math.cos(latRad), Math.cos(angular) - Math.sin(latRad) * Math.sin(lat2));
      coords.push([normalizeLon(lon2 * 180 / Math.PI), lat2 * 180 / Math.PI]);
    }
    return { type:'Feature', geometry:{ type:'Polygon', coordinates:[coords] }, properties:{} };
  }

  function rangeRadius(item) {
    if (item.legacyRangeType === 'Worldwide') return 4500;
    if (item.legacyRangeType === 'Regional') return 1250;
    if (item.globalPopulation <= 5) return 65;
    if (item.globalPopulation <= 100) return 180;
    return 420;
  }

  function showSelectedGeography(item) {
    if (!state.mapReady || item.location?.realm !== 'Earth') return;
    const loc = effectiveLocation(item);
    const rangeSource = state.map.getSource('gaia-selected-range');
    const routeSource = state.map.getSource('gaia-live-route');
    if (rangeSource) {
      rangeSource.setData(state.rangeEnabled ? { type:'FeatureCollection', features:[geoCircle(loc.lon, loc.lat, rangeRadius(item))] } : emptyFeatureCollection());
    }
    if (routeSource) {
      routeSource.setData(item.route ? { type:'FeatureCollection', features:[{ type:'Feature', properties:{}, geometry:{ type:'LineString', coordinates:item.route.waypoints.map(p => [p.lon,p.lat]) }}] } : emptyFeatureCollection());
    }
  }

  function clearSelectedGeography() {
    state.map?.getSource?.('gaia-selected-range')?.setData(emptyFeatureCollection());
    state.map?.getSource?.('gaia-live-route')?.setData(emptyFeatureCollection());
  }

