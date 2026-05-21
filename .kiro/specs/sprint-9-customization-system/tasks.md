# Implementation Plan: Sprint 9 — Customization System

## Overview

Implement the SettingsPage at `/settings` with ThemeCustomizer, CharacterCustomizer, BackgroundCustomizer, ReadabilityControls (overlay + blur sliders), and a reset section. Customization applies via CSS variable mutation (`themeApplier`) and a fixed background layer (`backgroundApplier`). Background images are processed (resize ≤1080px → WebP) by `imageProcessor` and persisted as Blobs through Sprint 2's `backgroundsRepo`. All settings flow through Sprint 2's `settingsStore`. Implementation follows a bottom-up approach: types and presets first, then pure feature modules (themeApplier, backgroundApplier, imageProcessor, characterAssets), then UI components, then page composition, then app boot wiring.

## Tasks

- [ ] 1. Define customization types and bundled presets
  - [ ] 1.1 Create `src/features/customization/types.ts`
    - Define `ThemeTokenName` union (12 token names matching DESIGN_SYSTEM §3 palette).
    - Define `ThemePreset` interface `{ id, name, mode, tokens, decorativeStyle }`.
    - Define `CharacterPreset` interface `{ id, name, type: "default", style, assetMap }`.
    - Define `CharacterMoodState` union `"happy" | "chill" | "worried" | "panic"`.
    - Define `ProcessedImage` interface `{ blob, width, height, sizeBytes }`.
    - Define `ImageProcessingError` class extending `Error` with `code: "INVALID_TYPE" | "DECODE_FAILED" | "ENCODE_FAILED" | "EMPTY_FILE"`.
    - _Requirements: 2.1, 3.1, 6.7, 6.8, 14.1, 14.2, 14.3_

  - [ ] 1.2 Create `src/lib/themes/tokens.ts`
    - Export `THEME_TOKEN_NAMES` array (12 names) for runtime iteration.
    - Export `kebab(name)` helper that converts `bgMain` → `bg-main`, `accentPrimary` → `accent-primary`.
    - _Requirements: 2.4_

  - [ ] 1.3 Create `src/lib/themes/presets.ts`
    - Export `PRESET_THEMES: readonly ThemePreset[]` containing: `cozy-dark`, `cream-latte`, `sakura-dream`, `midnight-navy`, `soft-purple`.
    - Each preset SHALL have a complete `tokens` map for all `ThemeTokenName` values, sourced from DESIGN_SYSTEM §3 and PRD §5/§7.
    - Export `getPresetThemeById(id)` lookup helper that falls back to `cozy-dark` for unknown ids.
    - _Requirements: 2.1, 14.5_

  - [ ] 1.4 Create `src/lib/characters/presets.ts`
    - Export `PRESET_CHARACTERS: readonly CharacterPreset[]` for `otter`, `cat`, `bunny`, `hamster`.
    - Each `assetMap` SHALL point to `/characters/{id}/{state}.webp` for all 4 mood states.
    - Export `getPresetCharacterById(id)` lookup helper that falls back to `otter` for unknown ids.
    - _Requirements: 3.1, 4.2, 4.3, 4.5_

  - [ ] 1.5 Add bundled character assets to `public/characters/`
    - Place 16 WebP files at `public/characters/{otter|cat|bunny|hamster}/{happy|chill|worried|panic}.webp`.
    - Each asset SHALL be ≤ 30KB at 256×256 resolution.
    - _Requirements: 4.5, 17.5_

