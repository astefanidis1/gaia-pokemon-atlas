const { test, expect } = require('@playwright/test');

async function boot(page, path = './') {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#app')).toBeVisible();
  await expect(page.locator('#loading')).toHaveCount(0, { timeout: 15_000 });
  await expect.poll(() => page.evaluate(() => Boolean(window.GAIA_WORLD_COMPLETION))).toBeTruthy();
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(metrics.document).toBeLessThanOrEqual(metrics.viewport + 1);
  expect(metrics.body).toBeLessThanOrEqual(metrics.viewport + 1);
}

async function expectContained(page, selector, margin = 1) {
  const result = await page.locator(selector).evaluate(element => {
    const box = element.getBoundingClientRect();
    return { left:box.left, top:box.top, right:box.right, bottom:box.bottom, viewportWidth:innerWidth, viewportHeight:innerHeight };
  });
  expect(result.left).toBeGreaterThanOrEqual(-margin);
  expect(result.top).toBeGreaterThanOrEqual(-margin);
  expect(result.right).toBeLessThanOrEqual(result.viewportWidth + margin);
  expect(result.bottom).toBeLessThanOrEqual(result.viewportHeight + margin);
}

test('desktop World Completion surfaces stay balanced and contained', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium');
  await boot(page);
  await page.locator('.nav-button[data-view="live"]').click();
  await expect(page.locator('#regionalConditionGrid .regional-condition-card')).toHaveCount(6);
  await expectNoHorizontalOverflow(page);
  const regionalColumns = await page.locator('#regionalConditionGrid').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length);
  expect(regionalColumns).toBeGreaterThanOrEqual(2);

  await page.locator('.nav-button[data-view="index"]').click();
  await expect(page.locator('.index-controls select')).toHaveCount(6);
  await expectNoHorizontalOverflow(page);
  const controlBoxes = await page.locator('.index-controls select').evaluateAll(elements => elements.map(element => element.getBoundingClientRect()));
  expect(controlBoxes.every(box => box.width >= 140 && box.right <= innerWidth + 1)).toBeTruthy();

  await page.evaluate(() => { location.hash = 'species=arcanine'; });
  await expect(page.locator('#dossierName')).toHaveText('Arcanine');
  await page.locator('#observedButton').click();
  await expect(page.locator('#observationModal')).toHaveClass(/open/);
  await expectContained(page, '#observationModal .observation-card');
  await expectNoHorizontalOverflow(page);
  await page.locator('#closeObservation').click();

  await page.evaluate(() => { location.hash = 'species=lugia'; });
  await expect(page.locator('#dossierName')).toHaveText('Lugia');
  await page.locator('.archive-document-launcher').first().click();
  await expect(page.locator('#archiveReaderModal')).toHaveClass(/open/);
  await expectContained(page, '#archiveReaderModal .archive-reader-card');
  await expectNoHorizontalOverflow(page);
});

test('mobile World Completion uses one-column world state and contained dialogs', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-webkit');
  await boot(page);
  await page.locator('.nav-button[data-view="live"]').click();
  await expect(page.locator('#regionalConditionGrid .regional-condition-card')).toHaveCount(6);
  await expectNoHorizontalOverflow(page);
  for (const selector of ['#regionalConditionGrid','#ecologyNowGrid','#relationshipNowGrid']) {
    const columns = await page.locator(selector).evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(1);
  }

  await page.evaluate(() => { location.hash = 'region=central-andes-cloud-forest-corridor'; });
  await expect(page.locator('#regionModal')).toHaveClass(/open/);
  await expectContained(page, '#regionModal .region-modal-card');
  await expectNoHorizontalOverflow(page);

  await page.locator('#closeRegion').click();
  await page.evaluate(() => { location.hash = 'species=arcanine'; });
  await expect(page.locator('#dossierName')).toHaveText('Arcanine');
  await page.locator('#observedButton').click();
  await expectContained(page, '#observationModal .observation-card');
  await expectNoHorizontalOverflow(page);
});
