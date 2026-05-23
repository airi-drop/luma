import * as XLSX from "xlsx";
import { downloadBlob, getExportData } from "./export-data";

export async function exportMonthlySpreadsheetXlsx(month: string) {
  const { transactions, budgets, savingGoals, reportData } = await getExportData(month);
  const workbook = XLSX.utils.book_new();

  const transactionRows = transactions.map((transaction) => ({
    Tanggal: transaction.date,
    Detail: transaction.detail,
    Nominal: transaction.nominal,
    Kategori: transaction.category,
    Akun: transaction.account,
    Mood: transaction.mood ?? "",
    Catatan: transaction.note ?? "",
    Sumber: transaction.source,
  }));
  const budgetRows = budgets.map((budget) =>
    budget.kind === "monthly"
      ? {
          Jenis: "Monthly",
          Bulan: budget.month,
          Kategori: "",
          Limit: budget.totalBudget,
          ResetBulanan: "",
        }
      : {
          Jenis: "Category",
          Bulan: budget.month,
          Kategori: budget.category,
          Limit: budget.limit,
          ResetBulanan: budget.resetMonthly ? "Ya" : "Tidak",
        },
  );
  const savingGoalRows = savingGoals.map((goal) => ({
    Judul: goal.title,
    Status: goal.status,
    Terkumpul: goal.currentAmount,
    Target: goal.targetAmount,
    ProgressPersen:
      goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0,
    Deadline: goal.deadline ?? "",
    Icon: goal.icon,
    Catatan: goal.note ?? "",
  }));
  const summaryRows = [
    { Metrik: "Bulan", Nilai: reportData.monthLabel },
    { Metrik: "Total spending", Nilai: reportData.totalSpending },
    {
      Metrik: "Remaining budget",
      Nilai: reportData.remainingBudget ?? "Belum diatur",
    },
    {
      Metrik: "Top category",
      Nilai: reportData.topCategory?.category ?? "Belum ada",
    },
    {
      Metrik: "Biggest transaction",
      Nilai: reportData.biggestTransaction?.detail ?? "Belum ada",
    },
    {
      Metrik: "Saving goal progress",
      Nilai: `${reportData.savingGoalsSummary.activeCount} aktif / ${reportData.savingGoalsSummary.completedCount} selesai`,
    },
  ];

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(transactionRows),
    "Transactions",
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(budgetRows),
    "Budgets",
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(savingGoalRows),
    "Saving Goals",
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(summaryRows),
    "Monthly Summary",
  );

  const data = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  downloadBlob(
    new Blob([data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `luma-report-${month}.xlsx`,
  );
}
