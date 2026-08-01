const { test, expect } = require('@playwright/test');

async function boot(page, path = './') {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#app')).toBeVisible();
  await expect(page.locator('#loading')).toHaveCount(0, { timeout: 15_000 });
  await expect.poll(() => page.evaluate(() => Boolean(window.GAIA_WORLD_COMPLETION))).toBeTruthy();
}

test('World Completion makes every shallow species an intentional Civilian Summary Record', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium');
  await boot(page);
  const slug = await page.evaluate(() => window.GAIA_SPECIES.find(item => !window.GAIA_EDITORIAL.dossiers[item.slug])?.slug);
  expect(slug).toBeTruthy();
  await page.evaluate(value => { location.hash = `species=${value}`; }, slug);
  await expect(page.locator('#dossier')).toHaveClass(/open/);
  await expect(page.locator('#dossierTier')).toContainText('CIVILIAN SUMMARY RECORD');
  await expect(page.locator('#dossierSections .civilian-summary-section')).toHaveCount(4);
  await expect(page.locator('#dossier')).not.toContainText(/not yet published|complete flagship dossier has not/i);

  await page.evaluate(() => { location.hash = 'species=lugia'; });
  await expect(page.locator('#dossierName')).toHaveText('Lugia');
  await expect(page.locator('#dossierTier')).toContainText('FULL GAIA DOSSIER');
});

test('GAIA Live represents tracks, six regional conditions, active ecology, and relationships', async ({ page }, testInfo) => {
  test.skip(!['desktop-chromium','mobile-webkit'].includes(testInfo.project.name));
  await boot(page);
  await page.locator('.nav-button[data-view="live"]').click();
  await expect(page.getByRole('heading', { name: 'Current world state' })).toBeVisible();
  await expect(page.locator('#regionalConditionGrid .regional-condition-card')).toHaveCount(6);
  await expect(page.locator('#ecologyNowGrid .ecology-now-card').first()).toBeVisible();
  await expect(page.locator('#relationshipNowGrid .relationship-now-card')).toHaveCount(6);
  await expect(page.locator('#regionalConditionGrid')).toContainText('Central Andes');
  await expect(page.locator('#regionalConditionGrid')).toContainText('Rift Highlands');
  await expect(page.locator('.nav-button[data-view="live"] i')).toHaveText('11');
});

test('Observed records require a canonical Earth location and persist that location in Field Log', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium');
  await page.addInitScript(() => {
    localStorage.removeItem('gaia-field-log-v1');
    localStorage.removeItem('gaia-field-observations-v2');
  });
  await boot(page, './#species=squirtle');
  await expect(page.locator('#dossierName')).toHaveText('Squirtle');
  await page.locator('#observedButton').click();
  await expect(page.locator('#observationModal')).toHaveClass(/open/);
  const selected = page.locator('input[name="observationLocation"]:checked');
  await expect(selected).toHaveCount(1);
  const selectedLabel = await selected.locator('xpath=..').locator('b').textContent();
  await page.locator('#saveObservation').click();
  await expect(page.locator('#observationModal')).not.toHaveClass(/open/);
  await expect(page.locator('#observedButton')).toContainText('Observation recorded');

  await page.locator('.nav-button[data-view="fieldlog"]').click();
  await page.locator('.field-tabs button[data-field="observed"]').click();
  await expect(page.locator('.observed-field-card')).toHaveCount(1);
  await expect(page.locator('.observed-field-card')).toContainText(selectedLabel.trim());

  const ineligible = await page.evaluate(() => window.GAIA_SPECIES.find(item => item.accessStatus === 'Sealed' || !(item.locations || []).some(location => location.realm === 'Earth'))?.slug);
  expect(ineligible).toBeTruthy();
  await page.evaluate(value => { location.hash = `species=${value}`; }, ineligible);
  await expect(page.locator('#dossier')).toHaveClass(/open/);
  await expect(page.locator('#observedButton')).toBeDisabled();
  await expect(page.locator('#observedButton')).toContainText('unavailable');
});

test('Linked archive entries open as real readable documents with shareable state', async ({ page }, testInfo) => {
  test.skip(!['desktop-chromium','mobile-webkit'].includes(testInfo.project.name));
  await boot(page, './#species=lugia');
  await expect(page.locator('#dossierName')).toHaveText('Lugia');
  const firstArchive = page.locator('.archive-document-launcher').first();
  await expect(firstArchive).toBeVisible();
  await firstArchive.click();
  await expect(page.locator('#archiveReaderModal')).toHaveClass(/open/);
  await expect(page.locator('#archiveReaderTitle')).not.toBeEmpty();
  await expect(page.locator('.archive-document-body')).toContainText('Primary subject');
  await expect(page.locator('.archive-document-body')).toContainText('Lugia');
  await expect.poll(() => page.evaluate(() => location.hash)).toMatch(/^#archive=/);
  await expect(page.locator('#archiveNext')).toBeVisible();
});

test('The Index exposes danger, mobility, depth, and sorting controls', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium');
  await boot(page);
  await page.locator('.nav-button[data-view="index"]').click();
  await expect(page.locator('.index-controls select')).toHaveCount(6);
  await page.locator('#indexDepth').selectOption('summary');
  await expect(page.locator('#indexSummary')).toContainText('verified records');
  await expect(page.locator('#indexBody')).toContainText('Civilian summary');
  await expect(page.locator('#indexBody')).not.toContainText('Full dossier');
  await page.locator('#indexSort').selectOption('population-asc');
  await expect(page.locator('#indexBody tr').first()).toHaveAttribute('tabindex','0');
});

test('New World Completion regions are universally searchable and open correctly', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium');
  await boot(page);
  await page.locator('#searchInput').fill('Central Andes');
  const result = page.locator('.search-result.search-region').filter({ hasText: 'Central Andes' }).first();
  await expect(result).toBeVisible();
  await result.click();
  await expect(page.locator('#regionModal')).toHaveClass(/open/);
  await expect(page.locator('#regionTitle')).toHaveText('Central Andes Cloud-Forest Corridor');
});
