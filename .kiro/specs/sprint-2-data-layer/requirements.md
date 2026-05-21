# Requirements Document

## Introduction

Sprint 2 establishes Luma's local-first data foundation: an IndexedDB client (via `idb`), strongly-typed domain models, a repository layer that owns all DB access, derived calculation helpers, and Zustand stores that expose state to future UI sprints. This sprint produces zero UI artifacts. It enforces a strict one-way data flow — UI → Store → Repository → IndexedDB — so that components in later sprints never reach into the database directly.

The data layer must guarantee: data written is data read back (persistence), data survives a page reload (durability), schema evolution is safe (idempotent migrations), invalid input is rejected with typed errors before reaching IndexedDB (validation), and derived values (monthly totals, budget usage, saving progress) are computed by pure helpers with predictable algebraic identities.

This document derives requirements from `design.md` and maps each requirement to one or more correctness properties (P1–P14) defined in the design's "Correctness Properties" section. Property identifiers in `**Validates:**` annotations refer to those properties.

## Glossary

- **DB_Client**: The module at `src/db/client.ts` that owns the singleton `IDBPDatabase<LumaDBSchema>` and the `getDB()` accessor.
- **Repository**: A stateless async module under `src/db/*.repo.ts` that validates input, performs IndexedDB reads/writes, and returns `Promise<T>`.
- **Transaction_Repo**: The repository at `src/db/transactions.repo.ts`.
- **Budget_Repo**: The repository at `src/db/budgets.repo.ts`.
- **Savings_Repo**: The repository at `src/db/savings.repo.ts`.
- **Settings_Repo**: The repository at `src/db/settings.repo.ts`.
- **Backgrounds_Repo**: The repository at `src/db/backgrounds.repo.ts`.
- **Recurring_Repo**: The repository at `src/db/recurring.repo.ts`.
- **AIUsage_Repo**: The repository at `src/db/ai-usage.repo.ts`.
- **Migration_Module**: The module at `src/db/migrations.ts` that exports `runMigrations`.
- **Calc_Helpers**: Pure functions under `src/lib/calc/` that compute derived values from plain data.
- **Date_Helpers**: Pure functions under `src/lib/date.ts` that wrap `date-fns` for `YYYY-MM-DD` and `YYYY-MM` strings.
- **Transaction_Store**: The Zustand store at `src/stores/transactionStore.ts`.
- **Budget_Store**: The Zustand store at `src/stores/budgetStore.ts`.
- **SavingGoal_Store**: The Zustand store at `src/stores/savingGoalStore.ts`.
- **Settings_Store**: The Zustand store at `src/stores/settingsStore.ts`.
- **UI_Store**: The Zustand store at `src/stores/uiStore.ts`.
- **RepoError**: The single error class thrown by repositories, carrying a `code` field with values `INVALID_INPUT`, `NOT_FOUND`, or `DUPLICATE`.
- **Singleton Settings**: The `UserSettings` record stored in the `settings` object store with `id === "main"`. There is at most one such record.
- **Compound Budget Key**: The pair `[month, category]` used as the unique compound index on the `budgets` object store. For monthly budgets, `category` takes the literal value `"__total__"`.
- **YYYY-MM-DD**: A date string matching `^\d{4}-\d{2}-\d{2}$` representing a real calendar date.
- **YYYY-MM**: A month string matching `^\d{4}-(0[1-9]|1[0-2])$`.
- **Atomic Write**: A single IndexedDB `readwrite` transaction that spans multiple stores and either commits all writes or aborts all of them.

## Requirements

### Requirement 1: IndexedDB Client and Schema

**User Story:** As a developer, I want a single typed IndexedDB client that owns the schema, so that all repositories share one database connection and one schema definition.

#### Acceptance Criteria

1. THE DB_Client SHALL expose a `getDB()` function that returns `Promise<IDBPDatabase<LumaDBSchema>>` and caches the database promise across calls.
2. THE DB_Client SHALL open the database with name `"luma-db"` and version `1`.
3. WHEN `getDB()` is called for the first time, THE DB_Client SHALL invoke `runMigrations` from the Migration_Module inside the `idb` `upgrade` callback.
4. THE DB_Client SHALL create the following ten object stores at version 1: `transactions`, `budgets`, `savingGoals`, `savingGoalContributions`, `recurringRules`, `settings`, `backgrounds`, `characters`, `themes`, `aiUsage`.
5. THE DB_Client SHALL expose `__resetDBSingleton()` so tests can reset the cached database promise between cases.

