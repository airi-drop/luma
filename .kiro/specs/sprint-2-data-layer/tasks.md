# Implementation Plan: Sprint 2 — IndexedDB + Data Layer

## Overview

Convert the feature design into a series of prompts for a code-generation LLM that will implement each step with incremental progress. Make sure that each prompt builds on the previous prompts, and ends with wiring things together. There should be no hanging or orphaned code that isn't integrated into a previous step. Focus ONLY on tasks that involve writing, modifying, or testing code.

This plan implements Luma's local-first data foundation in TypeScript: IndexedDB schema + migrations, typed domain models, a stateless repository layer that owns all DB access, pure derived calculation helpers, and Zustand stores. Sprint 2 ships zero UI. The data flow is strictly UI → Store → Repository → IndexedDB. Property-based tests (`fast-check` + `fake-indexeddb`) cover the 14 correctness properties (P1–P14) defined in `design.md`.

## Tasks

- [ ] 1. Install testing dependencies and configure Vitest for the data layer
  - Add `fast-check`, `fake-indexeddb` as devDependencies
  - Verify `vitest` is present (added in Sprint 0); add it if missing
  - Update `vitest.config.ts` so `setupFiles` includes a setup file that imports `fake-indexeddb/auto` and resets the DB singleton between tests
  - Add a global `beforeEach` that calls `__resetDBSingleton()` and clears the in-memory IDB (`indexedDB = new IDBFactory()`) so each test starts from a clean schema
  - Add a `pnpm test` (or `npm test`) script wired to `vitest --run`
  - _Validates: Requirements 21.3_

- [ ] 2. Define domain types in `src/types/`
  - [ ] 2.1 Create `src/types/transaction.ts`
    - Export `AccountType`, `CategoryType`, `MoodType`, `TransactionSource`, and `Transaction` interface exactly as in design's "Data Models" section
    - _Validates: Requirements 5.1, 5.2_

  - [ ] 2.2 Create `src/types/budget.ts`
    - Export `BudgetKind`, `BudgetRecord`, `MonthlyBudget`, `CategoryBudget` view types
    - Export the literal constant `MONTHLY_TOTAL_CATEGORY = "__total__"` used as the sentinel category for monthly budgets
    - _Validates: Requirements 6.2, 6.3_

  - [ ] 2.3 Create `src/types/saving.ts`
    - Export `SavingGoal` and `SavingGoalContribution` interfaces with the `status` union `"active" | "completed" | "archived"`
    - _Validates: Requirements 7.1, 7.3_

  - [ ] 2.4 Create `src/types/recurring.ts`
    - Export `RecurringRule` interface with `frequency: "daily" | "weekly" | "monthly"`, optional `dayOfWeek` (0–6), optional `dayOfMonth` (1–31)
    - _Validates: Requirements 10.2, 10.3_

  - [ ] 2.5 Create `src/types/settings.ts`
    - Export `UserSettings` interface with `id: "main"`, `backgroundBlur` in 0–20, `backgroundOverlayOpacity` in 0–1
    - Export a `DEFAULT_SETTINGS` constant with sensible defaults (id `"main"`, `currency: "IDR"`, `themeMode: "auto"`, `aiEnabled: false`, etc.)
    - _Validates: Requirements 8.2, 8.5_

  - [ ] 2.6 Create `src/types/asset.ts`
    - Export `BackgroundAsset`, `CharacterConfig`, `ThemeConfig` interfaces
    - _Validates: Requirements 9.2_

  - [ ] 2.7 Create `src/types/ai.ts`
    - Export `AIUsage` interface with `id` typed as the `YYYY-MM` string
    - _Validates: Requirements 11.2_

  - [ ] 2.8 Create `src/types/index.ts` barrel
    - Re-export all type modules above so consumers can `import { ... } from "@/types"`
    - _Validates: Requirements 20.5_

