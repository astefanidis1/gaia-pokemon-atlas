const { test, expect } = require('@playwright/test');

async function boot(page, path = './') {
  await page.goto(path, { waitUntil:'domcontentloaded' });
  await expect(page.locator('#app')).toBeVisible();
  await expect(page.locator('#loading')).toHaveCount(0, { timeout:15_000 });
  await expect.poll(() => page.evaluate(() => Boolean(window.GAIA_WORLD_SYSTEMS_READY))).toBeTruthy();
}

async function expectNoHorizontalOverflow(page) {
  const values = await page.evaluate(() => ({ viewport:document.documentElement.clientWidth, document:document.documentElement.scrollWidth, body:document.body.scrollWidth }));
  expect(values.document).toBeLessThanOrEqual(values.viewport + 1);
  expect(values.body).toBeLessThanOrEqual(values.viewport + 1);
}

async function expectContained(page, selector, margin = 1) {
  const values = await page.locator(selector).evaluate(element => {
    const box=element.getBoundingClientRect();
    return { left:box.left, top:box.top, right:box.right, bottom:box.bottom, width:innerWidth, height:innerHeight };
  });
  expect(values.left).toBeGreaterThanOrEqual(-margin);
  expect(values.top).toBeGreaterThanOrEqual(-margin);
  expect(values.right).toBeLessThanOrEqual(values.width + margin);
  expect(values.bottom).toBeLessThanOrEqual(values.height + margin);
}

test('desktop systems collections and document dialogs remain contained', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium');
  await boot(page);
  await page.locator('.nav-button[data-view="records"]').click();
  await expect(page.locator('#worldSystemsGrid .world-system-card')).toHaveCount(8);
  await expectNoHorizontalOverflow(page);
  const systemColumns = await page.locator('#worldSystemsGrid').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length);
  const evidenceColumns = await page.locator('#evidenceArchiveGrid').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length);
  expect(systemColumns).toBeGreaterThanOrEqual(2);
  expect(evidenceColumns).toBeGreaterThanOrEqual(2);

  await page.locator('[data-gaia-system="critical-infrastructure"]').first().click();
  await expectContained(page, '#worldSystemModal .systems-modal-card');
  await expectNoHorizontalOverflow(page);
  await page.locator('#closeWorldSystem').click();

  await page.evaluate(() => { location.hash='evidence=ev-regirock-006'; });
  await expectContained(page, '#worldSystemModal .systems-modal-card');
  await expectNoHorizontalOverflow(page);
});

test('mobile systems collections use one column and dialogs remain contained', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-webkit');
  await boot(page);
  await page.locator('.nav-button[data-view="records"]').click();
  for (const selector of ['#worldSystemsGrid','#evidenceArchiveGrid','#investigationChainGrid','#lineagePilotGrid']) {
    const columns = await page.locator(selector).evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(1);
  }
  await expectNoHorizontalOverflow(page);

  await page.evaluate(() => { location.hash='lineage=lineage-gardevoir'; });
  await expect(page.locator('#worldSystemTitle')).toHaveText('Ralts Cognitive Development Line');
  await expectContained(page, '#worldSystemModal .systems-modal-card');
  await expectNoHorizontalOverflow(page);
  const stageColumns = await page.locator('.lineage-stage-list').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length);
  expect(stageColumns).toBe(1);
});