**Validates:** P2, P6.

### Requirement 2: Object Store Indexes

**User Story:** As a repository author, I want the correct indexes provisioned at v1, so that list queries can use index lookups instead of full scans.

#### Acceptance Criteria

1. THE DB_Client SHALL create indexes `date`, `month`, `category`, `account`, and `createdAt` on the `transactions` store.
2. THE DB_Client SHALL create indexes `month`, `category`, a unique compound index `month+category` on `["month", "category"]`, and a compound index `month+kind` on `["month", "kind"]` on the `budgets` store.
3. THE DB_Client SHALL create indexes `status` and `createdAt` on the `savingGoals` store.
4. THE DB_Client SHALL create indexes `goalId` and `date` on the `savingGoalContributions` store.
5. THE DB_Client SHALL create indexes `active` and `frequency` on the `recurringRules` store.
6. THE DB_Client SHALL create the index `createdAt` on the `backgrounds` store.
7. THE `settings`, `characters`, `themes`, and `aiUsage` stores SHALL be created with key path `id` and no additional indexes.

**Validates:** P5, P6.

### Requirement 3: Migration Path and Idempotence

**User Story:** As a maintainer, I want migrations to be idempotent and version-gated, so that re-opening the database or bumping the version never corrupts existing data.

#### Acceptance Criteria

1. THE Migration_Module SHALL export `runMigrations(db, oldVersion, newVersion, tx)` as the single entry point used by the DB_Client `upgrade` callback.
2. WHEN `oldVersion` is less than 1, THE Migration_Module SHALL run the v1 baseline migration that creates every store and index defined in Requirements 1 and 2.
3. THE v1 baseline migration SHALL guard each store creation with `db.objectStoreNames.contains(...)` and each index creation with `store.indexNames.contains(...)`, so that re-running it on an already-v1 database is a no-op.
4. WHEN the database is opened at version 1, then closed, then opened again at version 1, THE schema SHALL contain the same object store names and the same indexes as after the first open, and any data written before the close SHALL still be readable after the second open.
5. THE Migration_Module SHALL provide a placeholder pattern for future versions (commented `migrateToV2` example) so that adding `if (oldVersion < N) migrateToVN(db, tx)` is the only edit required to ship a new migration.

**Validates:** P2, P6.

### Requirement 4: RepoError and Error Codes

**User Story:** As a store author, I want repositories to throw a single typed error with stable codes, so that stores can map errors to soft Indonesian copy without parsing messages.

#### Acceptance Criteria

1. THE Repository layer SHALL define a single `RepoError` class with fields `code: "INVALID_INPUT" | "NOT_FOUND" | "DUPLICATE"` and `message: string`.
2. WHEN a repository receives input that violates a validation rule from Requirement 14, THE Repository SHALL throw `RepoError` with `code === "INVALID_INPUT"` and SHALL NOT write to IndexedDB.
3. WHEN a repository update or delete targets an `id` that does not exist, THE Repository SHALL throw `RepoError` with `code === "NOT_FOUND"`.
4. WHEN a repository write would violate a unique compound index, THE Repository SHALL either upsert via `put` (when the API contract is upsert) or throw `RepoError` with `code === "DUPLICATE"` (when the API contract is insert).
5. THE Repository layer SHALL NOT import from `src/components/`, `src/pages/`, `src/stores/`, or any React or Zustand module.

**Validates:** P12.

### Requirement 5: Transaction Repository

**User Story:** As a store, I want a transaction repository that validates input and exposes CRUD plus index-backed queries, so that the UI never touches IndexedDB and queries stay fast.

#### Acceptance Criteria