- [ ] 3. Implement small library utilities in `src/lib/`
  - [ ] 3.1 Implement `src/lib/id.ts`
    - Wrap `nanoid` and export `newId(): string`
    - _Validates: Requirements 5.2_

  - [ ] 3.2 Implement `src/lib/date.ts`
    - Implement `dateToYYYYMMDD`, `dateToYYYYMM`, `parseMonth`, `isValidYYYYMMDD`, `isValidYYYYMM` exactly as in design "Date Helpers"
    - All functions are pure synchronous; no IndexedDB or React imports
    - _Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ] 3.3* Write unit tests for `src/lib/id.ts`
    - Generate 10,000 ids, assert all unique and non-empty
    - _Validates: Requirements 5.2_

  - [ ] 3.4* Write property test for date helpers — Date round-trip
    - **Property 13: Date helper round-trip**
    - Use `fc.date()`: `parseISO(dateToYYYYMMDD(d))` shares Y/M/D with `d`
    - Use `fc.integer({min:1970,max:2099})` × `fc.integer({min:1,max:12})`: `dateToYYYYMM(parseMonth(s)) === s` for `s = "YYYY-MM"`
    - Assert `isValidYYYYMMDD` / `isValidYYYYMM` reject malformed strings (invalid month 13, day 32, garbage)
    - _Validates: Requirements 12.2, 12.3, 12.4, 12.5_

- [ ] 4. Implement DB client and migrations in `src/db/`
  - [ ] 4.1 Implement `src/db/client.ts`
    - Define `DB_NAME = "luma-db"`, `DB_VERSION = 1`, `LumaDBSchema` interface as in design
    - Export `getDB(): Promise<IDBPDatabase<LumaDBSchema>>` with cached singleton promise
    - Export `__resetDBSingleton()` for tests
    - The `upgrade` callback delegates to `runMigrations`
    - _Validates: Requirements 1.1, 1.2, 1.3, 1.5_

  - [ ] 4.2 Implement `src/db/migrations.ts`
    - Export `runMigrations(db, oldVersion, newVersion, tx)`
    - Implement `migrateToV1(db)` creating the 10 object stores with key path `id` and all indexes from Requirement 2 (transactions: date, month, category, account, createdAt; budgets: month, category, unique compound `month+category`, compound `month+kind`; savingGoals: status, createdAt; savingGoalContributions: goalId, date; recurringRules: active, frequency; backgrounds: createdAt; settings/characters/themes/aiUsage: keyPath only)
    - Guard each `createObjectStore` with `db.objectStoreNames.contains(...)` and each `createIndex` with `store.indexNames.contains(...)`
    - Add commented `migrateToV2` placeholder
    - _Validates: Requirements 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.2, 3.3, 3.5_

  - [ ] 4.3 Define `RepoError` in `src/db/errors.ts`
    - Export `RepoError extends Error` with `code: "INVALID_INPUT" | "NOT_FOUND" | "DUPLICATE"`
    - _Validates: Requirements 4.1_

  - [ ] 4.4 Implement shared validators in `src/db/validators.ts`
    - Export `assertPositiveAmount`, `assertValidDate`, `assertValidMonth`, `assertNonEmptyString`, `assertEnumMember`, `trimStrings` helpers
    - Each throws `RepoError(INVALID_INPUT)` on violation
    - Import `isValidYYYYMMDD` / `isValidYYYYMM` from `src/lib/date.ts`
    - _Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5_

  - [ ] 4.5* Write integration test for migrations
    - Open DB at v1 with `fake-indexeddb`, write one record into each of the 10 stores, close, reopen at v1 with `__resetDBSingleton`
    - Assert all records survive and `db.objectStoreNames` matches expected set
    - _Validates: Requirements 1.4, 3.4, 21.2_

  - [ ] 4.6* Write property test for migration idempotence
    - **Property 6: Migration idempotence**
    - Open → close → reopen N times (N ∈ [2, 5] via `fc.integer`); assert `objectStoreNames` and per-store `indexNames` are identical, and any data written between opens is preserved
    - _Validates: Requirements 3.3, 3.4, 21.1, 21.2_

