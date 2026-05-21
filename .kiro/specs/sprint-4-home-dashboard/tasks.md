# Implementation Plan: Sprint 4 — Home Dashboard + Budget Overview

## Overview

Implement the HomePage as Luma's personal cozy finance dashboard. The approach builds foundation-first: pure helper functions → atomic UI components → composite cards → page header → full page composition → integration tests. Property-based tests validate the 10 correctness properties defined in the design using fast-check.

## Tasks

- [ ] 1. Implement helper functions (getCharacterState, getGreeting, getBudgetUsage)
  - [ ] 1.1 Implement getCharacterState function
    - Create `src/lib/character.ts`
    - Export `CharacterState` type: `"happy" | "chill" | "worried" | "panic"`
    - Implement threshold logic: <0.5 → happy, <0.75 → chill, <1.0 → worried, ≥1.0 → panic
    - Handle edge case: if input is 0 (no budget set), return "happy"
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 1.2 Write property test for character state monotonicity
    - **Property 1: Character state monotonicity**
    - For all pairs (p1, p2) where p1 < p2, stateIndex(getCharacterState(p1)) ≤ stateIndex(getCharacterState(p2))
    - Use fast-check `fc.float` to generate random percentage pairs
    - Create test file `src/lib/__tests__/character.property.test.ts`
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

  - [ ]* 1.3 Write property test for character state completeness
    - **Property 9: Character state completeness**
    - For all p ≥ 0, getCharacterState(p) ∈ {"happy", "chill", "worried", "panic"}
    - Verify no undefined/null return paths for any non-negative input
    - Append to `src/lib/__tests__/character.property.test.ts`
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

  - [ ] 1.4 Implement getGreeting function
    - Create `src/lib/greeting.ts`
    - Implement time-based logic: 5–10 → "Selamat pagi", 11–14 → "Selamat siang", 15–17 → "Selamat sore", else → "Selamat malam"
    - Function takes hour (0–23) as parameter for testability
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 1.5 Write property test for greeting totality
    - **Property 6: Greeting totality**
    - For all integers h ∈ [0, 23], getGreeting(h) returns a non-empty string that is one of the four valid greetings
    - Use fast-check `fc.integer({ min: 0, max: 23 })` to generate all valid hours
    - Create test file `src/lib/__tests__/greeting.property.test.ts`
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

  - [ ] 1.6 Implement getBudgetUsage function
    - Create `src/lib/budget-calc.ts`
    - Export `BudgetUsage` interface: `{ totalBudget, used, remaining, percentage }`
    - Compute used via getMonthlyTotal, remaining = totalBudget - used, percentage = used / totalBudget
    - Percentage can exceed 1.0 (overspent); remaining can be negative
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]* 1.7 Write property test for budget identity
    - **Property 2: Budget identity**
    - For all valid (budget, transactions) pairs where budget.totalBudget > 0: remaining + used === totalBudget
    - Use fast-check arbitraries to generate random budgets and transaction arrays
    - Create test file `src/lib/__tests__/budget-calc.property.test.ts`
    - **Validates: Requirements 9.1, 9.2, 9.4**

  - [ ]* 1.8 Write property test for monthly total non-negativity
    - **Property 3: Monthly total non-negativity**
    - For all transaction arrays (including empty): getMonthlyTotal(transactions) ≥ 0
    - Use fast-check to generate arrays of transactions with positive nominals
    - Create test file `src/lib/__tests__/calc.property.test.ts`
    - **Validates: Requirement 9.5**

  - [ ]* 1.9 Write property test for today total ≤ monthly total
    - **Property 4: Today total ≤ Monthly total**
    - For all transaction arrays of the current month: getTodayTotal(transactions) ≤ getMonthlyTotal(transactions)
    - Generate transactions with mixed dates (some today, some other days)
    - Append to `src/lib/__tests__/calc.property.test.ts`
    - **Validates: Requirement 7.5**

  - [ ]* 1.10 Write property test for top category dominance
    - **Property 5: Top category dominance**
    - For all non-empty transaction arrays: if getTopCategory returns { category: C, total: T }, then for every other category C', sum(C') ≤ T
    - Append to `src/lib/__tests__/calc.property.test.ts`
    - **Validates: Requirement 7.6**

  - [ ]* 1.11 Write property test for formatIDR round-trip
    - **Property 8: formatIDR round-trip**
    - For all non-negative integers n ∈ [0, 999_999_999_999]: parseIDR(formatIDR(n)) === n
    - Implement parseIDR helper in test file if not already existing
    - Create test file `src/lib/__tests__/format.property.test.ts`
    - **Validates: Requirement 10.2**

- [ ] 2. Implement ProgressRing component
  - [ ] 2.1 Implement ProgressRing SVG component
    - Create `src/components/ui/ProgressRing.tsx`
    - SVG-based circular progress with configurable size (default 64px) and strokeWidth (default 6)
    - Color logic: <0.75 → accent-primary (amber), 0.75–0.99 → warning-soft, ≥1.0 → danger-soft
    - Visually clamp fill to max 100% even when percentage exceeds 1.0
    - Display percentage text centered: "N%" format (DM Sans, 14px, 700)
    - Animate on mount from 0 to target via Framer Motion
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 2.2 Write property test for progress ring visual clamping
    - **Property 10: Progress ring visual clamping**
    - For all percentage values (including those exceeding 1.0): rendered visual fill equals min(percentage, 1.0)
    - Test the clamping logic function (extract as pure helper for testability)
    - Create test file `src/components/ui/__tests__/ProgressRing.property.test.ts`
    - **Validates: Requirement 6.4**

