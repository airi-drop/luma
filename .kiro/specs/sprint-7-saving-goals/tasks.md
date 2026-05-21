# Implementation Plan: Sprint 7 — Saving Goals

## Overview

Implement the Target page with saving goals feature. The approach builds foundation-first: pure calculation functions → validation helpers → atomic UI components (SavingGoalCard) → bottom sheet forms (Create, AddContribution) → GoalDetail sheet → full page composition → integration tests. Property-based tests validate the 8 correctness properties defined in the design using fast-check.

## Tasks

- [ ] 1. Implement saving goal calculation functions
  - [ ] 1.1 Implement getSavingGoalProgress function
    - Create `src/lib/saving-calc.ts`
    - Export `SavingGoalProgress` interface: `{ progress, percentage, isCompleted, remaining }`
    - Export `clampProgress(current: number, target: number): number` — returns `Math.min(Math.max(current / target, 0), 1)`
    - Implement `getSavingGoalProgress(goal)`: progress = clamp(currentAmount/targetAmount, 0, 1), percentage = Math.round(progress * 100), isCompleted = currentAmount >= targetAmount, remaining = Math.max(targetAmount - currentAmount, 0)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [ ]* 1.2 Write property test for progress clamping
    - **Property 1: Progress clamping**
    - For all goals where targetAmount > 0 and currentAmount >= 0: getSavingGoalProgress(goal).progress ∈ [0, 1]
    - Use fast-check `fc.nat()` for currentAmount and `fc.integer({ min: 1 })` for targetAmount
    - Create test file `src/lib/__tests__/saving-calc.property.test.ts`
    - **Validates: Requirement 7.6**

  - [ ]* 1.3 Write property test for progress monotonicity
    - **Property 2: Progress monotonicity**
    - For all pairs (g1, g2) with same targetAmount where g1.currentAmount ≤ g2.currentAmount: progress(g1) ≤ progress(g2)
    - Use fast-check to generate goal pairs with controlled currentAmount ordering
    - Append to `src/lib/__tests__/saving-calc.property.test.ts`
    - **Validates: Requirement 7.5**

  - [ ]* 1.4 Write property test for completion correctness
    - **Property 3: Completion correctness**
    - For all goals: isCompleted === true iff currentAmount >= targetAmount
    - Test both directions of the biconditional
    - Append to `src/lib/__tests__/saving-calc.property.test.ts`
    - **Validates: Requirement 7.3**

  - [ ]* 1.5 Write property test for remaining non-negativity
    - **Property 4: Remaining non-negativity**
    - For all goals where targetAmount > 0 and currentAmount >= 0: remaining >= 0
    - Include cases where currentAmount > targetAmount (over-saved)
    - Append to `src/lib/__tests__/saving-calc.property.test.ts`
    - **Validates: Requirement 7.7**

  - [ ]* 1.6 Write property test for contribution additivity
    - **Property 5: Contribution additivity**
    - For all (currentAmount, contributionAmount) where both > 0: currentAmount + contributionAmount === newCurrentAmount
    - Verify the arithmetic identity holds across random pairs
    - Append to `src/lib/__tests__/saving-calc.property.test.ts`
    - **Validates: Requirement 6.3**

  - [ ]* 1.7 Write property test for progress percentage identity
    - **Property 7: Progress percentage identity**
    - For all goals: percentage === Math.round(clampProgress(currentAmount, targetAmount) * 100)
    - Verify percentage is always integer and in [0, 100]
    - Append to `src/lib/__tests__/saving-calc.property.test.ts`
    - **Validates: Requirement 7.2**

- [ ] 2. Implement validation functions
  - [ ] 2.1 Implement validateCreateGoalInput function
    - Create `src/features/savings/validation.ts`
    - Export `ValidationResult` type: `{ valid: true } | { valid: false; errors: string[] }`
    - Validate: title not empty (error: "Nama target belum diisi nih"), title max 50 chars, targetAmount > 0 (error: "Nominalnya belum diisi nih"), icon not empty
    - Use soft Indonesian copy for all error messages
    - _Requirements: 4.5, 4.6, 11.5_

  - [ ] 2.2 Implement validateContributionInput function
    - Append to `src/features/savings/validation.ts`
    - Validate: amount > 0 (error: "Nominalnya belum diisi nih"), date is valid YYYY-MM-DD, date not in future
    - _Requirements: 6.5, 11.5_

- [ ] 3. Implement SavingGoalCard component
  - [ ] 3.1 Implement SavingGoalCard component
    - Create `src/components/cards/SavingGoalCard.tsx`
    - Left: emoji/icon (24–32px)
    - Title: goal name (Card Title, 16–18px, 700)
    - Progress amounts: `formatIDR(currentAmount)` / `formatIDR(targetAmount)` (Body, text-secondary)
    - Progress bar: full width, height 8px, radius 4px, bg-card-soft track, accent-primary fill
    - Width = `clampProgress(currentAmount, targetAmount) * 100%`
    - Optional deadline: Caption size, text-muted, "Target: DD MMM YYYY" (use date-fns format)
    - Completed badge: "Target tercapai! 🎉" when status = "completed"
    - Active goals: show percentage text next to progress bar
    - Card: radius 24px, padding 20px, bg-card
    - Tap handler: calls onTap(goal.id)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ] 4. Implement CreateGoalSheet
  - [ ] 4.1 Implement CreateGoalSheet bottom sheet component
    - Create `src/components/sheets/CreateGoalSheet.tsx`
    - Use BottomSheet component from Sprint 1
    - Form fields: title (text input), targetAmount (number input), icon/emoji (preset grid of common emojis: 🎧🎮✈️💻🏠🎓📱👟🎁🏖️💍🚗), deadline (date picker, optional), note (textarea, optional)
    - Default icon: first emoji in grid if user doesn't pick
    - Validation on submit using validateCreateGoalInput
    - Show inline error messages below invalid fields
    - CTA: "Simpan Target" (primary button)
    - On success: close sheet, call savingGoalStore.createGoal, show toast "Target dibuat! 🎯"
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 11.2_

