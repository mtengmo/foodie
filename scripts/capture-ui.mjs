import { chromium } from 'playwright';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const base = process.env.FOODIE_REVIEW_URL || 'http://127.0.0.1:4173/';
const out = '.impeccable/review';
await mkdir(out, { recursive: true });
const manifest = JSON.parse(await readFile('public/data/manifest.json', 'utf8'));
const index = JSON.parse(await readFile(`public/${manifest.indexPath}`, 'utf8'));
const ingredients = await Promise.all([[702, 40], [150, 150], [555, 50]].map(async ([id, grams]) => {
  const summary = index.find(food => food.id === id);
  return { id: `review-${id}`, foodId: id, grams, food: JSON.parse(await readFile(`public/${summary.detailPath}`, 'utf8')) };
}));
const now = new Date().toISOString();
const recipe = { schemaVersion: 1, id: 'review-breakfast', title: 'Frukostgröt med blåbär', servings: 1, ingredients, snapshotId: manifest.snapshotId, createdAt: now, updatedAt: now };
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.goto(`${base}#/foods/702?q=havre`);
await page.getByRole('heading', { name: 'Havregryn fullkorn', exact: true }).waitFor();
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: `${out}/desktop.png`, fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForFunction(() => document.querySelector('.app.show-detail') && document.documentElement.scrollWidth <= innerWidth);
await page.screenshot({ path: `${out}/mobile.png`, fullPage: true });
await page.evaluate(async recipe => {
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open('foodie', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('recipes', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  await new Promise((resolve, reject) => {
    const transaction = db.transaction('recipes', 'readwrite');
    transaction.objectStore('recipes').put(recipe);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}, recipe);
await page.goto(`${base}#/recipes`);
await page.getByRole('textbox', { name: 'Receptets namn', exact: true }).waitFor();
await page.screenshot({ path: `${out}/recipes-mobile.png`, fullPage: true });
await page.setViewportSize({ width: 1440, height: 1000 });
await page.waitForFunction(() => !document.querySelector('.app.show-detail') && document.documentElement.scrollWidth <= innerWidth);
await page.screenshot({ path: `${out}/recipes-desktop.png`, fullPage: true });
await page.goto(`${base}#/settings`);
await page.getByRole('button', { name: 'Mörkt', exact: true }).click();
await page.screenshot({ path: `${out}/settings-dark.png`, fullPage: true });
await page.getByRole('button', { name: 'English', exact: true }).click();
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${base}#/foods/702?q=oat`);
await page.locator('.detail-topline h2').waitFor();
await page.waitForFunction(() => document.querySelector('.app.show-detail') && document.documentElement.scrollWidth <= innerWidth);
await page.locator('.macro-legend button').first().focus();
await page.screenshot({ path: `${out}/english-mobile-dark.png`, fullPage: true });
const measurements = {
  dataset: manifest.snapshotId,
  foods: index.length,
  indexGzipBytes: gzipSync(await readFile(`public/${manifest.indexPath}`)).length,
  errors,
  overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
  capturedAt: now,
  browser: browser.version(),
};
await writeFile(`${out}/measurements.json`, JSON.stringify(measurements, null, 2));
await browser.close();
console.log(JSON.stringify(measurements, null, 2));