- [ ] 2. Implement themeApplier (pure DOM mutation module)
  - [ ] 2.1 Create `src/features/customization/themeApplier.ts` with `applyTheme(theme)`
    - Iterate `theme.tokens` and call `document.documentElement.style.setProperty("--" + kebab(name), value)` for each.
    - Set `document.documentElement.dataset.themeMode = theme.mode`.
    - Function SHALL be synchronous, no React calls, no IDB calls.
    - _Requirements: 2.4, 2.5, 2.6, 17.1_

  - [ ] 2.2 Add slider variable helpers in same module
    - Export `setOverlayOpacity(value: number)` that writes `--overlay-opacity` to documentElement.
    - Export `setBackgroundBlur(value: number)` that writes `--background-blur` as `${value}px`.
    - _Requirements: 9.5, 10.5_

  - [ ]* 2.3 Write property tests for themeApplier (P1)
    - **Property P1 (theme totality)**: For every preset T, after `applyTheme(T)`, every token K satisfies `getPropertyValue("--" + kebab(K)) === T.tokens[K]`.
    - **Property P1 (idempotency)**: `applyTheme(T); applyTheme(T)` produces identical DOM state to a single call.
    - **Validates: Requirements 2.4, 2.5**

- [ ] 3. Implement backgroundApplier (object URL lifecycle)
  - [ ] 3.1 Create `src/features/customization/backgroundApplier.ts` with `applyBackground(asset, layerEl, currentObjectURL)`
    - If `currentObjectURL` is non-null, call `URL.revokeObjectURL(currentObjectURL)` exactly once.
    - If `asset === null`: clear `layerEl.style.backgroundImage` and return `null`.
    - Else: create `URL.createObjectURL(asset.blob)`, set `layerEl.style.backgroundImage = url(...)`, return new URL.
    - Function returns the new currentObjectURL string or null.
    - _Requirements: 7.4, 7.5, 7.6, 7.7, 8.3_

  - [ ]* 3.2 Write property tests for backgroundApplier (P7)
    - **Property P7 (single live URL)**: For any sequence of `applyBackground` calls, count(`createObjectURL`) − count(`revokeObjectURL`) ≤ 1 at all times.
    - **Validates: Requirements 7.6, 7.7**

- [ ] 4. Implement imageProcessor (resize + WebP encode)
  - [ ] 4.1 Create `src/features/customization/imageProcessor.ts` with `processBackgroundImage(file)`
    - Throw `ImageProcessingError("EMPTY_FILE")` when `file.size === 0`.
    - Throw `ImageProcessingError("INVALID_TYPE")` when `file.type` not in accepted set.
    - Decode via `await createImageBitmap(file)`, throw `ImageProcessingError("DECODE_FAILED")` on rejection.
    - Compute target dimensions: clamp width to 1080, scale height proportionally, never upscale.
    - Draw to `OffscreenCanvas` (with `HTMLCanvasElement` fallback) at target dimensions.
    - Encode via `canvas.convertToBlob({ type: "image/webp", quality: 0.85 })` (or `toBlob` for HTMLCanvasElement).
    - Throw `ImageProcessingError("ENCODE_FAILED")` if blob is null or empty.
    - Log `console.warn` if `blob.size > 5_000_000` but still resolve.
    - Return `ProcessedImage`.
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_

  - [ ]* 4.2 Write property tests for imageProcessor (P4, P5, P6)
    - **Property P4 (aspect ratio preservation)**: For arbitrary valid images, `|srcRatio − resultRatio| ≤ 0.01`.
    - **Property P5 (no upscaling)**: For arbitrary valid images, `result.width ≤ min(srcWidth, 1080)`.
    - **Property P6 (WebP only)**: `result.blob.type === "image/webp"` for every successful run.
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

- [ ] 5. Implement characterAssets resolver
  - [ ] 5.1 Create `src/features/customization/characterAssets.ts` with `getCharacterAssetUrl(characterId, mood)`
    - Lookup character via `getPresetCharacterById(characterId)` (with otter fallback).
    - Return `character.assetMap[mood]`.
    - Pure, deterministic, no side effects.
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 5.2 Write property tests for characterAssets (P9)
    - **Property P9 (resolver totality)**: For arbitrary `(characterId, mood)`, returned URL is non-empty and starts with `/characters/`.
    - **Validates: Requirement 4.1, 4.3**

