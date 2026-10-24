import {useCallback,useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {compareVersion,fetchAppVersion,type UpdateStatus} from './client';
import {applyUpdate,updateIsUnsafe,subscribeUpdateSafety} from './safety';
export {setUpdateUnsafe,beginPendingWrite} from './safety';
export const UPDATE_INTERVAL=5*60_000;
export const UPDATE_THROTTLE=60_000;
export interface AppUpdate {status:UpdateStatus;needRefresh:boolean;showBanner:boolean;blocked:boolean;currentVersion:string;availableVersion:string|null;checkForUpdate:()=>Promise<void>;updateNow:()=>boolean}
export function useAppUpdate(unsafe=false):AppUpdate {
 const [status,setStatus]=useState<UpdateStatus>('current');
 const [availableVersion,setAvailableVersion]=useState<string|null>(null);
 const mounted=useRef(true),inFlight=useRef<Promise<void>|null>(null),lastCheck=useRef(-Infinity),unsafeRef=useRef(unsafe);
 unsafeRef.current=unsafe;
 const check=useCallback((manual=false):Promise<void>=>{
  if(inFlight.current)return inFlight.current;
  if(!navigator.onLine){setStatus('offline');return Promise.resolve();}
  if(!manual&&(document.visibilityState==='hidden'||Date.now()-lastCheck.current<UPDATE_THROTTLE))return Promise.resolve();
  lastCheck.current=Date.now();setStatus('checking');
  const task=(async()=>{try{const manifest=await fetchAppVersion(import.meta.env.BASE_URL);if(!mounted.current)return;const next=compareVersion(__APP_VERSION__,manifest);setAvailableVersion(next==='available'?manifest.version:null);setStatus(next);}catch{if(mounted.current)setStatus(navigator.onLine?'error':'offline');}})();
  inFlight.current=task;void task.finally(()=>{if(inFlight.current===task)inFlight.current=null;});return task;
 },[]);
 useEffect(()=>{
  mounted.current=true;const automatic=()=>{void check();};const offline=()=>setStatus('offline');
  void check();window.addEventListener('focus',automatic);window.addEventListener('online',automatic);window.addEventListener('offline',offline);document.addEventListener('visibilitychange',automatic);
  const timer=window.setInterval(automatic,UPDATE_INTERVAL);
  return ()=>{mounted.current=false;window.clearInterval(timer);window.removeEventListener('focus',automatic);window.removeEventListener('online',automatic);window.removeEventListener('offline',offline);document.removeEventListener('visibilitychange',automatic);};
 },[check]);
 const needRefresh=availableVersion!==null;
 const updateNow=useCallback(()=>applyUpdate(availableVersion!==null,unsafeRef.current,()=>window.location.reload()),[availableVersion]);
 const sharedUnsafe=useSyncExternalStore(subscribeUpdateSafety,updateIsUnsafe,()=>false);const blocked=unsafe||sharedUnsafe;
 return {status,needRefresh,showBanner:needRefresh,blocked,currentVersion:__APP_VERSION__,availableVersion,checkForUpdate:()=>check(true),updateNow};
}
