import {afterEach,describe,expect,it,vi} from 'vitest';
import {clearDiscoveryCache,DISCOVERY_NUTRIENTS,loadDiscoveryRankings} from '../src/data/discovery';
import type {DiscoveryRankings} from '../src/data/discovery';
import type {DatasetManifest} from '../src/domain/types';

const manifest={snapshotId:'snapshot-a',discoveryPath:'data/snapshot-a/discovery.json'} as DatasetManifest;
const asset=(snapshotId:string):DiscoveryRankings=>({schemaVersion:1,snapshotId,ruleVersion:'2026-10-24-v1',nutrients:DISCOVERY_NUTRIENTS.map(({key,unit})=>({key,unit,per100g:{eligible:0,top:[]},per100kcal:{eligible:0,top:[]}}))});
afterEach(()=>{clearDiscoveryCache();vi.unstubAllGlobals();});

describe('discovery asset loading',()=>{
  it('rejects a stale asset and retries a subsequent request',async()=>{
    const fetch=vi.fn()
      .mockResolvedValueOnce({ok:true,json:async()=>asset('snapshot-b')})
      .mockResolvedValueOnce({ok:true,json:async()=>asset('snapshot-a')});
    vi.stubGlobal('fetch',fetch);
    await expect(loadDiscoveryRankings(manifest)).rejects.toThrow('Discovery snapshot mismatch');
    await expect(loadDiscoveryRankings(manifest)).resolves.toMatchObject({snapshotId:'snapshot-a'});
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[0][0]).toContain('data/snapshot-a/discovery.json');
  });
  it('rejects malformed ranking rows',async()=>{
    const malformed=asset('snapshot-a');
    malformed.nutrients[0].per100g={eligible:1,top:[{id:1,value:-1}]};
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>malformed}));
    await expect(loadDiscoveryRankings(manifest)).rejects.toThrow('Discovery snapshot mismatch');
  });
  it('loads once for a snapshot and retries after a network failure',async()=>{
    const fetch=vi.fn()
      .mockRejectedValueOnce(Error('offline'))
      .mockResolvedValueOnce({ok:true,json:async()=>asset('snapshot-a')});
    vi.stubGlobal('fetch',fetch);
    await expect(loadDiscoveryRankings(manifest)).rejects.toThrow('offline');
    const first=loadDiscoveryRankings(manifest);
    expect(loadDiscoveryRankings(manifest)).toBe(first);
    await expect(first).resolves.toMatchObject({snapshotId:'snapshot-a'});
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('rejects a path outside the manifest snapshot and an outdated rule version',async()=>{
    const fetch=vi.fn().mockResolvedValue({ok:true,json:async()=>({...asset('snapshot-a'),ruleVersion:'old'})});
    vi.stubGlobal('fetch',fetch);
    await expect(loadDiscoveryRankings({...manifest,discoveryPath:'data/other/discovery.json'})).rejects.toThrow('Discovery path mismatch');
    expect(fetch).toHaveBeenCalledTimes(0);
    await expect(loadDiscoveryRankings(manifest)).rejects.toThrow('Discovery snapshot mismatch');
  });
});
