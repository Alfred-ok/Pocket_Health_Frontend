import { useState } from "react";
import { Link } from "react-router";
import Badge, { BadgeColor } from "../ui/badge/Badge";
import AiSymptomPanel from "./AiSymptomPanel";
import {
  CHILD_SYMPTOM_GROUP,
  PREGNANCY_SYMPTOM_GROUP,
  SYMPTOM_GROUPS,
  URGENCY_LABELS,
  type PregnancyStatus,
  type Urgency,
} from "../../constants/healthConditions";
import { useSymptomChecker, type CheckerFilter } from "../../hooks/useSymptomChecker";

const urgencyColors: Record<Urgency, BadgeColor> = {
  "self-care": "success",
  "see-doctor": "info",
  urgent: "warning",
  emergency: "error",
};

/** Lactation duration bands; the value is a representative "weeks since delivery". */
const LACTATION_BANDS = [
  { label: "0-6 weeks", weeks: 3 },
  { label: "6 weeks - 3 months", weeks: 9 },
  { label: "3-6 months", weeks: 20 },
  { label: "6-12 months", weeks: 40 },
  { label: "Over 12 months", weeks: 60 },
];

const PREGNANCY_WEEKS = Array.from({ length: 42 }, (_, i) => i + 1);

const selectClass =
  "h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300";

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

interface SymptomCheckerPanelProps {
  /** "adult" = 12+ and not pregnant; "child" = under 12 (locked); "pregnancy" = pregnant or lactating. */
  audience: CheckerFilter["audience"];
  /** Stack the picker and results in one column, for use inside a module's content pane. */
  stacked?: boolean;
}

