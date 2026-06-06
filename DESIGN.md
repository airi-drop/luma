---
version: alpha
name: Luma
description: >
  A cozy, customizable personal finance space — not a corporate dashboard.
  Warm earthy tones, soft rounded surfaces, serif display numbers for budget
  hero moments, and a human-first Indonesian voice. Mobile-first (480px max),
  offline-first, with theme and character customization.

colors:
  primary: "#E8A857"
  primary-soft: "#F4D6A0"
  secondary: "#8FB896"
  danger: "#D96C5F"
  canvas: "#1A1410"
  canvas-card: "#2A211B"
  canvas-card-soft: "#342A22"
  on-canvas: "#FFF3DC"
  on-canvas-secondary: "#CDBEA8"
  on-canvas-muted: "#9C8D7B"
  hairline: "#3D3229"

typography:
  hero-number:
    fontFamily: "'Fraunces', Georgia, serif"
    fontSize: 44px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  page-title:
    fontFamily: "'Fraunces', Georgia, serif"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  section-title:
    fontFamily: "'DM Sans', system-ui, sans-serif"
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: 0
  card-title:
    fontFamily: "'DM Sans', system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: 0
  body-md:
    fontFamily: "'DM Sans', system-ui, sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontFamily: "'DM Sans', system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  caption:
    fontFamily: "'DM Sans', system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
  micro-label:
    fontFamily: "'DM Sans', system-ui, sans-serif"
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.04em"

rounded:
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  full: 999px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  default: 16px
  card: 20px
  section: 24px
  large: 32px
  hero: 40px

elevation:
  card-dark: "0 12px 40px rgba(0,0,0,0.28)"
  card-light: "0 12px 32px rgba(92,64,38,0.12)"

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.full}"
    height: 52px
    typography: "{typography.card-title}"
  button-primary-hover:
    backgroundColor: "{colors.primary-soft}"
  button-secondary:
    backgroundColor: "{colors.canvas-card-soft}"
    textColor: "{colors.on-canvas}"
    rounded: "{rounded.full}"
    height: 52px
  card:
    backgroundColor: "{colors.canvas-card}"
    textColor: "{colors.on-canvas}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card}"
  card-hero-budget:
    backgroundColor: "{colors.canvas-card}"
    textColor: "{colors.on-canvas}"
    rounded: "{rounded.xl}"
    padding: "{spacing.card}"
  input:
    backgroundColor: "{colors.canvas-card-soft}"
    textColor: "{colors.on-canvas}"
    rounded: "{rounded.md}"
    height: 52px
  bottom-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.on-canvas-muted}"
    height: 64px
  bottom-nav-active:
    backgroundColor: "{colors.canvas-card-soft}"
    textColor: "{colors.primary}"
  fab:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.full}"
    size: 50px
  bottom-sheet:
    backgroundColor: "{colors.canvas-card}"
    textColor: "{colors.on-canvas}"
    rounded: "{rounded.xl}"
    padding: "{spacing.card}"
---

## Overview

Luma is a cozy, customizable personal finance space — not a corporate
dashboard, not a spreadsheet, not a gamified productivity app. It feels like
*your* space: warm earthy tones, soft rounded surfaces, and a human Indonesian
voice that encourages without judging.

The visual language borrows from cozy room aesthetics — warm amber lighting,
soft shadows, generous padding. Serif display numbers (Fraunces) give budget
hero moments emotional weight, while DM Sans keeps transaction lists and forms
crisp and readable.

Mobile-first (480px max canvas), offline-first, PWA-ready.

## Theme System

Themes come from `src/features/customization/presets.ts`. A theme changes the
mode, surface colors, accent colors, decorative style, hero treatment, chip
colors, shadows, overlays, and mascot tint. Finance data must remain readable
in every preset.

### Pastel Peach

- **id:** `pastel-peach`
- **name:** Pastel Peach
- **mode:** `light`
- **decorativeStyle:** `soft`
- **primary colors:** peach cream canvas `#FFF5EC`, warm ink `#3A2A22`,
  soft card `rgba(255, 255, 255, 0.92)`
- **accent colors:** primary peach `#F29B76`, lavender secondary `#C5A8E8`,
  soft peach `#FFD5B8`
- **mood/personality:** gentle, sunny, and approachable. Best for the default
  cozy personal-space feel with light warmth and soft decorative shapes.

