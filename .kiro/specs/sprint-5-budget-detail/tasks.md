# Implementation Plan: Sprint 5 — Budget Detail + Category Budgets

## Overview

Implement the full Budget Detail experience accessible from Home → HeroBudgetCard. The page displays monthly budget overview, per-category progress rows with soft warnings, and a BottomSheet for add/edit. Uses Sprint 2's existing budgetRepo/budgetStore — no new IndexedDB stores. Follows the component order: soft warning helpers → BudgetProgressBar → MonthlyBudgetCard → CategoryBudgetRow → CategoryBudgetList → AddEditBudgetSheet + BudgetForm → BudgetHeader → compose BudgetDetailPage → update HomePage HeroBudgetCard → integration tests.

## Tasks

- [ ] 1. Implement soft warning helpers and budget types
  - [ ] 1.1 Create budget feature runtime types and soft warning utility functions
    - Create `src/features/budgets/types.ts` with `BudgetUsage`, `CategoryBudgetUsage`, `CategoryBudgetUsageItem`, and `SoftWarning` interfaces
    - Create `src/features/budgets/warnings.ts` with `generateSoftWarnings()` and `getHomeBudgetWarning()` functions
    - Implement category emoji map and category label map (Indonesian: Makan, Transport, Hiburan, Belanja, Kesehatan, Lainnya)
    - Create `src/lib/format.ts` `parseIDRInput()` helper (strip non-numeric, return integer)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 11.1, 11.3, 12.4_

  - [ ]* 1.2 Write property test: P3 — Soft warnings threshold correctness
    - **Property 3: Soft warnings threshold correctness**
    - Generate random `categoryUsages` arrays with varying percentages; assert every warning has `percentage >= 0.80` and every omitted item has `percentage < 0.80`
    - **Validates: Requirements 7.1, 7.2, 7.3**

  - [ ]* 1.3 Write property test: P7 — Soft warning message format (no aggressive copy)
    - **Property 7: Soft warning message format — no aggressive copy**
    - For all generated warnings: assert message contains no exclamation marks, no all-caps words, and exactly one emoji at the end
    - **Validates: Requirements 7.4, 11.1, 11.3**

  - [ ]* 1.4 Write property test: P10 — Home warning is most critical
    - **Property 10: Home warning is most critical**
    - For random `categoryUsages` with at least one item >= 80%: `getHomeBudgetWarning` returns the category with the highest percentage
    - **Validates: Requirements 7.5**

  - [ ]* 1.5 Write property test: P11 — formatIDR round-trip
    - **Property 11: formatIDR round-trip for budget inputs**
    - For random non-negative integers in [0, 999_999_999_999]: `parseIDRInput(formatIDR(n)) === n`
    - **Validates: Requirements 12.4**

- [ ] 2. Implement BudgetProgressBar component
  - [ ] 2.1 Create BudgetProgressBar component
    - Create `src/components/ui/BudgetProgressBar.tsx`
    - Implement horizontal bar with configurable height (default 8px), border-radius half of height
    - Apply color logic: accent-primary when percentage < 0.75, warning-soft at 0.75–0.99, danger-soft at >= 1.0
    - Clamp visual fill to max 100% regardless of actual percentage
    - Animate fill from 0 to target on mount using Framer Motion (300ms ease-out)
    - Background track uses `bg-card-soft` CSS variable
    - _Requirements: 3.4, 3.5, 3.6, 12.5_

  - [ ]* 2.2 Write property test: P12 — Progress bar visual clamping
    - **Property 12: Progress bar visual clamping**
    - For all percentage values (including > 1.0): the computed fill width equals `min(percentage, 1.0) * 100%`, never exceeding container
    - **Validates: Requirements 12.5**

  - [ ]* 2.3 Write property test: P6 — Category usage percentage bounds
    - **Property 6: Category usage percentage bounds**
    - For all valid `(categoryBudget, transactions)` with `limit > 0` and non-negative nominals: `percentage >= 0`
    - **Validates: Requirements 3.4, 3.5, 3.6, 12.3**

