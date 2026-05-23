import { formatCurrency } from "../../lib/currency";
import { formatDateLabel } from "../../lib/date";
import type { ReportTrendPoint } from "./reporting";
import { getExportData } from "./export-data";

const PAGE_MARGIN = 40;
const PAGE_TOP = 48;
const PAGE_BOTTOM = 44;
const SECTION_GAP = 18;
const TABLE_ROW_PADDING_Y = 6;
const TABLE_BODY_FONT_SIZE = 10;
const TABLE_HEADER_FONT_SIZE = 10;
const TABLE_LINE_HEIGHT = 13;

function createPageFrame(pdf: InstanceType<typeof import("jspdf").default>) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  pdf.setFillColor(255, 251, 245);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");
  pdf.setDrawColor(230, 216, 197);
  pdf.setLineWidth(1);
  pdf.roundedRect(
    PAGE_MARGIN - 10,
    PAGE_TOP - 16,
    pageWidth - (PAGE_MARGIN - 10) * 2,
    pageHeight - PAGE_TOP - PAGE_BOTTOM + 26,
    18,
    18,
    "S",
  );
}

function drawHeader(pdf: InstanceType<typeof import("jspdf").default>, monthLabel: string) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const headerWidth = pageWidth - PAGE_MARGIN * 2;

  createPageFrame(pdf);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(77, 55, 39);
  pdf.setFontSize(20);
  pdf.text("Luma Monthly Recap", PAGE_MARGIN, PAGE_TOP);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(121, 97, 74);
  pdf.text(monthLabel, PAGE_MARGIN, PAGE_TOP + 18);

  pdf.setFillColor(245, 222, 184);
  pdf.circle(PAGE_MARGIN + headerWidth - 26, PAGE_TOP + 2, 12, "F");
  pdf.setFillColor(255, 251, 245);
  pdf.circle(PAGE_MARGIN + headerWidth - 20, PAGE_TOP - 2, 9, "F");
  pdf.setFillColor(144, 184, 150);
  pdf.circle(PAGE_MARGIN + headerWidth - 41, PAGE_TOP - 7, 2, "F");
}

function ensureSpace(
  pdf: InstanceType<typeof import("jspdf").default>,
  currentY: number,
  neededHeight: number,
  monthLabel: string,
) {
  const pageHeight = pdf.internal.pageSize.getHeight();

  if (currentY + neededHeight <= pageHeight - PAGE_BOTTOM) {
    return currentY;
  }

  pdf.addPage();
  drawHeader(pdf, monthLabel);
  return PAGE_TOP + 38;
}

function drawSectionTitle(
  pdf: InstanceType<typeof import("jspdf").default>,
  title: string,
  currentY: number,
) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(77, 55, 39);
  pdf.text(title, PAGE_MARGIN, currentY);
  return currentY + 10;
}

function drawKeyValueRows(
  pdf: InstanceType<typeof import("jspdf").default>,
  rows: Array<{ label: string; value: string }>,
  currentY: number,
  monthLabel: string,
) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  const leftWidth = 140;
  const rightWidth = contentWidth - leftWidth - 16;
  let y = currentY;

  for (const row of rows) {
    const valueLines = pdf.splitTextToSize(row.value || "-", rightWidth);
    const rowHeight = Math.max(22, valueLines.length * 12 + 8);
    y = ensureSpace(pdf, y, rowHeight + 2, monthLabel);

    pdf.setDrawColor(235, 224, 210);
    pdf.line(PAGE_MARGIN, y + rowHeight, pageWidth - PAGE_MARGIN, y + rowHeight);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10.5);
    pdf.setTextColor(105, 81, 60);
    pdf.text(row.label, PAGE_MARGIN, y + 14);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10.5);
    pdf.setTextColor(64, 47, 35);
    pdf.text(valueLines, PAGE_MARGIN + leftWidth, y + 14);

    y += rowHeight;
  }

  return y + 6;
}

