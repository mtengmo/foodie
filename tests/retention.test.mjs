import {it,expect} from 'vitest';
import {mkdtemp,mkdir,writeFile,readdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {pruneSnapshots} from '../scripts/snapshot-retention.mjs';
const hash=t=>createHash('sha256').update(t).digest('hex');
it('retains current plus latest complete prior and never prunes unmarked folders',async()=>{
 const root=await mkdtemp(join(tmpdir(),'foodie-retention-'));
 try{
  for(const name of ['2026-01-01','2026-02-01T05-00-00-000Z','2026-03-01']){
   await mkdir(join(root,name));await writeFile(join(root,name,'index.json'),'[]');await writeFile(join(root,name,'nutrients.json'),'[]');
   await writeFile(join(root,name,'snapshot.json'),JSON.stringify({schemaVersion:1,snapshotId:name,indexPath:`data/${name}/index.json`,dictionaryPath:`data/${name}/nutrients.json`,checksums:{index:hash('[]'),dictionary:hash('[]')}}));
  }
  await mkdir(join(root,'2025-01-01'));await mkdir(join(root,'unrelated'));
  expect(await pruneSnapshots(root,'2026-03-01')).toEqual(['2026-01-01']);
  expect((await readdir(root)).sort()).toEqual(['2025-01-01','2026-02-01T05-00-00-000Z','2026-03-01','unrelated']);
  await expect(pruneSnapshots(root,'../elsewhere')).rejects.toThrow();
 }finally{if(relative(resolve(tmpdir()),resolve(root)).startsWith('foodie-retention-'))await rm(root,{recursive:true});}
});
