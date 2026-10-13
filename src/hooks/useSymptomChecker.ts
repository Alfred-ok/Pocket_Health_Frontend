import { useMemo } from "react";
import {
  HEALTH_CONDITIONS,
  type Audience,
  type HealthCondition,
  type PregnancyStatus,
  type Urgency,
} from "../constants/healthConditions";

export interface ConditionMatch {
  condition: HealthCondition;
  matchedSymptoms: string[];
  matchPercent: number; // 0-100, blend of how much of the condition's profile and the user's input this covers
  /** Urgency after context adjustments (e.g. raised in pregnancy) — show this rather than condition.urgency. */
  urgency: Urgency;
}

/**
 * Who the checker is for. Adult Unwell uses "adult" (12+, not pregnant); Child Health uses
 * "child" (under 12, filter locked); Pregnancy & Lactation adds the stage and how many weeks in.
 */
export type CheckerFilter =
  | { audience: "adult" }
  | { audience: "child" }
  | { audience: "pregnancy"; status: PregnancyStatus; weeks: number };

const MIN_MATCH_PERCENT = 20;
const MAX_RESULTS = 6;

function appliesTo(condition: HealthCondition, filter: CheckerFilter): boolean {
  const audiences: Audience[] = condition.audiences ?? ["adult", "child", "pregnancy"];
  if (!audiences.includes(filter.audience)) return false;
  if (filter.audience !== "pregnancy" || !condition.stages) return true;
  return condition.stages.some(
    (stage) =>
      stage.status === filter.status &&
      (stage.minWeeks === undefined || filter.weeks >= stage.minWeeks) &&
      (stage.maxWeeks === undefined || filter.weeks <= stage.maxWeeks)
  );
}

/**
 * In pregnancy and breastfeeding even "self-care" illnesses need a clinician's say on medicines, so
 * general conditions are raised to at least "see a doctor" there.
 */
function adjustedUrgency(condition: HealthCondition, filter: CheckerFilter): Urgency {
  if (filter.audience === "pregnancy" && !condition.audiences && condition.urgency === "self-care") {
    return "see-doctor";
  }
  return condition.urgency;
}

export function useSymptomChecker(
  selectedSymptoms: string[],
  filter: CheckerFilter = { audience: "adult" }
): ConditionMatch[] {
  return useMemo(() => {
    if (selectedSymptoms.length === 0) return [];
    const selected = new Set(selectedSymptoms);

    const results = HEALTH_CONDITIONS.filter((c) => appliesTo(c, filter))
      .map((condition) => {
        const matchedSymptoms = condition.symptoms.filter((s) => selected.has(s));
        if (matchedSymptoms.length === 0) return null;

        const coverage = matchedSymptoms.length / condition.symptoms.length; // how much of the condition this explains
        const precision = matchedSymptoms.length / selected.size; // how much of the user's input this explains
        const matchPercent = Math.round(((coverage + precision) / 2) * 100);

        return {
          condition,
          matchedSymptoms,
          matchPercent,
          urgency: adjustedUrgency(condition, filter),
        } satisfies ConditionMatch;
      })
      .filter((m): m is ConditionMatch => m !== null && m.matchPercent >= MIN_MATCH_PERCENT);

    return results.sort((a, b) => b.matchPercent - a.matchPercent).slice(0, MAX_RESULTS);
    // filter is compared by value so callers can pass an inline object
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSymptoms, JSON.stringify(filter)]);
}
