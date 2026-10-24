import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('real food values scale correctly and survive language and theme changes', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('./#/foods/1');
  await expect(page.getByRole('heading', { name: 'Nöt talg', exact: true })).toBeVisible();
  const nutrients = page.locator('.detail-panel .key-nutrients').first();
  await expect(nutrients).toContainText('884');
  await expect(nutrients).toContainText('3 700'.replace(' ', ' '));
  await page.getByRole('textbox', { name: 'Mängd (gram)', exact: true }).fill('150');
  await expect(nutrients).toContainText('1 326');
  await expect(nutrients).toContainText('5 550');
  await page.getByRole('link', { name: 'Inställningar', exact: true }).click();
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Beef tallow', exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Amount (grams)', exact: true })).toHaveValue('150');
  await expect(page.locator('.data-note').first()).toContainText('CC BY');
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'Amount (grams)', exact: true })).toHaveValue('150');
  expect(errors).toEqual([]);
});

test('bilingual local search, no matches, favourites and missing foods', async ({ page }) => {
  await page.goto('./');
  const search = page.getByRole('searchbox', { name: 'Sök bland livsmedel' });
  await search.fill('beef tallow');
  await page.getByRole('button', { name: /Nöt talg/ }).click();
  await expect(page.getByRole('heading', { name: 'Nöt talg', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Lägg till favorit', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Ta bort favorit', exact: true })).toBeVisible();
  await search.fill('zzzznonexistentfood');
  await expect(page.getByText('Inga livsmedel hittades', { exact: true })).toBeVisible();
  await page.goto('./#/foods/99999999');
  await expect(page.getByText('Livsmedlet finns inte längre i datan.', { exact: true })).toBeVisible();
});

test('recipe calculation, local persistence, export and safe import', async ({ page }) => {
  await page.goto('./#/recipes');
  await page.getByRole('button', { name: 'Nytt recept', exact: true }).click();
  const name = page.getByRole('textbox', { name: 'Receptets namn', exact: true });
  await name.fill('E2E testrecept');
  await name.blur();
  await page.getByRole('button', { name: 'Lägg till ingrediens', exact: true }).click();
  await page.getByRole('textbox', { name: 'Lägg till ingrediens', exact: true }).fill('Nöt talg');
  await page.getByRole('button', { name: /Nöt talg/ }).click();
  const quantity = page.getByRole('textbox', { name: 'Nöt talg (gram)', exact: true });
  await quantity.fill('150,5');
  await quantity.blur();
  await page.getByRole('button', { name: 'Per portion', exact: true }).click();
  await expect(page.locator('.recipe-summary')).toContainText('665,2');
  await expect(page.locator('.recipe-summary')).toContainText('75,3');
  await page.reload();
  await expect(name).toHaveValue('E2E testrecept');
  await expect(quantity).toHaveValue(/150[.,]5/);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportera JSON', exact: true }).click();
  const file = await download;
  const savedPath = test.info().outputPath('foodie-recipes.json');
  await file.saveAs(savedPath);
  const payload = JSON.parse(await readFile(savedPath, 'utf8'));
  expect(payload.recipes).toHaveLength(1);
  expect(payload.recipes[0].ingredients[0].grams).toBe(150.5);
  await page.locator('input[type=file]').setInputFiles(savedPath);
  await page.getByRole('button', { name: 'Importera som kopia', exact: true }).click();
  await expect(page.locator('.recipe-item')).toHaveCount(2);
  await page.locator('input[type=file]').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{"schemaVersion":77,"recipes":[]}') });
  await expect(page.getByText(/Filen är för stor eller innehåller ogiltiga recept/)).toBeVisible();
  await page.reload();
  await expect(page.locator('.recipe-item')).toHaveCount(2);
});

test('phone food and recipe screens remain usable without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./#/foods/1');
  await expect(page.getByRole('heading', { name: 'Nöt talg', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Till sökningen', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'Recept', exact: true }).click();
  await page.getByRole('button', { name: 'Nytt recept', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Receptets namn', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Lägg till ingrediens', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('lookup works when device persistence is denied', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('Denied', 'SecurityError'); }; });
  await page.goto('./#/foods/1');
  await expect(page.getByRole('heading', { name: 'Nöt talg', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Lägg till favorit', exact: true }).click();
  await expect(page.locator('.detail-panel .key-nutrients').first()).toContainText('884');
});

test('all search matches are reachable and macro selection works from the keyboard', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('searchbox', { name: 'Sök bland livsmedel' }).fill('havre');
  await expect(page.locator('.search-panel .food-row')).toHaveCount(30);
  await page.getByRole('button', { name: /Visa fler/ }).click();
  expect(await page.locator('.search-panel .food-row').count()).toBeGreaterThan(30);
  await page.locator('.search-panel .food-row').nth(35).click();
  await expect(page.locator('.detail-topline h2')).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('searchbox', { name: 'Sök bland livsmedel' })).toHaveValue('havre');
  await page.goto('./#/foods/702');
  const legends = page.locator('.macro-legend button');
  await expect(legends).toHaveCount(3);
  await legends.first().focus();
  await page.keyboard.press('Space');
  await expect(legends.first()).toHaveAttribute('aria-pressed', 'true');
  await expect(legends.nth(1)).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('.donut-piece').first()).toHaveCSS('stroke-width', '16px');
});

test('system appearance follows the device until a manual theme is chosen', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('./#/settings');
  await page.getByRole('button', { name: 'Följ enheten', exact: true }).click();
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Ljust', exact: true }).click();
  await page.emulateMedia({ colorScheme: 'light' });
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
