import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';

const base=process.env.FOODIE_REVIEW_URL||'http://127.0.0.1:4173/';
const out='.impeccable/review/discovery';
const recipesOnly=process.env.FOODIE_REVIEW_RECIPES_ONLY==='1';
await mkdir(out,{recursive:true});
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const errors=[];const captures=[];
page.on('pageerror',error=>errors.push(error.message));
async function capture(name){
  await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>scrollTo(0,0));
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  await page.screenshot({path:`${out}/${name}.png`,fullPage:true});
  captures.push({name,overflow,viewport:page.viewportSize()});
}
if(!recipesOnly){
await page.goto(`${base}#/discover`);
await page.locator('.ranking-row').first().waitFor();
await capture('explorer-desktop');
await page.setViewportSize({width:390,height:844});
await capture('explorer-mobile');
await page.goto(`${base}#/foods/325`);
await page.locator('.food-highlights').waitFor();
for(const details of await page.locator('.food-highlights details').all())await details.locator('summary').click();
await capture('broccoli-mobile');
}
await page.setViewportSize({width:390,height:844});
await page.goto(`${base}#/recipes`);
await page.getByRole('button',{name:'Visa recept',exact:true}).first().click();
await page.locator('.starter-preview').waitFor();
await capture('starter-mobile');
await page.setViewportSize({width:1440,height:1000});
await capture('starter-desktop');
await page.getByRole('button',{name:'Spara en kopia',exact:true}).click();
await page.locator('.recipe-editor .recipe-instructions').waitFor();
await capture('saved-desktop');
await page.goto(`${base}#/settings`);
await page.getByRole('button',{name:'English',exact:true}).click();
await page.getByRole('button',{name:'Mörkt',exact:true}).or(page.getByRole('button',{name:'Dark',exact:true})).click();
await page.setViewportSize({width:320,height:740});
if(!recipesOnly){
await page.goto(`${base}#/discover`);
await page.locator('.ranking-row').first().waitFor();
await capture('explorer-english-dark-320');
}
await page.goto(`${base}#/recipes`);
await page.locator('.recipe-item').first().waitFor();
const catalogue=page.locator('.starter-section details');
if(!await catalogue.evaluate(el=>el.open))await catalogue.locator('summary').click();
await page.getByRole('button',{name:'View recipe',exact:true}).first().click();
await page.locator('.starter-preview').waitFor();
await capture('starter-english-dark-320');
await writeFile(`${out}/${recipesOnly?'measurements-recipes':'measurements'}.json`,JSON.stringify({capturedAt:new Date().toISOString(),browser:browser.version(),errors,captures},null,2));
await browser.close();
console.log(JSON.stringify({errors,captures},null,2));
