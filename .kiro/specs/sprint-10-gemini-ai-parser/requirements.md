# Requirements Document

## Introduction

Sprint 10 turns Luma's AI from a Sprint 3 placeholder into a working **shortcut for transaction input**. Per `BUILD_PLAN §17`, `PRD §9.1`, `TECHNICAL_ARCHITECTURE §12/§24`, and `AGENTS.md` core UX rules, AI is **secondary** — manual input remains the default and AI never blocks the manual flow. This sprint replaces `AIQuickInputPlaceholder` (Sprint 3) inside `AddTransactionSheet`'s AI tab with a real `AIQuickInput`, adds a `geminiClient` for the Gemini REST API (`generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent`), a `transactionParser` that normalizes parser output (slang amounts, enum snapping, JSON shape validation), an `AIParsePreviewSheet` that lets the user edit the parsed result before saving, and a small `voiceInput` adapter over the browser-native Web Speech API. AI failure paths (off, network down, timeout, validation error, invalid JSON, mic denied) all return control to the user with a soft Indonesian toast and keep the AI tab usable. The Gemini response is never persisted directly — every save flows through the preview sheet, which writes via `transactionStore.createTransaction` with `source: "ai"` and increments `aiUsageRepo.incrementInput(currentMonth)` exactly once per saved AI transaction. Only the user's free text plus a static parser prompt is sent to Gemini; voice audio never leaves the device. The API key is read from `import.meta.env.VITE_GEMINI_API_KEY` (dev only). The AI surface is gated by `settings.aiEnabled`. No new IndexedDB stores. No new npm dependencies.

## Glossary

- **AddTransactionSheet**: The Sprint 3 bottom sheet that hosts the Manual tab (default) and the AI tab.
- **AIQuickInput**: The Sprint 10 component that lives in the AI tab body. Replaces `AIQuickInputPlaceholder`. Hosts the text input, mic button, and "Pakai AI Cepat ✨" button.
- **AIQuickInputPlaceholder**: The Sprint 3 disabled card. Deleted in this sprint.
- **AIParsePreviewSheet**: The Sprint 10 bottom sheet that opens after a successful parse, showing the parsed result with editable fields and Simpan/Batal actions.
- **AIParsePreviewForm**: The form rendered inside `AIParsePreviewSheet` that prefills from `ParseResult` and submits to `transactionStore`.
- **SettingsAIToggle**: A single-row toggle component added to `SettingsPage` (Sprint 9) that controls `settings.aiEnabled`.
- **transactionParser**: The module at `src/features/ai/transactionParser.ts` that orchestrates prompt building, Gemini call, JSON parsing, normalization, and validation.
- **parseUserText**: The async function exported by `transactionParser` that takes a user string and returns a `ParseResult` or throws an `AIError`.
- **geminiClient**: The module at `src/features/ai/geminiClient.ts` that wraps the Gemini REST `generateContent` call.
- **geminiGenerate**: The async function exported by `geminiClient` that performs the bounded HTTP request and returns the raw text candidate.
- **parserPrompt**: The module at `src/features/ai/parserPrompt.ts` that exports `buildParserPrompt(text)`.
- **buildParserPrompt**: The pure function that interpolates user text into the static parser instruction template.
- **amountNormalizer**: The module at `src/features/ai/amountNormalizer.ts`.
- **normalizeAmount**: The pure function that converts numbers and Indonesian slang strings (`"15rb"`, `"1.5jt"`, `"Rp1.500"`) to positive integer IDR.
- **enumSnap**: The module at `src/features/ai/enumSnap.ts`.
- **snapCategory**: The pure function that maps a free-form string to a `CategoryType` (fallback `"Other"`).
- **snapAccount**: The pure function that maps a free-form string to an `AccountType` (fallback `"Other"`).
- **voiceInput**: The module at `src/features/ai/voiceInput.ts` that wraps `SpeechRecognition`.
- **VoiceController**: The interface returned by `createVoiceController()` exposing `start`, `stop`, `isListening`, `onTranscript`, `onError`.
- **AIError**: The Error subclass thrown by AI modules with a typed `code` field.
- **AIErrorCode**: The union type of error codes: `AI_DISABLED`, `EMPTY_INPUT`, `MISSING_API_KEY`, `NETWORK`, `TIMEOUT`, `HTTP_4XX`, `HTTP_5XX`, `EMPTY_RESPONSE`, `PARSE_FAILED`, `VALIDATION_FAILED`, `VOICE_UNSUPPORTED`, `VOICE_DENIED`, `VOICE_FAILED`.
- **ParserDraft**: The narrow shape Gemini is asked to return, before snapping/validation.
- **ParseResult**: The fully-normalized shape `AIQuickInput` hands to the preview sheet: `{ detail, nominal, account, category, confidence }` with all fields enforced.
- **AI_TOAST_COPY**: The frozen object of soft Indonesian toast strings used across AI surfaces.
- **`settings.aiEnabled`**: The boolean field on `UserSettings` (Sprint 2) that gates the AI surface.
- **`source: "ai"`**: The `Transaction.source` value written by `AIParsePreviewForm.handleSave`.
- **transactionStore**: The Sprint 2 Zustand store at `src/stores/transactionStore.ts` (reused).
- **settingsStore**: The Sprint 2 Zustand store at `src/stores/settingsStore.ts` (reused).
- **aiUsageRepo**: The Sprint 2 repository at `src/db/ai-usage.repo.ts` (reused; `incrementInput(month)` is the relevant action).
- **uiStore**: The Sprint 2 Zustand store at `src/stores/uiStore.ts` (reused for `openSheet`, `closeSheet`, `showToast`).
- **`VITE_GEMINI_API_KEY`**: The Vite-injected environment variable holding the Gemini API key for development builds.
- **Gemini endpoint**: The URL `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent`.
- **`currentMonth`**: The `YYYY-MM` string derived from the saved transaction's `date` via `dateToYYYYMM` (Sprint 2 date helper).

