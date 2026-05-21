# Requirements Document

## Introduction

Sprint 1 — Design Foundation builds the visual shell and reusable UI primitive set for Luma, the cozy customizable finance space. It finalizes `PageWrapper` (layered background: solid color → optional image → blur → mandatory gradient overlay → decorative blobs → content → bottom nav), polishes `BottomNav` with an animated active pill across the four fixed tabs (Home, Transaksi, Target, Laporan), and introduces presentation-only primitives: `Header`, `Card` (variants base/hero/soft), `Button` (variants primary/secondary/fab/ghost), `Input` (label-above with helper/error states), `BottomSheet` (portal, scroll-lock, focus trap, multi-path dismissal), and `Toast` + `ToastProvider` (capacity-bounded queue, clamped duration, pause/resume, idempotent dismiss).

These components are presentation-only — they consume props and CSS variables, never IndexedDB or Zustand. They must respect `prefers-reduced-motion`, meet a 44px minimum tap target, expose correct ARIA semantics, and ship with Indonesian default copy. Every requirement below maps to one or more correctness properties in `design.md` so Sprint 1 implementations cannot regress visual layering, motion, or accessibility behavior in later sprints.

## Glossary

- **PageWrapper**: Top-level mobile shell component that renders the layered background and conditionally mounts the bottom nav.
- **BottomNav**: Fixed bottom navigation rendering exactly four tabs (Home, Transaksi, Target, Laporan).
- **Header**: Page-level header containing greeting, subtitle, and an optional right-slot action button.
- **Card**: Reusable presentational container with `base`, `hero`, and `soft` variants.
- **Button**: Reusable button component supporting `primary`, `secondary`, `ghost`, and `fab` variants.
- **Input**: Form input with label-above pattern and helper/error text slot.
- **BottomSheet**: Portal-based modal sheet sliding up from the bottom edge of the viewport.
- **ToastProvider**: React context provider that owns the toast queue, timers, and portal region.
- **Toast**: Single message card rendered by the provider with success, error, or info variant.
- **Toast_Queue_State**: Internal state owned by `ToastProvider` containing `toasts`, `timers`, `remaining`, and `pausedAt` collections.
- **Effective_Duration**: The duration (in ms) actually scheduled for a toast after clamping.
- **Reduced_Motion**: User preference detected via `window.matchMedia("(prefers-reduced-motion: reduce)").matches === true`.
- **Tap_Target**: The interactive box of an element measured by computed CSS height and width.
- **Opener_Element**: The DOM element that held focus when a `BottomSheet` was opened, restored on close.
- **Mobile_Container**: The mobile canvas with `max-width: 480px`, centered horizontally.
- **Focus_Trap**: Mechanism that constrains keyboard focus to descendants of a target element while active.
- **Indonesian_Copy**: User-facing default text strings written in Indonesian.

## Requirements

### Requirement 1: PageWrapper Layered Background and Mobile Container

**User Story:** As a Luma user, I want every page to use the same cozy layered background and mobile-first canvas, so that the app feels consistent and readable across screens.

#### Acceptance Criteria

1. THE PageWrapper SHALL render layers in this exact stacking order from back to front: bg-main solid color, optional background image, optional blur on the image, gradient overlay, decorative blob layer, main content slot, and bottom nav.
2. THE PageWrapper SHALL render its outermost wrapper with computed `max-width` equal to 480px and centered horizontally.
3. WHERE `backgroundUrl` is provided, THE PageWrapper SHALL render the gradient overlay layer with computed opacity greater than or equal to 0.3.
4. WHERE `backgroundUrl` is not provided, THE PageWrapper SHALL render only the solid bg-main color, blob decoration, and content layers.
5. WHERE `backgroundBlur` is provided, THE PageWrapper SHALL apply the blur as a CSS `filter: blur(Npx)` on the image element only and not on any ancestor that contains content.
6. THE PageWrapper SHALL render decorative blob elements with attribute `aria-hidden="true"` and CSS `pointer-events: none`.
7. WHEN `showBottomNav` is omitted or true, THE PageWrapper SHALL render the BottomNav component and reserve bottom padding sufficient to prevent content from being hidden under it.
8. IF `showBottomNav` is false, THEN THE PageWrapper SHALL NOT render the BottomNav.
9. WHILE Reduced_Motion is active, THE PageWrapper SHALL NOT animate the decorative blob layer.
10. THE PageWrapper SHALL NOT use any hardcoded hex color literal in its component code; all colors SHALL be applied via CSS variable utility classes.

