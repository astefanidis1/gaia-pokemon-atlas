const { test, expect } = require('@playwright/test');

async function boot(page, path = './') {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#app')).toBeVisible();
  await expect(page.locator('#loading')).toHaveCount(0, { timeout: 15_000 });
  await expect.poll(() => page.evaluate(() => Boolean(window.GAIA_WORLD_SYSTEMS_READY))).toBeTruthy();
}

test('World Systems data is complete and remains inside the signed canon', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium');
  await boot(page);
  const result = await page.evaluate(() => {
    const slugs = new Set(window.GAIA_SPECIES.map(item => item.slug));
    const regionIds = new Set(window.GAIA_EDITORIAL.regions.map(region => region.id));
    const systemIds = new Set(window.GAIA_WORLD_SYSTEMS.map(item => item.id));
    const evidenceIds = new Set(window.GAIA_EVIDENCE_RECORDS.map(item => item.id));
    const incidentIds = new Set(window.GAIA_SYSTEM_INCIDENTS.map(item => item.id));
    const archiveIds = new Set(window.GAIA_INCIDENTS.map(item => item.id));
    return {
      counts:{ species:window.GAIA_SPECIES.length, systems:window.GAIA_WORLD_SYSTEMS.length, evidence:window.GAIA_EVIDENCE_RECORDS.length, investigations:window.GAIA_SYSTEM_INCIDENTS.length, lineages:window.GAIA_LINEAGE_PILOTS.length },
      missingSpecies:[...window.GAIA_WORLD_SYSTEMS.flatMap(item=>item.species),...window.GAIA_EVIDENCE_RECORDS.flatMap(item=>item.species),...window.GAIA_SYSTEM_INCIDENTS.flatMap(item=>item.species),...window.GAIA_LINEAGE_PILOTS.map(item=>item.anchorSlug)].filter(slug=>!slugs.has(slug)),
      missingRegions:[...window.GAIA_WORLD_SYSTEMS.flatMap(item=>item.regions),...window.GAIA_EVIDENCE_RECORDS.map(item=>item.regionId).filter(Boolean)].filter(id=>!regionIds.has(id)),
      missingSystems:[...window.GAIA_EVIDENCE_RECORDS.flatMap(item=>item.systemIds),...window.GAIA_SYSTEM_INCIDENTS.flatMap(item=>item.systemIds),...window.GAIA_LINEAGE_PILOTS.flatMap(item=>item.systems)].filter(id=>!systemIds.has(id)),
      missingEvidence:[...window.GAIA_SYSTEM_INCIDENTS.flatMap(item=>item.evidenceIds),...window.GAIA_LINEAGE_PILOTS.flatMap(item=>item.evidence)].filter(id=>!evidenceIds.has(id)),
      missingIncidents:window.GAIA_EVIDENCE_RECORDS.map(item=>item.incidentId).filter(Boolean).filter(id=>!incidentIds.has(id)),
      missingSystemIncidentRefs:window.GAIA_WORLD_SYSTEMS.flatMap(item=>item.incidents).filter(id=>!archiveIds.has(id)),
      archiveIncidentCount:window.GAIA_INCIDENTS.filter(item=>incidentIds.has(item.id)).length,
      forbidden:[...window.GAIA_WORLD_SYSTEMS.flatMap(item=>item.species),...window.GAIA_EVIDENCE_RECORDS.flatMap(item=>item.species)].filter(slug=>['rotom','squirtle'].includes(slug)),
      removedIncidentRefs:window.GAIA_REMOVED_SYSTEM_INCIDENT_REFERENCES,
      effectiveIncidentRefs:window.GAIA_WORLD_SYSTEMS.flatMap(item=>item.incidents),
      correctionVersions:[window.GAIA_WORLD_REFERENCE_CORRECTION_VERSION,window.GAIA_SYSTEM_REFERENCE_CORRECTION_VERSION]
    };
  });
  expect(result.counts).toEqual({ species:161, systems:8, evidence:9, investigations:8, lineages:3 });
  expect(result.missingSpecies).toEqual([]);
  expect(result.missingRegions).toEqual([]);
  expect(result.missingSystems).toEqual([]);
  expect(result.missingEvidence).toEqual([]);
  expect(result.missingIncidents).toEqual([]);
  expect(result.missingSystemIncidentRefs).toEqual([]);
  expect(result.archiveIncidentCount).toBe(8);
  expect(result.forbidden).toEqual([]);
  expect(result.removedIncidentRefs).toEqual(['gaia-i-2020-041']);
  expect(result.effectiveIncidentRefs).not.toContain('gaia-i-2020-041');
  expect(result.correctionVersions).toEqual(['2026-08-01.2','2026-08-01.2']);
});

