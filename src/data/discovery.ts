import type {DatasetManifest} from '../domain/types';
import {DISCOVERY_RULE_VERSION} from '../domain/discovery';

export interface DiscoveryRankedFood {id: number; value: number}
export interface DiscoveryRankingBasis {eligible: number; top: DiscoveryRankedFood[]}
export interface DiscoveryNutrientRanking {
  key: string;
  unit: string;
  per100g: DiscoveryRankingBasis;
  per100kcal: DiscoveryRankingBasis;
}
export interface DiscoveryRankings {
  schemaVersion: 1;
  snapshotId: string;
  ruleVersion: string;
  nutrients: DiscoveryNutrientRanking[];
}

export const DISCOVERY_NUTRIENTS = [
  {key: 'PROT|g|per100g', unit: 'g'},
  {key: 'FIBT|g|per100g', unit: 'g'},
  {key: 'VITC|mg|per100g', unit: 'mg'},
  {key: 'FE|mg|per100g', unit: 'mg'},
  {key: 'CA|mg|per100g', unit: 'mg'},
  {key: 'VITD|µg|per100g', unit: 'µg'},
  {key: 'VITB12|µg|per100g', unit: 'µg'},
  {key: 'K|mg|per100g', unit: 'mg'},
  {key: 'MG|mg|per100g', unit: 'mg'},
  {key: 'ZN|mg|per100g', unit: 'mg'},
] as const;

let cached: {snapshotId: string; promise: Promise<DiscoveryRankings>} | undefined;
export function clearDiscoveryCache(): void {cached = undefined;}
function validBasis(basis: DiscoveryRankingBasis): boolean {
  if (!basis || !Number.isInteger(basis.eligible) || basis.eligible < 0 || !Array.isArray(basis.top) || basis.top.length !== Math.min(100, basis.eligible)) return false;
  const ids = new Set<number>();
  for (let index = 0; index < basis.top.length; index++) {
    const row = basis.top[index];
    if (!row || !Number.isInteger(row.id) || row.id <= 0 || !Number.isFinite(row.value) || row.value < 0 || ids.has(row.id)) return false;
    const previous = basis.top[index - 1];
    if (previous && (previous.value < row.value || previous.value === row.value && previous.id > row.id)) return false;
    ids.add(row.id);
  }
  return true;
}
function validAsset(data: DiscoveryRankings, snapshotId: string): boolean {
  return data?.schemaVersion === 1 && data.snapshotId === snapshotId && data.ruleVersion === DISCOVERY_RULE_VERSION &&
    Array.isArray(data.nutrients) && data.nutrients.length === DISCOVERY_NUTRIENTS.length &&
    DISCOVERY_NUTRIENTS.every((expected, index) => {
      const ranking = data.nutrients[index];
      return ranking?.key === expected.key && ranking.unit === expected.unit && validBasis(ranking.per100g) && validBasis(ranking.per100kcal);
    });
}

/** One lazy snapshot asset. Rejected loads leave the next attempt free to retry. */
export function loadDiscoveryRankings(manifest: DatasetManifest): Promise<DiscoveryRankings> {
  const path = manifest.discoveryPath;
  if (path !== `data/${manifest.snapshotId}/discovery.json`) return Promise.reject(Error('Discovery path mismatch'));
  if (cached?.snapshotId === manifest.snapshotId) return cached.promise;
  const promise = fetch(import.meta.env.BASE_URL + path)
    .then(response => {
      if (!response.ok) throw Error(`Discovery data unavailable (${response.status})`);
      return response.json() as Promise<DiscoveryRankings>;
    })
    .then(data => {
      if (!validAsset(data, manifest.snapshotId)) {
        throw Error('Discovery snapshot mismatch');
      }
      return data;
    })
    .catch(error => {if (cached?.promise === promise) cached = undefined; throw error;});
  cached = {snapshotId: manifest.snapshotId, promise};
  return promise;
}
