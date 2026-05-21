import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type {
  AIInsightRecord,
  AIUsage,
  BackgroundAsset,
  BudgetRecord,
  CharacterConfig,
  RecurringRule,
  SavingGoal,
  SavingGoalContribution,
  ThemeConfig,
  Transaction,
  UserSettings,
} from "../types";

const DB_NAME = "luma-db";
const DB_VERSION = 2;

export interface LumaDBSchema extends DBSchema {
  transactions: {
    key: string;
    value: Transaction;
    indexes: {
      "by-date": string;
      "by-month": string;
      "by-category": Transaction["category"];
      "by-account": Transaction["account"];
      "by-created-at": string;
    };
  };
  budgets: {
    key: string;
    value: BudgetRecord;
    indexes: {
      "by-month": string;
      "by-kind": BudgetRecord["kind"];
      "by-month-kind": string;
      "by-month-category": string;
    };
  };
  savingGoals: {
    key: string;
    value: SavingGoal;
    indexes: {
      "by-status": SavingGoal["status"];
      "by-created-at": string;
    };
  };
  savingGoalContributions: {
    key: string;
    value: SavingGoalContribution;
    indexes: {
      "by-goal-id": string;
      "by-date": string;
    };
  };
  recurringRules: {
    key: string;
    value: RecurringRule;
    indexes: {
      "by-active": number;
      "by-frequency": RecurringRule["frequency"];
    };
  };
  settings: {
    key: string;
    value: UserSettings;
  };
  backgrounds: {
    key: string;
    value: BackgroundAsset;
    indexes: {
      "by-created-at": string;
    };
  };
  characters: {
    key: string;
    value: CharacterConfig;
  };
  themes: {
    key: string;
    value: ThemeConfig;
  };
  aiUsage: {
    key: string;
    value: AIUsage;
    indexes: {
      "by-updated-at": string;
    };
  };
  aiInsights: {
    key: string;
    value: AIInsightRecord;
    indexes: {
      "by-month": string;
      "by-updated-at": string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<LumaDBSchema>> | null = null;

function createStoreIfMissing(
  database: IDBPDatabase<LumaDBSchema>,
  storeName:
    | "transactions"
    | "budgets"
    | "savingGoals"
    | "savingGoalContributions"
    | "recurringRules"
    | "settings"
    | "backgrounds"
    | "characters"
    | "themes"
    | "aiUsage"
    | "aiInsights",
) {
  return database.objectStoreNames.contains(storeName);
}

export function getLumaDb() {
  if (!dbPromise) {
    dbPromise = openDB<LumaDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(database) {
        if (!createStoreIfMissing(database, "transactions")) {
          const store = database.createObjectStore("transactions", {
            keyPath: "id",
          });
          store.createIndex("by-date", "date");
          store.createIndex("by-month", "month");
          store.createIndex("by-category", "category");
          store.createIndex("by-account", "account");
          store.createIndex("by-created-at", "createdAt");
        }

        if (!createStoreIfMissing(database, "budgets")) {
          const store = database.createObjectStore("budgets", {
            keyPath: "id",
          });
          store.createIndex("by-month", "month");
          store.createIndex("by-kind", "kind");
          store.createIndex("by-month-kind", ["month", "kind"]);
          store.createIndex("by-month-category", ["month", "category"]);
        }

        if (!createStoreIfMissing(database, "savingGoals")) {
          const store = database.createObjectStore("savingGoals", {
            keyPath: "id",
          });
          store.createIndex("by-status", "status");
          store.createIndex("by-created-at", "createdAt");
        }

        if (!createStoreIfMissing(database, "savingGoalContributions")) {
          const store = database.createObjectStore("savingGoalContributions", {
            keyPath: "id",
          });
          store.createIndex("by-goal-id", "goalId");
          store.createIndex("by-date", "date");
        }

        if (!createStoreIfMissing(database, "recurringRules")) {
          const store = database.createObjectStore("recurringRules", {
            keyPath: "id",
          });
          store.createIndex("by-active", "active");
          store.createIndex("by-frequency", "frequency");
        }

        if (!createStoreIfMissing(database, "settings")) {
          database.createObjectStore("settings", {
            keyPath: "id",
          });
        }

        if (!createStoreIfMissing(database, "backgrounds")) {
          const store = database.createObjectStore("backgrounds", {
            keyPath: "id",
          });
          store.createIndex("by-created-at", "createdAt");
        }

        if (!createStoreIfMissing(database, "characters")) {
          database.createObjectStore("characters", {
            keyPath: "id",
          });
        }

        if (!createStoreIfMissing(database, "themes")) {
          database.createObjectStore("themes", {
            keyPath: "id",
          });
        }

        if (!createStoreIfMissing(database, "aiUsage")) {
          const store = database.createObjectStore("aiUsage", {
            keyPath: "id",
          });
          store.createIndex("by-updated-at", "updatedAt");
        }

        if (!createStoreIfMissing(database, "aiInsights")) {
          const store = database.createObjectStore("aiInsights", {
            keyPath: "id",
          });
          store.createIndex("by-month", "month");
          store.createIndex("by-updated-at", "updatedAt");
        }
      },
    });
  }

  return dbPromise;
}
