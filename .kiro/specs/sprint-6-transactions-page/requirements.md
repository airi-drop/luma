# Requirements Document

## Introduction

Sprint 6 implements the Transactions Page (`/transactions`) — the "Transaksi" tab in Luma's BottomNav. This page enables users to browse, search, filter, sort, edit, and delete their monthly transactions. All operations are client-side over locally stored IndexedDB data with no network calls. The page prioritizes readability and speed, using a cozy Indonesian tone consistent with Luma's identity.

## Glossary

- **TransactionsPage**: The main page component rendered at route `/transactions`, composing all sub-components for transaction browsing and management.
- **MonthSelector**: A navigation component allowing the user to move between months via prev/next arrows.
- **SearchBar**: A text input component that filters transactions by their `detail` field using debounced input.
- **CategoryFilterChips**: A horizontal scrollable row of toggle chips for filtering by transaction category.
- **AccountFilterChips**: A horizontal scrollable row of toggle chips for filtering by transaction account.
- **SortSelector**: A dropdown component for selecting one of four sort modes.
- **TransactionList**: A list component rendering filtered and sorted transactions using TransactionItem.
- **TransactionItem**: A reusable row component (from Sprint 4) displaying a single transaction's details.
- **EditTransactionSheet**: A BottomSheet containing ManualTransactionForm pre-filled in edit mode.
- **DeleteConfirmDialog**: A modal confirmation dialog shown before permanently deleting a transaction.
- **FilterEngine**: A pure-function module (`applyFilters`) that applies search, category filter, account filter, and sort to a transactions array.
- **formatIDR**: A formatting utility that renders numeric amounts as Indonesian Rupiah strings.
- **SortMode**: One of four sort options: "latest", "oldest", "highest", "lowest".
- **Transaction**: The core data entity containing id, detail, nominal, category, account, date, month, mood, note, source, createdAt, and updatedAt.

## Requirements

### Requirement 1: Page Layout and Composition

**User Story:** As a user, I want the Transactions page to present a clear, organized layout with month selection, search, filters, sorting, and a transaction list, so that I can efficiently browse and manage my transactions.

#### Acceptance Criteria

1. WHEN a user navigates to the `/transactions` route, THE TransactionsPage SHALL render the MonthSelector, SearchBar, CategoryFilterChips, AccountFilterChips, SortSelector, and TransactionList in vertical order.
2. THE TransactionsPage SHALL subscribe to the transactionStore for the selected month and current month's transactions.
3. WHEN the filtered transaction list is empty, THE TransactionsPage SHALL display an EmptyState component instead of the TransactionList.

---

### Requirement 2: Month Navigation

**User Story:** As a user, I want to navigate between months to view transactions from different periods, so that I can review my spending history.

#### Acceptance Criteria

1. WHEN the user taps the previous arrow in MonthSelector, THE MonthSelector SHALL navigate to the previous month.
2. WHEN the user taps the next arrow in MonthSelector AND the next month would not exceed the current real month, THE MonthSelector SHALL navigate to the next month.
3. WHEN the user taps the next arrow in MonthSelector AND the selected month is the current real month, THE MonthSelector SHALL disable forward navigation and remain on the current month.
4. WHEN a month navigation crosses a year boundary (e.g., January to previous), THE MonthSelector SHALL correctly compute the prior year's December.
5. WHEN the selected month changes, THE TransactionsPage SHALL load that month's transactions from the transactionStore.

---

### Requirement 3: Search with Debounce

**User Story:** As a user, I want to search my transactions by description text, so that I can quickly find specific entries without scrolling.

#### Acceptance Criteria

1. WHEN the user types in the SearchBar, THE SearchBar SHALL debounce the input for 300 milliseconds before applying the search query.
2. WHEN a debounced search query is applied, THE FilterEngine SHALL return only transactions whose `detail` field contains the query as a case-insensitive substring.
3. WHEN the search query is empty, THE FilterEngine SHALL treat search as inactive and return all transactions unfiltered by search.
4. WHEN the user clears the SearchBar via the clear button, THE SearchBar SHALL reset the search query to an empty string.

---

### Requirement 4: Category Filter Chips

**User Story:** As a user, I want to filter transactions by category using toggle chips, so that I can focus on specific spending areas.

#### Acceptance Criteria

1. WHEN no category chips are selected, THE FilterEngine SHALL treat the category filter as inactive and include all categories.
2. WHEN one or more category chips are selected, THE FilterEngine SHALL include only transactions whose `category` is in the set of selected categories (OR semantics within category).
3. WHEN the user taps an active category chip, THE CategoryFilterChips SHALL deselect that category and remove it from the filter.
4. WHEN the user taps an inactive category chip, THE CategoryFilterChips SHALL select that category and add it to the filter.

---

### Requirement 5: Account Filter Chips

**User Story:** As a user, I want to filter transactions by account using toggle chips, so that I can view spending from specific payment sources.

#### Acceptance Criteria

1. WHEN no account chips are selected, THE FilterEngine SHALL treat the account filter as inactive and include all accounts.
2. WHEN one or more account chips are selected, THE FilterEngine SHALL include only transactions whose `account` is in the set of selected accounts (OR semantics within account).
3. WHEN the user taps an active account chip, THE AccountFilterChips SHALL deselect that account and remove it from the filter.
4. WHEN the user taps an inactive account chip, THE AccountFilterChips SHALL select that account and add it to the filter.

