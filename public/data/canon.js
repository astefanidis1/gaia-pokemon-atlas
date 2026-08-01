(()=>{
  if(!document.querySelector('link[data-gaia-refinement]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='refinement.css';
    link.dataset.gaiaRefinement='true';
    document.head.appendChild(link);
  }
  if(!document.querySelector('link[data-gaia-ecology]')){
    const ecology=document.createElement('link');
    ecology.rel='stylesheet';
    ecology.href='ecology.css';
    ecology.dataset.gaiaEcology='true';
    document.head.appendChild(ecology);
  }
  if(!document.querySelector('link[data-gaia-density]')){
    const density=document.createElement('link');
    density.rel='stylesheet';
    density.href='density.css';
    density.dataset.gaiaDensity='true';
    document.head.appendChild(density);
  }
})();

window.GAIA_DATA_READY=(async()=>{
  const parts=Array.from({length:7},(_,index)=>`data/canon/chunk-${String(index+1).padStart(2,'0')}.txt`);
  const editorialParts=Array.from({length:4},(_,index)=>`data/editorial/chunk-${String(index+1).padStart(2,'0')}.txt`);
  const phase2Path='data/editorial/phase2.txt';
  const phase3Paths=['data/editorial/phase3-01.txt','data/editorial/phase3-02.txt'];
  const phase4Path='data/editorial/phase4.txt';
  const [encodedParts,correctionsResponse,editorialEncodedParts,phase2Response,phase3Responses,phase4Response]=await Promise.all([
    Promise.all(parts.map(async path=>{
      const response=await fetch(path,{cache:'no-cache'});
      if(!response.ok) throw new Error(`Unable to load GAIA canon payload: ${path}`);
      return (await response.text()).trim();
    })),
    fetch('data/canon-corrections.json',{cache:'no-cache'}),
    Promise.all(editorialParts.map(async path=>{
      const response=await fetch(path,{cache:'no-cache'});
      if(!response.ok) throw new Error(`Unable to load GAIA editorial payload: ${path}`);
      return (await response.text()).trim();
    })),
    fetch(phase2Path,{cache:'no-cache'}),
    Promise.all(phase3Paths.map(path=>fetch(path,{cache:'no-cache'}))),
    fetch(phase4Path,{cache:'no-cache'})
  ]);
  if(!correctionsResponse.ok) throw new Error('Unable to load GAIA canon corrections.');
  if(!phase2Response.ok) throw new Error('Unable to load GAIA world-density expansion.');
  if(phase3Responses.some(response=>!response.ok)) throw new Error('Unable to load GAIA ecology integration.');
  if(!phase4Response.ok) throw new Error('Unable to load GAIA World Completion Pass I.');
  const encoded=encodedParts.join('');
  const bytes=Uint8Array.from(atob(encoded),character=>character.charCodeAt(0));
  const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  const data=JSON.parse(await new Response(stream).text());
  const editorialBytes=Uint8Array.from(atob(editorialEncodedParts.join('')),character=>character.charCodeAt(0));
  const editorialStream=new Blob([editorialBytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  const editorial=JSON.parse(await new Response(editorialStream).text());
  const phase2Encoded=(await phase2Response.text()).trim();
  const phase2Bytes=Uint8Array.from(atob(phase2Encoded),character=>character.charCodeAt(0));
  const phase2Stream=new Blob([phase2Bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  const phase2=JSON.parse(await new Response(phase2Stream).text());
  if(phase2.baseVersion!==editorial.version) throw new Error(`GAIA editorial expansion base mismatch: ${phase2.baseVersion} !== ${editorial.version}`);
  editorial.flagshipOrder.push(...phase2.flagshipAdditions);
  Object.assign(editorial.dossiers,phase2.dossiers);
  editorial.regions.push(...phase2.regions);
  editorial.version=phase2.version;
  const phase3Encoded=(await Promise.all(phase3Responses.map(response=>response.text()))).map(text=>text.trim()).join('');
  const phase3Bytes=Uint8Array.from(atob(phase3Encoded),character=>character.charCodeAt(0));
  const phase3Stream=new Blob([phase3Bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  const phase3=JSON.parse(await new Response(phase3Stream).text());
  if(phase3.baseVersion!==editorial.version) throw new Error(`GAIA ecology integration base mismatch: ${phase3.baseVersion} !== ${editorial.version}`);
  editorial.flagshipOrder.push(...phase3.flagshipAdditions);
  Object.assign(editorial.dossiers,phase3.dossiers);
  const regionsById=new Map(editorial.regions.map(region=>[region.id,region]));
  for(const [regionId,patch] of Object.entries(phase3.regionPatches||{})){
    const region=regionsById.get(regionId);
    if(!region) throw new Error(`GAIA ecology patch references missing region: ${regionId}`);
    if(patch.speciesAdditions?.length) region.species.push(...patch.speciesAdditions);
    if(patch.geometry){
      region.geometry=region.geometry||{habitats:[],corridors:[]};
      region.geometry.habitats.push(...(patch.geometry.habitats||[]));
      region.geometry.corridors.push(...(patch.geometry.corridors||[]));
    }
    region.seasonalCycle=patch.seasonalCycle||[];
    region.geometrySeasonality=patch.geometrySeasonality||{};
  }
  editorial.relationships=[...(editorial.relationships||[]),...(phase3.relationships||[])];
  editorial.version=phase3.version;
  const phase4Encoded=(await phase4Response.text()).trim();
  const phase4Bytes=Uint8Array.from(atob(phase4Encoded),character=>character.charCodeAt(0));
  const phase4Stream=new Blob([phase4Bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  const phase4=JSON.parse(await new Response(phase4Stream).text());
  if(phase4.baseVersion!==editorial.version) throw new Error(`GAIA World Completion base mismatch: ${phase4.baseVersion} !== ${editorial.version}`);
  editorial.regions.push(...(phase4.regions||[]));
  editorial.relationships.push(...(phase4.relationships||[]));
  editorial.recordPolicy=phase4.recordPolicy||{};
  editorial.version=phase4.version;
  const corrections=await correctionsResponse.json();
  const speciesById=new Map(data.species.map(species=>[species.id,species]));
  for(const [speciesId,patch] of Object.entries(corrections.species||{})){
    const species=speciesById.get(speciesId);
    if(!species) throw new Error(`Canon correction references missing species: ${speciesId}`);
    Object.assign(species,patch);
  }
  data.correctionVersion=corrections.version;
  data.editorialVersion=editorial.version;
  data.worldCompletionVersion=phase4.version;
  window.GAIA_EDITORIAL=editorial;
  window.GAIA_SPECIES=data.species;
  window.GAIA_FORMS=data.forms;
  window.GAIA_POPULATIONS=data.populations;
  window.GAIA_LOCATIONS=data.locations;
  window.GAIA_ROUTES=data.routes;
  window.GAIA_INCIDENTS=data.incidents;
  return data;
})().catch(error=>{
  console.error(error);
  const loading=document.querySelector('#loading');
  if(loading){
    loading.innerHTML='<img src="assets/gaia-seal.svg" alt=""><strong>GAIA census link unavailable</strong><span>The public archive could not be verified. Reload to try again.</span>';
  }
  throw error;
});
