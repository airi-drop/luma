import { transactionsRepo } from "../../db/repositories/transactions.repo";
import { budgetsRepo } from "../../db/repositories/budgets.repo";
import type {
  AccountType,
  CategoryType,
  CreateTransactionInput,
  MoodType,
} from "../../types";

interface CategoryTemplate {
  category: CategoryType;
  details: string[];
  account: AccountType[];
  /** Range nominal in Rupiah */
  range: [number, number];
  /** Approx weight per month (jumlah transaksi per kategori) */
  weight: number;
}

const TEMPLATES: CategoryTemplate[] = [
  {
    category: "Food",
    details: [
      "Kopi sore",
      "Bakso langganan",
      "Gofood lunch",
      "Sarapan nasi uduk",
      "Mie ayam",
      "Bubur ayam",
      "Cemilan kantor",
      "Makan malam keluarga",
      "Es teh + gorengan",
    ],
    account: ["Cash", "E-wallet", "BCA"],
    range: [12000, 95000],
    weight: 12,
  },
  {
    category: "Transport",
    details: [
      "Gojek ke kantor",
      "Bensin motor",
      "Parkir mall",
      "Grab pulang",
      "Tol weekend",
      "Tarik tunai parkir",
    ],
    account: ["E-wallet", "Cash"],
    range: [8000, 75000],
    weight: 6,
  },
  {
    category: "Entertainment",
    details: [
      "Bioskop weekend",
      "Streaming bulanan",
      "Album favorit",
      "Game DLC",
      "Konser kecil",
    ],
    account: ["BCA", "E-wallet", "Mandiri"],
    range: [35000, 350000],
    weight: 3,
  },
  {
    category: "Shopping",
    details: [
      "Skincare malam",
      "Kaos baru",
      "Buku novel",
      "Aksesoris HP",
      "Perlengkapan rumah",
    ],
    account: ["BCA", "Mandiri", "E-wallet"],
    range: [45000, 480000],
    weight: 3,
  },
  {
    category: "Health",
    details: ["Vitamin", "Apotek", "Konsul dokter", "Olahraga harian"],
    account: ["E-wallet", "Cash"],
    range: [25000, 220000],
    weight: 2,
  },
  {
    category: "Giving",
    details: ["Patungan kado", "Sumbangan kecil", "Bantu teman"],
    account: ["Cash", "E-wallet"],
    range: [20000, 150000],
    weight: 1,
  },
  {
    category: "Saving",
    details: ["Pindah ke tabungan", "Setor target traveling"],
    account: ["BCA", "Mandiri"],
    range: [100000, 750000],
    weight: 2,
  },
  {
    category: "Other",
    details: ["Iuran kos", "Pulsa", "Listrik prabayar"],
    account: ["E-wallet", "BCA"],
    range: [50000, 350000],
    weight: 2,
  },
];

const MOODS: MoodType[] = ["😊", "😐", "😬", "😭", "🤩"];

function pickFrom<T>(items: readonly T[], rand: () => number) {
  return items[Math.floor(rand() * items.length)];
}

function randomBetween(min: number, max: number, rand: () => number) {
  const value = min + (max - min) * rand();
  // Round to nearest 500 to feel realistic
  return Math.max(min, Math.round(value / 500) * 500);
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatMonth(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

/**
 * Simple seeded random untuk hasil reproducible kalau perlu, tapi
 * default-nya pakai Math.random.
 */
function makeRng(seed?: number) {
  if (seed === undefined) {
    return Math.random;
  }

  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

interface SeedOptions {
  /** Jumlah bulan ke belakang termasuk bulan ini. Default 3. */
  months?: number;
  /** Optional seed agar hasil deterministic. */
  seed?: number;
  /** Buat juga monthly + category budget bulan ini. Default true. */
  withBudgets?: boolean;
}

export async function seedDummyData(options: SeedOptions = {}) {
  const monthsBack = options.months ?? 3;
  const rand = makeRng(options.seed);
  const today = new Date();
  const created: number[] = [];

  for (let monthOffset = 0; monthOffset < monthsBack; monthOffset += 1) {
    const monthCursor = new Date(
      today.getFullYear(),
      today.getMonth() - monthOffset,
      1,
    );
    const daysInMonth = new Date(
      monthCursor.getFullYear(),
      monthCursor.getMonth() + 1,
      0,
    ).getDate();

    let createdInMonth = 0;

    for (const template of TEMPLATES) {
      const count = Math.max(1, Math.round(template.weight * (0.7 + rand() * 0.6)));

      for (let i = 0; i < count; i += 1) {
        const day =
          monthOffset === 0
            ? Math.min(today.getDate(), 1 + Math.floor(rand() * daysInMonth))
            : 1 + Math.floor(rand() * daysInMonth);
        const date = new Date(
          monthCursor.getFullYear(),
          monthCursor.getMonth(),
          day,
        );

        const input: CreateTransactionInput = {
          date: formatDate(date),
          detail: pickFrom(template.details, rand),
          nominal: randomBetween(template.range[0], template.range[1], rand),
          account: pickFrom(template.account, rand),
          category: template.category,
          mood: rand() > 0.35 ? pickFrom(MOODS, rand) : undefined,
          source: "manual",
        };

        await transactionsRepo.create(input);
        createdInMonth += 1;
      }
    }

    created.push(createdInMonth);
  }

  if (options.withBudgets !== false) {
    const currentMonth = formatMonth(today);
    await budgetsRepo.upsertMonthlyBudget(currentMonth, 4_500_000);
    await budgetsRepo.upsertCategoryBudget(currentMonth, "Food", 1_500_000, true);
    await budgetsRepo.upsertCategoryBudget(
      currentMonth,
      "Transport",
      600_000,
      true,
    );
    await budgetsRepo.upsertCategoryBudget(
      currentMonth,
      "Entertainment",
      500_000,
      true,
    );
  }

  const totalCreated = created.reduce((sum, value) => sum + value, 0);
  return {
    totalCreated,
    perMonth: created,
  };
}

export async function clearAllTransactions() {
  const items = await transactionsRepo.listAll();
  for (const item of items) {
    await transactionsRepo.remove(item.id);
  }
  return items.length;
}