1. THE Transaction_Repo SHALL expose `create`, `update`, `remove`, `getById`, `listAll`, `listByMonth`, `listByDate`, `listByCategory`, `listByAccount`, and `search` as `Promise`-returning functions.
2. WHEN `create(input)` is called with a valid `CreateTransactionInput`, THE Transaction_Repo SHALL generate `id` via `newId()`, derive `month` from `input.date` using the Date_Helpers, set `createdAt` and `updatedAt` to the current ISO timestamp, and persist the resulting `Transaction` to the `transactions` store.
3. WHEN `update(id, input)` is called for an existing transaction, THE Transaction_Repo SHALL preserve the existing `id` and `createdAt`, set `updatedAt` to a strictly later ISO timestamp than the previous `updatedAt`, and re-derive `month` if `date` is present in the patch.
4. WHEN `listByMonth(month)` is called, THE Transaction_Repo SHALL use the `month` index to fetch matching records.
5. IF `create` or `update` receives `nominal <= 0`, a `detail` whose `.trim()` is empty, an `account`/`category` outside its enum, or a `date` that fails `isValidYYYYMMDD`, THEN THE Transaction_Repo SHALL throw `RepoError(INVALID_INPUT)` and SHALL NOT modify the `transactions` store.

**Validates:** P1, P12, P14.

### Requirement 6: Budget Repository

**User Story:** As a store, I want a budget repository that enforces one monthly budget per month and one category budget per month per category, so that budget data has no duplicates.

#### Acceptance Criteria

1. THE Budget_Repo SHALL expose `setMonthlyBudget`, `getMonthlyBudget`, `removeMonthlyBudget`, `setCategoryBudget`, `getCategoryBudget`, `listCategoryBudgets`, and `removeCategoryBudget` as `Promise`-returning functions.
2. WHEN `setMonthlyBudget(month, totalBudget)` is called, THE Budget_Repo SHALL upsert a `BudgetRecord` with `kind === "monthly"` and `category === "__total__"` for that `month`, so that at most one monthly record exists per month.
3. WHEN `setCategoryBudget(month, category, limit)` is called, THE Budget_Repo SHALL upsert a `BudgetRecord` with `kind === "category"` for that `[month, category]` pair, so that at most one category record exists per month per category.
4. THE `budgets` store SHALL enforce uniqueness on the Compound Budget Key via the `month+category` unique compound index defined in Requirement 2.
5. IF `setMonthlyBudget` or `setCategoryBudget` receives `totalBudget <= 0`, `limit <= 0`, an invalid `month`, or a `category` outside the enum, THEN THE Budget_Repo SHALL throw `RepoError(INVALID_INPUT)` and SHALL NOT modify the `budgets` store.

**Validates:** P5.

### Requirement 7: Savings Repository

**User Story:** As a store, I want a savings repository that updates goal totals and persists contributions in a single atomic write, so that goal balances and contribution history can never drift.

#### Acceptance Criteria

1. THE Savings_Repo SHALL expose `createGoal`, `updateGoal`, `archiveGoal`, `removeGoal`, `getGoal`, `listGoals`, `addContribution`, `listContributions`, and `removeContribution` as `Promise`-returning functions.
2. WHEN `addContribution(goalId, amount, date, note?)` is called, THE Savings_Repo SHALL open a single IndexedDB `readwrite` transaction over both `savingGoals` and `savingGoalContributions`, insert the new `SavingGoalContribution`, increment the parent goal's `currentAmount` by `amount`, and update `goal.updatedAt` within the same transaction.
3. WHEN, after `addContribution`, `goal.currentAmount` is greater than or equal to `goal.targetAmount` and `goal.status` was `"active"`, THE Savings_Repo SHALL set `goal.status` to `"completed"` within the same transaction.
4. IF the IndexedDB transaction inside `addContribution` aborts, THEN THE Savings_Repo SHALL leave both `goal.currentAmount` and the count of contributions for `goalId` unchanged.
5. IF `addContribution` is called with `amount <= 0`, an invalid `date`, or a `goalId` that does not exist, THEN THE Savings_Repo SHALL throw `RepoError(INVALID_INPUT)` for invalid input or `RepoError(NOT_FOUND)` for missing goal, and SHALL NOT write to either store.

**Validates:** P9, P11.

### Requirement 8: Settings Repository and Singleton

**User Story:** As a developer, I want settings stored as a singleton with id `"main"`, so that the app always has exactly one user settings record.

#### Acceptance Criteria

