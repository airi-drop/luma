# Luma Agent Instructions

## Read First
Before implementing anything, read:
- docs/PRD.md
- docs/WORKFLOW.md
- docs/DESIGN_SYSTEM.md
- docs/TECHNICAL_ARCHITECTURE.md
- docs/BUILD_PLAN.md

## Product Direction
Luma is a cozy customizable finance space.

It is not:
- a corporate finance dashboard
- a spreadsheet app
- a hardcore budgeting tool
- a gamified productivity app

## Core UX Rules
- Manual transaction input is the default.
- AI input is secondary and optional.
- AI must never block manual transaction creation.
- Bottom nav must be: Home, Transaksi, Target, Laporan.
- Themes and characters live in Settings.
- Budget is accessed from Home → Budget Detail.
- Keep finance data readable.
- Aesthetic must never reduce usability.
- Do not add gamification unless explicitly requested.
- Do not add login/cloud sync unless explicitly requested.

## Technical Rules
- Use React + Vite + TypeScript.
- Use Tailwind CSS and CSS variables.
- Use Zustand for state.
- Use IndexedDB via idb for primary storage.
- Use localStorage only for lightweight flags.
- Use repository layer for database access.
- Do not access IndexedDB directly from components.
- Mobile-first max width 480px.
- Keep app offline-first.

## Implementation Priority
1. Manual transaction flow
2. Local data persistence
3. Home dashboard
4. Budgeting
5. Saving goals
6. Reports/export
7. Customization
8. AI parser
9. AI insights
10. PWA polish

## Tone
Use casual, soft, supportive Indonesian copy. Avoid aggressive financial warnings.

Good:
- “Budget hiburan hampir penuh 🎬”
- “Tercatat ya ✨”

Bad:
- “ANDA MELEBIHI BATAS!”
- “Pengeluaran gagal dikontrol.”
