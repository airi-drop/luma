# Requirements Document

## Introduction

Sprint 9 implements Luma's **Customization System** — the user space at route `/settings` (accessed only via the gear icon in the Home header, never from BottomNav) where users personalize the app's theme, character, background image, overlay opacity, and background blur. Per `BUILD_PLAN §16`, `PRD §7/§8/§12/§15`, and `WORKFLOW §10–§13`, customization is a **live-preview** experience: every change applies instantly with no "Apply" button. Theme switching mutates CSS variables on `document.documentElement` (`TECHNICAL_ARCHITECTURE §19`). Background images are processed client-side (resize ≤1080px, WebP encoding, Blob storage in IndexedDB — never base64) per `TECHNICAL_ARCHITECTURE §18`. Overlay opacity is clamped to 30–80% (per `DESIGN_SYSTEM §9`) so user customizations never break readability. All persistence flows through Sprint 2's `settingsStore` and `backgroundsRepo`. No new IndexedDB stores are introduced. No network calls are made — Sprint 9 is fully offline.

## Glossary

- **SettingsPage**: The page component rendered at route `/settings`, composing all customization sub-components.
- **SettingsHeader**: A header component with a back button and the "Pengaturan" title, rendered at the top of SettingsPage.
- **ThemeCustomizer**: A grid component displaying 5 preset theme cards with live-preview color swatches.
- **ThemePresetCard**: A single card representing one preset theme, showing its name and color swatches.
- **CharacterCustomizer**: A grid component displaying the 4 default character cards with mood preview.
- **CharacterPresetCard**: A single card representing one default character.
- **BackgroundCustomizer**: A section that lets users upload, preview, and remove the active background image.
- **BackgroundUploader**: The file-input button used to select an image to upload.
- **ReadabilityControls**: A section containing the overlay opacity and background blur sliders.
- **OverlayOpacitySlider**: A range slider that controls `backgroundOverlayOpacity`, clamped to `[0.30, 0.80]`.
- **BackgroundBlurSlider**: A range slider that controls `backgroundBlur`, clamped to `[0, 20]` pixels.
- **DataSection**: A small section at the bottom of SettingsPage containing the "Reset tampilan ke awal" action.
- **themeApplier**: The module (`src/features/customization/themeApplier.ts`) that mutates CSS variables on `document.documentElement` to apply a theme.
- **applyTheme**: The function in themeApplier that writes one preset's tokens to the documentElement.
- **backgroundApplier**: The module (`src/features/customization/backgroundApplier.ts`) that creates and revokes object URLs for the background layer.
- **applyBackground**: The function that sets or clears the background-image on `#luma-bg-layer` using object URLs.
- **imageProcessor**: The module (`src/features/customization/imageProcessor.ts`) that decodes, resizes, and encodes uploaded images.
- **processBackgroundImage**: The function that converts an input File into a WebP `ProcessedImage` (≤1080px wide).
- **initializeCustomizationAppliers**: The boot-time function that subscribes themeApplier and backgroundApplier to settingsStore changes.
- **getCharacterAssetUrl**: The function that resolves a character id + mood state to a static asset URL in `public/characters/`.
- **resetCustomizations**: The action that restores `activeThemeId`, `activeCharacterId`, `backgroundId`, `backgroundBlur`, and `backgroundOverlayOpacity` to canonical defaults.
- **PRESET_THEMES**: The bundled array of 5 ThemePreset objects in `src/lib/themes/presets.ts`.
- **PRESET_CHARACTERS**: The bundled array of 4 CharacterPreset objects in `src/lib/characters/presets.ts`.
- **ThemePreset**: A bundled theme definition `{ id, name, mode, tokens, decorativeStyle }`.
- **CharacterPreset**: A bundled character definition `{ id, name, type, style, assetMap }`.
- **ProcessedImage**: The output of imageProcessor: `{ blob, width, height, sizeBytes }`.
- **ImageProcessingError**: The typed error thrown by imageProcessor with codes `INVALID_TYPE`, `EMPTY_FILE`, `DECODE_FAILED`, `ENCODE_FAILED`.
- **`#luma-bg-layer`**: The fixed-position DOM element rendered once in App.tsx that hosts the background image.
- **settingsStore**: The Sprint 2 Zustand store at `src/stores/settingsStore.ts` (reused, not modified by Sprint 9).
- **backgroundsRepo**: The Sprint 2 repository at `src/db/backgrounds.repo.ts` (reused for Blob persistence).
- **kebab**: The helper that converts camelCase token names like `bgMain` to kebab-case CSS variable names like `bg-main`.

