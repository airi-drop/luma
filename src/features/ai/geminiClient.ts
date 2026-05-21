import type { GeminiRequestOptions } from "./types";
import { AIError } from "./types";

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

export async function geminiGenerate({
  prompt,
  signal,
  timeoutMs = 8000,
}: GeminiRequestOptions) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new AIError("MISSING_API_KEY");
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort("timeout");
  }, timeoutMs);

  const abortController = () => {
    controller.abort("aborted");
  };

  signal?.addEventListener("abort", abortController, { once: true });

  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    });

    if (response.status >= 400 && response.status < 500) {
      throw new AIError("HTTP_4XX");
    }

    if (response.status >= 500) {
      throw new AIError("HTTP_5XX");
    }

    const payload = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
          }>;
        };
      }>;
    };

    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      throw new AIError("EMPTY_RESPONSE");
    }

    return text;
  } catch (error) {
    if (error instanceof AIError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new AIError(signal?.aborted ? "NETWORK" : "TIMEOUT");
    }

    throw new AIError("NETWORK");
  } finally {
    window.clearTimeout(timeoutId);
    signal?.removeEventListener("abort", abortController);
  }
}
