/* GAIA experience assurance: accessibility state, contrast policy, and motion preference. */
  const GAIA_ASSURANCE_VERSION='2026-07-29.1';
  window.GAIA_ASSURANCE_VERSION=GAIA_ASSURANCE_VERSION;

  if(!document.querySelector('link[data-gaia-assurance]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='assurance.css';
    link.dataset.gaiaAssurance='true';
    document.head.appendChild(link);
  }

  document.addEventListener('load',event=>{
    const image=event.target;
    if(image instanceof HTMLImageElement && image.dataset.gaiaAssetFallback){
      image.dataset.assetState='archive';
    }
  },true);

  const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
  const syncMotionPreference=()=>{
    document.documentElement.classList.toggle('gaia-reduced-motion',motionQuery.matches);
    document.documentElement.dataset.motionPreference=motionQuery.matches?'reduce':'standard';
  };
  syncMotionPreference();
  motionQuery.addEventListener?.('change',syncMotionPreference);

  queueMicrotask(()=>{
    const search=$('#searchInput');
    if(search){
      search.setAttribute('role','combobox');
      search.setAttribute('aria-haspopup','listbox');
      search.setAttribute('aria-label','Search GAIA species, locations, habitats, and records');
    }

    const setInteractiveState=element=>{
      if(!element) return;
      const active=element.getAttribute('aria-hidden')==='false';
      element.toggleAttribute('inert',!active);
      try{element.inert=!active;}catch{}
    };

    const managed=[$('#dossier'),$('#aboutModal'),$('#methodModal'),$('#regionModal'),$('#regionExplorerModal')].filter(Boolean);
    managed.forEach(setInteractiveState);
    const stateObserver=new MutationObserver(mutations=>{
      for(const mutation of mutations){
        if(mutation.type==='attributes' && mutation.attributeName==='aria-hidden') setInteractiveState(mutation.target);
      }
    });
    managed.forEach(element=>stateObserver.observe(element,{attributes:true,attributeFilter:['aria-hidden']}));

    const footer=$('footer');
    if(footer?.firstChild){
      footer.firstChild.nodeValue='GAIA CIVILIAN ACCESS NETWORK · CANON 2026-07-27.1 · ECOLOGY 2026-07-28.2 · ASSETS 2026-07-29.1 · ';
    }
    const buildMeta=$('.build-meta',$('#aboutModal'));
    if(buildMeta) buildMeta.textContent=`CIVILIAN BUILD · CANON 2026-07-27.1 · ECOLOGY 2026-07-28.2 · ASSETS 2026-07-29.1 · ASSURANCE ${GAIA_ASSURANCE_VERSION} · 161 SPECIES · 27 FULL DOSSIERS`;
  });