## Requirements

### Requirement 1: Settings Page Route and Composition

**User Story:** As a user, I want a dedicated Settings page reachable from the Home header gear icon (never from the bottom nav), so that customization stays out of the daily finance flow.

#### Acceptance Criteria

1. WHEN a user navigates to the `/settings` route, THE SettingsPage SHALL render the SettingsHeader, ProfileSection, ThemeCustomizer, CharacterCustomizer, BackgroundCustomizer, ReadabilityControls, and DataSection in that vertical order.
2. THE SettingsPage SHALL NOT display the BottomNav.
3. THE HomePage header SHALL contain a settings gear icon button that navigates to `/settings` when tapped.
4. THE BottomNav SHALL NOT contain a Settings tab.
5. WHEN `settingsStore.settings` is null on SettingsPage mount, THE SettingsPage SHALL render a loading skeleton until settings hydrate.
6. ALL copy on SettingsPage SHALL be in soft Indonesian per the project tone (e.g., "Tema", "Karakter", "Background", "Reset tampilan ke awal").

---

### Requirement 2: Theme Customizer

**User Story:** As a user, I want to choose from preset themes and see the change applied immediately, so that I can pick the look that feels right without committing.

#### Acceptance Criteria

1. THE ThemeCustomizer SHALL render exactly 5 ThemePresetCard components, one per entry in PRESET_THEMES: `cozy-dark`, `cream-latte`, `sakura-dream`, `midnight-navy`, `soft-purple`.
2. THE ThemePresetCard whose `id === settings.activeThemeId` SHALL display an active state with a 2px `--accent-primary` border.
3. WHEN the user taps a ThemePresetCard, THE ThemeCustomizer SHALL call `settingsStore.setActiveTheme(themeId)`.
4. WHEN `settings.activeThemeId` changes, THE themeApplier SHALL invoke `applyTheme(theme)` such that for every token name K in `theme.tokens`, `document.documentElement.style.getPropertyValue("--" + kebab(K))` equals `theme.tokens[K]`.
5. WHEN `applyTheme(theme)` runs, THE themeApplier SHALL set `document.documentElement.dataset.themeMode` (or equivalent attribute) to `theme.mode`.
6. THE theme switch SHALL apply within 100ms of the tap (no perceptible delay) without re-rendering React components.
7. THE settingsStore SHALL persist the new `activeThemeId` via `settingsRepo.update` after applying it in memory.
8. EACH ThemePresetCard SHALL display the preset name (Fraunces 16/700) and at least 4 color swatches representing `bgMain`, `bgCard`, `accentPrimary`, `accentSecondary`.

---

### Requirement 3: Character Customizer

**User Story:** As a user, I want to choose from default characters and see how they look across moods, so that I can pick the companion that fits my vibe.

#### Acceptance Criteria

1. THE CharacterCustomizer SHALL render exactly 4 CharacterPresetCard components, one per entry in PRESET_CHARACTERS: `otter`, `cat`, `bunny`, `hamster`.
2. THE CharacterPresetCard whose `id === settings.activeCharacterId` SHALL display an active state with a 2px `--accent-primary` border.
3. EACH CharacterPresetCard SHALL display the character's `happy` mood asset as the thumbnail.
4. WHEN the user taps a CharacterPresetCard, THE CharacterCustomizer SHALL call `settingsStore.setActiveCharacter(characterId)`.
5. WHEN `settings.activeCharacterId` changes, THE Home page Character component SHALL render the new character on its next render via `getCharacterAssetUrl(activeCharacterId, mood)`.
6. THE CharacterCustomizer SHALL display a mood preview strip showing the active character in all 4 mood states (`happy`, `chill`, `worried`, `panic`) using bundled assets.
7. THE settingsStore SHALL persist the new `activeCharacterId` via `settingsRepo.update`.

---

### Requirement 4: Character Asset Resolution

**User Story:** As a developer, I want a single resolver function for character assets, so that any component can render the active character consistently.

#### Acceptance Criteria

1. THE getCharacterAssetUrl function SHALL accept `(characterId: string, mood: CharacterMoodState)` and return a non-empty URL string.
2. WHEN `characterId` matches a known PRESET_CHARACTERS id, THE getCharacterAssetUrl SHALL return `PRESET_CHARACTERS[characterId].assetMap[mood]`.
3. WHEN `characterId` is unknown, THE getCharacterAssetUrl SHALL fall back to `PRESET_CHARACTERS["otter"].assetMap[mood]` and the returned URL SHALL still be non-empty.
4. THE getCharacterAssetUrl function SHALL be pure (no side effects, deterministic output for the same inputs).
5. THE bundled character assets SHALL exist at `public/characters/{id}/{state}.webp` for every combination of `id ∈ {otter, cat, bunny, hamster}` and `state ∈ {happy, chill, worried, panic}`.