- [ ] 5. Implement transactions repository
  - [ ] 5.1 Implement `src/db/transactions.repo.ts`
    - Export `transactionRepo` with `create`, `update`, `remove`, `getById`, `listAll`, `listByMonth`, `listByDate`, `listByCategory`, `listByAccount`, `search`
    - `create` derives `month` via `dateToYYYYMM(input.date)`, generates `id` via `newId()`, sets `createdAt`/`updatedAt` to `new Date().toISOString()`, trims string fields, validates with `src/db/validators.ts`
    - `update` preserves `id` and `createdAt`, sets `updatedAt` to a strictly-later ISO timestamp than the previous `updatedAt` (use `Math.max(Date.now(), Date.parse(prev.updatedAt) + 1)` to guarantee monotonic), re-derives `month` if `date` changes, throws `RepoError(NOT_FOUND)` if id missing
    - `listByMonth` uses the `month` index; `search` composes index lookups + in-memory filter
    - _Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 14.5_

  - [ ] 5.2* Write property test — Persistence (write-then-read)
    - **Property 1: Persistence (write-then-read identity)**
    - Arbitrary for `CreateTransactionInput`; assert `getById(t.id)` deep-equals returned `Transaction`
    - _Validates: Requirements 5.2, 21.1_

  - [ ] 5.3* Write property test — Persistence across reopen
    - **Property 2: Persistence across reopen**
    - After `create`, call `__resetDBSingleton()`, then `listAll()` must contain the record with same field values
    - _Validates: Requirements 21.1, 21.2, 21.3_

  - [ ] 5.4* Write property test — Validation rejects invalid input
    - **Property 12: Validation rejects invalid inputs**
    - Arbitraries for `nominal <= 0`, empty `detail`, invalid `date`, non-enum `account`/`category`; assert `RepoError(INVALID_INPUT)` and `listAll()` length unchanged
    - _Validates: Requirements 5.5, 14.1, 14.2, 14.3, 14.4_

  - [ ] 5.5* Write property test — Update preserves id and createdAt
    - **Property 14: Repo update preserves id and createdAt**
    - After `update`, assert `t1.id === t0.id`, `t1.createdAt === t0.createdAt`, and `Date.parse(t1.updatedAt) > Date.parse(t0.updatedAt)`
    - _Validates: Requirements 5.3_

- [ ] 6. Implement budgets repository
  - [ ] 6.1 Implement `src/db/budgets.repo.ts`
    - Export `budgetRepo` with `setMonthlyBudget`, `getMonthlyBudget`, `removeMonthlyBudget`, `setCategoryBudget`, `getCategoryBudget`, `listCategoryBudgets`, `removeCategoryBudget`
    - `setMonthlyBudget(month, totalBudget)` upserts `BudgetRecord{ kind: "monthly", category: "__total__" }` keyed by lookup on `month+category` index; if existing, `put` to update; map to `MonthlyBudget` view
    - `setCategoryBudget(month, category, limit)` upserts `BudgetRecord{ kind: "category", category }` similarly via `month+category` index
    - Validate `month`, positive `totalBudget`/`limit`, enum `category`; throw `RepoError(INVALID_INPUT)` otherwise
    - _Validates: Requirements 6.1, 6.2, 6.3, 6.5_

  - [ ] 6.2* Write property test — Budget compound uniqueness
    - **Property 5: Budget compound uniqueness**
    - For arbitrary month, category, and limits L1, L2: after two `setCategoryBudget` calls, `listCategoryBudgets(month).filter(b => b.category === category)` has length 1 with `limit === L2`
    - Same property for `setMonthlyBudget`: only one monthly record per month
    - _Validates: Requirements 6.2, 6.3, 6.4_

- [ ] 7. Implement savings repository (with atomic `addContribution`)
  - [ ] 7.1 Implement `src/db/savings.repo.ts`
    - Export `savingsRepo` with `createGoal`, `updateGoal`, `archiveGoal`, `removeGoal`, `getGoal`, `listGoals`, `addContribution`, `listContributions`, `removeContribution`
    - `addContribution(goalId, amount, date, note?)` opens a single `db.transaction(["savingGoals", "savingGoalContributions"], "readwrite")`; reads goal, throws `RepoError(NOT_FOUND)` if missing; inserts contribution; increments `goal.currentAmount += amount`; flips `goal.status` to `"completed"` if `currentAmount >= targetAmount` and was `"active"`; updates `goal.updatedAt`; awaits `tx.done`
    - On any error inside the tx, abort propagates and neither write applies
    - Validates `amount > 0`, valid `date`, valid `goalId`
    - _Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ] 7.2* Write property test — Saving goal progress is bounded and monotonic
    - **Property 9: Saving goal progress is bounded and monotonic**
    - Arbitrary goal + array of positive amounts; after sequential `addContribution` calls, assert `0 ≤ p0 ≤ p1 ≤ 1`, `currentAmount = initial + Σ amounts`, and `status === "completed"` once `currentAmount >= targetAmount`
    - _Validates: Requirements 7.2, 7.3_

  - [ ] 7.3* Write property test — `addContribution` atomicity
    - **Property 11: `addContribution` atomicity**
    - Happy path: `g1 === g0 + amount` AND `n1 === n0 + 1`
    - Failure path: stub the contributions store `add` to reject inside the tx; assert `g1 === g0` AND `n1 === n0` (both unchanged)
    - _Validates: Requirements 7.4_

