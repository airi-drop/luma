# Implementation Plan: Sprint 3 — Manual Transaction Flow

## Overview

This plan implements Luma's primary manual transaction entry flow. The ordering starts with pure utility helpers, builds up through FSM and validators, layers in form components, composes them into the full form and sheet, wires the FAB, then delivers the recurring executor and boot runner. Property-based tests (P1–P8) and integration tests validate correctness throughout.

## Tasks

- [ ] 1. Implement `formatIDR` / `parseIDR` helpers
  - [ ] 1.1 Create `src/lib/format.ts` with `formatIDR`, `parseIDR`, and `formatThousands`
    - Implement `formatIDR(amount: number): string` using `Math.trunc`, thousands-dot grouping, `"Rp"` prefix, negative handling
    - Implement `parseIDR(input: string): number` that strips `Rp`/`rp`, whitespace, dots, returns integer or `NaN`
    - Implement `formatThousands(amount: number | string): string` for digit-only dot grouping
    - Export all three functions
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [ ]* 1.2 Write property test for `formatIDR` output shape (Property 6)
    - **Property 6: `formatIDR` produces only allowed characters**
    - For all integers n, `formatIDR(n)` matches `/^-?Rp\d{1,3}(\.\d{3})*$/`
    - Assert `formatIDR(0) === "Rp0"`, positive integers grouped with `"."`, negatives prefixed `"-Rp"`
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

  - [ ]* 1.3 Write property test for `formatIDR`/`parseIDR` round-trip (Property 5)
    - **Property 5: `formatIDR` is round-trippable**
    - For all non-negative integers `n` in `[0, 999_999_999_999]`, `parseIDR(formatIDR(n)) === n`
    - Test tolerated decorations: `"Rp1.500"`, `"rp 1.500"`, `"1.500"`, `"1500"`, `" 1500 "` all parse correctly
    - Assert `parseIDR` returns `NaN` for inputs with no digits after stripping
    - **Validates: Requirements 8.5, 8.6, 8.7**

- [ ] 2. Implement Form FSM (pure)
  - [ ] 2.1 Create `src/features/transactions/form-machine.ts` with types and transition function
    - Define `FormState = "idle" | "dirty" | "submitting" | "success" | "error"`
    - Define `FormEvent` union type with `FIELD_CHANGE`, `SUBMIT`, `SUBMIT_OK`, `SUBMIT_FAILED`, `RESET`
    - Define `FormContext` interface with `values`, `errors`, `lastError`
    - Implement pure `transition(state: FormState, event: FormEvent): FormState` matching the transition table
    - Export types and `transition` function
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11_

  - [ ]* 2.2 Write property test for Form FSM (Property 7)
    - **Property 7: Form FSM never reaches `success` without a successful write**
    - Generate arbitrary sequences of `FormEvent`s, fold through `transition` from `idle`
    - Assert: if state === `"success"`, previous state was `"submitting"` and event was `SUBMIT_OK`
    - Assert: `RESET` from any state returns to `idle`
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11**

- [ ] 3. Implement field validators
  - [ ] 3.1 Create `src/features/transactions/validation.ts` with all field validators and `validateForm`
    - Implement `validateNominal(raw: string): string | undefined` — strip non-digits, parse int, check > 0 and ≤ 999_999_999_999
    - Implement `validateDetail(value: string): string | undefined` — trim, check length > 0 and ≤ 120
    - Implement `validateCategory(value: CategoryType | null): string | undefined` — check enum membership
    - Implement `validateAccount(value: AccountType | null): string | undefined` — check enum membership
    - Implement `validateDate(value: string, today: string): string | undefined` — regex, real calendar date, not future
    - Implement `validateMood(value: MoodType | null): string | undefined` — optional, check enum if set
    - Implement `validateNote(value: string): string | undefined` — optional, check trim length ≤ 280 if non-empty
    - Implement `validateForm(values: ManualFormValues, today: string): ValidationResult`
    - All error strings in soft Indonesian per design
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12, 4.13, 10.1_

  - [ ]* 3.2 Write property test for validation (Property 1)
    - **Property 1: Validation rejects bad input**
    - Generate arbitrary `ManualFormValues` and `today` strings
    - Assert: if `validateForm(v, today).valid === true`, then `input.nominal > 0`, `Number.isInteger(input.nominal)`, `input.detail.trim().length > 0`, category ∈ `CategoryType`, account ∈ `AccountType`, date matches regex, `input.source === "manual"`
    - Assert: when any field validator returns a defined error, `validateForm` surfaces it in the errors map
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12, 4.13**

  - [ ]* 3.3 Write unit tests for soft copy tone (Property 8)
    - **Property 8: Soft copy tone check on error messages**
    - Assert all error strings in `validation.ts` are in casual Indonesian, contain no all-caps words, no stacked exclamation marks, no scolding language
    - Assert submit failure message equals `"Gagal nyimpen, coba sekali lagi ya."`
    - Assert success toast message equals `"Tercatat ya ✨"`
    - **Validates: Requirements 10.1, 10.2, 10.3**