*Validates: Property 1, Property 2, Property 16, Property 20*

### Requirement 2: BottomNav Composition and Active State

**User Story:** As a Luma user, I want the bottom navigation to always show exactly Home, Transaksi, Target, and Laporan with a clear active indicator, so that I always know where I am in the app.

#### Acceptance Criteria

1. THE BottomNav SHALL render exactly four navigation items in this exact order: Home (`/home`), Transaksi (`/transactions`), Target (`/target`), and Laporan (`/reports`).
2. FOR every entry in the bottom navigation list, THE BottomNav SHALL ensure the route path is not equal to `/settings` and not equal to `/budget`.
3. WHEN the current router location matches the path of one of the four nav items, THE BottomNav SHALL set attribute `aria-current="page"` on exactly that one nav link and on no other.
4. THE BottomNav SHALL render an animated active pill behind the active item using a Framer Motion shared `layoutId` so the pill smoothly transitions between items on route change.
5. WHILE Reduced_Motion is active, THE BottomNav SHALL render the active pill at the active item position without layout animation.
6. THE BottomNav SHALL render each nav item with a computed Tap_Target of at least 44px height and at least 44px width.
7. THE BottomNav SHALL be wrapped in a `<nav>` landmark with `aria-label="Navigasi utama"`.
8. THE BottomNav SHALL render label text in Indonesian: `Home`, `Transaksi`, `Target`, and `Laporan`.
9. THE BottomNav SHALL be fixed to the bottom of the viewport, centered, with the same Mobile_Container max-width as PageWrapper.

*Validates: Property 5, Property 6, Property 15, Property 16*

### Requirement 3: Header Layout and Semantics

**User Story:** As a Luma user, I want each page to have a clear personal header with greeting and optional actions, so that the page feels personal and easy to scan.

#### Acceptance Criteria

1. THE Header SHALL render its content inside a `<header>` landmark element.
2. WHERE `greeting` is provided, THE Header SHALL render the greeting text inside an `<h1>` element.
3. WHERE `subtitle` is provided, THE Header SHALL render the subtitle text in muted secondary text color below the greeting.
4. WHERE `rightSlot` is provided, THE Header SHALL render the slot content aligned to the end of the header row.
5. WHERE `leftSlot` is provided, THE Header SHALL render `leftSlot` in place of the greeting and subtitle pair.
6. THE Header SHALL NOT render its own background fill; it SHALL inherit the PageWrapper layer behind it.

*Validates: Property 1, Property 15*

### Requirement 4: Card Variants and Interactive Mode

**User Story:** As a Luma developer composing pages, I want a single Card primitive with variants and interactive mode, so that hero cards, transaction cards, and tappable cards all share consistent shape and motion.

#### Acceptance Criteria

1. THE Card SHALL accept variant values `base`, `hero`, and `soft` and SHALL apply the corresponding background, radius, and shadow tokens defined in the design system.
2. THE Card SHALL accept padding values `sm` (12px), `md` (20px), `lg` (24px), and `none` (0).
3. WHEN `padding` is omitted, THE Card SHALL apply 20px inner padding.
4. WHEN `asButton` is true, THE Card SHALL render as a native `<button>` element with type defaulting to `"button"` and SHALL be keyboard-focusable.
5. WHEN `asButton` is false or omitted, THE Card SHALL render as a `<div>` element.
6. WHEN `asButton` is true, THE Card SHALL render with a computed Tap_Target height of at least 44px.
7. WHEN `animateOnMount` is true and Reduced_Motion is not active, THE Card SHALL run a mount animation that fades opacity from 0 to 1 and translates Y by 8px to 0 over approximately 280ms.
8. WHILE Reduced_Motion is active, THE Card SHALL skip the mount animation entirely (no Y offset, no opacity transition).
9. THE Card SHALL NOT use any hardcoded hex color literal in its component code.

*Validates: Property 1, Property 16, Property 17*

### Requirement 5: Button Variants, Sizes, and States

**User Story:** As a Luma developer building forms and FABs, I want one Button primitive that covers primary, secondary, ghost, and FAB shapes with consistent sizing and loading state, so that interactive controls feel uniform across the app.

#### Acceptance Criteria

