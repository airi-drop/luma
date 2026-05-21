# Implementation Plan: Sprint 6 — Transactions Page

## Overview

Implement the Transactions Page (`/transactions`) composing month navigation, search, category/account filters, sort, transaction list, edit sheet, and delete dialog. All operations are client-side over IndexedDB data. Implementation follows a bottom-up approach: pure functions first, then hooks, then UI components, then page composition.

## Tasks

- [ ] 1. Implement Filter Engine (pure functions)
  - [ ] 1.1 Create `src/features/transactions/types.ts` with `SortMode`, `TransactionFilters`, and `UpdateTransactionInput` types
    - Define `SortMode` union type: "latest" | "oldest" | "highest" | "lowest"
    - Define `TransactionFilters` interface with searchQuery, selectedCategories, selectedAccounts, sortMode
    - Define `UpdateTransactionInput` interface for partial transaction updates
    - _Requirements: 7.1_

  - [ ] 1.2 Implement `searchTransactions()` in `src/features/transactions/filterEngine.ts`
    - If query is empty, return all transactions unchanged
    - Filter by case-insensitive substring match on `detail` field
    - Preserve original relative order of matching transactions
    - Do not mutate the input array
    - _Requirements: 3.2, 3.3_

  - [ ] 1.3 Implement `sortTransactions()` in `src/features/transactions/filterEngine.ts`
    - "latest": descending `createdAt`; "oldest": ascending `createdAt`
    - "highest": descending `nominal`; "lowest": ascending `nominal`
    - Return a new sorted array without mutating input
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ] 1.4 Implement `applyFilters()` in `src/features/transactions/filterEngine.ts`
    - Apply search filter, then category filter (OR within), then account filter (OR within), then sort
    - Empty selectedCategories/selectedAccounts means "show all" (no filter)
    - AND logic between filter types; result is always a subset of input
    - Do not mutate the original transactions array
    - _Requirements: 3.2, 3.3, 4.1, 4.2, 5.1, 5.2, 6.1, 6.2, 6.3_

  - [ ]* 1.5 Write property tests for filter engine (P1, P2, P3, P4, P5, P6, P7, P10)
    - **Property 1: Filter subset guarantee** — `applyFilters(txs, filters).length ≤ txs.length`
    - **Property 2: Empty filter identity** — all-empty filters produce a permutation of input
    - **Property 3: Sort ordering correctness** — sorted result respects ordering for all sort modes
    - **Property 4: Sort preserves elements** — sorted array has same length and same IDs as input
    - **Property 5: Search case insensitivity** — query and query.toUpperCase() yield same results
    - **Property 6: Category filter OR semantics** — every result has category ∈ selectedCategories
    - **Property 7: Account filter OR semantics** — every result has account ∈ selectedAccounts
    - **Property 10: Filter AND composition** — result satisfies BOTH category AND account filters
    - **Validates: Requirements 3.2, 4.1, 4.2, 5.1, 5.2, 6.1, 6.2, 7.2, 7.3, 7.4, 7.5, 7.6**

- [ ] 2. Implement useDebouncedValue hook
  - [ ] 2.1 Create `src/lib/hooks/useDebouncedValue.ts`
    - Accept `value: T` and `delay: number` (default 300ms)
    - Return debounced value that updates only after delay ms of no input changes
    - Clear timeout on value change and on unmount (cleanup)
    - _Requirements: 3.1_

  - [ ]* 2.2 Write unit tests for useDebouncedValue
    - Test that value updates only after delay elapses
    - Test that rapid changes only emit final value
    - Test cleanup on unmount
    - _Requirements: 3.1_

- [ ] 3. Implement month navigation helpers
  - [ ] 3.1 Create `src/features/transactions/monthNav.ts` with `navigateMonth()` and `formatMonthLabel()`
    - `navigateMonth(currentMonth, direction)`: compute prev/next month in YYYY-MM format
    - Handle year boundaries correctly (2025-01 prev → 2024-12, 2024-12 next → 2025-01)
    - Return `null` for "next" when result would exceed current real month
    - `formatMonthLabel(month)`: return Indonesian month name + year (e.g., "Juni 2025")
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 3.2 Write property tests for month navigation (P8, P9)
    - **Property 8: Month navigation boundary** — `navigateMonth(currentMonth, "next") === null` when at actual current month
    - **Property 9: Month navigation inverse** — `navigateMonth(navigateMonth(m, "next"), "prev") === m` for non-current months
    - **Validates: Requirements 2.1, 2.2, 2.3**

