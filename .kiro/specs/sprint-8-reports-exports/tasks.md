# Implementation Plan: Sprint 8 — Reports + Exports

## Overview

Implement the Reports Page (`/reports`) composing month navigation, summary cards, category chart, spending trend chart, budget comparison, AI placeholder, and export actions (PDF, XLSX, CSV). All data derivation uses Sprint 2 calc helpers. Charts and export modules are lazy-loaded for performance. Implementation follows a bottom-up approach: types and helpers first, then chart components, then export modules, then page composition.

## Tasks

- [ ] 1. Define report types and helpers
  - [ ] 1.1 Create `src/features/reports/types.ts` with all report-specific types
    - Define `MonthlyReportData` interface with all derived fields
    - Define `DailySpendingPoint` interface (date, day, total)
    - Define `BudgetComparisonItem` interface (category, budgetLimit, actual, percentage)
    - Define `ExportFormat` type: "pdf" | "xlsx" | "csv"
    - Define spreadsheet row types: `SpreadsheetTransactionRow`, `SpreadsheetBudgetRow`, `SpreadsheetSavingGoalRow`, `SpreadsheetMonthlySummaryRow`
    - _Requirements: 12.1, 12.2, 12.3_

  - [ ] 1.2 Implement `deriveMonthlyReport()` in `src/features/reports/reportHelpers.ts`
    - Calculate `totalSpending` using `getMonthlyTotal()` from Sprint 2 calc helpers
    - Calculate `remainingBudget` as `monthlyBudget.totalBudget - totalSpending` (null if no budget)
    - Calculate `categoryTotals` using `getCategoryTotals()` from Sprint 2 calc helpers
    - Calculate `topCategory` using `getTopCategory()` from Sprint 2 calc helpers
    - Find `biggestTransaction` as transaction with max nominal (null if empty)
    - Delegate to `buildDailySpending()` and `buildBudgetComparison()`
    - _Requirements: 1.2, 12.1, 12.2, 12.5, 12.6_

  - [ ] 1.3 Implement `buildDailySpending()` in `src/features/reports/reportHelpers.ts`
    - Use `getDaysInMonth()` from date-fns to determine array length
    - Initialize all days to 0
    - Accumulate transaction nominals per day (extract day from tx.date)
    - Return array of `DailySpendingPoint` with exactly daysInMonth entries
    - _Requirements: 12.3, 12.4_

  - [ ] 1.4 Implement `buildBudgetComparison()` in `src/features/reports/reportHelpers.ts`
    - For each categoryBudget, find actual spending from categoryTotals
    - Calculate percentage as `(actual / budgetLimit) * 100`
    - Return array of `BudgetComparisonItem` (one per category budget)
    - _Requirements: 5.1, 12.7_

  - [ ]* 1.5 Write property tests for report helpers (P1, P2, P3, P4, P5, P6, P7)
    - **Property 1: Total spending sum** — `deriveMonthlyReport(txs, ...).totalSpending === txs.reduce((s, t) => s + t.nominal, 0)`
    - **Property 2: Remaining budget** — `remainingBudget === budget.totalBudget - totalSpending` when budget exists
    - **Property 3: Daily spending sum** — `sum(dailySpending.map(d => d.total)) === totalSpending`
    - **Property 4: Daily spending length** — `buildDailySpending(txs, month).length === getDaysInMonth(month)`
    - **Property 5: Budget percentage** — `item.percentage === (item.actual / item.budgetLimit) * 100`
    - **Property 6: Top category maximality** — no other category has higher total than topCategory
    - **Property 7: Biggest transaction maximality** — no other transaction has higher nominal than biggestTransaction
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7**

- [ ] 2. Implement SummaryCards component
  - [ ] 2.1 Create `src/components/cards/SummaryCards.tsx`
    - 2×2 grid layout with 4 summary cards
    - Card 1: "Total Pengeluaran" + formatIDR(totalSpending)
    - Card 2: "Sisa Budget" + formatIDR(remainingBudget) or "Belum diatur" when null
    - Card 3: "Kategori Teratas" + category emoji + name + formatIDR(total), or "-" when null
    - Card 4: "Transaksi Terbesar" + detail + formatIDR(nominal), or "-" when null
    - Use radius 24px, padding 16px, `bg-card`, Fraunces 700 for numbers, DM Sans 13px for labels
    - All amounts formatted via formatIDR
    - _Requirements: 1.3, 1.4, 1.5, 10.1_

