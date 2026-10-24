export type Locale = 'sv' | 'en';
export type ThemeMode = 'light' | 'dark' | 'system';
export interface FoodSummary { id:number; names:Record<Locale,string>; version:string; kind:'analyzed'|'calculated'; detailPath:string }
export interface NutrientDefinition {key:string;code:string;unit:string;basis:string;names:Record<Locale,string>;group:string;order:number}
export interface NutrientValue {key:string;value:number|null;status:'known'|'unknown';qualifiers:Record<string,string|number|null>;matrixUnspecified?:boolean}
export interface FoodDetail extends FoodSummary {snapshotId:string;nutrients:NutrientValue[];sourceUrl:string}
export interface DatasetManifest {schemaVersion:1;snapshotId:string;fetchedAt:string;sourceUrl:string;license:string;counts:Record<Locale,number>;indexPath:string;dictionaryPath:string;discoveryPath:string;checksums:Record<string,string>}
export interface Ingredient {id:string;foodId:number;grams:number;food:FoodDetail}
export interface Recipe {schemaVersion:1;id:string;title:string;servings:number;ingredients:Ingredient[];createdAt:string;updatedAt:string;finalWeight?:number;snapshotId:string;instructions?:string[];template?:{id:string;revision:number;locale:Locale}}
export interface CalculatedNutrient {key:string;value:number|null;complete:boolean;knownIngredients:number;totalIngredients:number}
