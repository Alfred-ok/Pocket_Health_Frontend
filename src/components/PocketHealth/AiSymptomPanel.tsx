import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";
import { useLocalAI } from "../../hooks/useLocalAI";
import type { ConditionMatch } from "../../hooks/useSymptomChecker";

interface AiSymptomPanelProps {
  selectedSymptoms: string[];
  topMatches: ConditionMatch[];
}

function buildPrompt(selectedSymptoms: string[], topMatches: ConditionMatch[]): string {
  const symptomList = selectedSymptoms.join(", ");
  const conditionHint = topMatches.length
    ? ` A reference database also flagged these as possible matches: ${topMatches
        .slice(0, 3)
        .map((m) => m.condition.name)
        .join(", ")}.`
    : "";
  return (
    `A person reports these symptoms: ${symptomList}.${conditionHint} ` +
    `In plain, reassuring language and under 120 words, explain what might be going on and what they should ` +
    `consider doing next. Do not give a definite diagnosis, and recommend seeing a doctor for anything serious.`
  );
}

export default function AiSymptomPanel({ selectedSymptoms, topMatches }: AiSymptomPanelProps) {
  const { status, progress, output, error, run, reset } = useLocalAI();

  const canRun = selectedSymptoms.length > 0;
  const isBusy = status === "loading-model" || status === "generating";

  const handleRun = () => {
    reset();
    run(buildPrompt(selectedSymptoms, topMatches));
  };

  return (
    <div className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5 dark:border-gray-700 dark:bg-white/[0.02]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            AI-assisted analysis <Badge color="light" size="sm">Experimental</Badge>
          </h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Runs a small open-source language model (SmolLM2-135M-Instruct) entirely in your browser — nothing is
            sent to a server. First run downloads the model (~100-150MB) and caches it for next time. Needs a
            recent Chrome/Edge browser; may be slow on older devices.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={handleRun} disabled={!canRun || isBusy}>
          {isBusy ? "Working..." : "Run AI check"}
        </Button>
      </div>

      {!canRun && status === "idle" && (
        <p className="mt-3 text-sm text-gray-400 dark:text-gray-500">Select at least one symptom first.</p>
      )}

      {status === "loading-model" && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Downloading model{progress?.file ? `: ${progress.file}` : "..."}
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-brand-500 transition-all"
              style={{ width: `${progress?.progress ?? 0}%` }}
            />
          </div>
        </div>
      )}

      {(status === "generating" || status === "done") && output && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
            {output}
            {status === "generating" && <span className="animate-pulse">▍</span>}
          </p>
        </div>
      )}

      {status === "generating" && !output && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Generating...</p>
      )}

      {status === "error" && (
        <p className="mt-4 text-sm text-error-500">
          {error} — your browser may not support in-browser AI (needs WebGPU or WASM support).
        </p>
      )}

      {status === "done" && (
        <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
          AI-generated from a tiny local model — treat this as a rough pointer, not medical advice.
        </p>
      )}
    </div>
  );
}