- [ ] 3. Implement chart components (lazy-loaded)
  - [ ] 3.1 Create `src/components/charts/CategoryChart.tsx` (default export for React.lazy)
    - Recharts PieChart with inner radius (donut style)
    - Map categoryTotals to pie data with category colors from DESIGN_SYSTEM
    - Legend below chart: category name + percentage of total
    - Center label showing formatIDR(totalSpending)
    - Height ~240px
    - Handle empty state: show "Rp0" center label when no data
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

  - [ ] 3.2 Create `src/components/charts/SpendingTrendChart.tsx` (default export for React.lazy)
    - Recharts LineChart with smooth monotone curve
    - X-axis: day numbers (1, 2, 3... up to daysInMonth)
    - Y-axis: spending amount
    - Line color: `accent-primary` (#E8A857), area fill with soft gradient
    - Tooltip showing date + formatIDR(amount) on tap
    - Height ~200px
    - Handle empty/zero values: plot 0 for days without transactions
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 10.2_

  - [ ] 3.3 Create `src/components/charts/ChartSkeleton.tsx` for Suspense fallback
    - Simple loading skeleton matching chart dimensions
    - Animated pulse/shimmer effect
    - _Requirements: 11.1_

- [ ] 4. Implement BudgetComparisonSection component
  - [ ] 4.1 Create `src/components/cards/BudgetComparisonSection.tsx`
    - Section title "Budget vs Aktual"
    - Each row: category emoji + name, progress bar, formatIDR(actual) + " / " + formatIDR(budgetLimit)
    - Progress bar color logic: `accent-secondary` (<75%), `warning-soft` (75-99%), `danger-soft` (≥100%)
    - Over-budget badge: "Melebihi budget" when percentage ≥ 100
    - Empty state: "Belum ada budget yang diatur" when items array is empty
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 10.1_

- [ ] 5. Implement AIReflectionCard placeholder
  - [ ] 5.1 Create `src/components/cards/AIReflectionCard.tsx`
    - Card with `bg-card-soft`, radius 24px, padding 20px
    - Title: "Refleksi AI ✨"
    - Body: "Fitur ini akan hadir di update selanjutnya. AI akan membantu kamu memahami pola pengeluaranmu."
    - Opacity 0.6, pointer-events none
    - Small sparkle/lock icon
    - No API calls, no interactions
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 6. Checkpoint — Ensure all component tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement PDF export module
  - [ ] 7.1 Create `src/features/reports/exportPDF.ts` with `exportVisualPDF()`
    - Lazy import html2canvas and jsPDF via dynamic import()
    - Render hidden element to canvas at 2x scale
    - Convert canvas to PNG data URL
    - Create jsPDF document (A4 portrait)
    - Add image to PDF, handle multi-page if content exceeds A4 height
    - Save with filename "Laporan-Luma-{MonthName}-{Year}.pdf"
    - Throw on error (caller handles toast)
    - _Requirements: 7.1, 7.2, 7.3, 7.7_

  - [ ] 7.2 Create `src/components/reports/HiddenReportComponent.tsx`
    - Position: absolute, left: -9999px (off-screen)
    - Fixed width 375px, white background
    - Contains: month title, total spending, remaining budget, top category, category breakdown list, Luma branding
    - All amounts formatted via formatIDR
    - Use forwardRef so parent can pass ref to the DOM element
    - Static content only (no interactive elements)
    - _Requirements: 7.1, 7.2, 10.1_

- [ ] 8. Implement spreadsheet export module
  - [ ] 8.1 Create `src/features/reports/exportSpreadsheet.ts` with `exportSpreadsheet()`
    - Lazy import xlsx via dynamic import()
    - Build Transactions sheet: map transactions to row objects with Indonesian column headers
    - Build Budgets sheet: map budgetComparison items to row objects
    - Build Saving Goals sheet: map savingGoals to row objects with progress percentage
    - Build Monthly Summary sheet: key metrics as rows
    - For XLSX: create workbook with 4 named sheets, save as .xlsx
    - For CSV: create workbook with Transactions sheet only, save as .csv
    - Filename pattern: "Luma-{MonthName}-{Year}.{xlsx|csv}"
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 9.1, 9.2, 9.3, 9.4_

  - [ ]* 8.2 Write unit tests for exportSpreadsheet data preparation
    - Test that Transactions sheet has correct columns and row count
    - Test that XLSX produces 4 sheets with correct names
    - Test that CSV produces single sheet with correct row count (header + data)
    - Test empty transaction array produces empty sheets (header only)
    - **Validates: Requirements 8.2, 8.3, 9.4**

- [ ] 9. Implement ExportActions component
  - [ ] 9.1 Create `src/components/cards/ExportActions.tsx`
    - Section title: "Export Laporan"
    - Button 1: "📄 Download Laporan Visual" — calls onExportPDF
    - Button 2: "📊 Export Spreadsheet (.xlsx)" — calls onExportXLSX
    - Button 3: "📋 Export CSV" — calls onExportCSV
    - Buttons full-width, stacked vertically, gap 12px
    - Show loading spinner on active button when isExporting
    - Disable all buttons when isExporting
    - _Requirements: 7.4, 7.5_

- [ ] 10. Compose ReportsPage
  - [ ] 10.1 Create `src/pages/ReportsPage.tsx` composing all sub-components
    - Subscribe to transactionStore (selectedMonth, currentMonthTransactions)
    - Subscribe to budgetStore (monthlyBudget, categoryBudgets)
    - Subscribe to savingGoalStore (goals)
    - Derive reportData via `deriveMonthlyReport()` with useMemo
    - Render components in order: MonthSelector, SummaryCards, charts (Suspense), BudgetComparisonSection, AIReflectionCard, ExportActions
    - Render HiddenReportComponent off-screen with ref
    - _Requirements: 1.1, 1.2, 11.1_

  - [ ] 10.2 Wire month navigation in ReportsPage
    - Reuse MonthSelector component from Sprint 6 (or shared component)
    - On month change: call navigateMonth(), if valid call setSelectedMonth()
    - Changing month re-derives all report data automatically via useMemo dependency
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 10.3 Wire PDF export flow in ReportsPage
    - On "Download Laporan Visual" tap: set isExporting true
    - Lazy import exportVisualPDF, call with hiddenReportRef and selectedMonth
    - On success: toast "Laporan berhasil diunduh ✨", reset isExporting
    - On error: toast "Gagal membuat laporan, coba lagi ya", reset isExporting
    - _Requirements: 7.1, 7.4, 7.5, 7.6_

  - [ ] 10.4 Wire spreadsheet export flow in ReportsPage
    - On XLSX tap: set isExporting, lazy import exportSpreadsheet, call with format "xlsx"
    - On CSV tap: set isExporting, lazy import exportSpreadsheet, call with format "csv"
    - On success: toast "Spreadsheet berhasil diunduh ✨", reset isExporting
    - On error: toast "Gagal export spreadsheet, coba lagi ya", reset isExporting
    - _Requirements: 8.1, 9.1_

  - [ ] 10.5 Implement empty state handling in ReportsPage
    - When no transactions for selected month: show empty state message
    - Charts still render (with zero/empty state)
    - Export buttons remain functional (produce empty report)
    - _Requirements: 1.6, 3.5, 4.5_

- [ ] 11. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Add route and navigation
  - [ ] 12.1 Register `/reports` route in app router pointing to ReportsPage
    - Ensure route renders ReportsPage
    - Verify BottomNav "Laporan" tab navigates to this route
    - _Requirements: 1.1_

- [ ] 13. Integration tests
  - [ ]* 13.1 Write integration tests for ReportsPage
    - Mount ReportsPage with mocked stores (transactions, budgets, saving goals)
    - Verify SummaryCards render correct formatted values
    - Verify CategoryChart receives correct categoryTotals props
    - Verify SpendingTrendChart receives correct dailySpending props
    - Verify BudgetComparisonSection renders progress bars with correct colors
    - Verify AIReflectionCard is visible but non-interactive (opacity 0.6)
    - Verify month navigation updates derived data
    - Verify export buttons show loading state during export
    - Verify empty state renders when no transactions
    - Verify "Belum diatur" shows when no budget set
    - Verify all amounts use formatIDR
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 2.2, 3.1, 4.1, 5.1, 6.1, 6.2, 7.4, 10.1, 13.1_

- [ ] 14. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests (P1–P7) validate universal correctness properties from the design document
- Existing components reused: MonthSelector (Sprint 6), BottomNav (Sprint 1), PageWrapper (Sprint 1), Toast (Sprint 1)
- All data operations use stores/repos — no direct IndexedDB access from components
- All amounts formatted via `formatIDR` from `src/lib/format.ts`
- Sprint 2 calc helpers: `getMonthlyTotal`, `getCategoryTotals`, `getTopCategory`, `getRemainingBudget`
- Charts use Recharts (already installed in project dependencies)
- Export uses html2canvas + jsPDF for PDF, xlsx for spreadsheet (all already installed)
- Lazy loading strategy: React.lazy() for chart components, dynamic import() for export modules
- AI Reflection is placeholder only — no API integration until Sprint 11

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4"] },
    { "id": 2, "tasks": ["1.5", "2.1", "3.1", "3.2", "3.3", "4.1", "5.1"] },
    { "id": 3, "tasks": ["7.1", "7.2", "8.1", "9.1"] },
    { "id": 4, "tasks": ["8.2"] },
    { "id": 5, "tasks": ["10.1"] },
    { "id": 6, "tasks": ["10.2", "10.3", "10.4", "10.5"] },
    { "id": 7, "tasks": ["12.1"] },
    { "id": 8, "tasks": ["13.1"] }
  ]
}
```
