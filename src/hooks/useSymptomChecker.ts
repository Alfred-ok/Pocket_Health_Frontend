import { useMemo } from "react";
import { HEALTH_CONDITIONS, type HealthCondition } from "../constants/healthConditions";

export interface ConditionMatch {
  condition: HealthCondition;
  matchedSymptoms: string[];
  matchPercent: number; // 0-100, blend of how much of the condition's profile and the user's input this covers
}

const MIN_MATCH_PERCENT = 20;
const MAX_RESULTS = 6;

export function useSymptomChecker(selectedSymptoms: string[]): ConditionMatch[] {
  return useMemo(() => {
    if (selectedSymptoms.length === 0) return [];
    const selected = new Set(selectedSymptoms);

    const results = HEALTH_CONDITIONS.map((condition) => {
      const matchedSymptoms = condition.symptoms.filter((s) => selected.has(s));
      if (matchedSymptoms.length === 0) return null;

      const coverage = matchedSymptoms.length / condition.symptoms.length; // how much of the condition this explains
      const precision = matchedSymptoms.length / selected.size; // how much of the user's input this explains
      const matchPercent = Math.round(((coverage + precision) / 2) * 100);

      return { condition, matchedSymptoms, matchPercent } satisfies ConditionMatch;
    }).filter((m): m is ConditionMatch => m !== null && m.matchPercent >= MIN_MATCH_PERCENT);

    return results.sort((a, b) => b.matchPercent - a.matchPercent).slice(0, MAX_RESULTS);
  }, [selectedSymptoms]);
}