- [ ] 6. Implement initializeCustomizationAppliers boot wiring
  - [ ] 6.1 Add `initializeCustomizationAppliers()` to `src/features/customization/themeApplier.ts` (or new `boot.ts`)
    - Resolve `#luma-bg-layer` via `document.getElementById`.
    - Subscribe to `settingsStore` with `.subscribe`.
    - On each callback: track `lastThemeId`, `lastBgId` to avoid redundant work.
    - When theme changes → call `applyTheme(getPresetThemeById(id))`.
    - On every callback → call `setOverlayOpacity` and `setBackgroundBlur`.
    - When backgroundId changes → fetch via `backgroundsRepo.getById`, call `applyBackground`, store new objectURL.
    - Return an unsubscribe function that revokes the active object URL and unsubscribes the store listener.
    - _Requirements: 12.2, 12.3, 12.4, 12.5, 12.7, 14.5, 14.6_

- [ ] 7. Wire boot in App.tsx
  - [ ] 7.1 Update `src/app/App.tsx`
    - On mount, call `settingsStore.hydrate()` then `initializeCustomizationAppliers()`.
    - Render `<div id="luma-bg-layer" aria-hidden="true" />` exactly once, before routed content.
    - Show `SplashScreen` (or skeleton) while `settings === null`.
    - On unmount, call the unsubscribe function returned by `initializeCustomizationAppliers`.
    - _Requirements: 12.1, 12.2, 12.6, 12.7_

- [ ] 8. Checkpoint — feature modules complete
  - Ensure all tests pass for tasks 1–7. Ask the user if questions arise.

- [ ] 9. Implement ThemeCustomizer components
  - [ ] 9.1 Create `src/components/customization/ThemePresetCard.tsx`
    - Props: `{ theme: ThemePreset, isActive: boolean, onTap: () => void }`.
    - Card: radius 20px, padding 12px, ~120px tall.
    - Render name (Fraunces 16/700) and 4 color swatches showing `bgMain`, `bgCard`, `accentPrimary`, `accentSecondary`.
    - When `isActive`: 2px `--accent-primary` border + soft inner shadow.
    - Tap target ≥ 44px.
    - _Requirements: 2.2, 2.8, 16.4_

  - [ ] 9.2 Create `src/components/customization/ThemeCustomizer.tsx`
    - Props: `{ activeThemeId, onSelect }`.
    - Map `PRESET_THEMES` to a 2-column grid of `ThemePresetCard`.
    - Pass `isActive = (preset.id === activeThemeId)`.
    - On tap, call `onSelect(preset.id)`.
    - _Requirements: 2.1, 2.2, 2.3, 16.2_

- [ ] 10. Implement CharacterCustomizer components
  - [ ] 10.1 Create `src/components/customization/CharacterPresetCard.tsx`
    - Props: `{ character: CharacterPreset, isActive: boolean, onTap: () => void }`.
    - Card: radius 20px, padding 12px, ~140px tall.
    - Render `happy` mood thumbnail (64×64) above the name.
    - When `isActive`: 2px `--accent-primary` border.
    - _Requirements: 3.2, 3.3, 16.4_

  - [ ] 10.2 Create `src/components/customization/CharacterCustomizer.tsx`
    - Props: `{ activeCharacterId, onSelect }`.
    - Map `PRESET_CHARACTERS` to a 2-column grid of `CharacterPresetCard`.
    - Below the grid, render a "mood preview strip" of 4 small thumbnails (32×32) showing the active character in `happy`, `chill`, `worried`, `panic` states with mood emoji labels.
    - On tap, call `onSelect(character.id)`.
    - _Requirements: 3.1, 3.2, 3.4, 3.6, 16.3_

