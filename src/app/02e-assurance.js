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

    const setInteractiveState=(element,active)=>{
      if(!element) return;
      element.toggleAttribute('inert',!active);
      try{element.inert=!active;}catch{}
    };

    const dossier=$('#dossier');
    const about=$('#aboutModal');
    const method=$('#methodModal');
    const region=$('#regionModal');
    const explorer=$('#regionExplorerModal');
    [dossier,about,method,region,explorer].forEach(element=>setInteractiveState(element,element?.getAttribute('aria-hidden')==='false'));

    const baseOpenDossier=openDossier;
    openDossier=function openAccessibleDossier(item,move=true){
      setInteractiveState(dossier,true);
      return baseOpenDossier(item,move);
    };
    const baseCloseDossier=closeDossier;
    closeDossier=function closeAccessibleDossier(){
      const result=baseCloseDossier();
      setInteractiveState(dossier,false);
      return result;
    };

    const baseOpenAbout=openAbout;
    openAbout=function openAccessibleAbout(){setInteractiveState(about,true);return baseOpenAbout();};
    const baseCloseAbout=closeAbout;
    closeAbout=function closeAccessibleAbout(){const result=baseCloseAbout();setInteractiveState(about,false);return result;};

    const baseOpenMethod=openMethod;
    openMethod=function openAccessibleMethod(){setInteractiveState(method,true);return baseOpenMethod();};
    const baseCloseMethod=closeMethod;
    closeMethod=function closeAccessibleMethod(){const result=baseCloseMethod();setInteractiveState(method,false);return result;};

    const baseOpenRegion=openRegion;
    openRegion=function openAccessibleRegion(id){setInteractiveState(region,true);return baseOpenRegion(id);};
    const baseCloseRegion=closeRegion;
    closeRegion=function closeAccessibleRegion(restoreFocus=true){const result=baseCloseRegion(restoreFocus);setInteractiveState(region,false);return result;};

    if(typeof openRegionExplorer==='function' && typeof closeRegionExplorer==='function'){
      const baseOpenExplorer=openRegionExplorer;
      openRegionExplorer=function openAccessibleExplorer(){setInteractiveState(explorer,true);return baseOpenExplorer();};
      const baseCloseExplorer=closeRegionExplorer;
      closeRegionExplorer=function closeAccessibleExplorer(restore=true){const result=baseCloseExplorer(restore);setInteractiveState(explorer,false);return result;};
    }

    const footer=$('footer');
    if(footer?.firstChild){
      footer.firstChild.nodeValue='GAIA CIVILIAN ACCESS NETWORK · CANON 2026-07-27.1 · ECOLOGY 2026-07-28.2 · ASSETS 2026-07-29.1 · ';
    }
    const buildMeta=$('.build-meta',$('#aboutModal'));
    if(buildMeta) buildMeta.textContent=`CIVILIAN BUILD · CANON 2026-07-27.1 · ECOLOGY 2026-07-28.2 · ASSETS 2026-07-29.1 · ASSURANCE ${GAIA_ASSURANCE_VERSION} · 161 SPECIES · 27 FULL DOSSIERS`;
  });
