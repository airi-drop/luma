# Implementation Plan: Sprint 10 — Gemini AI Parser

## Overview

Replace `AIQuickInputPlaceholder` (Sprint 3 stub) with a real `AIQuickInput` component inside `AddTransactionSheet`'s AI tab. Add a `geminiClient` for the Gemini REST API, a `transactionParser` orchestration module, an `AIParsePreviewSheet` for editing before save, and a `voiceInput` adapter over Web Speech API. Wire `aiEnabled` toggle in Settings. Persist via `transactionStore.createTransaction({ source: "ai" })` and increment `aiUsageRepo.incrementInput(currentMonth)` on every successful save. Manual flow stays the default and never blocks. Implementation follows a bottom-up approach: types and pure helpers first, then the network client, then the orchestration parser, then the voice adapter, then the UI components, then the preview sheet, then settings wiring, then the AddTransactionSheet swap.

## Tasks

- [ ] 1. Define AI types and frozen copy
  - [ ] 1.1 Create `src/features/ai/types.ts`
    - Define `AIStatus = "idle" | "parsing" | "listening"`.
    - Define `ParserDraft` interface `{ detail: string, nominal: number | string, account: string, category: string, confidence: number }`.
    - Define `ParseResult` interface `{ detail: string, nominal: number, account: AccountType, category: CategoryType, confidence: number }`.
    - Define `AIErrorCode` union covering `AI_DISABLED | EMPTY_INPUT | MISSING_API_KEY | NETWORK | TIMEOUT | HTTP_4XX | HTTP_5XX | EMPTY_RESPONSE | PARSE_FAILED | VALIDATION_FAILED | VOICE_UNSUPPORTED | VOICE_DENIED | VOICE_FAILED`.
    - Define `VoiceTranscriptEvent` and `VoiceController` interfaces matching the design.
    - Define `GeminiRequestOptions` interface.
    - _Requirements: 8.10, 12.1_

  - [ ] 1.2 Create `src/features/ai/errors.ts`
    - Export `class AIError extends Error` with constructor `(code: AIErrorCode, message?: string)` storing `code` as a public readonly field.
    - _Requirements: 4.3, 4.7, 4.8, 4.9, 4.10, 4.11, 6.2, 6.6, 6.7, 8.1, 8.3, 8.4, 8.5, 12.2, 12.8, 12.9_

  - [ ] 1.3 Create `src/features/ai/copy.ts`
    - Export `AI_TOAST_COPY` as a frozen const object with keys `PARSE_FAILED`, `AI_DISABLED`, `EMPTY_INPUT`, `MISSING_API_KEY`, `VOICE_UNSUPPORTED`, `VOICE_DENIED`, `SAVE_OK`, `SAVE_FAILED`, with the exact strings from the design `AI_TOAST_COPY` table.
    - _Requirements: 9.5, 9.6, 11.5, 11.7, 12.15, 12.16, 15.2, 15.3, 15.4, 15.5, 15.6, 17.3, 17.5_

