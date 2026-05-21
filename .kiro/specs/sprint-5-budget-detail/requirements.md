# Requirements Document

## Introduction

Sprint 5 delivers the Budget Detail experience for Luma. Users access budgeting from Home → HeroBudgetCard "Lihat Budget →" — budget is NOT in the bottom navigation. The page displays monthly budget overview, per-category budget progress, and provides a BottomSheet for creating/editing budgets. Soft warnings appear when categories approach their limits (≥80%). All data lives in IndexedDB via Sprint 2's existing `budgetRepo`/`budgetStore`. Each month is isolated — no automatic carry-over.

## Glossary

- **BudgetDetailPage**: The main budget management page at route `/budget`
- **MonthlyBudgetCard**: Hero card showing total monthly budget, used amount, remaining amount, and progress bar
- **CategoryBudgetList**: Vertical list component rendering per-category budget rows
- **CategoryBudgetRow**: Single row showing one category's budget limit, usage, progress bar, and optional warning
- **AddEditBudgetSheet**: BottomSheet modal for creating or editing monthly and category budgets
- **BudgetForm**: Form content inside AddEditBudgetSheet with category selector and nominal input
- **SoftWarningBadge**: Visual badge displaying non-aggressive budget warning copy
- **BudgetProgressBar**: Reusable horizontal progress bar for budget visualization
- **budgetStore**: Zustand store managing budget state, keyed by month
- **budgetRepo**: Repository layer for IndexedDB budget record access
- **CategoryType**: Enum of budget categories (Food, Transport, Entertainment, Shopping, Health, Other)
- **formatIDR**: Utility formatting numbers to Indonesian Rupiah display string
- **parseIDRInput**: Utility parsing IDR-formatted strings back to numeric values
- **SoftWarning**: Runtime object containing category, message string, and percentage for a near-limit category
- **BudgetUsage**: Derived object with totalBudget, used, remaining, percentage, and isOver fields
- **CategoryBudgetUsage**: Derived object with used, remaining, percentage, and isOver for one category

## Requirements

### Requirement 1: BudgetDetailPage Layout

**User Story:** As a user, I want a dedicated budget page that shows my monthly and category budgets clearly, so that I can understand my spending limits at a glance.

#### Acceptance Criteria

1. WHEN the user navigates to `/budget`, THE BudgetDetailPage SHALL render a BudgetHeader, a MonthlyBudgetCard, a CategoryBudgetList, and an add-budget action button
2. WHEN the BudgetDetailPage mounts, THE BudgetDetailPage SHALL subscribe to budgetStore and transactionStore for the current month and derive all budget usage data
3. WHEN budget or transaction data changes in the stores, THE BudgetDetailPage SHALL re-derive usage calculations and re-render affected components

### Requirement 2: MonthlyBudgetCard Display

**User Story:** As a user, I want to see my total monthly budget with a progress bar, so that I can quickly gauge overall spending.

#### Acceptance Criteria

1. WHILE a monthly budget exists for the current month, THE MonthlyBudgetCard SHALL display the total budget amount formatted as IDR, a progress bar, the used amount, and the remaining amount
2. WHILE no monthly budget exists for the current month, THE MonthlyBudgetCard SHALL display an empty state with the copy "Belum ada budget bulan ini." and an "Atur Budget Bulanan →" call-to-action
3. WHEN the user taps the edit icon on MonthlyBudgetCard, THE AddEditBudgetSheet SHALL open in monthly mode with the current limit pre-filled
4. WHEN the user taps the empty-state call-to-action, THE AddEditBudgetSheet SHALL open in monthly mode for creating a new monthly budget

### Requirement 3: CategoryBudgetList and CategoryBudgetRow

**User Story:** As a user, I want to see per-category budget progress individually, so that I know which spending areas are approaching their limits.

#### Acceptance Criteria

1. WHEN category budgets exist for the current month, THE CategoryBudgetList SHALL render one CategoryBudgetRow per category budget showing category emoji, category name, progress bar, used/limit amounts, and percentage
2. WHILE no category budgets exist for the current month, THE CategoryBudgetList SHALL display the empty state copy "Belum ada budget kategori. Yuk atur supaya lebih terkontrol 💫" with an add button
3. WHEN the user taps a CategoryBudgetRow, THE AddEditBudgetSheet SHALL open in category mode with that category and its current limit pre-filled
4. WHEN a category budget usage percentage is below 0.75, THE CategoryBudgetRow SHALL display the progress bar in accent-primary color
5. WHEN a category budget usage percentage is between 0.75 and 0.99 inclusive, THE CategoryBudgetRow SHALL display the progress bar in warning-soft color
6. WHEN a category budget usage percentage is 1.0 or above, THE CategoryBudgetRow SHALL display the progress bar in danger-soft color

### Requirement 4: AddEditBudgetSheet

**User Story:** As a user, I want a simple bottom sheet to set or edit my budgets, so that budget management feels lightweight and quick.

#### Acceptance Criteria

1. WHEN the AddEditBudgetSheet opens in monthly mode, THE AddEditBudgetSheet SHALL display the title "Atur Budget Bulanan" and show only the nominal input field
2. WHEN the AddEditBudgetSheet opens in category mode, THE AddEditBudgetSheet SHALL display the title "Atur Budget Kategori" and show both a category selector and a nominal input field
3. WHEN editing an existing budget, THE BudgetForm SHALL pre-fill the nominal field with the current limit value formatted as IDR
4. WHEN the user taps "Simpan Budget" and the save succeeds, THE AddEditBudgetSheet SHALL close and THE system SHALL display a success toast
5. IF a save operation fails, THEN THE AddEditBudgetSheet SHALL remain open, preserve the form data, and display a soft error toast

