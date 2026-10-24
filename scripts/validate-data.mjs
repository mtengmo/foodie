import {readFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {checksum,discoveryNutrients,generateDiscoveryRankings} from './discovery-rankings.mjs';

const read=path=>readFile(`public/${path}`,'utf8');
const manifest=JSON.parse(await read(process.argv[2]||'data/manifest.json'));
const indexText=await read(manifest.indexPath);
const index=JSON.parse(indexText);
const dictionaryText=await read(manifest.dictionaryPath);
const dictionary=JSON.parse(dictionaryText);
if(index.length!==manifest.counts.sv||index.length!==manifest.counts.en||new Set(index.map(food=>food.id)).size!==index.length)throw Error('Incomplete index');
if(checksum(indexText)!==manifest.checksums.index)throw Error('Index checksum failed');
if(checksum(dictionaryText)!==manifest.checksums.dictionary)throw Error('Dictionary checksum failed');
const keys=new Set(dictionary.map(definition=>definition.key));
for(const [key,unit] of discoveryNutrients){
  if(!dictionary.some(definition=>definition.key===key&&definition.unit===unit&&definition.basis==='per100g'))throw Error(`Discovery identity missing: ${key}`);
}
let detailBytes=0;
const details=[];
for(const food of index){
  const text=await read(food.detailPath);
  const detail=JSON.parse(text);
  detailBytes+=Buffer.byteLength(text);
  if(detail.id!==food.id||detail.snapshotId!==manifest.snapshotId||!food.names.sv||!food.names.en||new Set(detail.nutrients.map(row=>row.key)).size!==detail.nutrients.length)throw Error(`Invalid food ${food.id}`);
  for(const row of detail.nutrients)if(!keys.has(row.key)||(row.value!==null&&(!Number.isFinite(row.value)||row.value<0)))throw Error(`Invalid nutrient ${food.id}`);
  details.push(detail);
}
if(manifest.discoveryPath!==`data/${manifest.snapshotId}/discovery.json`)throw Error('Discovery path mismatch');
const discoveryText=await read(manifest.discoveryPath);
if(checksum(discoveryText)!==manifest.checksums.discovery)throw Error('Discovery checksum failed');
if(discoveryText!==JSON.stringify(generateDiscoveryRankings(manifest.snapshotId,details)))throw Error('Discovery rankings do not match snapshot');
const discoveryGzipBytes=gzipSync(discoveryText).length;
if(discoveryGzipBytes>200_000)throw Error('Discovery transfer budget exceeded');
console.log(JSON.stringify({snapshot:manifest.snapshotId,foods:index.length,nutrientIdentities:dictionary.length,indexBytes:Buffer.byteLength(indexText),indexGzipBytes:gzipSync(indexText).length,detailBytes,discoveryBytes:Buffer.byteLength(discoveryText),discoveryGzipBytes},null,2));
