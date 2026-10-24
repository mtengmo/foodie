import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Check, ChevronDown, ChevronRight, Download, Heart, Leaf, Moon, Plus, Search, Settings2, Sun, Trash2, Upload, X } from 'lucide-react';
import type { DatasetManifest, FoodDetail, FoodSummary, Locale, NutrientDefinition, Recipe } from './domain/types';
import { calculateRecipe, createRecipe, nutrientKey, parseQuantity, scaleNutrients, searchFoods } from './domain';
import { foodRepository } from './data/repository';
import { recipeStore, exportRecipes, parseRecipeImport, importRecipes, compareFoodData } from './storage/recipes';
import { loadPreferences, savePreferences } from './storage/preferences';
import type { Preferences } from './storage/preferences';
import { t } from './i18n/messages';
import { beginPendingWrite, setUpdateUnsafe, useAppUpdate } from './update/useAppUpdate';
import type { AppUpdate } from './update/useAppUpdate';

type Route = { page: 'foods' | 'recipes' | 'settings'; foodId?: number; query?: string; grams?: string };
const routeFromHash = (): Route => {
  const [path, params=''] = location.hash.replace(/^#\/?/, '').split('?'); const parts = path.split('/');
  const page = parts[0] === 'recipes' ? 'recipes' : parts[0] === 'settings' ? 'settings' : 'foods';
  const foodId = page === 'foods' && parts[1] ? Number(parts[1]) : undefined;
  const searchParams=new URLSearchParams(params);
  return { page, foodId: Number.isInteger(foodId) && foodId! > 0 ? foodId : undefined, query: searchParams.get('q') ?? '', grams:searchParams.get('g')??undefined };
};
const codeFor = (key: string) => key.split('|')[0];
const format = (n: number | null | undefined, locale: Locale, max = 1) => n == null || !Number.isFinite(n) ? '—' : new Intl.NumberFormat(locale === 'sv' ? 'sv-SE' : 'en-GB', { maximumFractionDigits: max }).format(n);

export default function App() {
  const update = useAppUpdate();
  const [dismissedVersion,setDismissedVersion]=useState<string|null>(null);
  const [route, setRoute] = useState<Route>(routeFromHash);
  const [prefs, setPrefs] = useState<Preferences>(loadPreferences);
  const [foods, setFoods] = useState<FoodSummary[]>([]);
  const [dictionary, setDictionary] = useState<NutrientDefinition[]>([]);
  const [manifest, setManifest] = useState<DatasetManifest | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [query, setQuery] = useState(() => routeFromHash().query ?? '');
  const [searchLimit,setSearchLimit]=useState(30);
  const [favoriteLimit,setFavoriteLimit]=useState(30);
  const [recentLimit,setRecentLimit]=useState(30);
  const [retryKey, setRetryKey] = useState(0);
  const [detail, setDetail] = useState<FoodDetail | null>(null);
  const [detailState, setDetailState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');
  const [gramsText, setGramsText] = useState(() => routeFromHash().grams ?? '100');
  const grams = Number(gramsText.replace(',', '.'));
  const validGrams = /^\d+(?:[.,]\d*)?$/.test(gramsText.trim()) && Number.isFinite(grams) && grams >= 0;
  const [smallScreen, setSmallScreen] = useState(() => matchMedia('(max-width: 680px)').matches);
  const [showAll, setShowAll] = useState(false);
  const locale = prefs.locale;
  const msg = (key: Parameters<typeof t>[1]) => t(locale, key);

  useEffect(() => {
    const onHash = () => {const next=routeFromHash();setRoute(next);setQuery(next.query??'');};
    const onResize = () => setSmallScreen(matchMedia('(max-width: 680px)').matches);
    addEventListener('hashchange', onHash); addEventListener('resize', onResize);
    const scheme=matchMedia('(prefers-color-scheme: dark)');const onScheme=()=>{if(loadPreferences().theme==='system')setPrefs(loadPreferences())};scheme.addEventListener?.('change',onScheme);
    return () => { removeEventListener('hashchange', onHash); removeEventListener('resize', onResize); scheme.removeEventListener?.('change',onScheme); };
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    const resolved = prefs.theme === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : prefs.theme;
    root.dataset.theme = resolved; root.dataset.accent = prefs.accent; root.lang = locale;
  }, [prefs]);
  useEffect(() => {
    let active = true;
    setLoadState('loading');
    Promise.all([foodRepository.loadIndex(), foodRepository.loadDictionary(), foodRepository.getManifest()])
      .then(([idx, dict, m]) => { if (active) { setFoods(idx); setDictionary(dict); setManifest(m); setLoadState('ready'); } })
      .catch(() => { if (active) setLoadState('error'); });
    return () => { active = false; };
  }, [retryKey]);
  useEffect(() => {
    let active = true;
    if (route.page !== 'foods' || route.foodId == null) { setDetail(null); return; }
    setDetailState('loading'); setDetail(null); setShowAll(false);
    foodRepository.getFood(route.foodId).then(food => {
      if (!active) return;
      if (!food) { setDetailState('missing'); return; }
      setDetail(food); setDetailState('ready'); setGramsText(route.grams ?? '100');
      if (!prefs.recent.includes(food.id)) { const next = {...prefs, recent:[food.id,...prefs.recent].slice(0,8)}; setPrefs(next); savePreferences(next); }
    }).catch(() => { if (active) setDetailState('error'); });
    return () => { active = false; };
  }, [route.page, route.foodId, route.grams, retryKey]);
  const filtered = useMemo(() => searchFoods(foods, query, locale), [foods, query, locale]);
  useEffect(()=>setSearchLimit(30),[query]);
  const favoriteFoods = foods.filter(f => prefs.favorites.includes(f.id)).sort((a,b)=>prefs.favorites.indexOf(a.id)-prefs.favorites.indexOf(b.id));
  const resultList = query.trim() ? filtered : foods.filter(f => prefs.recent.includes(f.id) && !prefs.favorites.includes(f.id)).sort((a,b) => prefs.recent.indexOf(a.id)-prefs.recent.indexOf(b.id));
  const selectedId = route.foodId;
  const updatePrefs = (next: Preferences) => { setPrefs(next); savePreferences(next); };
  const openFood = (food: FoodSummary) => { location.hash = `#/foods/${food.id}?q=${encodeURIComponent(query)}`; };
  const changeGrams = (value:string) => {setGramsText(value);const parsed=Number(value.replace(',','.'));if(/^[0-9]+(?:[.,][0-9]*)?$/.test(value)&&Number.isFinite(parsed)){const params=new URLSearchParams();if(query)params.set('q',query);params.set('g',value);history.replaceState(null,'',`#/foods/${route.foodId}?${params.toString()}`)}};
  const scaled = detail && validGrams ? scaleNutrients(detail.nutrients, grams) : [];
  const definition = (code: string, unit?: string) => dictionary.find(d => d.code === code && (unit == null || d.unit === unit));
  const findN = (code: string, unit?: string) => scaled.find(n => n.key === nutrientKey(code, unit ?? definition(code)?.unit ?? 'g'))?.value ?? null;
  const definitions = (items: [string,string?][]) => items.map(([code,unit])=>{const def=definition(code,unit);return { code, value: findN(code,def?.unit), label:def?.names[locale]??code, unit:def?.unit??'g', key:def?.key??'' }});
  const favorite = detail ? prefs.favorites.includes(detail.id) : false;
  const recentFoods = resultList;
  const loadingDetail = detailState === 'loading';

  return <div className={`app ${smallScreen && selectedId ? 'show-detail' : ''}`}>
    <header className="topbar">
      <a className="brand" href="#/foods" aria-label="Foodie — livsmedel"><span className="brand-mark"><Leaf aria-hidden="true"/></span>Foodie</a>
      <nav className="topnav" aria-label={locale === 'sv' ? 'Huvudmeny' : 'Main navigation'}>
        <a className={`nav-link ${route.page === 'foods' ? 'active' : ''}`} href="#/foods"><Search/> {msg('foods')}</a>
        <a className={`nav-link ${route.page === 'recipes' ? 'active' : ''}`} href="#/recipes"><BookOpen/> {msg('recipes')}</a>
        <a className={`nav-link ${route.page === 'settings' ? 'active' : ''}`} href="#/settings"><Settings2/> {msg('settings')}</a>
      </nav>
      <div className="nav-tools">
        <button className="icon-button" title={msg('settings')} onClick={() => location.hash = '#/settings'}><Settings2/></button>
      </div>
    </header>
    {update.showBanner&&update.availableVersion!==dismissedVersion&&<aside className="update-banner" aria-live="polite"><div><strong>{msg('updateAvailable')}</strong><p>{msg('updateVersion')} {update.availableVersion}</p>{update.blocked&&<small>{msg('updateBlocked')}</small>}</div><div className="update-actions"><button className="primary-button" disabled={update.blocked} onClick={()=>{if(update.updateNow())setDismissedVersion(update.availableVersion)}}>{msg('updateNow')}</button><button className="secondary-button" onClick={()=>setDismissedVersion(update.availableVersion)}>{msg('later')}</button></div></aside>}
    {route.page === 'foods' && <main className="page">
      <a className="back-link" href={`#/foods${query?`?q=${encodeURIComponent(query)}`:''}`}><ArrowLeft/> {msg('back')}</a>
      <div className="page-heading"><h1>{msg('searchTitle')}</h1></div>
      <div className="workspace">
        <section className="search-panel" aria-label={msg('searchHint')}>
          <label className="searchbox"><Search aria-hidden="true"/><input type="search" value={query} onChange={e => {setQuery(e.target.value);history.replaceState(null,'',`#/foods${e.target.value?`?q=${encodeURIComponent(e.target.value)}`:''}`)}} placeholder={msg('searchPlaceholder')} aria-label={msg('searchHint')} /></label>
          {loadState === 'loading' && <p className="status-line" role="status"><i className="spinner"/>{msg('loading')}</p>}
          {loadState === 'error' && <div className="callout" role="alert">{msg('loadError')} <button className="secondary-button" onClick={() => {foodRepository.clearCache();setRetryKey(k=>k+1)}}>{msg('retry')}</button></div>}
          {loadState === 'ready' && <>
            {query.trim()&&<div className="section-label"><span>{msg('results')}</span><span>{filtered.length}</span></div>}
            <div className="result-list" role="group" aria-label={msg('results')}>
              {query.trim() && filtered.length === 0 && <div className="empty-state"><strong>{msg('noResults')}</strong>{msg('noResultsHint')}</div>}
              {!query.trim() && <>
                {favoriteFoods.length > 0 && <><div className="section-label">{msg('favorites')}</div>{favoriteFoods.slice(0,favoriteLimit).map(food => <FoodRow key={`f${food.id}`} food={food} locale={locale} active={selectedId===food.id} onClick={()=>openFood(food)} favorite />)}{favoriteFoods.length>favoriteLimit&&<button className="show-more" onClick={()=>setFavoriteLimit(n=>n+30)}>{msg('showMore')} · {favoriteFoods.length-favoriteLimit}</button>}</>}
                {recentFoods.length > 0 && <div className="section-label">{msg('recent')}</div>}
              </>}
              {(query.trim()?filtered.slice(0,searchLimit):recentFoods.slice(0,recentLimit)).map(food => <FoodRow key={food.id} food={food} locale={locale} active={selectedId===food.id} onClick={()=>openFood(food)} />)}
              {query.trim()&&filtered.length>searchLimit&&<button className="show-more" onClick={()=>setSearchLimit(n=>n+30)}>{msg('showMore')} · {filtered.length-searchLimit}</button>}
              {!query.trim()&&recentFoods.length>recentLimit&&<button className="show-more" onClick={()=>setRecentLimit(n=>n+30)}>{msg('showMore')} · {recentFoods.length-recentLimit}</button>}
              {!query.trim() && recentFoods.length === 0 && favoriteFoods.length === 0 && <div className="empty-state"><strong>{msg('chooseFood')}</strong>{msg('chooseHint')}<p className="small">{locale === 'sv' ? 'Prova: potatis, lax eller blåbär.' : 'Try: potato, salmon or blueberries.'}</p></div>}
            </div>
          </>}
        </section>
        <section className="detail-panel" aria-live="polite" aria-busy={loadingDetail}>
          {!selectedId && <div className="empty-state"><strong>{msg('chooseFood')}</strong>{msg('chooseHint')}</div>}
          {loadingDetail && selectedId != null && <p className="status-line" role="status"><i className="spinner"/>{msg('loading')}</p>}
          {detailState === 'error' && <div className="callout" role="alert">{msg('loadError')} <button className="secondary-button" onClick={()=>{foodRepository.clearCache();setRetryKey(k=>k+1)}}>{msg('retry')}</button></div>}
          {detailState === 'missing' && <div className="empty-state"><strong>{msg('missingFood')}</strong><a href="#/foods">{msg('back')}</a></div>}
          {detail && detailState === 'ready' && <>
            <div className="detail-topline"><div><h2>{detail.names[locale]}</h2><p className="detail-subtitle">{msg(detail.kind)} · {msg('per100')}</p></div>
              <button className="favorite-toggle" aria-label={favorite ? msg('removeFavorite') : msg('addFavorite')} title={favorite ? msg('removeFavorite') : msg('addFavorite')} onClick={()=>updatePrefs({...prefs,favorites:favorite?prefs.favorites.filter(id=>id!==detail.id):[detail.id,...prefs.favorites]})}><Heart fill={favorite?'currentColor':'none'}/></button>
            </div>
            <div className="portion-row"><span className="portion-label">{msg('amount')}</span><label className="portion-input"><input inputMode="decimal" aria-label={`${msg('amount')} (${msg('grams')})`} value={gramsText} onChange={e=>changeGrams(e.target.value)} onBlur={()=>{if(!validGrams)changeGrams('100')}}/><span>{msg('grams')}</span></label><div className="presets">{[50,100,200].map(n=><button className={`preset ${grams===n?'active':''}`} key={n} onClick={()=>changeGrams(String(n))}>{n} g</button>)}</div></div>
            {!validGrams && <p className="small" role="alert">{locale==='sv'?'Ange ett positivt antal gram.':'Enter a positive number of grams.'}</p>}
            <div className="nutrient-summary"><MacroChart items={[['PROT','g'],['CHO','g'],['FAT','g']].map(([code,unit])=>{const row=definitions([[code,unit]])[0];return {code,label:row.label,value:row.value,complete:row.value!==null}})} locale={locale} format={format}/><p className="macro-note">{msg('macroHint')}</p></div>
            <dl className="key-nutrients">{definitions([['ENERC','kcal'],['ENERC','kJ'],['PROT','g'],['CHO','g'],['FAT','g'],['FIBT','g'],['SUGAR','g'],['NACL','g']]).filter(n=>n.value!==null).map(n=><div className="nutrient-row" key={n.key}><dt>{n.label}</dt><dd>{format(n.value,locale)} {n.unit}</dd></div>)}</dl>
            <details className="disclosure" open={showAll} onToggle={e=>setShowAll((e.currentTarget as HTMLDetailsElement).open)}><summary>{msg('nutrients')}</summary><dl className="key-nutrients">{detail.nutrients.map(n=>{const def=dictionary.find(d=>d.key===n.key);const value=scaled.find(v=>v.key===n.key)?.value??null;return <div className="nutrient-row" key={n.key}><dt>{def?.names[locale]??n.key}</dt><dd>{format(value,locale)} {def?.unit??''}</dd></div>})}</dl></details>
            <div className="data-note">{msg('source')}: <a href={detail.sourceUrl} target="_blank" rel="noreferrer">Livsmedelsverket</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a> · {msg(detail.kind)} · {locale==='sv'?'Dataversion':'Data version'} {detail.version}{manifest && <> · {locale==='sv'?'Uppdaterad':'Updated'} {new Date(manifest.fetchedAt).toLocaleDateString(locale==='sv'?'sv-SE':'en-GB')}</>}<br/>{locale==='sv'?'Mängden räknas om från värden per 100 g. Näringsämnen som saknas visas inte som noll.':'Values are scaled from the 100 g basis. Missing nutrients are not shown as zero.'}</div>
          </>}
        </section>
      </div>
    </main>}
    {route.page === 'settings' && <Settings locale={locale} prefs={prefs} update={updatePrefs} appUpdate={update} />}
    {route.page === 'recipes' && <Recipes locale={locale} msg={msg} foods={foods} dictionary={dictionary} manifest={manifest} />}
  </div>;
}

function FoodRow({food,locale,active,onClick,favorite=false}:{food:FoodSummary;locale:Locale;active:boolean;onClick:()=>void;favorite?:boolean}){
  return <button aria-pressed={active} className={`food-row ${active?'selected':''}`} onClick={onClick}><span><span className="food-name">{food.names[locale]}</span><span className="food-meta">{food.kind==='analyzed'?(locale==='sv'?'Analyserat':'Analysed'):(locale==='sv'?'Beräknat':'Calculated')} · {food.version}</span></span>{favorite?<Heart size={16} fill="currentColor"/>:<ChevronRight/>}</button>;
}
type MacroItem={code:string;label:string;value:number|null;complete:boolean};
function MacroChart({items,locale,format}:{items:MacroItem[];locale:Locale;format:(n:number|null|undefined,l:Locale,max?:number)=>string}){
  const colors=['var(--macro-protein)','var(--ochre)','var(--violet)'];const values=items.map(item=>item.value??0);const complete=items.every(item=>item.complete&&item.value!==null);const total=values.reduce((a,b)=>a+b,0);const [active,setActive]=useState<number|null>(null);const buttons=useRef<HTMLButtonElement[]>([]);let offset=0;
  const focusIndex=(i:number)=>{const next=(i+items.length)%items.length;setActive(next);buttons.current[next]?.focus()};
  return <div className="macro-visual"><div className="donut" role="img" aria-label={`${locale==='sv'?'Makronäring':'Macronutrients'}: ${items.map(item=>`${item.label} ${format(item.value,locale)} g`).join(', ')}`}><svg viewBox="0 0 100 100" aria-hidden="true"><circle className="donut-bg" cx="50" cy="50" r="40"/>{complete&&total>0&&values.map((value,i)=>{const length=value/total*251.2;const node=<circle key={items[i].code} className="donut-piece" cx="50" cy="50" r="40" stroke={colors[i]} style={{strokeWidth:active===i?16:13}} strokeDasharray={`${length} ${251.2-length}`} strokeDashoffset={-offset}/>;offset+=length;return node;})}</svg><div className="donut-center"><b>{complete?format(total,locale):'—'}</b><span>{complete?(locale==='sv'?'gram totalt':'grams total'):(locale==='sv'?'ofullständigt':'incomplete')}</span></div></div><div className="macro-legend">{items.map((item,i)=><button ref={el=>{if(el)buttons.current[i]=el}} type="button" key={item.code} className={`macro-select ${active===i?'selected':''}`} aria-pressed={active===i} onFocus={()=>setActive(i)} onPointerEnter={()=>setActive(i)} onClick={()=>setActive(i)} onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();focusIndex(i+1)}else if(e.key==='ArrowLeft'){e.preventDefault();focusIndex(i-1)}else if(e.key==='Home'){e.preventDefault();focusIndex(0)}else if(e.key==='End'){e.preventDefault();focusIndex(items.length-1)}}}><i className="legend-dot" style={{background:colors[i]}}/><span className="macro-label">{item.label}{!item.complete&&<small className="food-meta">{locale==='sv'?'Saknas delvis':'Partly missing'}</small>}</span><strong>{item.value===null?'—':format(item.value,locale)} g</strong>{active===i&&<Check aria-hidden="true" className="macro-check"/>}</button>)}</div></div>;
}
function Settings({locale,prefs,update,appUpdate}:{locale:Locale;prefs:Preferences;update:(p:Preferences)=>void;appUpdate:AppUpdate}){
  const msg=(k:Parameters<typeof t>[1])=>t(locale,k);
  const updateStatus=appUpdate.status==='checking'?msg('checkingUpdates'):appUpdate.status==='available'?msg('updateAvailable'):appUpdate.status==='offline'?msg('offlineUpdate'):appUpdate.status==='error'?msg('updateError'):msg('noUpdate');
  return <main className="page settings-page"><div className="page-heading"><h1>{msg('settings')}</h1></div>
    <section className="setting-group"><h2>{msg('language')}</h2><div className="choice-row">{(['sv','en'] as const).map(l=><button key={l} className={`choice ${prefs.locale===l?'active':''}`} aria-pressed={prefs.locale===l} onClick={()=>update({...prefs,locale:l})}>{l==='sv'?'Svenska':'English'}{prefs.locale===l&&<Check size={16}/>}</button>)}</div></section>
    <section className="setting-group"><h2>{msg('appearance')}</h2><div className="choice-row">{(['light','dark','system'] as const).map(mode=><button key={mode} className={`choice ${prefs.theme===mode?'active':''}`} aria-pressed={prefs.theme===mode} onClick={()=>update({...prefs,theme:mode})}>{mode==='light'?<Sun size={16}/>:mode==='dark'?<Moon size={16}/>:<Settings2 size={16}/>} {msg(mode)}</button>)}</div></section>
    <section className="setting-group"><h2>{msg('palette')}</h2><div className="choice-row">{(['berry','forest'] as const).map((accent,i)=><button key={accent} className={`choice ${prefs.accent===accent?'active':''}`} aria-pressed={prefs.accent===accent} onClick={()=>update({...prefs,accent})}><i className="legend-dot" style={{background:i?'var(--green)':'var(--berry)'}}/> {msg(accent)}</button>)}</div></section>
    <section className="setting-group"><h2>{msg('appVersion')}</h2><p className="version-line">{msg('updateVersion')} <strong>{appUpdate.currentVersion}</strong></p><p className="version-status" role="status" aria-live="polite">{updateStatus}{appUpdate.needRefresh&&appUpdate.availableVersion&&<> · {msg('updateVersion')} {appUpdate.availableVersion}</>}</p>{appUpdate.blocked&&appUpdate.needRefresh&&<p className="small">{msg('updateBlocked')}</p>}<div className="update-actions"><button className="secondary-button" disabled={appUpdate.status==='checking'} onClick={()=>void appUpdate.checkForUpdate()}>{msg('checkUpdates')}</button>{appUpdate.needRefresh&&<button className="primary-button" disabled={appUpdate.blocked} onClick={()=>appUpdate.updateNow()}>{msg('updateNow')}</button>}</div></section>
  </main>;
}
function Recipes({locale,msg,foods,dictionary,manifest}:{locale:Locale;msg:(key:Parameters<typeof t>[1])=>string;foods:FoodSummary[];dictionary:NutrientDefinition[];manifest:DatasetManifest|null}){
  const [recipes,setRecipes]=useState<Recipe[]>([]); const [activeId,setActiveId]=useState<string|null>(null); const [load,setLoad]=useState<'loading'|'ready'|'error'>('loading');
  const [draftQuery,setDraftQuery]=useState(''); const [adding,setAdding]=useState(false); const [busy,setBusy]=useState(false); const [notice,setNotice]=useState('');
  const [importPreview,setImportPreview]=useState<Recipe[]|null>(null); const [undoRecipe,setUndoRecipe]=useState<Recipe|null>(null);
  const [updatePreview,setUpdatePreview]=useState<{recipeId:string;items:{ingredientId:string;food:FoodDetail|null;changes:{key:string;before:number|null;after:number|null}[]}[]}|null>(null);
  const pending=useRef(new Map<string,Recipe>()); const saveChain=useRef<Promise<void>>(Promise.resolve());
  const activeRecipe=recipes.find(r=>r.id===activeId)??null;
  const loadRecipes=()=>{setLoad('loading');recipeStore.list().then(rs=>{setRecipes(rs);setActiveId(id=>id&&rs.some(r=>r.id===id)?id:rs[0]?.id??null);setLoad('ready')}).catch(()=>setLoad('error'))};
  useEffect(()=>{loadRecipes()},[]);
  const persist=(next:Recipe)=>{const release=beginPendingWrite();const saved={...next,updatedAt:new Date().toISOString()};pending.current.set(saved.id,saved);setRecipes(rs=>rs.some(r=>r.id===saved.id)?rs.map(r=>r.id===saved.id?saved:r):[saved,...rs]);setActiveId(saved.id);setBusy(true);saveChain.current=saveChain.current.then(async()=>{const latest=pending.current.get(saved.id);if(latest)await recipeStore.save(latest)}).then(()=>{if(pending.current.get(saved.id)?.updatedAt===saved.updatedAt){pending.current.delete(saved.id);if(pending.current.size===0)setUpdateUnsafe('recipe-save-failed',false);setNotice(msg('saved'))}}).catch(()=>{setUpdateUnsafe('recipe-save-failed',true);setNotice(msg('saveError'))}).finally(()=>{release();setBusy(false)});};
  const create=()=>{if(!manifest)return;const r=createRecipe(manifest.snapshotId);r.title=locale==='sv'?'Nytt recept':'New recipe';persist(r)};
  const removeRecipe=async(r:Recipe)=>{const release=beginPendingWrite();try{await recipeStore.delete(r.id);pending.current.delete(r.id);if(pending.current.size===0)setUpdateUnsafe('recipe-save-failed',false);setUndoRecipe(r);setRecipes(rs=>rs.filter(x=>x.id!==r.id));setActiveId(recipes.find(x=>x.id!==r.id)?.id??null)}catch{setUpdateUnsafe('recipe-save-failed',true);setNotice(msg('saveError'))}finally{release()}};
  const undoDelete=async()=>{if(undoRecipe){await persist(undoRecipe);setUndoRecipe(null)}};
  const duplicate=async(r:Recipe)=>{const copy={...r,id:crypto.randomUUID(),title:`${r.title} (${locale==='sv'?'kopia':'copy'})`,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),ingredients:r.ingredients.map(i=>({...i,id:crypto.randomUUID()}))};await persist(copy)};
  const addFood=async(food:FoodSummary)=>{if(!activeRecipe)return;setAdding(false);setDraftQuery('');try{const detail=await foodRepository.getFood(food.id);if(!detail){setNotice(msg('missingFood'));return}await persist({...activeRecipe,ingredients:[...activeRecipe.ingredients,{id:crypto.randomUUID(),foodId:food.id,grams:100,food:detail}]})}catch{setNotice(msg('loadError'))}};
  const doExport=async()=>{try{const data=exportRecipes(recipes);const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='foodie-recipes.json';a.click();URL.revokeObjectURL(url)}catch{setNotice(msg('saveError'))}};
  const doImport=async(file?:File)=>{if(!file)return;try{if(file.size>5*1024*1024)throw Error('large');const arr=parseRecipeImport(await file.text());setImportPreview(arr)}catch{setNotice(locale==='sv'?'Filen är för stor eller innehåller ogiltiga recept.':'The file is too large or contains invalid recipes.')}};
  const chooseImport=async(mode:'merge'|'copy'|'replace')=>{if(!importPreview)return;const release=beginPendingWrite();try{await importRecipes(importPreview,mode);setUpdateUnsafe('recipe-save-failed',false);setImportPreview(null);loadRecipes();setNotice(msg('saved'))}catch{setNotice(locale==='sv'?'Importen krockar med befintliga recept.':'Import conflicts with existing recipes.')}finally{release()}};
  const previewDataUpdate=async(r:Recipe)=>{setBusy(true);setUpdatePreview(null);try{const items=await Promise.all(r.ingredients.map(async ingredient=>{const food=await foodRepository.getFood(ingredient.foodId);if(!food)return {ingredientId:ingredient.id,food:null,changes:[]};const changes=compareFoodData(ingredient.food,food);const newKeys=new Set(food.nutrients.map(n=>n.key));const removed=ingredient.food.nutrients.filter(n=>!newKeys.has(n.key)).map(n=>({key:n.key,before:n.value,after:null}));return {ingredientId:ingredient.id,food,changes:[...changes,...removed]}}));const hasUpdates=items.some(item=>!item.food||item.food.version!==r.ingredients.find(i=>i.id===item.ingredientId)?.food.version||item.changes.length>0);if(!hasUpdates){setNotice(msg('noChanges'));return}setUpdatePreview({recipeId:r.id,items})}catch{setNotice(msg('loadError'))}finally{setBusy(false)}};
  const applyDataUpdate=()=>{if(!updatePreview)return;const r=recipes.find(x=>x.id===updatePreview.recipeId);if(!r)return;const changed=new Map(updatePreview.items.filter(x=>x.food).map(x=>[x.ingredientId,x.food!]));const ingredients=r.ingredients.map(i=>changed.has(i.id)?{...i,food:changed.get(i.id)!}:i);persist({...r,ingredients,snapshotId:updatePreview.items.every(x=>x.food)?manifest?.snapshotId??r.snapshotId:r.snapshotId});setUpdatePreview(null)};
  return <main className="page"><div className="page-heading"><h1>{msg('recipeTitle')}</h1><p>{locale==='sv'?'Samla ingredienser och se näringen per portion. Alla mängder anges i gram.':'Combine ingredients and see nutrition per serving. All amounts use grams.'}</p></div>
    <div className="recipe-actions"><button className="primary-button" onClick={create} disabled={!manifest}><Plus/>{msg('newRecipe')}</button><button className="secondary-button" onClick={doExport} disabled={!recipes.length}><Download/>{msg('export')}</button><label className="secondary-button import-file-label"><Upload/>{msg('import')}<input className="file-input" type="file" accept="application/json,.json" onChange={e=>{doImport(e.target.files?.[0]);e.currentTarget.value=''}}/></label></div>
    {notice&&<p role="status" className="status-line">{notice}</p>}{busy&&<p role="status" className="status-line"><i className="spinner"/>{locale==='sv'?'Sparar…':'Saving…'}</p>}
    {undoRecipe&&<p className="callout">{locale==='sv'?'Recept borttaget.':'Recipe deleted.'} <button className="secondary-button" onClick={undoDelete}>{msg('undo')}</button></p>}
    {load==='loading'&&<p className="status-line"><i className="spinner"/>{msg('loading')}</p>}{load==='error'&&<div className="callout" role="alert">{msg('loadError')} <button className="secondary-button" onClick={loadRecipes}>{msg('retry')}</button></div>}
    {load==='ready'&&<div className="recipe-layout"><aside><div className="recipe-list">{recipes.map(r=><button className={`recipe-item ${activeId===r.id?'active':''}`} key={r.id} onClick={()=>setActiveId(r.id)}><BookOpen/><span>{r.title||msg('newRecipe')}<small>{r.ingredients.length} {msg('ingredients').toLocaleLowerCase(locale)}</small></span><ChevronRight/></button>)}</div>{!recipes.length&&<div className="empty-state"><strong>{msg('emptyRecipes')}</strong>{msg('emptyRecipesHint')}</div>}</aside>
      {activeRecipe&&<RecipeEditor recipe={activeRecipe} locale={locale} msg={msg} dictionary={dictionary} onChange={persist} onRemove={()=>removeRecipe(activeRecipe)} onDuplicate={()=>duplicate(activeRecipe)} adding={adding} setAdding={setAdding} query={draftQuery} setQuery={setDraftQuery} matches={searchFoods(foods,draftQuery,locale)} onAdd={addFood} onPreviewDataUpdate={()=>previewDataUpdate(activeRecipe)} updatePreview={updatePreview?.recipeId===activeRecipe.id?updatePreview:null} onApplyDataUpdate={applyDataUpdate} onCancelDataUpdate={()=>setUpdatePreview(null)}/>}
    </div>}
    {importPreview&&<section className="import-review" aria-labelledby="import-heading"><h2 id="import-heading">{msg('importPreview')}</h2><p>{importPreview.length} {locale==='sv'?'recept hittades. Välj hur de ska läggas till.':'recipes found. Choose how to add them.'}</p><ul>{importPreview.slice(0,5).map(r=><li key={r.id}>{r.title||msg('newRecipe')} · {r.ingredients.length} {msg('ingredients').toLocaleLowerCase(locale)}</li>)}</ul><div className="choice-row"><button className="primary-button" onClick={()=>chooseImport('copy')}>{msg('copy')}</button><button className="secondary-button" onClick={()=>chooseImport('merge')}>{msg('merge')}</button><button className="danger-button" onClick={()=>chooseImport('replace')}>{msg('replace')}</button><button className="secondary-button" onClick={()=>setImportPreview(null)}>{msg('cancel')}</button></div></section>}
  </main>;
}
function RecipeEditor({recipe,locale,msg,dictionary,onChange,onRemove,onDuplicate,adding,setAdding,query,setQuery,matches,onAdd,onPreviewDataUpdate,updatePreview,onApplyDataUpdate,onCancelDataUpdate}:{recipe:Recipe;locale:Locale;msg:(key:Parameters<typeof t>[1])=>string;dictionary:NutrientDefinition[];onChange:(r:Recipe)=>void;onRemove:()=>void;onDuplicate:()=>void;adding:boolean;setAdding:(b:boolean)=>void;query:string;setQuery:(s:string)=>void;matches:FoodSummary[];onAdd:(f:FoodSummary)=>void;onPreviewDataUpdate:()=>void;updatePreview:{recipeId:string;items:{ingredientId:string;food:FoodDetail|null;changes:{key:string;before:number|null;after:number|null}[]}[]}|null;onApplyDataUpdate:()=>void;onCancelDataUpdate:()=>void}){
  const [mode,setMode]=useState<'total'|'serving'|'per100g'>('total');
  const [quantityDrafts,setQuantityDrafts]=useState<Record<string,string>>({});
  const [pickerLimit,setPickerLimit]=useState(8);
  const [removed,setRemoved]=useState<Recipe['ingredients'][number]|null>(null);
  useEffect(()=>{setQuantityDrafts(Object.fromEntries(recipe.ingredients.map(i=>[i.id,String(i.grams)])));setRemoved(null)},[recipe.id]);
  useEffect(()=>setPickerLimit(8),[query]);
  useEffect(()=>()=>{['recipe-title-draft','recipe-serving-draft','recipe-final-weight-draft','recipe-quantity-draft'].forEach(key=>setUpdateUnsafe(key,false))},[]);
  const updateIngredient=(id:string,grams:number)=>onChange({...recipe,ingredients:recipe.ingredients.map(i=>i.id===id?{...i,grams}:i)});
  const nutrients=calculateRecipe(recipe,mode);
  return <section className="detail-panel recipe-editor"><div className="recipe-head"><label className="recipe-name-field"><span className="small">{msg('recipeName')}</span><textarea rows={2} className="recipe-title-input" value={recipe.title} onChange={e=>{setUpdateUnsafe('recipe-title-draft',true);onChange({...recipe,title:e.target.value})}} onBlur={()=>setUpdateUnsafe('recipe-title-draft',false)} aria-label={msg('recipeName')}/></label><div className="recipe-head-actions"><button className="icon-button" title={msg('duplicate')} onClick={onDuplicate}><BookOpen/></button><button className="icon-button" title={msg('delete')} onClick={onRemove}><Trash2/></button></div></div>
    <div className="recipe-quantity-fields"><div className="quantity-field"><label htmlFor="servings">{msg('servings')}</label><div className="quantity-control"><input id="servings" className="servings-input" type="number" min="1" step="1" value={recipe.servings} onChange={e=>{setUpdateUnsafe('recipe-serving-draft',true);onChange({...recipe,servings:Math.max(1,Math.floor(Number(e.target.value)||1))})}} onBlur={()=>setUpdateUnsafe('recipe-serving-draft',false)}/><small>{locale==='sv'?'portioner':'servings'}</small></div></div><div className="quantity-field"><label htmlFor="final-weight">{msg('finalWeight')}</label><div className="quantity-control"><input id="final-weight" className="servings-input" type="number" min="1" value={recipe.finalWeight??''} onChange={e=>{setUpdateUnsafe('recipe-final-weight-draft',true);const n=Number(e.target.value);onChange({...recipe,finalWeight:Number.isFinite(n)&&n>0?n:undefined})}} onBlur={()=>setUpdateUnsafe('recipe-final-weight-draft',false)}/><small>{msg('grams')}</small></div></div></div>
    <div className="section-label"><span>{msg('ingredients')}</span><span>{recipe.ingredients.length}</span></div>
    {recipe.ingredients.map(i=><div className="recipe-ingredient" key={i.id}><span className="food-name">{i.food.names[locale]}<span className="food-meta">{i.food.kind==='analyzed'?msg('analyzed'):msg('calculated')}</span></span><label className="portion-input"><input aria-label={`${i.food.names[locale]} (${msg('grams')})`} inputMode="decimal" value={quantityDrafts[i.id]??String(i.grams)} onChange={e=>{setUpdateUnsafe('recipe-quantity-draft',true);setQuantityDrafts(d=>({...d,[i.id]:e.target.value}))}} onBlur={e=>{const n=parseQuantity(e.currentTarget.value);if(n===null||n<=0){setQuantityDrafts(d=>({...d,[i.id]:String(i.grams)}));setUpdateUnsafe('recipe-quantity-draft',false);return}setQuantityDrafts(d=>({...d,[i.id]:String(n)}));if(n!==i.grams)updateIngredient(i.id,n);setUpdateUnsafe('recipe-quantity-draft',false)}}/><span>g</span></label><button className="icon-button" aria-label={msg('remove')} title={msg('remove')} onClick={()=>{setRemoved(i);onChange({...recipe,ingredients:recipe.ingredients.filter(x=>x.id!==i.id)})}}><X/></button></div>)}
    {removed&&<p className="callout">{removed.food.names[locale]} {locale==='sv'?'borttagen.':'removed.'} <button className="secondary-button" onClick={()=>{onChange({...recipe,ingredients:[...recipe.ingredients,removed]});setRemoved(null)}}>{msg('undo')}</button></p>}
    {adding?<div className="add-food"><label className="searchbox"><Search/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder={msg('searchPlaceholder')} aria-label={msg('addIngredient')}/><button className="icon-button" onClick={()=>{setAdding(false);setQuery('')}} aria-label={msg('cancel')}><X/></button></label>{query&&<div className="result-list">{matches.slice(0,pickerLimit).map(f=><FoodRow key={f.id} food={f} locale={locale} active={false} onClick={()=>onAdd(f)}/>)}{matches.length>pickerLimit&&<button className="show-more" onClick={()=>setPickerLimit(n=>n+8)}>{msg('showMore')} · {matches.length-pickerLimit}</button>}</div>}</div>:<button className="secondary-button" style={{marginTop:14}} onClick={()=>setAdding(true)}><Plus/>{msg('addIngredient')}</button>}
    {recipe.ingredients.length===0?<div className="empty-state">{msg('recipeEmpty')}</div>:<div className="recipe-summary">
      <h2>{mode==='total'?msg('total'):mode==='serving'?msg('perServing'):recipe.finalWeight?msg('per100FinishedDish'):msg('per100Recipe')}</h2>
      <div className="summary-tabs">{(['total','serving','per100g'] as const).map(m=><button key={m} className={`summary-tab ${mode===m?'active':''}`} aria-pressed={mode===m} onClick={()=>setMode(m)}>{m==='per100g'&&recipe.finalWeight?msg('per100FinishedDish'):msg(m==='total'?'total':m==='serving'?'perServing':'per100Recipe')}</button>)}</div>
      <div className="nutrient-summary"><MacroChart items={['PROT','CHO','FAT'].map(code=>{const n=nutrients.find(x=>codeFor(x.key)===code);const def=dictionary.find(d=>d.key===n?.key);return {code,label:def?.names[locale]??(code==='PROT'?msg('protein'):code==='CHO'?msg('carbs'):msg('fat')),value:n?.value??null,complete:n?.complete??false}})} locale={locale} format={format}/><p className="macro-note">{msg('macroHint')}</p></div>
      <dl className="key-nutrients">{nutrients.filter(n=>['ENERC','PROT','CHO','FAT','FIBT','SUGAR','NACL'].includes(codeFor(n.key))).map(n=>{const def=dictionary.find(d=>d.key===n.key);return <div className="nutrient-row" key={n.key}><dt>{def?.names[locale]??codeFor(n.key)}{!n.complete&&<span className="food-meta">{msg('incomplete')} · {n.knownIngredients}/{n.totalIngredients}</span>}</dt><dd>{n.value==null?'—':format(n.value,locale)} {def?.unit??''}</dd></div>})}</dl>
      <details className="disclosure"><summary>{msg('secondaryNutrients')}</summary><dl className="key-nutrients">{nutrients.filter(n=>!['ENERC','PROT','CHO','FAT','FIBT','SUGAR','NACL'].includes(codeFor(n.key))).map(n=>{const def=dictionary.find(d=>d.key===n.key);return <div className="nutrient-row" key={n.key}><dt>{def?.names[locale]??codeFor(n.key)}{!n.complete&&<span className="food-meta">{msg('incomplete')} · {n.knownIngredients}/{n.totalIngredients}</span>}</dt><dd>{n.value==null?'—':format(n.value,locale)} {def?.unit??''}</dd></div>})}</dl></details>
      <p className="data-note">{msg('estimateNote')} {mode==='per100g'&&<span>{recipe.finalWeight?(locale==='sv'?'Beräknat på uppmätt slutvikt. ':'Based on measured final weight. '):msg('per100Basis')}</span>}</p>
    </div>}
    {recipe.ingredients.length>0&&<div className="recipe-data-update"><button className="secondary-button" onClick={onPreviewDataUpdate}>{msg('checkData')}</button>{updatePreview&&<div className="callout"><p>{msg('changesFound')}</p>{updatePreview.items.map(item=>{const ingredient=recipe.ingredients.find(i=>i.id===item.ingredientId);return <div key={item.ingredientId}><strong>{ingredient?.food.names[locale]}</strong>{!item.food?<p>{msg('removedFood')}</p>:<><p className="small">{msg('versionChange')}: {ingredient?.food.version} → {item.food.version}</p>{item.changes.map(c=><p className="small" key={c.key}>{dictionary.find(d=>d.key===c.key)?.names[locale]??c.key}: {msg('before')} {c.before??'—'} → {msg('after')} {c.after??'—'}</p>)}</>}</div>})}<div className="choice-row"><button className="primary-button" onClick={onApplyDataUpdate}>{msg('applyUpdates')}</button><button className="secondary-button" onClick={onCancelDataUpdate}>{msg('cancel')}</button></div></div>}</div>}
  </section>;
}
