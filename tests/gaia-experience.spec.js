const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const quietConsolePatterns = [
  /Failed to load resource/i,
  /ERR_ABORTED/i,
  /Basemap/i,
  /maplibre/i,
  /WebGL/i,
];

async function bootGaia(page) {
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (!quietConsolePatterns.some(pattern => pattern.test(text))) consoleErrors.push(text);
  });
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#app')).toBeVisible();
  await expect(page.locator('#loading')).toHaveCount(0, { timeout: 12_000 });
  await expect(page.getByRole('heading', { name: 'The world is inhabited.' })).toBeVisible();
  return { pageErrors, consoleErrors };
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    body: document.body.scrollWidth - document.body.clientWidth,
  }));
  expect(overflow.document).toBeLessThanOrEqual(2);
  expect(overflow.body).toBeLessThanOrEqual(2);
}

async function search(page, query) {
  const input = page.locator('#searchInput');
  await input.fill(query);
  await expect(page.locator('#searchResults')).toHaveClass(/open/);
  await expect(page.locator('.search-result[data-search]').first()).toBeVisible();
  return page.locator('#searchResults');
}

test('core experience boots cleanly and remains within the viewport', async ({ page }, testInfo) => {
  const errors = await bootGaia(page);
  await expect(page.locator('.nav-button')).toHaveCount(5);
  await expect(page.locator('footer')).toContainText('CANON 2026-07-27.1');
  await expect(page.locator('footer')).toContainText('ECOLOGY 2026-07-28.2');
  await expect(page.locator('footer')).toContainText('ASSETS 2026-07-29.1');
  await expectNoHorizontalOverflow(page);

  const assetVersion = await page.evaluate(() => window.GAIA_ASSET_POLICY?.manifest?.version);
  expect(assetVersion).toBe('2026-07-29.1');
  expect(errors.pageErrors).toEqual([]);
  expect(errors.consoleErrors).toEqual([]);

  const screenshotPath = testInfo.outputPath('visual-review', `${testInfo.project.name}-globe.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false });
});

test('keyboard search opens species, regions, and ecology systems', async ({ page }, testInfo) => {
  test.skip(!['desktop-chromium', 'desktop-firefox'].includes(testInfo.project.name));
  await bootGaia(page);

  await page.keyboard.press('/');
  await expect(page.locator('#searchInput')).toBeFocused();
  await search(page, 'Lugia');
  await page.keyboard.press('Enter');
  await expect(page.locator('#dossier')).toHaveClass(/open/);
  await expect(page.locator('#dossierName')).toHaveText('Lugia');
  await page.keyboard.press('Escape');
  await expect(page.locator('#dossier')).not.toHaveClass(/open/);

  const regionResults = await search(page, 'New England');
  const regionResult = regionResults.locator('.search-region').first();
  await expect(regionResult).toBeVisible();
  await regionResult.click();
  await expect(page.locator('#regionModal')).toHaveClass(/open/);
  await expect(page.locator('#regionTitle')).toContainText('New England');
  await page.keyboard.press('Escape');

  const ecologyResults = await search(page, 'New England');
  const ecologyResult = ecologyResults.locator('.search-ecology').first();
  await expect(ecologyResult).toBeVisible();
  await ecologyResult.click();
  await expect(page.locator('#ecologyInspector')).toBeVisible({ timeout: 12_000 });
  await expect(page.locator('#ecologyInspectorContent')).toContainText(/Habitat system|Ecological corridor/);
});

test('shareable deep links restore the intended atlas context', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium');
  await bootGaia(page);

  await page.goto('./#species=lugia');
  await expect(page.locator('#dossierName')).toHaveText('Lugia', { timeout: 12_000 });
  await expect(page.locator('#dossier')).toHaveClass(/open/);

  await page.goto('./#region=new-england');
  await expect(page.locator('#regionTitle')).toContainText('New England', { timeout: 12_000 });
  await expect(page.locator('#regionModal')).toHaveClass(/open/);
  await page.keyboard.press('Escape');

  const ecologyResults = await search(page, 'New England');
  const ecologyResult = ecologyResults.locator('.search-ecology').first();
  await ecologyResult.click();
  await expect(page.locator('#ecologyInspector')).toBeVisible({ timeout: 12_000 });
  const ecologyHash = await page.evaluate(() => location.hash);
  expect(ecologyHash).toMatch(/^#ecology=/);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#ecologyInspector')).toBeVisible({ timeout: 12_000 });

  await page.getByRole('button', { name: /Records/i }).click();
  await expect(page.locator('#view-records')).toHaveClass(/active/);
  const incidentTitle = await page.locator('.incident-card h4').first().textContent();
  expect(incidentTitle).toBeTruthy();
  const incidentResults = await search(page, incidentTitle.trim());
  await incidentResults.locator('.search-incident').first().click();
  expect(await page.evaluate(() => location.hash)).toMatch(/^#incident=/);

  await page.goto('./#species=lugia');
  await expect(page.locator('#dossier')).toHaveClass(/open/, { timeout: 12_000 });
  const archiveTitle = await page.locator('.archive-list article h4').first().textContent();
  expect(archiveTitle).toBeTruthy();
  await page.locator('#closeDossier').click();
  const archiveResults = await search(page, archiveTitle.trim());
  await archiveResults.locator('.search-archive').first().click();
  expect(await page.evaluate(() => location.hash)).toMatch(/^#archive=/);
  await expect(page.locator('#dossier')).toHaveClass(/open/);
});

test('mobile navigation and regional dialogs remain reachable', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile-'));
  await bootGaia(page);
  await expectNoHorizontalOverflow(page);

  await page.getByRole('button', { name: /Records/i }).click();
  await expect(page.locator('#view-records')).toHaveClass(/active/);
  await page.locator('#recordsRegionExplorerButton').click();
  await expect(page.locator('#regionExplorerModal')).toHaveClass(/open/);
  await expect(page.locator('#closeRegionExplorer')).toBeFocused();
  await expectNoHorizontalOverflow(page);

  await page.locator('.region-explorer-main').first().click();
  await expect(page.locator('#regionModal')).toHaveClass(/open/);
  await expect(page.locator('#closeRegion')).toBeFocused();
  await expect(page.locator('#regionContent')).toBeVisible();
  await expectNoHorizontalOverflow(page);

  const screenshotPath = testInfo.outputPath('visual-review', `${testInfo.project.name}-region.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false });
});

