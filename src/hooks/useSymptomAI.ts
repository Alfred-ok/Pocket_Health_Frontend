import { useCallback, useRef, useState } from "react";
import symptomAiApi, { type SymptomCheckRequest } from "../api/symptomAiApi";

export type SymptomAIStatus = "idle" | "generating" | "done" | "error";

export function useSymptomAI() {
  const [status, setStatus] = useState<SymptomAIStatus>("idle");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const run = useCallback(
    (symptoms: string[], possibleConditions: string[], context?: Pick<SymptomCheckRequest, "audience" | "weeks">) => {
      const requestId = ++requestIdRef.current;
      setStatus("generating");
      setOutput("");
      setError(null);

      symptomAiApi
        .analyze({ symptoms, possibleConditions, ...context })
        .then((analysis) => {
          if (requestIdRef.current !== requestId) return;
          setOutput(analysis);
          setStatus("done");
        })
        .catch((err) => {
          if (requestIdRef.current !== requestId) return;
          setError(err?.response?.data?.message ?? "Something went wrong getting the AI analysis.");
          setStatus("error");
        });
    },
    []
  );

  const reset = useCallback(() => {
    requestIdRef.current++;
    setStatus("idle");
    setOutput("");
    setError(null);
  }, []);

  return { status, output, error, run, reset };
}
