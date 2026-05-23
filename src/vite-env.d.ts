/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  /** Pilih provider AI: "gemini" (default) | "openai" | "openrouter". */
  readonly VITE_AI_PROVIDER?: "gemini" | "openai" | "openrouter";
  /** Override model id provider terpilih (opsional). */
  readonly VITE_AI_MODEL?: string;
  /** Universal API key. Boleh dipakai apapun provider-nya. */
  readonly VITE_AI_API_KEY?: string;
  /** Provider-specific keys. Lebih prioritas dari VITE_AI_API_KEY. */
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_OPENAI_API_KEY?: string;
  readonly VITE_OPENROUTER_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt: () => Promise<void>;
}