function getRowHeight(
  pdf: InstanceType<typeof import("jspdf").default>,
  values: string[],
  colWidths: number[],
) {
  const lineCounts = values.map((value, index) =>
    pdf.splitTextToSize(value || "-", colWidths[index] - 8).length,
  );
  return Math.max(...lineCounts, 1) * TABLE_LINE_HEIGHT + TABLE_ROW_PADDING_Y * 2;
}

function drawTable(
  pdf: InstanceType<typeof import("jspdf").default>,
  options: {
    title: string;
    columns: string[];
    rows: string[][];
    colWidths: number[];
    currentY: number;
    monthLabel: string;
  },
) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const tableWidth = pageWidth - PAGE_MARGIN * 2;
  let y = ensureSpace(pdf, options.currentY, 40, options.monthLabel);
  y = drawSectionTitle(pdf, options.title, y);

  const drawHeaderRow = () => {
    pdf.setFillColor(244, 236, 224);
    pdf.roundedRect(PAGE_MARGIN, y, tableWidth, 22, 8, 8, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(TABLE_HEADER_FONT_SIZE);
    pdf.setTextColor(77, 55, 39);

    let x = PAGE_MARGIN;
    options.columns.forEach((column, index) => {
      pdf.text(column, x + 4, y + 14);
      x += options.colWidths[index];
    });

    y += 26;
  };

  drawHeaderRow();
  pdf.setFontSize(TABLE_BODY_FONT_SIZE);

  if (options.rows.length === 0) {
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(121, 97, 74);
    pdf.text("Belum ada data untuk bagian ini.", PAGE_MARGIN, y + 10);
    return y + 18 + SECTION_GAP;
  }

  for (const row of options.rows) {
    const rowHeight = getRowHeight(pdf, row, options.colWidths);
    y = ensureSpace(pdf, y, rowHeight + 10, options.monthLabel);

    if (y === PAGE_TOP + 38) {
      drawHeaderRow();
    }

    pdf.setDrawColor(235, 224, 210);
    pdf.line(PAGE_MARGIN, y + rowHeight, pageWidth - PAGE_MARGIN, y + rowHeight);

    let x = PAGE_MARGIN;
    row.forEach((value, index) => {
      const lines = pdf.splitTextToSize(value || "-", options.colWidths[index] - 8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(64, 47, 35);
      pdf.text(lines, x + 4, y + TABLE_ROW_PADDING_Y + 9);
      x += options.colWidths[index];
    });

    y += rowHeight;
  }

  return y + SECTION_GAP;
}

function buildReflectionLines(params: {
  topCategory: string | null;
  remainingBudget: number | null;
  totalSpending: number;
  trendPoints: ReportTrendPoint[];
}) {
  const lines: string[] = [];
  const activeDays = params.trendPoints.filter((point) => point.total > 0);
  const busiestDay = [...activeDays].sort((left, right) => right.total - left.total)[0];

  if (params.topCategory) {
    lines.push(`Kategori yang paling sering ngisi recap bulan ini: ${params.topCategory}.`);
  }

  if (params.remainingBudget !== null) {
    lines.push(
      params.remainingBudget >= 0
        ? `Masih ada sisa budget ${formatCurrency(params.remainingBudget)} buat dijaga pelan-pelan.`
        : `Budget bulan ini lewat ${formatCurrency(Math.abs(params.remainingBudget))}, jadi bulan depan bisa diatur lebih ringan.`,
    );
  }

  if (busiestDay) {
    lines.push(
      `Hari paling ramai ada di tanggal ${busiestDay.label} dengan total ${formatCurrency(busiestDay.total)}.`,
    );
  }

  if (lines.length === 0 && params.totalSpending === 0) {
    lines.push("Belum ada transaksi di bulan ini, jadi halaman recap masih siap diisi kapan saja.");
  }

  return lines;
}

export async function exportMonthlyReportPdf(month: string) {
  const [{ default: jsPDF }, { reportData, transactions }] = await Promise.all([
    import("jspdf"),
    getExportData(month),
  ]);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  drawHeader(pdf, reportData.monthLabel);

  let currentY = PAGE_TOP + 46;
  currentY = drawSectionTitle(pdf, "Ringkasan utama", currentY);
  currentY = drawKeyValueRows(
    pdf,
    [
      { label: "Month", value: reportData.monthLabel },
      { label: "Total Spending", value: formatCurrency(reportData.totalSpending) },
      {
        label: "Remaining Budget",
        value:
          reportData.remainingBudget === null
            ? "Belum diatur"
            : formatCurrency(reportData.remainingBudget),
      },
      {
        label: "Total Budget",
        value:
          reportData.totalBudget === null
            ? "Belum ada total budget bulan ini"
            : formatCurrency(reportData.totalBudget),
      },
      {
        label: "Biggest Transaction",
        value: reportData.biggestTransaction
          ? `${reportData.biggestTransaction.detail} · ${formatCurrency(reportData.biggestTransaction.nominal)} · ${formatDateLabel(reportData.biggestTransaction.date)}`
          : "Belum ada transaksi",
      },
      {
        label: "Top Category",
        value: reportData.topCategory
          ? `${reportData.topCategory.category} · ${formatCurrency(reportData.topCategory.total)}`
          : "Belum ada kategori dominan",
      },
      {
        label: "Target Summary",
        value:
          reportData.savingGoalsSummary.targetAmount > 0
            ? `${formatCurrency(reportData.savingGoalsSummary.savedAmount)} dari ${formatCurrency(reportData.savingGoalsSummary.targetAmount)} · ${reportData.savingGoalsSummary.activeCount} aktif / ${reportData.savingGoalsSummary.completedCount} selesai`
            : "Belum ada target tabungan aktif",
      },
    ],
    currentY,
    reportData.monthLabel,
  );

  currentY = drawTable(pdf, {
    title: "Category Breakdown",
    columns: ["Kategori", "Total", "Share"],
    colWidths: [220, 140, 115],
    rows: reportData.categoryBreakdown.map((item) => [
      item.category,
      formatCurrency(item.total),
      `${Math.round(item.share * 100)}%`,
    ]),
    currentY,
    monthLabel: reportData.monthLabel,
  });

  currentY = drawTable(pdf, {
    title: "Daily Spending Summary",
    columns: ["Tanggal", "Total", "Catatan"],
    colWidths: [90, 130, 255],
    rows: reportData.spendingTrend
      .filter((item) => item.total > 0)
      .map((item) => [
        formatDateLabel(`${reportData.month}-${item.label}`),
        formatCurrency(item.total),
        `${transactions.filter((transaction) => transaction.date.endsWith(`-${item.label}`)).length} transaksi tercatat`,
      ]),
    currentY,
    monthLabel: reportData.monthLabel,
  });

  if (reportData.budgetComparison.length > 0) {
    currentY = drawTable(pdf, {
      title: "Budget Summary",
      columns: ["Bagian", "Limit", "Terpakai", "Sisa"],
      colWidths: [150, 110, 110, 110],
      rows: reportData.budgetComparison.map((item) => [
        item.label,
        formatCurrency(item.limit),
        formatCurrency(item.used),
        formatCurrency(item.remaining),
      ]),
      currentY,
      monthLabel: reportData.monthLabel,
    });
  }

  const reflectionLines = buildReflectionLines({
    topCategory: reportData.topCategory?.category ?? null,
    remainingBudget: reportData.remainingBudget,
    totalSpending: reportData.totalSpending,
    trendPoints: reportData.spendingTrend,
  });

  currentY = ensureSpace(pdf, currentY, 80, reportData.monthLabel);
  currentY = drawSectionTitle(pdf, "Notes / Reflection", currentY);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10.5);
  pdf.setTextColor(64, 47, 35);
  pdf.text(
    pdf.splitTextToSize(reflectionLines.join(" "), pdf.internal.pageSize.getWidth() - PAGE_MARGIN * 2),
    PAGE_MARGIN,
    currentY + 4,
  );

  pdf.save(`luma-recap-${month}.pdf`);
}
