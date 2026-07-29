/* GAIA visual-asset policy: centralized sources and authored archive reconstructions. */
  const GAIA_ASSET_MANIFEST = Object.freeze({
    version:'2026-07-29.1',
    remoteTemplate:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{dex}.png',
    sourceLabel:'Official artwork network',
    retryDelayMs:12000,
    fallbackDelayMs:2400,
    profiles:Object.freeze({
      field:{label:'Natural-history reconstruction',accent:'#8ec99a',secondary:'#8de9f5'},
      marine:{label:'Bathymetric reconstruction',accent:'#70cfe8',secondary:'#d9bd78'},
      tracked:{label:'Active-track reconstruction',accent:'#8de9f5',secondary:'#d9bd78'},
      mythic:{label:'Mythic archive reconstruction',accent:'#d9bd78',secondary:'#eaf1ee'},
      anomaly:{label:'Anomaly-spectrum reconstruction',accent:'#b696ff',secondary:'#8de9f5'},
      artificial:{label:'Institutional specimen reconstruction',accent:'#9ccbd6',secondary:'#e66f65'},
      sealed:{label:'Civilian redacted silhouette',accent:'#e66f65',secondary:'#d9bd78'}
    })
  });
  window.GAIA_ASSET_MANIFEST=GAIA_ASSET_MANIFEST;

  if(!document.querySelector('link[data-gaia-assets]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='assets.css';
    link.dataset.gaiaAssets='true';
    document.head.appendChild(link);
  }

  function gaiaAssetProfile(item){
    const realm=item?.location?.realm || '';
    const searchable=`${item?.name || ''} ${item?.category || ''} ${item?.origin || ''} ${item?.habitat || ''} ${item?.group || ''}`.toLowerCase();
    if(['Restricted','Sealed'].includes(item?.accessStatus)) return 'sealed';
    if(item?.category==='Ultra Beast' || ['Dimension','Deep Space','Solar System'].includes(realm)) return 'anomaly';
    if(/artificial|laboratory|clone|engineered|synthetic|program|machine|weapon|fossil restoration/.test(searchable)) return 'artificial';
    if(item?.route) return 'tracked';
    if(['Legendary','Mythical'].includes(item?.category)) return 'mythic';
    if(/ocean|marine|reef|sea|river|lake|wetland|coast|pelagic|bathypelagic|freshwater/.test(searchable)) return 'marine';
    return 'field';
  }

  function gaiaAssetSource(item){
    const dex=Number(item?.dex);
    if(!Number.isInteger(dex) || dex < 1) return item?.image || '';
    return GAIA_ASSET_MANIFEST.remoteTemplate.replace('{dex}',String(dex));
  }

  species.forEach(item=>{
    item.legacyImage=item.image;
    item.assetProfile=gaiaAssetProfile(item);
    item.image=gaiaAssetSource(item);
  });

  function seeded(seed){
    let value=(Number(seed)||1)>>>0;
    return ()=>{
      value+=0x6D2B79F5;
      let t=value;
      t=Math.imul(t^(t>>>15),t|1);
      t^=t+Math.imul(t^(t>>>7),t|61);
      return ((t^(t>>>14))>>>0)/4294967296;
    };
  }

  function silhouettePath(item){
    const random=seeded(item?.dex || item?.name?.length || 1);
    const points=[];
    const count=18;
    for(let index=0;index<count;index++){
      const angle=-Math.PI/2+(Math.PI*2*index/count);
      const radius=58+random()*31+(index%3===0?10:0);
      const x=160+Math.cos(angle)*radius;
      const y=142+Math.sin(angle)*radius*(.78+random()*.22);
      points.push(`${index?'L':'M'}${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return `${points.join(' ')} Z`;
  }

  function profileMotif(profile,accent,secondary,seedValue){
    const random=seeded(seedValue+77);
    if(profile==='sealed') return `<g opacity=".82"><rect x="42" y="82" width="236" height="18" fill="#050a10"/><rect x="64" y="178" width="198" height="15" fill="#050a10"/><path d="M48 62h224M48 214h224" stroke="${accent}" stroke-width="2" stroke-dasharray="7 6"/></g>`;
    if(profile==='anomaly') return `<g fill="none" stroke="${accent}" opacity=".52"><ellipse cx="160" cy="142" rx="116" ry="48" transform="rotate(-21 160 142)"/><ellipse cx="160" cy="142" rx="91" ry="121" transform="rotate(31 160 142)"/><path d="M39 142h242M160 25v234" stroke-dasharray="3 8"/></g>`;
    if(profile==='tracked') return `<g fill="none" stroke="${accent}" opacity=".58"><circle cx="160" cy="142" r="111"/><circle cx="160" cy="142" r="75" stroke-dasharray="4 7"/><path d="M160 31v222M49 142h222M160 142l84-58"/></g>`;
    if(profile==='mythic'){
      const dots=Array.from({length:14},()=>({x:54+random()*212,y:43+random()*182}));
      return `<g stroke="${secondary}" stroke-opacity=".28" fill="${accent}">${dots.slice(1).map((dot,index)=>`<path d="M${dots[index].x.toFixed(1)} ${dots[index].y.toFixed(1)}L${dot.x.toFixed(1)} ${dot.y.toFixed(1)}"/>`).join('')}${dots.map(dot=>`<circle cx="${dot.x.toFixed(1)}" cy="${dot.y.toFixed(1)}" r="2.3"/>`).join('')}</g>`;
    }
    if(profile==='artificial') return `<g fill="none" stroke="${accent}" opacity=".35"><path d="M46 62h228v160H46zM46 94h228M46 126h228M46 158h228M46 190h228M84 62v160M122 62v160M160 62v160M198 62v160M236 62v160"/><circle cx="160" cy="142" r="91" stroke="${secondary}" stroke-dasharray="10 5"/></g>`;
    if(profile==='marine') return `<g fill="none" stroke="${accent}" opacity=".4"><path d="M36 82c42-27 72 27 116 0s76 27 132 0M36 117c42-27 72 27 116 0s76 27 132 0M36 152c42-27 72 27 116 0s76 27 132 0M36 187c42-27 72 27 116 0s76 27 132 0"/><ellipse cx="160" cy="142" rx="110" ry="78" stroke="${secondary}" stroke-dasharray="5 8"/></g>`;
    return `<g fill="none" stroke="${accent}" opacity=".36"><path d="M38 82c44-31 80 18 123-6s76 22 121-4M31 116c38-25 72 15 112-5s84 20 146-6M34 153c44-22 72 16 117-7s79 18 137-1M42 188c44-17 70 13 109-4s77 15 124 0"/><circle cx="160" cy="142" r="104" stroke="${secondary}" stroke-dasharray="4 9"/></g>`;
  }

  function gaiaArchiveArtwork(item){
    const profile=item?.assetProfile || gaiaAssetProfile(item);
    const palette=GAIA_ASSET_MANIFEST.profiles[profile] || GAIA_ASSET_MANIFEST.profiles.field;
    const name=escapeHTML(String(item?.name || 'UNKNOWN SUBJECT').toUpperCase());
    const category=escapeHTML(String(item?.category || 'UNCLASSIFIED').toUpperCase());
    const dex=String(item?.dex || 0).padStart(4,'0');
    const path=silhouettePath(item);
    const motif=profileMotif(profile,palette.accent,palette.secondary,Number(item?.dex)||1);
    const status=profile==='sealed'?'PUBLIC IMAGE WITHHELD':'PRIMARY IMAGE SIGNAL LOST';
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" role="img" aria-label="${name} GAIA archive reconstruction"><defs><radialGradient id="bg"><stop stop-color="${palette.accent}" stop-opacity=".18"/><stop offset="1" stop-color="#050a10" stop-opacity="0"/></radialGradient><filter id="grain"><feTurbulence baseFrequency=".8" numOctaves="2" seed="${Number(item?.dex)||1}" result="n"/><feColorMatrix in="n" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 .08 0"/></filter></defs><rect width="320" height="320" fill="#061019"/><circle cx="160" cy="142" r="142" fill="url(#bg)"/>${motif}<path d="${path}" fill="#071019" stroke="${palette.accent}" stroke-width="2.2" stroke-opacity=".88"/><path d="${path}" fill="none" stroke="${palette.secondary}" stroke-width="8" stroke-opacity=".07"/><rect x="25" y="238" width="270" height="57" rx="8" fill="#050a10" fill-opacity=".88" stroke="${palette.accent}" stroke-opacity=".4"/><text x="40" y="257" font-family="Arial,sans-serif" font-size="8" letter-spacing="1.7" fill="${palette.accent}">${status}</text><text x="40" y="275" font-family="Georgia,serif" font-size="16" fill="#eaf1ee">${name}</text><text x="40" y="288" font-family="Arial,sans-serif" font-size="7" letter-spacing="1.2" fill="#91a3aa">INDEX ${dex} · ${category} · ${profile.toUpperCase()}</text><rect width="320" height="320" filter="url(#grain)" opacity=".55"/></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  function applyGaiaAssetFallback(image){
    if(!(image instanceof HTMLImageElement) || image.dataset.gaiaAssetFallback) return;
    const item=findBySlug(image.dataset.speciesSlug) || species.find(entry=>entry.name===image.alt);
    if(!item) return;
    const original=image.dataset.originalSrc || image.currentSrc || image.src || item.image;
    image.dataset.originalSrc=original;
    image.dataset.gaiaAssetFallback='1';
    image.dataset.fallbackApplied='1';
    image.dataset.assetProfile=item.assetProfile;
    image.dataset.assetState='archive';
    image.classList.add('archive-fallback','gaia-authored-fallback');
    image.parentElement?.classList.add('fallback-art',`asset-${item.assetProfile}`);
    image.src=gaiaArchiveArtwork(item);
    setTimeout(()=>{
      if(!navigator.onLine || image.dataset.originalRestored) return;
      const retry=new Image();
      retry.onload=()=>{
        image.dataset.originalRestored='1';
        image.dataset.assetState='remote';
        image.src=original;
        image.classList.remove('archive-fallback','gaia-authored-fallback');
        image.parentElement?.classList.remove('fallback-art',`asset-${item.assetProfile}`);
      };
      retry.src=original;
    },GAIA_ASSET_MANIFEST.retryDelayMs);
  }

  function armGaiaAsset(image){
    if(!(image instanceof HTMLImageElement) || !image.dataset.speciesSlug || image.dataset.gaiaAssetArmed) return;
    const item=findBySlug(image.dataset.speciesSlug);
    if(item){image.dataset.assetProfile=item.assetProfile;image.dataset.assetVersion=GAIA_ASSET_MANIFEST.version;}
    image.dataset.gaiaAssetArmed='1';
    image.dataset.originalSrc=image.currentSrc || image.src;
    const timer=setTimeout(()=>{
      if(!image.complete || image.naturalWidth===0) applyGaiaAssetFallback(image);
    },GAIA_ASSET_MANIFEST.fallbackDelayMs);
    image.addEventListener('load',()=>{clearTimeout(timer);image.dataset.assetState='remote';},{once:true});
    image.addEventListener('error',()=>{clearTimeout(timer);applyGaiaAssetFallback(image);},{once:true});
  }

  document.addEventListener('error',event=>applyGaiaAssetFallback(event.target),true);
  const gaiaAssetObserver=new MutationObserver(mutations=>{
    for(const mutation of mutations) for(const node of mutation.addedNodes){
      if(!(node instanceof Element)) continue;
      if(node.matches?.('img[data-species-slug]')) armGaiaAsset(node);
      node.querySelectorAll?.('img[data-species-slug]').forEach(armGaiaAsset);
    }
  });
  gaiaAssetObserver.observe(document.documentElement,{childList:true,subtree:true});

  window.GAIA_ASSET_POLICY=Object.freeze({
    manifest:GAIA_ASSET_MANIFEST,
    profileFor:gaiaAssetProfile,
    sourceFor:gaiaAssetSource,
    fallbackFor:gaiaArchiveArtwork,
    arm:armGaiaAsset
  });

  queueMicrotask(()=>{
    document.querySelectorAll('img[data-species-slug]').forEach(armGaiaAsset);
    const aboutCard=$('.modal-card',$('#aboutModal'));
    const legal=$('.legal',aboutCard);
    if(aboutCard && legal && !$('.asset-policy-brief',aboutCard)){
      legal.insertAdjacentHTML('beforebegin',`<section class="asset-policy-brief"><span class="eyebrow">VISUAL EVIDENCE POLICY</span><h3>Artwork is presentation, not canon.</h3><p>GAIA resolves subject art through one replaceable source policy. If the source is unavailable—or civilian imagery is restricted—the interface generates a classification-specific archive reconstruction rather than displaying a generic broken image.</p><small>ASSET POLICY ${GAIA_ASSET_MANIFEST.version} · ${Object.keys(GAIA_ASSET_MANIFEST.profiles).length} AUTHORED FALLBACK PROFILES</small></section>`);
    }
    const baseOpenDossier=openDossier;
    openDossier=function openDossierWithAssetStatus(item,move=true){
      baseOpenDossier(item,move);
      const visual=$('.dossier-visual');
      let note=$('.asset-source-note',visual);
      if(!note){note=document.createElement('small');note.className='asset-source-note';visual.appendChild(note);}
      note.textContent=`VISUAL CHANNEL · ${GAIA_ASSET_MANIFEST.sourceLabel.toUpperCase()} · ${String(item.assetProfile || 'field').toUpperCase()} PROFILE`;
    };
  });