## Requirements

### Requirement 1: Replace AIQuickInputPlaceholder with AIQuickInput

**User Story:** As a user, I want the AI tab inside the Add Transaction sheet to be a real input surface, so that I can use natural language as a shortcut while keeping manual as the default.

#### Acceptance Criteria

1. THE `AIQuickInputPlaceholder` component file SHALL be deleted from the codebase.
2. THE `AddTransactionSheet` SHALL render `<AIQuickInput />` in the AI tab body.
3. THE `AddTransactionSheet` SHALL keep the Manual tab as the default active tab on mount (Sprint 3 invariant preserved).
4. THE `AIQuickInput` SHALL render a textarea with placeholder `"Contoh: bakso 15rb cash"`, a mic button, and a primary button labeled `"Pakai AI Cepat ✨"`.
5. THE `AIQuickInput` SHALL NOT render any disabled "Segera hadir" copy when `settings.aiEnabled === true`.
6. THE manual transaction flow SHALL continue to function regardless of `AIQuickInput`'s state, including when AI modules fail to import.

---

### Requirement 2: AI Surface Gating via `settings.aiEnabled`

**User Story:** As a user, I want to turn AI off entirely from Settings, so that no AI surface is usable when I don't want it.

#### Acceptance Criteria

1. WHEN `settings.aiEnabled === false`, THE `AIQuickInput` SHALL render a disabled state with the soft copy `"AI lagi off. Aktifin di Pengaturan dulu ya 💛"`.
2. WHEN `settings.aiEnabled === false`, THE `AIQuickInput`'s parse button SHALL be disabled (`aria-disabled="true"`) and SHALL NOT invoke `parseUserText` when tapped.
3. WHEN `settings.aiEnabled === false`, THE `AIQuickInput`'s mic button SHALL be disabled and SHALL NOT call `voiceInput.start`.
4. THE default value of `settings.aiEnabled` for a freshly-created `UserSettings` SHALL be `false` (AI off by default).
5. THE `SettingsPage` SHALL render `<SettingsAIToggle />` whose value reflects `settings.aiEnabled` and whose change action calls `settingsStore.update({ aiEnabled: next })`.
6. WHEN the user toggles `aiEnabled` from `false` to `true`, THE `AIQuickInput` SHALL transition to its active state on its next render without requiring a route change.
7. THE `BottomNav` SHALL NOT contain an AI tab.

---

### Requirement 3: Parser Prompt Construction

**User Story:** As a developer, I want the parser prompt to be a static template plus the user's free text, so that no transaction history can leak into Gemini requests.

#### Acceptance Criteria

