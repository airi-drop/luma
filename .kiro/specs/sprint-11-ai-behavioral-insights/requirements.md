# Requirements Document

## Introduction

Sprint 11 turns the disabled `AIReflectionCard` placeholder on the Sprint 8 Reports page into a working **AI Behavioral Insights** surface. Per `BUILD_PLAN §18`, `PRD §11`, `TECHNICAL_ARCHITECTURE §12, §13, §17, §24`, `WORKFLOW §8`, and `AGENTS.md` core UX rules, AI is **optional and secondary** — the manual report (summary cards, charts, budget comparison, exports) must continue to render and function fully when AI is off, network is down, the user is over quota, or insight generation fails.

**What this scope adds (new):**
- `insightAggregator` — a pure module that turns the selected month's `Transaction[]`, `MonthlyBudget`, and `CategoryBudget[]` into a privacy-safe `MonthlyAggregate` of numeric stats and time/category bucket summaries (night/day, weekday/weekend, mood × category, small-but-frequent counts, prior-month deltas). It never returns raw `Transaction` records or PII.
- `insightPrompt` — a pure prompt builder, separate from Sprint 10's `parserPrompt`, that interpolates the aggregate plus a fixed instruction template asking Gemini for behavioral observations (not generic "your top category is Food" stats).
- `insightGenerator` — an orchestrator that (1) pulls the aggregate, (2) builds the prompt, (3) calls the Sprint 10 `geminiGenerate`, (4) parses/validates the response into structured `InsightItem[]`, (5) persists the result keyed by month, and (6) increments `aiUsageRepo.aiInsightCount`.
- `aiInsightsRepo` — a new repository over a new IndexedDB store `aiInsights`, keyed by `YYYY-MM`, that caches the generated `InsightSet` per month so reopening the same month does not consume quota.
- `AIReflectionCard` — the visible UI surface on `ReportsPage`. It replaces the Sprint 8 disabled placeholder and renders six soft, recoverable states: `disabled` (AI off), `empty` (no transactions), `idle` (no insight cached yet), `loading`, `success` (renders 1..N `InsightItem`s), `error`, and `quotaExceeded`. A "Refresh insight ✨" affordance lets the user regenerate on demand within the quota.

**What this scope reuses (must not be re-implemented):**
- Sprint 10's `geminiClient` and `geminiGenerate` for the bounded REST call (8000ms timeout, AbortController, single outbound HTTP per call).
- Sprint 10's `AIError` class and `AIErrorCode` union for typed errors.
- Sprint 10's `settings.aiEnabled` flag for gating, exposed via `settingsStore`.
- Sprint 10's soft Indonesian toast copy patterns (casual, supportive, non-judgmental).
- Sprint 2's `aiUsageRepo` (`incrementInsight(month)`, `get(month)`), `transactionRepo`, `budgetRepo`, `settingsRepo`, and `uiStore`.
- Sprint 8's `ReportsPage` composition; this sprint mounts `AIReflectionCard` in the slot the Sprint 8 placeholder occupied. Manual report rendering is unchanged.

**Hard invariants:**
- Manual report (summary cards, charts, budget comparison, exports) continues to render and function regardless of `AIReflectionCard` state.
- No raw `Transaction`, no account number, no `note`, no `detail` text, no PII, and no free-form user-generated text reaches Gemini. Only aggregated numeric stats and category/time bucket summaries.
- The quota counter (`aiUsageRepo.aiInsightCount(YYYY-MM)`) increments **exactly once** per successful insight generation and **zero times** on any failure.
- The soft monthly limit is **3 successful insight generations per month**. Going over the limit shows a soft toast and disables the regenerate action; viewing the cached insight remains allowed.
- All data fetches and writes flow through repositories — no component reads or writes IndexedDB directly.
- No new npm dependencies. No login. No cloud sync. No gamification.
- Mobile-first, ≤ 480px max width.

## Glossary

