import {describe,it,expect,vi} from 'vitest';
import {parseVersionManifest,compareVersion,fetchAppVersion} from '../src/update/client';
import {applyUpdate,beginPendingWrite,setUpdateUnsafe,updateIsUnsafe} from '../src/update/safety';
describe('build version manifests',()=>{
 it('compares opaque versions without treating older timestamps specially',()=>{expect(compareVersion('same',{version:'same'})).toBe('current');expect(compareVersion('build-a',{version:'build-b'})).toBe('available');});
 it('rejects malformed responses',()=>{for(const value of [null,{},'',{version:''},{version:12},{version:'x'.repeat(201)}])expect(()=>parseVersionManifest(value)).toThrow();});
 it('bypasses caches with a unique query and rejects failed HTTP responses',async()=>{const fetcher=vi.fn().mockResolvedValue(new Response(JSON.stringify({version:'next'})));expect(await fetchAppVersion('/',fetcher,123)).toEqual({version:'next'});expect(fetcher.mock.calls[0][0]).toBe('/version.json?check=123');expect(fetcher.mock.calls[0][1].cache).toBe('no-store');await expect(fetchAppVersion('/',vi.fn().mockResolvedValue(new Response('',{status:503})))).rejects.toThrow('503');await expect(fetchAppVersion('/',vi.fn().mockRejectedValue(Error('Network unavailable')))).rejects.toThrow('Network unavailable');});
});
describe('explicit safe update application',()=>{
 it('never reloads without an available version or while fields/writes are pending',()=>{const reload=vi.fn();expect(applyUpdate(false,false,reload)).toBe(false);expect(applyUpdate(true,true,reload)).toBe(false);setUpdateUnsafe('test-field',true);expect(applyUpdate(true,false,reload)).toBe(false);setUpdateUnsafe('test-field',false);const done=beginPendingWrite();expect(applyUpdate(true,false,reload)).toBe(false);done();done();expect(updateIsUnsafe()).toBe(false);expect(applyUpdate(true,false,reload)).toBe(true);expect(reload).toHaveBeenCalledTimes(1);});
});
