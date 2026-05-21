import { formatMonthLabel } from "../../../lib/date";
import { getCategoryTotals, getMonthlyTotal } from "../../../lib/finance";
import type { CategoryType, MoodType, Transaction } from "../../../types";
import {
  AI_INSIGHT_MIN_TRANSACTIONS,
  AI_INSIGHT_NIGHT_END_HOUR,
  AI_INSIGHT_NIGHT_START_HOUR,
  AI_INSIGHT_SMALL_TRANSACTION_THRESHOLD,
} from "./constants";
import type {
  AggregatedMonthlyInsightData,
  InsightCategoryChange,
  InsightSignal,
} from "./types";

function isWeekend(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  const day = parsed.getDay();
  return day === 0 || day === 6;
}

function getCreatedHour(createdAt: string) {
  const parsed = new Date(createdAt);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.getHours();
}

function isNightHour(hour: number | null) {
  if (hour === null) {
    return false;
  }

  return hour >= AI_INSIGHT_NIGHT_START_HOUR || hour < AI_INSIGHT_NIGHT_END_HOUR;
}

function buildCategoryChangeMap(
  currentTransactions: Transaction[],
  previousTransactions: Transaction[],
) {
  const currentTotals = new Map(
    getCategoryTotals(currentTransactions).map((item) => [item.category, item.total]),
  );
  const previousTotals = new Map(
    getCategoryTotals(previousTransactions).map((item) => [item.category, item.total]),
  );
  const categories = new Set<CategoryType>([
    ...currentTotals.keys(),
    ...previousTotals.keys(),
  ]);

  return Array.from(categories)
    .map((category) => {
      const currentTotal = currentTotals.get(category) ?? 0;
      const previousTotal = previousTotals.get(category) ?? 0;
      const deltaAmount = currentTotal - previousTotal;

      return {
        category,
        currentTotal,
        previousTotal,
        deltaAmount,
        deltaPercentage:
          previousTotal > 0 ? deltaAmount / previousTotal : currentTotal > 0 ? 1 : null,
      } satisfies InsightCategoryChange;
    })
    .sort((left, right) => Math.abs(right.deltaAmount) - Math.abs(left.deltaAmount));
}

function buildMoodSummaries(transactions: Transaction[]) {
  const moodMap = new Map<
    MoodType,
    {
      transactionCount: number;
      total: number;
      categories: Map<CategoryType, { count: number; total: number }>;
    }
  >();

  for (const transaction of transactions) {
    if (!transaction.mood) {
      continue;
    }

    const current = moodMap.get(transaction.mood) ?? {
      transactionCount: 0,
      total: 0,
      categories: new Map<CategoryType, { count: number; total: number }>(),
    };

    current.transactionCount += 1;
    current.total += transaction.nominal;
    const categoryCurrent = current.categories.get(transaction.category) ?? {
      count: 0,
      total: 0,
    };
    categoryCurrent.count += 1;
    categoryCurrent.total += transaction.nominal;
    current.categories.set(transaction.category, categoryCurrent);
    moodMap.set(transaction.mood, current);
  }

  return Array.from(moodMap.entries())
    .map(([mood, value]) => {
      const strongestCategoryEntry =
        [...value.categories.entries()].sort(
          (left, right) =>
            right[1].total - left[1].total || right[1].count - left[1].count,
        )[0] ?? null;

      return {
        mood,
        transactionCount: value.transactionCount,
        total: value.total,
        strongestCategory: strongestCategoryEntry?.[0] ?? "Other",
        strongestCategoryCount: strongestCategoryEntry?.[1].count ?? 0,
        strongestCategoryTotal: strongestCategoryEntry?.[1].total ?? 0,
        strongestCategoryShare:
          value.total > 0
            ? (strongestCategoryEntry?.[1].total ?? 0) / value.total
            : 0,
      };
    })
    .sort((left, right) => right.total - left.total);
}

