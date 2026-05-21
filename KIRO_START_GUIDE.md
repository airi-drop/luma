# Kiro Start Guide — Luma

## 1. Put these files in your project

```txt
luma/
├── AGENTS.md
├── docs/
│   ├── PRD.md
│   ├── WORKFLOW.md
│   ├── DESIGN_SYSTEM.md
│   ├── TECHNICAL_ARCHITECTURE.md
│   └── BUILD_PLAN.md
└── .kiro/
    └── steering/
        ├── product.md
        ├── tech.md
        └── structure.md
```

## 2. First prompt in Kiro

```txt
Read the docs in /docs and the steering files.

Create Kiro specs for Luma based on docs/BUILD_PLAN.md.

Do not implement code yet.
Only generate specs with requirements.md, design.md, and tasks.md.

Important rules:
- Luma is a cozy customizable finance space.
- Manual transaction input is default.
- AI input is secondary.
- Bottom nav: Home, Transaksi, Target, Laporan.
- Budget is accessed from Home → Budget Detail.
- Themes and characters live in Settings.
- Use IndexedDB as main storage.
- Do not add login, cloud sync, or gamification.
```

## 3. Suggested specs

```txt
spec-01-project-foundation
spec-02-design-system-shell
spec-03-indexeddb-data-layer
spec-04-manual-transaction-flow
spec-05-home-budget-dashboard
spec-06-budget-detail
spec-07-transactions-page
spec-08-saving-goals
spec-09-reports-export
spec-10-customization
spec-11-ai-parser
spec-12-ai-insights
spec-13-pwa-polish
```

## 4. Implementation prompt example

```txt
Use #spec spec-04-manual-transaction-flow.

Implement only the manual transaction flow.
Do not implement AI yet.
Follow the architecture and design system docs.
```

## 5. Review prompt example

```txt
Review the current implementation against docs/PRD.md, docs/WORKFLOW.md, and the active spec.
List any mismatches before making code changes.
```
