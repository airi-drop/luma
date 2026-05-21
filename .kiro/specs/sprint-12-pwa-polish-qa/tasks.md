# Implementation Plan: Sprint 12 — PWA + Polish + QA

## Overview

This plan transforms Luma into a production-ready installable PWA with offline caching, polished microinteractions, accessibility compliance, lazy loading, and mobile viewport validation. Implementation uses the existing stack (vite-plugin-pwa, Framer Motion, Zustand) with no new dependencies. Tasks are ordered: infrastructure first, then hooks, then components, then integration/wiring, then QA validation.

## Tasks

- [ ] 1. PWA infrastructure and image assets
  - [ ] 1.1 Configure vite-plugin-pwa in vite.config.ts
    - Add full PWA manifest config (name, short_name, description, display, orientation, start_url, scope, theme_color, background_color, icons array)
    - Configure `registerType: "autoUpdate"`, `clientsClaim: true`, `cleanupOutdatedCaches: true`
    - Add `workbox.globPatterns` matching `**/*.{js,css,html,ico,png,webp,woff2}`
    - Add navigation fallback to `index.html` with denylist for `/api`
    - Add runtime caching: CacheFirst 30d for images, StaleWhileRevalidate for lazy JS/CSS chunks, NetworkFirst 3s timeout for Gemini API
    - Set max cache entries to 50 per runtime cache with LRU eviction
    - _Requirements: 1.1–1.7, 2.1–2.7, 3.1–3.5_

  - [ ] 1.2 Create and optimize PWA icon assets
    - Create `public/icons/icon-192x192.png`, `public/icons/icon-512x512.png`, `public/icons/icon-512x512-maskable.png`
    - Ensure combined icon size ≤ 100KB
    - _Requirements: 1.5, 9.2, 9.3_

  - [ ] 1.3 Optimize character assets to WebP ≤ 30KB
    - Convert all `public/characters/` assets to WebP format
    - Ensure each file is at most 30KB
    - Verify only active character mood states are loaded at runtime
    - _Requirements: 9.1, 9.4_

- [ ] 2. Core hooks and store enhancements
  - [ ] 2.1 Implement useReducedMotion hook
    - Create `src/lib/useReducedMotion.ts`
    - Detect `prefers-reduced-motion: reduce` via `window.matchMedia`
    - Listen for media query changes and return boolean
    - _Requirements: 18.4, 15.5_

  - [ ] 2.2 Implement useOnlineStatus hook
    - Create `src/lib/useOnlineStatus.ts`
    - Initialize with `navigator.onLine`
    - Listen to `online`/`offline` window events
    - Fire offline toast "Kamu lagi offline — data tetap aman kok 🔒" (3s) on transition to offline
    - Fire online toast "Online lagi ✨" (2s) on transition to online
    - Do NOT fire toast on initial mount
    - Clean up event listeners on unmount
    - _Requirements: 5.5, 6.1–6.4_

  - [ ] 2.3 Implement useInstallPrompt hook
    - Create `src/lib/useInstallPrompt.ts`
    - Intercept `beforeinstallprompt` event and store deferred prompt
    - Expose `canInstall` (false if dismissed, standalone mode, or no event)
    - Implement `triggerInstall()` — calls `deferredPrompt.prompt()`
    - Implement `dismiss()` — sets `localStorage.installBannerDismissed = 'true'`
    - Clean up event listeners on unmount
    - _Requirements: 7.1, 7.4–7.6_

  - [ ] 2.4 Enhance uiStore with toast queue support
    - Add `toastQueue: ToastItem[]` to existing uiStore
    - Add `showToast(message, duration?, variant?)` — pushes to queue
    - Add `dismissCurrentToast()` — removes first item from queue
    - Ensure toasts display sequentially (one at a time)
    - _Requirements: 17.3, 17.4_

  - [ ]* 2.5 Write unit tests for hooks and store
    - Test useOnlineStatus returns correct initial state
    - Test useOnlineStatus fires toast only on transitions (not mount)
    - Test useInstallPrompt stores event and respects dismiss/standalone
    - Test useReducedMotion returns correct preference
    - Test uiStore toast queue sequential behavior
    - _Requirements: 5.5, 6.1, 6.2, 6.4, 7.1, 7.4, 7.5, 17.4, 18.4_

