#!/usr/bin/env python3
"""Validate GAIA documentation and cross-layer release wiring."""
from __future__ import annotations
import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];DOCS=ROOT/'docs';PUBLIC=ROOT/'public';SOURCE=ROOT/'src'/'app';errors=[]
def require(condition,message):
    if not condition: errors.append(message)
def read_utf8(path):
    try:text=path.read_bytes().decode('utf-8',errors='strict')
    except (OSError,UnicodeDecodeError) as exc:errors.append(f'{path.relative_to(ROOT)} is not valid UTF-8: {exc}');return ''
    controls=sorted({ord(char) for char in text if ord(char)<32 and char not in '\n\r\t'})
    if controls:errors.append(f'{path.relative_to(ROOT)} contains control bytes: {controls}')
    return text
markdown_files=sorted([ROOT/'README.md',*DOCS.glob('*.md')]);texts={path:read_utf8(path) for path in markdown_files}
required_docs={
 'WORLD_ECOLOGY_PHASE_3.md':('# GAIA Atlas — World Ecology Phase 3','27 full dossiers','16 habitat systems'),
 'WORLD_COMPLETION_PASS_1.md':('# GAIA Atlas — World Completion Pass I','Civilian Summary Record','24 ecological relationships'),
 'WORLD_COMPLETION_PAYLOAD.md':('# GAIA World Completion Payload Transport','two independently signed semantic payloads','phase4-06.txt'),
 'WORLD_SYSTEMS_EVIDENCE_PASS_1.md':('# GAIA Atlas — World Systems & Evidence Pass I','eight systems','Nine original institutional evidence plates','Evolutionary-family pilots')}
for filename,markers in required_docs.items():
    content=texts.get(DOCS/filename,'')
    for marker in markers:require(marker.lower() in content.lower(),f'{filename} is missing: {marker}')
readme=texts.get(ROOT/'README.md','')
for marker in ('http://localhost:8000/public/','Universal search','Playwright','visual asset','World Completion Pass I'):
    require(marker.lower() in readme.lower(),f'README is missing: {marker}')
require('public/code/' not in texts.get(DOCS/'POLISH_PASS.md',''),'POLISH_PASS.md references obsolete public/code payload')
module_markers={
 '02c-continuity.js':('searchTargets','#ecology=','CONNECTED WORLD ECOLOGY'),
 '02d-assets.js':('GAIA_ASSET_POLICY','gaiaArchiveArtwork','Civilian redacted silhouette'),
 '02e-assurance.js':('GAIA_ASSURANCE_VERSION',"role','combobox",'gaia-reduced-motion','inert'),
 '02f-release-candidate.js':('GAIA_RC_VERSION','PRIORITY WORLD BRIEF','OFFLINE ARCHIVE','https://zandros.fanlink.tv/ZANDROS','sw-world-completion.js'),
 '02g-world-completion.js':('GAIA_WORLD_COMPLETION_VERSION','Civilian Summary Record','gaia-field-observations-v2','regionalConditionGrid','archiveReaderModal','indexDepth'),
 '02g0-world-reference-corrections.js':('GAIA_WORLD_REFERENCE_CORRECTION_VERSION',"rotom:'electivire'","squirtle:'lapras'"),
 '02h-systems-evidence.js':('GAIA_WORLD_SYSTEMS_VERSION','gaiaWorldSystems','gaiaEvidenceRecords','gaiaLineagePilots','gaiaSystemIncidents','WORLD SYSTEMS','GAIA EVIDENCE ARCHIVE'),
 '02i-systems-reference-corrections.js':('GAIA_SYSTEM_REFERENCE_CORRECTION_VERSION','lineage-gardevoir','ev-pnw-electivire-052','gaia-i-2020-041','knownIncidentIds')}
for filename,markers in module_markers.items():
    content=read_utf8(SOURCE/filename) if (SOURCE/filename).is_file() else ''
    require(bool(content),f'Missing src/app/{filename}')
    for marker in markers:require(marker.lower() in content.lower(),f'{filename} is missing marker: {marker}')
require('not yet published' not in read_utf8(SOURCE/'02g-world-completion.js').lower(),'World Completion reintroduces unfinished-publication language')
require(len(re.findall(r"label:'[^']+'",read_utf8(SOURCE/'02d-assets.js')))>=7,'Asset policy must retain seven authored profiles')
loader=read_utf8(PUBLIC/'app.js');build=read_utf8(ROOT/'scripts'/'build_public.py');worker=read_utf8(PUBLIC/'sw-world-completion.js')
for label,content in (('public/app.js',loader),('scripts/build_public.py',build),('public/sw-world-completion.js',worker)):
    for module in module_markers:require(module in content,f'{label} does not include {module}')
