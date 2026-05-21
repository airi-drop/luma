# Implementation Plan: Sprint 11 — AI Behavioral Insights

## Overview

This plan implements the AI Behavioral Insights feature by building from the bottom up: types and constants first, then the pure aggregator and prompt modules, followed by the repository layer, the orchestrator, and finally the UI component. Each step builds on the previous, ensuring no orphaned code. Property-based tests validate privacy and correctness guarantees throughout.

## Tasks

- [ ] 1. Define types, constants, and copy modules
  - [ ] 1.1 Create AI insight types
    - Create `src/types/ai-insight.ts` with `MonthlyAggregate`, `InsightSet`, `InsightItem`, `InsightTone`, and `InsightCardState` type definitions
    - Export all types for use by other Sprint 11 modules
    - _Requirements: 4.3, 4.5, 7.4, 10.1_

  - [ ] 1.2 Create insight constants module
    - Create `src/features/ai/insightConstants.ts` with `INSIGHT_MONTHLY_QUOTA` (3), `INSIGHT_TIMEOUT_MS` (8000), `SMALL_TX_THRESHOLD_IDR` (25000), `SMALL_FREQUENT_MIN_COUNT` (5), `MoM_DELTA_PCT_THRESHOLD` (25), `NIGHT_HOUR_START` (21), `NIGHT_HOUR_END` (5), `WEEKEND_DAYS` (Set [0, 6]), `MOOD_CATEGORY_MIN_COUNT` (2)
    - _Requirements: 4.9, 4.10, 4.11, 4.12, 9.1_

  - [ ] 1.3 Create insight copy module
    - Create `src/features/ai/insightCopy.ts` with `INSIGHT_TOAST_COPY` and `INSIGHT_CARD_COPY` frozen objects containing all Indonesian copy strings per the design's Copy Catalogue
    - Ensure no denylist words appear in any copy value
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

  - [ ] 1.4 Add new AIErrorCode values
    - Add `INSIGHT_QUOTA_EXCEEDED`, `INSIGHT_VALIDATION_FAILED`, `INSIGHT_NO_DATA` to the existing `AIErrorCode` union in `src/features/ai/errors.ts`
    - Additive only — do not modify or rename existing codes
    - _Requirements: 19.1, 19.2_

- [ ] 2. Implement insightAggregator (pure module)
  - [ ] 2.1 Implement `buildMonthlyAggregate` function
    - Create `src/features/ai/insightAggregator.ts`
    - Implement bucket classification (night/day via hour, weekend/weekday via day-of-week)
    - Implement category totals, small-tx counting, mood×category correlation (pairs with count ≥ 2), and month-over-month category deltas (|deltaPct| ≥ 25% or new categories with deltaPct = null)
    - Ensure the function is pure: no I/O, no imports of stores/repos/clients
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12, 4.13_

  - [ ] 2.2 Implement `hashAggregate` function
    - Implement FNV-1a 32-bit hash over `JSON.stringify(aggregate)`, returning hex string ≤ 16 chars
    - Ensure pure and deterministic — no crypto, no network
    - _Requirements: 4.14_

  - [ ]* 2.3 Write property tests for aggregator purity (Property 1)
    - **Property 1: Aggregator Purity and Determinism**
    - Generate random Transaction[] (0..100 items) and budgets, call buildMonthlyAggregate twice with same inputs, assert deep equality
    - **Validates: Requirements 4.1, 18.1**

  - [ ]* 2.4 Write property tests for no-raw-data-leak (Property 2)
    - **Property 2: No Raw Data Leak (Sentinel Injection)**
    - Generate transactions with unique 12-char sentinel strings in detail/note/id, build aggregate, assert JSON.stringify(aggregate) contains no sentinel substrings
    - **Validates: Requirements 4.4, 12.3, 18.2**

  - [ ]* 2.5 Write property tests for aggregator totals invariant (Property 3)
    - **Property 3: Aggregator Totals Invariant**
    - Generate random transactions, verify Σ categoryTotals === totalSpending, nightSpending + daySpending === totalSpending, weekendSpending + weekdaySpending === totalSpending
    - **Validates: Requirements 4.7, 4.8, 4.9, 18.3**

  - [ ]* 2.6 Write property tests for aggregator counts invariant (Property 4)
    - **Property 4: Aggregator Counts Invariant**
    - Generate random transactions, verify nightCount + dayCount === txCount, weekendCount + weekdayCount === txCount, txCount === input.length
    - **Validates: Requirements 4.6, 4.9, 18.4**

