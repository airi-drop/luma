# Implementation Plan: Sprint 1 — Design Foundation

## Overview

Convert the feature design into a series of prompts for a code-generation LLM that will implement each step with incremental progress. Make sure that each prompt builds on the previous prompts, and ends with wiring things together. There should be no hanging or orphaned code that isn't integrated into a previous step. Focus ONLY on tasks that involve writing, modifying, or testing code.

This plan delivers the Sprint 1 visual shell and reusable UI primitives in dependency order: testing infrastructure first, then small leaf primitives (Button, Input, Card, Header), then layout shell (PageWrapper, BottomNav), then the two compound primitives with formal correctness properties (BottomSheet, Toast/ToastProvider), and finally integration tests that exercise composition. Property-based tests with `fast-check` validate the Toast queue (capacity, duration clamp, pause/resume, idempotence) and accessibility properties (44px tap targets, focus management, scroll lock).

Implementation language: **TypeScript + React** (per workspace tech steering). Components live under `src/components/layout/` and `src/components/ui/`.

## Tasks

- [ ] 1. Set up Vitest + Testing Library + fast-check toolchain
  - Install dev dependencies: `vitest`, `@vitest/ui`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`, `fast-check`
  - Add `vitest.config.ts` with `environment: "jsdom"`, `setupFiles` for `@testing-library/jest-dom` and a `matchMedia` mock helper
  - Add `src/test/setup.ts` exporting helpers: `mockReducedMotion(value: boolean)`, `measureComputedHeight(el)`, and a `renderWithRouter` wrapper for components that depend on `react-router-dom`
  - Add npm scripts: `"test": "vitest --run"`, `"test:watch": "vitest"`, `"test:ui": "vitest --ui"`
  - _Validates: Requirements 16.1, 16.2, 16.3, 16.4, 16.5, 16.6_

- [ ] 2. Build the focus-trap utility
  - [ ] 2.1 Implement `src/lib/focus-trap.ts`
    - Export `installFocusTrap(root: HTMLElement): { uninstall: () => void }`
    - Capture `Tab` and `Shift+Tab` keydown events, cycle focus through descendants matched by the standard focusable selector
    - Export `findFirstFocusable(root: HTMLElement): HTMLElement | null`
    - Export `isInDocument(el: Element | null): boolean`
    - _Validates: Requirements 7.3, 7.4, 7.7_

  - [ ]* 2.2 Write unit tests for focus-trap
    - Test focus cycles forward and backward inside the trap
    - Test `findFirstFocusable` skips disabled and `tabindex=-1` nodes
    - Test `uninstall` removes the keydown listener
    - _Validates: Requirements 7.3, 7.4_

- [ ] 3. Build the `useReducedMotion` hook wrapper
  - Implement `src/lib/use-reduced-motion.ts` re-exporting Framer Motion's `useReducedMotion` with a small `prefersReducedMotion(): boolean` helper for non-React call sites (e.g., gesture listeners)
  - _Validates: Requirements 16.1, 16.2, 16.3, 16.4, 16.5, 16.6_

- [ ] 4. Implement the `Button` primitive
  - [ ] 4.1 Implement `src/components/ui/Button.tsx`
    - Render native `<button>` with `type` defaulting to `"button"`
    - Variants `primary` (52px, radius 999), `secondary` (52px, radius 999, border), `ghost` (44px, radius 16), `fab` (≥56px, radius 999, ≥44px wide)
    - Support `loading` (sets `aria-busy="true"` and `disabled`), `disabled`, `leftIcon`, `rightIcon`, `iconOnly`, `fullWidth`
    - Apply Framer Motion `whileTap={{ scale: 0.97 }}` only when `!prefersReducedMotion`
    - Dev-only `console.warn` when `iconOnly && !ariaLabel`
    - Use only Tailwind utility classes mapped to CSS variables — no hex literals
    - _Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 17.1, 17.2, 19.1, 19.2_

  - [ ]* 4.2 Write property test for Button tap target floor
    - **Property 3: Button minimum tap target**
    - Use `fast-check` to generate every (variant, size) pair from `oneof("primary","secondary","ghost","fab") × oneof("md","lg")` plus `iconOnly: boolean`
    - Render each combination, assert computed `height >= 44` and (when `iconOnly`) `width >= 44`
    - **Validates: Requirements 5.3, 5.4, 5.5, 17.1, 17.2**

  - [ ]* 4.3 Write unit tests for Button states
    - `loading` sets `aria-busy="true"` and `disabled`
    - `disabled` prevents `onClick` from firing
    - `iconOnly && !ariaLabel` triggers `console.warn` in dev
    - `prefers-reduced-motion: reduce` disables tap-scale animation
    - _Validates: Requirements 5.6, 5.7, 5.8, 5.10, 16.2_

- [ ] 5. Implement the `Input` primitive
  - [ ] 5.1 Implement `src/components/ui/Input.tsx`
    - Render `<label htmlFor={id}>` linked to `<input id={id}>`; auto-generate stable id via `useId()` when not provided
    - Sizes `md` (52px) and `lg` (56px); radius 16; `bg-bg-card-soft` background
    - Helper text + error text in a single slot below the input; error wins when both are set
    - Set `aria-invalid="true"` when `errorText` is set; set `aria-describedby` to helper or error element id
    - Forward `name`, `type`, `inputMode`, `value`, `defaultValue`, `placeholder`, `required`, `autoFocus`, `onChange`, `onBlur`
    - `labelHidden` keeps label in DOM with `sr-only` utility class
    - No hex literals in component code
    - _Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 17.3, 19.1, 19.2_

  - [ ]* 5.2 Write property test for Input label-input linkage
    - **Property 18: Input label-input linkage**
    - Use `fast-check` to generate arbitrary `label`, optional `id`, optional `helperText`, optional `errorText`, optional `labelHidden`
    - Render and assert `<label>.htmlFor === <input>.id` and that id is non-empty
    - **Validates: Requirements 6.1, 6.2**

  - [ ]* 5.3 Write unit tests for Input error/helper precedence
    - **Property 19: Input error overrides helper**
    - When both `errorText` and `helperText` are set, only error text is rendered, `aria-invalid="true"`, `aria-describedby` references the error element id
    - When only `helperText` is set, `aria-describedby` references the helper element id
    - `required` sets both the `required` HTML attribute and `aria-required="true"`
    - `labelHidden` keeps label visible to screen readers
    - _Validates: Requirements 6.5, 6.6, 6.7, 6.8, 6.9_

  - [ ]* 5.4 Write property test for Input tap target
    - **Property 4: Input minimum tap target**
    - Generate `size: oneof("md","lg")`; assert computed height equals 52 or 56 respectively
    - **Validates: Requirements 6.3, 6.4, 17.3**

- [ ] 6. Implement the `Card` primitive
  - [ ] 6.1 Implement `src/components/ui/Card.tsx`
    - Variants `base` (radius 24, padding 20, `bg-bg-card`, soft shadow), `hero` (radius 28, larger padding), `soft` (radius 24, `bg-bg-card-soft`, no shadow)
    - Padding map: `sm`=12, `md`=20 (default), `lg`=24, `none`=0
    - Render as `<div>` by default; render as `<button type="button">` when `asButton`
    - Mount animation via `motion.div`: `opacity 0→1`, `y 8→0`, ~280ms ease-out, gated on `animateOnMount && !prefersReducedMotion`
    - Enforce minimum 44px tap height when `asButton`
    - No hex literals in component code
    - _Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 17.4, 19.1, 19.2_

  - [ ]* 6.2 Write unit tests for Card variants and interactive mode
    - **Property 17: Card asButton produces native button**
    - Each variant applies the expected token classes
    - `asButton={true}` renders a `<button type="button">` and is keyboard-focusable
    - `asButton={true}` enforces height ≥ 44px
    - Mount animation runs by default; skipped when reduced motion is active (Property 16)
    - _Validates: Requirements 4.1, 4.4, 4.5, 4.6, 4.7, 4.8, 16.1, 17.4_

- [ ] 7. Implement the `Header` component
  - [ ] 7.1 Implement `src/components/layout/Header.tsx`
    - Wrap content in a `<header>` landmark
    - Render `greeting` inside an `<h1>` (Fraunces, 24–28px, weight 700) when present
    - Render `subtitle` in muted secondary color below greeting
    - Render `rightSlot` aligned to end of header row
    - When `leftSlot` is provided, render it in place of greeting+subtitle
    - No background fill; inherit parent layer
    - _Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 7.2 Write unit tests for Header semantics
    - `<header>` landmark renders
    - `greeting` is inside an `<h1>`
    - `rightSlot` renders aligned end
    - `leftSlot` replaces greeting+subtitle pair when both `leftSlot` and `greeting` are provided
    - _Validates: Requirements 3.1, 3.2, 3.4, 3.5_

- [ ] 8. Checkpoint — leaf primitives
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Polish `BottomNav`
  - [ ] 9.1 Implement `src/components/layout/BottomNav.tsx`
    - Define `NAV_ITEMS` exactly: Home `/home`, Transaksi `/transactions`, Target `/target`, Laporan `/reports`
    - Compile-time assertion (or static const guard) that no `to` equals `/settings` or `/budget`
    - Wrap in `<nav aria-label="Navigasi utama">`
    - Each item is a `<NavLink>` with `aria-current="page"` when active, minimum 44×44 tap target
    - Active pill uses Framer Motion shared `layoutId="bottom-nav-pill"`; disable layout animation under reduced motion
    - Fixed to bottom of viewport, max-width 480px, centered
    - Indonesian labels exactly: `Home`, `Transaksi`, `Target`, `Laporan`
    - _Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 16.5, 17.5, 18.1, 18.2_

  - [ ]* 9.2 Write property test for BottomNav route correctness
    - **Property 5: BottomNav active state correctness**
    - Use `fast-check` to pick `r ∈ {"/home","/transactions","/target","/reports"}`; mount with router at `r`; assert exactly one `<NavLink>` has `aria-current="page"` and its `to === r`
    - **Property 6: BottomNav excludes Settings and Budget**
    - Static assertion: for all `i` in `NAV_ITEMS`, `i.to ∉ {"/settings","/budget"}`
    - **Validates: Requirements 2.1, 2.2, 2.3**

  - [ ]* 9.3 Write unit tests for BottomNav tap targets and reduced motion
    - **Property 3 / 17.5: 44×44 tap target on each nav item**
    - Reduced motion disables shared `layoutId` animation
    - Indonesian labels are present exactly
    - _Validates: Requirements 2.5, 2.6, 16.5, 17.5, 18.1, 18.2_

- [ ] 10. Finalize `PageWrapper`
  - [ ] 10.1 Implement `src/components/layout/PageWrapper.tsx`
    - Render Layer 0 (solid `--bg-main`), Layer 1 (`<img>` only when `backgroundUrl`), Layer 2 (`filter: blur(Npx)` on the image element only), Layer 3 (gradient overlay with opacity ≥ 0.3 when image present), Layer 4 (decorative blobs with `aria-hidden="true"` and `pointer-events: none`), Layer 5 (content), Layer 6 (`BottomNav` when `showBottomNav !== false`)
    - Outer wrapper has `max-width: 480px`, centered horizontally
    - Reserve `pb-24` when bottom nav is shown
    - Decorative blob drift animation (8–12s ease-in-out infinite); disabled under reduced motion
    - Image `onError` silently hides Layer 1; Layer 0 keeps app readable
    - No hex literals in component code
    - _Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 16.6, 19.1, 19.2_

  - [ ]* 10.2 Write property test for PageWrapper layering and overlay enforcement
    - **Property 2: Mobile container width**
    - Generate arbitrary children/title/header combinations; assert outer `getComputedStyle().maxWidth === "480px"`
    - **Property 20: Gradient overlay enforced when background image present**
    - Generate arbitrary `backgroundUrl` (string) and `overlayOpacity ∈ [0, 1]`; when `backgroundUrl` is non-empty, assert overlay element exists and computed opacity ≥ 0.3
    - **Validates: Requirements 1.1, 1.2, 1.3**

  - [ ]* 10.3 Write unit tests for PageWrapper edge cases
    - Decorative blobs have `aria-hidden="true"` and `pointer-events: none`
    - `showBottomNav={false}` does not render `<BottomNav />`
    - Reduced motion disables blob drift animation
    - No hex literal appears in component file (static grep test)
    - _Validates: Requirements 1.6, 1.8, 1.9, 1.10, 16.6, 19.1_

- [ ] 11. Checkpoint — layout shell
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement `BottomSheet`
  - [ ] 12.1 Implement `src/components/ui/BottomSheet.tsx`
    - Render via `createPortal` into `document.body`; mount only while open or exiting
    - Root has `role="dialog"`, `aria-modal="true"`; `aria-labelledby` to title id when `title` provided, else `aria-label="Lembar bawah"`
    - Backdrop `bg-black/50 backdrop-blur-sm`; sheet `rounded-t-[28px] bg-bg-card`, max-height 90vh
    - Body scroll lock on open: save `window.scrollY`, set `body.style.position="fixed"`, `top="-Ypx"`, `left="0"`, `right="0"`, `width="100%"`
    - On close exit-complete: restore body styles, `window.scrollTo(0, savedScrollY)`, restore focus to opener if still in document, unmount portal content
    - Install focus trap on open (after `requestAnimationFrame`) using `src/lib/focus-trap.ts`; focus first focusable inside sheet
    - Drag handle: `role="button"`, `aria-label="Tarik untuk menutup"`, `tabindex={0}`; close button (when `showClose`): `aria-label="Tutup"`
    - Idempotent close: subsequent calls during exit are no-ops
    - Motion timings per design (sheet 300ms ease-out enter, 250ms ease-in exit; backdrop 250ms / 200ms)
    - _Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11, 8.8, 8.9, 8.10, 9.1, 9.2, 9.3, 9.4, 18.3, 18.4, 18.5_

  - [ ] 12.2 Implement BottomSheet dismissal handlers
    - Backdrop tap → `onOpenChange(false)` when `dismissOnBackdropTap !== false`
    - `Escape` keydown on document → `onOpenChange(false)` when `dismissOnEscape !== false`
    - Drag end (Framer Motion `onDragEnd`) on handle area: dismiss when `offset.y > 100` OR `velocity.y > 500`, but only when `dismissOnDragDown !== false`
    - Disable drag listener entirely when reduced motion is active
    - _Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [ ]* 12.3 Write property test for BottomSheet scroll lock and focus restore
    - **Property 7: Body scroll lock invariant**
    - Use `fast-check` to generate arbitrary initial `scrollY ∈ [0, 5000]`; open and close the sheet; assert `body.style.position === "fixed"` while open and `=== ""` after close, and `Math.abs(window.scrollY - initialScrollY) <= 1`
    - **Property 8: Focus management**
    - After open, `document.activeElement` is a descendant of sheet root; after close, `document.activeElement === opener`
    - **Validates: Requirements 7.2, 7.3, 7.4, 7.5, 7.6, 7.7**

  - [ ]* 12.4 Write unit tests for BottomSheet dismissal flags
    - **Property 9: Dismiss flags are honored**
    - With `dismissOnBackdropTap=false`, backdrop tap never calls `onOpenChange(false)`
    - With `dismissOnEscape=false`, Esc key never calls `onOpenChange(false)`
    - With `dismissOnDragDown=false`, drag past threshold never calls `onOpenChange(false)`
    - Reduced motion disables drag listener entirely
    - Indonesian default labels exactly: `Tutup`, `Tarik untuk menutup`, `Lembar bawah`
    - Idempotent close during exit animation does not double-restore body or focus
    - _Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.10, 18.3, 18.4, 18.5_

  - [ ]* 12.5 Write unit tests for BottomSheet motion timings
    - Mock `prefers-reduced-motion: reduce`; assert transforms are instant and only opacity animates over ~100ms
    - With motion enabled, assert Framer Motion `transition` props match design timings (300ms / 250ms / 200ms)
    - _Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 16.3_

- [ ] 13. Checkpoint — BottomSheet
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Implement `Toast` and `ToastProvider`
  - [ ] 14.1 Implement `src/components/ui/Toast.tsx`
    - Render single toast card with variant accent stripe (left 4px): `success`, `error`, `info`
    - Card: `bg-bg-card`, radius 16, padding 14×16, soft shadow
    - Mouse `onMouseEnter`/`onFocus` → `onPause(id)`; `onMouseLeave`/`onBlur` → `onResume(id)`
    - Close button has `aria-label="Tutup notifikasi"`; clicking calls `onDismiss(id)`
    - When variant is `error`, render with `role="alert"`
    - Render message as text node only — never `dangerouslySetInnerHTML`
    - Enter/exit motion `y: ±16, opacity 0↔1` over 200ms; reduced motion animates opacity only
    - _Validates: Requirements 14.3, 14.4, 14.5, 15.1, 15.2, 15.3, 16.4, 18.7_

  - [ ] 14.2 Implement `src/components/ui/ToastProvider.tsx` queue and timers
    - Internal `ToastQueueState` with `toasts`, `timers: Map<id, TimerHandle>`, `remaining: Map<id, number>`, `pausedAt: Map<id, number>`
    - `showToast(input)` → generate id, clamp duration to `[1500, 8000]`, evict oldest while `toasts.length >= maxVisible` (FIFO), insert, schedule dismiss
    - `dismissToast(id)` is idempotent: clear timer if present, delete from all four collections, filter from `toasts`
    - `pauseToast(id)` clears timer and stores remaining = `max(0, duration - (now - startedAt))`
    - `resumeToast(id)` either dismisses immediately (when remaining ≤ 0) or schedules a fresh timer for the stored remaining
    - `useEffect` cleanup on unmount clears every pending `setTimeout`
    - Default `maxVisible=3`, `defaultDuration=3000`
    - Throw `Error("useToast must be used inside <ToastProvider>")` from `useToast` when context is absent
    - _Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 11.1, 11.2, 11.3, 11.4, 12.1, 12.2, 12.3, 12.4, 13.1, 13.2, 13.3, 13.4_

  - [ ] 14.3 Implement `ToastProvider` portal region
    - Render a portal region with `role="region"`, `aria-label="Notifikasi"`
    - `aria-live="polite"` for `success` and `info` toasts; `aria-live="assertive"` when any visible toast has variant `error`
    - Position top-center with `safe-area-inset-top`, max-width matches mobile container, vertical 8px gap, AnimatePresence wraps the list
    - Idle path renders the empty region (no portal children) for screen readers
    - _Validates: Requirements 14.1, 14.2, 14.3, 18.6_

  - [ ]* 14.4 Write property test for Toast duration clamp
    - **Property 11: Toast duration clamping**
    - Use `fast-check` to generate `D` from `oneof(integer({min: -10000, max: 20000}), constant(undefined))`; call `showToast({ duration: D })`; inspect scheduled timer; assert effective duration is `clamp(D ?? defaultDuration, 1500, 8000)`
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4**

  - [ ]* 14.5 Write property test for Toast queue capacity
    - **Property 12: Capacity invariant**
    - Use `fast-check` to generate `maxVisible ∈ [1, 5]` and arbitrary command sequences `Array<{ kind: "show" | "dismiss", duration?: number, idIndex?: number }>`
    - Run sequence on `ToastProvider`; after each step assert `state.toasts.length <= maxVisible` and that eviction follows FIFO
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4**

  - [ ]* 14.6 Write property test for Toast pause/resume preservation
    - **Property 13: Pause + resume preserves remaining time**
    - Use Vitest fake timers + `fast-check`: generate `D ∈ [1500, 8000]` and `e ∈ [0, D]`; show, advance `e` ms, pause, advance arbitrary `gap`, resume, advance `D - e + 50`; assert toast is gone, and assert with `gap` substituted that toast was alive at `D - e - 50` after resume
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.4**

  - [ ]* 14.7 Write property test for Toast dismiss idempotence
    - **Property 14: dismissToast is idempotent**
    - Use `fast-check` to generate arbitrary toast ids and a count `n ∈ [0, 5]`; call `dismissToast(id)` `n` times; assert final state has no entry with that id in `toasts`, `timers`, `remaining`, or `pausedAt`
    - **Validates: Requirements 13.1, 13.2**

  - [ ]* 14.8 Write unit tests for Toast accessibility and motion
    - **Property 15: Indonesian copy on user-facing labels**
    - Toast region has `role="region"` and `aria-label="Notifikasi"`
    - `error` variant toast renders with `role="alert"` and bumps region `aria-live` to `"assertive"`
    - Close button `aria-label === "Tutup notifikasi"`
    - Reduced motion animates opacity only (no `y` translation)
    - _Validates: Requirements 14.1, 14.2, 14.3, 14.4, 15.3, 16.4, 18.6, 18.7_

  - [ ]* 14.9 Write unit tests for `useToast` provider boundary
    - Calling `useToast` outside `ToastProvider` throws `Error("useToast must be used inside <ToastProvider>")`
    - Provider unmount clears all pending `setTimeout` handles (verify via fake timers + spy)
    - _Validates: Requirements 13.3, 13.4_

- [ ] 15. Checkpoint — Toast subsystem
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Wire components together at app root
  - [ ] 16.1 Update `src/app/providers.tsx` to mount `<ToastProvider maxVisible={3} defaultDuration={3000}>` above the router
    - Re-export `useToast` from a single barrel `src/components/ui/index.ts`
    - _Validates: Requirements 14.1, 20.4_

  - [ ] 16.2 Add a static lint rule / test for hex-color ban and presentation-only boundary
    - Static test: `grep` over `src/components/**/*.{ts,tsx}` for `/#([0-9a-fA-F]{3}){1,2}\b/` — fail if any match
    - Static test: `grep` over `src/components/**/*.{ts,tsx}` for `from "src/db/`, `from "../db/`, `from "src/stores/`, `from "../stores/`, and direct `indexedDB` references — fail if any match
    - **Property 1: No hardcoded hex in component code**
    - _Validates: Requirements 19.1, 19.2, 20.1, 20.2, 20.3, 20.4_

  - [ ]* 16.3 Write integration test: PageWrapper + BottomNav + Header
    - Mount a Home placeholder using `PageWrapper`, `Header`, and a `Card`
    - Click each nav item; assert active link `aria-current="page"` updates and pill animates (or snaps under reduced motion)
    - Assert outer wrapper computed `max-width === "480px"`
    - _Validates: Requirements 1.2, 2.3, 2.4, 3.1, 3.2_

  - [ ]* 16.4 Write integration test: BottomSheet + Button + Input + Toast
    - Mount a fake "Add Transaksi" sheet with an `Input` and a primary `Button`
    - Open via Button click; assert focus moves inside sheet and body is scroll-locked
    - Type into Input; submit triggers `showToast({ message: "Tercatat ya ✨", variant: "success" })`
    - Close via backdrop tap, Esc, and drag-down (each in its own sub-case); assert focus returns to opener and body scroll restores
    - Assert toast appears with `aria-live="polite"` and auto-dismisses at default duration (fake timers)
    - _Validates: Requirements 7.2, 7.3, 7.7, 8.1, 8.3, 8.5, 10.5, 14.1, 14.2_

