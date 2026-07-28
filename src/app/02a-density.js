/* GAIA world-density phase: regional habitat systems and corridors. */
  const baseAddGeoSources = addGeoSources;
  addGeoSources = function addDensityGeoSources() {
    baseAddGeoSources();
    if (!state.mapReady) return;
    if (!state.map.getSource('gaia-region-habitats')) {
      state.map.addSource('gaia-region-habitats', { type:'geojson', data:emptyFeatureCollection() });
      state.map.addLayer({
        id:'gaia-region-habitat-fill', type:'fill', source:'gaia-region-habitats',
        paint:{
          'fill-color':['coalesce',['get','color'],'#8ec99a'],
          'fill-opacity':['coalesce',['get','opacity'],.1]
        }
      });
      state.map.addLayer({
        id:'gaia-region-habitat-line', type:'line', source:'gaia-region-habitats',
        paint:{
          'line-color':['coalesce',['get','color'],'#8ec99a'],
          'line-width':1.25, 'line-opacity':.72
        }
      });
    }
    if (!state.map.getSource('gaia-region-corridors')) {
      state.map.addSource('gaia-region-corridors', { type:'geojson', data:emptyFeatureCollection() });
      state.map.addLayer({
        id:'gaia-region-corridor-line', type:'line', source:'gaia-region-corridors',
        paint:{
          'line-color':['coalesce',['get','color'],'#8de9f5'],
          'line-width':2.4, 'line-opacity':.82, 'line-dasharray':[2,1.4]
        }
      });
    }
  };

  renderRegionalWindows = function renderDensityRegionalWindows() {
    const grid = $('#regionGrid');
    if (!grid) return;
    grid.innerHTML = regions.map(region => {
      const habitatCount = region.geometry?.habitats?.length || 0;
      const corridorCount = region.geometry?.corridors?.length || 0;
      return `<button class="region-card" data-region="${escapeHTML(region.id)}"><span class="eyebrow">${escapeHTML(region.kicker)}</span><h3>${escapeHTML(region.name)}</h3><p>${escapeHTML(region.summary)}</p><div><b>${region.species.length} documented presences</b><small>${region.absences.length} explicit absences</small>${habitatCount || corridorCount ? `<small>${habitatCount} habitat systems · ${corridorCount} corridors</small>` : ''}</div></button>`;
    }).join('');
    $$('[data-region]', grid).forEach(button => button.addEventListener('click', () => openRegion(button.dataset.region)));
  };

  function renderRegionGeometry(region) {
    const habitats = region.geometry?.habitats || [];
    const corridors = region.geometry?.corridors || [];
    if (!habitats.length && !corridors.length) return '';
    const habitatCards = habitats.map(feature => {
      const names = (feature.species || []).map(findBySlug).filter(Boolean).map(item => item.name);
      return `<article class="geometry-card habitat"><i style="--geometry-color:${escapeHTML(feature.color || '#8ec99a')}"></i><div><span>HABITAT SYSTEM</span><h4>${escapeHTML(feature.name)}</h4><p>${escapeHTML(feature.note)}</p><small>${escapeHTML(names.join(' · '))}</small></div></article>`;
    }).join('');
    const corridorCards = corridors.map(feature => {
      const names = (feature.species || []).map(findBySlug).filter(Boolean).map(item => item.name);
      return `<article class="geometry-card corridor"><i style="--geometry-color:${escapeHTML(feature.color || '#8de9f5')}"></i><div><span>ECOLOGICAL CORRIDOR</span><h4>${escapeHTML(feature.name)}</h4><p>${escapeHTML(feature.note)}</p><em>${escapeHTML(feature.seasonal || '')}</em><small>${escapeHTML(names.join(' · '))}</small></div></article>`;
    }).join('');
    return `<section class="region-geometry-section"><span class="eyebrow">MAPPED HABITAT SYSTEMS AND CORRIDORS</span><p class="geometry-intro">These layers represent ecological use, not political boundaries. Public geometry is deliberately generalized where breeding sites or vulnerable refuges are involved.</p><div class="region-geometry-grid">${habitatCards}${corridorCards}</div></section>`;
  }

  openRegion = function openDensityRegion(id) {
    const region = regionById.get(id);
    if (!region) return;
    state.lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    state.activeRegion = region;
    const content = $('#regionContent');
    const geometrySection = renderRegionGeometry(region);
    content.innerHTML = `<header class="region-hero"><span class="eyebrow">${escapeHTML(region.kicker)}</span><h2 id="regionTitle">${escapeHTML(region.name)}</h2><p>${escapeHTML(region.summary)}</p><small>${escapeHTML(region.method)}</small><button id="regionGlobeButton" class="primary-action">View this region on the globe</button></header><section><span class="eyebrow">ECOLOGICAL ZONES</span><div class="region-zones">${region.zones.map(zone => `<article><b>${escapeHTML(zone.name)}</b><p>${escapeHTML(zone.note)}</p></article>`).join('')}</div></section>${geometrySection}<section><span class="eyebrow">DOCUMENTED REGIONAL PRESENCE</span><div class="region-species-grid">${region.species.map(entry => regionSpeciesCard(entry,false)).join('')}</div></section><section class="absence-section"><span class="eyebrow">NOTABLE ABSENCES AND LIMITS</span><div class="region-absence-grid">${region.absences.map(entry => regionSpeciesCard(entry,true)).join('')}</div></section>`;
    const modal = $('#regionModal');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    $('#regionGlobeButton').addEventListener('click', () => focusRegionOnMap(region));
    $$('[data-region-species]', content).forEach(button => button.addEventListener('click', () => {
      const item=findBySlug(button.dataset.regionSpecies);
      closeRegion(false);
      openDossier(item,false);
    }));
    setTimeout(() => $('#closeRegion')?.focus({preventScroll:true}), 120);
  };

  showRegionGeography = function showDensityRegionGeography(region) {
    state.activeRegion = region;
    const focusSource = state.map?.getSource?.('gaia-region-focus');
    const habitatSource = state.map?.getSource?.('gaia-region-habitats');
    const corridorSource = state.map?.getSource?.('gaia-region-corridors');
    if (focusSource) {
      focusSource.setData(region?.polygon?.length ? {
        type:'FeatureCollection',
        features:[{
          type:'Feature',
          properties:{id:region.id},
          geometry:{type:'Polygon',coordinates:[[...region.polygon]]}
        }]
      } : emptyFeatureCollection());
    }
    if (habitatSource) {
      habitatSource.setData({
        type:'FeatureCollection',
        features:(region.geometry?.habitats || [])
          .filter(feature => feature.polygon?.length)
          .map(feature => ({
            type:'Feature',
            properties:{
              id:feature.id, name:feature.name,
              color:feature.color, opacity:feature.opacity
            },
            geometry:{type:'Polygon',coordinates:[[...feature.polygon]]}
          }))
      });
    }
    if (corridorSource) {
      corridorSource.setData({
        type:'FeatureCollection',
        features:(region.geometry?.corridors || [])
          .filter(feature => feature.coordinates?.length > 1)
          .map(feature => ({
            type:'Feature',
            properties:{
              id:feature.id, name:feature.name,
              color:feature.color, seasonal:feature.seasonal
            },
            geometry:{type:'LineString',coordinates:feature.coordinates}
          }))
      });
    }
    const habitatCount = region.geometry?.habitats?.length || 0;
    const corridorCount = region.geometry?.corridors?.length || 0;
    setMapStatus(`${region.shortName} · ${habitatCount} habitat systems · ${corridorCount} corridors`);
  };

  clearRegionGeography = function clearDensityRegionGeography() {
    state.activeRegion = null;
    state.map?.getSource?.('gaia-region-focus')?.setData(emptyFeatureCollection());
    state.map?.getSource?.('gaia-region-habitats')?.setData(emptyFeatureCollection());
    state.map?.getSource?.('gaia-region-corridors')?.setData(emptyFeatureCollection());
  };