1. THE Button SHALL accept variant values `primary`, `secondary`, `ghost`, and `fab` and SHALL apply the corresponding background, color, radius, and weight tokens defined in the design system.
2. THE Button SHALL render the underlying element as a native HTML `<button>` with `type` defaulting to `"button"`.
3. THE Button SHALL render with a computed Tap_Target height of at least 44px for every variant and size combination.
4. WHEN `variant="primary"` and `size="md"`, THE Button SHALL render with a computed height of 52px.
5. WHEN `variant="fab"`, THE Button SHALL render with a computed height of at least 56px and a computed width of at least 44px.
6. WHEN `loading` is true, THE Button SHALL set attribute `aria-busy="true"` and SHALL set the underlying `disabled` attribute.
7. WHEN `disabled` is true, THE Button SHALL set the underlying `disabled` attribute and SHALL NOT trigger `onClick` on user interaction.
8. WHEN `iconOnly` is true and `aria-label` is missing or empty, THE Button SHALL emit a developer warning via `console.warn` in development builds.
9. WHEN Reduced_Motion is not active, THE Button SHALL apply a tap-scale animation of approximately `scale(0.97)` on press over 150–200ms.
10. WHILE Reduced_Motion is active, THE Button SHALL NOT apply the tap-scale animation.
11. THE Button SHALL NOT use any hardcoded hex color literal in its component code.

*Validates: Property 1, Property 3, Property 16*

### Requirement 6: Input Label, States, and Tap Target

**User Story:** As a Luma user filling out forms, I want every input to have a visible label above the field and clear helper or error feedback, so that I always understand what to enter and what went wrong.

#### Acceptance Criteria

1. THE Input SHALL render a `<label>` element whose `htmlFor` attribute equals the `id` attribute of the underlying `<input>`, and that `id` SHALL be a non-empty string.
2. WHEN `id` is not provided, THE Input SHALL auto-generate a stable non-empty `id` and use it on both the label and input.
3. WHEN `size="md"` or `size` is omitted, THE Input SHALL render the input element with a computed height of exactly 52px.
4. WHEN `size="lg"`, THE Input SHALL render the input element with a computed height of exactly 56px.
5. WHEN `errorText` is set, THE Input SHALL set attribute `aria-invalid="true"` on the input element and SHALL set `aria-describedby` to reference the id of the rendered error text element.
6. WHEN `errorText` is set, THE Input SHALL render only the error text below the input and SHALL NOT render the helper text, even if `helperText` is also provided.
7. WHEN only `helperText` is provided and `errorText` is unset, THE Input SHALL set `aria-describedby` to reference the id of the rendered helper text element.
8. WHEN `required` is true, THE Input SHALL set both the `required` HTML attribute and `aria-required="true"`.
9. WHEN `labelHidden` is true, THE Input SHALL keep the `<label>` element in the DOM but visually hide it using a screen-reader-only utility class.
10. THE Input SHALL apply the `bg-bg-card-soft` token for the field background.
11. THE Input SHALL NOT use any hardcoded hex color literal in its component code.

*Validates: Property 1, Property 4, Property 18, Property 19*

### Requirement 7: BottomSheet Portal, Scroll Lock, and Focus

**User Story:** As a Luma user opening sheets like Add Transaction, I want the sheet to feel modal — locking the page behind, trapping focus, and restoring my position when I close it — so that the interaction feels safe and predictable.

#### Acceptance Criteria

1. WHEN `open` becomes true, THE BottomSheet SHALL mount its content into `document.body` via a React portal.
2. WHEN `open` becomes true, THE BottomSheet SHALL lock body scroll by setting `document.body.style.position` to `"fixed"` and SHALL preserve the scroll position so it can be restored on close.
3. WHEN the open animation completes, THE BottomSheet SHALL ensure `document.activeElement` is a descendant of the sheet root.
4. WHEN the open animation completes, THE BottomSheet SHALL store a reference to the Opener_Element that held focus immediately before opening.
5. WHEN `open` becomes false and the exit animation completes, THE BottomSheet SHALL restore `document.body.style.position` to an empty string.
6. WHEN `open` becomes false and the exit animation completes, THE BottomSheet SHALL restore the window scroll position to within 1 pixel of the value captured at open time.
7. WHEN `open` becomes false and the exit animation completes AND the Opener_Element is still in the document, THE BottomSheet SHALL move focus back to the Opener_Element.
8. WHEN `open` becomes false and the exit animation completes, THE BottomSheet SHALL unmount its portal content.
9. THE BottomSheet root element SHALL have `role="dialog"` and `aria-modal="true"`.
10. WHERE `title` is provided, THE BottomSheet SHALL set `aria-labelledby` to reference the title element id.
11. WHERE `title` is not provided, THE BottomSheet SHALL set `aria-label="Lembar bawah"` on the dialog root.

