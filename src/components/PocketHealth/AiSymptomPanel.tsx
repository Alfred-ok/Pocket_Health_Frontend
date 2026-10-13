import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";
import { useSymptomAI } from "../../hooks/useSymptomAI";
import type { CheckerFilter, ConditionMatch } from "../../hooks/useSymptomChecker";

interface AiSymptomPanelProps {
  selectedSymptoms: string[];
  topMatches: ConditionMatch[];
  filter?: CheckerFilter;
}

export default function AiSymptomPanel({ selectedSymptoms, topMatches, filter }: AiSymptomPanelProps) {
  const { status, output, error, run, reset } = useSymptomAI();

  const canRun = selectedSymptoms.length > 0;
  const isBusy = status === "generating";

  const handleRun = () => {
    reset();
    run(
      selectedSymptoms,
      topMatches.slice(0, 3).map((m) => m.condition.name),
      filter?.audience === "pregnancy"
        ? { audience: filter.status, weeks: filter.weeks }
        : { audience: filter?.audience ?? "adult" }
    );
  };

  return (
    <div className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5 dark:border-gray-700 dark:bg-white/[0.02]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            AI-assisted analysis <Badge color="light" size="sm">Experimental</Badge>
          </h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Sends your selected symptoms to a fast external AI model (Groq, running Llama 3.1) for a plain-language
            explanation. Nothing else about you is shared.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={handleRun} disabled={!canRun || isBusy}>
          {isBusy ? "Working..." : "Run AI check"}
        </Button>
      </div>

      {!canRun && status === "idle" && (
        <p className="mt-3 text-sm text-gray-400 dark:text-gray-500">Select at least one symptom first.</p>
      )}

      {status === "generating" && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Thinking...</p>
      )}

      {status === "done" && output && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{output}</p>
        </div>
      )}

      {status === "error" && <p className="mt-4 text-sm text-error-500">{error}</p>}

      {status === "done" && (
        <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
          AI-generated — treat this as a rough pointer, not medical advice.
        </p>
      )}
    </div>
  );
}