- [ ] 3. Checkpoint — Ensure hooks and store pass tests
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. New UI components
  - [ ] 4.1 Create LoadingSkeleton component
    - Create `src/components/ui/LoadingSkeleton.tsx`
    - Centered spinner with CSS animation (no heavy library)
    - Pulse animation on placeholder rectangles
    - `role="status"` with `aria-label` for screen readers
    - Use `bg-bg-card-soft` color scheme
    - _Requirements: 8.6, 12.4_

  - [ ] 4.2 Create InstallBanner component
    - Create `src/components/ui/InstallBanner.tsx`
    - Card at top of HomePage content (before budget card)
    - Message: "Pasang Luma di home screen biar makin cepat dibuka ✨"
    - Primary "Pasang" button using existing Button component
    - Close icon button with `aria-label="Tutup"`
    - Framer Motion enter animation: fade + slide-down, 200ms
    - Respect `useReducedMotion` to disable animation
    - _Requirements: 7.2, 7.3, 7.7_

  - [ ] 4.3 Create AnimatedRoutes wrapper component
    - Create `src/app/AnimatedRoutes.tsx`
    - Use `AnimatePresence mode="wait"` wrapping route outlet
    - Page motion.div: initial `{ opacity: 0, scale: 0.98 }`, animate `{ opacity: 1, scale: 1 }` 200ms, exit `{ opacity: 0, scale: 0.98 }` 150ms
    - Apply `will-change: opacity, transform` for GPU acceleration
    - Key derived from `location.pathname`
    - Respect `useReducedMotion` — disable animations when preference set
    - _Requirements: 15.1–15.5_