function buildSignals(params: {
  transactionCount: number;
  totalSpending: number;
  weekend: AggregatedMonthlyInsightData["weekend"];
  night: AggregatedMonthlyInsightData["night"];
  moods: AggregatedMonthlyInsightData["moods"];
  smallTransactions: AggregatedMonthlyInsightData["smallTransactions"];
  monthOverMonthChanges: InsightCategoryChange[];
}) {
  const { transactionCount, totalSpending, weekend, night, moods, smallTransactions, monthOverMonthChanges } =
    params;
  const signals: InsightSignal[] = [];

  if (
    transactionCount >= AI_INSIGHT_MIN_TRANSACTIONS &&
    weekend.transactionCount >= 3 &&
    (weekend.shareOfTransactions >= 0.4 || weekend.shareOfSpending >= 0.4)
  ) {
    signals.push({
      type: "weekend_spending",
      score: weekend.shareOfSpending + weekend.shareOfTransactions,
      summary: "Pengeluaranmu kelihatan lebih aktif saat weekend.",
      metrics: {
        weekendTransactionCount: weekend.transactionCount,
        weekendSpendingShare: Number(weekend.shareOfSpending.toFixed(3)),
      },
      tone: "direct",
    });
  }

  if (
    transactionCount >= AI_INSIGHT_MIN_TRANSACTIONS &&
    night.transactionCount >= 3 &&
    (night.shareOfTransactions >= 0.35 || night.shareOfSpending >= 0.35)
  ) {
    signals.push({
      type: "night_spending",
      score: night.shareOfSpending + night.shareOfTransactions,
      summary: "Banyak transaksi bulan ini tercatat di jam malam.",
      metrics: {
        nightTransactionCount: night.transactionCount,
        nightSpendingShare: Number(night.shareOfSpending.toFixed(3)),
      },
      tone: "soft",
    });
  }

  const strongestMood = moods.find(
    (mood) =>
      mood.transactionCount >= 2 &&
      mood.strongestCategoryCount >= 2 &&
      mood.strongestCategoryShare >= 0.45,
  );

  if (strongestMood) {
    signals.push({
      type: "mood_category_correlation",
      score: strongestMood.strongestCategoryShare + strongestMood.transactionCount / 10,
      summary: "Ada pola mood yang cukup sering muncul bareng kategori tertentu.",
      metrics: {
        mood: strongestMood.mood,
        category: strongestMood.strongestCategory,
        categoryShare: Number(strongestMood.strongestCategoryShare.toFixed(3)),
      },
      tone: "direct",
    });
  }

  if (
    smallTransactions.transactionCount >= 5 &&
    (smallTransactions.shareOfTransactions >= 0.4 ||
      smallTransactions.shareOfSpending >= 0.2)
  ) {
    signals.push({
      type: "small_frequent_transactions",
      score:
        smallTransactions.shareOfTransactions + smallTransactions.shareOfSpending,
      summary: "Nominal kecil berulang kelihatan cukup membentuk total bulananmu.",
      metrics: {
        smallTransactionCount: smallTransactions.transactionCount,
        smallTransactionShare: Number(
          smallTransactions.shareOfTransactions.toFixed(3),
        ),
        threshold: smallTransactions.threshold,
      },
      tone: "direct",
    });
  }

  const biggestChange = monthOverMonthChanges.find((item) => {
    if (Math.abs(item.deltaAmount) < 50_000) {
      return false;
    }

    if (item.previousTotal === 0) {
      return item.currentTotal >= 100_000;
    }

    return Math.abs(item.deltaPercentage ?? 0) >= 0.25;
  });

  if (biggestChange) {
    signals.push({
      type: "month_over_month_category_change",
      score:
        Math.abs(biggestChange.deltaAmount) / Math.max(totalSpending, 1) +
        Math.abs(biggestChange.deltaPercentage ?? 1),
      summary: "Ada kategori yang gesernya cukup terasa dibanding bulan lalu.",
      metrics: {
        category: biggestChange.category,
        deltaAmount: biggestChange.deltaAmount,
        deltaPercentage:
          biggestChange.deltaPercentage === null
            ? "new"
            : Number(biggestChange.deltaPercentage.toFixed(3)),
      },
      tone: "direct",
    });
  }

  return signals.sort((left, right) => right.score - left.score);
}

export function buildInsightAggregate(params: {
  month: string;
  transactions: Transaction[];
  previousMonthTransactions: Transaction[];
}) {
  const { month, transactions, previousMonthTransactions } = params;
  const totalSpending = getMonthlyTotal(transactions);
  const activeDays = new Set(transactions.map((transaction) => transaction.date)).size;
  const weekendTransactions = transactions.filter((transaction) =>
    isWeekend(transaction.date),
  );
  const nightTransactions = transactions.filter((transaction) =>
    isNightHour(getCreatedHour(transaction.createdAt)),
  );
  const smallTransactions = transactions.filter(
    (transaction) => transaction.nominal <= AI_INSIGHT_SMALL_TRANSACTION_THRESHOLD,
  );
  const categories = getCategoryTotals(transactions).map((item) => ({
    ...item,
    share: totalSpending > 0 ? item.total / totalSpending : 0,
  }));
  const monthOverMonthChanges = buildCategoryChangeMap(
    transactions,
    previousMonthTransactions,
  );
  const aggregateBase = {
    month,
    monthLabel: formatMonthLabel(month),
    transactionCount: transactions.length,
    totalSpending,
    activeDays,
    categories,
    weekend: {
      transactionCount: weekendTransactions.length,
      total: getMonthlyTotal(weekendTransactions),
      shareOfTransactions:
        transactions.length > 0 ? weekendTransactions.length / transactions.length : 0,
      shareOfSpending:
        totalSpending > 0 ? getMonthlyTotal(weekendTransactions) / totalSpending : 0,
    },
    night: {
      transactionCount: nightTransactions.length,
      total: getMonthlyTotal(nightTransactions),
      shareOfTransactions:
        transactions.length > 0 ? nightTransactions.length / transactions.length : 0,
      shareOfSpending:
        totalSpending > 0 ? getMonthlyTotal(nightTransactions) / totalSpending : 0,
      source: "createdAt" as const,
    },
    moods: buildMoodSummaries(transactions),
    smallTransactions: {
      threshold: AI_INSIGHT_SMALL_TRANSACTION_THRESHOLD,
      transactionCount: smallTransactions.length,
      total: getMonthlyTotal(smallTransactions),
      shareOfTransactions:
        transactions.length > 0 ? smallTransactions.length / transactions.length : 0,
      shareOfSpending:
        totalSpending > 0 ? getMonthlyTotal(smallTransactions) / totalSpending : 0,
      averagePerActiveDay:
        activeDays > 0 ? smallTransactions.length / activeDays : 0,
    },
    monthOverMonthChanges,
  };
  const signals = buildSignals({
    transactionCount: transactions.length,
    totalSpending,
    weekend: aggregateBase.weekend,
    night: aggregateBase.night,
    moods: aggregateBase.moods,
    smallTransactions: aggregateBase.smallTransactions,
    monthOverMonthChanges,
  });
  const signature = JSON.stringify({
    ...aggregateBase,
    signals,
  });

  return {
    ...aggregateBase,
    signals,
    signature,
  } satisfies AggregatedMonthlyInsightData;
}