- [ ] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement MonthSelector component
  - [ ] 5.1 Create `src/components/ui/MonthSelector.tsx`
    - Render formatted month label centered between prev/next arrow buttons
    - Disable next arrow when selected month equals current real month
    - Call `onMonthChange` with direction "prev" or "next" on arrow tap
    - Height 48px, full-width, padding inline 20px, arrows `text-secondary`
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 6. Implement SearchBar component
  - [ ] 6.1 Create `src/components/ui/SearchBar.tsx`
    - Controlled input with search icon (🔍) on left and clear button (✕) when non-empty
    - Call `onChange` with raw input value; parent handles debounce
    - Clear button resets value to empty string
    - Height 44px, radius 16px, background `bg-card-soft`, DM Sans 14px
    - _Requirements: 3.1, 3.4_

- [ ] 7. Implement CategoryFilterChips component
  - [ ] 7.1 Create `src/components/ui/CategoryFilterChips.tsx`
    - Horizontal scrollable row of toggle chips for all 8 categories with emoji prefix
    - Active chips use `accent-primary` background; inactive use `bg-card-soft`
    - Call `onToggle(category)` on chip tap to toggle selection
    - Chip height 32px, radius 999px, padding inline 12px
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 8. Implement AccountFilterChips component
  - [ ] 8.1 Create `src/components/ui/AccountFilterChips.tsx`
    - Horizontal scrollable row of toggle chips for all 6 accounts (text labels, no emoji)
    - Same visual pattern as CategoryFilterChips
    - Call `onToggle(account)` on chip tap
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 9. Implement SortSelector component
  - [ ] 9.1 Create `src/components/ui/SortSelector.tsx`
    - Compact dropdown/select with 4 options: Terbaru, Terlama, Terbesar, Terkecil
    - Default value "latest" (Terbaru)
    - Call `onChange(mode)` when selection changes
    - Height 36px, radius 12px, `bg-card-soft`, DM Sans 13px 600
    - _Requirements: 7.1_

- [ ] 10. Implement TransactionList component
  - [ ] 10.1 Create `src/components/ui/TransactionList.tsx`
    - Map filtered transactions to existing `TransactionItem` components
    - Pass `onTap` handler to each item for opening edit sheet
    - Render 1px `bg-card-soft` dividers between items
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 11. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement EditTransactionSheet component
  - [ ] 12.1 Create `src/components/sheets/EditTransactionSheet.tsx`
    - Wrap existing `BottomSheet` with title "Edit Transaksi"
    - Render `ManualTransactionForm` pre-filled with transaction values in edit mode
    - Primary CTA "Simpan Perubahan" triggers `onSave(id, data)`
    - Secondary danger button "Hapus Transaksi" triggers `onDelete(transaction)`
    - Max height 90vh, top radius 28px
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 13. Implement DeleteConfirmDialog component
  - [ ] 13.1 Create `src/components/ui/DeleteConfirmDialog.tsx`
    - Centered modal overlay with backdrop blur + dark overlay
    - Card with title "Yakin mau hapus?", transaction detail + formatted nominal preview
    - "Batal" button (secondary) calls `onCancel`; "Hapus" button (danger) calls `onConfirm`
    - Framer Motion scale 0.95 → 1 on enter
    - Format nominal using `formatIDR`
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 12.2_

- [ ] 14. Implement EmptyState component
  - [ ] 14.1 Create `src/components/ui/EmptyState.tsx`
    - Centered vertically, emoji 📝, message text below
    - DM Sans 14px, `text-muted`, text-center
    - Accept `message` prop for contextual empty state copy
    - _Requirements: 11.1, 11.2_