- [ ] 5. Enhanced existing components — accessibility and animations
  - [ ] 5.1 Enhance BottomSheet with focus trap and animation
    - Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby={titleId}`
    - Implement focus trap: Tab key cycles within sheet
    - On open: focus moves to first focusable element
    - On close: focus returns to trigger element (via `triggerRef` prop)
    - Add Framer Motion animation: `translateY(100%) → 0` open (250ms ease-out), reverse close (200ms ease-in)
    - Backdrop: fade in 200ms, fade out 150ms
    - Respect `useReducedMotion`
    - _Requirements: 12.3, 13.1–13.3, 16.1–16.5_

  - [ ] 5.2 Enhance Toast with ARIA and animation
    - Add `role="status"` and `aria-live="polite"`
    - Framer Motion enter: `translateY(20px)→0` + `opacity 0→1` (200ms)
    - Framer Motion exit: `opacity 1→0` (150ms)
    - Auto-dismiss after configured duration (default 3s)
    - Integrate with uiStore toast queue — show one at a time
    - Respect `useReducedMotion`
    - _Requirements: 12.4, 17.1–17.4_

  - [ ] 5.3 Enhance BottomNav with semantic HTML and accessibility
    - Wrap in `<nav aria-label="Navigasi utama">`
    - Ensure each nav item has min-height 44px touch target
    - Add keyboard accessibility: `tabIndex={0}`, Enter/Space activation
    - _Requirements: 12.1, 11.2, 13.5_

  - [ ] 5.4 Enhance FAB with microinteraction animations
    - Add tap animation: scale pulse `1→0.9→1` (150ms) via Framer Motion `whileTap`
    - Add idle animation: gentle floating `translateY` oscillation (2px, 3s loop, `repeat: Infinity`)
    - Ensure minimum size 56×56px
    - Respect `useReducedMotion`
    - _Requirements: 11.3, 18.1, 18.3, 18.4_

  - [ ] 5.5 Add card interaction animations
    - Add subtle press effect to transaction cards and budget cards: scale `1→0.97→1` (120ms) via Framer Motion `whileTap`
    - Respect `useReducedMotion`
    - _Requirements: 18.2, 18.4_

  - [ ]* 5.6 Write accessibility audit tests
    - Test BottomNav uses `<nav>` with correct aria-label
    - Test icon buttons have aria-labels
    - Test BottomSheet has role="dialog", aria-modal, aria-labelledby
    - Test Toast has role="status", aria-live="polite"
    - Test form inputs have labels or aria-labels
    - Test heading hierarchy (h1 → h2)
    - Test focus moves into BottomSheet on open and returns on close
    - Test BottomNav items are keyboard navigable
    - _Requirements: 12.1–12.7, 13.1–13.5_

- [ ] 6. Checkpoint — Ensure enhanced components work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Lazy loading and code splitting
  - [ ] 7.1 Set up React.lazy for ReportsPage
    - Convert ReportsPage import to `React.lazy(() => import(...))`
    - Wrap with `<Suspense fallback={<LoadingSkeleton />}>`
    - Ensure Recharts is part of the Reports chunk, not main bundle
    - _Requirements: 8.1, 8.5, 8.6_

  - [ ] 7.2 Implement dynamic imports for AI modules
    - AI parser module: dynamic `import()` triggered only on AI Quick Input tab activation
    - AI insights module: dynamic `import()` triggered only on insight request
    - _Requirements: 8.2, 8.3_

  - [ ] 7.3 Implement dynamic imports for export modules
    - Export modules (jsPDF, html2canvas, xlsx): dynamic `import()` triggered only on export action
    - _Requirements: 8.4_

  - [ ] 7.4 Implement lazy load error boundary with retry
    - Create error boundary that catches `import()` rejections
    - Display soft error: "Gagal memuat modul, coba refresh ya" with "Coba Lagi" button
    - Retry button re-triggers the dynamic import
    - _Requirements: 8.7_

  - [ ]* 7.5 Write integration tests for lazy loading
    - Test ReportsPage loads in separate chunk
    - Test AI parser loads only on AI tab activation
    - Test export modules load only on export action
    - Test lazy load failure shows retry UI
    - _Requirements: 8.1, 8.2, 8.4, 8.7_

- [ ] 8. Offline AI degradation and connectivity integration
  - [ ] 8.1 Implement offline AI Quick Input degradation
    - When `useOnlineStatus.isOnline === false`: show "AI butuh internet — pakai manual dulu ya ✨" message
    - Disable AI parse button when offline
    - Ensure manual transaction form remains fully functional
    - _Requirements: 5.1, 5.3_

  - [ ] 8.2 Implement offline AI Insights degradation
    - When offline: show "Insight AI butuh koneksi internet 🌐" placeholder on Reports page
    - Do not attempt Gemini API call while offline
    - _Requirements: 5.2_

  - [ ] 8.3 Implement automatic AI feature re-enablement on connectivity restore
    - When `online` event fires, AI features re-enable without page refresh
    - _Requirements: 5.4_

  - [ ]* 8.4 Write integration tests for offline scenarios
    - Test offline transaction CRUD works via IndexedDB
    - Test offline AI Quick Input shows disabled message
    - Test online recovery re-enables AI features
    - _Requirements: 4.1, 5.1, 5.4_

- [ ] 9. Wire AnimatedRoutes and InstallBanner into app
  - [ ] 9.1 Integrate AnimatedRoutes into app routing
    - Wrap route outlet in `App.tsx` or `routes.tsx` with AnimatedRoutes component
    - Ensure page transition animations fire on route changes
    - Verify total transition duration ≤ 250ms
    - _Requirements: 15.1–15.4_

  - [ ] 9.2 Integrate InstallBanner into HomePage
    - Use `useInstallPrompt` hook in HomePage
    - Render InstallBanner at top of content when `canInstall === true`
    - Wire onInstall to `triggerInstall()` and onDismiss to `dismiss()`
    - _Requirements: 7.1–7.6_

  - [ ] 9.3 Integrate useOnlineStatus at app level
    - Mount `useOnlineStatus` in App.tsx or a top-level provider
    - Ensure offline/online toasts fire globally on connectivity changes
    - _Requirements: 6.1–6.4_

- [ ] 10. Checkpoint — Ensure lazy loading, offline, and routing integration work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Touch targets, contrast, and ARIA audit pass
  - [ ] 11.1 Audit and fix touch target sizes across the app
    - Ensure all interactive elements ≥ 44×44px
    - Ensure FAB ≥ 56×56px
    - Ensure bottom sheet action buttons ≥ 44px height
    - Ensure adjacent interactive element gap ≥ 8px
    - _Requirements: 11.1–11.5_

  - [ ] 11.2 Audit and fix remaining ARIA and semantic HTML
    - Ensure all icon-only buttons have `aria-label`
    - Ensure all form inputs have `<label>` or `aria-label`
    - Ensure page headings follow logical h1→h2 hierarchy
    - Ensure no div/span click handlers without role and keyboard support
    - _Requirements: 12.2, 12.5–12.7_

  - [ ] 11.3 Verify color contrast compliance across themes
    - Check text on card surfaces ≥ 4.5:1 ratio in all 5 themes
    - Check text on page background ≥ 4.5:1 in all 5 themes
    - Check custom background overlay ensures readability
    - Check accent interactive elements ≥ 3:1 against surroundings
    - _Requirements: 14.1–14.4_

- [ ] 12. Viewport QA validation
  - [ ] 12.1 Validate layouts at 360px, 390px, 430px, 480px viewports
    - No horizontal overflow at any viewport
    - BottomNav fixed at bottom, fully visible, no overlap
    - HomePage sections stack without overlap
    - BottomSheets don't exceed viewport width at 360px
    - Text remains readable (amounts, categories not truncated) at 360px
    - Filter row wraps/scrolls within container at 360px
    - Charts resize within content area at all viewports
    - _Requirements: 10.1–10.7_

  - [ ]* 12.2 Write viewport smoke tests
    - Test no horizontal overflow at 360px and 480px
    - Test BottomNav visibility at all viewport widths
    - _Requirements: 10.1, 10.2_

- [ ] 13. Performance budget verification
  - [ ] 13.1 Verify bundle size and precache budget
    - Confirm main bundle ≤ 200KB gzipped (excluding lazy modules)
    - Confirm total precache ≤ 2MB uncompressed
    - Confirm no new dependencies in package.json
    - _Requirements: 19.1, 19.2, 20.5_

  - [ ] 13.2 Ensure memoization of derived calculations
    - Verify monthly totals, budget usage, category totals are memoized
    - Ensure recomputation only when input transactions change
    - _Requirements: 19.5_

  - [ ]* 13.3 Write build smoke tests
    - Test build produces valid manifest.webmanifest
    - Test manifest includes required icons
    - Test service worker file exists in build output
    - Test main bundle size ≤ 200KB gzipped
    - Test total precache ≤ 2MB
    - Test character assets are WebP ≤ 30KB each
    - Test PWA icons ≤ 100KB combined
    - Test no new dependencies in package.json
    - _Requirements: 1.5, 1.7, 2.1, 9.1, 9.3, 19.1, 19.2, 20.5_

- [ ] 14. Final checkpoint — Full integration validation
  - Ensure all tests pass, ask the user if questions arise.
  - Verify no scope creep: no push notifications, no cloud sync, no background sync, no login, no new deps, no new IndexedDB stores, no BottomNav structure changes.
  - _Requirements: 20.1–20.7_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- No property-based tests — this sprint is infrastructure/config/UI focused
- Testing uses smoke tests, integration tests, accessibility audits, and Lighthouse scoring
- All animations must respect `prefers-reduced-motion: reduce`
- Indonesian copy must match exact strings from requirements (soft, casual tone)
- No new npm dependencies — all tools already in package.json

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "2.1"] },
    { "id": 1, "tasks": ["2.2", "2.3", "2.4"] },
    { "id": 2, "tasks": ["2.5", "4.1", "4.2", "4.3"] },
    { "id": 3, "tasks": ["5.1", "5.2", "5.3", "5.4", "5.5"] },
    { "id": 4, "tasks": ["5.6", "7.1", "7.2", "7.3", "7.4"] },
    { "id": 5, "tasks": ["7.5", "8.1", "8.2", "8.3"] },
    { "id": 6, "tasks": ["8.4", "9.1", "9.2", "9.3"] },
    { "id": 7, "tasks": ["11.1", "11.2", "11.3"] },
    { "id": 8, "tasks": ["12.1", "12.2", "13.1", "13.2"] },
    { "id": 9, "tasks": ["13.3"] }
  ]
}
```