- [ ] 5. Implement AddContributionSheet
  - [ ] 5.1 Implement AddContributionSheet bottom sheet component
    - Create `src/components/sheets/AddContributionSheet.tsx`
    - Use BottomSheet component from Sprint 1
    - Form fields: amount (number input), date (date picker, default today), note (textarea, optional)
    - Validation on submit using validateContributionInput
    - Show inline error messages below invalid fields
    - CTA: "Simpan" (primary button)
    - On success: close sheet, call savingGoalStore.addContribution(goalId, input), show toast "Tabungan ditambah ✨"
    - If goal becomes completed: show additional toast "Target tercapai! 🎉"
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 11.3, 11.4_

- [ ] 6. Checkpoint — Core components complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement GoalDetailSheet
  - [ ] 7.1 Implement GoalDetailSheet bottom sheet component
    - Create `src/components/sheets/GoalDetailSheet.tsx`
    - Header section: icon + title + status badge ("Aktif" / "Tercapai 🎉")
    - Progress section: progress bar + formatIDR(currentAmount) / formatIDR(targetAmount) + percentage text
    - Deadline display (if set): "Target: DD MMM YYYY"
    - Note display (if set)
    - "Tambah Tabungan" CTA button (only for active goals)
    - Contribution history: list sorted by date descending
    - Each contribution row: date (formatted), amount (formatIDR), note (if set)
    - Completed state: show celebration visual, hide "Tambah Tabungan" button
    - Reads goal and contributions from savingGoalStore
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 8.3_

- [ ] 8. Implement TargetPage composition
  - [ ] 8.1 Implement TargetPage with all sections and store subscriptions
    - Create or update `src/pages/TargetPage.tsx`
    - Subscribe to savingGoalStore for goals list
    - Filter goals: active (status = "active") and completed (status = "completed")
    - Render active goals as SavingGoalCard list
    - Render completed goals in separate collapsed section (if any)
    - Empty state: when no goals at all, show message + "Buat Target" CTA
    - "Buat Target" button (visible when goals exist, e.g. a secondary button or small FAB)
    - Wire CreateGoalSheet open/close state
    - Wire GoalDetailSheet open/close state with selectedGoalId
    - Wire AddContributionSheet open/close from within GoalDetailSheet
    - Verify BottomNav shows "Target" tab as active
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 9.1, 9.2, 9.3_

- [ ] 9. Implement character reactions (optional/subtle)
  - [ ] 9.1 Implement subtle character reactions for saving goal events
    - Create `src/features/savings/reactions.ts` with `getGoalCharacterReaction(goal, justContributed)` function
    - Optionally render small character emoji/reaction in SavingGoalCard for completed goals
    - Keep reactions subtle — no blocking animations, no modal popups
    - Can be a small emoji near the progress bar or in toast messages
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 10. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 11. Write integration tests for TargetPage
  - [ ]* 11.1 Write integration tests for TargetPage rendering and interactions
    - Create test file `src/pages/__tests__/TargetPage.integration.test.tsx`
    - Test full page render with mocked store (active goals, completed goals)
    - Test empty state renders when no goals exist
    - Test create goal flow: open sheet → fill form → submit → verify new card appears
    - Test validation: submit empty form → verify error messages
    - Test add contribution flow: open detail → tap "Tambah Tabungan" → fill → submit → verify progress updates
    - Test automatic completion: add contribution that causes currentAmount >= targetAmount → verify completed state
    - Test that completed goals do not show "Tambah Tabungan" button
    - Test store reactivity: add goal → verify list re-renders
    - _Requirements: 1.3, 1.5, 2.1, 4.4, 6.3, 6.6, 8.3_

  - [ ]* 11.2 Write property test for goal status transitions
    - **Property 6: Status transition validity**
    - For all goal status sequences: only "active" → "completed" and "active" → "archived" are valid transitions
    - Verify completed goals cannot revert to active
    - Create test file `src/features/savings/__tests__/status.property.test.ts`
    - **Validates: Requirements 8.1, 8.2, 8.4, 8.5**

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check
- Character reactions (task 9) are intentionally subtle per product direction — no gamification
- The savingsRepo.addContribution operation must be atomic (insert contribution + update goal amount in single IndexedDB transaction)
- All currency amounts use `formatIDR` from Sprint 3's `src/lib/format.ts`
- Existing Sprint 2 data layer (`savingGoalStore`, `savingsRepo`) is reused — no new stores or repos needed
- Empty state copy and toast messages follow soft Indonesian tone per AGENTS.md guidelines

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "2.2"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4", "1.5", "1.6", "1.7", "3.1"] },
    { "id": 2, "tasks": ["4.1", "5.1"] },
    { "id": 3, "tasks": ["7.1"] },
    { "id": 4, "tasks": ["8.1"] },
    { "id": 5, "tasks": ["9.1"] },
    { "id": 6, "tasks": ["11.1", "11.2"] }
  ]
}
```
