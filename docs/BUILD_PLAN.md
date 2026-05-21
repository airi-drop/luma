# Luma — Build Plan
### For Kiro / Codex / AI Coding Agents

## 1. Purpose
Dokumen ini dipakai sebagai pegangan implementasi Luma.

Target:
- agent coding konsisten dengan PRD
- mencegah agent nambah fitur di luar scope
- proses build bertahap dan aman
- finance core jalan sebelum polish aesthetic/AI

## 2. Required Docs
Sebelum coding, agent harus membaca:
```txt
docs/PRD.md
docs/WORKFLOW.md
docs/DESIGN_SYSTEM.md
docs/TECHNICAL_ARCHITECTURE.md
docs/BUILD_PLAN.md
```

## 3. Product Summary
Luma adalah cozy customizable finance space.

Bukan fintech dashboard, spreadsheet app, hardcore budgeting app, atau gamified productivity app.

Fokus utama:
- visual comfort
- customization
- simple finance tracking
- budgeting
- saving goals
- useful reports
- optional AI shortcuts

## 4. Non-Negotiable Rules
Product rules:
1. Manual transaction input is the default.
2. AI input is secondary and optional.
3. AI must never block manual finance flow.
4. Bottom nav must be: Home, Transaksi, Target, Laporan.
5. Themes and characters live in Settings.
6. Budget is accessed from Home → Budget Detail.
7. Do not add gamification unless explicitly requested.
8. Do not add login/cloud sync unless explicitly requested.
9. Keep finance features readable and functional.
10. Aesthetic must never reduce readability.

Technical rules:
1. Use React + Vite + TypeScript.
2. Use IndexedDB as main storage.
3. Use localStorage only for lightweight flags.
4. Use repository layer for IndexedDB access.
5. Do not call IndexedDB directly from UI components.
6. Use Zustand for client state.
7. Use CSS variables for theme system.
8. Use Tailwind for styling.
9. Mobile-first layout max width 480px.
10. Keep app usable offline.

