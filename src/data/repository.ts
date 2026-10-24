import type {DatasetManifest,FoodSummary,FoodDetail,NutrientDefinition} from '../domain/types';
const base=import.meta.env.BASE_URL;
const inflight=new Map<string,Promise<unknown>>();
function load<T>(path:string):Promise<T>{if(!inflight.has(path))inflight.set(path,fetch(base+path,path==='data/manifest.json'?{cache:'no-cache'}:undefined).then(r=>{if(!r.ok)throw Error(`Data unavailable (${r.status})`);return r.json();}).catch(e=>{inflight.delete(path);throw e;}));return inflight.get(path) as Promise<T>;}
export const foodRepository={clearCache:()=>inflight.clear(),getManifest:()=>load<DatasetManifest>('data/manifest.json'),async loadIndex(){const m=await this.getManifest();return load<FoodSummary[]>(m.indexPath);},async loadDictionary(){const m=await this.getManifest();return load<NutrientDefinition[]>(m.dictionaryPath);},async getFood(id:number){const index=await this.loadIndex();const f=index.find(f=>f.id===id);if(!f)return null;const detail=await load<FoodDetail>(f.detailPath);if(detail.id!==id)throw Error('Food identity mismatch');return detail;}};
export * from '../domain/types';
