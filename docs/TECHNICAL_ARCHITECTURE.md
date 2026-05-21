# Luma — Technical Architecture v1
### Cozy Customizable Finance Space · Mobile-First PWA

## 1. Architecture Goal
Luma harus mobile-first, offline-first, cepat dibuka, aman untuk data lokal, gampang dikembangkan oleh agent/coding assistant, dan siap untuk freemium AI di masa depan.

Core principle:
> Manual finance features harus tetap berjalan penuh tanpa AI dan tanpa internet.

## 2. Recommended Tech Stack
Frontend:
```txt
React
Vite
TypeScript
React Router
```

Styling:
```txt
Tailwind CSS
CSS Variables
Framer Motion
```

State management:
```txt
Zustand
```

Local database:
```txt
IndexedDB via idb
```

Lightweight preferences:
```txt
localStorage
```

Charts:
```txt
Recharts
```

Export:
```txt
PDF: browser print / html2canvas + jsPDF
Spreadsheet: xlsx
CSV: custom generator
```

AI:
```txt
Gemini API
```

PWA:
```txt
vite-plugin-pwa
```

## 3. High-Level App Structure
```txt
src/
├── app/
│   ├── App.tsx
│   ├── routes.tsx
│   └── providers.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── TransactionsPage.tsx
│   ├── TargetPage.tsx
│   ├── ReportsPage.tsx
│   ├── SettingsPage.tsx
│   └── BudgetDetailPage.tsx
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

## 4. Routing Structure
```txt
/                 → onboarding gate or home
/home             → HomePage
/transactions     → TransactionsPage
/target           → TargetPage
/reports          → ReportsPage
/settings         → SettingsPage
/budget           → BudgetDetailPage
```

Navigation rules:
- Bottom nav only shows Home, Transaksi, Target, Laporan.
- Settings is accessed from Home header.
- Budget is accessed from Home budget card.
- Add transaction is a bottom sheet, not a route.

## 5. Data Storage Strategy
IndexedDB as main storage for:
- transactions
- budgets
- saving goals
- recurring rules
- settings
- character config
- theme config
- background images

localStorage only for:
- onboardingCompleted
- activeThemeId fallback
- lastOpenedVersion

Do not store transactions in localStorage.

## 6. IndexedDB Database
Database name:
```txt
luma-db
```

Version:
```txt
1
```

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

## 7. TypeScript Data Models

### Transaction
```ts
export type AccountType =
  | "Cash"
  | "E-wallet"
  | "BNI"
  | "BCA"
  | "Mandiri"
  | "Other";

export type CategoryType =
  | "Food"
  | "Transport"
  | "Entertainment"
  | "Shopping"
  | "Health"
  | "Giving"
  | "Saving"
  | "Other";