1. THE `buildParserPrompt(text)` function SHALL be pure and deterministic — same input always produces the same output, with no side effects.
2. THE returned prompt SHALL contain the literal user text exactly once.
3. THE returned prompt SHALL contain the literal substring `"Cash"`, `"E-wallet"`, `"BNI"`, `"BCA"`, `"Mandiri"`, `"Other"` (allowed accounts).
4. THE returned prompt SHALL contain the literal substring `"Food"`, `"Transport"`, `"Entertainment"`, `"Shopping"`, `"Health"`, `"Giving"`, `"Saving"` (allowed categories).
5. THE returned prompt SHALL instruct Gemini to output JSON only with no markdown.
6. THE returned prompt SHALL instruct Gemini to use IDR with no thousand separators.
7. THE returned prompt SHALL instruct Gemini to normalize slang amounts (`"15rb"/"15k" → 15000`, `"1.5jt" → 1500000`, `"250k" → 250000`).
8. THE returned prompt SHALL instruct Gemini to NOT invent data when unclear and to use `Other` with lowered confidence instead.
9. THE returned prompt SHALL describe the JSON shape `{ detail, nominal, account, category, confidence }`.
10. THE `buildParserPrompt(text)` function SHALL NOT read or include any value from `transactionStore`, IndexedDB, or any repository.

---

### Requirement 4: Gemini REST Client

**User Story:** As a developer, I want a single bounded function to call Gemini, so that timeout and error handling are centralized.

#### Acceptance Criteria

1. THE `geminiGenerate(opts)` function SHALL POST to `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent` with the API key as a query parameter.
2. THE `geminiGenerate` function SHALL read the API key from `import.meta.env.VITE_GEMINI_API_KEY`.
3. WHEN `import.meta.env.VITE_GEMINI_API_KEY` is undefined or empty, THE `geminiGenerate` function SHALL throw `AIError("MISSING_API_KEY")` BEFORE initiating any network request.
4. THE `geminiGenerate` function SHALL set request body `contents: [{ role: "user", parts: [{ text: opts.prompt }] }]` and `generationConfig.responseMimeType: "application/json"`.
5. THE `geminiGenerate` function SHALL initiate at most one outbound HTTP request per call.
6. THE `geminiGenerate` function SHALL bound every request by `min(opts.timeoutMs ?? 8000, opts.signal abort)` via `AbortController` and `setTimeout`.
7. WHEN the request is aborted by the timeout, THE `geminiGenerate` function SHALL throw `AIError("TIMEOUT")`.
8. WHEN `fetch` rejects (offline, DNS, CORS, network error), THE `geminiGenerate` function SHALL throw `AIError("NETWORK")`.
9. WHEN the response status is in `[400, 499]`, THE `geminiGenerate` function SHALL throw `AIError("HTTP_4XX")`.
10. WHEN the response status is in `[500, 599]`, THE `geminiGenerate` function SHALL throw `AIError("HTTP_5XX")`.
11. WHEN the response is `200` but `candidates[0].content.parts[0].text` is missing or empty, THE `geminiGenerate` function SHALL throw `AIError("EMPTY_RESPONSE")`.
12. ON success, THE `geminiGenerate` function SHALL return the non-empty string `candidates[0].content.parts[0].text` unmodified.
13. THE `geminiGenerate` function SHALL NOT include any field from `transactionStore`, IndexedDB, or repositories in the request body.

---

### Requirement 5: Strip Markdown Fence

**User Story:** As a developer, I want to handle Gemini occasionally wrapping JSON in code fences, so that JSON.parse succeeds reliably.

#### Acceptance Criteria

1. WHEN the input matches `/^\s*```(?:json)?\s*\n([\s\S]*?)\n```\s*$/i`, THE `stripMarkdownFence` function SHALL return the captured group trimmed.
2. WHEN the input does not match the fence pattern, THE `stripMarkdownFence` function SHALL return `input.trim()`.
3. THE `stripMarkdownFence` function SHALL be pure, deterministic, and side-effect-free.
4. FOR ALL strings `s`, `stripMarkdownFence(stripMarkdownFence(s)) === stripMarkdownFence(s)` (idempotent).

---

### Requirement 6: Amount Normalization

**User Story:** As a user, I want to type amounts the way I speak them ("15rb", "1.5jt", "Rp1.500"), so that the parser handles slang seamlessly.

#### Acceptance Criteria

1. WHEN the input is a finite number `n` with `n ≥ 1`, THE `normalizeAmount(n)` SHALL return `Math.round(n)`.
2. WHEN the input is a finite number `n` with `n < 1` or non-finite, THE `normalizeAmount(n)` SHALL throw `AIError("VALIDATION_FAILED")`.
3. WHEN the input is a string matching `/^\d+(?:[.,]\d+)?(k|rb|ribu|jt|juta|m)?$/i` (after trimming whitespace, lowercasing, and replacing `,` with `.`), THE `normalizeAmount` SHALL return `Math.round(decimal × multiplier)` where:
   - no suffix → multiplier = 1
   - `k`, `rb`, `ribu` → multiplier = 1000
   - `jt`, `juta`, `m` → multiplier = 1_000_000
