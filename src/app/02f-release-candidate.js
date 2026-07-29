/* GAIA Release Candidate 1: first-visit priority briefing and production-state cues. */
  const GAIA_RC_VERSION='2026-07-29.1';
  window.GAIA_RC_VERSION=GAIA_RC_VERSION;

  if(!document.querySelector('link[data-gaia-rc]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='release-candidate.css';
    link.dataset.gaiaRc='true';
    document.head.appendChild(link);
  }

  const rcStorageKey='gaia-rc1-priority-brief-dismissed';
  const rcStorage={
    get(){try{return localStorage.getItem(rcStorageKey);}catch{return null;}},
    set(){try{localStorage.setItem(rcStorageKey,'1');}catch{}},
    clear(){try{localStorage.removeItem(rcStorageKey);}catch{}}
  };
  const utcDayIndex=()=>Math.floor(Date.now()/86400000);

  function rcSelection(){
    const tracked=species.filter(item=>item.route).sort((a,b)=>a.dex-b.dex);
    const availableRegions=[...regions].sort((a,b)=>a.name.localeCompare(b.name));
    return {
      tracked:tracked.length?tracked[utcDayIndex()%tracked.length]:null,
      region:availableRegions.length?availableRegions[(utcDayIndex()+1)%availableRegions.length]:null
    };
  }

  function rcTrackedSummary(item){
    if(!item) return {phase:'NO ACTIVE TRACK',position:'Surveillance network awaiting route data'};
    const position=livePosition(item);
    return {phase:routePhase(item),position:`${position.currentLabel} → ${position.nextLabel}`};
  }

  function rcOpenTrack(item){
    if(!item) return;
    setView('globe');
    openDossier(item,true);
  }

  function rcOpenRegion(region){
    if(region) openRegion(region.id);
  }

  function rcOpenShortcutHash(){
    const match=location.hash.slice(1).match(/^view=(globe|live|index|records|fieldlog)$/);
    if(match) setView(match[1]);
  }

  function rcCompactLauncher(panel,selection){
    if($('#rcBriefRestore',panel)) return;
    const button=document.createElement('button');
    button.id='rcBriefRestore';
    button.className='rc-brief-restore';
    button.type='button';
    button.innerHTML='<span><b>Priority world brief</b><small>Current track and regional ecology</small></span><i>Open →</i>';
    button.addEventListener('click',()=>{
      rcStorage.clear();
      button.remove();
      rcRenderBrief(panel,selection,true);
    });
    panel.insertBefore(button,$('#featuredRegionButton',panel));
  }

  function rcRenderBrief(panel,selection,force=false){
    if(!panel || $('#rcPriorityBrief',panel)) return;
    if(!force && rcStorage.get()==='1'){
      document.documentElement.dataset.gaiaVisit='returning';
      rcCompactLauncher(panel,selection);
      return;
    }

    document.documentElement.dataset.gaiaVisit='first';
    const item=selection.tracked;
    const region=selection.region;
    const track=rcTrackedSummary(item);
    const brief=document.createElement('section');
    brief.id='rcPriorityBrief';
    brief.className='rc-priority-brief';
    brief.setAttribute('aria-label','GAIA priority world brief');
    brief.innerHTML=`
      <header><span>PRIORITY WORLD BRIEF</span><button type="button" aria-label="Dismiss priority brief">×</button></header>
      <p>A synchronized entry point into the living world—one current movement record and one functioning regional ecosystem.</p>
      <div class="rc-priority-grid">
        ${item?`<button type="button" class="rc-priority-track"><img src="${escapeHTML(item.image)}" alt="" data-species-slug="${escapeHTML(item.slug)}"><span><small>${escapeHTML(track.phase)}</small><b>${escapeHTML(item.name)}</b><em>${escapeHTML(track.position)}</em></span><i>Open live record →</i></button>`:''}
        ${region?`<button type="button" class="rc-priority-region"><span><small>REGIONAL ECOLOGY</small><b>${escapeHTML(region.name)}</b><em>${region.species.length} presences · ${region.geometry?.habitats?.length||0} habitats · ${region.geometry?.corridors?.length||0} corridors</em></span><i>Enter field window →</i></button>`:''}
      </div>
      <footer>WORLD STATE SYNCHRONIZED · ${escapeHTML(currentUTCLabel())} UTC</footer>`;
    panel.insertBefore(brief,$('#mapStatus',panel));
    $('.rc-priority-track',brief)?.addEventListener('click',()=>rcOpenTrack(item));
    $('.rc-priority-region',brief)?.addEventListener('click',()=>rcOpenRegion(region));
    $('header button',brief)?.addEventListener('click',()=>{
      rcStorage.set();
      brief.remove();
      document.documentElement.dataset.gaiaVisit='returning';
      rcCompactLauncher(panel,selection);
    });
  }

  function rcSyncNetworkState(){
    const signal=$('.signal');
    if(!signal) return;
    signal.classList.toggle('offline',!navigator.onLine);
    signal.innerHTML=navigator.onLine?'<i></i> NETWORK ACTIVE':'<i></i> OFFLINE ARCHIVE';
    signal.setAttribute('aria-label',navigator.onLine?'GAIA network active':'GAIA offline archive active');
    document.documentElement.dataset.networkState=navigator.onLine?'online':'offline';
  }

  queueMicrotask(()=>{
    const panel=$('.atlas-panel');
    rcRenderBrief(panel,rcSelection());
    rcSyncNetworkState();
    rcOpenShortcutHash();
    addEventListener('online',rcSyncNetworkState);
    addEventListener('offline',rcSyncNetworkState);
    addEventListener('hashchange',rcOpenShortcutHash);

    document.title='GAIA Atlas — The world is inhabited.';
    document.documentElement.dataset.gaiaRelease='rc1';
    const footer=$('footer');
    if(footer?.firstChild) footer.firstChild.nodeValue=`GAIA CIVILIAN ACCESS NETWORK · CANON 2026-07-27.1 · ECOLOGY 2026-07-28.2 · ASSETS 2026-07-29.1 · RC ${GAIA_RC_VERSION} · `;
    const buildMeta=$('.build-meta',$('#aboutModal'));
    if(buildMeta) buildMeta.textContent=`RELEASE CANDIDATE 1 · CANON 2026-07-27.1 · ECOLOGY 2026-07-28.2 · ASSETS 2026-07-29.1 · ASSURANCE ${window.GAIA_ASSURANCE_VERSION||'ACTIVE'} · RC ${GAIA_RC_VERSION} · 161 SPECIES · 27 FULL DOSSIERS`;
  });
