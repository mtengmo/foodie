import type {FoodDetail, NutrientValue} from './types';

export type HighlightNutrient = 'protein' | 'fibre';
export type HighlightLevel = 'high' | 'source' | 'none' | 'unassessed';
export interface NutrientHighlightAssessment {
  level: HighlightLevel;
  amountPer100g: number | null;
  energyKcalPer100g: number | null;
  proteinEnergyPercent?: number;
  fibrePer100Kcal?: number;
}

// European Commission nutrition claims, checked 2026-10-24:
// https://food.ec.europa.eu/food-safety/labelling-and-nutrition/nutrition-and-health-claims/nutrition-claims_en
export const DISCOVERY_RULE_VERSION = '2026-10-24-v1';
export const DISCOVERY_KEYS = {
  protein: 'PROT|g|per100g',
  fibre: 'FIBT|g|per100g',
  energy: 'ENERC|kcal|per100g',
} as const;

function knownValue(nutrients: NutrientValue[], key: string): number | null {
  const row = nutrients.find(value => value.key === key);
  return row?.status === 'known' && typeof row.value === 'number' && Number.isFinite(row.value) && row.value >= 0
    ? row.value
    : null;
}

/** Per-100-g claim thresholds; selected portion has no role in classification. */
export function assessNutrientHighlight(food: Pick<FoodDetail, 'nutrients'>, nutrient: HighlightNutrient): NutrientHighlightAssessment {
  const energy = knownValue(food.nutrients, DISCOVERY_KEYS.energy);
  const amount = knownValue(food.nutrients, DISCOVERY_KEYS[nutrient]);
  const base = {amountPer100g: amount, energyKcalPer100g: energy};
  if (amount === null) return {...base, level: 'unassessed'};
  if (nutrient === 'protein') {
    if (energy === null || energy <= 0) return {...base, level: 'unassessed'};
    const proteinEnergyPercent = amount * 4 / energy * 100;
    return {...base, proteinEnergyPercent, level: proteinEnergyPercent >= 20 ? 'high' : proteinEnergyPercent >= 12 ? 'source' : 'none'};
  }
  const fibrePer100Kcal = energy !== null && energy > 0 ? amount * 100 / energy : undefined;
  const level: HighlightLevel = amount >= 6 || (fibrePer100Kcal !== undefined && fibrePer100Kcal >= 3)
    ? 'high'
    : amount >= 3 || (fibrePer100Kcal !== undefined && fibrePer100Kcal >= 1.5)
      ? 'source'
      : fibrePer100Kcal === undefined && amount > 0
        ? 'unassessed'
        : 'none';
  return {...base, ...(fibrePer100Kcal === undefined ? {} : {fibrePer100Kcal}), level};
}
