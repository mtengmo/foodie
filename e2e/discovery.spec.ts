import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';

async function expandStarterCatalogue(page: import('@playwright/test').Page) {
  const details = page.locator('.starter-section details');
  if (!await details.evaluate(el => (el as HTMLDetailsElement).open)) await details.locator('summary').click();
}

test('nutrient explorer loads lazily, switches basis and opens a ranked food', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('./#/foods/702');
  await expect(page.getByRole('heading', { name: 'Havregryn fullkorn', exact: true })).toBeVisible();
  expect(requests.some(url => url.endsWith('/discovery.json'))).toBe(false);
  await page.getByRole('link', { name: 'Utforska', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Livsmedel efter näringsämne' })).toBeVisible();
  await expect(page.locator('.ranking-row').first()).toBeVisible();
  expect(requests.filter(url => url.endsWith('/discovery.json'))).toHaveLength(1);
  await page.getByRole('button', { name: 'Per 100 kcal', exact: true }).click();
  await expect(page.locator('.ranking-row').first().locator('strong')).toContainText('/ 100 kcal');
  await page.locator('.ranking-row a').first().click();
  await expect(page.locator('.detail-topline h2')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Protein och fiber' })).toBeVisible();
});

test('nutrient explorer reports network errors and retries successfully', async ({ page }) => {
  let requests = 0;
  await page.route('**/discovery.json', async route => {
    requests++;
    if (requests === 1) await route.fulfill({ status: 503, body: 'temporarily unavailable' });
    else await route.continue();
  });
  await page.goto('./#/discover');
  await expect(page.getByRole('alert')).toContainText('Jämförelsen kunde inte läsas in.');
  await page.getByRole('button', { name: 'Försök igen' }).click();
  await expect(page.locator('.ranking-table tbody tr').first()).toBeVisible();
  expect(requests).toBe(2);
});

test('protein and fibre explanations remain based on 100 g as portion changes', async ({ page }) => {
  await page.goto('./#/foods/325');
  await expect(page.getByRole('heading', { name: 'Broccoli' })).toBeVisible();
  const explanations = page.locator('.food-highlights');
  const before = await explanations.evaluate(el => el.textContent);
  await page.getByRole('textbox', { name: 'Mängd (gram)', exact: true }).fill('250');
  expect(await explanations.evaluate(el => el.textContent)).toBe(before);
  await expect(explanations).toContainText('per 100 g');
});

test('starter recipe preview saves instructions and nutrient snapshot for reload and export', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./#/recipes');
  await expandStarterCatalogue(page);
  await page.getByRole('button', { name: 'Visa recept' }).first().click();
  await expect(page.locator('.starter-preview').getByRole('heading', { name: 'Broccoli- och linssoppa' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => (document.activeElement as HTMLElement)?.id === 'starter-preview-title')).toBe(true);
  await expect.poll(() => page.locator('#starter-preview-title').evaluate(el => {const rect=el.getBoundingClientRect();return rect.top>=document.querySelector('.topbar')!.getBoundingClientRect().bottom-1&&rect.bottom<=innerHeight})).toBe(true);
  await expect(page.locator('.starter-preview .key-nutrients .nutrient-row').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Spara en kopia' }).click();
  await expect(page.locator('.recipe-item').first()).toContainText('Broccoli- och linssoppa');
  await expect(page.getByRole('heading', { name: 'Gör så här' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => (document.activeElement as HTMLElement)?.getAttribute('aria-label') === 'Receptets namn')).toBe(true);
  await expect(page.locator('.starter-section details')).not.toHaveAttribute('open', '');
  await expandStarterCatalogue(page);
  await page.getByRole('button', { name: 'Visa recept' }).first().click();
  await page.getByRole('button', { name: 'Spara en kopia' }).click();
  await expect(page.locator('.recipe-item')).toHaveCount(2);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Gör så här' })).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportera JSON' }).click();
  const file = await download;
  const path = test.info().outputPath('starter-recipe.json');
  await file.saveAs(path);
  const payload = JSON.parse(await readFile(path, 'utf8'));
  expect(payload.recipes).toHaveLength(2);
  expect(payload.recipes[0].id).not.toBe(payload.recipes[1].id);
  expect(payload.recipes[0].instructions.length).toBeGreaterThan(0);
  expect(payload.recipes[0].template.id).toBe('broccoli-lentil-soup');
  await expect(page.locator('.recipe-item').first()).toContainText('Broccoli- och linssoppa');
});

test('explorer and phone starter preview have no automated accessibility violations', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./#/discover');
  await expect(page.locator('.ranking-table tbody tr').first()).toBeVisible();
  const explorer = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(explorer.violations.map(v => v.id)).toEqual([]);
  await page.goto('./#/recipes');
  await expandStarterCatalogue(page);
  await page.getByRole('button', { name: 'Visa recept' }).first().click();
  await expect(page.locator('.starter-preview')).toBeVisible();
  const recipe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(recipe.violations.map(v => v.id)).toEqual([]);
});

test('four-link navigation fits at 320px in English dark theme', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('./#/settings');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'Explore', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Foods by nutrient' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