*Validates: Property 7, Property 8, Property 15*

### Requirement 8: BottomSheet Dismissal Paths

**User Story:** As a Luma user, I want clear ways to dismiss a sheet — backdrop tap, drag-down, Esc key, and close button — and I want the developer to be able to disable any of those paths per sheet, so that destructive flows are not closed accidentally.

#### Acceptance Criteria

1. WHEN the user taps the backdrop AND `dismissOnBackdropTap` is true or omitted, THE BottomSheet SHALL invoke `onOpenChange(false)`.
2. IF `dismissOnBackdropTap` is false, THEN THE BottomSheet SHALL NOT invoke `onOpenChange(false)` in response to backdrop taps.
3. WHEN the user presses the Escape key AND `dismissOnEscape` is true or omitted, THE BottomSheet SHALL invoke `onOpenChange(false)`.
4. IF `dismissOnEscape` is false, THEN THE BottomSheet SHALL NOT invoke `onOpenChange(false)` in response to Escape key presses.
5. WHEN the user drags the handle area downward by more than 100 pixels OR releases the drag with downward velocity greater than 500 pixels per second AND `dismissOnDragDown` is true or omitted, THE BottomSheet SHALL invoke `onOpenChange(false)`.
6. IF `dismissOnDragDown` is false, THEN THE BottomSheet SHALL NOT invoke `onOpenChange(false)` in response to drag-down gestures past the threshold.
7. WHILE Reduced_Motion is active, THE BottomSheet SHALL disable drag-down gestures at the gesture-listener level.
8. WHERE `showClose` is true or omitted, THE BottomSheet SHALL render a close button with `aria-label="Tutup"`.
9. THE BottomSheet SHALL render its drag handle with `role="button"`, `aria-label="Tarik untuk menutup"`, and `tabindex="0"`.
10. WHEN `closeBottomSheet` is invoked while a previous close transition is already in progress, THE BottomSheet SHALL treat the call as a no-op and SHALL NOT double-restore body scroll or focus.

*Validates: Property 9, Property 15, Property 16*

### Requirement 9: BottomSheet Motion Timings

**User Story:** As a Luma user, I want sheets to feel cozy and soft when they open and close, so that the interaction matches the warm aesthetic of the app.

#### Acceptance Criteria

1. WHEN `open` becomes true and Reduced_Motion is not active, THE BottomSheet SHALL animate the sheet vertical translation from 100 percent to 0 over approximately 300 milliseconds using cubic-bezier ease-out.
2. WHEN `open` becomes true and Reduced_Motion is not active, THE BottomSheet SHALL animate backdrop opacity from 0 to 1 over approximately 250 milliseconds.
3. WHEN `open` becomes false and Reduced_Motion is not active, THE BottomSheet SHALL animate the sheet vertical translation from 0 to 100 percent over approximately 250 milliseconds using cubic-bezier ease-in.
4. WHEN `open` becomes false and Reduced_Motion is not active, THE BottomSheet SHALL animate backdrop opacity from 1 to 0 over approximately 200 milliseconds.
5. WHILE Reduced_Motion is active, THE BottomSheet SHALL apply transform transitions instantly and SHALL animate only opacity over a brief duration of approximately 100 milliseconds.

*Validates: Property 16*

### Requirement 10: Toast Auto-Dismiss and Duration Clamp

**User Story:** As a Luma user, I want soft confirmation toasts that disappear on their own after a sensible amount of time, so that they never get stuck on screen and never disappear too quickly to read.

#### Acceptance Criteria

1. WHEN `showToast` is invoked with `duration` value `D` where `D` is in the range 1500 to 8000 milliseconds inclusive, THE ToastProvider SHALL set the Effective_Duration of that toast to exactly `D`.
2. IF `showToast` is invoked with `duration` value `D` where `D` is less than 1500, THEN THE ToastProvider SHALL set the Effective_Duration of that toast to exactly 1500.
3. IF `showToast` is invoked with `duration` value `D` where `D` is greater than 8000, THEN THE ToastProvider SHALL set the Effective_Duration of that toast to exactly 8000.
4. WHEN `showToast` is invoked without a `duration` value, THE ToastProvider SHALL set the Effective_Duration to the configured `defaultDuration` of the provider.
5. WHEN a toast is displayed without user interaction, THE ToastProvider SHALL remove the toast from the visible queue at approximately Effective_Duration milliseconds after creation, within a scheduling tolerance of plus or minus 50 milliseconds.

