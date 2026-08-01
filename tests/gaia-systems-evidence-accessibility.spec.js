const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

async function boot(page, path = './') {
  await page.goto(path, { waitUntil:'domcontentloaded' });
  await expect(page.locator('#app')).toBeVisible();
  await expect(page.locator('#loading')).toHaveCount(0, { timeout:15_000 });
  await expect.poll(() => page.evaluate(() => Boolean(window.GAIA_WORLD_SYSTEMS_READY))).toBeTruthy();
}

async function expectNoSeriousOrCritical(page) {
  const results = await new AxeBuilder({ page }).analyze();
  const violations = results.violations.filter(item => ['serious','critical'].includes(item.impact));
  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
}

test('World Systems collections pass serious and critical accessibility scans', async ({ page }, testInfo) => {
  test.skip(!['desktop-chromium','mobile-webkit'].includes(testInfo.project.name));
  await boot(page);
  await page.locator('.nav-button[data-view="records"]').click();
  await expect(page.locator('#worldSystemsGrid .world-system-card')).toHaveCount(8);
  await expect(page.locator('#evidenceArchiveGrid .evidence-record-card')).toHaveCount(9);
  await expectNoSeriousOrCritical(page);
});

test('system, evidence, investigation, and lineage dialogs pass serious and critical scans', async ({ page }, testInfo) => {
  test.skip(!['desktop-chromium','mobile-webkit'].includes(testInfo.project.name));
  await boot(page, './#system=critical-infrastructure');
  await expect(page.locator('#worldSystemTitle')).toHaveText('Critical Infrastructure Pokémon Operations');
  await expectNoSeriousOrCritical(page);
  await page.locator('#closeWorldSystem').click();

  await page.evaluate(() => { location.hash='evidence=ev-pnw-electivire-052'; });
  await expect(page.locator('#worldSystemTitle')).toHaveText('Substation induction-overload trace');
  await expectNoSeriousOrCritical(page);
  await page.locator('#closeWorldSystem').click();

  await page.evaluate(() => { location.hash='investigation=gaia-i-2024-052'; });
  await expect(page.locator('#worldSystemTitle')).toHaveText('Cascadia substation induction-overload event');
  await expectNoSeriousOrCritical(page);
  await page.locator('#closeWorldSystem').click();

  await page.evaluate(() => { location.hash='lineage=lineage-gardevoir'; });
  await expect(page.locator('#worldSystemTitle')).toHaveText('Ralts Cognitive Development Line');
  await expectNoSeriousOrCritical(page);
});
