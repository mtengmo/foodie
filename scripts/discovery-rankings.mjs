import {createHash} from 'node:crypto';

export const discoveryRuleVersion='2026-10-24-v1';
export const discoveryNutrients=[
  ['PROT|g|per100g','g'],['FIBT|g|per100g','g'],['VITC|mg|per100g','mg'],
  ['FE|mg|per100g','mg'],['CA|mg|per100g','mg'],['VITD|µg|per100g','µg'],
  ['VITB12|µg|per100g','µg'],['K|mg|per100g','mg'],['MG|mg|per100g','mg'],
  ['ZN|mg|per100g','mg'],
];
const energyKey='ENERC|kcal|per100g';
const valid=row=>row?.status==='known'&&typeof row.value==='number'&&Number.isFinite(row.value)&&row.value>=0;
const rank=rows=>({eligible:rows.length,top:rows.sort((a,b)=>b.value-a.value||a.id-b.id).slice(0,100)});
export function generateDiscoveryRankings(snapshotId,foods){
  return {schemaVersion:1,snapshotId,ruleVersion:discoveryRuleVersion,nutrients:discoveryNutrients.map(([key,unit])=>{
    const byMass=[],byEnergy=[];
    for(const food of foods){
      const values=new Map(food.nutrients.map(row=>[row.key,row]));
      const nutrient=values.get(key),energy=values.get(energyKey);
      if(!valid(nutrient))continue;
      byMass.push({id:food.id,value:nutrient.value});
      if(valid(energy)&&energy.value>0)byEnergy.push({id:food.id,value:nutrient.value*100/energy.value});
    }
    return {key,unit,per100g:rank(byMass),per100kcal:rank(byEnergy)};
  })};
}
export const checksum=text=>createHash('sha256').update(text).digest('hex');
