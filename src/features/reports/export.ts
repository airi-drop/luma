import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { budgetsRepo } from "../../db/repositories/budgets.repo";
import { savingGoalsRepo } from "../../db/repositories/saving-goals.repo";
import { transactionsRepo } from "../../db/repositories/transactions.repo";
import { formatCurrency } from "../../lib/currency";
import { formatDateLabel } from "../../lib/date";
import { buildMonthlyReportData } from "./reporting";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function getExportData(month: string) {
  const [transactions, budgets, savingGoals] = await Promise.all([
    transactionsRepo.listByMonth(month),
    budgetsRepo.listByMonth(month),
    savingGoalsRepo.listAll(),
  ]);

  const monthlyBudget =
    budgets.find((budget) => budget.kind === "monthly") ?? null;
  const categoryBudgets = budgets.filter((budget) => budget.kind === "category");
  const reportData = buildMonthlyReportData({
    month,
    transactions,
    monthlyBudget,
    categoryBudgets,
    savingGoals,
  });

  return {
    transactions,
    budgets,
    savingGoals,
    reportData,
  };
}

function readThemeColor(token: string, fallback: string) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  return value || fallback;
}

export async function exportMonthlyReportPdf(
  month: string,
  element: HTMLElement,
) {
  const canvas = await html2canvas(element, {
    backgroundColor: readThemeColor("--bg-main", "#FFF5EC"),
    scale: 2,
    useCORS: true,
  });
  const imageData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 24;
  const scale = Math.min(
    (pageWidth - margin * 2) / canvas.width,
    (pageHeight - margin * 2) / canvas.height,
  );
  const renderWidth = canvas.width * scale;
  const renderHeight = canvas.height * scale;
  const x = (pageWidth - renderWidth) / 2;
  const y = (pageHeight - renderHeight) / 2;

  pdf.addImage(imageData, "PNG", x, y, renderWidth, renderHeight, undefined, "FAST");
  pdf.save(`luma-recap-${month}.pdf`);
}

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