*Validates: Property 10, Property 11*

### Requirement 11: Toast Queue Capacity and FIFO Eviction

**User Story:** As a Luma user, I want at most a small number of toasts visible at once even when many events fire in quick succession, so that the screen never gets overwhelmed.

#### Acceptance Criteria

1. THE ToastProvider SHALL accept a `maxVisible` configuration value of at least 1 with a default of 3.
2. THE ToastProvider SHALL maintain the invariant that the length of the visible toasts list is less than or equal to `maxVisible` at all times.
3. WHEN `showToast` is invoked AND the visible toasts list length is greater than or equal to `maxVisible`, THE ToastProvider SHALL dismiss the oldest visible toast in FIFO order before inserting the new toast.
4. WHEN a toast is evicted by the capacity rule, THE ToastProvider SHALL remove its id from the timers, remaining, and pausedAt collections in the Toast_Queue_State.

*Validates: Property 12*

### Requirement 12: Toast Pause and Resume

**User Story:** As a Luma user reading a toast, I want it to pause its dismiss countdown while I am hovering or focused on it, so that I always have time to finish reading.

#### Acceptance Criteria

1. WHEN the user hovers or focuses inside a visible toast, THE ToastProvider SHALL pause that toast's auto-dismiss timer and SHALL store the remaining time computed as the original Effective_Duration minus the elapsed time since the timer started.
2. WHEN the user leaves hover and focus on a paused toast, THE ToastProvider SHALL resume the auto-dismiss timer scheduled for the previously stored remaining time.
3. WHEN a toast is paused at elapsed time `e` with original Effective_Duration `D`, and resumed at time `t_resume` without further interaction, THE ToastProvider SHALL remove the toast at approximately `t_resume + (D - e)` milliseconds, within a scheduling tolerance of plus or minus 50 milliseconds.
4. IF the stored remaining time is less than or equal to 0 when resume is invoked, THEN THE ToastProvider SHALL dismiss the toast immediately.

*Validates: Property 13*

### Requirement 13: Toast Dismiss Idempotence and Cleanup

**User Story:** As a Luma developer, I want `dismissToast` to be safe to call multiple times for the same id, so that double-clicks, race conditions, and unmount cleanup never cause inconsistent state.

#### Acceptance Criteria

1. WHEN `dismissToast(id)` is invoked zero, one, or many times for any id, THE ToastProvider SHALL produce a final Toast_Queue_State that contains no entry with that id in the toasts, timers, remaining, or pausedAt collections.
2. WHEN `dismissToast(id)` is invoked for an id that exists in the timers collection, THE ToastProvider SHALL clear the underlying `setTimeout` handle and remove the id from the timers collection.
3. WHEN the ToastProvider unmounts, THE ToastProvider SHALL clear all pending `setTimeout` handles in the timers collection.
4. WHEN `useToast` is called from a tree that does not have a `ToastProvider` ancestor, THE `useToast` hook SHALL throw an Error whose message is `"useToast must be used inside <ToastProvider>"`.

*Validates: Property 14*

### Requirement 14: Toast Region Accessibility and Default Copy

**User Story:** As a Luma user using a screen reader, I want toast messages to be announced and the close affordance to be labeled in Indonesian, so that the experience matches the rest of the app.

#### Acceptance Criteria

1. THE ToastProvider SHALL render a toast region container with `role="region"` and `aria-label="Notifikasi"`.
2. WHEN the toast variant is `success` or `info`, THE ToastProvider SHALL set the toast region's `aria-live` to `"polite"`.
3. WHEN the toast variant is `error`, THE Toast SHALL render with `role="alert"` and the region's `aria-live` SHALL be `"assertive"`.
4. THE Toast SHALL render its close button with `aria-label="Tutup notifikasi"`.
5. THE Toast SHALL render the message string as a text node and SHALL NOT render the message via `dangerouslySetInnerHTML`.

*Validates: Property 15*

### Requirement 15: Toast Motion Timings

**User Story:** As a Luma user, I want toasts to slide in and out softly without distracting me from what I am doing, so that confirmations feel calm.

#### Acceptance Criteria

1. WHEN a toast enters the visible queue and Reduced_Motion is not active, THE Toast SHALL animate vertical translation from minus 16 pixels to 0 and opacity from 0 to 1 over approximately 200 milliseconds with ease-out.
2. WHEN a toast exits the visible queue and Reduced_Motion is not active, THE Toast SHALL animate vertical translation from 0 to minus 16 pixels and opacity from 1 to 0 over approximately 200 milliseconds with ease-in.
3. WHILE Reduced_Motion is active, THE Toast SHALL animate only opacity and SHALL NOT animate vertical translation.

