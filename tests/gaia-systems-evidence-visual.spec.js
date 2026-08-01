const { test, expect } = require('@playwright/test');

async function boot(page, path = './') {
  await page.goto(path, { waitUntil:'domcontentloaded' });
  await expect(page.locator('#app')).toBeVisible();
  await expect(page.locator('#loading')).toHaveCount(0, { timeout:15_000 });
  await expect.poll(() => page.evaluate(() => Boolean(window.GAIA_WORLD_SYSTEMS_READY))).toBeTruthy();
}

test('capture Systems and Evidence desktop surfaces', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium');
  await boot(page);
  await page.locator('.nav-button[data-view="records"]').click();
  await expect(page.locator('#worldSystemsGrid .world-system-card')).toHaveCount(8);
  await page.screenshot({ path:testInfo.outputPath('visual-review/systems-records-desktop.png'), fullPage:true });

  await page.evaluate(() => { location.hash='system=critical-infrastructure'; });
  await expect(page.locator('#worldSystemTitle')).toHaveText('Critical Infrastructure Pokémon Operations');
  await page.screenshot({ path:testInfo.outputPath('visual-review/system-record-desktop.png'), fullPage:true });
  await page.locator('#closeWorldSystem').click();

  await page.evaluate(() => { location.hash='evidence=ev-pnw-electivire-052'; });
  await expect(page.locator('#worldSystemTitle')).toHaveText('Substation induction-overload trace');
  await page.screenshot({ path:testInfo.outputPath('visual-review/evidence-record-desktop.png'), fullPage:true });
  await page.locator('#closeWorldSystem').click();

  await page.evaluate(() => { location.hash='investigation=gaia-i-2018-031'; });
  await expect(page.locator('#worldSystemTitle')).toHaveText('Independent artificial cognition custody ruling');
  await page.screenshot({ path:testInfo.outputPath('visual-review/investigation-record-desktop.png'), fullPage:true });
});

test('capture Systems and Evidence mobile records and lineage', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-webkit');
  await boot(page);
  await page.locator('.nav-button[data-view="records"]').click();
  await expect(page.locator('#evidenceArchiveGrid .evidence-record-card')).toHaveCount(9);
  await page.locator('#worldSystemsSection').screenshot({ path:testInfo.outputPath('visual-review/systems-records-mobile.png') });
  await page.locator('#evidenceArchiveSection').screenshot({ path:testInfo.outputPath('visual-review/evidence-records-mobile.png') });

  await page.evaluate(() => { location.hash='lineage=lineage-gardevoir'; });
  await expect(page.locator('#worldSystemTitle')).toHaveText('Ralts Cognitive Development Line');
  await page.locator('#worldSystemModal .systems-modal-card').screenshot({ path:testInfo.outputPath('visual-review/lineage-record-mobile.png') });
});