- [ ] 3. Implement insightPrompt (pure module)
  - [ ] 3.1 Implement `buildInsightPrompt` function
    - Create `src/features/ai/insightPrompt.ts`
    - Implement the static behavioral-instruction template with placeholder interpolation for all MonthlyAggregate numeric fields
    - Ensure the prompt forbids chart-stat restatement, forbids financial-advisor wording, requires behavioral angles (night/day, weekend/weekday, mood×category, small-but-frequent, MoM deltas)
    - Instruct Gemini to return JSON only with the specified shape (items array, tone, emoji, text)
    - Ensure pure: no imports of stores/repos/clients
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 17.1, 17.2, 17.3, 17.4_

  - [ ]* 3.2 Write property tests for prompt closure (Property 5)
    - **Property 5: Prompt Closure (No Invented Numbers)**
    - Generate random MonthlyAggregate values, extract digit-bearing tokens from buildInsightPrompt output, verify each exists in JSON.stringify(aggregate) or in the static template
    - **Validates: Requirements 5.10, 5.12, 18.5**

  - [ ]* 3.3 Write property tests for prompt isolation (Property 6)
    - **Property 6: Prompt Isolation from Stores**
    - Generate aggregate, call buildInsightPrompt, mutate a mock store, call again, assert same output
    - **Validates: Requirements 5.1, 5.11, 18.6**

- [ ] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement aiInsightsRepo (repository layer)
  - [ ] 5.1 Add `aiInsights` IndexedDB store via schema migration
    - Add additive schema upgrade to `luma-db` creating `aiInsights` object store with keyPath `"month"`
    - Do not modify or remove any existing Sprint 2 stores
    - _Requirements: 15.6_

  - [ ] 5.2 Implement `aiInsightsRepo` CRUD operations
    - Create `src/db/ai-insights.repo.ts` with `get(month)`, `put(month, set)`, `remove(month)`, `listAll()`
    - Implement validation: `put` throws `RepoError("INVALID_INPUT")` if `set.month !== month` or `set.items.length === 0`
    - `put` overwrites existing entry for same month key
    - _Requirements: 8.1, 8.5, 8.6, 15.1, 15.2, 15.3, 15.4, 15.5_

  - [ ]* 5.3 Write unit tests for aiInsightsRepo
    - Test get returns undefined for missing month
    - Test put/get round-trip
    - Test put overwrites existing entry
    - Test put throws on mismatched month
    - Test put throws on empty items array
    - _Requirements: 8.1, 15.4, 15.5_

- [ ] 6. Implement insightGenerator (orchestrator)
  - [ ] 6.1 Implement `generateInsight` orchestrator function
    - Create `src/features/ai/insightGenerator.ts`
    - Implement the full pipeline: cache check → data load → aggregate → early exit if txCount < 3 → quota check → prompt → geminiGenerate (8000ms timeout) → strip fence → parse → validate → build InsightSet → cache via aiInsightsRepo.put → increment quota → return
    - Reuse Sprint 10's `geminiGenerate`, `stripMarkdownFence`, `AIError`
    - Implement `validateInsightResponse` per design (array check, length 1-5, per-item tone/emoji/text validation)
    - Ensure quota increments exactly once on success, zero times on any failure
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 8.2, 8.3, 8.4, 9.2, 9.3, 9.4, 9.9, 17.5_

  - [ ]* 6.2 Write property tests for quota-equals-successes (Property 7)
    - **Property 7: Quota Equals Successes**
    - Mock geminiGenerate to alternate success/failure, run N generateInsight calls, assert aiUsageRepo.aiInsightCount === number of successful aiInsightsRepo.put calls
    - **Validates: Requirements 9.3, 9.4, 9.5, 18.7**

  - [ ]* 6.3 Write property tests for quota soft-block (Property 8)
    - **Property 8: Quota Soft-Block**
    - Set aiInsightCount >= 3, call generateInsight with force: true, assert throws INSIGHT_QUOTA_EXCEEDED, no geminiGenerate call, no aiInsightCount change
    - **Validates: Requirements 9.2, 18.8**

  - [ ]* 6.4 Write property tests for cache idempotence (Property 9)
    - **Property 9: Cache Idempotence**
    - Pre-populate cache, call generateInsight twice without force, assert same result, zero network calls, zero quota increments
    - **Validates: Requirements 8.2, 8.9, 18.9**

