export type UpdateStatus='checking'|'current'|'available'|'offline'|'error';
export interface VersionManifest {version:string}
export function parseVersionManifest(value:unknown):VersionManifest {if(!value||typeof value!=='object'||!('version' in value)||typeof value.version!=='string'||!value.version.trim()||value.version.length>200)throw Error('Invalid version manifest');return {version:value.version};}
export async function fetchAppVersion(base:string,fetcher:typeof fetch=fetch,now=Date.now()):Promise<VersionManifest>{const response=await fetcher(`${base}version.json?check=${now}`,{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error(`Version request failed (${response.status})`);return parseVersionManifest(await response.json());}
export function compareVersion(current:string,manifest:VersionManifest):'current'|'available' {return current===manifest.version?'current':'available';}