4. WHEN the input is a string with `Rp` prefix (case-insensitive), THE `normalizeAmount` SHALL strip the prefix before further processing.
5. WHEN the input is a string of digits separated by `.` (Indonesian thousand separator) without a suffix, e.g. `"1.500.000"`, THE `normalizeAmount` SHALL strip the dots and return the resulting integer when ≥ 1.
6. WHEN the resulting computed value is less than `1`, THE `normalizeAmount` SHALL throw `AIError("VALIDATION_FAILED")`.
7. WHEN the input cannot be matched by any rule above, THE `normalizeAmount` SHALL throw `AIError("VALIDATION_FAILED")`.
8. THE `normalizeAmount` function SHALL satisfy these canonical pairs:
   - `normalizeAmount(15000) === 15000`
   - `normalizeAmount("15rb") === 15000`
   - `normalizeAmount("15k") === 15000`
   - `normalizeAmount("15 ribu") === 15000`
   - `normalizeAmount("Rp15.000") === 15000`
   - `normalizeAmount("1.5jt") === 1500000`
   - `normalizeAmount("1.5 juta") === 1500000`
   - `normalizeAmount("250k") === 250000`
   - `normalizeAmount("1.500.000") === 1500000`
9. FOR ALL valid inputs, THE result SHALL satisfy `Number.isInteger(result) && result ≥ 1`.
10. THE `normalizeAmount` function SHALL be pure and deterministic (no I/O, no clocks, no randomness).

---

### Requirement 7: Enum Snapping

**User Story:** As a user, I want the parser to map free-form words to Luma's category and account enums, so that the saved transaction is always valid.

#### Acceptance Criteria

1. THE `snapCategory(input)` function SHALL always return a value ∈ `{ "Food", "Transport", "Entertainment", "Shopping", "Health", "Giving", "Saving", "Other" }`.
2. THE `snapAccount(input)` function SHALL always return a value ∈ `{ "Cash", "E-wallet", "BNI", "BCA", "Mandiri", "Other" }`.
3. WHEN `input` (lowercased and trimmed) exactly equals an enum value lowercased, THE snap function SHALL return that enum value.
4. WHEN no exact match exists but `input` is contained in (or contains) an enum value's lowercased form, THE snap function SHALL return the first matching enum value.
5. WHEN none of the rules above match, THE snap function SHALL consult a small synonym table (e.g. `"makan"` → `"Food"`, `"gopay"` → `"E-wallet"`, `"ojek"` → `"Transport"`, `"obat"` → `"Health"`) and return the corresponding enum value if present.
6. WHEN no rule matches, THE snap function SHALL return `"Other"`.
7. WHEN `input` is the empty string, `null`-equivalent, or non-string, THE snap function SHALL return `"Other"` without throwing.
8. THE `snapCategory` and `snapAccount` functions SHALL be pure and deterministic.

---

### Requirement 8: Parse User Text Orchestration

**User Story:** As a developer, I want a single async entry point that takes user text and returns a fully-validated `ParseResult`, so that callers don't worry about pipeline details.

#### Acceptance Criteria

1. WHEN `text.trim().length === 0`, THE `parseUserText` SHALL throw `AIError("EMPTY_INPUT")` BEFORE invoking `geminiGenerate`.
2. WHEN `text` is non-empty, THE `parseUserText` SHALL invoke `buildParserPrompt(text.trim())` and pass the result to `geminiGenerate({ prompt, timeoutMs: 8000 })`.
3. WHEN `geminiGenerate` returns a string, THE `parseUserText` SHALL invoke `stripMarkdownFence` and `JSON.parse` on the result, throwing `AIError("PARSE_FAILED")` if `JSON.parse` rejects.
4. WHEN the parsed object's `detail` field is not a non-empty trimmed string, THE `parseUserText` SHALL throw `AIError("VALIDATION_FAILED")` with a `"detail"` discriminator.
5. WHEN `normalizeAmount(draft.nominal)` throws, THE `parseUserText` SHALL re-throw `AIError("VALIDATION_FAILED")` with an `"amount"` discriminator.
6. WHEN the parsed object's `confidence` is not a finite number, THE `parseUserText` SHALL default `confidence` to `0.5`.
7. WHEN the parsed object's `confidence` is a finite number, THE `parseUserText` SHALL clamp it to `[0, 1]`.
8. WHEN the parsed object's `category` is missing, THE `parseUserText` SHALL pass an empty string to `snapCategory`, yielding `"Other"`.
9. WHEN the parsed object's `account` is missing, THE `parseUserText` SHALL pass an empty string to `snapAccount`, yielding `"Other"`.
10. ON success, THE `parseUserText` SHALL return a `ParseResult` satisfying `detail.length ∈ [1, 120]`, `Number.isInteger(nominal) && nominal ≥ 1`, `account ∈ AccountType`, `category ∈ CategoryType`, `confidence ∈ [0, 1]`.
11. THE `parseUserText` function SHALL initiate at most one outbound HTTP request per call.
12. THE `parseUserText` function SHALL NOT read or include any value from `transactionStore`, IndexedDB, or repositories in the request body.
13. THE `parseUserText` function SHALL NOT call `aiUsageRepo` or any of its methods.
14. THE `parseUserText` function SHALL NOT write to IndexedDB.
15. THE `parseUserText` function SHALL trim and slice `detail` to at most 120 characters before returning.