- [ ] 3. Implement MonthlyBudgetCard component
  - [ ] 3.1 Create MonthlyBudgetCard component
    - Create `src/components/cards/MonthlyBudgetCard.tsx`
    - Display total budget as hero number (Fraunces, 36px) formatted with `formatIDR`
    - Render BudgetProgressBar with monthly usage percentage
    - Show stats row: "Terpakai" + used amount and "Sisa" + remaining amount
    - Include edit icon button (pencil) in top-right corner
    - Implement empty state: "Belum ada budget bulan ini." with "Atur Budget Bulanan →" CTA
    - Card styling: radius 24px, padding 20px, bg-card
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 3.2 Write property test: P1 — Budget usage algebraic identity
    - **Property 1: Budget usage algebraic identity**
    - For all valid `(monthlyBudget, transactions)` with `totalBudget > 0`: `getBudgetUsage(...).remaining + getBudgetUsage(...).used === monthlyBudget.totalBudget`
    - **Validates: Requirements 12.1**

- [ ] 4. Implement CategoryBudgetRow and SoftWarningBadge
  - [ ] 4.1 Create SoftWarningBadge component
    - Create `src/components/ui/SoftWarningBadge.tsx`
    - Background: bg-card-soft with slight warm tint, radius 12px, padding 8px 12px
    - Text: Caption size, text-secondary
    - No aggressive colors, no exclamation marks in rendering
    - _Requirements: 11.2, 11.3_

  - [ ] 4.2 Create CategoryBudgetRow component
    - Create `src/components/cards/CategoryBudgetRow.tsx`
    - Left: category emoji from emoji map
    - Middle: category name (Body, text-primary, 600), BudgetProgressBar (height 6px), used/limit amounts (Caption)
    - Right: percentage text with color coding (text-primary < 75%, warning-soft 75–99%, danger-soft >= 100%)
    - Tap entire row triggers onEdit callback
    - Conditionally render SoftWarningBadge below when warning prop exists
    - _Requirements: 3.1, 3.4, 3.5, 3.6_

  - [ ]* 4.3 Write property test: P2 — Category budget usage scoping
    - **Property 2: Category budget usage scoping**
    - For random transactions with mixed categories and months: `getCategoryBudgetUsage` sums only transactions matching BOTH category AND month
    - **Validates: Requirements 12.2**

- [ ] 5. Implement CategoryBudgetList component
  - [ ] 5.1 Create CategoryBudgetList component
    - Create `src/components/cards/CategoryBudgetList.tsx`
    - Render section title: "Budget per Kategori"
    - Map `items` to `CategoryBudgetRow` components, passing appropriate usage props and warnings
    - Render "+ Tambah Budget Kategori" button at bottom (secondary style)
    - Implement empty state: "Belum ada budget kategori. Yuk atur supaya lebih terkontrol 💫"
    - _Requirements: 3.1, 3.2_

  - [ ]* 5.2 Write property test: P9 — Category budget used never exceeds monthly total
    - **Property 9: Category budget used never exceeds monthly total**
    - For valid month data: `sum(getCategoryBudgetUsage(cb, transactions).used)` ≤ total transaction nominal for that month
    - **Validates: Requirements 12.2**

- [ ] 6. Checkpoint — Verify core display components
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement AddEditBudgetSheet and BudgetForm
  - [ ] 7.1 Create BudgetForm component
    - Create `src/components/forms/BudgetForm.tsx`
    - Implement category selector (dropdown with emoji + Indonesian labels) shown only in category mode
    - Implement nominal input with live formatIDR formatting and parseIDRInput on change
    - Implement validation: disable save when nominal ≤ 0 or (mode=category and no category selected)
    - Show helper texts: "Nominalnya belum diisi nih." and "Pilih kategori dulu ya." (soft copy)
    - Pre-fill fields when editing existing budget
    - Input height 52–56px, radius 16px
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 7.2 Create AddEditBudgetSheet component
    - Create `src/components/sheets/AddEditBudgetSheet.tsx`
    - BottomSheet with max-height 90vh, top radius 28px, handle bar
    - Title: "Atur Budget Bulanan" or "Atur Budget Kategori" based on mode
    - Embed BudgetForm with correct mode and initial data
    - Primary CTA: "Simpan Budget" (full-width primary button)
    - On save success: close sheet + show success toast via uiStore
    - On save failure: keep open, show soft error toast, preserve form data
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 7.3 Write property test: P4 — Budget compound uniqueness
    - **Property 4: Budget compound uniqueness**
    - For random `(month, category)` pairs: calling `setCategoryBudget` twice with different limits results in exactly one record with the latest limit
    - **Validates: Requirements 8.1, 8.2, 8.3**

  - [ ]* 7.4 Write property test: P5 — Monthly budget singleton per month
    - **Property 5: Monthly budget singleton per month**
    - For random months: calling `setMonthlyBudget(m, L1)` then `setMonthlyBudget(m, L2)` results in exactly one monthly budget with `totalBudget === L2`
    - **Validates: Requirements 9.1, 9.2, 9.3**

