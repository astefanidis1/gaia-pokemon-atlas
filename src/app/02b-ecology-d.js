    const className=presenceClass(entry);
    return `<button class="region-species-card ${absent?'absent':''}" data-region-species="${escapeHTML(item.slug)}" data-presence-class="${className}"><img src="${escapeHTML(item.image)}" data-species-slug="${escapeHTML(item.slug)}" alt=""><span><b>${escapeHTML(item.name)}</b><small>${escapeHTML(absent?'Not established':entry.presence)} · ${escapeHTML(entry.frequency||'')}</small><em>${escapeHTML(entry.note)}</em></span>${absent?'':`<i>${className}</i>`}</button>`;
  }
  openRegion = function openEcologyRegion(id){
    const region=regionById.get(id); if(!region)return;
    state.lastFocus=document.activeElement instanceof HTMLElement?document.activeElement:null; state.activeRegion=region;
    const content=$('#regionContent'); const season=renderRegionSeason(region); const geometry=renderRegionGeometry(region); const relationships=relationCards(region.id);
    content.innerHTML=`<header class="region-hero"><span class="eyebrow">${escapeHTML(region.kicker)}</span><h2 id="regionTitle">${escapeHTML(region.name)}</h2><p>${escapeHTML(region.summary)}</p><small>${escapeHTML(region.method)}</small><button id="regionGlobeButton" class="primary-action">View current ecology on the globe</button></header>${season}<section><span class="eyebrow">ECOLOGICAL ZONES</span><div class="region-zones">${region.zones.map(zone=>`<article><b>${escapeHTML(zone.name)}</b><p>${escapeHTML(zone.note)}</p></article>`).join('')}</div></section>${geometry}${relationships}<section><span class="eyebrow">DOCUMENTED REGIONAL PRESENCE</span><div class="region-species-grid">${region.species.map(entry=>enhancedRegionSpeciesCard(entry,false)).join('')}</div></section><section class="absence-section"><span class="eyebrow">NOTABLE ABSENCES AND LIMITS</span><div class="region-absence-grid">${region.absences.map(entry=>enhancedRegionSpeciesCard(entry,true)).join('')}</div></section>`;
    const modal=$('#regionModal'); modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');
    $('#regionGlobeButton').addEventListener('click',()=>focusRegionOnMap(region));
    $$('[data-region-species]',content).forEach(button=>button.addEventListener('click',()=>{const item=findBySlug(button.dataset.regionSpecies);closeRegion(false);openDossier(item,false);}));
    $$('[data-geometry-id]',content).forEach(button=>button.addEventListener('click',()=>{const kind=button.dataset.geometryKind;const feature=(region.geometry?.[kind]||[]).find(item=>item.id===button.dataset.geometryId);if(!feature)return;const current=geometrySeason(region,feature.id);closeRegion(false); setView('globe'); showRegionGeography(region); if(state.mapReady)state.map.flyTo({center:region.center,zoom:Math.max(region.zoom||4,4),duration:700}); setTimeout(()=>openEcologyInspector({id:feature.id,regionId:region.id,regionName:region.shortName||region.name,name:feature.name,note:feature.note,color:feature.color,seasonal:feature.seasonal||'',seasonStatus:current.status,seasonNote:current.note||'',species:JSON.stringify(feature.species||[]),featureKind:kind==='habitats'?'Habitat system':'Ecological corridor'}),180);}));
    setTimeout(()=>$('#closeRegion')?.focus({preventScroll:true}),120);
  };

  function presenceCounts(region){return region.species.reduce((counts,entry)=>{const key=presenceClass(entry);counts[key]=(counts[key]||0)+1;return counts;},{});}
  function renderRegionExplorer(){
    const grid=$('#regionExplorerGrid'); if(!grid)return;
    grid.innerHTML=regions.map(region=>{const season=regionSeason(region);const counts=presenceCounts(region);const habitats=region.geometry?.habitats?.length||0;const corridors=region.geometry?.corridors?.length||0;const filter=state.ecology.presenceFilter;const visible=filter==='all'?region.species.length:(counts[filter]||0);return `<article class="region-explorer-card-item" data-region-explorer="${escapeHTML(region.id)}"><button class="region-explorer-main" type="button"><span class="eyebrow">${escapeHTML(region.kicker)}</span><h3>${escapeHTML(region.name)}</h3><p>${escapeHTML(region.summary)}</p><div class="region-current"><b>${escapeHTML(season.name)}</b><span>${escapeHTML(season.summary)}</span></div></button><dl><div><dt>${filter==='all'?'Documented':filter}</dt><dd>${visible}</dd></div><div><dt>Habitats</dt><dd>${habitats}</dd></div><div><dt>Corridors</dt><dd>${corridors}</dd></div></dl><button class="region-map-action" type="button" data-region-map="${escapeHTML(region.id)}">Focus globe</button></article>`;}).join('');
    $$('[data-region-explorer]',grid).forEach(card=>card.querySelector('.region-explorer-main').addEventListener('click',()=>{closeRegionExplorer(false);openRegion(card.dataset.regionExplorer);}));
    $$('[data-region-map]',grid).forEach(button=>button.addEventListener('click',()=>{const region=regionById.get(button.dataset.regionMap);closeRegionExplorer(false);focusRegionOnMap(region);}));
  }
  function openRegionExplorer(){state.lastFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;renderRegionExplorer();const modal=$('#regionExplorerModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');setTimeout(()=>$('#closeRegionExplorer')?.focus({preventScroll:true}),100);}
  function closeRegionExplorer(restore=true){const modal=$('#regionExplorerModal');modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');if(restore&&state.lastFocus?.isConnected)state.lastFocus.focus({preventScroll:true});}

  const baseRenderRegionalWindows=renderRegionalWindows;
  renderRegionalWindows=function renderSeasonalWindows(){baseRenderRegionalWindows();$$('[data-region]',$('#regionGrid')).forEach(button=>{const region=regionById.get(button.dataset.region);const season=regionSeason(region);const p=document.createElement('em');p.className='region-season-inline';p.textContent=`${season.name} · ${season.summary}`;button.appendChild(p);});};

  const ecologyBasePopulateControls=populateControls;
  populateControls=function populateEcologyControls(){
    ecologyBasePopulateControls();
    const select=$('#ecologyRegionFilter');
    if(select){select.innerHTML='<option value="all">All mapped regions</option>'+regions.map(region=>`<option value="${escapeHTML(region.id)}">${escapeHTML(region.shortName||region.name)}</option>`).join('');}
  };
  const ecologyBaseBind=bind;
  bind=function bindEcology(){
    ecologyBaseBind();
    $('#regionalExplorerButton')?.addEventListener('click',openRegionExplorer);
    $('#recordsRegionExplorerButton')?.addEventListener('click',openRegionExplorer);
    $('#closeRegionExplorer')?.addEventListener('click',()=>closeRegionExplorer());
    $('#regionExplorerModal')?.addEventListener('click',event=>{if(event.target.id==='regionExplorerModal')closeRegionExplorer();});
    $$('.presence-filter button').forEach(button=>button.addEventListener('click',()=>{state.ecology.presenceFilter=button.dataset.presenceFilter;$$('.presence-filter button').forEach(item=>item.classList.toggle('active',item===button));renderRegionExplorer();}));
    $('#habitatLayerToggle')?.addEventListener('change',event=>{state.ecology.habitats=event.target.checked;renderEcologyLayers();});
    $('#corridorLayerToggle')?.addEventListener('change',event=>{state.ecology.corridors=event.target.checked;renderEcologyLayers();});
    $('#seasonLayerToggle')?.addEventListener('change',event=>{state.ecology.seasonal=event.target.checked;renderEcologyLayers();});
    $('#ecologyRegionFilter')?.addEventListener('change',event=>{state.ecology.region=event.target.value;renderEcologyLayers();});
    $('#closeEcologyInspector')?.addEventListener('click',closeEcologyInspector);
  };
