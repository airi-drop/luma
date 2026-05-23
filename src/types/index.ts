export const ACCOUNT_TYPES = [
  "Cash",
  "E-wallet",
  "BNI",
  "BCA",
  "Mandiri",
  "Other",
] as const;

export const CATEGORY_TYPES = [
  "Food",
  "Transport",
  "Entertainment",
  "Shopping",
  "Health",
  "Giving",
  "Saving",
  "Other",
] as const;

export const MOOD_TYPES = ["😊", "😐", "😬", "😭", "🤩"] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];
export type CategoryType = (typeof CATEGORY_TYPES)[number];
export type MoodType = (typeof MOOD_TYPES)[number];
export type TransactionSource = "manual" | "ai" | "recurring";

export interface Transaction {
  id: string;
  date: string;
  month: string;
  createdAt: string;
  updatedAt: string;
  detail: string;
  nominal: number;
  account: AccountType;
  category: CategoryType;
  mood?: MoodType;
  note?: string;
  source: TransactionSource;
  isRecurring?: boolean;
  recurringRuleId?: string;
}

export interface CreateTransactionInput {
  date: string;
  detail: string;
  nominal: number;
  account: AccountType;
  category: CategoryType;
  mood?: MoodType;
  note?: string;
  source?: TransactionSource;
  isRecurring?: boolean;
  recurringRuleId?: string;
}

export type UpdateTransactionInput = Partial<CreateTransactionInput>;

export interface TransactionSearchParams {
  month?: string;
  category?: CategoryType;
  account?: AccountType;
  query?: string;
}

interface BaseBudgetRecord {
  id: string;
  month: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyBudget extends BaseBudgetRecord {
  kind: "monthly";
  totalBudget: number;
}

export interface CategoryBudget extends BaseBudgetRecord {
  kind: "category";
  category: CategoryType;
  limit: number;
  resetMonthly: boolean;
}

export type BudgetRecord = MonthlyBudget | CategoryBudget;

export interface SavingGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  deadline?: string;
  note?: string;
  status: "active" | "completed" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavingGoalInput {
  title: string;
  targetAmount: number;
  currentAmount?: number;
  icon: string;
  deadline?: string;
  note?: string;
}

export interface UpdateSavingGoalInput
  extends Partial<CreateSavingGoalInput> {
  status?: SavingGoal["status"];
}

export interface SavingGoalContribution {
  id: string;
  goalId: string;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
}

export interface AddSavingContributionInput {
  goalId: string;
  amount: number;
  date: string;
  note?: string;
}

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

export type AIProvider = "gemini" | "openai" | "openrouter";

export type UpdateUserSettingsInput = Partial<
  Omit<UserSettings, "id" | "createdAt" | "updatedAt">
>;

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

export interface CreateBackgroundAssetInput {
  name: string;
  blob: Blob;
  mimeType: BackgroundAsset["mimeType"];
  width: number;
  height: number;
  sizeBytes: number;
}

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

export interface ThemeConfig {
  id: string;
  name: string;
  mode: "dark" | "light";
  tokens: Record<string, string>;
  decorativeStyle: "blob" | "soft" | "minimal" | "stage" | "cafe";
}

export interface AIUsage {
  id: string;
  aiInputCount: number;
  aiInsightCount: number;
  updatedAt: string;
}

export interface AIInsightRecord {
  id: string;
  month: string;
  headline: string;
  reflection: string;
  action: string;
  types: string[];
  aggregateSignature: string;
  generatedAt: string;
  updatedAt: string;
}

export interface BudgetUsageSummary {
  limit: number;
  used: number;
  remaining: number;
  percentage: number;
}

export interface CategoryTotal {
  category: CategoryType;
  total: number;
}

export interface SavingGoalProgress {
  savedAmount: number;
  targetAmount: number;
  remainingAmount: number;
  percentage: number;
  isCompleted: boolean;
}
