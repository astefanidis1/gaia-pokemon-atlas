const { test, expect } = require('@playwright/test');

async function boot(page) {
  await page.goto('./', { waitUntil:'domcontentloaded' });
  await expect(page.locator('#app')).toBeVisible();
  await expect(page.locator('#loading')).toHaveCount(0, { timeout:12_000 });
  await page.waitForTimeout(250);
}

async function box(page, selector) {
  return page.locator(selector).evaluate(element => {
    const rect=element.getBoundingClientRect();
    const style=getComputedStyle(element);
    if(style.display==='none'||style.visibility==='hidden'||!rect.width||!rect.height)return null;
    return {top:rect.top,right:rect.right,bottom:rect.bottom,left:rect.left};
  });
}

async function contained(page, childSelector, parentSelector, inset=0) {
  const child=await box(page,childSelector);
  const parent=await box(page,parentSelector);
  expect(child).not.toBeNull();
  expect(parent).not.toBeNull();
  expect(child.left).toBeGreaterThanOrEqual(parent.left+inset);
  expect(child.right).toBeLessThanOrEqual(parent.right-inset);
  expect(child.top).toBeGreaterThanOrEqual(parent.top+inset);
  expect(child.bottom).toBeLessThanOrEqual(parent.bottom-inset);
}

test('desktop command panels expose their complete primary actions', async ({ page }, testInfo) => {
  test.skip(!['desktop-chromium','desktop-firefox','reduced-motion-chromium'].includes(testInfo.project.name));
  await boot(page);
  await expect(page.locator('.region-launch')).toBeVisible();
  await contained(page,'.region-launch','.atlas-panel',0);
  const atlas=await box(page,'.atlas-panel');
  const ticker=await box(page,'#surveillanceTicker');
  expect(atlas.bottom).toBeLessThanOrEqual(ticker.top-8);
  const summary=await box(page,'.realm-summary');
  const ecology=await box(page,'.ecology-layer-panel');
  expect(summary.bottom).toBeLessThanOrEqual(ecology.top-8);
});

test('mobile globe uses one compact terminal and fixed navigation', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile-'));
  await boot(page);
  await expect(page.locator('.ecology-layer-panel')).toBeHidden();
  await contained(page,'.region-launch','.atlas-panel',0);
  const nav=await page.locator('.primary-nav').evaluate(element=>{
    const style=getComputedStyle(element);const rect=element.getBoundingClientRect();
    return {position:style.position,bottom:Math.round(innerHeight-rect.bottom),height:Math.round(rect.height)};
  });
  expect(nav.position).toBe('fixed');
  expect(nav.bottom).toBe(0);
  expect(nav.height).toBeGreaterThanOrEqual(60);
  if(await page.locator('#mapFallback').isVisible()){
    const atlas=await box(page,'.atlas-panel');
    const heading=await box(page,'#mapFallback h2');
    expect(atlas.bottom).toBeLessThanOrEqual(heading.top-18);
  }
});