- [ ] 2. Implement pure helpers (prompt, fence-strip, amount, enum)
  - [ ] 2.1 Create `src/features/ai/parserPrompt.ts` with `buildParserPrompt(text)`
    - Pure function returning a single string built from the static template + the trimmed user text interpolated exactly once.
    - Template SHALL include the literal substrings: allowed accounts (`Cash`, `E-wallet`, `BNI`, `BCA`, `Mandiri`, `Other`), allowed categories (`Food`, `Transport`, `Entertainment`, `Shopping`, `Health`, `Giving`, `Saving`, `Other`), JSON-only instruction, IDR no-thousand-separators rule, slang normalization examples (`15rb`, `15k`, `1.5jt`, `250k`), and "do not invent → use Other with lowered confidence" rule.
    - SHALL NOT import `transactionStore`, any repo, or any Zustand store.
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 13.4_

  - [ ] 2.2 Add `stripMarkdownFence(raw)` to `src/features/ai/transactionParser.ts` (or a sibling helper module)
    - Match `/^\s*```(?:json)?\s*\n([\s\S]*?)\n```\s*$/i`; when matched, return `match[1].trim()`.
    - Otherwise return `raw.trim()`.
    - Pure, deterministic, idempotent.
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 2.3 Create `src/features/ai/amountNormalizer.ts` with `normalizeAmount(value)`
    - Accept `number | string`.
    - For `number`: throw `AIError("VALIDATION_FAILED", "amount")` if not finite or < 1; else return `Math.round(value)`.
    - For `string`: trim, lowercase, strip whitespace, replace `,` with `.`, strip leading `rp`.
    - Match `/^(\d+(?:\.\d+)?)(k|rb|ribu|jt|juta|m)?$/`; multipliers: `""`→1, `k|rb|ribu`→1000, `jt|juta|m`→1_000_000.
    - Fallback: dotted thousand separator (e.g. `"1.500.000"`) — strip dots, parse integer, return when ≥ 1.
    - Throw `AIError("VALIDATION_FAILED", "amount")` for any other input.
    - All canonical pairs from Requirement 6.8 SHALL pass.
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10_

  - [ ] 2.4 Create `src/features/ai/enumSnap.ts` with `snapCategory` and `snapAccount`
    - Export `CATEGORY_VALUES` and `ACCOUNT_VALUES` as readonly tuples matching the Sprint 2 enums.
    - Export internal `snapEnum(input, allowed, fallback)` per the design pseudocode: empty/non-string → fallback; exact case-insensitive match → that enum; containment in either direction → first match; small synonym table → mapped enum; else fallback.
    - Synonym table SHALL include at minimum: `makan`/`makanan`/`minum`/`kuliner` → `Food`; `gojek`/`grab`/`ojek`/`bensin`/`parkir` → `Transport`; `konser`/`film`/`hiburan` → `Entertainment`; `belanja`/`baju`/`shopping` → `Shopping`; `obat`/`klinik`/`kesehatan` → `Health`; `donasi`/`sedekah`/`amal` → `Giving`; `tabungan`/`nabung` → `Saving`; `tunai`/`cash` → `Cash`; `gopay`/`ovo`/`dana`/`shopeepay`/`ewallet`/`e-wallet` → `E-wallet`; `bni` → `BNI`; `bca` → `BCA`; `mandiri` → `Mandiri`.
    - Export `snapCategory(input): CategoryType` and `snapAccount(input): AccountType`.
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [ ]* 2.5 Property tests for pure helpers (P5, P6, P8)
    - **Property P8 (slang round-trip)**: For every canonical pair `(input, expected)` from Requirement 6.8, `normalizeAmount(input) === expected`.
    - **Property P6 (positive integer)**: For arbitrary valid inputs (mix of numbers ≥ 1 and slang strings), `Number.isInteger(normalizeAmount(x)) && normalizeAmount(x) ≥ 1`.
    - **Property P5 (enum totality)**: For arbitrary `fc.string()`, `snapCategory(s) ∈ CATEGORY_VALUES` and `snapAccount(s) ∈ ACCOUNT_VALUES`.
    - **Property (fence-strip idempotency)**: For arbitrary `fc.string()`, `stripMarkdownFence(stripMarkdownFence(s)) === stripMarkdownFence(s)`.
    - **Validates: Requirements 5.4, 6.8, 6.9, 7.1, 7.2**

