const { test, expect } = require('@playwright/test');
const budgets = require('../performance-budgets.json');

async function boot(page, options = {}) {
  const started = Date.now();
  await page.goto('./', { waitUntil: options.waitUntil || 'domcontentloaded' });
  await expect(page.locator('#app')).toBeVisible();
  await expect(page.locator('#loading')).toHaveCount(0, { timeout: 15_000 });
  await expect(page.getByRole('heading', { name: 'The world is inhabited.' })).toBeVisible();
  return Date.now() - started;
}

test('RC1 first visit offers a current track and regional ecosystem without a tutorial modal', async ({ page }, testInfo) => {
  test.skip(!['desktop-chromium','mobile-webkit'].includes(testInfo.project.name));
  await page.addInitScript(() => localStorage.removeItem('gaia-rc1-priority-brief-dismissed'));
  await boot(page);

  const brief = page.locator('#rcPriorityBrief');
  await expect(brief).toBeVisible();
  await expect(brief).toContainText('PRIORITY WORLD BRIEF');
  await expect(brief.locator('.rc-priority-track')).toBeVisible();
  await expect(page.locator('.modal.open')).toHaveCount(0);

  if (testInfo.project.name === 'desktop-chromium') {
    await expect(brief.locator('.rc-priority-region')).toBeVisible();
    await brief.locator('.rc-priority-track').click();
    await expect(page.locator('#dossier')).toHaveClass(/open/);
    await expect(page.locator('#dossierName')).not.toBeEmpty();
  }
});

test('RC1 production metadata, install manifest, and founder music credit are materialized', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium');
  await boot(page);

  await expect(page.locator('meta[name="gaia-release"]')).toHaveAttribute('content','RC1-2026-07-29.1');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content',/gaia-social-preview\.png$/);
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content',/gaia-social-preview\.png$/);
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href','manifest.webmanifest');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href',/gaia-apple-touch-icon\.png$/);
  await expect(page).toHaveTitle('GAIA Atlas — The world is inhabited.');

  await page.locator('#aboutButton').click();
  const musicLink = page.locator('.founder-music-credit a');
  await expect(musicLink).toBeVisible();
  await expect(musicLink).toHaveText(/Listen to ZANDROS/);
  await expect(musicLink).toHaveAttribute('href','https://zandros.fanlink.tv/ZANDROS');
  await expect(musicLink).toHaveAttribute('target','_blank');

  const response = await page.request.get('./manifest.webmanifest');
  expect(response.ok()).toBeTruthy();
  const manifest = await response.json();
  expect(manifest.display).toBe('standalone');
  expect(manifest.icons.some(icon => icon.purpose === 'maskable')).toBeTruthy();
});

test('RC1 reaches a usable local globe under a deliberately weak network', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium');
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1') {
      await new Promise(resolve => setTimeout(resolve, 150));
      await route.continue();
      return;
    }
    await route.abort();
  });

  const elapsed = await boot(page);
  expect(elapsed).toBeLessThan(budgets.weak_network_usable_ms);
  await expect(page.locator('#mapFallback')).toBeVisible({ timeout: 12_000 });
  await expect(page.locator('#rcPriorityBrief')).toBeVisible();
  await expect(page.locator('.nav-button')).toHaveCount(5);
});

test('RC1 reopens from its cached shell while fully offline', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium');
  await boot(page);
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise(resolve => setTimeout(resolve, 300));
    return Boolean(registration.active);
  });
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('#app')).toBeVisible();
  }

  await context.setOffline(true);
  const started = Date.now();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#app')).toBeVisible({ timeout: budgets.offline_reopen_ms });
  await expect(page.getByRole('heading', { name: 'The world is inhabited.' })).toBeVisible();
  expect(Date.now() - started).toBeLessThan(budgets.offline_reopen_ms);
  await expect(page.locator('.signal')).toContainText('OFFLINE ARCHIVE');
  await expect(page.locator('.nav-button')).toHaveCount(5);
});
