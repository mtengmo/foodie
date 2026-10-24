import {describe,expect,it} from 'vitest';
import {generateDiscoveryRankings} from '../scripts/discovery-rankings.mjs';
import type {RankingFoodInput} from '../scripts/discovery-rankings.mjs';

const food=(id:number,protein:number|null,energy:number|null,key='PROT|g|per100g'):RankingFoodInput=>({id,nutrients:[
  {key,value:protein,status:protein===null?'unknown':'known'},
  {key:'ENERC|kcal|per100g',value:energy,status:energy===null?'unknown':'known'},
]});

describe('snapshot rankings',()=>{
  it('sorts by unrounded value, uses food ID for ties, and excludes missing values and zero kcal',()=>{
    const asset=generateDiscoveryRankings('snapshot',[food(3,10,200),food(2,10,100),food(1,null,100),food(4,20,0)]);
    const protein=asset.nutrients.find((ranking:{key:string})=>ranking.key==='PROT|g|per100g');
    expect(protein?.per100g).toEqual({eligible:3,top:[{id:4,value:20},{id:2,value:10},{id:3,value:10}]});
    expect(protein?.per100kcal).toEqual({eligible:2,top:[{id:2,value:10},{id:3,value:5}]});
    expect(asset.snapshotId).toBe('snapshot');
  });
  it('selects top 100 after evaluating the entire eligible catalogue',()=>{
    const asset=generateDiscoveryRankings('snapshot',Array.from({length:101},(_,index)=>food(index+1,index+1,100)));
    const top=asset.nutrients.find(ranking=>ranking.key==='PROT|g|per100g')!.per100g;
    expect(top.eligible).toBe(101);
    expect(top.top).toHaveLength(100);
    expect(top.top[0].id).toBe(101);
    expect(top.top.at(-1)?.id).toBe(2);
  });
});