- [ ] 3. Implement geminiClient (REST + timeout + error mapping)
  - [ ] 3.1 Create `src/features/ai/geminiClient.ts` with `geminiGenerate(opts)`
    - Read API key from `import.meta.env.VITE_GEMINI_API_KEY`; throw `AIError("MISSING_API_KEY")` BEFORE any network call when missing/empty.
    - Build URL `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`.
    - Build body `{ contents: [{ role: "user", parts: [{ text: opts.prompt }] }], generationConfig: { temperature: 0.1, responseMimeType: "application/json" } }`.
    - Compose abort: own `AbortController` aborted by `setTimeout(opts.timeoutMs ?? 8000)`; if `opts.signal` provided, forward its abort to controller.
    - On caught fetch error: if controller's reason is `"TIMEOUT"`, throw `AIError("TIMEOUT")`; else throw `AIError("NETWORK")`.
    - Always `clearTimeout(timer)` in `finally`.
    - Map status: `[400,499]` → `AIError("HTTP_4XX")`; `[500,599]` → `AIError("HTTP_5XX")`.
    - Extract `candidates?.[0]?.content?.parts?.[0]?.text`; throw `AIError("EMPTY_RESPONSE")` when missing/empty.
    - Return the raw text string unmodified.
    - SHALL NOT import `transactionStore` or any repo.
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12, 4.13, 13.1, 13.4, 14.1, 14.2, 14.3, 14.4_

  - [ ]* 3.2 Property tests for geminiClient (P9, P11)
    - **Property P11 (timeout bound)**: Mock `fetch` as a never-resolving promise; advance fake timers past 8000ms; assert `geminiGenerate` rejects with `AIError("TIMEOUT")` within 8100ms.
    - **Property P9 (no history in body)**: Spy on `fetch`; for arbitrary user text, assert request body's `contents[0].parts[0].text` equals `buildParserPrompt(userText)` and contains no substring from a fixture transaction list.
    - **Property (status mapping)**: For status codes drawn from `[400, 599]`, assert correct `AIError` code (`HTTP_4XX` vs `HTTP_5XX`).
    - **Validates: Requirements 4.6, 4.7, 4.9, 4.10, 13.2, 13.3, 14.3**

- [ ] 4. Implement transactionParser orchestration
  - [ ] 4.1 Create `src/features/ai/transactionParser.ts` with `parseUserText(text)`
    - Trim; if empty → throw `AIError("EMPTY_INPUT")` BEFORE calling `geminiGenerate`.
    - Build prompt via `buildParserPrompt`; call `geminiGenerate({ prompt, timeoutMs: 8000 })`.
    - `stripMarkdownFence` then `JSON.parse`; on parse error → throw `AIError("PARSE_FAILED", "json")`.
    - Validate `draft.detail`: must be non-empty trimmed string ≤ 120 chars; else throw `AIError("VALIDATION_FAILED", "detail")`.
    - `nominal = normalizeAmount(draft.nominal)` (re-throws as `VALIDATION_FAILED`).
    - `confidence`: if not finite → `0.5`; else `clamp(value, 0, 1)`.
    - `category = snapCategory(String(draft.category ?? ""))`; `account = snapAccount(String(draft.account ?? ""))`.
    - Return `{ detail, nominal, account, category, confidence }`.
    - SHALL NOT import `transactionStore`, `aiUsageRepo`, or any repo.
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10, 8.11, 8.12, 8.13, 8.14, 8.15, 13.4_

  - [ ]* 4.2 Property tests for parser (P5, P6, P7)
    - **Property P7 (confidence clamp)**: Mock `geminiGenerate` to return JSON whose `confidence` is drawn from `fc.double({min:-10,max:10,noNaN:true})`; assert `result.confidence ∈ [0, 1]`.
    - **Property P5 (enum totality after parse)**: Mock `geminiGenerate` to return arbitrary `fc.string()` for `category`/`account`; assert `result.category ∈ CATEGORY_VALUES` and `result.account ∈ ACCOUNT_VALUES`.
    - **Property P6 (amount integer)**: Mock `geminiGenerate` to return canonical slang strings; assert `Number.isInteger(result.nominal) && result.nominal ≥ 1`.
    - **Validates: Requirements 8.6, 8.7, 8.8, 8.9, 8.10**