- [ ] 3. Implement CharacterDisplay component
  - [ ] 3.1 Implement CharacterDisplay component
    - Create `src/components/character/CharacterDisplay.tsx`
    - Accept props: `state: CharacterState`, `size: "small" | "medium" | "large"`, `className?`
    - Read `settingsStore.activeCharacterId` to determine character pack
    - Render `<img>` with sizing: large = 120–160px, medium = 80px, small = 48px
    - Fallback to emoji placeholder if asset fails to load (🦦 for otter, 🐱 for cat)
    - Entrance animation via Framer Motion: scale 0.9→1, opacity 0→1, spring
    - _Requirements: 5.6, 5.7_

- [ ] 4. Implement TransactionItem component
  - [ ] 4.1 Implement TransactionItem component
    - Create `src/components/cards/TransactionItem.tsx`
    - Left: category emoji icon from map (Food→🍜, Transport→🚗, Entertainment→🎬, Shopping→🛍️, Health→💊, Giving→💝, Saving→🏦, Other→📝)
    - Middle: detail text (single line truncate), account chip below (Micro Label, bg-card-soft, radius 8px)
    - Right: nominal via formatIDR (Body 700), mood badge below if set
    - Row height 56–64px, vertical center aligned
    - 1px bg-card-soft divider between items (not after last)
    - _Requirements: 8.2_

- [ ] 5. Checkpoint — Core components complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement card components (HeroBudgetCard, QuickStats, RecentTransactions)
  - [ ] 6.1 Implement HeroBudgetCard component
    - Create `src/components/cards/HeroBudgetCard.tsx`
    - Compose CharacterDisplay (large) + ProgressRing + budget amounts
    - Display "Sisa" + formatIDR(remaining) large (Fraunces, 36–44px) and "Terpakai" + formatIDR(used) secondary
    - "Lihat Budget →" shortcut link navigating to `/budget`
    - Empty state when hasBudget=false: character "happy", "Belum ada budget bulan ini.", "Atur Budget →" link
    - Card styling: radius 28–32px, padding 24px, bg-card
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3_

  - [ ] 6.2 Implement QuickStats component
    - Create `src/components/cards/QuickStats.tsx`
    - Three mini-cards in a flex row (gap 8–12px)
    - Each card: bg-card-soft, radius 16px, padding 12px
    - Labels: "Bulan ini" / "Hari ini" / "Top kategori"
    - Values: formatIDR(monthlyTotal), formatIDR(todayTotal), category name or "—" when null
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ] 6.3 Implement RecentTransactions component
    - Create `src/components/cards/RecentTransactions.tsx`
    - Card with title "Transaksi Terakhir" (Section Title size)
    - Render TransactionItem children for each transaction (max 5)
    - Empty state: "Belum ada transaksi. Yuk mulai catat! ✨"
    - _Requirements: 8.1, 8.3_

  - [ ]* 6.4 Write property test for recent transactions limit
    - **Property 7: Recent transactions limit**
    - For all transaction arrays of any length: after sorting and slicing, result length ≤ 5
    - Use fast-check to generate arrays of varying sizes (0 to 100+)
    - Create test file `src/components/cards/__tests__/RecentTransactions.property.test.ts`
    - **Validates: Requirement 8.1**

- [ ] 7. Implement HomeHeader component
  - [ ] 7.1 Implement HomeHeader component
    - Create `src/components/layout/HomeHeader.tsx`
    - Display greeting (from getGreeting) + userName
    - Settings gear icon on right, navigates to `/settings`
    - Use text-primary for greeting, text-secondary for date line
    - Height 56px, padding inline 20px
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 8. Compose full HomePage
  - [ ] 8.1 Compose HomePage with all sections and store subscriptions
    - Update `src/pages/HomePage.tsx` from Sprint 1 placeholder to full dashboard
    - Subscribe to transactionStore, budgetStore, settingsStore
    - Derive all calculations: getMonthlyTotal, getTodayTotal, getTopCategory, getBudgetUsage, getCharacterState
    - Sort transactions by createdAt descending, slice to 5 for recent list
    - Compose: HomeHeader → HeroBudgetCard → QuickStats → RecentTransactions
    - Handle empty states (no budget, no transactions)
    - Verify FAB positioning (Sprint 3) does not overlap BottomNav
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 10.1, 10.3, 10.4, 11.1, 11.2_

- [ ] 9. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 10. Write integration tests for HomePage
  - [ ]* 10.1 Write integration tests for HomePage rendering and interactions
    - Create test file `src/pages/__tests__/HomePage.integration.test.tsx`
    - Test full page render with mocked stores (budget set, transactions exist)
    - Test empty states (no budget, no transactions)
    - Test store reactivity: add transaction → verify QuickStats and RecentTransactions update
    - Test navigation: tap "Lihat Budget →" → verify router navigates to `/budget`
    - Test "Atur Budget →" CTA in empty state navigates to `/budget`
    - Test FAB positioning above BottomNav
    - _Requirements: 1.1, 1.3, 3.5, 4.3, 10.3, 10.4, 11.1, 11.3_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- All currency amounts use `formatIDR` from Sprint 3's `src/lib/format.ts`
- CharacterState type and getCharacterState are exported from `src/lib/character.ts` for reuse across features
- ProgressRing and CharacterDisplay are reusable components used inside HeroBudgetCard

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.4", "1.6"] },
    { "id": 1, "tasks": ["1.2", "1.5", "1.7", "1.8", "1.11", "2.1", "4.1"] },
    { "id": 2, "tasks": ["1.3", "1.9", "2.2", "3.1", "6.2", "7.1"] },
    { "id": 3, "tasks": ["1.10", "6.1", "6.3", "6.4"] },
    { "id": 4, "tasks": ["8.1"] },
    { "id": 5, "tasks": ["10.1"] }
  ]
}
```
