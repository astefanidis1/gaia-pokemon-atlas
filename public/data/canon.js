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
  const phase4Groups=[
    ['data/editorial/phase4.txt','data/editorial/phase4-02.txt','data/editorial/phase4-03.txt'],
    ['data/editorial/phase4-04.txt','data/editorial/phase4-05.txt','data/editorial/phase4-06.txt']
  ];
  const phase4Paths=phase4Groups.flat();

  async function fetchText(path,label){
    const response=await fetch(path,{cache:'no-cache'});
    if(!response.ok) throw new Error(`Unable to load ${label}: ${path}`);
    return (await response.text()).trim();
  }

  async function decodeGzipJSON(encoded){
    const bytes=Uint8Array.from(atob(encoded),character=>character.charCodeAt(0));
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return JSON.parse(await new Response(stream).text());
  }

  const [encodedParts,correctionsResponse,editorialEncodedParts,phase2Encoded,phase3EncodedParts,phase4EncodedParts]=await Promise.all([
    Promise.all(parts.map(path=>fetchText(path,'GAIA canon payload'))),
    fetch('data/canon-corrections.json',{cache:'no-cache'}),
    Promise.all(editorialParts.map(path=>fetchText(path,'GAIA editorial payload'))),
    fetchText(phase2Path,'GAIA world-density expansion'),
    Promise.all(phase3Paths.map(path=>fetchText(path,'GAIA ecology integration'))),
    Promise.all(phase4Paths.map(path=>fetchText(path,'GAIA World Completion Pass I'))
  ]);
  if(!correctionsResponse.ok) throw new Error('Unable to load GAIA canon corrections.');

  const data=await decodeGzipJSON(encodedParts.join(''));
  const editorial=await decodeGzipJSON(editorialEncodedParts.join(''));
  const phase2=await decodeGzipJSON(phase2Encoded);
  if(phase2.baseVersion!==editorial.version) throw new Error(`GAIA editorial expansion base mismatch: ${phase2.baseVersion} !== ${editorial.version}`);
  editorial.flagshipOrder.push(...phase2.flagshipAdditions);
  Object.assign(editorial.dossiers,phase2.dossiers);
  editorial.regions.push(...phase2.regions);
  editorial.version=phase2.version;

  const phase3=await decodeGzipJSON(phase3EncodedParts.join(''));
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

  const phase4Payloads=[];
  let cursor=0;
  for(const group of phase4Groups){
    const segmentCount=group.length;
    phase4Payloads.push(await decodeGzipJSON(phase4EncodedParts.slice(cursor,cursor+segmentCount).join('')));
    cursor+=segmentCount;
  }
  for(const payload of phase4Payloads){
    if(payload.baseVersion!==editorial.version) throw new Error(`GAIA World Completion base mismatch: ${payload.baseVersion} !== ${editorial.version}`);
    if(payload.version!==phase4Payloads[0].version) throw new Error(`GAIA World Completion semantic payload mismatch: ${payload.version} !== ${phase4Payloads[0].version}`);
  }
  const phase4={
    baseVersion:phase4Payloads[0].baseVersion,
    version:phase4Payloads[0].version,
    recordPolicy:phase4Payloads.find(payload=>payload.recordPolicy)?.recordPolicy||{},
    regions:phase4Payloads.flatMap(payload=>payload.regions||[]),
    relationships:phase4Payloads.flatMap(payload=>payload.relationships||[])
  };
  editorial.regions.push(...phase4.regions);
  editorial.relationships.push(...phase4.relationships);
  editorial.recordPolicy=phase4.recordPolicy;
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