- **AIReflectionCard**: The component at `src/components/cards/AIReflectionCard.tsx` rendered inside `ReportsPage` in the slot previously occupied by the Sprint 8 disabled placeholder.
- **ReportsPage**: The Sprint 8 page at route `/reports`. Reused; the only change is replacing the disabled `AIReflectionCard` placeholder with the active `AIReflectionCard` from this sprint.
- **insightAggregator**: The module at `src/features/ai/insightAggregator.ts` exporting `buildMonthlyAggregate`. Pure functions only.
- **buildMonthlyAggregate**: The pure function `(currentMonthTxs: Transaction[], priorMonthTxs: Transaction[], monthlyBudget: MonthlyBudget | null, categoryBudgets: CategoryBudget[], month: string) => MonthlyAggregate`. Deterministic; no I/O.
- **MonthlyAggregate**: The narrow privacy-safe struct produced by `buildMonthlyAggregate`. Contains only numbers, enum strings, and bucket counts. Never contains `Transaction` records or PII fields (see Requirement 4).
- **insightPrompt**: The module at `src/features/ai/insightPrompt.ts` exporting `buildInsightPrompt`. Distinct from Sprint 10's `parserPrompt`.
- **buildInsightPrompt**: The pure function `(aggregate: MonthlyAggregate) => string` that interpolates a static behavioral-instruction template with the aggregate's numeric fields.
- **insightGenerator**: The module at `src/features/ai/insightGenerator.ts` exporting `generateInsight`. Orchestrates aggregate → prompt → `geminiGenerate` → parse/validate → cache → quota increment.
- **generateInsight**: The async function `(month: string, opts?: { force?: boolean }) => Promise<InsightSet>`. Returns cached `InsightSet` if present and `force !== true`; otherwise generates, persists, and increments quota.
- **aiInsightsRepo**: The repository at `src/db/ai-insights.repo.ts` exporting `get(month)`, `put(month, set)`, `remove(month)`, `listAll()`.
- **aiInsights store**: A new IndexedDB object store named `aiInsights` (added in a `luma-db` schema upgrade), keyPath `month`, holding one `InsightSet` per month.
- **InsightSet**: The persisted record `{ month: string; generatedAt: string; items: InsightItem[]; sourceAggregateHash: string }`.
- **InsightItem**: A single behavioral observation `{ id: string; tone: InsightTone; emoji: string; text: string }` where `text.length ∈ [1, 200]`.
- **InsightTone**: The union `"positive" | "neutral" | "soft-warning"`. Used for soft character/emoji reaction; never for judgmental copy.
- **InsightCardState**: The discriminated state of `AIReflectionCard`: `"disabled" | "empty" | "idle" | "loading" | "success" | "error" | "quotaExceeded"`.
- **INSIGHT_MONTHLY_QUOTA**: The constant `3`. The soft monthly limit on successful insight generations per `YYYY-MM`, per `TECHNICAL_ARCHITECTURE §13`.
- **INSIGHT_TIMEOUT_MS**: The constant `8000`. Reused from Sprint 10's network-call bound.
- **INSIGHT_TOAST_COPY**: A frozen object of soft Indonesian toast strings used by `AIReflectionCard` (see Requirement 13).
- **NIGHT_HOUR_START / NIGHT_HOUR_END**: The constants `21` and `5` (inclusive/exclusive on a wraparound clock). A transaction is `night` when its `createdAt` local hour is in `[21, 24) ∪ [0, 5)`.
- **WEEKEND_DAYS**: The constant set `{6, 0}` (Saturday=6, Sunday=0 in JS `Date.getDay`).
- **SMALL_TX_THRESHOLD_IDR**: The constant `25_000`. A transaction is "small" when `nominal ≤ SMALL_TX_THRESHOLD_IDR`.
- **SMALL_FREQUENT_MIN_COUNT**: The constant `5`. The threshold above which small transactions are flagged as a "small but frequent" pattern.
- **MoM_DELTA_PCT_THRESHOLD**: The constant `25`. The percentage change threshold (in absolute value) above which a category's month-over-month change is reported in the aggregate.
- **`aiUsageRepo`**: Reused from Sprint 2. Methods used: `get(month)`, `incrementInsight(month)`.
- **`aiInsightCount(month)`**: Shorthand for `aiUsageRepo.get(month).aiInsightCount`.
- **`geminiGenerate`**: Reused from Sprint 10. The single bounded HTTP entry point.
- **`AIError`** / **`AIErrorCode`**: Reused from Sprint 10. This sprint adds three new codes: `INSIGHT_QUOTA_EXCEEDED`, `INSIGHT_VALIDATION_FAILED`, `INSIGHT_NO_DATA`.
- **`settings.aiEnabled`**: The boolean field on `UserSettings` (Sprint 2). Gates the AI surface.
- **`transactionRepo.listByMonth(month)`**: Reused from Sprint 2 to read both the current and prior month's transactions.
- **`budgetRepo.getMonthlyBudget(month)`** / **`listCategoryBudgets(month)`**: Reused from Sprint 2.
- **`uiStore.showToast`**: Reused from Sprint 2.
- **`dateToYYYYMM`** / **`previousMonth`**: Date helpers in `src/lib/date.ts` (Sprint 2). `previousMonth("2025-06") === "2025-05"`.
- **`hashAggregate`**: A pure helper in `insightAggregator` that returns a stable short string hash (e.g., FNV-1a hex, ≤ 16 chars) of the canonical JSON of a `MonthlyAggregate`. Used for `sourceAggregateHash`. Pure; no crypto, no network.

## Requirements

### Requirement 1: Surface Mounting and Manual-Report Invariant

**User Story:** As a user, I want the Reports page to keep working even when AI is off, failing, or rate-limited, so that I never lose access to my monthly data.

#### Acceptance Criteria

1. THE ReportsPage SHALL render `<AIReflectionCard />` in the same vertical slot the Sprint 8 disabled placeholder occupied.
2. THE ReportsPage SHALL render SummaryCards, CategoryChart, SpendingTrendChart, BudgetComparisonSection, and ExportActions independently of `AIReflectionCard`'s state.
3. WHEN `AIReflectionCard` is in any of `"disabled" | "empty" | "idle" | "loading" | "error" | "quotaExceeded"`, THE SummaryCards, CategoryChart, SpendingTrendChart, BudgetComparisonSection, and ExportActions SHALL continue to render with their full Sprint 8 behavior.
4. IF the Sprint 11 AI modules (`insightAggregator`, `insightPrompt`, `insightGenerator`, `aiInsightsRepo`) fail to import or throw at module load, THEN THE ReportsPage SHALL still render SummaryCards, CategoryChart, SpendingTrendChart, BudgetComparisonSection, and ExportActions.
5. THE PDF and spreadsheet export actions SHALL function regardless of `AIReflectionCard` state.
6. THE `AIReflectionCard` SHALL NOT block, suspend, or delay the rendering of any other Sprint 8 report component.

---

### Requirement 2: AI Surface Gating via `settings.aiEnabled`

**User Story:** As a user, I want a single Settings switch to turn off all AI features, so that no insight surface is active when I don't want it.

#### Acceptance Criteria

