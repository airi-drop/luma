# Requirements Document

## Introduction

Sprint 7 implements the Saving Goals feature on the Target page (route `/target`). Users can create visual saving goals with a title, target amount, emoji/icon, optional deadline, and optional note. They add contributions over time, watching progress bars fill until the goal is automatically marked completed when `currentAmount >= targetAmount`. The feature uses existing Sprint 2 data layer (`savingGoalStore` + `savingsRepo`), is separate from expense transactions, and follows Luma's soft, non-gamified tone.

## Glossary

- **TargetPage**: The main page for saving goals at route `/target`, shown as "Target" in BottomNav
- **SavingGoalCard**: Card component displaying a single saving goal with emoji, name, progress bar, amounts, optional deadline, and subtle character reaction
- **CreateGoalSheet**: Bottom sheet form for creating a new saving goal
- **GoalDetailSheet**: Bottom sheet showing full goal info, progress, and contribution history
- **AddContributionSheet**: Bottom sheet form for adding a savings contribution to a goal
- **SavingGoal**: Data model representing a saving goal with id, title, targetAmount, currentAmount, icon, deadline, note, status, timestamps
- **SavingGoalContribution**: Data model representing a single contribution with id, goalId, amount, date, note, createdAt
- **savingGoalStore**: Zustand store managing saving goal state (from Sprint 2)
- **savingsRepo**: Repository layer for IndexedDB access to saving goals and contributions (from Sprint 2)
- **getSavingGoalProgress**: Pure function calculating progress ratio, percentage, completion status, and remaining amount from a SavingGoal
- **clampProgress**: Pure function clamping `currentAmount / targetAmount` to [0, 1]
- **formatIDR**: Utility function from Sprint 3 formatting numbers as Indonesian Rupiah display strings
- **Progress**: Ratio of `currentAmount / targetAmount`, clamped to [0, 1] for visual display
- **Contribution**: A savings deposit added to a goal, atomically updating the goal's currentAmount

## Requirements

### Requirement 1: TargetPage Layout and Navigation

**User Story:** As a user, I want to access my saving goals from the bottom navigation, so that I can easily manage my savings targets.

#### Acceptance Criteria

1. WHEN a user taps "Target" in the BottomNav, THE system SHALL navigate to the `/target` route and render the TargetPage
2. THE TargetPage SHALL display a page header with title "Target"
3. WHEN active saving goals exist, THE TargetPage SHALL render a SavingGoalCard for each active goal
4. WHEN completed saving goals exist, THE TargetPage SHALL display them in a separate section below active goals
5. THE TargetPage SHALL subscribe to savingGoalStore and re-render when goal data changes

### Requirement 2: Empty State

**User Story:** As a new user with no saving goals, I want to see a friendly prompt, so that I know how to get started with savings targets.

#### Acceptance Criteria

1. WHEN no saving goals exist (neither active nor completed), THE TargetPage SHALL display the empty state message "Ada sesuatu yang lagi kamu pengen wujudkan?"
2. WHEN the empty state is displayed, THE TargetPage SHALL show a "Buat Target" CTA button
3. WHEN the user taps "Buat Target" in the empty state, THE system SHALL open the CreateGoalSheet

### Requirement 3: SavingGoalCard Display

**User Story:** As a user, I want to see my saving goals as visual cards with progress, so that I can quickly understand how close I am to each target.

#### Acceptance Criteria

1. THE SavingGoalCard SHALL display the goal's emoji/icon (24–32px)
2. THE SavingGoalCard SHALL display the goal's title (Card Title size, 16–18px, 700 weight)
3. THE SavingGoalCard SHALL display progress amounts as `formatIDR(currentAmount)` / `formatIDR(targetAmount)`
4. THE SavingGoalCard SHALL display a progress bar with width equal to `clampProgress(currentAmount, targetAmount) * 100%`
5. WHEN the goal has a deadline, THE SavingGoalCard SHALL display it in format "Target: DD MMM YYYY"
6. WHEN the goal status is "completed", THE SavingGoalCard SHALL display a "Target tercapai! 🎉" badge
7. WHEN the user taps a SavingGoalCard, THE system SHALL open the GoalDetailSheet for that goal

### Requirement 4: Create Saving Goal

**User Story:** As a user, I want to create a new saving goal with a name, target amount, and icon, so that I can start tracking my savings progress.

#### Acceptance Criteria

1. WHEN the user taps the "Buat Target" button (from empty state or add button), THE system SHALL open the CreateGoalSheet as a bottom sheet
2. THE CreateGoalSheet SHALL provide input fields for: nama target (title, required), target nominal (targetAmount, required), icon/emoji (required), deadline (optional), and note (optional)
3. WHEN the user submits a valid form, THE system SHALL create a new SavingGoal with currentAmount = 0 and status = "active"
4. WHEN the goal is created successfully, THE system SHALL close the sheet, show toast "Target dibuat! 🎯", and render the new SavingGoalCard
5. WHEN title is empty, THE system SHALL show validation error "Nama target belum diisi nih"
6. WHEN targetAmount is 0 or negative, THE system SHALL show validation error "Nominalnya belum diisi nih"
7. THE CreateGoalSheet SHALL persist the new goal via savingsRepo.createGoal