- [ ] 8. Implement settings repository (singleton)
  - [ ] 8.1 Implement `src/db/settings.repo.ts`
    - Export `settingsRepo` with `get`, `update`, `reset`
    - `get()` lazily inserts `DEFAULT_SETTINGS` (id `"main"`) when absent and returns it
    - `update(patch)` reads existing record, merges patch, preserves `id === "main"` and `createdAt`, sets `updatedAt`, persists via `put`
    - Validate `backgroundOverlayOpacity ∈ [0,1]` and `backgroundBlur ∈ [0,20]`
    - _Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ] 8.2* Write property test — Settings singleton uniqueness
    - **Property 3: Settings singleton uniqueness**
    - Arbitrary array of patches; after `update` calls, raw `getAll("settings")` returns exactly one record with `id === "main"`
    - _Validates: Requirements 8.4_

- [ ] 9. Implement backgrounds repository
  - [ ] 9.1 Implement `src/db/backgrounds.repo.ts`
    - Export `backgroundsRepo` with `create`, `getById`, `list`, `remove`
    - `create` persists the `Blob` directly (no base64), assigns `id`, sets `createdAt`
    - Reject `sizeBytes <= 0` with `RepoError(INVALID_INPUT)`; warn (`console.warn`) when `sizeBytes > 5_000_000` but still accept
    - _Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ] 9.2* Write property test — Background persistence (write-then-read)
    - **Property 1: Persistence (write-then-read identity)** applied to backgrounds
    - Arbitrary `CreateBackgroundInput` (small synthetic Blobs); assert `getById(b.id)` deep-equals created record (Blob bytes compared via `arrayBuffer()`)
    - _Validates: Requirements 9.2, 21.1_

- [ ] 10. Implement recurring rules repository
  - [ ] 10.1 Implement `src/db/recurring.repo.ts`
    - Export `recurringRepo` with `create`, `update`, `remove`, `getById`, `listActive`, `listAll`, `setLastRunDate`
    - Frequency-specific validation: `weekly` requires `dayOfWeek ∈ [0,6]`; `monthly` requires `dayOfMonth ∈ [1,31]`; `daily` requires neither
    - `create` defaults `active` to `true` when omitted
    - _Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ] 10.2* Write property test — Recurring frequency validation
    - **Property 12: Validation rejects invalid inputs** applied to recurring rules
    - Arbitraries: weekly without `dayOfWeek`, weekly with `dayOfWeek` out of range, monthly with `dayOfMonth` out of range; assert `RepoError(INVALID_INPUT)` and `listAll()` unchanged
    - _Validates: Requirements 10.2, 10.3, 10.4_

- [ ] 11. Implement AI usage repository
  - [ ] 11.1 Implement `src/db/ai-usage.repo.ts`
    - Export `aiUsageRepo` with `get`, `incrementInput`, `incrementInsight`, `reset`
    - `get(month)` returns zeroed record without inserting when absent
    - `incrementInput`/`incrementInsight` upsert by reading existing record (or creating one with `id === month`), incrementing the count by `by ?? 1`, setting `updatedAt`, and `put`-ing back
    - Validate `month` matches `^\d{4}-(0[1-9]|1[0-2])$`
    - _Validates: Requirements 11.1, 11.2, 11.3, 11.5_

  - [ ] 11.2* Write property test — AIUsage id uniqueness per month
    - **Property 4: AIUsage id uniqueness per month**
    - Arbitrary month and N ∈ [1, 50]; after N `incrementInput(month)` calls, raw `getAll("aiUsage")` filtered by `id === month` has length 1 with `aiInputCount === N`
    - _Validates: Requirements 11.3, 11.4_