1. WHEN `settings.aiEnabled === false`, THE `AIReflectionCard` SHALL render `InsightCardState = "disabled"`.
2. WHEN `InsightCardState === "disabled"`, THE `AIReflectionCard` SHALL show the soft copy `"AI lagi off. Aktifin di Pengaturan dulu ya 💛"` and SHALL NOT render a "Refresh insight ✨" action.
3. WHEN `InsightCardState === "disabled"`, THE `AIReflectionCard` SHALL NOT invoke `generateInsight`, SHALL NOT call `geminiGenerate`, and SHALL NOT read from `aiInsightsRepo`.
4. WHEN the user toggles `aiEnabled` from `false` to `true` in Settings, THE `AIReflectionCard` SHALL transition to `"idle"` (or `"success"` if a cached `InsightSet` exists for the selected month) on its next render without requiring a route change.
5. WHEN `settings.aiEnabled === true` AND the selected month has zero transactions, THE `AIReflectionCard` SHALL render `InsightCardState = "empty"` with copy `"Belum ada transaksi bulan ini. Catat dulu yuk, nanti Luma bantu liat polanya ✨"`.
6. THE BottomNav SHALL NOT contain an AI tab.

---

### Requirement 3: Selected Month Binding

**User Story:** As a user, I want insights to always reflect the month I'm viewing on the Reports page, so that switching months gives me the right context.

#### Acceptance Criteria

1. THE `AIReflectionCard` SHALL read the currently selected month from the same source `ReportsPage` uses (Sprint 8 month selector state).
2. WHEN the selected month changes, THE `AIReflectionCard` SHALL re-evaluate its state for the new month on the next render.
3. WHEN the selected month changes AND a cached `InsightSet` exists for the new month, THE `AIReflectionCard` SHALL render `InsightCardState = "success"` with the cached items WITHOUT calling `geminiGenerate`.
4. WHEN the selected month changes AND no cached `InsightSet` exists for the new month AND `settings.aiEnabled === true`, THE `AIReflectionCard` SHALL render `InsightCardState = "idle"` and SHALL NOT auto-generate; generation SHALL only occur when the user taps the primary action.
5. THE selected month value SHALL match `^\d{4}-(0[1-9]|1[0-2])$` (`YYYY-MM`).

---

### Requirement 4: Aggregator Privacy and Purity

**User Story:** As a user, I want my raw transaction details to never leave my device, so that only summary statistics are ever shared with the AI service.

#### Acceptance Criteria

1. THE `buildMonthlyAggregate` function SHALL be pure and deterministic — for the same inputs it SHALL return a structurally equal `MonthlyAggregate`.
2. THE `buildMonthlyAggregate` function SHALL NOT perform any I/O (no `fetch`, no IndexedDB, no `localStorage`, no `Date.now()` reads inside the function body for output values, no `Math.random`).
3. THE `MonthlyAggregate` SHALL contain only fields whose values are numbers, integers, finite floats, enum strings ∈ `CategoryType`, enum strings ∈ `MoodType`, the `month: YYYY-MM` string itself, the literal time-bucket keys `"night"|"day"|"weekday"|"weekend"`, and arrays/records composed solely of these primitives.
4. THE `MonthlyAggregate` SHALL NOT contain any `Transaction.id`, `Transaction.detail`, `Transaction.note`, `Transaction.account`, `Transaction.createdAt`, `Transaction.updatedAt`, `Transaction.recurringRuleId`, `Transaction.date` (full date), or any free-form user text.
5. THE `MonthlyAggregate` SHALL include at minimum: `month`, `txCount`, `totalSpending`, `categoryTotals: Record<CategoryType, number>`, `nightCount`, `dayCount`, `weekendCount`, `weekdayCount`, `weekendSpending`, `weekdaySpending`, `nightSpending`, `daySpending`, `smallTxCount`, `smallTxTotal`, `moodCategoryCounts: Array<{ mood: MoodType; category: CategoryType; count: number }>`, `categoryDeltasFromPriorMonth: Array<{ category: CategoryType; priorTotal: number; currentTotal: number; deltaPct: number }>`, `monthlyBudgetTotal: number | null`, `categoryBudgets: Array<{ category: CategoryType; limit: number; actual: number }>`.
6. THE `txCount` field SHALL equal the number of transactions passed in for the current month.
7. THE `totalSpending` field SHALL equal `Σ tx.nominal` for `tx ∈ currentMonthTxs`.
8. FOR ALL `CategoryType` values `c`, `Σ categoryTotals[c]` over `c` SHALL equal `totalSpending`.
9. `nightCount + dayCount` SHALL equal `txCount`. `weekendCount + weekdayCount` SHALL equal `txCount`. `nightSpending + daySpending` SHALL equal `totalSpending`. `weekendSpending + weekdaySpending` SHALL equal `totalSpending`.
10. THE `smallTxCount` SHALL equal the count of transactions with `nominal ≤ SMALL_TX_THRESHOLD_IDR`. THE `smallTxTotal` SHALL equal the sum of those transactions' nominals.
11. THE `categoryDeltasFromPriorMonth` SHALL only include categories where `|deltaPct| ≥ MoM_DELTA_PCT_THRESHOLD` AND `priorTotal > 0`. WHEN `priorTotal === 0` AND `currentTotal > 0`, the entry SHALL be included with `deltaPct = Infinity` representation as `null` in the serialized aggregate (no JS `Infinity` token in the prompt).
12. THE `moodCategoryCounts` SHALL only include `(mood, category)` pairs where `count ≥ 2`.
13. THE `buildMonthlyAggregate` function SHALL NOT import `transactionStore`, `budgetStore`, `settingsStore`, `aiUsageRepo`, `geminiClient`, or any repository — it SHALL be callable as a pure data function.
14. THE `hashAggregate` function SHALL be pure and deterministic and SHALL produce the same hash for two structurally equal `MonthlyAggregate` values.