1. THE Settings_Repo SHALL expose `get`, `update`, and `reset` as `Promise`-returning functions.
2. WHEN `get()` is called and no record exists in the `settings` store, THE Settings_Repo SHALL insert `DEFAULT_SETTINGS` with `id === "main"` and return it.
3. WHEN `update(patch)` is called, THE Settings_Repo SHALL merge the patch into the existing singleton, preserve `id === "main"` and `createdAt`, set `updatedAt` to the current ISO timestamp, and persist the result.
4. AFTER any sequence of `update` calls, THE `settings` store SHALL contain exactly one record and that record's `id` SHALL equal `"main"`.
5. IF `update` receives a `backgroundOverlayOpacity` outside `[0, 1]` or a `backgroundBlur` outside `[0, 20]`, THEN THE Settings_Repo SHALL throw `RepoError(INVALID_INPUT)` and SHALL NOT modify the `settings` store.

**Validates:** P3.

### Requirement 9: Backgrounds Repository

**User Story:** As a store, I want a backgrounds repository that persists image blobs by id, so that custom backgrounds survive reloads without being loaded eagerly.

#### Acceptance Criteria

1. THE Backgrounds_Repo SHALL expose `create`, `getById`, `list`, and `remove` as `Promise`-returning functions.
2. WHEN `create(input)` is called with a valid `CreateBackgroundInput`, THE Backgrounds_Repo SHALL persist the `Blob` directly (not as base64), assign a generated `id`, and store `sizeBytes`, `width`, `height`, `mimeType`, and `createdAt`.
3. IF `create` receives `sizeBytes <= 0`, THEN THE Backgrounds_Repo SHALL throw `RepoError(INVALID_INPUT)` and SHALL NOT modify the `backgrounds` store.
4. WHERE `sizeBytes > 5_000_000`, THE Backgrounds_Repo SHALL accept the write and log a warning to the console.
5. THE Backgrounds_Repo SHALL NOT load all blobs eagerly; `list()` SHALL be the only API that may return all background records.

**Validates:** P1.

### Requirement 10: Recurring Rules Repository

**User Story:** As a store, I want a recurring rules repository that persists rule definitions with frequency-specific validation, so that Sprint 3's executor can run rules from a clean schema.

#### Acceptance Criteria

1. THE Recurring_Repo SHALL expose `create`, `update`, `remove`, `getById`, `listActive`, `listAll`, and `setLastRunDate` as `Promise`-returning functions.
2. WHEN `create(input)` is called with `frequency === "weekly"`, THE Recurring_Repo SHALL require `dayOfWeek` to be an integer in `[0, 6]`.
3. WHEN `create(input)` is called with `frequency === "monthly"`, THE Recurring_Repo SHALL require `dayOfMonth` to be an integer in `[1, 31]`.
4. IF `create` or `update` receives a `frequency`/`dayOfWeek`/`dayOfMonth` combination that violates Requirements 10.2 or 10.3, THEN THE Recurring_Repo SHALL throw `RepoError(INVALID_INPUT)` and SHALL NOT modify the `recurringRules` store.
5. WHEN `create(input)` is called without `input.active`, THE Recurring_Repo SHALL default `active` to `true`.

**Validates:** P12.

### Requirement 11: AI Usage Repository and Monthly ID Uniqueness

**User Story:** As a developer, I want AI usage tracked with `YYYY-MM` as the natural key, so that there is exactly one usage record per month.

#### Acceptance Criteria

1. THE AIUsage_Repo SHALL expose `get`, `incrementInput`, `incrementInsight`, and `reset` as `Promise`-returning functions.
2. WHEN `get(month)` is called and no record exists for `month`, THE AIUsage_Repo SHALL return `{ id: month, aiInputCount: 0, aiInsightCount: 0, updatedAt: <current ISO> }` without inserting a record.
3. WHEN `incrementInput(month, by?)` or `incrementInsight(month, by?)` is called, THE AIUsage_Repo SHALL upsert the record for `month` so that exactly one record with `id === month` exists in the `aiUsage` store afterward, with the corresponding count increased by `by` (default `1`).
4. AFTER any sequence of `N` `incrementInput(month)` calls for the same `month`, THE `aiUsage` store SHALL contain exactly one record with `id === month` and `aiInputCount === N`.
5. IF `get`, `incrementInput`, `incrementInsight`, or `reset` receives a `month` that does not match `^\d{4}-(0[1-9]|1[0-2])$`, THEN THE AIUsage_Repo SHALL throw `RepoError(INVALID_INPUT)` and SHALL NOT modify the `aiUsage` store.

