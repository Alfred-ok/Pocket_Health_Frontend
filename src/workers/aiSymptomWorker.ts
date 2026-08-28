import { pipeline, TextStreamer, type TextGenerationPipeline } from "@huggingface/transformers";

const MODEL_ID = "HuggingFaceTB/SmolLM2-135M-Instruct";

let generatorPromise: Promise<TextGenerationPipeline> | null = null;

function getGenerator() {
  if (!generatorPromise) {
    generatorPromise = pipeline("text-generation", MODEL_ID, {
      dtype: "q4",
      progress_callback: (data: any) => {
        self.postMessage({ type: "progress", data });
      },
    }) as Promise<TextGenerationPipeline>;
  }
  return generatorPromise;
}

self.onmessage = async (e: MessageEvent) => {
  const { type, prompt } = e.data ?? {};

  if (type === "load") {
    try {
      await getGenerator();
      self.postMessage({ type: "ready" });
    } catch (err) {
      self.postMessage({ type: "error", error: err instanceof Error ? err.message : String(err) });
    }
    return;
  }

  if (type === "generate") {
    try {
      const generator = await getGenerator();
      const streamer = new TextStreamer(generator.tokenizer, {
        skip_prompt: true,
        skip_special_tokens: true,
        callback_function: (text: string) => {
          self.postMessage({ type: "token", text });
        },
      });

      await generator(
        [{ role: "user", content: prompt }],
        { max_new_tokens: 220, temperature: 0.6, do_sample: true, streamer } as any
      );

      self.postMessage({ type: "done" });
    } catch (err) {
      self.postMessage({ type: "error", error: err instanceof Error ? err.message : String(err) });
    }
  }
};