---

### Requirement 5: Insight Prompt Construction

**User Story:** As a developer, I want the insight prompt to be a static template plus the aggregate's numeric fields, so that no transaction history can leak into Gemini requests.

#### Acceptance Criteria

1. THE `buildInsightPrompt(aggregate)` function SHALL be pure and deterministic.
2. THE returned prompt SHALL contain a static instruction header asking Gemini to produce **behavioral observations**, not generic chart statistics.
3. THE returned prompt SHALL explicitly instruct Gemini to AVOID phrases of the shape "kategori terbesar adalah X" / "your top category is X" / "total pengeluaran bulan ini sekian" and other obvious chart restatements.
4. THE returned prompt SHALL instruct Gemini to focus on at least these behavioral angles: night-vs-day spending, weekend-vs-weekday impulse, mood × category correlation, small-but-frequent spending, month-over-month category change.
5. THE returned prompt SHALL instruct Gemini to use casual Indonesian, soft and supportive tone, non-judgmental, and SHALL forbid financial-advisor wording.
6. THE returned prompt SHALL instruct Gemini to return JSON only with no markdown.
7. THE returned prompt SHALL describe the JSON shape `{ items: Array<{ tone: "positive" | "neutral" | "soft-warning"; emoji: string; text: string }> }` with `1 ≤ items.length ≤ 5` and `text.length ≤ 200`.
8. THE returned prompt SHALL contain the literal `aggregate.month` value exactly once.
9. THE returned prompt SHALL contain the numeric fields of the aggregate (e.g., `txCount`, `totalSpending`, `nightCount`, `weekendSpending`, `smallTxCount`, `categoryDeltasFromPriorMonth`).
10. THE returned prompt SHALL NOT contain any value that is not present in the `MonthlyAggregate` argument — in particular, no value read from `transactionStore`, `transactionRepo`, IndexedDB, `localStorage`, or any other source.
11. THE `buildInsightPrompt` function SHALL NOT import `transactionStore`, `transactionRepo`, `aiUsageRepo`, `geminiClient`, or any repository or store module.
12. FOR ALL `MonthlyAggregate` inputs `a`, every substring of `buildInsightPrompt(a)` that is a digit-bearing token SHALL also appear in the canonical JSON of `a` or in the static template — i.e., no numeric data is invented.

---

### Requirement 6: Gemini Call Delegation

**User Story:** As a developer, I want insight generation to reuse Sprint 10's bounded Gemini client, so that timeout, abort, and error handling stay centralized.

#### Acceptance Criteria