- [ ] 5. Implement voiceInput adapter
  - [ ] 5.1 Create `src/features/ai/voiceInput.ts` with `createVoiceController()`
    - Capability-detect `window.SpeechRecognition || window.webkitSpeechRecognition`.
    - On `start()`: if neither exists → throw `AIError("VOICE_UNSUPPORTED")` synchronously without instantiating; if already listening → no-op (idempotent).
    - Configure `lang = opts.lang ?? "id-ID"`, `continuous = false`, `interimResults = opts.interim ?? true`.
    - Wire `onresult` to dispatch `{ transcript, isFinal }` to all transcript handlers.
    - Wire `onerror`: `"not-allowed"` or `"service-not-allowed"` → `AIError("VOICE_DENIED")`; otherwise → `AIError("VOICE_FAILED")`.
    - Wire `onend` to clear internal `recognition` reference.
    - On `stop()`: idempotent; clear reference; call native `stop()`.
    - Expose `isListening()`, `onTranscript(handler) → unsubscribe`, `onError(handler) → unsubscribe`.
    - SHALL NOT call `fetch` or `XMLHttpRequest` anywhere.
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 12.10, 13.5_

  - [ ]* 5.2 Property tests for voiceInput (P14)
    - **Property P14 (single live recognition)**: For arbitrary sequences of `start()` and `stop()` calls (with mocked `SpeechRecognition`), at all times the count of live recognition instances ≤ 1.
    - **Property (idempotent stop)**: `stop()` called when not listening is a no-op (no throw, no native call).
    - **Validates: Requirements 12.4, 12.5, 12.6**

- [ ] 6. Checkpoint — feature modules complete
  - Ensure all tests pass for tasks 1–5. Ask the user if questions arise.

- [ ] 7. Implement AIQuickInput component
  - [ ] 7.1 Create `src/components/forms/AIQuickInput.tsx`
    - Subscribe to `settingsStore.settings.aiEnabled`.
    - Local state: `text: string`, `status: AIStatus`, `lastError: AIErrorCode | null`.
    - Render disabled state when `aiEnabled === false`: soft helper card with copy `"AI lagi off. Aktifin di Pengaturan dulu ya 💛"` plus a small "Buka Pengaturan" link button. Parse and mic buttons disabled (`aria-disabled="true"`); textarea read-only.
    - Render active state otherwise: textarea (placeholder `"Contoh: bakso 15rb cash"`, `min-height: 80px`, radius 16px, `bg-card-soft`); row of mic button (44×44 round, secondary) and primary button `"Pakai AI Cepat ✨"` (flex 1).
    - On parse button tap: validate `text.trim().length > 0`; if empty → toast `"Tulis dulu transaksinya, contoh: bakso 15rb cash 🙏"` and return; else set `status = "parsing"`, dynamically import `transactionParser` and call `parseUserText(text.trim())`.
    - On parse success: call `uiStore.openSheet("aiParsePreview", { result, originalText: text.trim() })`.
    - On parse failure: map `AIError.code` → toast string from `AI_TOAST_COPY` (MISSING_API_KEY → its specific copy; everything else → PARSE_FAILED copy with tone `"warning"`).
    - In `finally`: `setStatus("idle")`. Always preserve `text`.
    - All tap targets ≥ 44px.
    - _Requirements: 1.4, 2.1, 2.2, 2.3, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10, 9.11, 15.1, 15.2, 15.3, 15.4, 17.1, 17.2, 17.3_

  - [ ] 7.2 Wire voice input inside AIQuickInput
    - Lazy-create a `VoiceController` via `createVoiceController()` (memoize per component instance).
    - Register transcript handler: setText to transcript; if `isFinal` → `setStatus("idle")`.
    - Register error handler: `VOICE_UNSUPPORTED` → toast `AI_TOAST_COPY.VOICE_UNSUPPORTED`; `VOICE_DENIED` → toast `AI_TOAST_COPY.VOICE_DENIED`; else PARSE_FAILED copy. Always `setStatus("idle")`.
    - On mic tap when `status === "listening"`: call `voice.stop()` and `setStatus("idle")`.
    - On mic tap when `status !== "listening"`: try `voice.start({ lang: "id-ID", interim: true })` and `setStatus("listening")`; catch `AIError("VOICE_UNSUPPORTED")` synchronously and toast.
    - On unmount: call `voice.stop()` and unregister both handlers.
    - When `aiEnabled === false`: disable mic button entirely; do not call `voice.start`.
    - _Requirements: 12.11, 12.12, 12.13, 12.14, 12.15, 12.16, 13.5_