- [ ] 8. Implement BudgetHeader component
  - [ ] 8.1 Create BudgetHeader component
    - Create `src/components/layout/BudgetHeader.tsx`
    - Left: back arrow icon triggering `onBack` (navigates to /home)
    - Title: "Budget Bulan Ini" (Section Title size)
    - Height 56px, padding inline 20px
    - _Requirements: 6.2_

- [ ] 9. Compose BudgetDetailPage
  - [ ] 9.1 Create BudgetDetailPage and wire all components
    - Create `src/pages/BudgetDetailPage.tsx`
    - Subscribe to `budgetStore` for current month's monthly budget and category budgets
    - Subscribe to `transactionStore` for current month's transactions
    - Derive `monthlyUsage` via `getBudgetUsage()`, `categoryUsages` via `getCategoryBudgetUsage()`, and `softWarnings` via `generateSoftWarnings()`
    - Compose: BudgetHeader → MonthlyBudgetCard → CategoryBudgetList → AddEditBudgetSheet
    - Manage sheet open/close state, mode, and editData
    - Handle save: call `setMonthlyBudget` or `setCategoryBudget` based on mode, close sheet, show toast
    - Register route `/budget` in the app router
    - _Requirements: 1.1, 1.2, 1.3, 6.1, 6.3, 10.1, 10.3_

  - [ ]* 9.2 Write property test: P8 — Budget month isolation
    - **Property 8: Budget month isolation**
    - For any budget operations on month `m1`: `budgetStore.monthlyBudgets[m2]` and `budgetStore.categoryBudgets[m2]` remain unaffected for all `m2 ≠ m1`
    - **Validates: Requirements 10.2**

- [ ] 10. Update HomePage HeroBudgetCard with soft warning
  - [ ] 10.1 Integrate soft warning into HeroBudgetCard on HomePage
    - Import `getHomeBudgetWarning` from `src/features/budgets/warnings.ts`
    - Compute category usages for current month using existing store subscriptions
    - Call `getHomeBudgetWarning(categoryUsages)` to get the most critical warning message
    - Display soft warning text on HeroBudgetCard when a category is at >= 80%
    - Ensure "Lihat Budget →" navigates to `/budget`
    - _Requirements: 6.1, 7.5_

- [ ] 11. Checkpoint — Full page integration verification
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Integration tests
  - [ ]* 12.1 Write integration tests for BudgetDetailPage rendering states
    - Test page renders BudgetHeader, MonthlyBudgetCard, CategoryBudgetList when data exists
    - Test empty states render correctly when no monthly budget or no category budgets exist
    - Test store subscription reactivity: adding a transaction updates budget usage display
    - _Requirements: 1.1, 2.1, 2.2, 3.1, 3.2, 10.3_

  - [ ]* 12.2 Write integration tests for AddEditBudgetSheet flows
    - Test monthly mode: opens with correct title, pre-fills nominal, save calls setMonthlyBudget
    - Test category mode: opens with category selector, pre-fills data, save calls setCategoryBudget
    - Test form validation: save button disabled with invalid input, enabled with valid input
    - Test save success closes sheet and shows toast; save failure keeps sheet open
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.4_

  - [ ]* 12.3 Write integration tests for navigation and soft warnings
    - Test HeroBudgetCard "Lihat Budget →" navigates to /budget
    - Test BudgetHeader back arrow navigates to /home
    - Test soft warning badge appears on CategoryBudgetRow when percentage >= 80%
    - Test HeroBudgetCard shows most critical warning from getHomeBudgetWarning
    - _Requirements: 6.1, 6.2, 7.1, 7.2, 7.5_

- [ ] 13. Final checkpoint — All tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (P1–P12 from design)
- Unit tests validate specific examples and edge cases
- All components use TypeScript, Tailwind CSS, and CSS variables per tech steering
- No new IndexedDB stores — uses Sprint 2's existing budgetRepo/budgetStore
- fast-check is the property-based testing library

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "8.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4", "1.5", "2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.1", "4.1"] },
    { "id": 3, "tasks": ["3.2", "4.2", "4.3"] },
    { "id": 4, "tasks": ["5.1", "7.1"] },
    { "id": 5, "tasks": ["5.2", "7.2"] },
    { "id": 6, "tasks": ["7.3", "7.4", "9.1"] },
    { "id": 7, "tasks": ["9.2", "10.1"] },
    { "id": 8, "tasks": ["12.1", "12.2", "12.3"] }
  ]
}
```