export default function SymptomCheckerPanel({ audience, stacked = false }: SymptomCheckerPanelProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<PregnancyStatus>("pregnant");
  const [pregnancyWeeks, setPregnancyWeeks] = useState(12);
  const [lactationWeeks, setLactationWeeks] = useState(LACTATION_BANDS[0].weeks);

  const filter: CheckerFilter =
    audience === "pregnancy"
      ? { audience, status, weeks: status === "pregnant" ? pregnancyWeeks : lactationWeeks }
      : { audience };
  const matches = useSymptomChecker(selected, filter);

  const groups =
    audience === "child"
      ? [CHILD_SYMPTOM_GROUP, ...SYMPTOM_GROUPS]
      : audience === "pregnancy"
        ? [PREGNANCY_SYMPTOM_GROUP, ...SYMPTOM_GROUPS]
        : SYMPTOM_GROUPS;

  const toggle = (symptom: string) => {
    setSelected((prev) => (prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]));
  };

  return (
    <div>
      <div className="mb-5 rounded-2xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-700 dark:border-warning-800 dark:bg-warning-500/10 dark:text-warning-400">
        <strong>Not a diagnosis.</strong> This tool compares the symptoms you pick against a small reference database
        of common conditions to help you decide what to do next. It cannot replace a clinician. If you're seriously
        unwell, use the{" "}
        <Link to="/emergency" className="underline">
          Emergency module
        </Link>{" "}
        or book a provider.
      </div>

      {audience === "adult" && (
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          This checker is for people aged 12 and over who are not pregnant. For a child under 12, use{" "}
          <Link to="/health-library/child_immunisation?section=symptom-checker" className="text-brand-500 underline">
            Unwell Child
          </Link>
          . If you are pregnant or breastfeeding, use{" "}
          <Link to="/health-library/pregnancy_lactation?section=symptom-checker" className="text-brand-500 underline">
            Unwell in Pregnancy/Lactation
          </Link>
          .
        </p>
      )}

      {audience === "child" && (
        <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="info" size="sm">
              Age filter: under 12 years
            </Badge>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Applied automatically — only conditions relevant to children are shown.
            </span>
          </div>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            <strong>Get help urgently</strong> for a high fever in a baby under 3 months, difficulty breathing,
            persistent vomiting, unusual drowsiness, a fit, or a rash that doesn't fade when pressed with a glass.
          </p>
        </div>
      )}

      {audience === "pregnancy" && (
        <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                I am
              </p>
              <div className="inline-flex rounded-lg border border-gray-300 p-0.5 dark:border-gray-700">
                {(["pregnant", "lactating"] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setStatus(option)}
                    className={`rounded-md px-3 py-1.5 text-sm transition ${
                      status === option
                        ? "bg-brand-500 text-white"
                        : "text-gray-600 hover:text-brand-600 dark:text-gray-300"
                    }`}
                  >
                    {option === "pregnant" ? "Pregnant" : "Breastfeeding / after delivery"}
                  </button>
                ))}
              </div>
            </div>

            {status === "pregnant" ? (
              <label className="text-sm text-gray-600 dark:text-gray-300">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  Weeks pregnant
                </span>
                <select
                  className={selectClass}
                  value={pregnancyWeeks}
                  onChange={(e) => setPregnancyWeeks(Number(e.target.value))}
                >
                  {PREGNANCY_WEEKS.map((w) => (
                    <option key={w} value={w}>
                      {w} {w === 1 ? "week" : "weeks"}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="text-sm text-gray-600 dark:text-gray-300">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  Time since delivery
                </span>
                <select
                  className={selectClass}
                  value={lactationWeeks}
                  onChange={(e) => setLactationWeeks(Number(e.target.value))}
                >
                  {LACTATION_BANDS.map((band) => (
                    <option key={band.label} value={band.weeks}>
                      {band.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            Only conditions relevant to this stage are shown. In pregnancy and while breastfeeding, take medicines —
            including over-the-counter ones — only on a clinician's advice.
          </p>
        </div>
      )}

      <div className={stacked ? "space-y-6" : "grid grid-cols-1 gap-6 lg:grid-cols-5"}>
        <div className={stacked ? "" : "lg:col-span-3"}>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                {audience === "child" ? "What is the child experiencing?" : "What are you experiencing?"}
              </h3>
              {selected.length > 0 && (
                <button onClick={() => setSelected([])} className="text-sm text-gray-400 hover:text-error-500">
                  Clear ({selected.length})
                </button>
              )}
            </div>

            <div className="space-y-5">
              {groups.map((group) => (
                <div key={group.label}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    {group.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.symptoms.map((symptom) => {
                      const isSelected = selected.includes(symptom);
                      return (
                        <button
                          key={symptom}
                          onClick={() => toggle(symptom)}
                          className={`rounded-full border px-3 py-1.5 text-sm capitalize transition ${
                            isSelected
                              ? "border-brand-500 bg-brand-500 text-white"
                              : "border-gray-300 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                          }`}
                        >
                          {symptom}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AiSymptomPanel selectedSymptoms={selected} topMatches={matches} filter={filter} />
        </div>

        <div className={stacked ? "" : "lg:col-span-2"}>
          <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
            Possible conditions {matches.length > 0 && `(${matches.length})`}
          </h3>

          {selected.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select one or more symptoms to see matching conditions.
            </p>
          )}

          {selected.length > 0 && matches.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No close matches in the reference database for this combination. If symptoms persist or worsen, see a
              provider.
            </p>
          )}

          <div className="space-y-3">
            {matches.map(({ condition, matchedSymptoms, matchPercent, urgency }) => (
              <div
                key={condition.id}
                className={`rounded-2xl border bg-white p-4 dark:bg-white/[0.03] ${
                  urgency === "emergency"
                    ? "border-error-300 dark:border-error-800"
                    : "border-gray-200 dark:border-gray-800"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">{condition.name}</h4>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{condition.category}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-brand-500">{matchPercent}% match</span>
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge color={urgencyColors[urgency]} size="sm">
                    {URGENCY_LABELS[urgency]}
                  </Badge>
                  {matchedSymptoms.map((s) => (
                    <Badge key={s} color="light" size="sm">
                      {capitalize(s)}
                    </Badge>
                  ))}
                </div>

                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{condition.description}</p>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  <strong>What to do: </strong>
                  {condition.advice}
                </p>

                {urgency === "emergency" && (
                  <Link
                    to="/emergency"
                    className="mt-3 inline-flex items-center justify-center rounded-lg bg-error-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-error-600"
                  >
                    Go to Emergency module
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