test('remote artwork failure produces an authored GAIA reconstruction', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium');
  await page.route('https://raw.githubusercontent.com/**', route => route.abort());
  await bootGaia(page);

  const fallback = page.locator('img.gaia-authored-fallback').first();
  await expect(fallback).toBeAttached({ timeout: 10_000 });
  const details = await fallback.evaluate(image => ({
    src: image.getAttribute('src'),
    profile: image.dataset.assetProfile,
    version: image.dataset.assetVersion,
    state: image.dataset.assetState,
  }));
  expect(details.src).toMatch(/^data:image\/svg\+xml/);
  expect(details.profile).toMatch(/^(field|marine|tracked|mythic|anomaly|artificial|sealed)$/);
  expect(details.version).toBe('2026-07-29.1');
  expect(details.state).toBe('archive');
});

test('primary public surfaces have no serious or critical axe violations', async ({ page }, testInfo) => {
  test.skip(!['desktop-chromium', 'mobile-webkit'].includes(testInfo.project.name));
  await bootGaia(page);

  const scan = async () => {
    const results = await new AxeBuilder({ page })
      .exclude('.maplibregl-control-container')
      .analyze();
    return results.violations.filter(violation => ['serious', 'critical'].includes(violation.impact));
  };

  expect(await scan()).toEqual([]);
  await page.getByRole('button', { name: /Records/i }).click();
  await expect(page.locator('#view-records')).toHaveClass(/active/);
  expect(await scan()).toEqual([]);
});

test('reduced-motion preference is honored by the test surface', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'reduced-motion-chromium');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await bootGaia(page);
  const motion = await page.evaluate(() => ({
    media: matchMedia('(prefers-reduced-motion: reduce)').matches,
    classApplied: document.documentElement.classList.contains('gaia-reduced-motion'),
    declared: document.documentElement.dataset.motionPreference,
  }));
  expect(motion).toEqual({ media: true, classApplied: true, declared: 'reduce' });
  await expectNoHorizontalOverflow(page);
});
