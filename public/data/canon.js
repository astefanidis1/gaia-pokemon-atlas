(()=>{
  if(!document.querySelector('link[data-gaia-refinement]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='refinement.css';
    link.dataset.gaiaRefinement='true';
    document.head.appendChild(link);
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
  const [encodedParts,correctionsResponse,editorialEncodedParts,phase2Response]=await Promise.all([
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
    fetch(phase2Path,{cache:'no-cache'})
  ]);
  if(!correctionsResponse.ok) throw new Error('Unable to load GAIA canon corrections.');
  if(!phase2Response.ok) throw new Error('Unable to load GAIA world-density expansion.');
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
  const corrections=await correctionsResponse.json();
  const speciesById=new Map(data.species.map(species=>[species.id,species]));
  for(const [speciesId,patch] of Object.entries(corrections.species||{})){
    const species=speciesById.get(speciesId);
    if(!species) throw new Error(`Canon correction references missing species: ${speciesId}`);
    Object.assign(species,patch);
  }
  data.correctionVersion=corrections.version;
  data.editorialVersion=editorial.version;
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
