import { formatCurrency } from "../../lib/currency";
import { formatDateLabel } from "../../lib/date";
import { downloadBlob, getExportData } from "./export-data";

export async function exportMonthlySpreadsheetCsv(month: string) {
  const { transactions, budgets, savingGoals, reportData } = await getExportData(month);
  const rows = [
    ["Section", "Field 1", "Field 2", "Field 3", "Field 4", "Field 5", "Field 6"],
    [
      "Summary",
      reportData.monthLabel,
      formatCurrency(reportData.totalSpending),
      reportData.remainingBudget === null
        ? "Belum diatur"
        : formatCurrency(reportData.remainingBudget),
      reportData.topCategory?.category ?? "Belum ada",
      reportData.biggestTransaction?.detail ?? "Belum ada",
      `${reportData.savingGoalsSummary.activeCount} aktif / ${reportData.savingGoalsSummary.completedCount} selesai`,
    ],
    ["Transactions", "Tanggal", "Detail", "Nominal", "Kategori", "Akun", "Mood"],
    ...transactions.map((transaction) => [
      "Transaction",
      formatDateLabel(transaction.date),
      transaction.detail,
      transaction.nominal.toString(),
      transaction.category,
      transaction.account,
      transaction.mood ?? "",
    ]),
    ["Budgets", "Jenis", "Kategori", "Limit", "Terpakai", "Sisa", ""],
    ...budgets.map((budget) => {
      if (budget.kind === "monthly") {
        return [
          "Budget",
          "Monthly",
          "",
          budget.totalBudget.toString(),
          reportData.totalSpending.toString(),
          (budget.totalBudget - reportData.totalSpending).toString(),
          "",
        ];
      }

      const used = transactions
        .filter((transaction) => transaction.category === budget.category)
        .reduce((sum, transaction) => sum + transaction.nominal, 0);

      return [
        "Budget",
        "Category",
        budget.category,
        budget.limit.toString(),
        used.toString(),
        (budget.limit - used).toString(),
        "",
      ];
    }),
    ["Saving Goals", "Judul", "Status", "Terkumpul", "Target", "Deadline", ""],
    ...savingGoals.map((goal) => [
      "Saving Goal",
      goal.title,
      goal.status,
      goal.currentAmount.toString(),
      goal.targetAmount.toString(),
      goal.deadline ?? "",
      "",
    ]),
  ];

  const csv = rows
    .map((row) =>
      row
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");

  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `luma-report-${month}.csv`);
}
