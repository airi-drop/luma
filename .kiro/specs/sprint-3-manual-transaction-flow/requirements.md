# Requirements Document

## Introduction

Sprint 3 delivers Luma's primary user flow: manual transaction entry. Per `BUILD_PLAN §10` and `PRD §9.1`, manual entry is the default and primary path; AI entry is a secondary shortcut deferred to Sprint 10. This sprint introduces the `AddTransactionSheet` (with a Manual tab as default and a disabled AI placeholder tab), the `ManualTransactionForm` (a finite state machine with field-level and form-level validation in soft Indonesian copy), the wiring of the FAB on the Home page to open the sheet, the `formatIDR` / `parseIDR` helpers used to display and parse Indonesian Rupiah, and the recurring rule executor that runs on app boot to materialize due transactions idempotently. All behavior is fully offline; no network calls are made on the manual path.

## Glossary

- **AddTransactionSheet**: The bottom sheet hosted on the Home page that contains the Manual tab (default) and a disabled AI placeholder tab.
- **ManualTransactionForm**: The form component that collects nominal, detail, kategori, akun, tanggal, mood, and note, validates them, and persists a `Transaction`.
- **AIQuickInputPlaceholder**: The disabled card rendered in the AI tab body during Sprint 3, with copy explaining the feature is not yet available.
- **FAB**: The floating action button on the Home page that opens the `AddTransactionSheet` via `uiStore.openSheet("addTransaction")`.
- **Form_FSM**: The finite state machine governing the `ManualTransactionForm` with states `idle`, `dirty`, `submitting`, `success`, and `error` and events `FIELD_CHANGE`, `SUBMIT`, `SUBMIT_OK`, `SUBMIT_FAILED`, `RESET`.
- **Validator**: A pure function in `src/features/transactions/validation.ts` that maps a single field value (and optionally `today`) to either `undefined` (valid) or a soft Indonesian error string.
- **Form_Validator**: The `validateForm(values, today)` function that runs every field validator, collects errors, and on success returns a fully-shaped `CreateTransactionInput`.
- **CreateTransactionInput**: The input shape accepted by `transactionRepo.create`, defined in Sprint 2.
- **Transaction**: The persisted domain object for a single transaction, defined in Sprint 2.
- **RecurringRule**: The persisted domain object for a recurring transaction rule, defined in Sprint 2, with fields including `frequency`, `dayOfWeek`, `dayOfMonth`, `lastRunDate`, and `active`.
- **RecurringExecutor**: The `executeDueRecurringRules` function in `src/features/transactions/recurring-executor.ts` that materializes due recurring transactions on app boot.
- **BootRunner**: The `runBootTasks` function in `src/lib/boot.ts` invoked once when the app mounts; hydrates settings, sets the current month, and calls the `RecurringExecutor`.
- **IDR_Formatter**: The `formatIDR(amount)` function in `src/lib/format.ts` that renders an integer as `"Rp1.500"`-style Indonesian Rupiah.
- **IDR_Parser**: The `parseIDR(input)` function in `src/lib/format.ts` that parses an Indonesian Rupiah string back to a number, returning `NaN` for non-parseable input.
- **today()**: The local-time helper that returns the current date as `YYYY-MM-DD`.
- **Soft copy**: Casual, supportive Indonesian error copy per `DESIGN_SYSTEM §18` and `TECHNICAL_ARCHITECTURE §14`.
- **MoodType**: The enum of five mood values rendered as `😊 😐 😬 😭 🤩`, defined in Sprint 2.
- **CategoryType**: The enum of eight category values (Food, Transport, Entertainment, Shopping, Health, Giving, Saving, Other), defined in Sprint 2.
- **AccountType**: The enum of six account values (Cash, E-wallet, BNI, BCA, Mandiri, Other), defined in Sprint 2.

## Requirements

### Requirement 1: Open the Add Transaction Sheet from the Home FAB

**User Story:** As a user, I want to open the add-transaction sheet by tapping the FAB on the Home page, so that I can quickly start logging a new transaction.

#### Acceptance Criteria

1. WHEN the Home page mounts, THE Home page SHALL render a FAB labeled for adding a transaction.
2. WHEN the user taps the FAB, THE FAB SHALL invoke `uiStore.openSheet("addTransaction")`.
3. WHILE `uiStore.activeSheet` equals `"addTransaction"`, THE AddTransactionSheet SHALL be mounted and visible.
4. WHILE `uiStore.activeSheet` does not equal `"addTransaction"`, THE AddTransactionSheet SHALL be unmounted or hidden.
5. WHEN the AddTransactionSheet is mounted, THE AddTransactionSheet SHALL render with the Manual tab selected as the default active tab.

