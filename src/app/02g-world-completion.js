/* GAIA World Completion Pass I: complete record tiers, world-state Live, canonical observations, archives, and index depth. */
  const GAIA_WORLD_COMPLETION_VERSION='2026-08-01.1';
  window.GAIA_WORLD_COMPLETION_VERSION=GAIA_WORLD_COMPLETION_VERSION;

  if(!document.querySelector('link[data-gaia-world-completion]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='world-completion.css';
    link.dataset.gaiaWorldCompletion='true';
    document.head.appendChild(link);
  }

  queueMicrotask(()=>{
    const observationStorageKey='gaia-field-observations-v2';
    const worldPolicy=editorial.recordPolicy||{};
    const completionState={
      observationItem:null,
      archiveItem:null,
      archiveIndex:0,
      index:{danger:'all',mobility:'all',depth:'all',sort:'dex'}
    };

    function loadObservationRecords(){
      try{
        const rows=JSON.parse(localStorage.getItem(observationStorageKey)||'[]');
        return new Map((Array.isArray(rows)?rows:[]).filter(row=>row?.speciesId).map(row=>[row.speciesId,row]));
      }catch{
        return new Map();
      }
    }

    const observationRecords=loadObservationRecords();
    for(const speciesId of field.observed){
      if(!observationRecords.has(speciesId)){
        observationRecords.set(speciesId,{
          speciesId,
          locationId:null,
          locationLabel:'Location not recorded',
          locationType:'Legacy local record',
          observedAt:null,
          legacy:true
        });
      }
    }

    function persistObservationRecords(){
      try{
        localStorage.setItem(observationStorageKey,JSON.stringify([...observationRecords.values()]));
      }catch{
        // The current session still retains the personal observation state.
      }
    }

    function syncObservedSet(){
      field.observed.clear();
      observationRecords.forEach((record,speciesId)=>{
        if(record) field.observed.add(speciesId);
      });
    }

    const completionBaseSaveField=saveField;
    saveField=function saveCompletionField(){
      if(field.observed.size===0&&observationRecords.size) observationRecords.clear();
      else syncObservedSet();
      completionBaseSaveField();
      persistObservationRecords();
    };
    syncObservedSet();
    persistObservationRecords();

    function safeLocationLabel(location){
      return String(location?.label||'').trim();
    }

    function observationOptions(item){
      if(!item) return [];
      if(item.route&&item.location?.realm==='Earth'){
        const position=livePosition(item);
        if(position){
          return [{
            id:`route:${item.route.id||item.id}`,
            label:position.currentLabel,
            type:'Current tracked position zone',
            detail:`Canonical route toward ${position.nextLabel}`
          }];
        }
      }
      return (item.locations||[])
        .map((location,index)=>({location,index}))
        .filter(({location})=>location?.realm==='Earth'&&safeLocationLabel(location)&&!/withheld|unknown|redacted/i.test(safeLocationLabel(location)))
        .map(({location,index})=>({
          id:location.id||`${item.id}:location:${index}`,
          label:safeLocationLabel(location),
          type:location.locationType||'Public canonical location',
          detail:location.publicPrecision||location.rangeNote||''
        }));
    }

    function observationEligibility(item){
      if(!item) return {allowed:false,reason:'No GAIA record is selected.',options:[]};
      if(item.accessStatus==='Sealed') return {allowed:false,reason:'Civilian observation is unavailable for sealed records.',options:[]};
      if(['Archived','Contact Lost'].includes(item.knowledgeStatus)) return {allowed:false,reason:'GAIA does not publish a current observable location for this record.',options:[]};
      if(!item.locations?.some(location=>location.realm==='Earth')) return {allowed:false,reason:'This record has no Earth location available for an in-person observation.',options:[]};
      const options=observationOptions(item);
      if(!options.length) return {allowed:false,reason:'All known locations are withheld or unsuitable for civilian observation.',options:[]};
      return {allowed:true,reason:'',options};
    }

    function utcObservationDate(){
      return new Date().toISOString().slice(0,10);
    }

    function formatObservationDate(value){
      if(!value) return 'Legacy entry';
      const date=new Date(`${value}T00:00:00Z`);
      return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(date);
    }

    function installCompletionDialogs(){
      if(!$('#observationModal')){
        $('#toast').insertAdjacentHTML('beforebegin',`
          <div id="observationModal" class="modal completion-modal" role="dialog" aria-modal="true" aria-labelledby="observationTitle" aria-hidden="true">
            <div class="modal-card observation-card">
              <button id="closeObservation" class="dossier-close" type="button" aria-label="Close observation record">×</button>
              <header class="completion-dialog-heading">
                <span class="eyebrow">PERSONAL FIELD LOG</span>
                <h2 id="observationTitle">Record a canonical observation</h2>
                <p id="observationIntro"></p>
              </header>
              <form id="observationForm">
                <fieldset id="observationOptions"></fieldset>
                <p class="observation-privacy">Stored only in this browser. Your observation never changes GAIA evidence, locations, population totals, or canon.</p>
                <div class="completion-dialog-actions">
                  <button id="removeObservation" class="secondary-button" type="button">Remove observation</button>
                  <button id="saveObservation" class="primary-action" type="submit">Record observation</button>
                </div>
              </form>
            </div>
          </div>
          <div id="archiveReaderModal" class="modal completion-modal archive-reader-modal" role="dialog" aria-modal="true" aria-labelledby="archiveReaderTitle" aria-hidden="true">
            <article class="modal-card archive-reader-card">
              <button id="closeArchiveReader" class="dossier-close" type="button" aria-label="Close archive document">×</button>
              <div id="archiveReaderContent"></div>
            </article>
          </div>`);
      }
    }
    installCompletionDialogs();

    function openCompletionModal(modal,focusSelector){
      modal.classList.add('open');
      modal.setAttribute('aria-hidden','false');
      modal.removeAttribute('inert');
      document.body.classList.add('modal-open');
      setTimeout(()=>$(focusSelector,modal)?.focus({preventScroll:true}),80);
    }

    function closeCompletionModal(modal,restoreFocus=true){
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden','true');
      modal.setAttribute('inert','');
      document.body.classList.remove('modal-open');
      if(restoreFocus&&state.lastFocus?.isConnected) state.lastFocus.focus({preventScroll:true});
    }

    function openObservationModal(item){
      const eligibility=observationEligibility(item);
      if(!eligibility.allowed){
        toast(eligibility.reason);
        return;
      }
      completionState.observationItem=item;
      state.lastFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
      const existing=observationRecords.get(item.id);
      $('#observationTitle').textContent=`Record ${item.name} observation`;
      $('#observationIntro').textContent=`Choose the existing GAIA location where you observed ${item.name}. New locations and free-text reports are intentionally not accepted.`;
      $('#observationOptions').innerHTML=`<legend>Canonical public location</legend>${eligibility.options.map((option,index)=>{
        const checked=existing?.locationId===option.id||(!existing&&index===0);
        return `<label class="observation-option"><input type="radio" name="observationLocation" value="${escapeHTML(option.id)}" ${checked?'checked':''}><span><b>${escapeHTML(option.label)}</b><small>${escapeHTML(option.type)}${option.detail?` · ${escapeHTML(option.detail)}`:''}</small></span></label>`;
      }).join('')}`;
      $('#removeObservation').hidden=!existing;
      $('#saveObservation').textContent=existing?'Update observation':'Record observation';
      openCompletionModal($('#observationModal'),'input[name="observationLocation"]:checked');
    }

    function closeObservationModal(){
      completionState.observationItem=null;
      closeCompletionModal($('#observationModal'));
    }

    function saveObservation(event){
      event.preventDefault();
      const item=completionState.observationItem;
      if(!item) return;
      const eligibility=observationEligibility(item);
      const selected=$('input[name="observationLocation"]:checked',$('#observationForm'));
      const option=eligibility.options.find(row=>row.id===selected?.value);
      if(!option){
        toast('Choose a canonical location first.');
        return;
      }
      observationRecords.set(item.id,{
        speciesId:item.id,
        locationId:option.id,
        locationLabel:option.label,
        locationType:option.type,
        observedAt:utcObservationDate()
      });
      field.observed.add(item.id);
      saveField();
      renderDossierActions(item);
      renderFieldLog();
      closeObservationModal();
      toast(`Observation recorded at ${option.label}`);
    }

    function removeObservation(){
      const item=completionState.observationItem;
      if(!item) return;
      observationRecords.delete(item.id);
      field.observed.delete(item.id);
      saveField();
      renderDossierActions(item);
      renderFieldLog();
      closeObservationModal();
      toast('Observation removed from the local Field Log');
    }

    $('#observationForm').addEventListener('submit',saveObservation);
    $('#removeObservation').addEventListener('click',removeObservation);
    $('#closeObservation').addEventListener('click',closeObservationModal);
    $('#observationModal').addEventListener('click',event=>{if(event.target.id==='observationModal')closeObservationModal();});

    const completionBaseToggleObserved=toggleObserved;
    toggleObserved=function toggleCanonicalObservation(){
      if(state.selected) openObservationModal(state.selected);
    };
    $('#observedButton').removeEventListener('click',completionBaseToggleObserved);
    $('#observedButton').addEventListener('click',toggleObserved);

    const completionBaseRenderDossierActions=renderDossierActions;
    renderDossierActions=function renderCompletionDossierActions(item){
      completionBaseRenderDossierActions(item);
      const button=$('#observedButton');
      const eligibility=observationEligibility(item);
      const existing=observationRecords.get(item.id);
      button.disabled=!eligibility.allowed;
      button.classList.toggle('active',Boolean(existing));
      button.title=eligibility.allowed?'Record the canonical location where you observed this species':eligibility.reason;
      button.setAttribute('aria-label',eligibility.allowed?(existing?`Update recorded observation for ${item.name}`:`Record an observation of ${item.name}`):eligibility.reason);
      button.textContent=!eligibility.allowed?'⊘ Observation unavailable':existing?'● Observation recorded':'◉ Record observation';
    };

    function formBreakdown(item){
      if(!item.forms?.length) return '';
      return `<article><h3>Permanent forms and populations</h3><div class="form-breakdown">${item.forms.map(form=>{
        const population=item.populationRecords.find(record=>record.formId===form.id);
        const location=item.locations.find(place=>place.formId===form.id);
        return `<div><b>${escapeHTML(form.name)}</b><span>${fmt(population?.count||form.population)} living</span><small>${escapeHTML(location?.label||'Location withheld')}</small></div>`;
      }).join('')}</div></article>`;
    }

    function distributionSentence(item){
      if(item.route){
        const position=livePosition(item);
        return `${item.name} is presently resolved through a synchronized seasonal route from ${position?.currentLabel||item.location?.label||'its current zone'} toward ${position?.nextLabel||'the next verified route state'}.`;
      }
      if(item.locations?.length>1) return `The civilian record resolves ${item.locations.length} established public locations: ${item.locations.map(location=>location.label).join(', ')}.`;
      if(item.legacyRangeType==='Worldwide') return `${item.name} is treated as a globally distributed species; map detail resolves progressively rather than through one misleading point.`;
      return `The current public record centers on ${locationText(item)}.`;
    }

    function dangerSentence(item){
      const level=Number(item.dangerLevel||0);
      if(level>=4) return `Civilian contact requires strict local guidance. GAIA classifies the species at danger level ${level}/5 (${item.dangerLabel}), and public precision may be reduced around vulnerable or hazardous sites.`;
      if(level>=2) return `The species is not treated as harmless. GAIA assigns danger level ${level}/5 (${item.dangerLabel}); visitors should follow local wildlife and access guidance.`;
      return `Routine coexistence is considered manageable under ordinary wildlife precautions. GAIA currently assigns danger level ${level}/5 (${item.dangerLabel}).`;
    }

    function coreRecordMarkup(item){
      const dossier=item.dossier||{};
      const published=[
        dossier.ecology?{title:'Ecology',body:dossier.ecology}:null,
        dossier.humanRelationship?{title:'Human relationship',body:dossier.humanRelationship}:null,
        dossier.history?{title:'Historical record',body:dossier.history}:null,
        dossier.protocol?{title:'GAIA response protocol',body:dossier.protocol}:null
      ].filter(Boolean);
      const generated=[
        {
          title:'Civilian publication scope',
          body:`This is a complete Civilian Summary Record: GAIA publishes the verified census, primary geography, habitat, danger, conservation, and access context needed for public exploration. A deeper archive dossier is not required for this record to be considered complete.`
        },
        {
          title:'Ecology and public range',
          body:`${item.name} is associated primarily with ${item.habitat}. ${distributionSentence(item)}`
        },
        {
          title:'Population and monitoring',
          body:`GAIA currently certifies ${fmt(item.globalPopulation)} living ${item.name}. The census was confirmed ${formatVerified(item.censusVerified)}, with knowledge status ${item.knowledgeStatus} and ${item.accessStatus} civilian access.`
        },
        {
          title:'Public coexistence context',
          body:`${dangerSentence(item)} Conservation status is recorded as ${item.conservationStatus}; origin is classified as ${item.origin}.`
        }
      ];
      const seen=new Set(published.map(section=>section.title));
      const sections=[...published,...generated.filter(section=>!seen.has(section.title))];
      return formBreakdown(item)+sections.map(section=>`<article class="civilian-summary-section"><h3>${escapeHTML(section.title)}</h3><p>${escapeHTML(section.body)}</p></article>`).join('');
    }

    const completionBaseRenderDossierSections=renderDossierSections;
    renderDossierSections=function renderCompleteDossierSections(item){
      if(editorialDossiers[item.slug]){
        completionBaseRenderDossierSections(item);
        return;
      }
      $('#dossierSections').innerHTML=coreRecordMarkup(item);
    };

    function applyDossierTier(item){
      $('#dossierTier')?.remove();
      const full=Boolean(editorialDossiers[item.slug]);
      $('#dossierSummary').insertAdjacentHTML('afterend',`<div id="dossierTier" class="dossier-tier ${full?'full':'summary'}"><span>${full?'FULL GAIA DOSSIER':'CIVILIAN SUMMARY RECORD'}</span><small>${full?'Extended analysis, founder notes, and linked archives':'Complete public census, range, ecology, and coexistence record'}</small></div>`);
    }

    const completionBaseOpenDossier=openDossier;
    openDossier=function openCompletionDossier(item,move=true){
      completionBaseOpenDossier(item,move);
      applyDossierTier(item);
      renderDossierActions(item);
    };

    const completionBaseUpdateFieldMetrics=updateFieldMetrics;
    updateFieldMetrics=function updateCompletionFieldMetrics(){
      completionBaseUpdateFieldMetrics();
      $('#observedTotal').textContent=observationRecords.size;
    };

    const completionBaseRenderFieldLog=renderFieldLog;
    renderFieldLog=function renderCompletionFieldLog(){
      if(state.fieldTab!=='observed'){
        completionBaseRenderFieldLog();
        return;
      }
      updateFieldMetrics();
      const rows=[...observationRecords.values()]
        .map(record=>({record,item:byId.get(record.speciesId)}))
        .filter(row=>row.item)
        .sort((a,b)=>a.item.dex-b.item.dex);
      $('#fieldGrid').innerHTML=rows.length?rows.map(({record,item})=>`<button class="field-card observed-field-card" data-field-open="${escapeHTML(item.slug)}"><img src="${escapeHTML(item.image)}" alt="" data-species-slug="${escapeHTML(item.slug)}"><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(record.locationLabel||'Location not recorded')}</small><em>${escapeHTML(record.locationType||'Canonical location')} · ${escapeHTML(formatObservationDate(record.observedAt))}</em></button>`).join(''):`<div class="empty-state"><h3>No canonical observations recorded.</h3><p>Open an eligible Earth record and choose the existing GAIA location where you observed it.</p></div>`;
      $$('[data-field-open]',$('#fieldGrid')).forEach(card=>card.addEventListener('click',()=>openDossier(findBySlug(card.dataset.fieldOpen),false)));
    };

    function installIndexControls(){
      const controls=$('.index-controls');
      if(!controls||$('#indexDanger')) return;
      controls.insertAdjacentHTML('beforeend',`
        <select id="indexDanger" aria-label="Filter by danger"><option value="all">All danger levels</option><option value="low">Low danger</option><option value="moderate">Moderate danger</option><option value="severe">Severe danger</option></select>
        <select id="indexMobility" aria-label="Filter by mobility"><option value="all">All mobility</option><option value="tracked">Actively tracked</option><option value="distributed">Distributed range</option><option value="fixed">Fixed / primary site</option></select>
        <select id="indexDepth" aria-label="Filter by publication depth"><option value="all">All record depths</option><option value="full">Full dossiers</option><option value="summary">Civilian summaries</option></select>
        <select id="indexSort" aria-label="Sort GAIA Index"><option value="dex">Index number</option><option value="population-desc">Population: high to low</option><option value="population-asc">Population: low to high</option><option value="danger-desc">Danger: high to low</option><option value="name">Species name</option></select>`);
      $('.table-shell').insertAdjacentHTML('beforebegin','<div id="indexSummary" class="index-summary" aria-live="polite"></div>');
    }
    installIndexControls();

    function dangerBand(item){
      const level=Number(item.dangerLevel||0);
      return level>=4?'severe':level>=2?'moderate':'low';
    }

    function mobilityBand(item){
      if(item.route) return 'tracked';
      if(item.legacyRangeType==='Worldwide'||item.locations?.length>1) return 'distributed';
      return 'fixed';
    }

    const completionBaseRenderIndex=renderIndex;
    renderIndex=function renderCompletionIndex(){
      const category=$('#indexCategory').value||'all';
      const realm=$('#indexRealm').value||'all';
      const danger=$('#indexDanger')?.value||completionState.index.danger;
      const mobility=$('#indexMobility')?.value||completionState.index.mobility;
      const depth=$('#indexDepth')?.value||completionState.index.depth;
      const sort=$('#indexSort')?.value||completionState.index.sort;
      Object.assign(completionState.index,{danger,mobility,depth,sort});
      const list=species.filter(item=>
        (category==='all'||item.category===category)&&
        (realm==='all'||item.location.realm===realm)&&
        (danger==='all'||dangerBand(item)===danger)&&
        (mobility==='all'||mobilityBand(item)===mobility)&&
        (depth==='all'||(depth==='full')===Boolean(editorialDossiers[item.slug]))
      );
      const sorts={
        dex:(a,b)=>a.dex-b.dex,
        'population-desc':(a,b)=>b.globalPopulation-a.globalPopulation||a.dex-b.dex,
        'population-asc':(a,b)=>a.globalPopulation-b.globalPopulation||a.dex-b.dex,
        'danger-desc':(a,b)=>Number(b.dangerLevel||0)-Number(a.dangerLevel||0)||a.dex-b.dex,
        name:(a,b)=>a.name.localeCompare(b.name)
      };
      list.sort(sorts[sort]||sorts.dex);
      $('#indexSummary').textContent=`${fmt(list.length)} of ${fmt(species.length)} verified records · ${list.filter(item=>editorialDossiers[item.slug]).length} full dossiers · ${list.filter(item=>item.route).length} active tracks`;
      $('#indexBody').innerHTML=list.map(item=>`<tr data-index-open="${escapeHTML(item.slug)}" tabindex="0"><td>${String(item.dex).padStart(4,'0')}</td><td><div class="species-cell"><img src="${escapeHTML(item.image)}" alt="" data-species-slug="${escapeHTML(item.slug)}"><span><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(item.knowledgeStatus)} · ${editorialDossiers[item.slug]?'Full dossier':'Civilian summary'}</small></span></div></td><td>${escapeHTML(item.category)}</td><td>${escapeHTML(locationText(item))}</td><td><strong>${fmt(item.globalPopulation)}</strong></td><td><span class="status-pill ${escapeHTML(item.accessStatus)}">${escapeHTML(item.accessStatus)}</span></td></tr>`).join('');
      $$('[data-index-open]').forEach(row=>{
        const open=()=>openDossier(findBySlug(row.dataset.indexOpen),false);
        row.addEventListener('click',open);
        row.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open();}});
      });
    };
    $('#indexCategory').removeEventListener('change',completionBaseRenderIndex);
    $('#indexRealm').removeEventListener('change',completionBaseRenderIndex);
    ['indexCategory','indexRealm','indexDanger','indexMobility','indexDepth','indexSort'].forEach(id=>$('#'+id)?.addEventListener('change',renderIndex));

    const completionBaseRenderRecords=renderRecords;
    renderRecords=function renderCompletionRecords(){
      completionBaseRenderRecords();
      $$('.record-card.core-record .record-depth').forEach(label=>label.textContent='CIVILIAN SUMMARY RECORD');
    };

    function worldGeometrySignals(){
      const order={Peak:0,Active:1,Reduced:2,Dormant:3};
      return regions.flatMap(region=>['habitats','corridors'].flatMap(kind=>(region.geometry?.[kind]||[]).map(feature=>({
        region,kind,feature,current:geometrySeason(region,feature.id)
      })))).sort((a,b)=>order[a.current.status]-order[b.current.status]||a.region.name.localeCompare(b.region.name)||a.feature.name.localeCompare(b.feature.name));
    }

    function completionOpenGeometry(regionId,featureId){
      const region=regionById.get(regionId);
      if(!region) return;
      const kind=['habitats','corridors'].find(key=>(region.geometry?.[key]||[]).some(feature=>feature.id===featureId));
      const feature=(region.geometry?.[kind]||[]).find(row=>row.id===featureId);
      if(!feature) return;
      state.realm='Earth';
      state.category='all';
      state.access='all';
      $('#realmFilter').value='Earth';
      $('#categoryFilter').value='all';
      $('#accessFilter').value='all';
      setView('globe');
      renderMapMarkers();
      showRegionGeography(region);
      if(state.mapReady) state.map.flyTo({center:region.center,zoom:Math.max(region.zoom||4,4),duration:700});
      const current=geometrySeason(region,feature.id);
      setTimeout(()=>openEcologyInspector({
        id:feature.id,
        regionId:region.id,
        regionName:region.shortName||region.name,
        name:feature.name,
        note:feature.note,
        color:feature.color,
        seasonal:feature.seasonal||'',
        seasonStatus:current.status,
        seasonNote:current.note||'',
        species:JSON.stringify(feature.species||[]),
        featureKind:kind==='habitats'?'Habitat system':'Ecological corridor'
      }),140);
      history.replaceState(null,'',`${location.pathname}${location.search}#ecology=${encodeURIComponent(feature.id)}`);
    }

    function ensureWorldStateShell(){
      const view=$('#view-live');
      if(!view||$('#worldStateFeed')) return;
      $('#liveGrid').insertAdjacentHTML('afterend',`
        <section id="worldStateFeed" class="world-state-feed">
          <header class="live-section-heading"><div><span class="eyebrow">REGIONAL CONDITIONS</span><h3>Earth is active beyond the tracked routes</h3></div><p>Current states are derived from the real UTC calendar, mapped ecology, and published regional cycles.</p></header>
          <div id="regionalConditionGrid" class="regional-condition-grid"></div>
          <header class="live-section-heading compact"><div><span class="eyebrow">ECOLOGY NOW</span><h3>Active habitat systems and corridors</h3></div></header>
          <div id="ecologyNowGrid" class="ecology-now-grid"></div>
          <header class="live-section-heading compact"><div><span class="eyebrow">CURRENT RELATIONSHIPS</span><h3>Causal systems worth following</h3></div></header>
          <div id="relationshipNowGrid" class="relationship-now-grid"></div>
        </section>`);
    }
    ensureWorldStateShell();

    const completionBaseRenderLive=renderLive;
    renderLive=function renderCompletionLive(){
      const tracked=species.filter(item=>item.route).map(item=>({item,pos:livePosition(item)}));
      $('#movingMetric').textContent=tracked.length;
      $('#liveCount').textContent=tracked.length+regions.length;
      $('#worldDate').textContent=currentUTCLabel();
      const featured=tracked.find(row=>row.item.name==='Lugia')||tracked[0];
      $('#liveHero').innerHTML=featured?liveFeature(featured.item,featured.pos):'';
      $('#liveGrid').innerHTML=tracked.filter(row=>row!==featured).map(({item,pos})=>`<article class="live-card" data-open="${escapeHTML(item.slug)}"><img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" data-species-slug="${escapeHTML(item.slug)}"><div><span class="eyebrow">${escapeHTML(routePhase(item))}</span><h3>${escapeHTML(item.name)}</h3><p>${escapeHTML(pos.currentLabel)} → ${escapeHTML(pos.nextLabel)}</p><div class="track-line"><span>Canonical route</span><strong>${Math.round(pos.progress*100)}%</strong><i><b style="width:${pos.progress*100}%"></b></i></div></div></article>`).join('');
      $$('[data-open]',$('#view-live')).forEach(card=>card.addEventListener('click',()=>openDossier(findBySlug(card.dataset.open),false)));

      const heading=$('#view-live .page-heading>div:first-child');
      $('h2',heading).textContent='Current world state';
      $('p',heading).textContent='Canonical movement, seasonal regional conditions, public advisories, and active ecological systems synchronized to UTC.';

      $('#regionalConditionGrid').innerHTML=regions.map(region=>{
        const season=regionSeason(region);
        const active=Object.keys(region.geometrySeasonality||{}).map(id=>geometrySeason(region,id)).filter(row=>['Peak','Active'].includes(row.status)).length;
        return `<button class="regional-condition-card" type="button" data-live-region="${escapeHTML(region.id)}"><span>${escapeHTML(region.kicker)}</span><h4>${escapeHTML(region.shortName||region.name)}</h4><b>${escapeHTML(season.name)}</b><p>${escapeHTML(season.summary)}</p><small>${active} active systems · ${region.species.length} documented presences</small></button>`;
      }).join('');

      const geometrySignals=worldGeometrySignals().filter(row=>row.current.status!=='Dormant').slice(0,8);
      $('#ecologyNowGrid').innerHTML=geometrySignals.map(({region,kind,feature,current})=>`<button class="ecology-now-card ${current.status.toLowerCase()}" type="button" data-live-geometry="${escapeHTML(feature.id)}" data-live-geometry-region="${escapeHTML(region.id)}"><span>${escapeHTML(current.status)} · ${kind==='habitats'?'HABITAT':'CORRIDOR'}</span><h4>${escapeHTML(feature.name)}</h4><p>${escapeHTML(current.note||feature.note)}</p><small>${escapeHTML(region.shortName||region.name)} · ${(feature.species||[]).length} linked species</small></button>`).join('');

      const day=Math.floor(Date.now()/86400000);
      const relationships=[...(editorial.relationships||[])].sort((a,b)=>a.id.localeCompare(b.id));
      const rotated=relationships.length?relationships.slice(day%relationships.length).concat(relationships.slice(0,day%relationships.length)).slice(0,6):[];
      $('#relationshipNowGrid').innerHTML=rotated.map(relation=>`<button class="relationship-now-card" type="button" data-live-relationship-region="${escapeHTML(relation.regionId)}"><span>${escapeHTML(relation.type)}</span><h4>${escapeHTML(relation.partner)}</h4><p>${escapeHTML(relation.summary)}</p><small>${escapeHTML(relation.seasonal)}</small></button>`).join('');

      $$('[data-live-region]').forEach(button=>button.addEventListener('click',()=>openRegion(button.dataset.liveRegion)));
      $$('[data-live-geometry]').forEach(button=>button.addEventListener('click',()=>completionOpenGeometry(button.dataset.liveGeometryRegion,button.dataset.liveGeometry)));
      $$('[data-live-relationship-region]').forEach(button=>button.addEventListener('click',()=>openRegion(button.dataset.liveRelationshipRegion)));
    };

    function archiveFor(item,index){
      return editorialDossiers[item?.slug]?.archives?.[index]||null;
    }

    function renderArchiveDocument(){
      const item=completionState.archiveItem;
      const index=completionState.archiveIndex;
      const archive=archiveFor(item,index);
      if(!item||!archive) return;
      const archives=editorialDossiers[item.slug]?.archives||[];
      $('#archiveReaderContent').innerHTML=`
        <header class="archive-reader-heading">
          <span class="eyebrow">${escapeHTML(archive.classification)} · ${escapeHTML(archive.code)}</span>
          <h2 id="archiveReaderTitle">${escapeHTML(archive.title)}</h2>
          <p>${escapeHTML(archive.date)} · Civilian archive extract</p>
        </header>
        <section class="archive-document-body">
          <div class="archive-document-stamp">${escapeHTML(item.accessStatus.toUpperCase())}</div>
          <span class="eyebrow">DOCUMENT ABSTRACT</span>
          <p class="archive-document-lead">${escapeHTML(archive.summary)}</p>
          <dl>
            <div><dt>Primary subject</dt><dd>${escapeHTML(item.name)}</dd></div>
            <div><dt>Record class</dt><dd>${escapeHTML(archive.classification)}</dd></div>
            <div><dt>Knowledge status</dt><dd>${escapeHTML(item.knowledgeStatus)}</dd></div>
            <div><dt>Verified population</dt><dd>${fmt(item.globalPopulation)}</dd></div>
            <div><dt>Public access</dt><dd>${escapeHTML(item.accessStatus)}</dd></div>
            <div><dt>Current / primary geography</dt><dd>${escapeHTML(locationText(item))}</dd></div>
          </dl>
          <aside><b>Cross-reference context</b><p>${escapeHTML(item.summary||defaultSummary(item))}</p></aside>
        </section>
        <footer class="archive-reader-actions">
          <button id="archivePrevious" class="secondary-button" type="button" ${index===0?'disabled':''}>← Previous file</button>
          <button id="archiveSubject" class="secondary-button" type="button">Open ${escapeHTML(item.name)} dossier</button>
          <button id="archiveCopyLink" class="secondary-button" type="button">Copy archive link</button>
          <button id="archiveNext" class="primary-action" type="button" ${index>=archives.length-1?'disabled':''}>Next file →</button>
        </footer>`;
      $('#archivePrevious').addEventListener('click',()=>{completionState.archiveIndex-=1;renderArchiveDocument();writeArchiveHash();});
      $('#archiveNext').addEventListener('click',()=>{completionState.archiveIndex+=1;renderArchiveDocument();writeArchiveHash();});
      $('#archiveSubject').addEventListener('click',()=>{closeArchiveReader(false);openDossier(item,false);});
      $('#archiveCopyLink').addEventListener('click',copyArchiveLink);
    }

    function writeArchiveHash(){
      const item=completionState.archiveItem;
      if(item) history.replaceState(null,'',`${location.pathname}${location.search}#archive=${encodeURIComponent(`${item.slug}:${completionState.archiveIndex}`)}`);
    }

    async function copyArchiveLink(){
      const item=completionState.archiveItem;
      if(!item) return;
      const url=`${location.origin}${location.pathname}#archive=${encodeURIComponent(`${item.slug}:${completionState.archiveIndex}`)}`;
      try{
        await navigator.clipboard.writeText(url);
        toast('Archive link copied');
      }catch{
        toast('Copy unavailable in this browser');
      }
    }

    function openArchiveReader(item,index=0,writeHash=true){
      const archive=archiveFor(item,index);
      if(!archive) return;
      completionState.archiveItem=item;
      completionState.archiveIndex=index;
      state.lastFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
      renderArchiveDocument();
      openCompletionModal($('#archiveReaderModal'),'#closeArchiveReader');
      if(writeHash) writeArchiveHash();
    }

    function closeArchiveReader(restoreFocus=true){
      const item=completionState.archiveItem;
      completionState.archiveItem=null;
      closeCompletionModal($('#archiveReaderModal'),restoreFocus);
      if(item) history.replaceState(null,'',`${location.pathname}${location.search}#species=${encodeURIComponent(item.slug)}`);
    }

    $('#closeArchiveReader').addEventListener('click',()=>closeArchiveReader());
    $('#archiveReaderModal').addEventListener('click',event=>{if(event.target.id==='archiveReaderModal')closeArchiveReader();});

    function armArchiveCards(item){
      $$('.archive-list article',$('#dossierEditorial')).forEach((article,index)=>{
        article.classList.add('archive-document-launcher');
        article.setAttribute('role','button');
        article.setAttribute('tabindex','0');
        article.setAttribute('aria-label',`Open archive document ${article.querySelector('h4')?.textContent||index+1}`);
        const open=()=>openArchiveReader(item,index);
        article.addEventListener('click',open);
        article.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open();}});
      });
    }

    const completionBaseRenderEditorialDossier=renderEditorialDossier;
    renderEditorialDossier=function renderCompletionEditorialDossier(item){
      completionBaseRenderEditorialDossier(item);
      armArchiveCards(item);
    };

    function openArchiveFromHash(){
      const match=location.hash.slice(1).match(/^archive=([^&]+)/);
      if(!match) return;
      const decoded=decodeURIComponent(match[1]);
      const split=decoded.lastIndexOf(':');
      if(split<1) return;
      const slug=decoded.slice(0,split);
      const index=Number(decoded.slice(split+1));
      const item=findBySlug(slug);
      if(!item||!Number.isInteger(index)||!archiveFor(item,index)) return;
      setTimeout(()=>{
        if(!$('#dossier').classList.contains('open')||$('#dossierName').textContent!==item.name) openDossier(item,false);
        openArchiveReader(item,index,false);
      },260);
    }
    window.addEventListener('hashchange',openArchiveFromHash);
    setTimeout(openArchiveFromHash,900);

    function completionModalOpen(){
      return [$('#observationModal'),$('#archiveReaderModal')].find(modal=>modal?.classList.contains('open'));
    }

    document.addEventListener('keydown',event=>{
      const modal=completionModalOpen();
      if(!modal) return;
      if(event.key==='Escape'){
        event.preventDefault();
        event.stopImmediatePropagation();
        if(modal.id==='observationModal') closeObservationModal();
        else closeArchiveReader();
        return;
      }
      if(event.key!=='Tab') return;
      const focusable=$$('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',modal).filter(element=>!element.disabled&&element.offsetParent!==null);
      if(!focusable.length) return;
      const first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();event.stopImmediatePropagation();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();event.stopImmediatePropagation();first.focus();}
    },true);

    $('#searchInput').placeholder='Search GAIA records…';
    const launch=$('#regionalExplorerButton');
    if(launch){
      const small=$('small',launch);
      if(small) small.textContent=`${regions.length} field windows · live seasonal ecology`;
    }

    const footer=$('#app > footer');
    if(footer?.firstChild) footer.firstChild.nodeValue=`GAIA CIVILIAN ACCESS NETWORK · CANON 2026-07-27.1 · ECOLOGY 2026-07-28.2 · WORLD ${GAIA_WORLD_COMPLETION_VERSION} · ASSETS 2026-07-29.1 · RC ${window.GAIA_RC_VERSION||'2026-07-29.1'} · `;
    const buildMeta=$('.build-meta',$('#aboutModal'));
    if(buildMeta) buildMeta.textContent=`WORLD COMPLETION PASS I · CANON 2026-07-27.1 · ECOLOGY 2026-07-28.2 · WORLD ${GAIA_WORLD_COMPLETION_VERSION} · ASSETS 2026-07-29.1 · ASSURANCE ${window.GAIA_ASSURANCE_VERSION||'ACTIVE'} · ${species.length} SPECIES · ${regions.length} REGIONS · 27 FULL DOSSIERS`;

    renderLive();
    renderIndex();
    renderRecords();
    renderFieldLog();
    updateFieldMetrics();
    window.GAIA_WORLD_COMPLETION={
      version:GAIA_WORLD_COMPLETION_VERSION,
      policy:worldPolicy,
      regionCount:regions.length,
      observationRecords,
      openObservationModal,
      openArchiveReader
    };
  });
