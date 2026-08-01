const { test, expect } = require('@playwright/test');

async function boot(page, path = './') {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#app')).toBeVisible();
  await expect(page.locator('#loading')).toHaveCount(0, { timeout: 15_000 });
  await expect.poll(() => page.evaluate(() => Boolean(window.GAIA_WORLD_COMPLETION))).toBeTruthy();
}

test('capture World Completion desktop surfaces for human review', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium');
  await boot(page);
  await page.locator('.nav-button[data-view="live"]').click();
  await expect(page.locator('#regionalConditionGrid .regional-condition-card')).toHaveCount(6);
  await page.screenshot({ path: testInfo.outputPath('visual-review/world-completion-live-desktop.png'), fullPage: true });
  await page.locator('.nav-button[data-view="index"]').click();
  await expect(page.locator('.index-controls select')).toHaveCount(6);
  await page.screenshot({ path: testInfo.outputPath('visual-review/world-completion-index-desktop.png'), fullPage: true });
  await page.evaluate(() => { location.hash = 'species=arcanine'; });
  await expect(page.locator('#dossierName')).toHaveText('Arcanine');
  await page.locator('#observedButton').click();
  await expect(page.locator('#observationModal')).toHaveClass(/open/);
  await page.screenshot({ path: testInfo.outputPath('visual-review/world-completion-observation-desktop.png'), fullPage: true });
  await page.locator('#closeObservation').click();
  await page.evaluate(() => { location.hash = 'species=lugia'; });
  await expect(page.locator('#dossierName')).toHaveText('Lugia');
  await page.locator('.archive-document-launcher').first().click();
  await expect(page.locator('#archiveReaderModal')).toHaveClass(/open/);
  await page.screenshot({ path: testInfo.outputPath('visual-review/world-completion-archive-desktop.png'), fullPage: true });
});

test('capture World Completion mobile world state and regional ecology', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-webkit');
  await boot(page);
  await page.locator('.nav-button[data-view="live"]').click();
  await expect(page.locator('#regionalConditionGrid .regional-condition-card')).toHaveCount(6);
  await page.screenshot({ path: testInfo.outputPath('visual-review/world-completion-live-mobile.png'), fullPage: true });
  await page.evaluate(() => { location.hash = 'region=central-andes-cloud-forest-corridor'; });
  await expect(page.locator('#regionModal')).toHaveClass(/open/);
  await expect(page.locator('#regionTitle')).toHaveText('Central Andes Cloud-Forest Corridor');
  await page.screenshot({ path: testInfo.outputPath('visual-review/world-completion-andes-mobile.png'), fullPage: true });
});