1. THE `insightGenerator` SHALL invoke `geminiGenerate` from Sprint 10's `geminiClient` for every outbound network call.
2. THE `insightGenerator` SHALL NOT define its own `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, or other network-call implementation.
3. THE `insightGenerator` SHALL pass `timeoutMs: INSIGHT_TIMEOUT_MS` (i.e., `8000`) to `geminiGenerate` for every call.
4. PER successful insight generation, THE `insightGenerator` SHALL initiate at most **one** call to `geminiGenerate`.
5. WHEN `geminiGenerate` throws `AIError("MISSING_API_KEY")`, THE `insightGenerator` SHALL re-throw the same `AIError` without modification.
6. WHEN `geminiGenerate` throws `AIError("NETWORK")`, `"TIMEOUT"`, `"HTTP_4XX"`, `"HTTP_5XX"`, or `"EMPTY_RESPONSE"`, THE `insightGenerator` SHALL re-throw the same `AIError` without modification.
7. THE `insightGenerator` SHALL NOT bypass Sprint 10's API-key check — it SHALL rely on `geminiGenerate` to enforce `MISSING_API_KEY` errors.
8. THE `insightGenerator` SHALL apply Sprint 10's existing markdown-fence stripping helper (or an equivalent that satisfies the same idempotence property) before `JSON.parse`.

---

### Requirement 7: Insight Response Parsing and Validation

**User Story:** As a user, I want any malformed AI response to fail softly rather than show garbled insights, so that the card never displays junk.

#### Acceptance Criteria

1. WHEN `geminiGenerate` returns a non-empty string, THE `insightGenerator` SHALL strip any markdown fence and invoke `JSON.parse`, throwing `AIError("PARSE_FAILED")` if `JSON.parse` rejects.
2. WHEN the parsed object's `items` is not an array, THE `insightGenerator` SHALL throw `AIError("INSIGHT_VALIDATION_FAILED")`.
3. WHEN the parsed `items` array has length `0` or length `> 5`, THE `insightGenerator` SHALL throw `AIError("INSIGHT_VALIDATION_FAILED")`.
4. FOR EACH item in `items`, THE `insightGenerator` SHALL require: `tone ∈ {"positive", "neutral", "soft-warning"}`, `emoji` is a string of length `1..4`, `text` is a non-empty string trimmed to at most `200` characters.
5. WHEN any item fails the per-item validation in criterion 4, THE `insightGenerator` SHALL throw `AIError("INSIGHT_VALIDATION_FAILED")`.
6. WHEN validation succeeds, THE `insightGenerator` SHALL produce an `InsightSet` with a freshly-generated `id` per item, `generatedAt = new Date().toISOString()`, `month = aggregate.month`, and `sourceAggregateHash = hashAggregate(aggregate)`.
7. THE `insightGenerator` SHALL NOT auto-correct invalid items — it SHALL fail the whole generation on any item-level violation, leaving any prior cached `InsightSet` intact.

---

### Requirement 8: Caching and Idempotent Reads

**User Story:** As a user, I want re-opening the same month's report to show the same insight without burning quota, so that AI usage stays under control.

#### Acceptance Criteria

1. THE `aiInsightsRepo.get(month)` function SHALL return the cached `InsightSet` for that month or `undefined` when none exists.
2. WHEN `generateInsight(month)` is called WITHOUT `force === true` AND a cached `InsightSet` exists for `month`, THE `generateInsight` SHALL return the cached set WITHOUT calling `geminiGenerate` and WITHOUT calling `aiUsageRepo.incrementInsight`.
3. WHEN `generateInsight(month, { force: true })` is called, THE `generateInsight` SHALL bypass the cache and call `geminiGenerate` (subject to quota in Requirement 9).
4. WHEN `generateInsight` succeeds, THE `aiInsightsRepo.put(month, set)` SHALL be called exactly once with the validated `InsightSet`.
5. THE `aiInsightsRepo.put(month, set)` SHALL overwrite any existing entry for the same `month` key.
6. THE `aiInsights` IndexedDB store SHALL use `month` as its `keyPath` and SHALL therefore allow at most one record per month.
7. THE `AIReflectionCard` SHALL NOT call IndexedDB directly — all reads/writes SHALL go through `aiInsightsRepo`.
8. WHEN `aiInsightsRepo.get` rejects due to an underlying IndexedDB error, THE `AIReflectionCard` SHALL render `InsightCardState = "error"` and SHALL NOT increment quota.
9. FOR ANY two successive calls to `generateInsight(month)` with the same inputs and no `force` flag and no cache eviction, THE second call SHALL be observationally a pure read (no network, no quota change, identical return value).

---

### Requirement 9: Quota Tracking and Soft Monthly Limit

**User Story:** As a user, I want a soft monthly cap on AI insight generations, so that AI usage stays bounded and predictable.

#### Acceptance Criteria

1. THE `INSIGHT_MONTHLY_QUOTA` SHALL equal `3`.
2. WHEN `generateInsight(month)` is about to call `geminiGenerate` AND `aiInsightCount(month) >= INSIGHT_MONTHLY_QUOTA`, THE `generateInsight` SHALL throw `AIError("INSIGHT_QUOTA_EXCEEDED")` BEFORE invoking `geminiGenerate`.
3. WHEN `generateInsight(month)` succeeds (validated `InsightSet` produced), THE `aiUsageRepo.incrementInsight(month)` SHALL be called exactly once.
4. WHEN `generateInsight(month)` throws any error (network, timeout, parse, validation, quota), THE `aiUsageRepo.incrementInsight(month)` SHALL NOT be called.
5. ACROSS any execution trace, the count of `aiUsageRepo.incrementInsight(month)` invocations SHALL equal the count of distinct successful `InsightSet`s persisted via `aiInsightsRepo.put` for that `month`.
6. WHEN `AIError("INSIGHT_QUOTA_EXCEEDED")` is thrown AND a cached `InsightSet` exists for that `month`, THE `AIReflectionCard` SHALL render `InsightCardState = "success"` with the cached items AND SHALL render the "Refresh insight ✨" action in a disabled state with helper copy `"Quota AI bulan ini udah penuh. Insight tersimpan tetap bisa kamu liat ya 💛"`.
7. WHEN `AIError("INSIGHT_QUOTA_EXCEEDED")` is thrown AND no cached `InsightSet` exists for that `month`, THE `AIReflectionCard` SHALL render `InsightCardState = "quotaExceeded"` with copy `"Quota AI bulan ini udah penuh. Bisa coba bulan depan ya 💛"` and SHALL NOT block other Reports content.
8. THE `AIError("INSIGHT_QUOTA_EXCEEDED")` SHALL be a soft state — it SHALL NOT show a destructive toast, SHALL NOT clear the cached insight, and SHALL NOT disable other Reports actions (export, month navigation).
9. THE quota check SHALL read the live `aiUsageRepo.get(month).aiInsightCount` value at the moment of the call, not a stale store snapshot.

---

### Requirement 10: AIReflectionCard States

**User Story:** As a user, I want the insight card to clearly communicate every situation — disabled, no data, ready, loading, success, error, over quota — with soft copy, so that I always understand what's happening.

#### Acceptance Criteria

1. THE `AIReflectionCard` SHALL be in exactly one `InsightCardState` value at any time: `"disabled" | "empty" | "idle" | "loading" | "success" | "error" | "quotaExceeded"`.
2. WHEN `InsightCardState === "idle"`, THE `AIReflectionCard` SHALL render the title `"Refleksi AI ✨"`, helper copy explaining what insights cover, and a primary button labeled `"Liat insight ✨"`.
3. WHEN the user taps `"Liat insight ✨"`, THE `AIReflectionCard` SHALL set `InsightCardState = "loading"` and call `generateInsight(selectedMonth)`.
4. WHILE `InsightCardState === "loading"`, THE `AIReflectionCard` SHALL render a soft loading state (skeleton or spinner with copy like `"Lagi liat-liat polanya ✨"`) and SHALL disable the regenerate action.
5. WHEN `generateInsight` resolves with an `InsightSet`, THE `AIReflectionCard` SHALL set `InsightCardState = "success"` and render `set.items` in the order returned, each with its `emoji + text` and a tone-appropriate accent.
6. WHEN `InsightCardState === "success"`, THE `AIReflectionCard` SHALL render a secondary `"Refresh insight ✨"` action, enabled only when `aiInsightCount(month) < INSIGHT_MONTHLY_QUOTA`.
7. WHEN the user taps `"Refresh insight ✨"`, THE `AIReflectionCard` SHALL call `generateInsight(selectedMonth, { force: true })` and transition through `"loading"` → `"success"` (or `"error"` / `"quotaExceeded"`).
8. WHEN `generateInsight` rejects with any `AIError` other than `INSIGHT_QUOTA_EXCEEDED`, THE `AIReflectionCard` SHALL set `InsightCardState = "error"` and render copy `"AI lagi susah baca polanya. Coba sebentar lagi ya 💛"` with a `"Coba lagi"` action that re-attempts `generateInsight(selectedMonth, { force: true })`.
9. WHEN `generateInsight` rejects with `AIError("INSIGHT_QUOTA_EXCEEDED")`, THE `AIReflectionCard` SHALL behave per Requirement 9 criteria 6 and 7.
10. WHEN `InsightCardState === "empty"`, THE `AIReflectionCard` SHALL NOT render any `"Liat insight ✨"` or `"Refresh insight ✨"` actions.
11. WHEN `InsightCardState === "disabled"`, THE `AIReflectionCard` SHALL NOT render any `"Liat insight ✨"` or `"Refresh insight ✨"` actions.
12. THE `AIReflectionCard` SHALL NOT render any insight item whose `text` is empty after trimming.

---

### Requirement 11: Error Handling and Soft Recovery

**User Story:** As a user, I want every AI failure to feel soft and recoverable, so that I never feel stuck or scolded.

#### Acceptance Criteria

1. WHEN any error occurs in `AIReflectionCard`, the rest of the Reports page SHALL remain fully functional (per Requirement 1).
2. WHEN `AIError("MISSING_API_KEY")` is thrown, THE `AIReflectionCard` SHALL render `InsightCardState = "error"` with copy `"AI lagi belum nyala di build ini. Laporan manual tetap bisa kamu pakai ya 💛"`.
3. WHEN `AIError("NETWORK")` or `"TIMEOUT"` is thrown, THE `AIReflectionCard` SHALL render `InsightCardState = "error"` with copy `"Koneksi lagi ngambek. Coba sebentar lagi ya 🌧️"`.
4. WHEN `AIError("HTTP_4XX")`, `"HTTP_5XX"`, `"EMPTY_RESPONSE"`, `"PARSE_FAILED"`, or `"INSIGHT_VALIDATION_FAILED"` is thrown, THE `AIReflectionCard` SHALL render `InsightCardState = "error"` with copy `"AI lagi susah baca polanya. Coba sebentar lagi ya 💛"`.
5. WHEN `AIError("INSIGHT_NO_DATA")` is thrown (no transactions for the month), THE `AIReflectionCard` SHALL render `InsightCardState = "empty"` per Requirement 2 criterion 5.
6. AFTER any error, THE `AIReflectionCard` SHALL preserve any previously-cached `InsightSet` for the selected month (the cache is read-only on error paths).
7. AFTER any error, THE `aiUsageRepo.aiInsightCount(month)` SHALL NOT have been incremented by the failed call.
8. THE `AIReflectionCard` SHALL NOT render any uncaught-exception fallback (e.g., a generic React error boundary) for AI-only failures — all `AIError` paths SHALL be handled within the card.

---

### Requirement 12: Privacy of the Network Call

**User Story:** As a user, I want only aggregated numbers to reach Gemini, so that my actual transaction details and identifiers stay on-device.

#### Acceptance Criteria

1. ACROSS any execution trace of `generateInsight`, exactly **one** outbound HTTP request to `https://generativelanguage.googleapis.com/...` SHALL be made per non-cached, non-quota-blocked call, and zero requests on cached or quota-blocked calls.
2. THE outbound request body SHALL contain exactly one `contents[0].parts[0].text` field whose value is `buildInsightPrompt(aggregate)`.
3. THE outbound request body SHALL NOT contain any `Transaction.id`, `Transaction.detail`, `Transaction.note`, `Transaction.account`, `Transaction.createdAt`, `Transaction.updatedAt`, `Transaction.recurringRuleId`, `Transaction.date`, or any value read directly from a repository result without first passing through `buildMonthlyAggregate`.
4. THE outbound request body SHALL NOT contain user PII fields from `UserSettings` (e.g., `name`).
5. THE `insightAggregator`, `insightPrompt`, and `insightGenerator` modules SHALL NOT import `transactionRepo` results or any other repository in a way that allows raw entity data to bypass the aggregator. `insightGenerator` MAY call `transactionRepo.listByMonth` and `budgetRepo.*` for the purpose of building the aggregate, but every value passed to `buildInsightPrompt` SHALL come exclusively from the `MonthlyAggregate` returned by `buildMonthlyAggregate`.
6. THE `insightPrompt` module SHALL NOT import `transactionStore`, `transactionRepo`, `budgetStore`, `budgetRepo`, `settingsStore`, `aiUsageRepo`, or `aiInsightsRepo`.
7. THE `insightAggregator` module SHALL NOT import `transactionStore`, `transactionRepo`, `budgetStore`, `budgetRepo`, `settingsStore`, `aiUsageRepo`, `aiInsightsRepo`, `geminiClient`, or any other I/O module.
8. THE `geminiGenerate` URL invoked SHALL be exactly the Sprint 10 endpoint; this sprint SHALL NOT introduce additional outbound endpoints.

