/* GAIA Systems reference corrections: align early drafting language with the signed 161-species census. */
  const GAIA_SYSTEM_REFERENCE_CORRECTION_VERSION='2026-08-01.2';
  const GAIA_REMOVED_SYSTEM_INCIDENT_REFERENCES=['gaia-i-2020-041'];
  window.GAIA_SYSTEM_REFERENCE_CORRECTION_VERSION=GAIA_SYSTEM_REFERENCE_CORRECTION_VERSION;

  const gaiaSystemReferenceMap={
    rotom:'electivire',Rotom:'Electivire',
    squirtle:'lapras',Squirtle:'Lapras',
    'pacific-northwest':'pacific-northwest-temperate-rainforest',
    'central-honshu':'central-honshu-urban-mountain-corridor'
  };

  function correctSystemText(value){
    if(typeof value!=='string')return value;
    let result=value;
    for(const [from,to] of Object.entries(gaiaSystemReferenceMap))result=result.replaceAll(from,to);
    return result;
  }

  function correctSystemValue(value){
    if(Array.isArray(value))return value.map(correctSystemValue);
    if(value&&typeof value==='object'){
      return Object.fromEntries(Object.entries(value).map(([key,row])=>[correctSystemText(key),correctSystemValue(row)]));
    }
    return correctSystemText(value);
  }

  function replaceArrayInPlace(array){
    array.splice(0,array.length,...array.map(correctSystemValue));
  }

  replaceArrayInPlace(gaiaWorldSystems);
  replaceArrayInPlace(gaiaEvidenceRecords);
  replaceArrayInPlace(gaiaLineagePilots);
  replaceArrayInPlace(gaiaSystemIncidents);

  const knownIncidentIds=new Set(incidents.map(row=>row.id));
  gaiaWorldSystems.forEach(system=>{
    system.incidents=(system.incidents||[]).filter(id=>knownIncidentIds.has(id));
  });

  const electricalSystem=gaiaWorldSystems.find(row=>row.id==='critical-infrastructure');
  if(electricalSystem){
    const standard=electricalSystem.documents.find(row=>row.code==='INFRA-ROT-6');
    if(standard)Object.assign(standard,{
      code:'INFRA-ELEC-6',
      title:'High-output electrical partnership and induction standard',
      summary:'Requires segmented control, grounded refuge areas, manual isolation, and bioenergetic induction monitoring wherever Electivire or comparable electrical partners operate.'
    });
  }

  const electricalEvidence=gaiaEvidenceRecords.find(row=>row.id==='ev-pnw-electivire-052');
  if(electricalEvidence)Object.assign(electricalEvidence,{
    title:'Substation induction-overload trace',
    source:'Utility event recorder, field bioenergetic array, and isolated control bus',
    classification:'Infrastructure forensic record',
    alt:'Electrical forensic plate showing an Electivire induction event propagating across isolated substation segments.',
    interpretation:'A repeating induction pattern showed that an injured Electivire sheltering beside restoration equipment unintentionally coupled into three control segments. Network segmentation slowed propagation, but grounded refuge design and manual isolation proved necessary.'
  });

  const electricalIncident=gaiaSystemIncidents.find(row=>row.id==='gaia-i-2024-052');
  if(electricalIncident)Object.assign(electricalIncident,{
    title:'Cascadia substation induction-overload event',
    classification:'Electrical infrastructure / wildlife shelter conflict',
    summary:'An injured Electivire entered a storm-restoration substation and produced cascading induction across three digital control segments without a conventional cyber intrusion.',
    outcome:'The organism was stabilized and released; utility operators adopted grounded refuge setbacks, non-networked shutdown paths, and bioenergetic event recording.'
  });

  const lineageIndex=gaiaLineagePilots.findIndex(row=>row.id==='lineage-lapras');
  if(lineageIndex>=0){
    gaiaLineagePilots[lineageIndex]={
      id:'lineage-gardevoir',title:'Ralts Cognitive Development Line',anchorSlug:'gardevoir',status:'SCHEMA PILOT · COGNITIVE STAGES UNDER REVIEW',environment:'Quiet woodland edge, protected community habitat, clinical learning environments, and adult social territory',
      summary:'A pilot for stage-specific population accounting in a lineage where cognition, emotional perception, social attachment, and habitat independence change substantially across development.',
      populationRule:'Ralts, Kirlia, and Gardevoir produce separate persistent signatures and must be counted independently. A lineage total may be published only after stage audits share a census date and custody transfers are reconciled without treating development as a temporary form.',
      evolution:'Development correlates with age, accumulated energy, cognitive maturity, emotional regulation, social stability, and sustained environmental safety. Evolution is permanent biological development rather than a reversible power state.',
      humanContext:'Child-safety, education, clinical consent, and custody standards must account for changing cognition. A juvenile capable of sensing emotion is not automatically capable of informed partnership or institutional work.',
      stages:[
        {name:'Ralts',role:'Highly sensitive juvenile cognitive stage',habitat:'Quiet understory, low-conflict household refuge, and protected community habitat',census:'Stage-specific census integration pending lineage expansion.'},
        {name:'Kirlia',role:'Mobile social-learning transition stage',habitat:'Woodland edge, structured learning environments, and stable social groups',census:'Stage-specific census integration pending lineage expansion.'},
        {name:'Gardevoir',role:'Independent adult psychic and social stage',habitat:'Broad community, woodland, clinical, and protected partnership settings',census:'Existing indexed adult-stage record remains unchanged.'}
      ],evidence:['ev-mewtwo-031'],systems:['clinical-network','registration-custody','habitat-coexistence-law']
    };
  }

  gaiaSystemIncidents.forEach(record=>{
    record.speciesIds=record.species.map(slug=>findBySlug(slug)?.id).filter(Boolean);
    const archiveIndex=incidents.findIndex(row=>row.id===record.id);
    if(archiveIndex>=0)incidents[archiveIndex]=record;
  });

  window.GAIA_INCIDENTS=incidents;
  window.GAIA_WORLD_SYSTEMS=gaiaWorldSystems;
  window.GAIA_EVIDENCE_RECORDS=gaiaEvidenceRecords;
  window.GAIA_LINEAGE_PILOTS=gaiaLineagePilots;
  window.GAIA_SYSTEM_INCIDENTS=gaiaSystemIncidents;
  window.GAIA_REMOVED_SYSTEM_INCIDENT_REFERENCES=[...GAIA_REMOVED_SYSTEM_INCIDENT_REFERENCES];
  window.GAIA_SYSTEM_REFERENCE_CORRECTIONS={
    rotom:'electivire',squirtle:'lapras',lineageSquirtle:'lineage-gardevoir',
    pacificNorthwest:'pacific-northwest-temperate-rainforest',centralHonshu:'central-honshu-urban-mountain-corridor'
  };
  document.documentElement.dataset.gaiaSystemReferenceCorrection=GAIA_SYSTEM_REFERENCE_CORRECTION_VERSION;