### Requirement 5: Goal Detail View

**User Story:** As a user, I want to view the full details of a saving goal including its contribution history, so that I can track my savings progress over time.

#### Acceptance Criteria

1. WHEN the GoalDetailSheet is opened, THE system SHALL display the goal's icon, title, and status badge
2. THE GoalDetailSheet SHALL display a progress bar with formatIDR amounts and percentage
3. WHEN the goal has a deadline, THE GoalDetailSheet SHALL display it
4. WHEN the goal has a note, THE GoalDetailSheet SHALL display it
5. THE GoalDetailSheet SHALL display the contribution history sorted by date descending
6. EACH contribution row SHALL display the date, amount formatted via formatIDR, and note (if set)
7. THE GoalDetailSheet SHALL display a "Tambah Tabungan" button for active goals

### Requirement 6: Add Contribution

**User Story:** As a user, I want to add savings contributions to my goals, so that I can record my progress toward each target.

#### Acceptance Criteria

1. WHEN the user taps "Tambah Tabungan" in GoalDetailSheet, THE system SHALL open the AddContributionSheet
2. THE AddContributionSheet SHALL provide input fields for: nominal (amount, required), date (default today), and note (optional)
3. WHEN the user submits a valid contribution, THE system SHALL atomically insert the contribution AND update goal.currentAmount via savingsRepo.addContribution
4. WHEN the contribution is added successfully, THE system SHALL close the sheet and show toast "Tabungan ditambah ✨"
5. WHEN amount is 0 or negative, THE system SHALL show validation error "Nominalnya belum diisi nih"
6. WHEN the contribution causes currentAmount >= targetAmount, THE system SHALL automatically set goal.status to "completed"
7. WHEN the goal becomes completed after a contribution, THE system SHALL show toast "Target tercapai! 🎉"

### Requirement 7: Progress Calculation

**User Story:** As a user, I want my saving goal progress to be accurately calculated and visually represented, so that I can trust the progress bar and percentage display.

#### Acceptance Criteria

1. THE getSavingGoalProgress function SHALL compute progress as `clamp(currentAmount / targetAmount, 0, 1)`
2. THE getSavingGoalProgress function SHALL compute percentage as `Math.round(progress * 100)` clamped to [0, 100]
3. THE getSavingGoalProgress function SHALL set isCompleted to true if and only if currentAmount >= targetAmount
4. THE getSavingGoalProgress function SHALL compute remaining as `Math.max(targetAmount - currentAmount, 0)`
5. THE clampProgress function SHALL return values monotonically non-decreasing as currentAmount increases
6. FOR all valid goals, THE progress value SHALL be in the range [0, 1]
7. FOR all valid goals, THE remaining value SHALL be >= 0

### Requirement 8: Goal Status Lifecycle

**User Story:** As a user, I want my saving goals to automatically complete when I reach the target, so that I get a sense of achievement without manual effort.

#### Acceptance Criteria

1. WHEN a new goal is created, THE system SHALL set its status to "active"
2. WHEN currentAmount >= targetAmount after a contribution, THE system SHALL automatically set status to "completed"
3. A goal with status "completed" SHALL NOT allow new contributions
4. A goal SHALL only transition from "active" to "completed" or from "active" to "archived"
5. THE system SHALL NOT allow transitions from "completed" back to "active"

### Requirement 9: Currency Formatting

**User Story:** As a user, I want all monetary amounts in saving goals displayed consistently in Indonesian Rupiah format, so that the interface is clear and familiar.

#### Acceptance Criteria

1. ALL monetary amounts in SavingGoalCard, GoalDetailSheet, and AddContributionSheet SHALL be formatted using formatIDR
2. THE formatIDR function SHALL display amounts in "RpX.XXX.XXX" format with dot separators
3. THE formatIDR function SHALL display "Rp0" for zero amounts

### Requirement 10: Character Reactions

**User Story:** As a user, I want subtle character reactions when I make savings progress, so that the app feels emotionally supportive without being gamified.

#### Acceptance Criteria

1. WHEN a goal is created, THE system MAY show a subtle happy character reaction
2. WHEN a contribution is added, THE system MAY show a subtle excited character reaction
3. WHEN a goal is completed, THE system SHALL show a celebration character reaction
4. Character reactions SHALL be optional and subtle — not challenge-based or gamified
5. Character reactions SHALL NOT block user interaction or delay workflows

### Requirement 11: Soft Indonesian Copy

**User Story:** As a user, I want the app to communicate with me in casual, supportive Indonesian, so that managing savings feels comfortable and non-intimidating.

#### Acceptance Criteria

1. THE empty state message SHALL be "Ada sesuatu yang lagi kamu pengen wujudkan?"
2. THE goal creation success toast SHALL be "Target dibuat! 🎯"
3. THE contribution success toast SHALL be "Tabungan ditambah ✨"
4. THE goal completion toast SHALL be "Target tercapai! 🎉"
5. Validation error messages SHALL use soft tone: "Nama target belum diisi nih", "Nominalnya belum diisi nih"
6. THE system SHALL NOT use aggressive or judgmental language in any saving goal interaction
