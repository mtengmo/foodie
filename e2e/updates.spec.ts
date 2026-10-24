import { test, expect } from '@playwright/test';

test('a newer deployment is offered without automatically reloading or changing the route', async ({ page }) => {
  await page.goto('./#/foods/702?g=150');
  await expect(page.getByRole('heading', { name: 'Havregryn fullkorn', exact: true })).toBeVisible();
  await page.route('**/version.json?*', route => route.fulfill({ json: { version: 'new-build-test' } }));
  await page.getByRole('link', { name: 'Inställningar', exact: true }).click();
  await page.getByRole('button', { name: 'Kontrollera uppdateringar', exact: true }).click();
  await expect(page.getByText('Ny version finns', { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/#\/settings$/);
  const navigation = page.waitForEvent('load');
  await page.locator('.update-banner').getByRole('button', { name: 'Uppdatera', exact: true }).click();
  await navigation;
  await expect(page).toHaveURL(/#\/settings$/);
});

test('failed recipe saves block an app-update reload', async ({ page }) => {
  await page.addInitScript(() => {
    IDBObjectStore.prototype.put = () => { throw new DOMException('Storage full', 'QuotaExceededError'); };
  });
  await page.route('**/version.json?*', route => route.fulfill({ json: { version: 'new-build-test' } }));
  await page.goto('./#/recipes');
  await page.getByRole('button', { name: 'Nytt recept', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Receptets namn', exact: true })).toBeVisible();
  await expect(page.getByText(/Kunde inte spara lokalt/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Uppdatera', exact: true })).toBeDisabled();
});