### Requirement 2: Render the Manual and AI Tabs Inside the Sheet

**User Story:** As a user, I want a Manual tab as the default entry path and an AI tab visibly present but marked as coming soon, so that I understand the manual flow is primary and the AI flow is planned.

#### Acceptance Criteria

1. THE AddTransactionSheet SHALL render exactly two tabs labeled for the Manual and AI entry paths.
2. WHEN the AddTransactionSheet first mounts, THE AddTransactionSheet SHALL set the active tab to the Manual tab.
3. WHEN the user activates the Manual tab, THE AddTransactionSheet SHALL render the ManualTransactionForm in the tab body.
4. WHEN the user activates the AI tab, THE AddTransactionSheet SHALL render the AIQuickInputPlaceholder in the tab body.
5. THE AIQuickInputPlaceholder SHALL render a disabled primary call-to-action and SHALL NOT initiate any network requests.
6. THE AIQuickInputPlaceholder SHALL display the soft Indonesian copy `"Fitur AI lagi dipersiapin. Pakai manual dulu ya 💛"`.
7. THE AddTransactionSheet SHALL expose tab roles such that the tab list uses `role="tablist"`, each tab uses `role="tab"` with `aria-selected`, and each tab body uses `role="tabpanel"` with `aria-labelledby` referencing its tab.

### Requirement 3: Manual Transaction Form Field Composition

**User Story:** As a user, I want a single form that collects nominal, detail, kategori, akun, tanggal, mood, and an optional note, so that I can record a transaction with the data Luma needs.

#### Acceptance Criteria

1. THE ManualTransactionForm SHALL render the fields in the following order: Nominal, Detail, Kategori, Akun, Tanggal, Mood, Note, Submit.
2. THE ManualTransactionForm SHALL render the Nominal field with a left adornment of the literal text `"Rp"` and with `inputMode="numeric"`.
3. WHEN the user types in the Nominal field, THE ManualTransactionForm SHALL strip every non-digit character before storing the raw value and SHALL display the digits formatted with `"."` as the thousands separator.
4. THE ManualTransactionForm SHALL render the CategoryChipSelector with one chip for each value in `CategoryType`.
5. THE ManualTransactionForm SHALL render the AccountChipSelector with one chip for each value in `AccountType`.
6. THE ManualTransactionForm SHALL render the MoodSelector with exactly five chips corresponding to the values in `MoodType` in the order `😊 😐 😬 😭 🤩`.
7. WHEN the user taps the currently selected mood chip, THE MoodSelector SHALL clear the mood selection by setting the value to `null`.
8. WHEN the ManualTransactionForm first mounts and no `defaults.date` is provided, THE ManualTransactionForm SHALL set the Tanggal field value to the result of `today()`.
9. THE ManualTransactionForm SHALL render the Note field as optional and SHALL label it `"Catatan kecil (opsional)"`.
10. THE ManualTransactionForm SHALL render the submit button with the label `"Simpan Transaksi"`.

### Requirement 4: Manual Transaction Form Field Validation

**User Story:** As a user, I want each field validated with soft Indonesian copy, so that I get supportive guidance when something is missing or wrong.

#### Acceptance Criteria

1. WHEN the user blurs a field after first interaction, THE ManualTransactionForm SHALL run that field's Validator and display the returned soft Indonesian error string under the field if the result is defined.
2. WHEN the user submits the form, THE Form_Validator SHALL run every field Validator and aggregate the errors before any persistence is attempted.
3. IF the parsed Nominal value is not an integer strictly greater than zero, THEN THE Validator SHALL return the soft Indonesian error `"Nominalnya belum diisi nih."`.
4. IF the parsed Nominal value is greater than `999_999_999_999`, THEN THE Validator SHALL return the soft Indonesian error `"Nominalnya kebesaran. Coba kurangin."`.
5. IF the trimmed Detail value has length zero, THEN THE Validator SHALL return the soft Indonesian error `"Detail transaksi belum diisi."`.
6. IF the trimmed Detail value has length greater than 120, THEN THE Validator SHALL return the soft Indonesian error `"Detail kepanjangan, ringkas dikit ya."`.
7. IF the Category value is not one of the values in `CategoryType`, THEN THE Validator SHALL return the soft Indonesian error `"Pilih kategorinya dulu ya."`.
8. IF the Account value is not one of the values in `AccountType`, THEN THE Validator SHALL return the soft Indonesian error `"Pilih akun yang dipakai."`.
9. IF the Date value does not match `^\d{4}-\d{2}-\d{2}$` or is not a real calendar date, THEN THE Validator SHALL return the soft Indonesian error `"Tanggalnya kayanya salah."`.
10. IF the Date value is strictly greater than `today()`, THEN THE Validator SHALL return the soft Indonesian error `"Tanggalnya belum sampe sana, ganti ya."`.
11. WHERE the Mood value is non-null, IF the Mood value is not one of the values in `MoodType`, THEN THE Validator SHALL return the soft Indonesian error `"Mood-nya nggak dikenal."`.
12. WHERE the Note value is non-empty, IF the trimmed Note value has length greater than 280, THEN THE Validator SHALL return the soft Indonesian error `"Catatannya kepanjangan."`.
13. WHEN the Form_Validator returns `valid: true`, THE Form_Validator SHALL return a `CreateTransactionInput` with `source` equal to `"manual"`, with the parsed integer Nominal, with trimmed Detail, with Note set to `undefined` if the trimmed Note is empty, and with Mood set to `undefined` if the Mood value is `null`.

