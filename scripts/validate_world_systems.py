#!/usr/bin/env python3
"""Validate GAIA World Systems & Evidence Pass I and its canon boundary."""
from __future__ import annotations
import re
from pathlib import Path
from phase3_validation_data import load_inputs
import validate_gaia
from validate_phase4 import load_phase4, phase3_regions
ROOT=Path(__file__).resolve().parents[1];MODULE=ROOT/'src'/'app'/'02h-systems-evidence.js';CORRECTIONS=ROOT/'src'/'app'/'02i-systems-reference-corrections.js';CSS=ROOT/'public'/'systems-evidence.css';VERSION='2026-08-01.2'
REFERENCE_MAP={'rotom':'electivire','squirtle':'lapras','pacific-northwest':'pacific-northwest-temperate-rainforest','central-honshu':'central-honshu-urban-mountain-corridor'};errors=[]
def require(condition,message):
    if not condition:errors.append(message)
def segment(source,start,end):
    try:return source.split(start,1)[1].split(end,1)[0]
    except IndexError:errors.append(f'Unable to isolate source segment: {start} → {end}');return ''
def array_values(source,key):
    values=[]
    for body in re.findall(rf'\b{re.escape(key)}:\[(.*?)\]',source,re.S):values.extend(re.findall(r"'([^']+)'",body))
    return values
def corrected(value):return REFERENCE_MAP.get(value,value)
def main():
    source=MODULE.read_text(encoding='utf-8');correction_source=CORRECTIONS.read_text(encoding='utf-8');css=CSS.read_text(encoding='utf-8');canon,base,phase2,phase3=load_inputs();full_canon=validate_gaia.data;phase4=load_phase4()
    system_source=segment(source,'const gaiaWorldSystems=[','const gaiaEvidenceRecords=[');evidence_source=segment(source,'const gaiaEvidenceRecords=[','const gaiaLineagePilots=[');lineage_source=segment(source,'const gaiaLineagePilots=[','const gaiaSystemIncidentDrafts=[');incident_source=segment(source,'const gaiaSystemIncidentDrafts=[','const gaiaSystemIncidents=')
    system_ids=re.findall(r"\bid:'([^']+)'",system_source);evidence_ids=re.findall(r"\bid:'([^']+)'",evidence_source);lineage_ids=re.findall(r"\bid:'([^']+)'",lineage_source);incident_ids=re.findall(r"\bid:'([^']+)'",incident_source)
    require(f"GAIA_WORLD_SYSTEMS_VERSION='{VERSION}'" in source,'World Systems version marker is missing');require(f"GAIA_SYSTEM_REFERENCE_CORRECTION_VERSION='{VERSION}'" in correction_source,'Systems reference correction version is missing')
    for old,new in REFERENCE_MAP.items():require(f"{old}:'{new}'" in correction_source or f"'{old}':'{new}'" in correction_source,f'Systems correction is missing {old} → {new}')
    require('lineage-gardevoir' in correction_source and "anchorSlug:'gardevoir'" in correction_source,'Corrected Gardevoir lineage pilot is missing')
    require(len(system_ids)==8 and len(set(system_ids))==8,f'Expected 8 unique world systems, found {len(system_ids)}');require(len(evidence_ids)==9 and len(set(evidence_ids))==9,f'Expected 9 unique evidence records, found {len(evidence_ids)}');require(len(lineage_ids)==3 and len(set(lineage_ids))==3,f'Expected 3 unique lineage pilots, found {len(lineage_ids)}');require(len(incident_ids)==8 and len(set(incident_ids))==8,f'Expected 8 unique system investigations, found {len(incident_ids)}')
    canon_slugs={row['slug'] for row in canon.get('species',[])};species_refs=set(array_values(system_source,'species')+array_values(evidence_source,'species')+array_values(incident_source,'species'));species_refs.update(re.findall(r"anchorSlug:'([^']+)'",lineage_source));effective_species={corrected(slug) for slug in species_refs if slug!='squirtle'}|{'gardevoir'};missing_species=sorted(effective_species-canon_slugs);require(not missing_species,f'Effective World Systems references species outside the signed 161-species canon: {missing_species}')
    existing_regions=phase3_regions(base,phase2,phase3)+phase4.get('regions',[]);region_ids={row['id'] for row in existing_regions};region_refs=set(array_values(system_source,'regions'));region_refs.update(value for value in re.findall(r"regionId:(?:'([^']*)'|null)",evidence_source) if value);effective_regions={corrected(region_id) for region_id in region_refs};missing_regions=sorted(effective_regions-region_ids);require(not missing_regions,f'Effective World Systems references unknown regions: {missing_regions}')
    system_refs=set(array_values(evidence_source,'systemIds')+array_values(incident_source,'systemIds')+array_values(lineage_source,'systems'));require(not sorted(system_refs-set(system_ids)),f'Unknown system cross-references: {sorted(system_refs-set(system_ids))}')
    evidence_refs=set(array_values(incident_source,'evidenceIds')+array_values(lineage_source,'evidence'));require(not sorted(evidence_refs-set(evidence_ids)),f'Unknown evidence cross-references: {sorted(evidence_refs-set(evidence_ids))}')
    incident_refs=set(array_values(system_source,'incidents'));incident_refs.update(value for value in re.findall(r"incidentId:(?:'([^']*)'|null)",evidence_source) if value);foundation_incident_ids={row['id'] for row in full_canon.get('incidents',[])};known_incidents=set(incident_ids)|foundation_incident_ids;require(not sorted(incident_refs-known_incidents),f'Unknown investigation cross-references: {sorted(incident_refs-known_incidents)}')
    prohibited=('species.push(','populations.push(','locations.push(','forms.push(','routes.push(')
    for marker in prohibited:require(marker not in source and marker not in correction_source,f'World Systems must not mutate signed canon through {marker}')
    require('incidents.push(record)' in source,'System investigations are not integrated into the existing incident archive');require('Stage-specific census integration pending lineage expansion' in source,'Lineage pilots must not publish provisional stage totals');require('gaiaEvidenceSVG' in source and '<svg' in source,'Original institutional evidence renderer is missing');require('http://' not in evidence_source and 'https://' not in evidence_source,'Evidence plates must not depend on remote image URLs')
    for marker in ('WORLD SYSTEMS','GAIA EVIDENCE ARCHIVE','INVESTIGATION CHAINS','EVOLUTIONARY FAMILY PILOTS','worldSystemModal','system=','evidence=','lineage=','investigation=','INSTITUTIONAL WORLD CONTEXT','REGIONAL INSTITUTIONS & EVIDENCE'):require(marker in source,f'World Systems interface is missing: {marker}')
    for selector in ('.world-systems-grid','.evidence-archive-grid','.investigation-chain-grid','.lineage-pilot-grid','.systems-modal-card','.evidence-detail-plate','.lineage-stage-list','.dossier-world-systems','.region-world-systems'):require(selector in css,f'World Systems styling is missing: {selector}')
    if errors:print('\n'.join(f'ERROR: {error}' for error in errors));return 1
    print(f'GAIA World Systems & Evidence Pass I validated: 8 systems, 9 original evidence plates, 8 new investigations plus {len(foundation_incident_ids)} foundation incidents, 3 lineage pilots, corrected references inside signed canon, no population mutation');return 0
if __name__=='__main__':raise SystemExit(main())