---

### Requirement 9: AIQuickInput Behavior

**User Story:** As a user, I want a simple text input + mic + parse button that gives me a preview, so that AI feels like a quick shortcut and never an unrecoverable path.

#### Acceptance Criteria

1. THE `AIQuickInput` SHALL hold local state with `text: string`, `status: "idle" | "parsing" | "listening"`, and `lastError: AIErrorCode | null`.
2. WHEN `settings.aiEnabled === true` AND the user taps the parse button AND `text.trim().length > 0`, THE `AIQuickInput` SHALL set `status` to `"parsing"` and invoke `parseUserText(text.trim())`.
3. WHEN the parse button is tapped AND `text.trim().length === 0`, THE `AIQuickInput` SHALL show toast `"Tulis dulu transaksinya, contoh: bakso 15rb cash 🙏"` and SHALL NOT invoke `parseUserText`.
4. WHEN `parseUserText` resolves with a `ParseResult`, THE `AIQuickInput` SHALL invoke `uiStore.openSheet("aiParsePreview", { result, originalText })` where `originalText` is the trimmed input.
5. WHEN `parseUserText` rejects with `AIError("MISSING_API_KEY")`, THE `AIQuickInput` SHALL show toast `"AI lagi belum nyala di build ini. Pakai manual dulu ya 💛"`.
6. WHEN `parseUserText` rejects with any other `AIError` code, THE `AIQuickInput` SHALL show toast `"AI lagi susah nangkep. Bisa edit manual dulu."` with tone `"warning"`.
7. AFTER any parse outcome (success or failure), THE `AIQuickInput` SHALL reset `status` to `"idle"` in a `finally` block.
8. AFTER a parse failure, THE `AIQuickInput` SHALL preserve the `text` value so the user can edit and retry.
9. WHILE `status === "parsing"`, THE `AIQuickInput` SHALL render a spinner inside the parse button and disable the button.
10. THE `AIQuickInput` SHALL NOT call `aiUsageRepo` directly.
11. THE `AIQuickInput` SHALL NOT call `transactionStore.createTransaction` directly.

---

### Requirement 10: AIParsePreviewSheet and AIParsePreviewForm

**User Story:** As a user, I want every AI-parsed transaction to land in an editable preview before saving, so that I'm always in control.

#### Acceptance Criteria

1. THE `AIParsePreviewSheet` SHALL be registered as the `"aiParsePreview"` sheet key in `uiStore`.
2. WHEN `uiStore.activeSheet === "aiParsePreview"` AND `activeSheetPayload` is defined, THE `AIParsePreviewSheet` SHALL render with the title `"Cek dulu ya 👀"`.
3. THE `AIParsePreviewSheet` SHALL display a confidence chip showing `"Confidence: ${Math.round(result.confidence * 100)}%"` with color tone: success when `≥ 0.8`, neutral when `0.5 ≤ x < 0.8`, warning when `< 0.5`.
4. THE `AIParsePreviewSheet` SHALL display the originalText as muted helper text formatted as `Dari: "<originalText>"`.
5. THE `AIParsePreviewForm` SHALL prefill from `ParseResult` with: `nominalRaw = result.nominal as digit string`, `detail = result.detail`, `category = result.category`, `account = result.account`, `date = today (YYYY-MM-DD)`, `mood = undefined`, `note = ""`.
6. THE `AIParsePreviewForm` SHALL reuse Sprint 3 field components (`NominalField`, `DetailField`, `CategorySelector`, `AccountChipSelector`, `DateField`, `MoodSelector`, `NoteField`) and Sprint 3's `validateForm(values, today)` validator.
7. THE `AIParsePreviewForm` SHALL render a primary button labeled `"Simpan ✨"` and a secondary button labeled `"Batal"`.
8. THE `AIParsePreviewForm` SHALL display the formatted preview `formatIDR(nominal)` at the top of the sheet (Fraunces 24/700, accent color).
9. WHEN the user taps `"Batal"`, THE `AIParsePreviewSheet` SHALL call `uiStore.closeSheet()` once, closing only the preview, leaving `AddTransactionSheet` open with the AI tab still showing the original text.
10. WHEN the user taps `"Batal"`, THE `AIParsePreviewSheet` SHALL NOT call `transactionStore.createTransaction` and SHALL NOT call `aiUsageRepo.incrementInput`.