- [ ] 12. Checkpoint — Repository layer complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement derived calculation helpers in `src/lib/calc/`
  - [ ] 13.1 Implement `src/lib/calc/totals.ts`
    - Export `getMonthlyTotal(transactions, month)`, `getTodayTotal(transactions, today)`, `getCategoryTotals(transactions)`, `getTopCategory(transactions)` matching design pseudocode
    - `getCategoryTotals` returns a `Record<CategoryType, number>` with all enum members initialized to 0
    - `getTopCategory` ties broken by ascending alphabetical category name; returns `null` for empty arrays
    - _Validates: Requirements 13.1, 13.2, 13.3, 13.6, 13.7_

  - [ ] 13.2 Implement `src/lib/calc/budget.ts`
    - Export `getBudgetUsage(monthlyBudget, transactions)` returning `{ used, remaining, percentage, isOver }`
    - Export `getCategoryBudgetUsage(categoryBudget, transactions)` filtering transactions by `t.category === categoryBudget.category`
    - _Validates: Requirements 13.1, 13.4_

  - [ ] 13.3 Implement `src/lib/calc/saving.ts`
    - Export `getSavingGoalProgress(goal): number` returning `min(1, goal.currentAmount / goal.targetAmount)`, clamped to `[0, 1]`
    - _Validates: Requirements 13.5_

  - [ ] 13.4 Implement `src/lib/calc/index.ts` barrel
    - Re-export all calc functions
    - _Validates: Requirements 20.5_

  - [ ] 13.5* Write property test — Derived totals match sum of transactions
    - **Property 7: Derived totals match sum of transactions**
    - Arbitrary `Transaction[]`: `getMonthlyTotal(ts, m) === Σ t.nominal where t.month === m`
    - Sum of `getCategoryTotals(ts)` values across categories equals `Σ t.nominal`
    - _Validates: Requirements 13.2, 13.3_

  - [ ] 13.6* Write property test — Budget usage algebraic identity
    - **Property 8: Budget usage algebraic identity**
    - Arbitrary `MonthlyBudget` with `totalBudget > 0` and `Transaction[]`: `used + remaining === totalBudget`, `percentage === used/totalBudget`, `isOver ⟺ used > totalBudget`
    - _Validates: Requirements 13.4_

  - [ ] 13.7* Write property test — Top category is argmax of category totals
    - **Property 10: Top category is the argmax of category totals**
    - Arbitrary non-empty `Transaction[]`: `getTopCategory(ts).amount === max(getCategoryTotals(ts))` and `getCategoryTotals(ts)[top.category] === top.amount`
    - Empty array case: `getTopCategory([]) === null`
    - _Validates: Requirements 13.6, 13.7_

  - [ ] 13.8* Write unit tests for `getSavingGoalProgress`
    - Cover edge cases: `currentAmount = 0`, `currentAmount = targetAmount`, `currentAmount > targetAmount` (clamped to 1)
    - _Validates: Requirements 13.5_

- [ ] 14. Implement Zustand stores in `src/stores/`
  - [ ] 14.1 Implement `src/stores/transactionStore.ts`
    - State `{ byId, currentMonth, loaded, loading, error? }`; actions `setCurrentMonth`, `loadMonth`, `createTransaction`, `updateTransaction`, `deleteTransaction`
    - Selectors `selectMonth`, `selectMonthlyTotal`, `selectTodayTotal`, `selectCategoryTotals`, `selectTopCategory` delegate to `src/lib/calc/totals`
    - `createTransaction` places the returned `Transaction` into `byId[id]` before resolving
    - Imports only from `src/db/transactions.repo`, `src/lib/calc`, `src/types`
    - _Validates: Requirements 15.1, 15.2, 15.3, 15.4, 15.5, 20.3, 20.5_

  - [ ] 14.2 Implement `src/stores/budgetStore.ts`
    - State `{ monthlyBudgets, categoryBudgets, loading, error? }`; actions `loadMonth`, `setMonthlyBudget`, `setCategoryBudget`, `removeCategoryBudget`
    - Selectors `selectMonthlyBudget`, `selectCategoryBudgets`, `selectBudgetUsage`, `selectCategoryBudgetUsage` delegate to `src/lib/calc/budget`
    - Updates in-memory cache after each mutation
    - _Validates: Requirements 16.1, 16.2, 16.3, 16.4, 16.5_

  - [ ] 14.3 Implement `src/stores/savingGoalStore.ts`
    - State `{ byId, contributionsByGoal, loading, error? }`; actions `loadAll`, `createGoal`, `updateGoal`, `archiveGoal`, `addContribution`
    - On `addContribution` resolve, update both `byId[goalId]` and `contributionsByGoal[goalId]` from repo response; on reject, leave both unchanged
    - Selectors `selectActive`, `selectCompleted`, `selectProgress(goalId)` delegate to `getSavingGoalProgress`
    - _Validates: Requirements 17.1, 17.2, 17.3, 17.4, 17.5_

  - [ ] 14.4 Implement `src/stores/settingsStore.ts`
    - State `{ settings, loading, error? }`; actions `hydrate`, `update`, `setActiveTheme`, `setActiveCharacter`, `setBackground`
    - `hydrate` calls `settingsRepo.get()`; mutations call `settingsRepo.update`; `state.settings.id === "main"` invariant maintained
    - _Validates: Requirements 18.1, 18.2, 18.3, 18.4, 18.5_

  - [ ] 14.5 Implement `src/stores/uiStore.ts`
    - State `{ activeSheet, activeSheetPayload?, toast, selectedMonth }`; synchronous actions `openSheet`, `closeSheet`, `showToast`, `dismissToast`, `setSelectedMonth`
    - Initialize `selectedMonth` to `dateToYYYYMM(new Date())`
    - No imports from `idb`, repos, or `localStorage`
    - _Validates: Requirements 19.1, 19.2, 19.3, 19.4, 19.5_

  - [ ] 14.6 Implement `src/stores/index.ts` barrel
    - Re-export all five stores
    - _Validates: Requirements 20.5_

  - [ ] 14.7* Write store unit tests with mocked repos
    - Use `vi.mock` to stub repos; assert `loadMonth`/`hydrate` populate state, `createTransaction` updates `byId` on resolve, `addContribution` rolls back on reject
    - _Validates: Requirements 15.3, 15.4, 17.3, 17.4, 18.3, 18.4_

  - [ ] 14.8* Write unit tests for `uiStore`
    - Assert sync actions update state immediately, `closeSheet` clears both `activeSheet` and `activeSheetPayload`, no async APIs called
    - _Validates: Requirements 19.2, 19.3, 19.4, 19.5_

