export interface RankingFoodInput {
  id: number;
  nutrients: Array<{key: string; value: number | null; status: 'known' | 'unknown'}>;
}
export interface RankingBasis {eligible: number; top: Array<{id: number; value: number}>}
export interface NutrientRanking {key: string; unit: string; per100g: RankingBasis; per100kcal: RankingBasis}
export declare const discoveryRuleVersion: string;
export declare const discoveryNutrients: Array<[string,string]>;
export declare function generateDiscoveryRankings(snapshotId: string, foods: RankingFoodInput[]): {
  schemaVersion: 1;
  snapshotId: string;
  ruleVersion: string;
  nutrients: NutrientRanking[];
};
export declare function checksum(text: string): string;