**Validates:** P4.

### Requirement 12: Date Helpers

**User Story:** As a repository and calc author, I want pure date helpers that round-trip between `Date`, `YYYY-MM-DD`, and `YYYY-MM`, so that month derivation and date validation are consistent everywhere.

#### Acceptance Criteria

1. THE Date_Helpers SHALL expose `dateToYYYYMMDD(d)`, `dateToYYYYMM(dateOrYYYYMMDD)`, `parseMonth(month)`, `isValidYYYYMMDD(s)`, and `isValidYYYYMM(s)` as pure synchronous functions.
2. FOR ALL `Date` values `d`, `parseISO(dateToYYYYMMDD(d))` SHALL have the same year, month, and day-of-month as `d`.
3. FOR ALL strings `s` matching `YYYY-MM`, `dateToYYYYMM(parseMonth(s))` SHALL equal `s`.
4. WHEN `isValidYYYYMMDD(s)` is called with a string that does not match `^\d{4}-\d{2}-\d{2}$` or does not represent a real calendar date, THE Date_Helpers SHALL return `false`.
5. WHEN `isValidYYYYMM(s)` is called with a string that does not match `^\d{4}-(0[1-9]|1[0-2])$`, THE Date_Helpers SHALL return `false`.

**Validates:** P13.

### Requirement 13: Derived Calculation Helpers

**User Story:** As a store and a future report renderer, I want pure helpers that compute derived totals and usage from plain arrays, so that selectors stay deterministic and easy to test.

#### Acceptance Criteria

1. THE Calc_Helpers SHALL expose `getMonthlyTotal(transactions, month)`, `getTodayTotal(transactions, today)`, `getCategoryTotals(transactions)`, `getTopCategory(transactions)`, `getBudgetUsage(monthlyBudget, transactions)`, `getCategoryBudgetUsage(categoryBudget, transactions)`, and `getSavingGoalProgress(goal)` as pure synchronous functions with no IndexedDB or React imports.
2. FOR ALL `Transaction[]` arrays and any `YYYY-MM` `month`, `getMonthlyTotal(transactions, month)` SHALL equal the sum of `t.nominal` over all `t` whose `t.month === month`, and SHALL return `0` when no such transaction exists.
3. FOR ALL `Transaction[]` arrays, the sum of `getCategoryTotals(transactions)[c]` over every `CategoryType` `c` SHALL equal the sum of `t.nominal` over all `t` in the array.
4. FOR ALL `MonthlyBudget` `b` with `b.totalBudget > 0` and `Transaction[]` `transactions`, `getBudgetUsage(b, transactions)` SHALL return `{ used, remaining, percentage, isOver }` such that `used + remaining === b.totalBudget`, `percentage === used / b.totalBudget`, and `isOver` is `true` if and only if `used > b.totalBudget`.
5. FOR ALL `SavingGoal` `g` with `g.targetAmount > 0` and `g.currentAmount >= 0`, `getSavingGoalProgress(g)` SHALL return a number in `[0, 1]` equal to `min(1, g.currentAmount / g.targetAmount)`.
6. WHEN `getTopCategory(transactions)` is called on a non-empty array with at least one positive-`nominal` transaction, THE Calc_Helpers SHALL return `{ category, amount }` where `amount` equals the maximum value of `getCategoryTotals(transactions)` and `category` is the argmax (ties broken by ascending alphabetical category name).
7. WHEN `getTopCategory(transactions)` is called on an empty array, THE Calc_Helpers SHALL return `null`.

**Validates:** P7, P8, P10.

### Requirement 14: Repository Validation Rules

**User Story:** As a developer, I want a single source of truth for input validation rules, so that every repository rejects bad data before it reaches IndexedDB.

#### Acceptance Criteria

