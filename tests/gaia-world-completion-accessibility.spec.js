const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

async function boot(page, path = './') {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#app')).toBeVisible();
  await expect(page.locator('#loading')).toHaveCount(0, { timeout: 15_000 });
  await expect.poll(() => page.evaluate(() => Boolean(window.GAIA_WORLD_COMPLETION))).toBeTruthy();
}

async function expectNoSeriousOrCritical(page) {
  const results = await new AxeBuilder({ page }).analyze();
  const violations = results.violations.filter(violation => ['serious','critical'].includes(violation.impact));
  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
}

test('expanded GAIA Live and Index pass serious/critical accessibility scans', async ({ page }, testInfo) => {
  test.skip(!['desktop-chromium','mobile-webkit'].includes(testInfo.project.name));
  await boot(page);

  await page.locator('.nav-button[data-view="live"]').click();
  await expect(page.locator('#regionalConditionGrid .regional-condition-card')).toHaveCount(6);
  await expectNoSeriousOrCritical(page);

  await page.locator('.nav-button[data-view="index"]').click();
  await expect(page.locator('.index-controls select')).toHaveCount(6);
  await expectNoSeriousOrCritical(page);
});

test('observation, archive, and Andes dialogs pass serious/critical accessibility scans', async ({ page }, testInfo) => {
  test.skip(!['desktop-chromium','mobile-webkit'].includes(testInfo.project.name));
  await boot(page, './#species=squirtle');

  await expect(page.locator('#dossierName')).toHaveText('Squirtle');
  await page.locator('#observedButton').click();
  await expect(page.locator('#observationModal')).toHaveClass(/open/);
  await expectNoSeriousOrCritical(page);
  await page.locator('#closeObservation').click();

  await page.evaluate(() => { location.hash = 'species=lugia'; });
  await expect(page.locator('#dossierName')).toHaveText('Lugia');
  await page.locator('.archive-document-launcher').first().click();
  await expect(page.locator('#archiveReaderModal')).toHaveClass(/open/);
  await expectNoSeriousOrCritical(page);
  await page.locator('#closeArchiveReader').click();

  await page.evaluate(() => { location.hash = 'region=central-andes-cloud-forest-corridor'; });
  await expect(page.locator('#regionModal')).toHaveClass(/open/);
  await expect(page.locator('#regionTitle')).toHaveText('Central Andes Cloud-Forest Corridor');
  await expectNoSeriousOrCritical(page);
});