---

### Requirement 13: Soft Indonesian Copy

**User Story:** As a user reading Indonesian, I want every insight surface to feel casual, soft, and supportive, so that the experience matches Luma's tone.

#### Acceptance Criteria

1. THE `INSIGHT_TOAST_COPY` constant SHALL be a frozen object containing at minimum the keys `DISABLED`, `EMPTY`, `LOADING`, `ERROR_GENERIC`, `ERROR_NETWORK`, `ERROR_KEY`, `QUOTA_EXCEEDED`, `QUOTA_EXCEEDED_WITH_CACHE`.
2. EVERY value in `INSIGHT_TOAST_COPY` SHALL be Indonesian, casual, soft, supportive, and non-judgmental.
3. NO value in `INSIGHT_TOAST_COPY` SHALL contain financial-advisor wording, all-caps shouting, or words from this denylist (case-insensitive substring match): `"GAGAL DIKONTROL"`, `"MELEBIHI BATAS"`, `"WARNING:"`, `"ERROR:"`, `"DILARANG"`, `"WAJIB"`, `"HARUS"`.
4. EVERY visible `AIReflectionCard` copy string for the states `disabled`, `empty`, `idle`, `loading`, `error`, `quotaExceeded` SHALL be sourced from `INSIGHT_TOAST_COPY` or from a sibling frozen copy object inside the component module — no hard-coded inline ad-hoc strings.
5. WHEN `InsightCardState === "success"` AND any `InsightItem.tone === "soft-warning"`, THE rendered copy SHALL still read as supportive (this is enforced by the prompt instructions in Requirement 5; render layer SHALL NOT add scolding wording).
6. THE character (Sprint 6) MAY react softly to the dominant `InsightTone` of the rendered set (e.g., chill on `positive`, worried on `soft-warning`), but the character display SHALL NOT be required for the `AIReflectionCard` to render its copy.