require('gaia-world-shell-v3' in worker,'Reference-corrected service-worker cache version is missing')
require('systems-evidence.css' in worker,'World Systems stylesheet is not cached')
phase4_files=[PUBLIC/'data'/'editorial'/f'phase4{suffix}.txt' for suffix in ('','-02','-03','-04','-05','-06')]
for path in phase4_files:require(path.is_file(),f'Missing {path.relative_to(ROOT)}');require(path.name in worker,f'World worker does not cache {path.name}')
for path in (PUBLIC/'continuity.css',PUBLIC/'assets.css',PUBLIC/'assurance.css',PUBLIC/'release-candidate.css',PUBLIC/'world-completion.css',PUBLIC/'systems-evidence.css'):require(path.is_file(),f'Missing {path.relative_to(ROOT)}')
required_infra=(PUBLIC/'sw-world-completion.js',ROOT/'scripts'/'validate_phase4.py',ROOT/'scripts'/'validate_world_systems.py',ROOT/'scripts'/'prepare_release_candidate.py',ROOT/'scripts'/'generate_release_assets.py',ROOT/'scripts'/'validate_release_candidate.py',ROOT/'performance-budgets.json',ROOT/'tests'/'gaia-experience.spec.js',ROOT/'tests'/'gaia-layout.spec.js',ROOT/'tests'/'gaia-release-candidate.spec.js',ROOT/'tests'/'gaia-world-completion.spec.js',ROOT/'tests'/'gaia-systems-evidence.spec.js',ROOT/'tests'/'gaia-systems-evidence-layout.spec.js',ROOT/'tests'/'gaia-systems-evidence-accessibility.spec.js',ROOT/'tests'/'gaia-systems-evidence-visual.spec.js')
for path in required_infra:require(path.is_file(),f'Missing infrastructure: {path.relative_to(ROOT)}')
try:package=json.loads(read_utf8(ROOT/'package.json'))
except json.JSONDecodeError as exc:errors.append(f'package.json is invalid JSON: {exc}');package={}
deps=package.get('devDependencies',{});scripts=package.get('scripts',{})
require('@playwright/test' in deps and '@axe-core/playwright' in deps,'Browser-assurance dependencies are not pinned')
require(scripts.get('test:experience')=='playwright test','test:experience script is incorrect')
require('validate_world_systems.py' in scripts.get('validate:world',''),'validate:world does not include World Systems validation')
playwright=read_utf8(ROOT/'playwright.config.js')
for project in ('desktop-chromium','desktop-firefox','mobile-chromium','mobile-webkit','reduced-motion-chromium'):require(project in playwright,f'Playwright matrix is missing project: {project}')
scenario_files={
 'gaia-experience.spec.js':('AxeBuilder','gaia-authored-fallback','#species=lugia','expectNoHorizontalOverflow'),
 'gaia-layout.spec.js':('desktop command panels expose their complete primary actions','mobile globe uses one compact terminal and fixed navigation'),
 'gaia-release-candidate.spec.js':('PRIORITY WORLD BRIEF','weak network','fully offline','Listen to ZANDROS'),
 'gaia-world-completion.spec.js':('CIVILIAN SUMMARY RECORD','regionalConditionGrid','gaia-field-observations-v2','archiveReaderModal','Electivire'),
 'gaia-systems-evidence.spec.js':('World Systems data is complete','critical-infrastructure','ev-pnw-electivire-052','lineage-gardevoir','gaia-i-2020-041'),
 'gaia-systems-evidence-layout.spec.js':('desktop systems collections and document dialogs remain contained','mobile systems collections use one column'),
 'gaia-systems-evidence-accessibility.spec.js':('AxeBuilder','World Systems collections pass','lineage dialogs pass'),
 'gaia-systems-evidence-visual.spec.js':('systems-records-desktop.png','evidence-record-desktop.png','lineage-record-mobile.png')}
for filename,markers in scenario_files.items():
    content=read_utf8(ROOT/'tests'/filename)
    for marker in markers:require(marker in content,f'{filename} is missing scenario marker: {marker}')
for path,heading in ((DOCS/'VISUAL_ASSET_STRATEGY.md','# GAIA Atlas — Visual Asset Strategy'),(DOCS/'EXPERIENCE_ASSURANCE_PHASE.md','# GAIA Atlas — Experience Assurance Phase'),(DOCS/'RELEASE_CANDIDATE_1.md','# GAIA Atlas — Release Candidate 1')):require(texts.get(path,'').startswith(heading),f'Missing documentation heading: {heading}')
if errors:
    print('\n'.join(f'ERROR: {error}' for error in errors));raise SystemExit(1)
print(f'GAIA project integrity passed: {len(markdown_files)} Markdown files, sixteen readable modules, corrected World Completion references, eight systems, nine evidence plates, eight investigations, three lineage pilots, and dedicated systems behavior/layout/accessibility/visual assurance verified.')