1. THE Repository layer SHALL reject any monetary field (`nominal`, `targetAmount`, `limit`, contribution `amount`, `totalBudget`) that is not a finite number greater than `0`.
2. THE Repository layer SHALL reject any `date` value that does not satisfy `isValidYYYYMMDD` and any `month` value that does not satisfy `isValidYYYYMM`.
3. THE Repository layer SHALL reject any string field among `detail`, `name`, and `title` whose `.trim()` length is `0`.
4. THE Repository layer SHALL reject any `account` or `category` value that is not a member of its declared union type.
5. WHEN a repository persists a string field, THE Repository SHALL apply `.trim()` to that field before writing.

**Validates:** P12.

### Requirement 15: Transaction Store

**User Story:** As a future UI sprint, I want a Zustand transaction store that caches per-month transactions and exposes selectors, so that components can render derived values without re-querying IndexedDB.

#### Acceptance Criteria

1. THE Transaction_Store SHALL hold the state shape `{ byId: Record<string, Transaction>, currentMonth: string, loaded: Record<string, boolean>, loading: boolean, error?: string }`.
2. THE Transaction_Store SHALL expose actions `setCurrentMonth`, `loadMonth`, `createTransaction`, `updateTransaction`, and `deleteTransaction`, each returning a `Promise`.
3. WHEN `loadMonth(month)` is called, THE Transaction_Store SHALL invoke `transactionRepo.listByMonth(month)`, merge the results into `byId`, and set `loaded[month]` to `true`.
4. WHEN `createTransaction(input)` resolves, THE Transaction_Store SHALL place the returned `Transaction` into `byId` keyed by `id` before returning.
5. THE Transaction_Store SHALL expose selectors `selectMonth`, `selectMonthlyTotal`, `selectTodayTotal`, `selectCategoryTotals`, and `selectTopCategory` that delegate to the corresponding Calc_Helpers and never call IndexedDB.

**Validates:** P1, P7, P10.

### Requirement 16: Budget Store

**User Story:** As a future UI sprint, I want a Zustand budget store that caches monthly and category budgets per month, so that the home dashboard and budget detail can render usage from in-memory state.

#### Acceptance Criteria

1. THE Budget_Store SHALL hold the state shape `{ monthlyBudgets: Record<string, MonthlyBudget>, categoryBudgets: Record<string, CategoryBudget[]>, loading: boolean, error?: string }`.
2. THE Budget_Store SHALL expose actions `loadMonth`, `setMonthlyBudget`, `setCategoryBudget`, and `removeCategoryBudget`, each returning a `Promise`.
3. WHEN `loadMonth(month)` is called, THE Budget_Store SHALL invoke `budgetRepo.getMonthlyBudget(month)` and `budgetRepo.listCategoryBudgets(month)` and place the results under the `month` key.
4. THE Budget_Store SHALL expose selectors `selectMonthlyBudget`, `selectCategoryBudgets`, `selectBudgetUsage`, and `selectCategoryBudgetUsage` that delegate to the corresponding Calc_Helpers.
5. WHEN `setMonthlyBudget` or `setCategoryBudget` resolves, THE Budget_Store SHALL update its in-memory cache for that `month` to reflect the upserted record.

**Validates:** P5, P8.

### Requirement 17: Saving Goal Store

**User Story:** As a future UI sprint, I want a Zustand saving goal store that mirrors `addContribution`'s atomic update, so that progress bars stay consistent with persisted data.

#### Acceptance Criteria

1. THE SavingGoal_Store SHALL hold the state shape `{ byId: Record<string, SavingGoal>, contributionsByGoal: Record<string, SavingGoalContribution[]>, loading: boolean, error?: string }`.
2. THE SavingGoal_Store SHALL expose actions `loadAll`, `createGoal`, `updateGoal`, `archiveGoal`, and `addContribution`, each returning a `Promise`.
3. WHEN `addContribution(goalId, amount, date, note?)` resolves, THE SavingGoal_Store SHALL update both `byId[goalId]` (with the new `currentAmount` and possibly `status === "completed"`) and `contributionsByGoal[goalId]` (appending the new contribution) from the same repo response.
4. IF `addContribution` rejects, THEN THE SavingGoal_Store SHALL leave `byId[goalId]` and `contributionsByGoal[goalId]` unchanged.
5. THE SavingGoal_Store SHALL expose selectors `selectActive`, `selectCompleted`, and `selectProgress(goalId)` where `selectProgress` delegates to `getSavingGoalProgress`.