- [ ] 11. Implement BackgroundCustomizer components
  - [ ] 11.1 Create `src/components/customization/BackgroundUploader.tsx`
    - Hidden `<input type="file" accept="image/jpeg,image/png,image/webp">`.
    - Visible button "📷 Upload background" triggers input click.
    - On file change: validate `file.type` is in accepted list before calling `onFile`.
    - When `isUploading`, show loading spinner inside the button and disable it.
    - On invalid type, call provided `onInvalidType` (which shows toast).
    - _Requirements: 5.1, 5.2, 5.4_

  - [ ] 11.2 Create `src/components/customization/BackgroundCustomizer.tsx`
    - Props: `{ activeBackgroundId, onUpload, onClear, isUploading }`.
    - When `activeBackgroundId` is set: render thumbnail by reading the asset via `backgroundsRepo.getById` and creating a temporary object URL (revoked on unmount). Show overlay sample for readability preview.
    - Render `BackgroundUploader` with `onFile` wired to `onUpload`.
    - When `activeBackgroundId` is set: render "Hapus background" secondary button calling `onClear`.
    - Helper copy: "Gambar otomatis dikompres biar app tetap ringan ✨".
    - _Requirements: 5.1, 7.1, 7.2, 8.1, 8.2_

- [ ] 12. Implement ReadabilityControls components
  - [ ] 12.1 Create `src/components/customization/OverlayOpacitySlider.tsx`
    - `<input type="range" min={0.30} max={0.80} step={0.05}>`.
    - On `input` event, call `onChange(clamp(value, 0.30, 0.80))`.
    - Display percentage chip `${Math.round(value * 100)}%`.
    - _Requirements: 9.1, 9.3, 9.4, 9.6_

  - [ ] 12.2 Create `src/components/customization/BackgroundBlurSlider.tsx`
    - `<input type="range" min={0} max={20} step={1}>`.
    - On `input` event, call `onChange(clamp(value, 0, 20))`.
    - Display chip `${value}px`.
    - _Requirements: 10.1, 10.3, 10.4, 10.6_

  - [ ] 12.3 Create `src/components/customization/ReadabilityControls.tsx`
    - Props: `{ overlayOpacity, backgroundBlur, onOverlayChange, onBlurChange }`.
    - Section title: "Biar tetap nyaman dibaca".
    - Render `OverlayOpacitySlider` and `BackgroundBlurSlider` stacked vertically with labels.
    - _Requirements: 9.1, 10.1_

- [ ] 13. Checkpoint — UI components complete
  - Ensure component tests pass. Ask the user if questions arise.

- [ ] 14. Compose SettingsPage
  - [ ] 14.1 Create `src/pages/SettingsPage.tsx`
    - Subscribe to `settingsStore` selectors: `settings`, `setActiveTheme`, `setActiveCharacter`, `setBackground`, `update`.
    - When `settings === null`, render `SettingsSkeleton`.
    - Render in order: SettingsHeader, ProfileSection (read-only `settings.name`), ThemeCustomizer, CharacterCustomizer, BackgroundCustomizer, ReadabilityControls, DataSection.
    - Use `PageWrapper` with `hideBottomNav` prop (or equivalent).
    - All copy in soft Indonesian.
    - _Requirements: 1.1, 1.2, 1.5, 1.6, 16.1_

  - [ ] 14.2 Wire upload flow in SettingsPage
    - Local state `isUploading: boolean`.
    - `handleUpload(file)`: dynamic-import imageProcessor, call `processBackgroundImage`, then `backgroundsRepo.create`, then `setBackground(asset.id)`. Show toast "Background terpasang ✨" on success.
    - On `ImageProcessingError` codes: show appropriate soft toast per Requirement 14.
    - On `backgroundsRepo.create` rejection: show toast "Gagal nyimpen background, coba sekali lagi ya."
    - Always reset `isUploading = false` in finally block.
    - _Requirements: 7.1, 7.2, 7.8, 14.1, 14.2, 14.3, 14.4, 14.7, 17.4_

  - [ ] 14.3 Wire reset flow in SettingsPage (DataSection)
    - Tap reset button → open `ConfirmSheet` with body "Yakin balikin ke tampilan default? Theme, karakter, dan background kamu akan dikembalikan."
    - On confirm → `update({ activeThemeId: "cozy-dark", activeCharacterId: "otter", backgroundId: undefined, backgroundBlur: 0, backgroundOverlayOpacity: 0.72 })`.
    - On success → toast "Tampilan dikembalikan ke awal ✨".
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [ ] 15. Add Home header gear icon
  - [ ] 15.1 Add settings icon button to HomePage header
    - Place gear icon button at top-right of the Home header.
    - `aria-label="Buka pengaturan"`.
    - On tap, navigate to `/settings` via `useNavigate`.
    - Tap target ≥ 44px.
    - _Requirements: 1.3, 16.4_