- [ ] 8. Implement AIParsePreviewSheet and AIParsePreviewForm
  - [ ] 8.1 Register `"aiParsePreview"` as a sheet key in `uiStore`
    - Add `"aiParsePreview"` to the `activeSheet` union type.
    - Document expected `activeSheetPayload` shape `{ result: ParseResult, originalText: string }` in JSDoc.
    - _Requirements: 10.1, 10.2_

  - [ ] 8.2 Create `src/components/sheets/AIParsePreviewSheet.tsx`
    - Subscribe to `uiStore.activeSheet === "aiParsePreview"` and `activeSheetPayload`.
    - Render `BottomSheet` titled `"Cek dulu ya 👀"`.
    - Render confidence chip `Confidence: ${Math.round(result.confidence * 100)}%` with tone: `success-soft` ≥ 0.8, neutral 0.5..0.79, `warning-soft` < 0.5.
    - Render originalText helper above form: `Dari: "<originalText>"` (DM Sans 13/400 muted).
    - Mount `<AIParsePreviewForm initial={payload.result} originalText={payload.originalText} />`.
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 18.1, 18.2, 18.3, 18.4, 18.5_

  - [ ] 8.3 Create `src/components/sheets/AIParsePreviewForm.tsx`
    - Props: `{ initial: ParseResult, originalText: string }`.
    - Initialize form state from `initial` and today's date (Sprint 2 `dateToYYYYMMDD(new Date())`); `mood = undefined`, `note = ""`.
    - Reuse Sprint 3 field components: `NominalField`, `DetailField`, `CategorySelector`, `AccountChipSelector`, `DateField`, `MoodSelector`, `NoteField`.
    - Display `formatIDR(parseInt(nominalRaw))` at top in Fraunces 24/700 `--accent-primary`.
    - Reuse Sprint 3's `validateForm(values, today)` validator.
    - Render primary button `"Simpan ✨"` and secondary button `"Batal"`.
    - On `"Batal"`: call `uiStore.closeSheet()` once (close preview only). Do NOT call `transactionStore.createTransaction` or `aiUsageRepo.incrementInput`.
    - On `"Simpan ✨"`: run `validateForm`; if invalid → render field errors and return.
    - On valid: call `transactionStore.createTransaction({ ...result.input, source: "ai" })`.
      - On resolve: call `aiUsageRepo.incrementInput(dateToYYYYMM(values.date))` once; on rejection of incrementInput → `console.warn` (do not undo). Show toast `"Tercatat dari AI ✨"` (success). Call `uiStore.closeSheet()` twice (close preview, then close `AddTransactionSheet`).
      - On rejection: show toast `"Gagal nyimpen, coba sekali lagi ya."` (warning); preserve form values; keep both sheets open; do NOT call `aiUsageRepo.incrementInput`.
    - All copy soft Indonesian.
    - _Requirements: 10.5, 10.6, 10.7, 10.8, 10.9, 10.10, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 11.10, 17.4_

  - [ ]* 8.4 Property test (P4) for `aiUsageRepo.incrementInput` invocation count
    - **Property P4 (one increment per save)**: For arbitrary sequences of preview interactions (open / cancel / save / save-failure), `count(aiUsageRepo.incrementInput calls) === count(Transactions persisted with source==="ai")`.
    - **Validates: Requirement 11.10**

- [ ] 9. Wire AddTransactionSheet to use AIQuickInput
  - [ ] 9.1 Update `src/components/sheets/AddTransactionSheet.tsx`
    - Replace the import of `AIQuickInputPlaceholder` with a dynamic `import("@/components/forms/AIQuickInput")` (React.lazy + Suspense fallback) so AI modules don't ship in initial bundle.
    - Render `<AIQuickInput />` in the AI tab body. Keep Manual tab as default active tab on mount.
    - Tab accessibility roles preserved (Sprint 3 invariant): `tablist`, `tab` with `aria-selected`, `tabpanel` with `aria-labelledby`.
    - Register `AIParsePreviewSheet` in the sheet registry (also lazy-loaded).
    - _Requirements: 1.2, 1.3, 1.4, 1.6, 20.1, 20.2, 20.3_

  - [ ] 9.2 Delete `src/components/forms/AIQuickInputPlaceholder.tsx`
    - Remove the file.
    - Remove any remaining imports/references from the codebase.
    - _Requirements: 1.1_

