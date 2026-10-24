import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';

test('requested meals and Wikibooks recipes retain attribution through save and export',async({page})=>{
  await page.goto('./#/recipes');
  await expect(page.locator('.starter-item')).toHaveCount(12);
  for(const title of ['Korvstroganoff med ris','Entrecôte med rostad sötpotatis','Rostad sötpotatis']){
    const item=page.locator('.starter-item').filter({has:page.getByRole('heading',{name:title,exact:true})});
    await item.getByRole('button',{name:'Visa recept',exact:true}).click();
    await expect(page.locator('#starter-preview-title')).toHaveText(title);
    await expect(page.locator('.starter-preview .key-nutrients')).toContainText('kcal');
    await expect(page.locator('.starter-preview .recipe-attribution')).toContainText('CC0');
    await page.getByRole('button',{name:'Stäng förhandsvisning',exact:true}).click();
  }
  const imported=page.locator('.starter-item').filter({has:page.getByRole('heading',{name:'Grekisk sallad',exact:true})});
  await imported.getByRole('button',{name:'Visa recept',exact:true}).click();
  const credit=page.locator('.starter-preview .recipe-attribution');
  await expect(credit.getByRole('link',{name:'CC BY-SA 4.0',exact:true})).toHaveAttribute('href','https://creativecommons.org/licenses/by-sa/4.0/');
  await expect(credit.getByRole('link',{name:'Cookbook:Greek Salad'})).toHaveAttribute('href',/oldid=4518144/);
  await expect(credit).toContainText('Wikibooks contributors');
  await page.getByRole('button',{name:'Spara en kopia',exact:true}).click();
  await page.reload();
  await expect(page.locator('.recipe-editor .recipe-attribution')).toContainText('CC BY-SA 4.0');
  const downloading=page.waitForEvent('download');
  await page.getByRole('button',{name:'Exportera JSON',exact:true}).click();
  const download=await downloading;const path=test.info().outputPath('licensed-recipes.json');await download.saveAs(path);
  const payload=JSON.parse(await readFile(path,'utf8'));
  expect(payload.recipes[0].template).toMatchObject({license:'CC-BY-SA-4.0',source:{title:'Cookbook:Greek Salad',authors:'Wikibooks contributors'}});
});

test('imported recipe credits fit a narrow English dark screen and pass accessibility checks',async({page})=>{
  await page.setViewportSize({width:320,height:740});
  await page.goto('./#/settings');
  await page.getByRole('button',{name:'English',exact:true}).click();
  await page.getByRole('button',{name:'Dark',exact:true}).click();
  await page.getByRole('link',{name:'Recipes',exact:true}).click();
  await page.locator('.starter-item').filter({has:page.getByRole('heading',{name:'Hummus with tahini',exact:true})}).getByRole('button',{name:'View recipe',exact:true}).click();
  await expect(page.locator('.starter-preview .recipe-attribution')).toContainText('Translated and adapted by Foodie');
  await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(result.violations.map(v=>v.id)).toEqual([]);
});
