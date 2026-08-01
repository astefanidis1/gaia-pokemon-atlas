/* GAIA World Completion reference corrections: preserve signed payload history while resolving invalid editorial slugs. */
  const GAIA_WORLD_REFERENCE_CORRECTION_VERSION='2026-08-01.2';
  const GAIA_WORLD_REFERENCE_CORRECTIONS={rotom:'electivire',squirtle:'lapras'};
  window.GAIA_WORLD_REFERENCE_CORRECTION_VERSION=GAIA_WORLD_REFERENCE_CORRECTION_VERSION;
  window.GAIA_WORLD_REFERENCE_CORRECTIONS={...GAIA_WORLD_REFERENCE_CORRECTIONS};

  function gaiaCorrectWorldReferenceText(value){
    if(typeof value!=='string')return value;
    return value
      .replaceAll('Rotom','Electivire').replaceAll('rotom','electivire')
      .replaceAll('Squirtle','Lapras').replaceAll('squirtle','lapras');
  }

  function gaiaCorrectWorldReferenceValue(value){
    if(Array.isArray(value))return value.map(gaiaCorrectWorldReferenceValue);
    if(value&&typeof value==='object'){
      return Object.fromEntries(Object.entries(value).map(([key,row])=>[
        gaiaCorrectWorldReferenceText(key),gaiaCorrectWorldReferenceValue(row)
      ]));
    }
    return gaiaCorrectWorldReferenceText(value);
  }

  const correctedRegionIds=new Set(['central-andes-cloud-forest-corridor','east-african-rift-highland-mosaic']);
  regions.forEach((region,index)=>{
    if(correctedRegionIds.has(region.id))regions[index]=gaiaCorrectWorldReferenceValue(region);
  });
  editorial.regions=regions;
  const correctedRelationships=(editorial.relationships||[]).map(row=>correctedRegionIds.has(row.regionId)?gaiaCorrectWorldReferenceValue(row):row);
  (editorial.relationships||[]).splice(0,(editorial.relationships||[]).length,...correctedRelationships);

  const correctedSpecies=new Set(Object.values(GAIA_WORLD_REFERENCE_CORRECTIONS));
  for(const region of regions.filter(row=>correctedRegionIds.has(row.id))){
    for(const entry of region.species||[]){
      if(correctedSpecies.has(entry.slug))entry.note=`${entry.note} Reference corrected under GAIA editorial correction ${GAIA_WORLD_REFERENCE_CORRECTION_VERSION}.`;
    }
  }

  document.documentElement.dataset.gaiaWorldReferenceCorrection=GAIA_WORLD_REFERENCE_CORRECTION_VERSION;