*Validates: Property 16*

### Requirement 16: Reduced Motion Compliance Across Components

**User Story:** As a Luma user with motion sensitivity, I want the entire Sprint 1 component set to honor my reduced-motion preference, so that I can use the app without discomfort.

#### Acceptance Criteria

1. WHILE Reduced_Motion is active, THE Card SHALL NOT animate opacity or vertical translation on mount.
2. WHILE Reduced_Motion is active, THE Button SHALL NOT animate scale on tap.
3. WHILE Reduced_Motion is active, THE BottomSheet SHALL NOT apply spring transitions and SHALL animate only opacity for backdrop.
4. WHILE Reduced_Motion is active, THE Toast SHALL animate only opacity for enter and exit.
5. WHILE Reduced_Motion is active, THE BottomNav SHALL disable the shared `layoutId` active-pill animation.
6. WHILE Reduced_Motion is active, THE PageWrapper SHALL NOT animate decorative blob drift.

*Validates: Property 16*

### Requirement 17: Tap Target Floor of 44 Pixels

**User Story:** As a Luma user on a small phone, I want every interactive control to be at least 44 by 44 pixels, so that I never miss a tap.

#### Acceptance Criteria

1. THE Button SHALL render with a computed Tap_Target height of at least 44 pixels for every variant and size combination.
2. WHEN `iconOnly` is true on a Button, THE Button SHALL render with a computed Tap_Target width of at least 44 pixels.
3. THE Input SHALL render with a computed input element height of either exactly 52 pixels for `size="md"` or exactly 56 pixels for `size="lg"`, both of which are at least 44 pixels.
4. WHEN `asButton` is true on a Card, THE Card SHALL render with a computed Tap_Target height of at least 44 pixels.
5. THE BottomNav SHALL render each nav item with a computed Tap_Target height of at least 44 pixels and width of at least 44 pixels.

*Validates: Property 3, Property 4, Property 17*

### Requirement 18: Indonesian Default Copy on User-Facing Strings

**User Story:** As an Indonesian-speaking Luma user, I want every default string emitted by Sprint 1 components to be in Indonesian, so that the app feels native.

#### Acceptance Criteria

1. THE BottomNav SHALL render the four label strings exactly as `Home`, `Transaksi`, `Target`, and `Laporan`.
2. THE BottomNav SHALL set the navigation landmark `aria-label` to exactly `Navigasi utama`.
3. THE BottomSheet SHALL set the close button `aria-label` to exactly `Tutup` when `showClose` is true or omitted.
4. THE BottomSheet SHALL set the drag handle `aria-label` to exactly `Tarik untuk menutup`.
5. WHERE `title` is not provided, THE BottomSheet SHALL set the dialog `aria-label` to exactly `Lembar bawah`.
6. THE ToastProvider SHALL set the toast region `aria-label` to exactly `Notifikasi`.
7. THE Toast SHALL set the close button `aria-label` to exactly `Tutup notifikasi`.

*Validates: Property 15*

### Requirement 19: No Hardcoded Hex Colors in Component Code

**User Story:** As a Luma developer, I want all colors to flow through CSS variables and Tailwind tokens, so that themes and customization can change appearance without rewriting components.

#### Acceptance Criteria

1. FOR every TypeScript or TSX file under `src/components/**`, THE Sprint 1 codebase SHALL NOT contain any string literal matching the regular expression `#([0-9a-fA-F]{3}){1,2}\b`.
2. THE Sprint 1 components SHALL apply colors only via Tailwind utility classes that resolve to CSS custom properties (for example `bg-bg-card`, `text-text-primary`, `bg-accent-primary`) or via `var(--*)` references in inline styles.

*Validates: Property 1*

### Requirement 20: Component Boundary — Presentation Only

**User Story:** As a Luma developer, I want Sprint 1 components to remain presentation-only with no data layer access, so that they can be safely composed by features in later sprints without coupling.

#### Acceptance Criteria

1. THE Sprint 1 components SHALL NOT import from any module under `src/db/**`.
2. THE Sprint 1 components SHALL NOT import from any module under `src/stores/**`.
3. THE Sprint 1 components SHALL NOT call IndexedDB APIs (`indexedDB`, `idb` package) directly.
4. THE Sprint 1 components SHALL receive all dynamic content via React props or via the ToastProvider context only.

*Validates: Property 1*