- [ ] 15. Final integration and architecture verification
  - [ ] 15.1 Add a barrel `src/db/index.ts`
    - Re-export all repos plus `getDB`, `__resetDBSingleton`, `RepoError`
    - _Validates: Requirements 20.5_

  - [ ] 15.2* Write architectural import-lint test
    - Test verifies no file under `src/db/**` imports from `react`, `react-dom`, `framer-motion`, `src/components/`, or `src/stores/`
    - Test verifies no file under `src/lib/calc/**` or `src/lib/date.ts` imports from `react`, `react-dom`, `idb`, or `src/db/`
    - Test verifies no file under `src/stores/**` imports `idb` directly
    - Implementation: read each TS source file, parse its imports, assert against forbidden paths
    - _Validates: Requirements 4.5, 20.1, 20.2, 20.3, 20.5_

  - [ ] 15.3* Write end-to-end repo integration test (write → reopen → read across stores)
    - Write at least one record into all 10 object stores via their repos, call `__resetDBSingleton()`, then `listAll()`/`get()` from each repo and assert all records survive
    - _Validates: Requirements 21.1, 21.2_

- [ ] 16. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP. Core implementation tasks (unmarked) must always be implemented.
- Each leaf task references specific requirements via `_Validates: Requirements X.Y_` for traceability back to `requirements.md`.
- Property tests cover the 14 correctness properties (P1–P14) defined in `design.md` "Correctness Properties" section.
- Property tests use `fast-check` for arbitraries and `fake-indexeddb` for in-memory IDB (deterministic, fast).
- Sprint 2 ships zero UI artifacts; the architectural import-lint test (15.2) enforces the strict layering UI → Store → Repo → IDB.
- Atomicity tests for `addContribution` (P11) cover both happy and failure paths (forced abort) to prove the all-or-nothing guarantee.
- Checkpoints (12 and 16) provide natural pauses to verify the repo and store layers independently before moving on.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7"] },
    { "id": 2, "tasks": ["2.8", "3.1", "3.2"] },
    { "id": 3, "tasks": ["3.3", "3.4", "4.1", "4.3"] },
    { "id": 4, "tasks": ["4.2", "4.4"] },
    { "id": 5, "tasks": ["4.5", "4.6", "5.1", "6.1", "8.1", "9.1", "10.1", "11.1", "13.1", "13.2", "13.3"] },
    { "id": 6, "tasks": ["5.2", "5.3", "5.4", "5.5", "6.2", "7.1", "8.2", "9.2", "10.2", "11.2", "13.4", "13.5", "13.6", "13.7", "13.8"] },
    { "id": 7, "tasks": ["7.2", "7.3", "14.1", "14.2", "14.3", "14.4", "14.5"] },
    { "id": 8, "tasks": ["14.6", "14.7", "14.8"] },
    { "id": 9, "tasks": ["15.1"] },
    { "id": 10, "tasks": ["15.2", "15.3"] }
  ]
}
```