test('Records presents systems, evidence, investigations, and lineage pilots as complete collections', async ({ page }, testInfo) => {
  test.skip(!['desktop-chromium','mobile-webkit'].includes(testInfo.project.name));
  await boot(page);
  await page.locator('.nav-button[data-view="records"]').click();
  await expect(page.locator('#worldSystemsGrid .world-system-card')).toHaveCount(8);
  await expect(page.locator('#evidenceArchiveGrid .evidence-record-card')).toHaveCount(9);
  await expect(page.locator('#investigationChainGrid .investigation-chain-card')).toHaveCount(8);
  await expect(page.locator('#lineagePilotGrid .lineage-pilot-card')).toHaveCount(3);
  await expect(page.locator('#evidenceArchiveGrid .gaia-evidence-svg')).toHaveCount(9);
});

test('a system opens evidence, investigation, species, and regional context', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium');
  await boot(page);
  await page.locator('.nav-button[data-view="records"]').click();
  await page.locator('[data-gaia-system="critical-infrastructure"]').first().click();
  await expect(page.locator('#worldSystemModal')).toHaveClass(/open/);
  await expect(page.locator('#worldSystemTitle')).toHaveText('Critical Infrastructure Pokémon Operations');
  await expect(page.locator('#worldSystemContent')).toContainText('INFRA-ELEC-6');

  await page.locator('#worldSystemContent [data-gaia-evidence="ev-pnw-electivire-052"]').click();
  await expect(page.locator('#worldSystemTitle')).toHaveText('Substation induction-overload trace');
  await expect(page.locator('.evidence-detail-plate .gaia-evidence-svg')).toBeVisible();
  await expect.poll(() => page.evaluate(() => location.hash)).toBe('#evidence=ev-pnw-electivire-052');

  await page.locator('#worldSystemContent [data-gaia-investigation="gaia-i-2024-052"]').click();
  await expect(page.locator('#worldSystemTitle')).toHaveText('Cascadia substation induction-overload event');
  await expect(page.locator('#worldSystemContent')).toContainText('DOCUMENTED CONSEQUENCE');

  await page.locator('#worldSystemContent [data-gaia-species="electivire"]').click();
  await expect(page.locator('#worldSystemModal')).not.toHaveClass(/open/);
  await expect(page.locator('#dossierName')).toHaveText('Electivire');
  await expect(page.locator('.dossier-world-systems')).toContainText('Infrastructure Operations');
});

test('evidence and systems are connected to dossiers and regional field windows', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium');
  await boot(page, './#species=arcanine');
  await expect(page.locator('#dossierName')).toHaveText('Arcanine');
  await expect(page.locator('.dossier-world-systems')).toBeVisible();
  await expect(page.locator('.dossier-world-systems')).toContainText('Emergency Response');
  await expect(page.locator('.dossier-world-systems')).toContainText('AND-SAR-009');
  await page.locator('.dossier-world-systems [data-gaia-evidence="ev-andes-arcanine-009"]').click();
  await expect(page.locator('#worldSystemTitle')).toHaveText('High-altitude rescue route');
  await page.locator('#closeWorldSystem').click();
  await page.locator('#closeDossier').click();
  await page.evaluate(() => { location.hash = 'region=central-andes-cloud-forest-corridor'; });
  await expect(page.locator('#regionModal')).toHaveClass(/open/);
  await expect(page.locator('.region-world-systems')).toBeVisible();
  await expect(page.locator('.region-world-systems')).toContainText('High-altitude rescue route');
});

test('lineage pilots explain stage accounting without publishing provisional totals', async ({ page }, testInfo) => {
  test.skip(!['desktop-chromium','mobile-webkit'].includes(testInfo.project.name));
  await boot(page, './#lineage=lineage-gardevoir');
  await expect(page.locator('#worldSystemModal')).toHaveClass(/open/);
  await expect(page.locator('#worldSystemTitle')).toHaveText('Ralts Cognitive Development Line');
  await expect(page.locator('.lineage-stage-list article')).toHaveCount(3);
  await expect(page.locator('.lineage-stage-list')).toContainText('Ralts');
  await expect(page.locator('.lineage-stage-list')).toContainText('Kirlia');
  await expect(page.locator('.lineage-stage-list')).toContainText('Gardevoir');
  await expect(page.locator('#worldSystemContent')).toContainText('Stage-specific census integration pending lineage expansion');
  await expect(page.locator('#worldSystemContent')).not.toContainText(/Ralts.*\d+ living|Kirlia.*\d+ living/i);
});

test('universal search and deep links resolve the new record types', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium');
  await boot(page);
  await page.locator('#searchInput').fill('Wildlife Crime');
  const systemResult = page.locator('.search-result.search-system').filter({ hasText:'Wildlife Crime, Trafficking & Artifact Protection' });
  await expect(systemResult).toBeVisible();
  await systemResult.click();
  await expect(page.locator('#worldSystemTitle')).toHaveText('Wildlife Crime, Trafficking & Artifact Protection');
  await page.locator('#closeWorldSystem').click();
  await page.evaluate(() => { location.hash = 'evidence=ev-regirock-006'; });
  await expect(page.locator('#worldSystemTitle')).toHaveText('Seal-chamber photogrammetry');
  await page.locator('#closeWorldSystem').click();
  await page.evaluate(() => { location.hash = 'investigation=gaia-i-2018-031'; });
  await expect(page.locator('#worldSystemTitle')).toHaveText('Independent artificial cognition custody ruling');
});