---

### Requirement 14: Mobile-First Sizing

**User Story:** As a mobile user, I want the insight card to fit comfortably on small screens, so that reading insights stays easy.

#### Acceptance Criteria

1. THE `AIReflectionCard` SHALL render correctly within the existing `ReportsPage` mobile container, whose max width is 480px.
2. THE `AIReflectionCard` SHALL NOT introduce any horizontal scrolling at viewport widths `360px`, `390px`, `430px`, and `480px`.
3. THE rendered `InsightItem.text` SHALL wrap on small viewports without overflowing the card's padded inner width.
4. THE primary action button (`"Liat insight ✨"`) and secondary action button (`"Refresh insight ✨"` / `"Coba lagi"`) SHALL each have a touch target of at least 44 × 44 CSS pixels.
5. THE `AIReflectionCard` SHALL NOT inject any global CSS, theme tokens, or document-level styles — it SHALL consume Sprint 1's CSS variables for colors and Sprint 1's existing Card/Button primitives where available.

---

### Requirement 15: Repository Boundary

**User Story:** As a developer, I want the new insight cache to live behind a repository, so that the existing architectural rule (no IndexedDB calls from components) stays intact.

#### Acceptance Criteria

1. THE `aiInsightsRepo` SHALL expose at minimum: `get(month: string): Promise<InsightSet | undefined>`, `put(month: string, set: InsightSet): Promise<InsightSet>`, `remove(month: string): Promise<void>`, `listAll(): Promise<InsightSet[]>`.
2. THE `aiInsightsRepo` SHALL be the only module in the workspace that opens or writes the `aiInsights` IndexedDB store.
3. THE `AIReflectionCard`, `insightGenerator`, `insightAggregator`, and `insightPrompt` modules SHALL NOT call `idb`, `indexedDB`, or any `getDB()` helper directly for the `aiInsights` store.
4. WHEN `aiInsightsRepo.put` is called with an `InsightSet` whose `month` does not match the `month` argument, THE `aiInsightsRepo.put` SHALL throw `RepoError("INVALID_INPUT")` and SHALL NOT write the record.
5. WHEN `aiInsightsRepo.put` is called with an `InsightSet` containing zero items, THE `aiInsightsRepo.put` SHALL throw `RepoError("INVALID_INPUT")`.
6. THE `aiInsights` store schema upgrade SHALL be additive — it SHALL NOT modify or remove any of the Sprint 2 stores (`transactions`, `budgets`, `savingGoals`, `savingGoalContributions`, `recurringRules`, `settings`, `backgrounds`, `characters`, `themes`, `aiUsage`).

---

### Requirement 16: No New Dependencies

**User Story:** As a maintainer, I want this sprint to add no new npm dependencies, so that bundle size and supply-chain surface remain small.

#### Acceptance Criteria

1. THE Sprint 11 implementation SHALL NOT add any new entry to `package.json` `dependencies` or `devDependencies` beyond what Sprint 10 already brought in.
2. THE Sprint 11 implementation SHALL NOT introduce any new global runtime (e.g., a second HTTP client library, an additional crypto library, an additional storage library).
3. WHERE a hash is needed (`hashAggregate`), THE implementation SHALL use a small in-tree pure function (e.g., FNV-1a) and SHALL NOT pull in `crypto-js` or similar.

---

### Requirement 17: Behavioral Focus (Anti-Obvious-Stat Guarantee)

**User Story:** As a user, I want AI insights to teach me something I didn't already see in the charts, so that AI feels worth using.

#### Acceptance Criteria

