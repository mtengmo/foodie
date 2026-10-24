import {readdir,readFile,realpath,rm} from 'node:fs/promises';
import {resolve,relative,isAbsolute} from 'node:path';
import {createHash} from 'node:crypto';
const snapshotName=/^\d{4}-\d{2}-\d{2}(?:T\d{2}-\d{2}-\d{2}-\d{3}Z)?$/;
const hash=text=>createHash('sha256').update(text).digest('hex');
function strictlyInside(root,path){const rel=relative(root,path);return rel!==''&&!rel.startsWith('..')&&!isAbsolute(rel);}
/** Only snapshots carrying the post-validation manifest marker are eligible. */
export async function pruneSnapshots(dataDirectory,currentSnapshot,keep=2){
  if(!snapshotName.test(currentSnapshot)||!Number.isInteger(keep)||keep<2)throw Error('Invalid snapshot retention');
  const root=await realpath(resolve(dataDirectory));
  try{const published=JSON.parse(await readFile(resolve(root,'manifest.json'),'utf8'));if(published.snapshotId!==currentSnapshot||published.indexPath!=='data/'+currentSnapshot+'/index.json'||published.dictionaryPath!=='data/'+currentSnapshot+'/nutrients.json'||published.discoveryPath&&published.discoveryPath!=='data/'+currentSnapshot+'/discovery.json')throw Error('Published snapshot identity mismatch');}catch(error){if(error.code!=='ENOENT')throw error;}
  const complete=[];
  for(const entry of await readdir(root,{withFileTypes:true})){
    if(!entry.isDirectory()||entry.isSymbolicLink()||!snapshotName.test(entry.name))continue;
    const target=await realpath(resolve(root,entry.name));
    if(!strictlyInside(root,target)||target!==resolve(root,entry.name))continue;
    try{
      const manifest=JSON.parse(await readFile(resolve(target,'snapshot.json'),'utf8'));
      if(manifest.schemaVersion!==1||manifest.snapshotId!==entry.name||manifest.indexPath!==`data/${entry.name}/index.json`||manifest.dictionaryPath!==`data/${entry.name}/nutrients.json`||manifest.discoveryPath&&manifest.discoveryPath!==`data/${entry.name}/discovery.json`)continue;
      const index=await readFile(resolve(target,'index.json'),'utf8');
      const dictionary=await readFile(resolve(target,'nutrients.json'),'utf8');
      if(hash(index)!==manifest.checksums?.index||hash(dictionary)!==manifest.checksums?.dictionary)continue;
      if(manifest.discoveryPath&&hash(await readFile(resolve(target,'discovery.json'),'utf8'))!==manifest.checksums?.discovery)continue;
      complete.push({name:entry.name,target});
    }catch{/* Unvalidated or unrelated folders are never deletion candidates. */}
  }
  if(!complete.some(s=>s.name===currentSnapshot))throw Error('Current snapshot is not validated');
  const retained=new Set([currentSnapshot,...complete.filter(s=>s.name!==currentSnapshot).sort((a,b)=>b.name.localeCompare(a.name)).slice(0,keep-1).map(s=>s.name)]);
  const removed=[];
  for(const snapshot of complete){
    if(retained.has(snapshot.name))continue;
    // Re-resolve immediately before deletion, guarding against links and path changes.
    const checked=await realpath(snapshot.target);
    if(checked!==snapshot.target||!strictlyInside(root,checked)||snapshot.name===currentSnapshot)throw Error('Unsafe snapshot deletion target');
    await rm(checked,{recursive:true});
    removed.push(snapshot.name);
  }
  return removed;
}