- [ ] 17. Final checkpoint — full Sprint 1 suite
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP, but every correctness property in `design.md` has a paired optional test sub-task.
- Each task references specific requirements via `_Validates: Requirements X.Y_`; property test sub-tasks additionally call out the design Property number.
- Property tests use `fast-check` + Vitest fake timers; example-based tests use Testing Library + `userEvent` v14.
- Components are presentation-only — no `src/db/**` or `src/stores/**` imports; the static lint rule in 16.2 enforces this.
- All user-facing copy is Indonesian and matches Property 15 strings exactly.
- Reduced motion is honored across every animated component (Property 16); tests mock `matchMedia`.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1"] },
    { "id": 1, "tasks": ["2.2", "4.1", "5.1", "6.1", "7.1"] },
    { "id": 2, "tasks": ["4.2", "4.3", "5.2", "5.3", "5.4", "6.2", "7.2", "9.1", "10.1"] },
    { "id": 3, "tasks": ["9.2", "9.3", "10.2", "10.3", "12.1"] },
    { "id": 4, "tasks": ["12.2"] },
    { "id": 5, "tasks": ["12.3", "12.4", "12.5", "14.1", "14.2"] },
    { "id": 6, "tasks": ["14.3"] },
    { "id": 7, "tasks": ["14.4", "14.5", "14.6", "14.7", "14.8", "14.9", "16.1", "16.2"] },
    { "id": 8, "tasks": ["16.3", "16.4"] }
  ]
}
```
