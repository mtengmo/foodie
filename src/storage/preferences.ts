import type {Locale,ThemeMode} from '../domain/types';
export interface Preferences {locale:Locale;theme:ThemeMode;accent:'forest'|'berry';favorites:number[];recent:number[]}
const defaults:Preferences={locale:'sv',theme:'system',accent:'berry',favorites:[],recent:[]};
export function loadPreferences():Preferences {try {const p=JSON.parse(localStorage.getItem('foodie.preferences')||'null');return {...defaults,...p,locale:p?.locale==='en'?'en':'sv',accent:p?.accent==='forest'?'forest':'berry',theme:['light','dark','system'].includes(p?.theme)?p.theme:'system',favorites:Array.isArray(p?.favorites)?p.favorites.filter(Number.isInteger):[],recent:Array.isArray(p?.recent)?p.recent.filter(Number.isInteger):[]};}catch{return {...defaults};}}
export function savePreferences(p:Preferences):boolean {try{localStorage.setItem('foodie.preferences',JSON.stringify(p));return true;}catch{return false;}}
