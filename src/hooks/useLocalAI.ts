import { useCallback, useEffect, useRef, useState } from "react";

export type LocalAIStatus = "idle" | "loading-model" | "generating" | "done" | "error";

interface ProgressInfo {
  file?: string;
  progress?: number; // 0-100
}

export function useLocalAI() {
  const [status, setStatus] = useState<LocalAIStatus>("idle");
  const [progress, setProgress] = useState<ProgressInfo | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const modelReadyRef = useRef(false);

  const getWorker = useCallback(() => {
    if (workerRef.current) return workerRef.current;

    const worker = new Worker(new URL("../workers/aiSymptomWorker.ts", import.meta.url), { type: "module" });

    worker.onmessage = (e: MessageEvent) => {
      const { type } = e.data ?? {};
      if (type === "progress") {
        const data = e.data.data ?? {};
        setProgress({
          file: data.file,
          progress: typeof data.progress === "number" ? Math.round(data.progress) : undefined,
        });
      } else if (type === "ready") {
        modelReadyRef.current = true;
        setProgress(null);
        setStatus((prev) => (prev === "loading-model" ? "generating" : prev));
      } else if (type === "token") {
        setOutput((prev) => prev + e.data.text);
      } else if (type === "done") {
        setStatus("done");
      } else if (type === "error") {
        setStatus("error");
        setError(e.data.error ?? "Something went wrong running the local model.");
      }
    };

    worker.onerror = (e: ErrorEvent) => {
      setStatus("error");
      setError(e.message || "The AI worker failed to start.");
    };
    worker.onmessageerror = () => {
      setStatus("error");
      setError("The AI worker sent an unreadable message.");
    };

    workerRef.current = worker;
    return worker;
  }, []);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const run = useCallback(
    (prompt: string) => {
      setError(null);
      setOutput("");
      const worker = getWorker();

      if (modelReadyRef.current) {
        setStatus("generating");
        worker.postMessage({ type: "generate", prompt });
      } else {
        setStatus("loading-model");
        // The worker replies with "ready" once loaded, then we send the generate request.
        const onReady = (e: MessageEvent) => {
          if (e.data?.type === "ready") {
            worker.removeEventListener("message", onReady);
            worker.postMessage({ type: "generate", prompt });
          }
        };
        worker.addEventListener("message", onReady);
        worker.postMessage({ type: "load" });
      }
    },
    [getWorker]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setOutput("");
    setError(null);
    setProgress(null);
  }, []);

  return { status, progress, output, error, run, reset };
}