### Cream Latte

- **id:** `cream-latte`
- **name:** Cream Latte
- **mode:** `light`
- **decorativeStyle:** `cafe`
- **primary colors:** warm cream canvas `#FFF3DC`, espresso text `#2B211A`,
  latte soft surface `rgba(247, 231, 204, 0.92)`
- **accent colors:** coffee caramel `#D88938`, sage secondary `#8FB896`,
  cream gold `#F2C879`
- **mood/personality:** calm cafe table, warm brown, steady, and grounded.
  Use for a more neutral cozy look that still feels handmade.

### Sakura Dream

- **id:** `sakura-dream`
- **name:** Sakura Dream
- **mode:** `light`
- **decorativeStyle:** `soft`
- **primary colors:** blush canvas `#FFF5F7`, plum text `#442B35`, petal card
  soft `rgba(251, 230, 236, 0.92)`
- **accent colors:** sakura pink `#E89AAE`, lavender secondary `#B9A0E6`,
  petal soft `#F8C8D4`
- **mood/personality:** dreamy, sweet, pink-lavender, and gentle. It should
  feel expressive without turning financial numbers low contrast.

### Cozy Dark

- **id:** `cozy-dark`
- **name:** Cozy Dark
- **mode:** `dark`
- **decorativeStyle:** `blob`
- **primary colors:** deep warm brown-black `#1A1410`, elevated brown
  `#241C16`, warm cream text `#FFF3DC`
- **accent colors:** warm amber `#E8A857`, sage secondary `#8FB896`, soft amber
  `#F4D6A0`
- **mood/personality:** warm earth dark, low-saturation, restful, and intimate.
  This preserves the original Cozy Dark direction with amber as the strongest
  CTA, active-state, and budget highlight signal.

### Midnight Navy

- **id:** `midnight-navy`
- **name:** Midnight Navy
- **mode:** `dark`
- **decorativeStyle:** `minimal`
- **primary colors:** cool navy canvas `#111827`, elevated navy `#172236`,
  cool white text `#F3F6FF`
- **accent colors:** soft blue `#8DB6FF`, mint secondary `#8FD5C6`, pale blue
  `#C4D9FF`
- **mood/personality:** quiet, focused, cool, and minimal. Use fewer decorative
  shapes and lean on clean spacing, clear contrast, and restrained blue accents.

### Accent Presets

Users can choose from five accent presets: Amber (default), Sage, Rose, Sky,
and Purple. All presets maintain WCAG AA contrast against both dark and light
canvas surfaces.

### Category Colors

Transaction categories map to accent presets for visual grouping:
Food/Living → Amber, Transport → Sky, Entertainment → Purple, Shopping → Rose,
Health → Sage, Giving → Cream Gold, Saving → Green, Other → Muted Brown.

## Character System

Characters are companions, not decoration. They can appear in the home hero,
empty states, loading states, success feedback, splash, report summaries, and
Settings preview. Their copy stays casual, soft, and supportive in Indonesian.

### Otter

- **id:** `otter`
- **name:** Otter
- **style:** `cozy`
- **mood assets:** happy "Otter senyum hangat", chill "Otter santai", worried
  "Otter mikir pelan", panic "Otter kaget lucu", success "Otter kasih tepuk
  kecil"
- **companion copy style:** warm, slow, reassuring, and spacious. Otter frames
  finance review as looking at patterns gently, without making the user feel
  crowded or judged.

### Cat

- **id:** `cat`
- **name:** Cat
- **style:** `cute`
- **mood assets:** happy "Cat kedip manis", chill "Cat duduk kalem", worried
  "Cat melirik saldo", panic "Cat meong panik", success "Cat angkat paw"
- **companion copy style:** tidy, light, and practical. Cat encourages starting
  with one transaction and helps make the month feel easier to organize.

### Bunny

- **id:** `bunny`
- **name:** Bunny
- **style:** `cozy`
- **mood assets:** happy "Bunny lompat kecil", chill "Bunny adem", worried
  "Bunny peluk dompet", panic "Bunny kaget imut", success "Bunny kasih
  confetti mini"
- **companion copy style:** gentle, encouraging, and emotionally soft. Bunny
  treats small transactions as meaningful and keeps monthly reflection light.

### Hamster