- [ ] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement form field components
  - [ ] 5.1 Create `src/components/forms/NominalField.tsx`
    - Render `Input` with left adornment `"Rp"`, `inputMode="numeric"`, `type="tel"`
    - On change: strip non-digits, store raw digits, display with `formatThousands` separators
    - Show helper text `"Cuma angka, tanpa koma."` when no error
    - Accept `value`, `onChange`, `error`, `autoFocus` props
    - _Requirements: 3.2, 3.3_

  - [ ] 5.2 Create `src/components/forms/CategoryChipSelector.tsx`
    - Render chip for each `CategoryType` value (8 chips) with Indonesian labels
    - Chip styling: 36px height, radius 999px, padding 8×14, active state with accent colors
    - Multi-row wrap layout with gap 8px
    - `role="radiogroup"` with `role="radio"` and `aria-checked` on each chip
    - Accept `value`, `onChange`, `error` props
    - _Requirements: 3.4_

  - [ ] 5.3 Create `src/components/forms/AccountChipSelector.tsx`
    - Same structure as `CategoryChipSelector` but for `AccountType` (6 values)
    - Labels are values themselves except `Other → "Lainnya"`
    - `role="radiogroup"` with `role="radio"` and `aria-checked`
    - Accept `value`, `onChange`, `error` props
    - _Requirements: 3.5_

  - [ ] 5.4 Create `src/components/forms/MoodSelector.tsx`
    - Render 5 emoji chips `😊 😐 😬 😭 🤩` in horizontal layout
    - Circular 44×44px tap targets, active ring 2px accent-primary, scale 1.05
    - Tapping active chip toggles it off (mood is optional, pass `null`)
    - Label: `"Mood (opsional)"`
    - `role="radiogroup"` with `role="radio"` and `aria-checked`, allow empty selection
    - Accept `value`, `onChange`, `error` props
    - _Requirements: 3.6, 3.7_

- [ ] 6. Implement ManualTransactionForm
  - [ ] 6.1 Create `src/components/forms/ManualTransactionForm.tsx`
    - Compose all field components in order: NominalField, Detail Input, CategoryChipSelector, AccountChipSelector, Date Input, MoodSelector, Note Input, Submit Button
    - Wire FSM via `useReducer` with `transition` function, initial state `idle`
    - Implement field-level validation on blur (after first interaction)
    - Implement full-form validation on submit via `validateForm`
    - On valid submit: call `transactionStore.createTransaction`, dispatch `SUBMIT_OK`, show toast `"Tercatat ya ✨"`, close sheet
    - On submit failure: set `lastError`, dispatch `SUBMIT_FAILED`, preserve field values
    - Disable fields and show loading on submit button while in `submitting` state
    - Date field defaults to `today()` when no `defaults.date` provided
    - Note field labeled `"Catatan kecil (opsional)"`
    - Submit button labeled `"Simpan Transaksi"`
    - Accept `defaults`, `onSuccess`, `onCancel` props
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 4.1, 5.12, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 9.1, 9.5_

  - [ ]* 6.2 Write property test for valid form submission (Property 2)
    - **Property 2: Valid input always saves**
    - Generate arbitrary valid `ManualFormValues` (that pass `validateForm`)
    - Assert: `submitManualForm` against a fresh store results in exactly one new `Transaction` with `source === "manual"` and matching field values
    - Assert: toast `"Tercatat ya ✨"` queued, sheet closed
    - Assert: when `createTransaction` rejects, no transaction persisted, no toast, sheet stays open, values preserved
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 9.5**

- [ ] 7. Implement AddTransactionSheet with tabs
  - [ ] 7.1 Create `src/components/sheets/AddTransactionSheet.tsx`
    - Wrap Sprint 1's `BottomSheet` with `open` bound to `uiStore.activeSheet === "addTransaction"`
    - Internal state: `tab: "manual" | "ai"` defaulting to `"manual"`
    - Render tab switcher with two tabs: Manual (default active) and AI
    - When Manual tab active: render `<ManualTransactionForm />`
    - When AI tab active: render `<AIQuickInputPlaceholder />`
    - Tab accessibility: `role="tablist"`, `role="tab"` with `aria-selected`, tab panels with `role="tabpanel"` and `aria-labelledby`
    - _Requirements: 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.7_

- [ ] 8. Implement AIQuickInputPlaceholder
  - [ ] 8.1 Create `src/components/forms/AIQuickInputPlaceholder.tsx`
    - Render `Card variant="soft"` with title `"Pakai AI Cepat ✨"`
    - Body copy: `"Fitur AI lagi dipersiapin. Pakai manual dulu ya 💛"`
    - Disabled `Button variant="primary"` labeled `"Segera hadir"`
    - No network requests, no Gemini calls
    - _Requirements: 2.5, 2.6, 9.2_

- [ ] 9. Wire FAB on HomePage
  - [ ] 9.1 Modify `src/pages/HomePage.tsx` to add the FAB and mount `AddTransactionSheet`
    - Add FAB button with `variant="fab"`, `aria-label="Tambah transaksi"`, positioned fixed bottom-center above nav
    - FAB `onClick` calls `uiStore.openSheet("addTransaction")`
    - Mount `<AddTransactionSheet />` in the page (controlled by `uiStore`)
    - _Requirements: 1.1, 1.2_

