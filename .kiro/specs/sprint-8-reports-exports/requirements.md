# Requirements Document

## Introduction

Sprint 8 implements the Reports Page (`/reports`) — the "Laporan" tab in Luma's BottomNav. This page provides monthly financial reports combining visual summaries, interactive charts, budget comparisons, and exportable reports (PDF visual and spreadsheet). Per BUILD_PLAN §15 and PRD §11/§17, reports must be useful for both casual users (quick visual glance) and serious users (detailed data export). All data derivation uses existing Sprint 2 calculation helpers. An AI Reflection card placeholder is shown but disabled until Sprint 11 activates it. All operations are client-side with no network calls.

## Glossary

- **ReportsPage**: The main page component rendered at route `/reports`, composing all report sub-components.
- **MonthSelector**: A navigation component (reused from Sprint 6) for selecting the report month.
- **SummaryCards**: A 2×2 grid of cards displaying total spending, remaining budget, top category, and biggest transaction.
- **CategoryChart**: A Recharts donut/pie chart showing spending distribution by category.
- **SpendingTrendChart**: A Recharts line chart showing daily spending over the selected month.
- **BudgetComparisonSection**: A section showing budget limit vs actual spending per category with progress bars.
- **AIReflectionCard**: A placeholder card for future AI behavioral insights (disabled in Sprint 8).
- **ExportActions**: A group of buttons for triggering PDF, XLSX, and CSV export downloads.
- **HiddenReportComponent**: An off-screen rendered component used as the source for html2canvas PDF generation.
- **deriveMonthlyReport**: A pure function that computes all report metrics from raw transaction, budget, and savings data.
- **buildDailySpending**: A helper that maps transactions to a day-by-day spending array for the trend chart.
- **buildBudgetComparison**: A helper that pairs category budgets with actual spending for comparison display.
- **exportVisualPDF**: An async function that renders the hidden report to canvas and saves as PDF.
- **exportSpreadsheet**: An async function that creates and downloads an XLSX or CSV file from report data.
- **formatIDR**: A formatting utility rendering numeric amounts as Indonesian Rupiah strings (e.g., "Rp15.000").
- **MonthlyReportData**: The derived data structure containing all computed report metrics for a given month.

## Requirements

### Requirement 1: Page Layout and Data Derivation

**User Story:** As a user, I want the Reports page to show a comprehensive monthly financial summary derived from my real data, so that I can quickly understand my spending patterns.

#### Acceptance Criteria

1. WHEN a user navigates to the `/reports` route, THE ReportsPage SHALL render the MonthSelector, SummaryCards, CategoryChart, SpendingTrendChart, BudgetComparisonSection, AIReflectionCard, and ExportActions in vertical order.
2. THE ReportsPage SHALL derive all report data using the `deriveMonthlyReport()` function with data from transactionStore, budgetStore, and savingGoalStore.
3. THE SummaryCards SHALL display the `remainingBudget` value as "Belum diatur" when no monthly budget is set for the selected month.
4. THE SummaryCards SHALL display `topCategory` showing the category with the highest total spending for the selected month.
5. THE SummaryCards SHALL display `biggestTransaction` showing the single transaction with the highest nominal for the selected month.
6. WHEN the selected month has no transactions, THE ReportsPage SHALL display an empty state message "Belum ada data untuk bulan ini. Catat transaksi dulu yuk! ✨" and render charts with zero/empty state.

---

### Requirement 2: Month Navigation

**User Story:** As a user, I want to navigate between months to view reports for different periods, so that I can compare my spending across time.

#### Acceptance Criteria

1. THE MonthSelector SHALL use the same pattern as Sprint 6 with prev/next arrows and formatted month label.
2. WHEN the selected month changes, THE ReportsPage SHALL re-derive all report data for the newly selected month.
3. WHEN the user attempts to navigate to a future month beyond the current real month, THE MonthSelector SHALL disable forward navigation.

---

### Requirement 3: Category Chart

**User Story:** As a user, I want to see my spending broken down by category in a visual chart, so that I can quickly identify where my money goes.