- [ ] 7. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement AIReflectionCard UI component
  - [ ] 8.1 Implement AIReflectionCard with 7-state machine
    - Create `src/components/cards/AIReflectionCard.tsx`
    - Implement state evaluation: disabled (aiEnabled false) → empty (zero txs) → idle (no cache) → success (cache exists)
    - Read selected month from ReportsPage month selector state
    - Render correct copy and actions per state (using INSIGHT_TOAST_COPY and INSIGHT_CARD_COPY)
    - Implement "Liat insight ✨" action (idle → loading → success/error/quotaExceeded)
    - Implement "Refresh insight ✨" action (success → loading → success/error/quotaExceeded, enabled only when quota < 3)
    - Implement "Coba lagi" action (error → loading → success/error)
    - Handle INSIGHT_QUOTA_EXCEEDED: show success with disabled refresh if cache exists, else show quotaExceeded state
    - Handle all AIError codes with appropriate copy per error mapping table
    - Never block/suspend/delay other ReportsPage components
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 9.6, 9.7, 9.8, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10, 10.11, 10.12, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8_

  - [ ] 8.2 Style AIReflectionCard for mobile-first layout
    - Use Sprint 1 Card primitive (padding 16px, radius 20px, bg-card)
    - Implement tone-appropriate accent colors (positive=sage, neutral=cream, soft-warning=amber) via left-border or subtle background tint
    - Ensure touch targets ≥ 44×44 CSS px for all action buttons
    - Ensure no horizontal scroll at 360/390/430/480px viewports
    - Use word-wrap: break-word for insight text, no white-space: nowrap
    - Do not inject global CSS or theme tokens — consume existing CSS variables
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [ ]* 8.3 Write unit tests for AIReflectionCard states
    - Test render in each of the 7 states with correct copy and action buttons
    - Test "Liat insight ✨" tap triggers loading → success transition
    - Test error responses show correct error copy and "Coba lagi" action
    - Test quota exceeded with and without cache
    - Test month change triggers state re-evaluation
    - Test disabled state shows no action buttons
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10, 10.11_

- [ ] 9. Mount AIReflectionCard on ReportsPage
  - [ ] 9.1 Replace Sprint 8 placeholder with active AIReflectionCard
    - Mount `<AIReflectionCard />` in the same vertical slot the Sprint 8 disabled placeholder occupied on ReportsPage
    - Ensure SummaryCards, CategoryChart, SpendingTrendChart, BudgetComparisonSection, and ExportActions render independently of AIReflectionCard state
    - Ensure PDF and spreadsheet exports function regardless of AIReflectionCard state
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.6_

  - [ ]* 9.2 Write property test for manual report independence (Property 10)
    - **Property 10: Manual Report Independence**
    - Render ReportsPage with various InsightCardState values, snapshot manual report components, assert identical to Sprint 8 baseline
    - **Validates: Requirements 1.2, 1.3, 1.5, 1.6, 18.10**

- [ ] 10. Final validation and copy denylist check
  - [ ] 10.1 Write copy denylist compliance test (Property 11)
    - **Property 11: Copy Denylist Compliance**
    - Iterate all values in INSIGHT_TOAST_COPY and INSIGHT_CARD_COPY, assert none contain denylist substrings (case-insensitive): "GAGAL DIKONTROL", "MELEBIHI BATAS", "WARNING:", "ERROR:", "DILARANG", "WAJIB", "HARUS"
    - **Validates: Requirements 13.3**

- [ ] 11. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties defined in the design
- Unit tests validate specific examples and edge cases
- The design uses TypeScript throughout — all implementations use React + TypeScript + Vite + Tailwind CSS
- Sprint 10's `geminiClient`, `geminiGenerate`, `AIError`, `stripMarkdownFence` are reused, not re-implemented
- Sprint 2's repos (`transactionRepo`, `budgetRepo`, `aiUsageRepo`) are reused as-is
- `fast-check` is already available in devDependencies from Sprint 10

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4"] },
    { "id": 1, "tasks": ["2.1", "2.2", "3.1", "5.1"] },
    { "id": 2, "tasks": ["2.3", "2.4", "2.5", "2.6", "3.2", "3.3", "5.2"] },
    { "id": 3, "tasks": ["5.3", "6.1"] },
    { "id": 4, "tasks": ["6.2", "6.3", "6.4", "8.1"] },
    { "id": 5, "tasks": ["8.2", "8.3"] },
    { "id": 6, "tasks": ["9.1"] },
    { "id": 7, "tasks": ["9.2", "10.1"] }
  ]
}
```