export type MoodType = "😊" | "😐" | "😬" | "😭" | "🤩";

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  createdAt: string;
  updatedAt: string;
  detail: string;
  nominal: number;
  account: AccountType;
  category: CategoryType;
  mood?: MoodType;
  note?: string;
  source: "manual" | "ai" | "recurring";
  isRecurring?: boolean;
  recurringRuleId?: string;
}
```

### Budget
```ts
export interface MonthlyBudget {
  id: string;
  month: string; // YYYY-MM
  totalBudget: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryBudget {
  id: string;
  month: string; // YYYY-MM
  category: CategoryType;
  limit: number;
  createdAt: string;
  updatedAt: string;
}
```

### Saving Goal
```ts
export interface SavingGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  deadline?: string; // YYYY-MM-DD
  note?: string;
  status: "active" | "completed" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface SavingGoalContribution {
  id: string;
  goalId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt: string;
}
```

### Recurring Rule
```ts
export interface RecurringRule {
  id: string;
  detail: string;
  nominal: number;
  account: AccountType;
  category: CategoryType;
  mood?: MoodType;
  frequency: "daily" | "weekly" | "monthly";
  dayOfWeek?: number;
  dayOfMonth?: number;
  active: boolean;
  lastRunDate?: string;
  createdAt: string;
  updatedAt: string;
}
```

### User Settings
```ts
export interface UserSettings {
  id: "main";
  name: string;
  currency: "IDR";
  themeMode: "dark" | "light" | "auto";
  activeThemeId: string;
  activeCharacterId: string;
  backgroundId?: string;
  backgroundBlur: number;
  backgroundOverlayOpacity: number;
  mascotEnabled: boolean;
  aiEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Background Asset
```ts
export interface BackgroundAsset {
  id: string;
  name: string;
  blob: Blob;
  mimeType: "image/webp" | "image/jpeg" | "image/png";
  width: number;
  height: number;
  sizeBytes: number;
  createdAt: string;
}
```

### Character Config
```ts
export interface CharacterConfig {
  id: string;
  name: string;
  type: "default" | "custom" | "premium";
  style: "cute" | "cozy" | "idol" | "anime" | "pixel" | "minimal";
  assetMap: {
    happy: string;
    chill: string;
    worried: string;
    panic: string;
    thinking?: string;
    success?: string;
  };
}
```

### Theme Config
```ts
export interface ThemeConfig {
  id: string;
  name: string;
  mode: "dark" | "light";
  tokens: Record<string, string>;
  decorativeStyle: "blob" | "soft" | "minimal" | "stage" | "cafe";
}
```

### AI Usage
```ts
export interface AIUsage {
  id: string; // YYYY-MM
  aiInputCount: number;
  aiInsightCount: number;
  updatedAt: string;
}
```

## 8. IndexedDB Indexes
transactions indexes:
```txt
date
month
category
account
createdAt
```

budgets indexes:
```txt
month
category
```

savingGoals indexes:
```txt
status
createdAt
```

recurringRules indexes:
```txt
active
frequency
```

aiUsage indexes:
```txt
id
```

## 9. Repository Layer
Do not access IndexedDB directly from components.

Use repository files:
```txt
transactions.repo.ts
budgets.repo.ts
savings.repo.ts
settings.repo.ts
backgrounds.repo.ts
```

Example API shape:
```ts
export const transactionRepo = {
  create(input: CreateTransactionInput): Promise<Transaction>;
  update(id: string, input: UpdateTransactionInput): Promise<Transaction>;
  remove(id: string): Promise<void>;
  getById(id: string): Promise<Transaction | undefined>;
  listByMonth(month: string): Promise<Transaction[]>;
  search(params: TransactionSearchParams): Promise<Transaction[]>;
};
```

## 10. Zustand Store Strategy
transactionStore:
- current month transactions
- create/update/delete transaction
- filters
- derived monthly totals

budgetStore:
- monthly budget
- category budgets
- budget usage calculation

savingGoalStore:
- goals list
- create/update/archive goal
- add contribution

settingsStore:
- user settings
- active theme
- active character
- background config

uiStore:
- active bottom sheet
- modal states
- toast states
- current selected month

## 11. Derived Calculations
Keep calculations in selectors/helper functions.

```txt
getMonthlyTotal(transactions)
getTodayTotal(transactions)
getCategoryTotals(transactions)
getTopCategory(transactions)
getBudgetUsage(monthlyBudget, transactions)
getCategoryBudgetUsage(categoryBudget, transactions)
getRemainingBudget(totalBudget, transactions)
getSavingGoalProgress(goal)
```

## 12. AI Architecture
AI must be optional. If AI fails, show soft error, keep manual form available, and never block transaction creation.

AI features:
- transaction parser
- behavioral monthly reflection

Gemini parser expected output:
```json
{
  "detail": "Bakso",
  "nominal": 15000,
  "account": "Cash",
  "category": "Food",
  "confidence": 0.92
}
```

AI parser rules:
- Output JSON only.
- Do not invent data if unclear.
- Use IDR.
- Normalize slang amounts: 15rb → 15000, 15k → 15000, 1.5jt → 1500000.
- Use closest category.
- Ask user to confirm via preview UI.

AI insight input must use aggregated monthly data, not raw full history unless needed.

Good AI insights detect:
- spending malam hari
- weekend impulse
- mood correlation
- small-but-frequent spending
- category growth month-over-month

## 13. AI Freemium-Ready Usage Limit
MVP can implement usage tracking without paywall first.

Example:
```txt
AI input: 10/month
AI insight: 3/month
```

Premium future:
```txt
AI input unlimited
advanced AI insights
premium visual reports
premium characters/themes
```

Store usage in `aiUsage`.

## 14. Manual Transaction Validation
Required:
- nominal > 0
- detail not empty
- category selected
- account selected
- date valid

Optional:
- mood
- note

Error tone example:
> “Nominalnya belum diisi nih.”

## 15. Budget Logic
Monthly budget: one monthly budget per month.

Category budget: multiple category budgets per month; each category can only have one budget entry per month.

Budget usage:
```txt
used = sum(transactions where transaction.month === budget.month)
remaining = totalBudget - used
percentage = used / totalBudget
```

Category usage:
```txt
used = sum(transactions where month and category match)
percentage = used / categoryLimit
```

## 16. Saving Goal Logic
Goal progress:
```txt
progress = currentAmount / targetAmount
```

When user adds saving progress:
1. create SavingGoalContribution
2. update goal.currentAmount
3. if currentAmount >= targetAmount → status completed

Recommended MVP: keep saving goals separate from expense transactions to avoid confusion.

## 17. Reports Logic
Monthly summary inputs:
- transactions by month
- monthly budget
- category budgets
- saving goals

Outputs:
- total spending
- remaining budget
- top category
- biggest transaction
- daily trend
- category totals
- mood spending map
- budget usage

Visual report: render hidden report component → convert to canvas/image or PDF → download.

Spreadsheet export supports `.xlsx` and `.csv`.

XLSX sheets:
```txt
Transactions
Budgets
Saving Goals
Monthly Summary
```

## 18. Image Handling
Background upload flow:
```txt
select image
↓
load in browser
↓
resize max width 1080px
↓
convert to WebP
↓
store Blob in IndexedDB
↓
save backgroundId in settings
```

Rules:
- never store base64 for background
- use Blob
- revoke object URLs when not needed
- show fallback if image load fails

## 19. Theme System Implementation
Themes should be CSS variable driven.

Example:
```ts
document.documentElement.style.setProperty("--bg-main", theme.tokens.bgMain);
```

Benefits:
- fast theme switching
- no component rewrite
- easier future theme packs

## 20. Character System Implementation
MVP uses built-in SVG/PNG/WebP assets.

Character state resolver:
```ts
function getCharacterState(budgetPercentageUsed: number) {
  if (budgetPercentageUsed < 0.5) return "happy";
  if (budgetPercentageUsed < 0.75) return "chill";
  if (budgetPercentageUsed < 1) return "worried";
  return "panic";
}
```

Placement:
```tsx
<Character state="happy" size="large" />
```

## 21. PWA Strategy
MVP PWA features:
- installable
- offline shell
- cached assets
- local data available offline

Do not add in MVP:
- push notification
- cloud sync
- background sync

## 22. Error Handling
Use soft and helpful errors.

Examples:
```txt
“Gagal nyimpen, coba sekali lagi ya.”
“AI lagi susah nangkep. Bisa edit manual dulu.”
“Background terlalu besar, kita coba kompres dulu.”
```

## 23. Performance Rules
Required:
- first load fast
- lazy load reports/charts
- lazy load AI module
- compress background images
- avoid heavy animation loops
- memoize derived calculations
- paginate or virtualize very long transaction lists later

## 24. Security Notes
Do not ship long-term production app with exposed Gemini key.

MVP options:
- local env during development
- simple backend proxy later
- Cloudflare Worker / Supabase Edge Function for production

Privacy:
- user financial data stays local by default
- AI receives only necessary text/aggregates
- do not send full raw transaction history unless user explicitly triggers insight

## 25. Testing Checklist
Unit tests:
- format currency
- parse dates/months
- budget calculations
- category totals
- saving goal progress

Integration tests:
- create transaction
- edit transaction
- delete transaction
- set budget
- create saving goal
- export report

Manual QA:
- mobile viewport 360px
- mobile viewport 390px
- mobile viewport 430px
- dark theme
- light theme
- custom background readability
- offline mode
- refresh after saving data

## 26. Agent Implementation Rules
1. Read docs before coding.
2. Implement manual finance flow before AI.
3. Use IndexedDB repositories, not direct component DB calls.
4. Keep bottom nav fixed: Home, Transaksi, Target, Laporan.
5. Keep customization inside Settings.
6. Keep budget detail accessed from Home.
7. Use CSS variables for themes.
8. Do not add cloud sync/login unless requested.
9. Do not overbuild gamification.
10. Prioritize mobile UX and readability.

## 27. Recommended Build Order
```txt
1. Project setup
2. Design tokens + layout shell
3. IndexedDB client + repositories
4. Zustand stores
5. Manual transaction CRUD
6. Home dashboard
7. Budget system
8. Saving goals
9. Reports + exports
10. Customization system
11. Gemini AI parser
12. AI insights
13. PWA polish
```

## 28. Final Technical Direction
Luma should be built as a local-first, mobile-first, highly customizable PWA with solid finance primitives and optional AI shortcuts.

The app must stay useful even when AI is disabled, internet is unavailable, or user never customizes anything.