#### Acceptance Criteria

1. THE CategoryChart SHALL render a Recharts donut/pie chart showing spending distribution per category.
2. THE CategoryChart SHALL use category colors consistent with the DESIGN_SYSTEM category color mapping.
3. THE CategoryChart SHALL display a legend below the chart with category name and percentage of total spending.
4. THE CategoryChart SHALL be lazy-loaded via React.lazy() to avoid blocking initial page render.
5. WHEN no transactions exist for the selected month, THE CategoryChart SHALL render an empty state (no slices, center label "Rp0").

---

### Requirement 4: Spending Trend Chart

**User Story:** As a user, I want to see my daily spending pattern over the month as a line chart, so that I can identify high-spending days and patterns.

#### Acceptance Criteria

1. THE SpendingTrendChart SHALL render a Recharts line chart with one data point per day of the selected month.
2. THE SpendingTrendChart SHALL display day numbers (1..28/30/31) on the X-axis and spending amounts on the Y-axis.
3. THE SpendingTrendChart SHALL use `accent-primary` (#E8A857) as the line color with a soft gradient fill below.
4. THE SpendingTrendChart SHALL be lazy-loaded via React.lazy() to avoid blocking initial page render.
5. WHEN a day has no transactions, THE SpendingTrendChart SHALL plot that day's value as 0 (continuous line through zero points).

---

### Requirement 5: Budget Comparison Section

**User Story:** As a user, I want to compare my actual spending against my budget per category, so that I can see where I'm staying within limits and where I'm over-spending.

#### Acceptance Criteria

1. THE BudgetComparisonSection SHALL display one row per category that has a budget set for the selected month.
2. EACH budget comparison row SHALL show: category emoji + name, a progress bar, and actual spending vs budget limit formatted with formatIDR.
3. THE progress bar color SHALL be `accent-secondary` when under 75%, `warning-soft` when 75-99%, and `danger-soft` when 100% or above.
4. WHEN actual spending exceeds the budget limit, THE row SHALL display a "Melebihi budget" badge.
5. WHEN no category budgets are set for the selected month, THE BudgetComparisonSection SHALL display the message "Belum ada budget yang diatur."

---

### Requirement 6: AI Reflection Card Placeholder

**User Story:** As a user, I want to see that an AI reflection feature is coming, so that I know the app will provide deeper insights in the future.

#### Acceptance Criteria

1. THE AIReflectionCard SHALL render with title "Refleksi AI ✨" and body text explaining the feature is coming in a future update.
2. THE AIReflectionCard SHALL be visually disabled (opacity 0.6, no tap interactions).
3. THE AIReflectionCard SHALL NOT make any API calls or attempt to generate AI content.

---

### Requirement 7: PDF Visual Report Export

**User Story:** As a user, I want to download a beautiful visual PDF report of my monthly finances, so that I can save or share my financial summary.

#### Acceptance Criteria

1. WHEN the user taps "Download Laporan Visual", THE ReportsPage SHALL render the HiddenReportComponent off-screen and convert it to PDF via html2canvas + jsPDF.
2. THE PDF SHALL contain: month title, total spending, remaining budget, top category, category breakdown, and Luma branding.
3. THE PDF filename SHALL follow the pattern "Laporan-Luma-{MonthName}-{Year}.pdf" (e.g., "Laporan-Luma-Juni-2025.pdf").
4. DURING PDF generation, THE export button SHALL show a loading state and all export buttons SHALL be disabled.
5. WHEN PDF generation completes successfully, THE ReportsPage SHALL show a toast "Laporan berhasil diunduh ✨".
6. WHEN PDF generation fails, THE ReportsPage SHALL show a toast "Gagal membuat laporan, coba lagi ya" and reset the loading state.
7. THE html2canvas and jsPDF modules SHALL be lazy-loaded (dynamic import) and not included in the initial page bundle.

---

### Requirement 8: Spreadsheet Export (XLSX)

**User Story:** As a user, I want to export my financial data as a spreadsheet, so that I can do manual analysis in Excel or Google Sheets.

#### Acceptance Criteria

1. WHEN the user taps "Export Spreadsheet (.xlsx)", THE ReportsPage SHALL generate and download an XLSX file.
2. THE XLSX workbook SHALL contain exactly 4 sheets: "Transactions", "Budgets", "Saving Goals", "Monthly Summary".
3. THE Transactions sheet SHALL contain columns: Tanggal, Detail, Nominal, Kategori, Akun, Mood, Catatan — one row per transaction in the selected month.
4. THE Budgets sheet SHALL contain columns: Kategori, Budget, Aktual, Sisa, Persentase — one row per category budget.
5. THE Saving Goals sheet SHALL contain columns: Target, Nominal Target, Terkumpul, Progres, Deadline, Status — one row per saving goal.
6. THE Monthly Summary sheet SHALL contain key metrics: Total Pengeluaran, Sisa Budget, Kategori Teratas, Transaksi Terbesar, Jumlah Transaksi.
7. THE XLSX filename SHALL follow the pattern "Luma-{MonthName}-{Year}.xlsx".
8. THE xlsx module SHALL be lazy-loaded (dynamic import) and not included in the initial page bundle.

---

### Requirement 9: CSV Export

**User Story:** As a user, I want a simple CSV export option for my transactions, so that I can use the data in any tool that supports CSV.

#### Acceptance Criteria

1. WHEN the user taps "Export CSV", THE ReportsPage SHALL generate and download a CSV file containing the selected month's transactions.
2. THE CSV SHALL contain the same columns as the Transactions sheet in XLSX: Tanggal, Detail, Nominal, Kategori, Akun, Mood, Catatan.
3. THE CSV filename SHALL follow the pattern "Luma-{MonthName}-{Year}.csv".
4. THE CSV SHALL have exactly `transactions.length + 1` rows (1 header row + N data rows).

---

### Requirement 10: Amount Formatting

**User Story:** As a user, I want all monetary amounts displayed in Indonesian Rupiah format, so that values are immediately readable.

#### Acceptance Criteria

1. ALL monetary values in SummaryCards, BudgetComparisonSection, and HiddenReportComponent SHALL be formatted using the formatIDR utility.
2. THE SpendingTrendChart tooltip SHALL display amounts formatted with formatIDR.

---

### Requirement 11: Performance (Lazy Loading)

**User Story:** As a user, I want the Reports page to load quickly even though it has charts and heavy export libraries, so that the app stays fast.

#### Acceptance Criteria

1. THE CategoryChart and SpendingTrendChart components SHALL be lazy-loaded via React.lazy() with a Suspense fallback (skeleton/spinner).
2. THE export modules (html2canvas, jsPDF, xlsx) SHALL be loaded via dynamic import() only when the user triggers an export action.
3. THE ReportsPage initial render SHALL NOT include chart or export library code in its JavaScript bundle.

---

### Requirement 12: Report Data Correctness

**User Story:** As a user, I want the report numbers to accurately reflect my transaction data, so that I can trust the financial summary.

#### Acceptance Criteria

1. THE `totalSpending` SHALL equal the sum of all transaction nominals for the selected month.
2. THE `remainingBudget` SHALL equal `monthlyBudget.totalBudget - totalSpending` when a budget is set.
3. THE `dailySpending` array SHALL have exactly as many entries as there are days in the selected month.
4. THE sum of all `dailySpending[].total` values SHALL equal `totalSpending`.
5. THE `topCategory` SHALL be the category with the highest total spending (no other category has a higher sum).
6. THE `biggestTransaction` SHALL be the transaction with the highest nominal value (no other transaction has a higher nominal).
7. EACH `budgetComparison[].percentage` SHALL equal `(actual / budgetLimit) * 100`.

---

### Requirement 13: No Network Calls

**User Story:** As a user, I want the Reports page to work entirely offline, so that I can review my finances without internet.

#### Acceptance Criteria

1. THE ReportsPage SHALL perform all data operations and exports exclusively against local stores and IndexedDB without any network requests.
2. THE export functions SHALL generate and save files locally without uploading to any external service.