- [ ] 10. Add SettingsAIToggle to SettingsPage
  - [ ] 10.1 Create `src/components/customization/SettingsAIToggle.tsx`
    - Props: `{ enabled: boolean, onChange: (next: boolean) => void }`.
    - Card layout: padding 16px, radius 20px, `bg-card`.
    - Title: `"Bantuan AI"` (Fraunces 16/700). Helper: `"Pakai AI buat parse teks/voice jadi transaksi. Bisa dimatiin kapan aja."` (DM Sans 13/400 muted).
    - Switch on the right (44×24 toggle), reflects `enabled`.
    - On change → call `onChange(next)`.
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 17.1, 17.2_

  - [ ] 10.2 Wire `SettingsAIToggle` into `SettingsPage`
    - Read `settings.aiEnabled` from `settingsStore`.
    - On change → `settingsStore.update({ aiEnabled: next })`.
    - Place the toggle in the settings list (e.g., between `ReadabilityControls` and `DataSection`, or in a new "Bantuan" section).
    - _Requirements: 2.5, 2.6, 16.4, 16.5, 16.6_

  - [ ] 10.3 Confirm `aiEnabled` defaults to `false` in `settingsRepo.getOrCreate` (Sprint 2)
    - Verify the canonical default `UserSettings` produced by `settingsRepo` (or `settingsStore.hydrate` initialization) sets `aiEnabled: false`.
    - If it currently defaults to `true`, change it to `false` here (one-line change).
    - _Requirements: 2.4_

- [ ] 11. Document the env var
  - [ ] 11.1 Update `README.md` (or create `.env.example`)
    - Document `VITE_GEMINI_API_KEY=your-key-here` for development.
    - Note that production proxy is future work per `TECHNICAL_ARCHITECTURE §24`.
    - Note `.env` files are gitignored.
    - _Requirements: 4.2, 4.3_

- [ ] 12. Checkpoint — UI and wiring complete
  - Ensure component tests pass. Ask the user if questions arise.