---

### Requirement 11: Save from Preview with `source: "ai"`

**User Story:** As a user, I want my AI-saved transactions to be marked clearly, so that reports and history can distinguish AI-assisted entries.

#### Acceptance Criteria

1. WHEN the user taps `"Simpan ✨"` AND `validateForm(values, today).valid === true`, THE `AIParsePreviewForm` SHALL call `transactionStore.createTransaction({ ...input, source: "ai" })`.
2. WHEN `transactionStore.createTransaction` resolves with a `Transaction`, THE `Transaction.source` SHALL equal `"ai"`.
3. WHEN `transactionStore.createTransaction` resolves successfully, THE `AIParsePreviewForm` SHALL call `aiUsageRepo.incrementInput(dateToYYYYMM(values.date))` exactly once.
4. WHEN `aiUsageRepo.incrementInput` rejects, THE `AIParsePreviewForm` SHALL log a `console.warn` and SHALL NOT undo the saved transaction (best-effort tracking).
5. WHEN `transactionStore.createTransaction` resolves successfully, THE `AIParsePreviewForm` SHALL show toast `"Tercatat dari AI ✨"` with tone `"success"`.
6. WHEN `transactionStore.createTransaction` resolves successfully, THE `AIParsePreviewForm` SHALL call `uiStore.closeSheet()` twice — first closing the preview sheet, then closing the parent `AddTransactionSheet`.
7. WHEN `transactionStore.createTransaction` rejects, THE `AIParsePreviewForm` SHALL show toast `"Gagal nyimpen, coba sekali lagi ya."` with tone `"warning"` and SHALL NOT call `aiUsageRepo.incrementInput`.
8. WHEN `transactionStore.createTransaction` rejects, THE `AIParsePreviewForm` SHALL preserve form values and keep both sheets open.
9. WHEN `validateForm(values, today).valid === false`, THE `AIParsePreviewForm` SHALL render field-level errors and SHALL NOT call `transactionStore.createTransaction` and SHALL NOT call `aiUsageRepo.incrementInput`.
10. ACROSS any execution trace, the count of `aiUsageRepo.incrementInput` invocations SHALL equal the count of Transactions persisted with `source === "ai"`.

---

### Requirement 12: Voice Input via Web Speech API

**User Story:** As a user, I want to speak instead of typing, so that AI input feels even faster.

#### Acceptance Criteria

1. THE `voiceInput` module SHALL expose `createVoiceController()` returning a `VoiceController` with `start`, `stop`, `isListening`, `onTranscript`, `onError`.
2. WHEN neither `window.SpeechRecognition` nor `window.webkitSpeechRecognition` is defined, THE `start()` method SHALL throw `AIError("VOICE_UNSUPPORTED")` synchronously WITHOUT instantiating any recognition object.
3. THE `start()` method SHALL configure the recognition instance with `lang = "id-ID"`, `continuous = false`, `interimResults = true` by default.
4. THE `start()` method SHALL be idempotent: calling it while already listening SHALL be a no-op.
5. THE `stop()` method SHALL be idempotent: calling it while not listening SHALL be a no-op.
6. AT MOST ONE active `SpeechRecognition` instance SHALL exist per `VoiceController` at any time.
7. WHEN the recognition emits `onresult`, THE `VoiceController` SHALL invoke registered transcript handlers with `{ transcript, isFinal }`.
8. WHEN the recognition emits `onerror` with `"not-allowed"` or `"service-not-allowed"`, THE `VoiceController` SHALL invoke registered error handlers with `AIError("VOICE_DENIED")`.
9. WHEN the recognition emits any other `onerror`, THE `VoiceController` SHALL invoke registered error handlers with `AIError("VOICE_FAILED")`.
10. THE `voiceInput` module SHALL NOT call `fetch`, `XMLHttpRequest`, or any other network API.
11. WHEN the user taps the mic button in `AIQuickInput` AND `status !== "listening"`, THE `AIQuickInput` SHALL call `voice.start({ lang: "id-ID", interim: true })` and set `status = "listening"`.
12. WHEN the user taps the mic button AND `status === "listening"`, THE `AIQuickInput` SHALL call `voice.stop()` and set `status = "idle"`.
13. WHEN a transcript event fires with any `isFinal`, THE `AIQuickInput` SHALL update its `text` state to the transcript.
14. WHEN a transcript event fires with `isFinal === true`, THE `AIQuickInput` SHALL set `status = "idle"`.
15. WHEN voice fails with `VOICE_UNSUPPORTED`, THE `AIQuickInput` SHALL show toast `"Browser belum support voice. Ketik aja ya 🙏"`.
16. WHEN voice fails with `VOICE_DENIED`, THE `AIQuickInput` SHALL show toast `"Mic-nya belum diizinin. Bisa ketik dulu ya 🙏"`.

