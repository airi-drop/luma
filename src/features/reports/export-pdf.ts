import { readThemeColor } from "./export-data";

export async function exportMonthlyReportPdf(
  month: string,
  element: HTMLElement,
) {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);
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