- [ ] 16. Register `/settings` route
  - [ ] 16.1 Update `src/app/routes.tsx`
    - Add route `/settings` → `SettingsPage`.
    - Configure layout to hide BottomNav for this route (or rely on `PageWrapper` prop).
    - Verify no Settings entry in `BottomNav`.
    - _Requirements: 1.1, 1.2, 1.4_

- [ ] 17. Optimize slider IDB write debouncing
  - [ ] 17.1 Confirm or extend `settingsStore.update` to debounce IndexedDB writes
    - Debounce window ≥ 250ms for slider continuous changes.
    - In-memory state SHALL still update synchronously on every call.
    - CSS variable updates via themeApplier SHALL run on every change (no debounce on DOM mutation).
    - _Requirements: 17.2, 17.3_

- [ ] 18. Checkpoint — page composition complete
  - Ensure tests pass. Ask the user if questions arise.

- [ ] 19. Integration tests
  - [ ]* 19.1 Theme switch end-to-end
    - Mount SettingsPage with mocked settingsStore.
    - Click each preset card; verify `setActiveTheme` is called with correct id.
    - Verify CSS variables on `document.documentElement` match the chosen preset's tokens after themeApplier subscription fires.
    - **Validates: Requirements 2.1, 2.3, 2.4, 2.7**

  - [ ]* 19.2 Character switch end-to-end
    - Click each character card; verify `setActiveCharacter` is called.
    - Verify mood preview strip updates to show the new active character in 4 mood states.
    - Verify `settingsRepo.get()` returns the new `activeCharacterId` after update.
    - **Validates: Requirements 3.1, 3.4, 3.6, 3.7**

  - [ ]* 19.3 Background upload end-to-end
    - Provide a real PNG fixture as a `File`.
    - Trigger upload handler; verify `backgroundsRepo.list()` contains the new asset and its `mimeType === "image/webp"`.
    - Verify `settings.backgroundId === newId`.
    - Verify `#luma-bg-layer.style.backgroundImage` is non-empty.
    - **Validates: Requirements 6.3, 7.1, 7.2, 7.3, 7.4, 7.8**

  - [ ]* 19.4 Slider continuous updates
    - Simulate 10 input events on overlay slider with values from 0.30 to 0.80.
    - Verify `--overlay-opacity` updates on every event.
    - Verify `settingsRepo.update` is called fewer than 10 times (debounced).
    - Verify final `settings.backgroundOverlayOpacity` matches the last value.
    - Repeat for blur slider.
    - **Validates: Requirements 9.3, 9.4, 9.5, 10.3, 10.4, 10.5, 17.2, 17.3**

  - [ ]* 19.5 Reset flow end-to-end
    - Set custom theme/character/background/overlay/blur values.
    - Trigger reset, confirm in modal.
    - Verify all 5 fields equal canonical defaults (`cozy-dark`, `otter`, `undefined`, `0`, `0.72`).
    - Verify `backgrounds` store still contains the previously uploaded asset (not deleted).
    - Verify `#luma-bg-layer` background-image is cleared.
    - Verify previous object URL was revoked.
    - **Validates: Requirements 11.3, 11.4, 11.5, 7.6, 7.7**

  - [ ]* 19.6 Persistence round-trip
    - Apply theme, character, background, slider changes.
    - Re-instantiate settingsStore (simulated app restart).
    - Call `hydrate()` and `initializeCustomizationAppliers()`.
    - Verify `state.settings` matches what was persisted.
    - Verify CSS variables and background image match the persisted state.
    - **Validates: Requirements 13.1, 13.2, 13.3, 13.4, 12.3, 12.4, 12.5**

  - [ ]* 19.7 BottomNav hidden on /settings
    - Navigate to `/settings`; assert `BottomNav` element is not in the DOM.
    - Navigate to `/home`; assert `BottomNav` is in the DOM.
    - Verify Home header contains a gear icon button that navigates to `/settings`.
    - **Validates: Requirements 1.2, 1.3, 1.4**

  - [ ]* 19.8 Error scenarios
    - Upload an invalid mime-type file (e.g., `text/plain`); verify rejection toast and no state change.
    - Mock `createImageBitmap` to reject; verify `DECODE_FAILED` toast and no state change.
    - Mock `backgroundsRepo.create` to reject; verify error toast and no state change.
    - Set `settings.activeThemeId` to an unknown id; verify themeApplier falls back to `cozy-dark` and warns.
    - Set `settings.backgroundId` to a non-existent asset id; verify backgroundApplier clears the layer silently.
    - Verify `isUploading` resets to `false` in all error cases.
    - **Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7**

  - [ ]* 19.9 No network calls
    - Mock `fetch` and `XMLHttpRequest`; perform full customization flows (theme, character, background upload, sliders, reset).
    - Assert no network calls were made.
    - **Validates: Requirements 15.1, 15.2**

