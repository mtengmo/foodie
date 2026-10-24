import {describe,expect,it} from 'vitest';
import {assessNutrientHighlight} from '../src/domain/discovery';
import type {NutrientValue} from '../src/domain/types';

const row=(key:string,value:number|null,status:'known'|'unknown'='known'):NutrientValue=>({key,value,status,qualifiers:{}});
const food=(protein:number|null,fibre:number|null,energy:number|null)=>({nutrients:[
  row('PROT|g|per100g',protein,protein===null?'unknown':'known'),
  row('FIBT|g|per100g',fibre,fibre===null?'unknown':'known'),
  row('ENERC|kcal|per100g',energy,energy===null?'unknown':'known'),
]});

describe('nutrient highlight thresholds',()=>{
  it('uses source kcal and unrounded 12%/20% protein boundaries',()=>{
    expect(assessNutrientHighlight(food(3,0,100),'protein')).toMatchObject({level:'source',proteinEnergyPercent:12});
    expect(assessNutrientHighlight(food(5,0,100),'protein')).toMatchObject({level:'high',proteinEnergyPercent:20});
    expect(assessNutrientHighlight(food(2.999,0,100),'protein').level).toBe('none');
    expect(assessNutrientHighlight(food(4.999,0,100),'protein').level).toBe('source');
  });
  it('requires positive known source kcal and the exact per-100-g protein identity',()=>{
    expect(assessNutrientHighlight(food(8,0,0),'protein').level).toBe('unassessed');
    expect(assessNutrientHighlight(food(8,0,null),'protein').level).toBe('unassessed');
    expect(assessNutrientHighlight({nutrients:[row('PROT|g|source:W:100',8),row('ENERC|kJ|per100g',100)]},'protein').level).toBe('unassessed');
  });
  it('accepts either fibre mass or energy-density branch and distinguishes unknown',()=>{
    expect(assessNutrientHighlight(food(0,3,null),'fibre').level).toBe('source');
    expect(assessNutrientHighlight(food(0,6,null),'fibre').level).toBe('high');
    expect(assessNutrientHighlight(food(0,1.5,100),'fibre').level).toBe('source');
    expect(assessNutrientHighlight(food(0,3,100),'fibre').level).toBe('high');
    expect(assessNutrientHighlight(food(0,2.999,100),'fibre').level).toBe('source');
    expect(assessNutrientHighlight(food(0,1.5,null),'fibre').level).toBe('unassessed');
    expect(assessNutrientHighlight(food(0,null,100),'fibre').level).toBe('unassessed');
    expect(assessNutrientHighlight(food(0,0,null),'fibre').level).toBe('none');
    expect(assessNutrientHighlight(food(0,-1,100),'fibre').level).toBe('unassessed');
  });
});
