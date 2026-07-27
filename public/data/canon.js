window.GAIA_DATA_READY=(async()=>{
  const parts=Array.from({length:7},(_,index)=>`data/canon/chunk-${String(index+1).padStart(2,'0')}.txt`);
  const [encodedParts,correctionsResponse]=await Promise.all([
    Promise.all(parts.map(async path=>{
      const response=await fetch(path,{cache:'no-cache'});
      if(!response.ok) throw new Error(`Unable to load GAIA canon payload: ${path}`);
      return (await response.text()).trim();
    })),
    fetch('data/canon-corrections.json',{cache:'no-cache'})
  ]);
  if(!correctionsResponse.ok) throw new Error('Unable to load GAIA canon corrections.');
  const encoded=encodedParts.join('');
  const bytes=Uint8Array.from(atob(encoded),character=>character.charCodeAt(0));
  const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  const data=JSON.parse(await new Response(stream).text());
  const corrections=await correctionsResponse.json();
  const speciesById=new Map(data.species.map(species=>[species.id,species]));
  for(const [speciesId,patch] of Object.entries(corrections.species||{})){
    const species=speciesById.get(speciesId);
    if(!species) throw new Error(`Canon correction references missing species: ${speciesId}`);
    Object.assign(species,patch);
  }
  data.correctionVersion=corrections.version;
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