- [ ] 20. Final checkpoint — ensure all tests pass
  - Ensure all tests pass. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP.
- Each task references specific requirements for traceability.
- Property tests (P1, P4, P5, P6, P7, P9) validate universal correctness properties from the design document.
- Sprint 9 introduces NO new IndexedDB stores. It reuses Sprint 2's `settings` and `backgrounds` stores via `settingsStore` and `backgroundsRepo`.
- Sprint 9 introduces NO new npm dependencies. All processing uses native browser APIs (`createImageBitmap`, `OffscreenCanvas`, `URL.createObjectURL`).
- Existing components reused: `PageWrapper`, `Card`, `Button`, `BottomSheet`, `Toast` (Sprint 1); `settingsStore`, `backgroundsRepo` (Sprint 2).
- Live-preview principle: NO "Apply" button anywhere. All changes apply on tap/drag.
- Readability invariant: overlay opacity is hard-clamped to `[0.30, 0.80]`; user cannot break it.
- Background storage rule: `Blob` only, never base64 (TECHNICAL_ARCHITECTURE §18).
- Theme application rule: CSS variables only on `document.documentElement` (TECHNICAL_ARCHITECTURE §19).
- Character resolution rule: bundled static assets at `public/characters/{id}/{state}.webp`, resolved by pure function (TECHNICAL_ARCHITECTURE §20).
- All copy in soft Indonesian per AGENTS.md tone guide.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.5"] },
    { "id": 1, "tasks": ["1.3", "1.4"] },
    { "id": 2, "tasks": ["2.1", "2.2", "3.1", "4.1", "5.1"] },
    { "id": 3, "tasks": ["2.3", "3.2", "4.2", "5.2", "6.1"] },
    { "id": 4, "tasks": ["7.1"] },
    { "id": 5, "tasks": ["9.1", "10.1", "11.1", "12.1", "12.2"] },
    { "id": 6, "tasks": ["9.2", "10.2", "11.2", "12.3"] },
    { "id": 7, "tasks": ["14.1"] },
    { "id": 8, "tasks": ["14.2", "14.3", "15.1", "16.1", "17.1"] },
    { "id": 9, "tasks": ["19.1", "19.2", "19.3", "19.4", "19.5", "19.6", "19.7", "19.8", "19.9"] }
  ]
}
```