- [ ] 13. Integration tests
  - [ ]* 13.1 AI happy path end-to-end
    - Mount `AddTransactionSheet`. Set `settings.aiEnabled = true`. Mock `import.meta.env.VITE_GEMINI_API_KEY = "test-key"`.
    - Switch to AI tab. Type `"bakso 15rb cash"`. Tap `"Pakai AI Cepat ✨"`.
    - Mock `fetch` to return `{ candidates: [{ content: { parts: [{ text: '{"detail":"Bakso","nominal":15000,"account":"Cash","category":"Food","confidence":0.92}' }] } }] }`.
    - Assert `AIParsePreviewSheet` opens with prefilled fields.
    - Tap `"Simpan ✨"`. Assert IDB has a Transaction with `source === "ai"`, `nominal === 15000`, `category === "Food"`, `account === "Cash"`.
    - Assert `aiUsageRepo.get(currentMonth).aiInputCount` increased by exactly 1.
    - Assert toast `"Tercatat dari AI ✨"` shown. Assert both sheets closed.
    - **Validates: Requirements 1.4, 9.4, 10.5, 10.6, 11.1, 11.2, 11.3, 11.5, 11.6**

  - [ ]* 13.2 Network error fallback
    - Mock `fetch` to reject with TypeError("Failed to fetch").
    - Tap `"Pakai AI Cepat ✨"`. Assert toast `"AI lagi susah nangkep. Bisa edit manual dulu."`. Assert no preview sheet opens. Assert text preserved. Assert `aiUsageRepo` not incremented.
    - Switch to Manual tab → fill form → save. Assert manual transaction with `source === "manual"` persists successfully (manual flow unaffected).
    - **Validates: Requirements 1.6, 9.6, 9.8, 11.10, 15.1, 15.3, 15.9**

  - [ ]* 13.3 Timeout fallback
    - Use fake timers. Mock `fetch` to return a never-resolving promise.
    - Tap parse button. Advance timers by 8001ms.
    - Assert toast `"AI lagi susah nangkep. Bisa edit manual dulu."`. Assert `AIError("TIMEOUT")` was thrown internally. Assert text preserved.
    - **Validates: Requirements 4.6, 4.7, 14.1, 14.3, 14.4, 15.3**

  - [ ]* 13.4 Non-JSON / validation failure fallback
    - Mock `fetch` to return prose `"I'm sorry, I can't help with that."`.
    - Tap parse button. Assert toast PARSE_FAILED copy. Assert no preview opens.
    - Repeat with response `'{"detail":"","nominal":0,"account":"","category":""}'`. Assert `AIError("VALIDATION_FAILED")` and same toast.
    - **Validates: Requirements 8.3, 8.4, 8.5, 15.3**

  - [ ]* 13.5 Missing API key
    - Set `import.meta.env.VITE_GEMINI_API_KEY = ""`. Tap parse button.
    - Assert `geminiGenerate` throws BEFORE any `fetch` call (spy on `fetch`).
    - Assert toast `"AI lagi belum nyala di build ini. Pakai manual dulu ya 💛"`.
    - **Validates: Requirements 4.3, 9.5, 15.2**

  - [ ]* 13.6 AI off — no AI surface usable
    - Set `settings.aiEnabled = false`.
    - Open `AddTransactionSheet`, switch to AI tab.
    - Assert `AIQuickInput` shows disabled state with `"AI lagi off. Aktifin di Pengaturan dulu ya 💛"` copy.
    - Assert parse button has `aria-disabled="true"` and tapping it does NOT call `parseUserText` (spy on dynamic import or the function).
    - Assert mic button disabled; tapping does NOT call `voice.start`.
    - Manually toggle `aiEnabled = true` via store; assert next render shows active `AIQuickInput`.
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.6, 9.2**

  - [ ]* 13.7 Preview cancel
    - Mock `fetch` to succeed. Tap parse → preview opens.
    - Tap `"Batal"`. Assert preview closed; `AddTransactionSheet` still open with AI tab still selected.
    - Assert `transactionStore.createTransaction` NOT called and `aiUsageRepo.incrementInput` NOT called.
    - **Validates: Requirements 10.9, 10.10, 11.10**

  - [ ]* 13.8 Save failure preserves state
    - Stub `transactionStore.createTransaction` to reject once.
    - Trigger preview save. Assert toast `"Gagal nyimpen, coba sekali lagi ya."`. Assert preview still open with values. Assert `aiUsageRepo.incrementInput` NOT called.
    - Restore stub; tap save again; assert success path completes and `aiUsageRepo.incrementInput` called exactly once.
    - **Validates: Requirements 11.7, 11.8, 11.10, 15.9**

  - [ ]* 13.9 Voice unsupported
    - Delete `window.SpeechRecognition` and `window.webkitSpeechRecognition` on the test window.
    - Tap mic button. Assert `AIError("VOICE_UNSUPPORTED")` thrown and no `SpeechRecognition` constructor called. Assert toast `"Browser belum support voice. Ketik aja ya 🙏"`. Assert text input still usable.
    - **Validates: Requirements 12.2, 12.10, 12.15, 15.5**

  - [ ]* 13.10 Voice permission denied
    - Mock `SpeechRecognition` to fire `onerror` with `event.error = "not-allowed"` after `start()`.
    - Tap mic. Assert toast `"Mic-nya belum diizinin. Bisa ketik dulu ya 🙏"`. Assert `status === "idle"` after.
    - **Validates: Requirements 12.8, 12.16, 15.6**

  - [ ]* 13.11 Voice transcript pipeline
    - Mock `SpeechRecognition` to emit interim transcript `"bakso"` then final `"bakso 15rb cash"`.
    - Tap mic; assert text input updates live to `"bakso"`, then `"bakso 15rb cash"`. Assert `status` returns to `"idle"` on final.
    - Tap parse; mock `fetch` success; assert preview opens with parsed result.
    - Spy on `fetch` and `XMLHttpRequest`: assert ZERO calls were made by `voiceInput.ts` itself.
    - **Validates: Requirements 12.7, 12.13, 12.14, 13.5**

  - [ ]* 13.12 Network privacy
    - Pre-populate `transactions` IndexedDB store with several distinctive fixture entries (e.g. `detail: "ZZZ_FIXTURE_1234"`).
    - Spy on `fetch`. Run AI parse with text `"bakso 15rb cash"`.
    - Assert exactly 1 fetch call. Assert request body's `contents[0].parts[0].text` equals `buildParserPrompt("bakso 15rb cash")` and contains no substring `"ZZZ_FIXTURE_1234"`.
    - **Validates: Requirements 13.1, 13.2, 13.3, 13.4**

  - [ ]* 13.13 Counter increments per saved AI transaction (P4)
    - Mock `fetch` with valid JSON. Run a sequence: parse → save × 3, parse → cancel × 2, parse → save → save-failure × 1.
    - Assert at end: 3 successful saves; `aiUsageRepo.get(month).aiInputCount === 3`.
    - **Validates: Requirement 11.10**

  - [ ]* 13.14 Settings AI toggle persistence
    - Render `SettingsPage`. Toggle `Bantuan AI` on. Assert `settings.aiEnabled === true` and `settingsRepo.update` was called.
    - Re-instantiate `settingsStore` (simulated app restart). Call `hydrate()`. Assert `settings.aiEnabled === true`.
    - **Validates: Requirements 16.4, 16.5, 16.6**

  - [ ]* 13.15 Manual flow unaffected by AI failures
    - Mock `fetch` to throw on every call. Mock `import("@/features/ai/transactionParser")` to throw.
    - Open `AddTransactionSheet`. Switch to Manual tab. Fill form. Save.
    - Assert Transaction persists with `source === "manual"`. Assert no AI module errors leak into the manual save path.
    - **Validates: Requirements 1.6, 15.1**