- **id:** `hamster`
- **name:** Hamster
- **style:** `minimal`
- **mood assets:** happy "Hamster pipi penuh", chill "Hamster anteng", worried
  "Hamster ngitung pelan", panic "Hamster muter cepat", success "Hamster
  angkat koin"
- **companion copy style:** compact, steady, and cumulative. Hamster focuses on
  small clues adding up and helps the user read patterns step by step.

## Typography

Two-font system. **Fraunces** (variable serif) carries emotional weight on
display moments. **DM Sans** (geometric sans) handles everything functional.

- **Fraunces** for hero budget numbers, app title, section headlines, and
  emotional copy. Always weight 700. The soft optical axis gives it a cozy,
  approachable character.
- **DM Sans** for transaction lists, form inputs, labels, navigation, and
  report data. Weight 400 for body, 600 for micro labels, 700 for card titles.

Type scale is tuned for mobile readability — hero numbers at 44px for instant
budget comprehension, body at 15px for comfortable reading on small screens.

## Layout

Mobile canvas maxes at 480px with safe-area insets. Content padding is 20px
(card inner) with 24px section spacing. Bottom navigation is fixed at 64px
height.

Page structure stacks layers: custom background → gradient overlay → blob
decoration → main content → bottom nav. The background system lets users set
a personal image with automatic blur and overlay to preserve readability.

## Elevation & Depth

Minimal elevation — cards float with a warm-toned shadow, not harsh black
drop shadows. Dark theme uses deep black shadows; light theme uses
warm brown-tinted shadows. No heavy borders; separation comes from background
tone differences.

## Shapes

Generous rounding is a core identity trait — Luma should *feel* soft.

- `sm` (12px) for small controls and chips
- `md` (16px) for inputs
- `lg` (24px) for standard cards
- `xl` (32px) for hero cards and bottom sheets
- `full` (999px) for floating action buttons and primary buttons

## Components

- **`button-primary`** is the pill-shaped CTA (52px height, full radius).
  Only one per screen. Examples: "Simpan Transaksi", "Buat Target".
- **`button-secondary`** for lower-priority actions like AI input or export.
  Filled with canvas-card-soft.
- **`card`** is the standard surface for transaction items, budget summaries,
  and grouped content. 24px radius, 20px padding, subtle shadow.
- **`card-hero-budget`** is the oversized budget summary card on the home
  screen. 32px radius, may include decorative blobs and character illustrations
  that slightly overlap the card edge.
- **`input`** for form fields — 52px height, 16px radius, canvas-card-soft
  background. Labels sit above the input, not as placeholders.
- **`bottom-nav`** with four destinations: Home, Transaksi, Target, Laporan.
  Active state uses primary color icon with a soft pill background.
- **`fab`** (floating action button) — 50px circular, positioned center-bottom
  with the upper portion overlapping the nav edge. Opens the add-transaction
  bottom sheet.
- **`bottom-sheet`** for add transaction, AI input, budget editing, and saving
  progress. Content-based height (max 90vh), 32px top radius, handle bar.

### Transaction Card Rules

The nominal (amount) must be the most scannable element — largest type,
right-aligned, always visible. Category icon, detail, account chip, and mood
badge support it but never compete for attention.

### Character Placement

Characters appear on the home hero (large), empty states (medium), loading
(small animated), and success feedback (small pop-in). Characters must never
cover numbers or appear on every card. Motion is subtle and spring-based.

## Do's and Don'ts

- **Do** use `{colors.primary}` token references in component definitions,
  never hardcode hex values.
- **Do** keep nominal amounts as the most readable element on any finance card.
- **Do** use soft, warm language in all UI copy — "Budget hiburan hampir
  penuh 🎬" not "ANDA MELEBIHI BATAS!"
- **Do** maintain the background overlay on custom backgrounds to ensure
  text readability.
- **Do** support both dark and light themes with the same accent palette.
- **Don't** use pure white (`#FFFFFF`) for text — always use the warm
  on-canvas tones.
- **Don't** add gamification, aggressive warnings, or corporate dashboard
  aesthetics.
- **Don't** place characters over financial data or use them on every card.
- **Don't** nest component variants — `button-primary-hover` is a sibling key,
  not a child of `button-primary`.
- **Don't** introduce colors outside the defined palette and accent presets.
