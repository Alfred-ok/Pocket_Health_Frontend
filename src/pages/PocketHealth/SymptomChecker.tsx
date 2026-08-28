import { useState } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge, { BadgeColor } from "../../components/ui/badge/Badge";
import AiSymptomPanel from "../../components/PocketHealth/AiSymptomPanel";
import { SYMPTOM_GROUPS, URGENCY_LABELS, type Urgency } from "../../constants/healthConditions";
import { useSymptomChecker } from "../../hooks/useSymptomChecker";

const urgencyColors: Record<Urgency, BadgeColor> = {
  "self-care": "success",
  "see-doctor": "info",
  urgent: "warning",
  emergency: "error",
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function SymptomChecker() {
  const [selected, setSelected] = useState<string[]>([]);
  const matches = useSymptomChecker(selected);

  const toggle = (symptom: string) => {
    setSelected((prev) => (prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]));
  };

  return (
    <>
      <PageMeta
        title="Symptom Checker | PocketHealth"
        description="Check your symptoms against common health conditions."
      />
      <PageBreadcrumb pageTitle="Symptom Checker & Health Conditions" />

      <div className="mb-5 rounded-2xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-700 dark:border-warning-800 dark:bg-warning-500/10 dark:text-warning-400">
        <strong>Not a diagnosis.</strong> This tool compares the symptoms you pick against a small reference database
        of common conditions to help you decide what to do next. It cannot replace a clinician. If you're seriously
        unwell, use the{" "}
        <Link to="/emergency" className="underline">
          Emergency module
        </Link>{" "}
        or book a provider.
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800 dark:text-white/90">What are you experiencing?</h3>
              {selected.length > 0 && (
                <button
                  onClick={() => setSelected([])}
                  className="text-sm text-gray-400 hover:text-error-500"
                >
                  Clear ({selected.length})
                </button>
              )}
            </div>

            <div className="space-y-5">
              {SYMPTOM_GROUPS.map((group) => (
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

          <AiSymptomPanel selectedSymptoms={selected} topMatches={matches} />
        </div>

        <div className="lg:col-span-2">
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
            {matches.map(({ condition, matchedSymptoms, matchPercent }) => (
              <div
                key={condition.id}
                className={`rounded-2xl border bg-white p-4 dark:bg-white/[0.03] ${
                  condition.urgency === "emergency"
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
                  <Badge color={urgencyColors[condition.urgency]} size="sm">
                    {URGENCY_LABELS[condition.urgency]}
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

                {condition.urgency === "emergency" && (
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
    </>
  );
}
