# Structure Steering — Luma

Recommended structure:

```txt
src/
├── app/
├── pages/
├── components/
│   ├── layout/
│   ├── cards/
│   ├── sheets/
│   ├── forms/
│   ├── charts/
│   ├── character/
│   ├── theme/
│   └── ui/
├── features/
│   ├── transactions/
│   ├── budgets/
│   ├── savings/
│   ├── reports/
│   ├── customization/
│   └── ai/
├── stores/
├── db/
├── lib/
├── types/
└── styles/
```

Rules:
- Pages compose features and components.
- Components are reusable and presentation-focused.
- Repositories handle IndexedDB.
- Stores handle client state.
- Features group domain logic.
- Design tokens live in CSS variables/global styles.
