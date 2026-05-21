# Requirements Document

## Introduction

Sprint 4 transforms the HomePage placeholder into Luma's personal cozy finance dashboard. The Home screen surfaces a real-time finance summary from local stores (transactions, budgets, settings), wrapped in warm visual comfort. It is composed of a personalized header, a hero budget card with character and progress visualization, quick stats row, recent transactions list, and FAB positioning. No budget editing happens on Home — only overview and navigation.

## Glossary

- **HomePage**: The main dashboard page composing all Sprint 4 sections at route `/home`
- **HomeHeader**: Top header component displaying personalized time-based greeting and settings icon
- **HeroBudgetCard**: The largest card on Home showing character, budget overview, progress ring, and navigation shortcut to `/budget`
- **CharacterDisplay**: Component rendering the active character asset based on budget-derived state
- **ProgressRing**: SVG-based circular progress indicator for budget usage percentage
- **QuickStats**: Horizontal row of three mini stat cards (monthly total, today total, top category)
- **RecentTransactions**: Card listing the latest 5 transactions with empty state handling
- **TransactionItem**: Single transaction row inside RecentTransactions
- **FAB**: Floating Action Button (from Sprint 3) for adding transactions
- **CharacterState**: One of `"happy"`, `"chill"`, `"worried"`, `"panic"` derived from budget percentage
- **BudgetUsage**: Runtime object containing `totalBudget`, `used`, `remaining`, and `percentage`
- **formatIDR**: Utility function from Sprint 3 that formats numbers into Indonesian Rupiah display strings
- **getCharacterState**: Pure function mapping budget percentage to CharacterState
- **getGreeting**: Pure function mapping hour (0–23) to Indonesian time-based greeting
- **getBudgetUsage**: Pure function computing budget usage from monthly budget and transactions
- **getMonthlyTotal**: Pure function summing all transaction nominals for the current month
- **getTodayTotal**: Pure function summing transaction nominals matching today's date
- **getTopCategory**: Pure function returning the category with highest total spend

## Requirements

### Requirement 1: HomePage Layout and Composition

**User Story:** As a user, I want to see a complete personal finance dashboard when I open the app, so that I can quickly understand my financial situation at a glance.

#### Acceptance Criteria

1. WHEN a user navigates to `/home`, THE HomePage SHALL render HomeHeader, HeroBudgetCard, QuickStats, RecentTransactions, and FAB in vertical order
2. THE HomePage SHALL subscribe to transactionStore, budgetStore, and settingsStore to derive all displayed data
3. WHEN transactions or budget data changes in the stores, THE HomePage SHALL re-render affected sections with updated values
4. THE HomePage SHALL derive calculations using getMonthlyTotal, getTodayTotal, getTopCategory, getBudgetUsage, and getCharacterState helper functions

### Requirement 2: HomeHeader Greeting Logic

**User Story:** As a user, I want to see a personalized time-based greeting with my name, so that the app feels warm and personal each time I open it.

#### Acceptance Criteria

1. WHEN the current hour is between 5 and 10 inclusive, THE HomeHeader SHALL display "Selamat pagi" followed by the user name
2. WHEN the current hour is between 11 and 14 inclusive, THE HomeHeader SHALL display "Selamat siang" followed by the user name
3. WHEN the current hour is between 15 and 17 inclusive, THE HomeHeader SHALL display "Selamat sore" followed by the user name
4. WHEN the current hour is between 18 and 23 or between 0 and 4 inclusive, THE HomeHeader SHALL display "Selamat malam" followed by the user name
5. THE getGreeting function SHALL return exactly one valid greeting string for every integer hour in the range 0 to 23
6. THE HomeHeader SHALL display a settings gear icon on the right side that navigates to `/settings`

### Requirement 3: HeroBudgetCard Display

**User Story:** As a user, I want to see my budget overview prominently on the home screen, so that I can quickly understand how much I have left to spend this month.

#### Acceptance Criteria

1. WHILE a monthly budget is set, THE HeroBudgetCard SHALL display the remaining amount formatted via formatIDR with the label "Sisa"
2. WHILE a monthly budget is set, THE HeroBudgetCard SHALL display the used amount formatted via formatIDR with the label "Terpakai"
3. WHILE a monthly budget is set, THE HeroBudgetCard SHALL display a ProgressRing showing the budget usage percentage
4. THE HeroBudgetCard SHALL display the CharacterDisplay component reflecting the current CharacterState
5. THE HeroBudgetCard SHALL display a "Lihat Budget →" shortcut link that navigates to `/budget`

### Requirement 4: HeroBudgetCard Empty State

**User Story:** As a new user without a budget set, I want to see a friendly prompt to create one, so that I know how to get started with budgeting.

#### Acceptance Criteria

1. WHEN no monthly budget is set, THE HeroBudgetCard SHALL display the CharacterDisplay in "happy" state
2. WHEN no monthly budget is set, THE HeroBudgetCard SHALL display the text "Belum ada budget bulan ini."
3. WHEN no monthly budget is set, THE HeroBudgetCard SHALL display an "Atur Budget →" link that navigates to `/budget`