---

### Requirement 13: Network Privacy

**User Story:** As a user, I want only my free text to reach Gemini, so that my transaction history stays local.

#### Acceptance Criteria

1. ACROSS any execution trace of the AI parse flow, exactly one outbound HTTP request SHALL be made to `https://generativelanguage.googleapis.com/...` per parse attempt.
2. THE outbound request body SHALL contain exactly one `contents[0].parts[0].text` field whose value is `buildParserPrompt(userText)`.
3. THE outbound request body SHALL NOT contain any value read from `transactionStore`, any field of any `Transaction` record from IndexedDB, any repository return value, or any aggregated stats.
4. THE `transactionParser`, `geminiClient`, `parserPrompt`, `amountNormalizer`, `enumSnap`, and `voiceInput` modules SHALL NOT import `transactionStore`, `transactionRepo`, or any other domain repo.
5. THE `voiceInput` module SHALL NOT make any network request; voice audio bytes SHALL stay on-device.

---

### Requirement 14: Network Timeout Bound

**User Story:** As a user, I want AI requests to fail fast, so that the UI never spins indefinitely.

#### Acceptance Criteria

1. THE `geminiGenerate` function SHALL bound every request by `min(opts.timeoutMs ?? 8000, opts.signal abort)`.
2. THE default timeout SHALL be `8000` milliseconds.
3. WHEN the timeout elapses before the response arrives, THE `geminiGenerate` function SHALL throw `AIError("TIMEOUT")` and the underlying `AbortController` SHALL be aborted.
4. EVERY call to `geminiGenerate` SHALL either resolve or reject within `opts.timeoutMs + 100ms` (allowing for AbortController teardown).

---

### Requirement 15: Error Handling and Recovery

**User Story:** As a user, I want AI failures to feel soft and recoverable, so that I never feel stuck.

#### Acceptance Criteria

1. WHEN any `AIError` occurs in `AIQuickInput`, THE Manual tab SHALL remain fully functional.
2. WHEN `AIError("MISSING_API_KEY")` is thrown, THE toast SHALL be `"AI lagi belum nyala di build ini. Pakai manual dulu ya 💛"`.
3. WHEN `AIError("NETWORK")`, `"TIMEOUT"`, `"HTTP_4XX"`, `"HTTP_5XX"`, `"EMPTY_RESPONSE"`, `"PARSE_FAILED"`, or `"VALIDATION_FAILED"` is thrown, THE toast SHALL be `"AI lagi susah nangkep. Bisa edit manual dulu."`.
4. WHEN `AIError("EMPTY_INPUT")` is thrown, THE toast SHALL be `"Tulis dulu transaksinya, contoh: bakso 15rb cash 🙏"`.
5. WHEN `AIError("VOICE_UNSUPPORTED")` is thrown, THE toast SHALL be `"Browser belum support voice. Ketik aja ya 🙏"`.
6. WHEN `AIError("VOICE_DENIED")` is thrown, THE toast SHALL be `"Mic-nya belum diizinin. Bisa ketik dulu ya 🙏"`.
7. AFTER any error, THE `AIQuickInput.status` SHALL be `"idle"`.
8. AFTER any error, THE `AIQuickInput.text` value SHALL be preserved.
9. WHEN any error fires, THE `aiUsageRepo` SHALL NOT be incremented.

---

### Requirement 16: Settings AI Toggle

**User Story:** As a user, I want a single toggle in Settings to control whether AI is on, so that AI on/off is one tap away.