- [ ] 14. Final checkpoint — ensure all tests pass
  - Ensure all tests pass. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP.
- Each task references specific requirements for traceability.
- Property tests (P4, P5, P6, P7, P8, P9, P11, P14) validate universal correctness properties from the design document.
- Sprint 10 introduces NO new IndexedDB stores. It reuses Sprint 2's `transactions` (`source: "ai"`), `settings` (`aiEnabled`), and `aiUsage` (`incrementInput`) stores via `transactionStore`, `settingsStore`, and `aiUsageRepo`.
- Sprint 10 introduces NO new npm dependencies. Network call uses native `fetch` + `AbortController`. Voice uses native `SpeechRecognition`.
- Manual flow (Sprint 3) remains untouched and the default. AI is one tab away and gated by `settings.aiEnabled`.
- Privacy invariant: only the user's free text + the static parser prompt template is sent to Gemini. Voice audio never leaves the device.
- Increment invariant: `aiUsageRepo.incrementInput(currentMonth)` is called exactly once per successful AI save, and never on parse-only flows or cancellations.
- Lazy loading: `features/ai/*` and `AIParsePreviewSheet` are dynamically imported so they don't bloat the initial `HomePage` bundle.
- All copy in soft Indonesian per `AGENTS.md` tone guide. Toast strings centralized in `AI_TOAST_COPY`.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "2.4"] },
    { "id": 2, "tasks": ["2.5", "3.1"] },
    { "id": 3, "tasks": ["3.2", "4.1", "5.1"] },
    { "id": 4, "tasks": ["4.2", "5.2"] },
    { "id": 5, "tasks": ["7.1", "8.1", "10.1"] },
    { "id": 6, "tasks": ["7.2", "8.2", "10.2", "10.3"] },
    { "id": 7, "tasks": ["8.3"] },
    { "id": 8, "tasks": ["8.4", "9.1", "9.2", "11.1"] },
    { "id": 9, "tasks": ["13.1", "13.2", "13.3", "13.4", "13.5", "13.6", "13.7", "13.8", "13.9", "13.10", "13.11", "13.12", "13.13", "13.14", "13.15"] }
  ]
}
```