### Requirement 5: Manual Transaction Form Finite State Machine

**User Story:** As a developer, I want the form to behave according to a single deterministic state machine, so that submit, error, and success states are predictable and testable.

#### Acceptance Criteria

1. WHEN the ManualTransactionForm mounts, THE Form_FSM SHALL initialize the state to `idle`.
2. WHEN the Form_FSM is in state `idle` and a `FIELD_CHANGE` event is dispatched, THE Form_FSM SHALL transition to state `dirty`.
3. WHEN the Form_FSM is in state `idle` and a `SUBMIT` event is dispatched, THE Form_FSM SHALL transition to state `error`.
4. WHEN the Form_FSM is in state `dirty` and a `FIELD_CHANGE` event is dispatched, THE Form_FSM SHALL remain in state `dirty`.
5. WHEN the Form_FSM is in state `dirty` and a `SUBMIT` event is dispatched, THE Form_FSM SHALL transition to state `submitting`.
6. WHEN the Form_FSM is in state `submitting` and a `SUBMIT_OK` event is dispatched, THE Form_FSM SHALL transition to state `success`.
7. WHEN the Form_FSM is in state `submitting` and a `SUBMIT_FAILED` event is dispatched, THE Form_FSM SHALL transition to state `error`.
8. WHEN the Form_FSM is in state `error` and a `FIELD_CHANGE` event is dispatched, THE Form_FSM SHALL transition to state `dirty`.
9. WHEN the Form_FSM is in state `error` and a `SUBMIT` event is dispatched, THE Form_FSM SHALL transition to state `submitting`.
10. WHEN any state receives a `RESET` event, THE Form_FSM SHALL transition to state `idle`.
11. THE Form_FSM SHALL only enter state `success` via a transition from state `submitting` triggered by a `SUBMIT_OK` event.
12. WHILE the Form_FSM is in state `submitting`, THE ManualTransactionForm SHALL render the submit button in a loading state and SHALL disable all input fields.

### Requirement 6: Save Flow with Toast and Sheet Close

**User Story:** As a user, I want a confirmation toast and the sheet to close automatically when my transaction is saved, so that I know the entry was recorded and I can return to Home.

#### Acceptance Criteria

1. WHEN the user submits the ManualTransactionForm and the Form_Validator returns `valid: true`, THE ManualTransactionForm SHALL invoke `transactionStore.createTransaction` with the produced `CreateTransactionInput`.
2. WHEN `transactionStore.createTransaction` resolves successfully, THE ManualTransactionForm SHALL invoke `uiStore.showToast` with the message `"Tercatat ya ✨"` and the variant `"success"`.
3. WHEN `transactionStore.createTransaction` resolves successfully, THE ManualTransactionForm SHALL invoke `uiStore.closeSheet`.
4. WHEN `transactionStore.createTransaction` resolves successfully, THE ManualTransactionForm SHALL dispatch a `SUBMIT_OK` event to the Form_FSM.
5. IF `transactionStore.createTransaction` rejects, THEN THE ManualTransactionForm SHALL set the form's `lastError` to `"Gagal nyimpen, coba sekali lagi ya."`, SHALL dispatch a `SUBMIT_FAILED` event to the Form_FSM, SHALL NOT show the success toast, and SHALL NOT close the sheet.
6. IF `transactionStore.createTransaction` rejects, THEN THE ManualTransactionForm SHALL preserve the current field values so the user can retry without re-entering data.

### Requirement 7: Recurring Rule Executor on App Boot

**User Story:** As a user with active recurring rules, I want my recurring transactions to be created automatically when I open the app, so that my budget reflects regular expenses without manual entry.

#### Acceptance Criteria

