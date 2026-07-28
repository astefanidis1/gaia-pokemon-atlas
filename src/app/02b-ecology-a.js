/* GAIA ecology integration: regional explorer, seasonal layers, and ecological relationships. */
  const ecologyRelationships = editorial.relationships || [];
  const relationshipsByRegion = ecologyRelationships.reduce((map, relation) => {
    if (!map.has(relation.regionId)) map.set(relation.regionId, []);
    map.get(relation.regionId).push(relation);
    return map;
  }, new Map());
  state.ecology = { habitats:true, corridors:true, seasonal:true, region:'all', inspector:null, presenceFilter:'all' };


  function installEcologyInterface() {
    const launch=$('#featuredRegionButton');
    if(launch){launch.id='regionalExplorerButton';launch.innerHTML='<span><b>Regional Explorer</b><small>4 field windows · live seasonal ecology</small></span><i>Open →</i>';}
    const summary=$('#realmSummary');
    if(summary&&!$('#ecologyRegionFilter')) summary.insertAdjacentHTML('afterend',`<aside class="ecology-layer-panel glass" aria-label="Ecology map layers"><div><span class="panel-kicker">ECOLOGY LAYERS</span><strong id="ecologySeasonLabel">Current seasonal state</strong></div><label class="mini-switch"><input id="habitatLayerToggle" type="checkbox" checked><i></i><span>Habitats</span></label><label class="mini-switch"><input id="corridorLayerToggle" type="checkbox" checked><i></i><span>Corridors</span></label><label class="mini-switch"><input id="seasonLayerToggle" type="checkbox" checked><i></i><span>Season intensity</span></label><select id="ecologyRegionFilter" aria-label="Filter ecology layers by region"><option value="all">All mapped regions</option></select></aside><aside id="ecologyInspector" class="ecology-inspector glass" aria-live="polite" hidden><button id="closeEcologyInspector" type="button" aria-label="Close ecology detail">×</button><div id="ecologyInspectorContent"></div></aside>`);
    const regionalHeading=$('.regional-heading');
    if(regionalHeading&&!$('#recordsRegionExplorerButton')) regionalHeading.insertAdjacentHTML('beforeend','<button id="recordsRegionExplorerButton" class="secondary-button" type="button">Open Regional Explorer</button>');
    const regionModal=$('#regionModal');
    if(regionModal&&!$('#regionExplorerModal')) regionModal.insertAdjacentHTML('beforebegin',`<div id="regionExplorerModal" class="modal region-explorer-modal" role="dialog" aria-modal="true" aria-labelledby="regionExplorerTitle" aria-hidden="true"><div class="modal-card region-explorer-card"><button id="closeRegionExplorer" class="dossier-close" aria-label="Close Regional Explorer">×</button><header class="region-explorer-heading"><span class="eyebrow">GAIA REGIONAL EXPLORER</span><h2 id="regionExplorerTitle">A living world, viewed at human scale</h2><p>Compare residents, seasonal visitors, managed partners, habitat systems, and current ecological activity without requesting your location.</p><div class="presence-filter" role="group" aria-label="Filter regional presences"><button class="active" data-presence-filter="all">All</button><button data-presence-filter="resident">Residents</button><button data-presence-filter="seasonal">Seasonal</button><button data-presence-filter="managed">Partners / managed</button></div></header><div id="regionExplorerGrid" class="region-explorer-grid"></div></div></div>`);
    const footer=$('footer'); if(footer)footer.innerHTML=footer.innerHTML.replace('CANON v1.4','CANON v1.5');
    document.addEventListener('keydown',event=>{
      const modal=$('#regionExplorerModal'); if(!modal?.classList.contains('open'))return;
      if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();closeRegionExplorer();return;}
      if(event.key!=='Tab')return;
      const focusable=$$('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',modal).filter(el=>!el.disabled&&el.offsetParent!==null);
      if(!focusable.length)return; const first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();event.stopImmediatePropagation();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();event.stopImmediatePropagation();first.focus();}
    },true);
  }
  installEcologyInterface();

  function currentMonthUTC() { return new Date().getUTCMonth() + 1; }
  function currentSeasonId() {
    const month = currentMonthUTC();
    if ([12,1,2].includes(month)) return 'winter';
    if ([3,4,5].includes(month)) return 'spring';
    if ([6,7,8].includes(month)) return 'summer';
    return 'autumn';
  }
  function regionSeason(region) {
    const month = currentMonthUTC();
    return (region.seasonalCycle || []).find(entry => (entry.months || []).includes(month)) || { id:currentSeasonId(), name:'Current season', summary:'Regional seasonal interpretation is pending.' };
  }
  function presenceClass(entry) {
    const value = `${entry?.presence || ''} ${entry?.frequency || ''}`.toLowerCase();
    if (/partner|workforce|institution|managed|registered/.test(value)) return 'managed';
    if (/transient|flyover|passage|visitor|seasonal/.test(value)) return 'seasonal';
    if (/resident/.test(value)) return 'resident';
    return 'documented';
  }
  function geometrySeason(region, geometryId) {
    const profile = region.geometrySeasonality?.[geometryId] || {};
    const month = currentMonthUTC();
    let status='Dormant', multiplier=.16;
    if ((profile.peakMonths || []).includes(month)) { status='Peak'; multiplier=1; }
    else if ((profile.activeMonths || []).includes(month)) { status='Active'; multiplier=.72; }
    else if ((profile.quietMonths || []).includes(month)) { status='Reduced'; multiplier=.38; }
    return { ...profile, status, multiplier };
  }
  function ecologyFeatures(kind, regionsToUse) {
    return regionsToUse.flatMap(region => (region.geometry?.[kind] || []).map(feature => {
      const seasonal = geometrySeason(region, feature.id);
      const baseOpacity = Number(feature.opacity || (kind === 'habitats' ? .1 : .82));
      return {
        type:'Feature',
        properties:{
          id:feature.id, regionId:region.id, regionName:region.shortName || region.name,