---

### Requirement 5: Background Upload — File Selection and Validation

**User Story:** As a user, I want to upload my own image as a background, so that the app feels personal.

#### Acceptance Criteria

1. THE BackgroundUploader SHALL accept files via a hidden `<input type="file" accept="image/jpeg,image/png,image/webp">` triggered by a styled button.
2. WHEN the user selects a file whose `type` is NOT one of `image/jpeg`, `image/png`, `image/webp`, THE BackgroundUploader SHALL reject the file before invoking imageProcessor and SHALL show a soft toast "Format gambar belum didukung ya 🙏".
3. WHEN the user selects a file whose `size === 0`, THE imageProcessor SHALL throw `ImageProcessingError("EMPTY_FILE")` and the SettingsPage SHALL show a soft error toast.
4. WHILE an upload is in progress, THE BackgroundUploader SHALL display a loading state on the upload button and disable it.

---

### Requirement 6: Background Image Processing

**User Story:** As a user, I want the app to handle large images for me by compressing and converting them, so that performance and storage stay healthy.

#### Acceptance Criteria

1. WHEN processBackgroundImage runs on a valid input file with `srcWidth > 1080`, THE processBackgroundImage SHALL produce a result whose `width === 1080` and `height === Math.round(srcHeight * (1080 / srcWidth))`.
2. WHEN processBackgroundImage runs on a valid input file with `srcWidth ≤ 1080`, THE processBackgroundImage SHALL produce a result whose `width === srcWidth` (no upscaling).
3. THE processBackgroundImage SHALL produce a result whose `blob.type === "image/webp"`.
4. THE processBackgroundImage SHALL produce a result whose aspect ratio differs from the source aspect ratio by no more than 1% (within rounding).
5. THE processBackgroundImage SHALL invoke `canvas.toBlob` (or `OffscreenCanvas.convertToBlob`) with `quality === 0.85`.
6. WHEN the resulting blob's `size > 5_000_000`, THE processBackgroundImage SHALL log a console warning but SHALL still resolve successfully with the produced blob.
7. WHEN `createImageBitmap` rejects, THE processBackgroundImage SHALL throw `ImageProcessingError("DECODE_FAILED")`.
8. WHEN canvas encoding produces a null or empty blob, THE processBackgroundImage SHALL throw `ImageProcessingError("ENCODE_FAILED")`.
9. THE processBackgroundImage SHALL NOT mutate the input File argument.

---

### Requirement 7: Background Persistence and Activation

**User Story:** As a user, I want my chosen background to persist across sessions, so that I see it every time I open the app.

#### Acceptance Criteria

1. AFTER processBackgroundImage resolves, THE SettingsPage SHALL call `backgroundsRepo.create({ name, blob, mimeType: "image/webp", width, height })` to persist the asset.
2. AFTER `backgroundsRepo.create` resolves, THE SettingsPage SHALL call `settingsStore.setBackground(asset.id)` to activate it.
3. THE backgroundsRepo SHALL store the image as a `Blob`, NOT as a base64 string.
4. WHEN `settings.backgroundId` changes to a non-null id, THE backgroundApplier SHALL call `applyBackground(asset, layerEl, currentObjectURL)` to set the new background on `#luma-bg-layer`.
5. WHEN `settings.backgroundId` changes to `undefined`, THE backgroundApplier SHALL call `applyBackground(null, layerEl, currentObjectURL)` to clear the background-image on `#luma-bg-layer`.
6. THE applyBackground function SHALL revoke the previous object URL via `URL.revokeObjectURL` exactly once whenever a new asset is applied or the background is cleared.
7. AT MOST ONE active object URL SHALL exist for the background layer at any moment after applyBackground returns.
8. AFTER any successful upload, THE SettingsPage SHALL show a toast "Background terpasang ✨".

---

### Requirement 8: Background Removal

**User Story:** As a user, I want to clear my custom background, so that I can return to the plain themed look.

#### Acceptance Criteria

1. WHEN `settings.backgroundId` is non-null, THE BackgroundCustomizer SHALL render a "Hapus background" secondary button.
2. WHEN the user taps "Hapus background", THE BackgroundCustomizer SHALL call `settingsStore.setBackground(undefined)`.
3. WHEN `settings.backgroundId` becomes undefined, THE backgroundApplier SHALL clear `#luma-bg-layer.style.backgroundImage` and revoke the prior object URL.
4. CLEARING the active background SHALL NOT delete the BackgroundAsset record from the `backgrounds` IndexedDB store.