---

### Requirement 6: Filter Composition (AND Between Filter Types)

**User Story:** As a user, I want search, category, and account filters to combine with AND logic, so that I can narrow results precisely.

#### Acceptance Criteria

1. WHEN multiple filter types are active simultaneously, THE FilterEngine SHALL apply AND logic between them — a transaction must pass search AND category AND account filters to appear in the result.
2. THE FilterEngine SHALL produce a result that is always a subset of (or equal to) the input transactions array.
3. THE FilterEngine SHALL not mutate the original transactions array.

---

### Requirement 7: Sort Modes

**User Story:** As a user, I want to sort my transactions by date or amount, so that I can view them in the order most useful to me.

#### Acceptance Criteria

1. THE SortSelector SHALL default to "latest" (newest first by createdAt) when the page loads.
2. WHEN sortMode is "latest", THE FilterEngine SHALL sort transactions in descending order of `createdAt`.
3. WHEN sortMode is "oldest", THE FilterEngine SHALL sort transactions in ascending order of `createdAt`.
4. WHEN sortMode is "highest", THE FilterEngine SHALL sort transactions in descending order of `nominal`.
5. WHEN sortMode is "lowest", THE FilterEngine SHALL sort transactions in ascending order of `nominal`.
6. THE FilterEngine SHALL preserve the same set of elements after sorting — no transactions are added or removed by sort.

---

### Requirement 8: Transaction List Rendering

**User Story:** As a user, I want to see my filtered and sorted transactions displayed as a scrollable list, so that I can scan my spending quickly.

#### Acceptance Criteria

1. THE TransactionList SHALL render one TransactionItem component per transaction in the filtered and sorted array.
2. WHEN the user taps a TransactionItem, THE TransactionList SHALL invoke the onEdit callback with that transaction.
3. THE TransactionItem SHALL display the transaction's category emoji, detail text, account label, formatted nominal via formatIDR, and mood badge.

---

### Requirement 9: Edit Transaction Sheet

**User Story:** As a user, I want to tap a transaction and edit its details in a bottom sheet form, so that I can correct mistakes without re-creating entries.

#### Acceptance Criteria

1. WHEN the user taps a transaction in the list, THE EditTransactionSheet SHALL open with the ManualTransactionForm pre-filled with that transaction's current values.
2. WHEN the user saves changes in the EditTransactionSheet, THE TransactionsPage SHALL update the transaction in the store and repository, preserving the original `id`, `createdAt`, and `source` fields.
3. WHEN the user saves changes, THE TransactionsPage SHALL set the `updatedAt` field to the current timestamp.
4. WHEN the user saves changes, THE EditTransactionSheet SHALL close and display a success toast reading "Transaksi diperbarui ✨".
5. WHEN the user taps the "Hapus Transaksi" button in the EditTransactionSheet, THE TransactionsPage SHALL open the DeleteConfirmDialog for that transaction.

---

### Requirement 10: Delete Confirmation Dialog

**User Story:** As a user, I want a confirmation dialog before deleting a transaction, so that I don't accidentally lose data.

#### Acceptance Criteria

1. WHEN the DeleteConfirmDialog opens, THE DeleteConfirmDialog SHALL display the title "Yakin mau hapus?" with the transaction's detail and nominal as context.
2. WHEN the user taps "Hapus" in the dialog, THE TransactionsPage SHALL permanently remove the transaction from the store and repository.
3. WHEN the user taps "Batal" in the dialog, THE DeleteConfirmDialog SHALL close without deleting and leave the EditTransactionSheet open.
4. WHEN a transaction is successfully deleted, THE TransactionsPage SHALL close both the dialog and the sheet, then display a toast reading "Transaksi dihapus ✨".

---

### Requirement 11: Empty States

**User Story:** As a user, I want clear feedback when there are no transactions to display, so that I understand the page is working and know what to do next.

#### Acceptance Criteria

1. WHEN the current month has no transactions at all, THE TransactionsPage SHALL display an EmptyState with message "Belum ada transaksi bulan ini. Yuk mulai catat! ✨".
2. WHEN active filters or search produce zero results but the month has transactions, THE TransactionsPage SHALL display an EmptyState with message "Tidak ada transaksi yang cocok."

---

### Requirement 12: Amount Formatting

**User Story:** As a user, I want all monetary amounts displayed in Indonesian Rupiah format, so that values are immediately readable.

#### Acceptance Criteria

1. THE TransactionItem SHALL format all nominal values using the formatIDR utility.
2. THE DeleteConfirmDialog SHALL format the transaction nominal using the formatIDR utility when showing the deletion preview.

---

### Requirement 13: No Network Calls

**User Story:** As a user, I want the Transactions page to work entirely offline, so that I can manage my finances without internet connectivity.

#### Acceptance Criteria

1. THE TransactionsPage SHALL perform all data operations (read, filter, search, sort, edit, delete) exclusively against local IndexedDB storage without any network requests.
2. IF an IndexedDB operation fails, THEN THE TransactionsPage SHALL display an error toast and preserve the current UI state without attempting network fallback.
