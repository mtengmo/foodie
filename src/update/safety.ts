const unsafeReasons=new Set<string>();
let pendingWrites=0;
const listeners=new Set<()=>void>();
const changed=()=>listeners.forEach(fn=>fn());
export function subscribeUpdateSafety(fn:()=>void):()=>void {listeners.add(fn);return ()=>{listeners.delete(fn);};}
export function setUpdateUnsafe(key:string,unsafe:boolean):void {if(unsafe)unsafeReasons.add(key);else unsafeReasons.delete(key);changed();}
export function beginPendingWrite():()=>void {pendingWrites++;changed();let complete=false;return ()=>{if(!complete){complete=true;pendingWrites--;changed();}};}
export function updateIsUnsafe():boolean {return pendingWrites>0||unsafeReasons.size>0;}
export function applyUpdate(available:boolean,unsafe:boolean,reload:()=>void):boolean {if(!available||unsafe||updateIsUnsafe())return false;reload();return true;}
