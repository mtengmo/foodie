import {afterEach,describe,expect,it,vi} from 'vitest';
import {readFile} from 'node:fs/promises';
import {starterRecipes,createStarterRecipe} from '../src/data/starter-recipes';
import {foodRepository} from '../src/data/repository';
import {calculateRecipe} from '../src/domain';
import {exportRecipes,parseRecipeImport,validateRecipe} from '../src/storage/recipes';
import type {DatasetManifest,FoodDetail,FoodSummary} from '../src/domain/types';

const readJson=async(path:string)=>JSON.parse(await readFile(path,'utf8'));
const manifest:DatasetManifest=await readJson('public/data/manifest.json');
const index:FoodSummary[]=await readJson(`public/${manifest.indexPath}`);
afterEach(()=>vi.restoreAllMocks());
function useSnapshot(){
  vi.spyOn(foodRepository,'getManifest').mockResolvedValue(manifest);
  return vi.spyOn(foodRepository,'getFood').mockImplementation(async id=>{
    const food=index.find(f=>f.id===id);
    return food?await readJson(`public/${food.detailPath}`) as FoodDetail:null;
  });
}

describe('starter recipe catalogue',()=>{
  it('maps every bilingual recipe to actual edible-state records and produces complete macro estimates',async()=>{
    useSnapshot();
    expect(starterRecipes).toHaveLength(6);
    expect(new Set(starterRecipes.map(t=>t.id)).size).toBe(starterRecipes.length);
    for(const template of starterRecipes){
      for(const locale of ['sv','en'] as const){
        expect(template.title[locale].length).toBeGreaterThan(0);
        expect(template.instructions[locale].length).toBeGreaterThan(1);
        const recipe=await createStarterRecipe(template,locale);
        expect(recipe.instructions).toEqual(template.instructions[locale]);
        expect(recipe.title).toBe(template.title[locale]);
        expect(recipe.ingredients.every(i=>i.food.snapshotId===manifest.snapshotId&&i.grams>0)).toBe(true);
        for(const key of ['PROT|g|per100g','CHO|g|per100g','FAT|g|per100g','ENERC|kcal|per100g']){
          expect(calculateRecipe(recipe,'serving').find(n=>n.key===key)).toMatchObject({complete:true});
        }
      }
    }
  });
  it('creates independent frozen copies and roundtrips instructions with legacy v1 records',async()=>{
    useSnapshot();
    const template=starterRecipes[0];
    const first=await createStarterRecipe(template,'sv');
    const second=await createStarterRecipe(template,'sv');
    expect(second.id).not.toBe(first.id);
    expect(second.ingredients[0].id).not.toBe(first.ingredients[0].id);
    first.instructions![0]='My own instructions';
    first.ingredients[0].food.names.sv='My own food label';
    expect(second.instructions).toEqual(template.instructions.sv);
    expect(second.ingredients[0].food.names.sv).toBe('Broccoli');
    const legacy={...second};delete legacy.instructions;delete legacy.template;
    expect(parseRecipeImport(exportRecipes([first,legacy]))).toEqual([first,legacy]);
  });
  it('rejects missing or mismatched ingredients instead of saving a partial recipe',async()=>{
    const getFood=useSnapshot();
    getFood.mockResolvedValue(null);
    await expect(createStarterRecipe(starterRecipes[0],'en')).rejects.toThrow('unavailable');
    const food:FoodDetail=await readJson(`public/${index.find(f=>f.id===325)!.detailPath}`);
    getFood.mockResolvedValue({...food,snapshotId:'different'});
    await expect(createStarterRecipe(starterRecipes[0],'en')).rejects.toThrow('unavailable');
  });
  it('rejects malformed optional instructions and provenance while accepting old files',async()=>{
    useSnapshot();const recipe=await createStarterRecipe(starterRecipes[0],'sv');
    expect(()=>validateRecipe({...recipe,instructions:'not an array'})).toThrow('instructions');
    expect(()=>validateRecipe({...recipe,instructions:['x'.repeat(5001)]})).toThrow('instructions');
    expect(()=>validateRecipe({...recipe,template:{id:'x',revision:0,locale:'sv'}})).toThrow('template');
    expect(()=>validateRecipe({...recipe,template:{id:'x',revision:1,locale:'de'}})).toThrow('template');
  });
});