## 5. Recommended Project Structure
```txt
luma/
├── AGENTS.md
├── docs/
│   ├── PRD.md
│   ├── WORKFLOW.md
│   ├── DESIGN_SYSTEM.md
│   ├── TECHNICAL_ARCHITECTURE.md
│   └── BUILD_PLAN.md
├── public/
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── app/
│   ├── pages/
│   ├── components/
│   ├── features/
│   ├── stores/
│   ├── db/
│   ├── lib/
│   ├── types/
│   └── styles/
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## 6. Build Plan Overview
```txt
Sprint 0 — Project Setup
Sprint 1 — Design Foundation
Sprint 2 — IndexedDB + Data Layer
Sprint 3 — Manual Transaction Flow
Sprint 4 — Home Dashboard + Budget Overview
Sprint 5 — Budget Detail + Category Budgets
Sprint 6 — Transactions Page
Sprint 7 — Saving Goals
Sprint 8 — Reports + Exports
Sprint 9 — Customization System
Sprint 10 — Gemini AI Parser
Sprint 11 — AI Behavioral Insights
Sprint 12 — PWA + Polish + QA
```

## 7. Sprint 0 — Project Setup
Goal: setup project clean dan siap dikembangkan.

Tasks:
- create Vite React TypeScript app
- install dependencies
- setup Tailwind
- setup routing
- setup base folder structure
- setup ESLint/Prettier if desired
- create docs folder
- add AGENTS.md

Dependencies:
```txt
react
react-dom
react-router-dom
zustand
idb
nanoid
date-fns
framer-motion
recharts
xlsx
jspdf
html2canvas
vite-plugin-pwa
```

Done when:
- app runs locally
- routes render placeholder pages
- Tailwind works
- docs exist in project

## 8. Sprint 1 — Design Foundation
Goal: bangun visual shell Luma.

Tasks:
- create CSS variables for default theme
- create PageWrapper
- create BottomNav
- create Header
- create Card component
- create Button component
- create Input component
- create BottomSheet component
- create Toast component
- setup max-width mobile container

Components:
```txt
components/layout/PageWrapper.tsx
components/layout/BottomNav.tsx
components/ui/Button.tsx
components/ui/Input.tsx
components/ui/Card.tsx
components/ui/BottomSheet.tsx
components/ui/Toast.tsx
```

Done when:
- app has bottom nav
- pages have consistent layout
- theme tokens apply correctly
- basic UI components reusable

## 9. Sprint 2 — IndexedDB + Data Layer
Goal: membuat local-first data foundation.

Tasks:
- create IndexedDB client
- create object stores
- create TypeScript models
- create repositories
- create basic CRUD functions
- create Zustand stores

Object stores:
```txt
transactions
budgets
savingGoals
savingGoalContributions
recurringRules
settings
backgrounds
characters
themes
aiUsage
```

Done when:
- data persists after refresh
- repositories work independently
- stores can load and update data

## 10. Sprint 3 — Manual Transaction Flow
Goal: manual transaction input jalan sempurna sebelum AI.

Tasks:
- create AddTransactionSheet
- create ManualTransactionForm
- validation
- save transaction to IndexedDB
- update transaction store
- show success toast
- update recent transaction list

Fields:
```txt
nominal
detail
category
account
date
mood
note optional
```

Rules:
- manual form opens first when FAB tapped
- AI must not be primary
- transaction source = manual

Done when:
- user can add transaction manually
- data persists
- Home and Transactions can read data
- validation uses soft copy

## 11. Sprint 4 — Home Dashboard + Budget Overview
Goal: Home terasa personal dan finance summary terbaca jelas.

Tasks:
- create HomePage layout
- create HeroBudgetCard
- create Character area
- create QuickStats row
- create RecentTransactions card
- create FAB
- connect to transaction store
- calculate monthly total
- calculate today total
- calculate top category

Done when:
- Home shows real transaction data
- budget card links to Budget Detail
- FAB opens manual transaction sheet
- layout feels cozy and readable

## 12. Sprint 5 — Budget Detail + Category Budgets
Goal: budgeting bisa dipakai tanpa terasa berat.

Tasks:
- create BudgetDetailPage
- create MonthlyBudgetCard
- create CategoryBudgetList
- create AddEditBudgetSheet
- support total monthly budget
- support category budgets
- calculate used/remaining percentage

Flow:
```txt
Home → Budget Card → Budget Detail → Add/Edit Budget Sheet
```

Done when:
- user can set monthly budget
- user can set Entertainment/Food/etc category budget
- budget progress updates based on transactions
- Home shows budget shortcut and soft warning

## 13. Sprint 6 — Transactions Page
Goal: user bisa scan, search, filter, edit, dan delete transaksi.

Tasks:
- create TransactionsPage
- list transactions by month
- search by detail
- filter by category
- filter by account
- sort latest/oldest/highest/lowest
- edit transaction sheet
- delete confirmation

UX rule: Transactions page lebih functional dan clean daripada Home.

Done when:
- all transactions visible
- filters work
- edit/delete works
- performance okay for monthly data

## 14. Sprint 7 — Saving Goals
Goal: user bisa bikin target tabungan visual.

Tasks:
- create TargetPage
- create SavingGoalCard
- create CreateGoalSheet
- create GoalDetail view/sheet
- add saving contribution
- update progress
- mark completed when target reached

Fields:
```txt
title
targetAmount
currentAmount
icon
deadline optional
note optional
```

Done when:
- user can create saving goal
- user can add progress
- progress updates visually
- completed state works

## 15. Sprint 8 — Reports + Exports
Goal: reports useful untuk casual dan serious users.

Tasks:
- create ReportsPage
- create monthly selector
- create summary cards
- create category chart
- create trend chart
- create budget comparison
- create visual report export
- create spreadsheet export

Export types:
```txt
PDF visual report
.xlsx spreadsheet
.csv spreadsheet
```

XLSX sheets:
```txt
Transactions
Budgets
Saving Goals
Monthly Summary
```

Done when:
- reports reflect real data
- PDF can download
- XLSX/CSV can download
- AI not required yet

## 16. Sprint 9 — Customization System
Goal: user bisa membuat app terasa personal.

Tasks:
- create SettingsPage
- create ThemeCustomizer
- create CharacterCustomizer
- create BackgroundCustomizer
- create overlay opacity control
- store settings in IndexedDB
- use CSS variables for active theme
- handle background image upload/compress/store

Background rules:
- resize max width 1080px
- convert to WebP
- store as Blob in IndexedDB
- overlay mandatory

Done when:
- theme switch works
- character switch works
- background upload works
- readability stays safe

## 17. Sprint 10 — Gemini AI Parser
Goal: tambah AI sebagai shortcut input, bukan dependency.

Tasks:
- create AIQuickInput component
- integrate Gemini API
- create parser prompt
- parse natural language to transaction JSON
- preview parsed result
- allow edit before save
- add AI usage tracking

Flow:
```txt
FAB → Manual Sheet → Pakai AI Cepat → AI Parse → Preview → Confirm Save
```

Rules:
- if AI fails, return to manual
- never auto-save without preview
- output must be normalized
- transaction source = ai

Done when:
- user can parse text input
- AI result can be edited
- AI usage count is tracked
- manual still works without AI

## 18. Sprint 11 — AI Behavioral Insights
Goal: AI memberi insight yang beneran berguna, bukan statistik obvious.

Tasks:
- aggregate monthly data
- create AI insight prompt
- generate behavioral insight
- show AIReflectionCard
- track AI insight usage

AI must detect:
- night spending pattern
- weekend spending pattern
- mood-category correlation
- small frequent spending
- month-over-month change

Avoid:
- repeating chart stats
- generic advice
- financial advisor tone

Done when:
- AI insight feels personal
- AI uses aggregate data
- no raw full history sent unnecessarily

## 19. Sprint 12 — PWA + Polish + QA
Goal: app siap dipakai harian.

Tasks:
- setup manifest
- setup service worker
- cache app shell
- optimize images
- lazy load heavy modules
- test offline mode
- test mobile viewports
- fix accessibility issues
- polish microinteractions

QA viewports:
```txt
360px
390px
430px
480px
```

Done when:
- installable PWA
- works offline for existing data
- smooth on mobile
- no major layout break

## 20. Example Agent Prompts

Setup Project:
```txt
Read AGENTS.md and docs first.
Set up the Luma project using React, Vite, TypeScript, Tailwind, React Router, Zustand, idb, Framer Motion, Recharts, xlsx, jsPDF, html2canvas, and vite-plugin-pwa.
Create the folder structure from docs/TECHNICAL_ARCHITECTURE.md.
Only create placeholder pages for now.
```

Build Manual Transaction Flow:
```txt
Read AGENTS.md and docs first.
Implement Sprint 3 from docs/BUILD_PLAN.md.
Manual transaction input must be the default when tapping FAB.
Do not implement AI yet.
Use IndexedDB repository layer and Zustand store.
Add validation with soft Indonesian copy.
```

Build Budget Detail:
```txt
Read AGENTS.md and docs first.
Implement Sprint 5 from docs/BUILD_PLAN.md.
Budget is accessed from Home → Budget Detail.
Support monthly total budget and category budgets.
Do not create a Budget tab in bottom navigation.
```

Build Customization:
```txt
Read AGENTS.md and docs first.
Implement Sprint 9 from docs/BUILD_PLAN.md.
Themes and characters must live inside Settings.
Background images must be compressed, converted to WebP, and stored as Blob in IndexedDB.
Use overlay opacity to preserve readability.
```

Build AI Parser:
```txt
Read AGENTS.md and docs first.
Implement Sprint 10 from docs/BUILD_PLAN.md.
AI quick input is secondary inside AddTransactionSheet.
Manual input remains default.
AI result must show preview before save.
If AI fails, user can continue manually.
```

## 21. Definition of Done for MVP
MVP dianggap selesai kalau:
- user bisa onboarding
- user bisa catat transaksi manual
- user bisa lihat Home dashboard
- user bisa set monthly budget
- user bisa set category budget
- user bisa lihat/edit/delete transaksi
- user bisa bikin saving goal
- user bisa lihat laporan bulanan
- user bisa download report PDF
- user bisa export spreadsheet
- user bisa custom theme/character/background
- app tetap readable dengan custom background
- app bisa berjalan offline untuk data lokal
- AI parser optional tersedia
- AI insight optional tersedia
- app installable sebagai PWA

## 22. Final Build Direction
Build Luma in this order:
```txt
usable finance core
↓
cozy home experience
↓
budget + saving goals
↓
reports/export
↓
customization
↓
AI
↓
PWA polish
```

Never build it as AI-first app, spreadsheet-first app, gamified productivity app, or corporate finance dashboard.