- [ ] 15. Compose TransactionsPage
  - [ ] 15.1 Create `src/pages/TransactionsPage.tsx` composing all sub-components
    - Subscribe to `transactionStore` for selectedMonth and currentMonthTransactions
    - Manage local state: searchInput, selectedCategories, selectedAccounts, sortMode
    - Use `useDebouncedValue` for search query debouncing (300ms)
    - Derive filteredTransactions via `applyFilters()` with `useMemo`
    - Render components in vertical order: MonthSelector, SearchBar, CategoryFilterChips, AccountFilterChips, SortSelector, TransactionList/EmptyState
    - Manage editingTransaction and deletingTransaction state for sheet/dialog
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 15.2 Wire edit flow in TransactionsPage
    - On transaction tap → set editingTransaction → open EditTransactionSheet
    - On save → call `transactionStore.updateTransaction(id, data)` with updatedAt timestamp
    - On save success → close sheet, show toast "Transaksi diperbarui ✨"
    - Preserve original `id`, `createdAt`, `source` fields on update
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ] 15.3 Wire delete flow in TransactionsPage
    - On "Hapus Transaksi" tap in sheet → open DeleteConfirmDialog
    - On confirm → call `transactionStore.deleteTransaction(id)`, close dialog + sheet, toast "Transaksi dihapus ✨"
    - On cancel → close dialog only, sheet stays open
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ] 15.4 Wire month navigation in TransactionsPage
    - On month change → call `navigateMonth()` → if valid, call `setSelectedMonth()`
    - On month change → transactionStore loads new month's data
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [ ] 15.5 Implement empty state logic in TransactionsPage
    - If month has no transactions → show EmptyState "Belum ada transaksi bulan ini. Yuk mulai catat! ✨"
    - If filters produce zero results but transactions exist → show EmptyState "Tidak ada transaksi yang cocok."
    - _Requirements: 11.1, 11.2_

  - [ ]* 15.6 Write property tests for edit/delete (P11, P12)
    - **Property 11: Delete removes exactly one** — after delete, array length is previousLength - 1 and ID is absent
    - **Property 12: Edit preserves ID and creation metadata** — after edit, id/createdAt/source unchanged
    - **Validates: Requirements 9.2, 9.3, 10.2**

- [ ] 16. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Integration tests
  - [ ]* 17.1 Write integration tests for TransactionsPage
    - Mount TransactionsPage with mocked transactionStore containing test transactions
    - Test search: type query → verify filtered results render correctly
    - Test category filter: tap chip → verify only matching category items show
    - Test account filter: tap chip → verify only matching account items show
    - Test sort: select "Terbesar" → verify descending nominal order
    - Test edit flow: tap item → verify sheet opens pre-filled → save → verify update
    - Test delete flow: tap item → tap Hapus → confirm → verify removal
    - Test month navigation: tap prev → verify month changes and new data loads
    - Test empty state: apply impossible filter → verify empty message shows
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.5, 3.1, 3.2, 4.2, 5.2, 7.1, 8.1, 9.1, 9.4, 10.2, 10.4, 11.1, 11.2, 13.1_

- [ ] 18. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests (P1–P12) validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Filter engine is implemented as pure functions for easy testing and composability
- Existing components reused: TransactionItem (Sprint 4), ManualTransactionForm (Sprint 3), BottomSheet (Sprint 1), Toast (Sprint 1)
- All data operations use transactionStore/transactionRepo — no direct IndexedDB access from components
- All amounts formatted via `formatIDR` from `src/lib/format.ts`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "3.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["1.4", "1.5", "2.2", "3.2"] },
    { "id": 3, "tasks": ["5.1", "6.1", "7.1", "8.1", "9.1", "10.1", "14.1"] },
    { "id": 4, "tasks": ["12.1", "13.1"] },
    { "id": 5, "tasks": ["15.1"] },
    { "id": 6, "tasks": ["15.2", "15.3", "15.4", "15.5"] },
    { "id": 7, "tasks": ["15.6"] },
    { "id": 8, "tasks": ["17.1"] }
  ]
}
```