### Requirement 5: BudgetForm Validation

**User Story:** As a user, I want immediate feedback when my budget input is invalid, so that I can correct it before saving.

#### Acceptance Criteria

1. WHEN the nominal input value is zero or not a finite positive number, THE BudgetForm SHALL disable the save button and display the helper text "Nominalnya belum diisi nih."
2. WHEN the mode is category and no category is selected, THE BudgetForm SHALL disable the save button and display the helper text "Pilih kategori dulu ya."
3. WHEN the mode is category and the selected category is not a valid CategoryType, THE BudgetForm SHALL reject the submission and display "Kategori nggak valid."
4. WHEN all validation rules pass (positive nominal and valid category if required), THE BudgetForm SHALL enable the save button
5. WHEN the user types in the nominal field, THE BudgetForm SHALL apply formatIDR live formatting to the displayed value

### Requirement 6: Navigation Home → Budget → Home

**User Story:** As a user, I want to navigate to the budget page from Home and return easily, so that budgeting fits naturally into my dashboard flow.

#### Acceptance Criteria

1. WHEN the user taps "Lihat Budget →" on the HeroBudgetCard on the Home page, THE system SHALL navigate to `/budget` and render the BudgetDetailPage
2. WHEN the user taps the back arrow on BudgetHeader, THE system SHALL navigate back to `/home`
3. THE system SHALL NOT include a Budget entry in the bottom navigation bar

### Requirement 7: Soft Warning Generation

**User Story:** As a user, I want gentle reminders when a category budget is almost full, so that I stay aware without feeling stressed.

#### Acceptance Criteria

1. WHEN a category budget usage percentage is 0.80 or above but below 1.0, THE system SHALL generate a soft warning with the message "Budget [label] hampir penuh [emoji]"
2. WHEN a category budget usage percentage is 1.0 or above, THE system SHALL generate a soft warning with the message "Budget [label] sudah penuh [emoji]"
3. WHEN a category budget usage percentage is below 0.80, THE system SHALL NOT generate a soft warning for that category
4. THE system SHALL ensure all soft warning messages contain no exclamation marks, no all-caps words, and exactly one category-appropriate emoji at the end
5. WHEN displaying the most critical warning on the Home HeroBudgetCard, THE system SHALL select the category with the highest usage percentage among those at or above 0.80

### Requirement 8: Budget Compound Uniqueness

**User Story:** As a user, I want each category to have exactly one budget per month, so that my budget data stays consistent and predictable.

#### Acceptance Criteria

1. WHEN setCategoryBudget is called for a month and category that already has a budget, THE budgetStore SHALL update the existing record rather than creating a duplicate
2. FOR ALL months and categories, THE budgetRepo SHALL enforce that at most one budget record exists per (month, category) compound key
3. WHEN setCategoryBudget is called multiple times for the same month and category with different limits, THE budgetStore SHALL retain only the latest limit value

### Requirement 9: Monthly Budget Singleton

**User Story:** As a user, I want exactly one monthly budget per month, so that my total budget is always unambiguous.

#### Acceptance Criteria

1. WHEN setMonthlyBudget is called for a month that already has a monthly budget, THE budgetStore SHALL update the existing record rather than creating a duplicate
2. FOR ALL months, THE budgetRepo SHALL enforce that at most one monthly budget record exists per month
3. WHEN setMonthlyBudget is called multiple times for the same month with different totals, THE budgetStore SHALL retain only the latest total value

### Requirement 10: Month Isolation

**User Story:** As a user, I want each month's budget to be independent, so that a new month starts fresh without carrying over old limits or spending.

#### Acceptance Criteria

1. WHEN the current month changes, THE BudgetDetailPage SHALL query only budget records matching the new current month
2. WHEN a budget is set or updated for one month, THE budgetStore SHALL NOT modify budget records for any other month
3. WHILE no budgets exist for the current month, THE BudgetDetailPage SHALL display empty states regardless of budgets set in previous months

### Requirement 11: No Aggressive Copy

**User Story:** As a user, I want budget warnings and messages to feel supportive rather than stressful, so that budgeting stays a positive experience.

#### Acceptance Criteria

1. THE system SHALL ensure all user-facing budget messages use casual, soft Indonesian copy without exclamation marks or all-caps words
2. THE SoftWarningBadge SHALL NOT use danger-colored backgrounds or aggressive visual styling
3. THE system SHALL use emoji at the end of warning messages as gentle emphasis rather than alarm indicators

### Requirement 12: Budget Usage Calculation Correctness

**User Story:** As a user, I want budget calculations to be mathematically accurate, so that I can trust the numbers shown.

#### Acceptance Criteria

1. FOR ALL valid monthly budgets and transaction sets, THE getBudgetUsage function SHALL produce a result where `used + remaining = totalBudget`
2. FOR ALL valid category budgets and transaction sets, THE getCategoryBudgetUsage function SHALL sum only transactions matching both the budget's category AND month
3. FOR ALL budget usage calculations where the budget limit is greater than zero, THE system SHALL compute percentage as `used / limit` and allow values exceeding 1.0 when overspent
4. FOR ALL formatIDR and parseIDRInput operations on non-negative integers, THE system SHALL satisfy the round-trip property: `parseIDRInput(formatIDR(n)) === n`
5. FOR ALL percentage values including those above 1.0, THE BudgetProgressBar SHALL clamp visual fill width to a maximum of 100% of the container width