1. THE `buildInsightPrompt` template SHALL forbid restating the chart-level facts that are already visible in `SummaryCards`, `CategoryChart`, and `SpendingTrendChart`.
2. THE `buildInsightPrompt` template SHALL list at least the following behavioral angles as desired insight territory: night spending, weekend impulse, mood × category correlation, small-but-frequent spending, month-over-month category change.
3. THE `buildInsightPrompt` template SHALL forbid generic financial-advisor recommendations such as `"sebaiknya kurangi pengeluaran"`, `"buat budget yang lebih ketat"`, or equivalents — Luma's tone is companion-like, not advisor-like.
4. THE `buildInsightPrompt` template SHALL allow soft, observation-style copy (e.g., examples drawn from `PRD §11`: `"kamu lebih sering checkout malam hari 🌙"`, `"pengeluaran impulsif paling sering muncul saat weekend."`, `"mood 😭 sering muncul bersamaan dengan pengeluaran makanan delivery."`).
5. WHEN the aggregate has zero behavioral signal (e.g., `txCount < 3`), THE `insightGenerator` SHALL skip the network call and throw `AIError("INSIGHT_NO_DATA")` BEFORE calling `geminiGenerate`, so quota is not consumed for trivial months.

---

### Requirement 18: Correctness Properties (Property-Based Test Targets)

**User Story:** As a maintainer, I want a fixed set of correctness properties for this feature, so that property-based tests can systematically check the privacy and quota guarantees.

#### Acceptance Criteria

1. **Aggregator purity**: FOR ALL inputs `(currentTxs, priorTxs, monthlyBudget, categoryBudgets, month)`, two consecutive calls to `buildMonthlyAggregate` with structurally equal inputs SHALL return structurally equal outputs.
2. **No-raw-leak**: FOR ALL `MonthlyAggregate` values `a` produced by `buildMonthlyAggregate`, `JSON.stringify(a)` SHALL NOT contain any character from any input `Transaction.detail`, `Transaction.note`, or `Transaction.id` value (substring check excluding shared structural tokens like `","` and `"}"`). Implementations SHOULD validate via a generated test harness that injects unique sentinel substrings into transaction text fields and asserts those sentinels never appear in the aggregate's serialization.
3. **Aggregator totals invariant**: FOR ALL inputs, `Σ categoryTotals[c] === totalSpending` AND `nightSpending + daySpending === totalSpending` AND `weekendSpending + weekdaySpending === totalSpending`.
4. **Aggregator counts invariant**: FOR ALL inputs, `nightCount + dayCount === txCount` AND `weekendCount + weekdayCount === txCount`.
5. **Prompt closure**: FOR ALL `MonthlyAggregate` values `a`, every digit-bearing token in `buildInsightPrompt(a)` SHALL also appear in the canonical JSON of `a` or in the static template (no invented numbers).
6. **Prompt no-store-leak**: FOR ALL test scenarios where `transactionStore`, `transactionRepo`, `budgetStore`, `budgetRepo`, `settingsStore`, `aiUsageRepo`, or `aiInsightsRepo` is mutated AFTER `buildInsightPrompt(a)` is called, the returned prompt string SHALL be unchanged (the prompt is a function of `a` only).
7. **Quota equals successes**: ACROSS any sequence of `generateInsight` calls for a fixed `month`, `aiUsageRepo.aiInsightCount(month)` SHALL equal the number of `aiInsightsRepo.put(month, set)` invocations triggered by that sequence.
8. **Quota soft-block**: WHEN `aiInsightCount(month) >= 3` AND `force === true`, `generateInsight(month, { force: true })` SHALL throw `AIError("INSIGHT_QUOTA_EXCEEDED")` AND SHALL NOT call `geminiGenerate` AND SHALL NOT change `aiInsightCount(month)`.
9. **Cache idempotence**: FOR ALL `month` such that `aiInsightsRepo.get(month) !== undefined`, two successive calls to `generateInsight(month)` (without `force`) SHALL produce the same `InsightSet` reference value (or structurally equal copy) AND SHALL each result in zero calls to `geminiGenerate` AND zero increments to `aiInsightCount(month)`.
10. **Manual report independence**: FOR ALL `InsightCardState` values, the rendered output of `SummaryCards`, `CategoryChart`, `SpendingTrendChart`, `BudgetComparisonSection`, and `ExportActions` SHALL be identical to their Sprint 8 baseline (no prop drift, no state coupling).
11. **No new endpoint**: FOR ALL `generateInsight` executions, the only outbound HTTP host contacted SHALL be `generativelanguage.googleapis.com` via `geminiGenerate`.
12. **No-PII-in-network**: FOR ALL `generateInsight` executions, the request body SHALL NOT contain any value from `Transaction.detail`, `Transaction.note`, `Transaction.id`, `UserSettings.name`, or any value not present in the source `MonthlyAggregate`.

---

### Requirement 19: No Regressions to Sprint 10 Parser Path

**User Story:** As a user, I want the Sprint 10 AI quick-input parser to keep working unchanged, so that the new insights feature doesn't accidentally break the existing transaction shortcut.

#### Acceptance Criteria

1. THE Sprint 10 `parserPrompt`, `transactionParser`, `geminiClient`, `amountNormalizer`, `enumSnap`, `voiceInput`, and `AIQuickInput` modules SHALL NOT be modified by this sprint except for additive changes (e.g., new exports or new `AIErrorCode` union members).
2. ANY new `AIErrorCode` values added by this sprint (`INSIGHT_QUOTA_EXCEEDED`, `INSIGHT_VALIDATION_FAILED`, `INSIGHT_NO_DATA`) SHALL be additions to the existing union — they SHALL NOT replace or rename existing codes.
3. THE Sprint 10 `aiUsageRepo.incrementInput` flow (used by AI parser saves) SHALL remain unchanged in behavior; this sprint only uses `aiUsageRepo.incrementInsight` and `aiUsageRepo.get`.
4. THE Sprint 10 `settings.aiEnabled` semantics SHALL remain unchanged: this single flag continues to gate both parser and insight surfaces.
