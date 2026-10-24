import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('food detail and settings meet automated WCAG checks in both appearances', async ({ page }) => {
  await page.goto('./#/foods/702');
  await expect(page.getByRole('heading', { name: 'Havregryn fullkorn', exact: true })).toBeVisible();
  const light = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(light.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
  await page.getByRole('link', { name: 'Inställningar', exact: true }).click();
  await page.getByRole('button', { name: 'Mörkt', exact: true }).click();
  const dark = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(dark.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
  await page.getByRole('button', { name: 'Skog', exact: true }).click();
  const forest = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(forest.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./#/foods/702');
  await expect(page.getByRole('link', { name: 'Till sökningen', exact: true })).toBeVisible();
  const darkFood = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(darkFood.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
});

test('recipe controls are accessible at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./#/recipes');
  await page.getByRole('button', { name: 'Nytt recept', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Receptets namn', exact: true })).toBeVisible();
  const recipe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(recipe.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
});
