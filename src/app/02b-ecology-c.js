    if(!matches.length) return '';
    return `<section class="ecology-relations"><span class="eyebrow">ECOLOGICAL RELATIONSHIPS</span>${matches.map(relation=>`<article><div><b>${escapeHTML(relation.type)}</b><small>${escapeHTML(relation.seasonal)}</small></div><h4>${escapeHTML(relation.species.map(slug=>findBySlug(slug)?.name||slug).join(' + '))}</h4><p>${escapeHTML(relation.summary)}</p><em>${escapeHTML(relation.partner)}</em></article>`).join('')}</section>`;
  }
  function openEcologyInspector(properties) {
    const region=regionById.get(properties.regionId);
    if(!region) return;
    let slugs=[];
    try{slugs=JSON.parse(properties.species||'[]');}catch{}
    state.ecology.inspector={...properties,species:slugs};
    const inspector=$('#ecologyInspector');
    $('#ecologyInspectorContent').innerHTML=`<span class="eyebrow">${escapeHTML(properties.featureKind)} · ${escapeHTML(properties.regionName)}</span><h3>${escapeHTML(properties.name)}</h3><div class="season-status ${String(properties.seasonStatus).toLowerCase()}"><b>${escapeHTML(properties.seasonStatus)} now</b><span>${escapeHTML(properties.seasonNote||properties.seasonal||'Current seasonal interpretation available.')}</span></div><p>${escapeHTML(properties.note)}</p><div class="ecology-species-buttons">${speciesButtons(slugs)}</div>${relationCards(region.id,slugs)}<button id="inspectorRegionButton" class="secondary-button" type="button">Open ${escapeHTML(region.shortName||region.name)} field window</button>`;
    inspector.hidden=false;
    $$('[data-ecology-species]',inspector).forEach(button=>button.addEventListener('click',()=>{const item=findBySlug(button.dataset.ecologySpecies);if(item)openDossier(item,false);}));
    $('#inspectorRegionButton').addEventListener('click',()=>openRegion(region.id));
  }
  function closeEcologyInspector(){ $('#ecologyInspector').hidden=true; state.ecology.inspector=null; }

  const ecologyBaseRenderMapMarkers = renderMapMarkers;
  renderMapMarkers = function renderMarkersWithEcology(){
    ecologyBaseRenderMapMarkers();
    renderEcologyLayers();
  };

  const densityAddGeoSources = addGeoSources;
  addGeoSources = function addEcologyGeoSources(){
    densityAddGeoSources();
    ensureEcologyMapInteractions();
    renderEcologyLayers();
  };
  const densityShowRegionGeography = showRegionGeography;
  showRegionGeography = function showIntegratedRegionGeography(region){
    state.ecology.region=region?.id||'all';
    const filter=$('#ecologyRegionFilter'); if(filter)filter.value=state.ecology.region;
    densityShowRegionGeography(region);
    renderEcologyLayers();
  };
  clearRegionGeography = function clearIntegratedRegionGeography(){
    state.activeRegion=null;
    state.ecology.region='all';
    const filter=$('#ecologyRegionFilter'); if(filter)filter.value='all';
    state.map?.getSource?.('gaia-region-focus')?.setData(emptyFeatureCollection());
    renderEcologyLayers();
  };

  function renderRegionSeason(region){
    const season=regionSeason(region);
    const geometries=[...(region.geometry?.habitats||[]),...(region.geometry?.corridors||[])];
    const states=geometries.reduce((counts,geo)=>{const status=geometrySeason(region,geo.id).status;counts[status]=(counts[status]||0)+1;return counts;},{});
    return `<section class="region-season-panel"><div><span class="eyebrow">CURRENT REGIONAL PHASE</span><h3>${escapeHTML(season.name)}</h3><p>${escapeHTML(season.summary)}</p></div><dl><div><dt>Peak systems</dt><dd>${states.Peak||0}</dd></div><div><dt>Active systems</dt><dd>${states.Active||0}</dd></div><div><dt>Reduced / dormant</dt><dd>${(states.Reduced||0)+(states.Dormant||0)}</dd></div></dl></section>`;
  }
  renderRegionGeometry = function renderSeasonalRegionGeometry(region){
    const habitats=region.geometry?.habitats||[]; const corridors=region.geometry?.corridors||[];
    if(!habitats.length&&!corridors.length)return '';
    const card=(feature,kind)=>{const current=geometrySeason(region,feature.id);const names=(feature.species||[]).map(findBySlug).filter(Boolean).map(item=>item.name);return `<button class="geometry-card ${kind}" data-geometry-id="${escapeHTML(feature.id)}" data-geometry-kind="${kind==='habitat'?'habitats':'corridors'}"><i style="--geometry-color:${escapeHTML(feature.color||'#8de9f5')}"></i><div><span>${kind==='habitat'?'HABITAT SYSTEM':'ECOLOGICAL CORRIDOR'} · <em class="geometry-state ${current.status.toLowerCase()}">${escapeHTML(current.status)}</em></span><h4>${escapeHTML(feature.name)}</h4><p>${escapeHTML(feature.note)}</p><small>${escapeHTML(names.join(' · '))}</small></div></button>`;};
    return `<section class="region-geometry-section"><span class="eyebrow">MAPPED HABITAT SYSTEMS AND CORRIDORS</span><p class="geometry-intro">Layer intensity reflects the current UTC calendar. Public geometry remains generalized around vulnerable refuges and breeding sites.</p><div class="region-geometry-grid">${habitats.map(feature=>card(feature,'habitat')).join('')}${corridors.map(feature=>card(feature,'corridor')).join('')}</div></section>`;
  };
  function enhancedRegionSpeciesCard(entry,absent){
    const item=findBySlug(entry.slug); if(!item)return '';