---

### Requirement 9: Overlay Opacity Slider

**User Story:** As a user, I want to control how strong the readability overlay is, so that I can balance aesthetic and clarity.

#### Acceptance Criteria

1. THE OverlayOpacitySlider SHALL be a `<input type="range">` with `min === 0.30`, `max === 0.80`, `step === 0.05`.
2. THE OverlayOpacitySlider current value SHALL equal `settings.backgroundOverlayOpacity`.
3. WHEN the user drags the slider, THE OverlayOpacitySlider SHALL call `settingsStore.update({ backgroundOverlayOpacity: clamp(value, 0.30, 0.80) })` on every input event.
4. AFTER any update, `settings.backgroundOverlayOpacity` SHALL satisfy `0.30 ≤ value ≤ 0.80`.
5. WHEN `settings.backgroundOverlayOpacity` changes, THE themeApplier SHALL set `document.documentElement.style.getPropertyValue("--overlay-opacity")` to `String(value)`.
6. THE OverlayOpacitySlider SHALL display the current value as a percentage chip beside the label (e.g., "65%").

---

### Requirement 10: Background Blur Slider

**User Story:** As a user, I want to optionally blur my background, so that the foreground content is easier to read.

#### Acceptance Criteria

1. THE BackgroundBlurSlider SHALL be a `<input type="range">` with `min === 0`, `max === 20`, `step === 1`.
2. THE BackgroundBlurSlider current value SHALL equal `settings.backgroundBlur`.
3. WHEN the user drags the slider, THE BackgroundBlurSlider SHALL call `settingsStore.update({ backgroundBlur: clamp(value, 0, 20) })` on every input event.
4. AFTER any update, `settings.backgroundBlur` SHALL satisfy `0 ≤ value ≤ 20`.
5. WHEN `settings.backgroundBlur` changes, THE themeApplier SHALL set `document.documentElement.style.getPropertyValue("--background-blur")` to `${value}px`.
6. THE BackgroundBlurSlider SHALL display the current value as a chip beside the label (e.g., "8px").

---

### Requirement 11: Reset to Defaults

**User Story:** As a user, I want to reset my customizations with one tap, so that I can recover quickly if my chosen look stops working for me.

#### Acceptance Criteria

1. THE DataSection SHALL render a tertiary-style "Reset tampilan ke awal" button.
2. WHEN the user taps the reset button, THE DataSection SHALL open a ConfirmSheet with the body "Yakin balikin ke tampilan default? Theme, karakter, dan background kamu akan dikembalikan."
3. WHEN the user confirms, THE resetCustomizations action SHALL call `settingsStore.update` with: `{ activeThemeId: "cozy-dark", activeCharacterId: "otter", backgroundId: undefined, backgroundBlur: 0, backgroundOverlayOpacity: 0.72 }`.
4. AFTER reset, THE settings SHALL satisfy ALL of: `activeThemeId === "cozy-dark"`, `activeCharacterId === "otter"`, `backgroundId === undefined`, `backgroundBlur === 0`, `backgroundOverlayOpacity === 0.72`.
5. AFTER reset, THE BackgroundAsset records in IndexedDB SHALL remain unchanged.
6. AFTER reset, THE SettingsPage SHALL show a toast "Tampilan dikembalikan ke awal ✨".

---

### Requirement 12: Boot-Time Wiring

**User Story:** As a user, I want my saved customizations to apply automatically when I open the app, so that the app remembers my preferences.

#### Acceptance Criteria

1. THE App component SHALL call `settingsStore.hydrate()` exactly once on mount.
2. AFTER `hydrate()` resolves, THE App SHALL call `initializeCustomizationAppliers()` to register the settings subscription.
3. ON the first invocation of the subscription callback, THE themeApplier SHALL apply the persisted theme.
4. ON the first invocation of the subscription callback, THE themeApplier SHALL set `--overlay-opacity` and `--background-blur` to the persisted values.
5. ON the first invocation of the subscription callback (when `settings.backgroundId` is non-null), THE backgroundApplier SHALL load the BackgroundAsset via `backgroundsRepo.getById` and set the background-image.
6. THE App SHALL render the `<div id="luma-bg-layer">` element exactly once and BEFORE other routed content in the DOM order.
7. WHEN the App component unmounts (test scenarios), THE unsubscribe function returned by `initializeCustomizationAppliers` SHALL be invoked.