### Requirement 5: CharacterDisplay State-Based Rendering

**User Story:** As a user, I want to see my character react to my spending progress, so that I get a visual emotional cue about my budget health.

#### Acceptance Criteria

1. WHEN budgetPercentageUsed is less than 0.5, THE getCharacterState function SHALL return "happy"
2. WHEN budgetPercentageUsed is between 0.5 inclusive and 0.75 exclusive, THE getCharacterState function SHALL return "chill"
3. WHEN budgetPercentageUsed is between 0.75 inclusive and 1.0 exclusive, THE getCharacterState function SHALL return "worried"
4. WHEN budgetPercentageUsed is 1.0 or greater, THE getCharacterState function SHALL return "panic"
5. THE getCharacterState function SHALL return monotonically non-decreasing state indices as the percentage increases
6. THE CharacterDisplay SHALL render the appropriate character asset based on the current state and active character pack
7. IF the character asset fails to load, THEN THE CharacterDisplay SHALL render a fallback emoji placeholder at the same size

### Requirement 6: ProgressRing Color Shift

**User Story:** As a user, I want the progress ring to change color as I approach or exceed my budget, so that I get an intuitive visual warning.

#### Acceptance Criteria

1. WHILE percentage is less than 0.75, THE ProgressRing SHALL render with accent-primary (amber) color
2. WHILE percentage is between 0.75 inclusive and 1.0 exclusive, THE ProgressRing SHALL render with warning-soft color
3. WHILE percentage is 1.0 or greater, THE ProgressRing SHALL render with danger-soft color
4. THE ProgressRing SHALL visually clamp the fill to a maximum of 100% even when percentage exceeds 1.0
5. THE ProgressRing SHALL display the percentage as centered text in format "N%" (e.g., "42%")

### Requirement 7: QuickStats Display

**User Story:** As a user, I want to see my monthly total, today's spending, and top category at a glance, so that I can quickly assess my spending patterns.

#### Acceptance Criteria

1. THE QuickStats SHALL display the monthly total formatted via formatIDR with label "Bulan ini"
2. THE QuickStats SHALL display today's total formatted via formatIDR with label "Hari ini"
3. WHEN transactions exist, THE QuickStats SHALL display the top spending category name with label "Top kategori"
4. WHEN no transactions exist, THE QuickStats SHALL display "—" for the top category value
5. THE getTodayTotal result SHALL be less than or equal to getMonthlyTotal for any set of current month transactions
6. THE getTopCategory function SHALL return the category with the highest sum of nominals among all categories

### Requirement 8: RecentTransactions Display

**User Story:** As a user, I want to see my latest transactions on the home screen, so that I can quickly review my most recent spending without navigating away.

#### Acceptance Criteria

1. THE RecentTransactions SHALL display at most 5 transactions sorted by creation date descending
2. WHEN transactions exist, THE RecentTransactions SHALL display each transaction with category icon, detail text, account chip, nominal formatted via formatIDR, and mood badge if set
3. WHEN no transactions exist, THE RecentTransactions SHALL display the empty state text "Belum ada transaksi. Yuk mulai catat! ✨"

### Requirement 9: Budget Usage Calculation

**User Story:** As a user, I want my budget calculations to be accurate and consistent, so that I can trust the financial summary displayed on my dashboard.

#### Acceptance Criteria

1. THE getBudgetUsage function SHALL compute `used` as the sum of all transaction nominals in the current month
2. THE getBudgetUsage function SHALL compute `remaining` as `totalBudget - used`
3. THE getBudgetUsage function SHALL compute `percentage` as `used / totalBudget`
4. THE getBudgetUsage function SHALL maintain the identity `remaining + used = totalBudget` for all valid inputs
5. THE getMonthlyTotal function SHALL return a non-negative value for any transaction array

### Requirement 10: Currency Formatting and Navigation

**User Story:** As a user, I want all monetary amounts displayed consistently in Indonesian Rupiah format, and I want easy navigation to budget details, so that the interface is cohesive and intuitive.

#### Acceptance Criteria

1. THE HomePage SHALL format all displayed currency amounts using the formatIDR function
2. THE formatIDR function SHALL support round-trip conversion such that parseIDR(formatIDR(n)) equals n for all valid non-negative integers
3. WHEN a user taps "Lihat Budget →" on the HeroBudgetCard, THE system SHALL navigate to the `/budget` route
4. WHEN a user taps "Atur Budget →" on the empty state HeroBudgetCard, THE system SHALL navigate to the `/budget` route

### Requirement 11: FAB Positioning

**User Story:** As a user, I want the floating action button to be easily accessible without overlapping navigation elements, so that I can always add transactions quickly.

#### Acceptance Criteria

1. THE FAB SHALL be positioned above the BottomNav with a minimum clearance of 12px
2. THE FAB SHALL use `bottom: calc(env(safe-area-inset-bottom) + 72px)` to avoid overlap on all viewport sizes
3. WHEN the FAB is tapped, THE system SHALL open the AddTransaction sheet