#### Acceptance Criteria

1. THE `SettingsPage` SHALL render `<SettingsAIToggle />` in the settings list.
2. THE `SettingsAIToggle` SHALL display the title `"Bantuan AI"` and helper copy `"Pakai AI buat parse teks/voice jadi transaksi. Bisa dimatiin kapan aja."`.
3. THE `SettingsAIToggle` SHALL render a switch reflecting the current `settings.aiEnabled` value.
4. WHEN the user toggles the switch, THE `SettingsAIToggle` SHALL call `settingsStore.update({ aiEnabled: next })`.
5. AFTER the toggle is changed, THE updated value SHALL be persisted via `settingsRepo.update` (Sprint 2 invariant).
6. WHEN the user navigates back to `AddTransactionSheet`'s AI tab, THE `AIQuickInput` SHALL reflect the new `aiEnabled` state on its next render.

---

### Requirement 17: Mobile-First and Soft Indonesian Copy

**User Story:** As a mobile user reading Indonesian, I want all AI surfaces to feel soft and fit my screen, so that the experience matches Luma's voice.

#### Acceptance Criteria

1. THE `AIQuickInput`, `AIParsePreviewSheet`, and `SettingsAIToggle` SHALL render correctly within a 480px max-width container per `BUILD_PLAN §10`.
2. ALL tap targets in `AIQuickInput` and `AIParsePreviewSheet` (mic, parse, save, cancel) SHALL be at least 44px in their smallest dimension per `DESIGN_SYSTEM §19`.
3. ALL user-facing copy in AI surfaces SHALL be in soft Indonesian per the project tone guide.
4. ALL monetary displays in `AIParsePreviewSheet` SHALL be formatted via `formatIDR`.
5. THE AI surfaces SHALL NOT use aggressive warnings (e.g., "GAGAL", "ERROR", "TIDAK BISA") and SHALL prefer phrasing like "lagi susah", "coba lagi ya", "manual dulu".

---

### Requirement 18: Confidence Display

**User Story:** As a user, I want to see how confident the AI is, so that I know when to double-check before saving.

#### Acceptance Criteria

1. THE `AIParsePreviewSheet` SHALL display the confidence as a chip with text `"Confidence: ${Math.round(result.confidence * 100)}%"`.
2. WHEN `result.confidence ≥ 0.8`, THE confidence chip SHALL use a success/positive tone (e.g., `success-soft` background).
3. WHEN `0.5 ≤ result.confidence < 0.8`, THE confidence chip SHALL use a neutral tone.
4. WHEN `result.confidence < 0.5`, THE confidence chip SHALL use a warning tone (e.g., `warning-soft` background).
5. THE confidence chip SHALL NOT block save — it is purely informational.

---

### Requirement 19: No New Persistence

**User Story:** As a developer, I want this sprint to introduce no new IndexedDB stores, so that the data layer remains stable.

#### Acceptance Criteria

1. THIS sprint SHALL NOT introduce any new IndexedDB object stores.
2. THIS sprint SHALL NOT modify the schema of existing IndexedDB stores.
3. THIS sprint SHALL NOT introduce any new Zustand stores. (`AIQuickInput`'s small state lives as React local state.)
4. THIS sprint SHALL NOT introduce any new npm dependencies.
5. THIS sprint SHALL reuse `transactionStore`, `settingsStore`, `uiStore`, `aiUsageRepo` from Sprint 2.
6. THE `Transaction.source` field SHALL accept the value `"ai"` (already part of the Sprint 2 `TransactionSource` union).
7. THE `UserSettings.aiEnabled` field SHALL be the boolean already defined in Sprint 2's `UserSettings`.

---

### Requirement 20: Performance and Lazy Loading

**User Story:** As a user, I want the initial app bundle to stay small, so that Luma loads fast even though AI exists.

#### Acceptance Criteria

1. THE `features/ai/*` modules (`geminiClient`, `transactionParser`, `parserPrompt`, `amountNormalizer`, `enumSnap`, `voiceInput`) SHALL be loaded via dynamic `import()` from `AIQuickInput` on first AI tab activation OR on first parse attempt.
2. THE initial JavaScript bundle for `HomePage` SHALL NOT include the AI feature modules.
3. THE `AIParsePreviewSheet` SHALL be lazy-loaded via `React.lazy` (or equivalent) inside the sheet registry.
4. EVERY parse attempt SHALL initiate at most one outbound HTTP request.
5. EVERY voice listen session SHALL terminate after one utterance (`continuous = false`).