- [ ] 10. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement recurring executor and `computeDueDates`
  - [ ] 11.1 Create `src/features/transactions/recurring-executor.ts`
    - Implement `computeDueDates(rule, lastRun, today): string[]` — iterate cursor from `lastRun+1` to `today`, emit dates matching rule frequency/schedule
    - Handle monthly day-of-month clamping (e.g., dayOfMonth=31 in Feb → last day of month)
    - Handle `lastRunDate = null` bootstrap from `rule.createdAt` date portion
    - Implement `executeDueRecurringRules(deps?: RecurringExecutorDeps): Promise<RecurringExecutorResult>`
    - Load active rules via `recurringRepo.listActive()`, ignore inactive
    - For each rule: compute due dates, check for existing transactions before inserting (duplicate guard)
    - Insert transactions with `source: "recurring"`, `recurringRuleId: rule.id`
    - On success: call `recurringRepo.setLastRunDate(rule.id, today)`
    - On per-rule error: record in `errors[]`, do NOT advance `lastRunDate`, continue processing
    - Return `{ rulesProcessed, transactionsGenerated, errors }`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 9.3_

  - [ ]* 11.2 Write property test for recurring executor idempotency (Property 3)
    - **Property 3: Recurring executor is idempotent**
    - Generate arbitrary recurring rules and pre-existing transaction state
    - Run `executeDueRecurringRules` twice with same `today`
    - Assert: second run generates 0 new transactions
    - Assert: final DB state identical after first and second run
    - Assert: no duplicate `(recurringRuleId, date)` pairs exist
    - **Validates: Requirements 7.5, 7.6, 7.9**

  - [ ]* 11.3 Write property test for recurring executor completeness (Property 4)
    - **Property 4: Recurring executor materializes every due date exactly once**
    - Generate an active rule with known `lastRunDate` and `today`
    - Run executor, then verify: for every date D in `(lastRunDate, today]` matching schedule, exactly one transaction exists with matching `recurringRuleId` and `date`
    - Assert: inactive rules produce no transactions
    - Assert: monthly rules with `dayOfMonth` > month length materialize on last day
    - Assert: after successful processing, `rule.lastRunDate === today`
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.7, 7.8, 7.10**

- [ ] 12. Implement boot runner
  - [ ] 12.1 Create `src/lib/boot.ts` with `runBootTasks`
    - Hydrate settings via `settingsStore.getState().hydrate()`
    - Set current month via `transactionStore.getState().setCurrentMonth(month)`
    - Call `executeDueRecurringRules()` wrapped in try/catch (soft fail)
    - Re-hydrate current month so newly-generated transactions are visible
    - No network calls
    - _Requirements: 7.1, 9.4_

- [ ] 13. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Integration tests
  - [ ]* 14.1 Write integration test for full manual transaction flow
    - Render `AddTransactionSheet` inside test harness with `@testing-library/react` and fake-indexeddb
    - Drive: open sheet → verify Manual tab active → fill nominal, detail, category, account → submit
    - Assert: IDB row exists with correct values and `source: "manual"`
    - Assert: toast `"Tercatat ya ✨"` shown
    - Assert: sheet closes
    - _Requirements: 1.5, 2.2, 2.3, 6.1, 6.2, 6.3, 6.4, 9.5_

  - [ ]* 14.2 Write integration test for recurring executor end-to-end
    - Seed active recurring rules + existing transactions in fake-indexeddb
    - Call `executeDueRecurringRules` with a controlled `today`
    - Assert: expected transactions materialized with correct dates and `source: "recurring"`
    - Run executor again with same `today` — assert no new transactions created (idempotency)
    - _Requirements: 7.3, 7.5, 7.6_

  - [ ]* 14.3 Write integration test for validation error display
    - Render `ManualTransactionForm`, submit without filling required fields
    - Assert: soft Indonesian error messages appear under each invalid field
    - Assert: no IDB write occurs
    - Assert: form values preserved after error
    - _Requirements: 4.1, 4.2, 6.5, 6.6, 10.1_

- [ ] 15. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests (P1–P8) validate universal correctness properties from the design
- Unit tests validate specific examples and edge cases
- All code is TypeScript; all components use React with Zustand stores
- No network calls anywhere in this sprint — fully offline
- Sprint 2 infrastructure (repos, stores, domain types) is assumed to be in place

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "2.2", "3.1"] },
    { "id": 2, "tasks": ["3.2", "3.3", "5.1", "5.2", "5.3", "5.4"] },
    { "id": 3, "tasks": ["6.1", "8.1"] },
    { "id": 4, "tasks": ["6.2", "7.1"] },
    { "id": 5, "tasks": ["9.1", "11.1"] },
    { "id": 6, "tasks": ["11.2", "11.3", "12.1"] },
    { "id": 7, "tasks": ["14.1", "14.2", "14.3"] }
  ]
}
```