**Validates:** P9, P11.

### Requirement 18: Settings Store

**User Story:** As an app boot sequence, I want a Zustand settings store that hydrates the singleton on startup, so that the theme and character can be applied before the first paint.

#### Acceptance Criteria

1. THE Settings_Store SHALL hold the state shape `{ settings: UserSettings | null, loading: boolean, error?: string }`.
2. THE Settings_Store SHALL expose actions `hydrate`, `update`, `setActiveTheme`, `setActiveCharacter`, and `setBackground`, each returning a `Promise`.
3. WHEN `hydrate()` is called, THE Settings_Store SHALL invoke `settingsRepo.get()` and place the result in `state.settings`.
4. WHEN `update(patch)` resolves, THE Settings_Store SHALL replace `state.settings` with the returned `UserSettings`.
5. AFTER any number of `update`, `setActiveTheme`, `setActiveCharacter`, or `setBackground` calls, `state.settings.id` SHALL equal `"main"` whenever `state.settings` is non-null.

**Validates:** P3.

### Requirement 19: UI Store

**User Story:** As a future UI sprint, I want a Zustand UI store that holds in-memory UI state without persistence, so that bottom sheets, toasts, and the selected month live outside of IndexedDB.

#### Acceptance Criteria

1. THE UI_Store SHALL hold the state shape `{ activeSheet, activeSheetPayload?, toast, selectedMonth }` where `activeSheet` is one of `"addTransaction" | "editTransaction" | "addBudget" | "createGoal" | "addContribution" | null`.
2. THE UI_Store SHALL expose actions `openSheet`, `closeSheet`, `showToast`, `dismissToast`, and `setSelectedMonth`, all of which are synchronous.
3. THE UI_Store SHALL NOT call any repository, IndexedDB, or `localStorage` API.
4. WHEN the application starts, THE UI_Store SHALL initialize `selectedMonth` to the current month in `YYYY-MM` form using the Date_Helpers.
5. WHEN `closeSheet()` is called, THE UI_Store SHALL set both `activeSheet` and `activeSheetPayload` to `null`/`undefined`.

**Validates:** (no correctness property — pure in-memory UI state, covered by example-based unit tests in tasks).

### Requirement 20: No-UI Boundary

**User Story:** As an architect, I want Sprint 2 to ship zero UI artifacts, so that subsequent sprints inherit a clean data layer without coupling to React components.

#### Acceptance Criteria

1. THE Repository layer (`src/db/`) SHALL NOT import any module from `react`, `react-dom`, `framer-motion`, or `src/components/`.
2. THE Calc_Helpers (`src/lib/calc/`) and Date_Helpers (`src/lib/date.ts`) SHALL NOT import any module from `react`, `react-dom`, `idb`, or `src/db/`.
3. THE Zustand stores (`src/stores/`) SHALL NOT import any module from `idb` directly; stores SHALL only reach IndexedDB through repositories.
4. THE Sprint 2 deliverable SHALL NOT add files under `src/pages/`, `src/components/`, or `src/features/*/components/` except files re-exporting types.
5. WHERE a file under `src/db/`, `src/stores/`, `src/lib/calc/`, or `src/lib/date.ts` imports from another layer, THE import graph SHALL form a strict topological order: `lib` → (none); `db` → `lib`, `types`; `stores` → `db`, `lib`, `types`.

**Validates:** (architectural rule — verified by example-based import-lint test in tasks).

### Requirement 21: Persistence Across Reload

**User Story:** As a user, I want my data to survive a page refresh, so that I never lose what I just wrote.

#### Acceptance Criteria

1. WHEN a record is written via any repository, THEN closed by `__resetDBSingleton()`, THEN read back via the same repository, THE returned record SHALL deep-equal the originally returned record (excluding any non-stored derived fields).
2. WHEN multiple records are written across the ten object stores and the database is reopened via `__resetDBSingleton()` followed by `getDB()`, THE Repository layer SHALL be able to list every previously written record without loss.
3. THE Sprint 2 test suite SHALL include at least one property-based test per repository that exercises the write-then-reopen-then-read cycle.

**Validates:** P1, P2.