1. WHEN the app mounts, THE BootRunner SHALL invoke the RecurringExecutor exactly once after settings hydration and current-month setup.
2. WHEN the RecurringExecutor runs, THE RecurringExecutor SHALL load every active rule from `recurringRepo.listActive()` and SHALL ignore inactive rules.
3. WHEN processing an active rule with `lastRunDate = L` and current `today = T`, THE RecurringExecutor SHALL materialize, for every date `D` in the half-open interval `(L, T]` that satisfies the rule's schedule predicate, exactly one transaction with `recurringRuleId` equal to the rule's id, `date` equal to `D`, and `source` equal to `"recurring"`.
4. WHERE a recurring rule's `lastRunDate` is null, THE RecurringExecutor SHALL bootstrap `lastRunDate` from the date portion of the rule's `createdAt` for the purpose of computing due dates.
5. WHEN `executeDueRecurringRules` is invoked twice in sequence with the same `today` value, THE second invocation SHALL produce zero new transactions and SHALL leave the IndexedDB transactions store in the same state as after the first invocation.
6. THE RecurringExecutor SHALL ensure that no two transactions exist with the same `(recurringRuleId, date)` pair where `source` equals `"recurring"`.
7. WHEN a recurring rule has `frequency = "monthly"` and `dayOfMonth` greater than the number of days in the current month, THE RecurringExecutor SHALL materialize the transaction on the last day of that month.
8. WHEN processing an active rule completes successfully, THE RecurringExecutor SHALL invoke `recurringRepo.setLastRunDate(rule.id, today)`.
9. IF processing one rule throws an error, THEN THE RecurringExecutor SHALL record the error in the result's `errors` list, SHALL NOT advance `lastRunDate` for that rule, and SHALL continue processing the remaining rules.
10. WHEN the RecurringExecutor returns, THE RecurringExecutor SHALL return an object with fields `rulesProcessed`, `transactionsGenerated`, and `errors`.

### Requirement 8: Indonesian Rupiah Formatter and Parser

**User Story:** As a user, I want amounts displayed and parsed as Indonesian Rupiah consistently, so that the numbers I see match the numbers I type.

#### Acceptance Criteria

1. THE IDR_Formatter SHALL produce a string matching the regex `/^-?Rp\d{1,3}(\.\d{3})*$/` for every finite integer input.
2. WHEN the input to the IDR_Formatter is `0`, THE IDR_Formatter SHALL return the string `"Rp0"`.
3. WHEN the input to the IDR_Formatter is a positive integer, THE IDR_Formatter SHALL render the digits with `"."` separating each group of three digits from the right and SHALL prefix the result with `"Rp"`.
4. WHEN the input to the IDR_Formatter is a negative integer, THE IDR_Formatter SHALL prefix the result with `"-"` before the `"Rp"`.
5. THE IDR_Parser SHALL accept inputs of the forms `"Rp1.500"`, `"rp 1.500"`, `"1.500"`, `"1500"`, and `" 1500 "` and SHALL return the integer `1500` for each.
6. WHEN the IDR_Parser receives an input that does not contain at least one digit after stripping `"Rp"`, whitespace, and separators, THE IDR_Parser SHALL return `NaN`.
7. FOR ALL non-negative integers `n` in the closed range `[0, 999_999_999_999]`, `IDR_Parser(IDR_Formatter(n))` SHALL equal `n`.

### Requirement 9: No Network Calls on the Manual Path

**User Story:** As a user without connectivity, I want manual transaction entry to work fully offline, so that I can still record expenses anywhere.

#### Acceptance Criteria

1. THE ManualTransactionForm SHALL NOT initiate any HTTP, WebSocket, or other network request during field interaction, validation, or submission.
2. THE AIQuickInputPlaceholder SHALL NOT initiate any HTTP, WebSocket, or other network request.
3. THE RecurringExecutor SHALL NOT initiate any HTTP, WebSocket, or other network request.
4. THE BootRunner SHALL NOT initiate any HTTP, WebSocket, or other network request.
5. WHILE the device is offline, THE ManualTransactionForm SHALL accept input, run validation, persist to IndexedDB, show the success toast, and close the sheet identically to its online behavior.

### Requirement 10: Soft Copy Tone Compliance

**User Story:** As a user, I want every error message to feel calm and supportive, so that the app does not scold me when I make a mistake.

#### Acceptance Criteria

1. THE Validator error strings SHALL be written in casual Indonesian and SHALL avoid uppercase shouting, exclamation stacking, and judgmental language per `DESIGN_SYSTEM §18`.
2. THE ManualTransactionForm submit failure message SHALL be `"Gagal nyimpen, coba sekali lagi ya."`.
3. THE ManualTransactionForm success toast message SHALL be `"Tercatat ya ✨"`.