---

### Requirement 13: Settings Persistence (Round-Trip)

**User Story:** As a user, I want my customization choices to survive a refresh, so that my personal space is reliable.

#### Acceptance Criteria

1. AFTER any successful customization change (theme, character, background, overlay, blur), THE settingsStore SHALL invoke `settingsRepo.update` to persist the new values.
2. WHEN the app is restarted (settingsStore re-instantiated), THE `settingsStore.hydrate()` SHALL load the previously persisted `UserSettings` such that `state.settings` matches what was persisted.
3. THE persisted `state.settings.id` SHALL always equal `"main"` (the singleton invariant from Sprint 2).
4. AFTER hydration on restart, THE customization appliers SHALL produce the same DOM state (CSS variables and background image) that existed before restart.

---

### Requirement 14: Error Handling

**User Story:** As a user, I want the app to handle background processing failures gracefully, so that I'm never stuck or shown a scary error.

#### Acceptance Criteria

1. WHEN imageProcessor throws `ImageProcessingError("INVALID_TYPE")`, THE SettingsPage SHALL show a toast "Format gambar belum didukung ya 🙏" and SHALL NOT change `settings.backgroundId`.
2. WHEN imageProcessor throws `ImageProcessingError("DECODE_FAILED")`, THE SettingsPage SHALL show a toast "Gagal memproses gambar, coba lagi ya" and SHALL NOT change `settings.backgroundId`.
3. WHEN imageProcessor throws `ImageProcessingError("ENCODE_FAILED")`, THE SettingsPage SHALL show a toast "Browser belum support WebP. Coba update browser ya." and SHALL NOT change `settings.backgroundId`.
4. WHEN `backgroundsRepo.create` rejects, THE SettingsPage SHALL show a toast "Gagal nyimpen background, coba sekali lagi ya." and SHALL NOT change `settings.backgroundId`.
5. WHEN `settings.activeThemeId` is unknown to PRESET_THEMES, THE themeApplier SHALL fall back to `"cozy-dark"` and log a console warning.
6. WHEN `settings.activeBackgroundId` references an asset that no longer exists in `backgrounds`, THE backgroundApplier SHALL clear `#luma-bg-layer.style.backgroundImage` and SHALL NOT throw.
7. AFTER any error, THE SettingsPage SHALL reset its `isUploading` state to `false`.

---

### Requirement 15: No Network Calls

**User Story:** As a user, I want customization to work entirely offline, so that I can personalize the app on a flight or with no service.

#### Acceptance Criteria

1. THE SettingsPage and all customization components SHALL perform all operations exclusively against `settingsStore`, `backgroundsRepo`, and `document.documentElement` — without any `fetch`, `XMLHttpRequest`, or external network calls.
2. THE imageProcessor SHALL operate entirely on the input File via in-browser canvas APIs, with no network calls.
3. THE bundled theme presets and character assets SHALL be served from the app's static bundle (`/characters/...`), not from a remote URL.

---

### Requirement 16: Mobile-First Layout

**User Story:** As a user on my phone, I want the Settings page to fit my screen comfortably, so that I can customize without zooming or scrolling sideways.

#### Acceptance Criteria

1. THE SettingsPage SHALL render correctly within a 480px max-width container per `BUILD_PLAN §10` (technical rule 9).
2. THE ThemeCustomizer SHALL use a 2-column grid on viewports `≤ 480px`.
3. THE CharacterCustomizer SHALL use a 2-column grid on viewports `≤ 480px`.
4. ALL tap targets in SettingsPage (preset cards, sliders, buttons) SHALL be at least 44px in their smallest dimension per `DESIGN_SYSTEM §19`.
5. THE SettingsPage layout SHALL not overflow horizontally at viewports of 360px, 390px, 430px, and 480px.

---

### Requirement 17: Performance

**User Story:** As a user, I want theme and slider changes to feel instant, so that customization is fun rather than laggy.

#### Acceptance Criteria

1. THE applyTheme function SHALL complete its DOM mutations synchronously within a single function call.
2. THE OverlayOpacitySlider and BackgroundBlurSlider SHALL update CSS variables on every input event without debouncing.
3. THE settingsStore SHALL debounce the underlying `settingsRepo.update` write for slider continuous changes by at least 250ms (so dragging produces at most a few IDB writes, not one per pixel).
4. THE imageProcessor module SHALL be loaded via dynamic `import()` so it is NOT included in the initial SettingsPage bundle.
5. THE bundled character assets SHALL each be ≤ 30KB in size (WebP).
