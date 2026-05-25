const DANGEROUS_SPREADSHEET_PREFIX = /^[=+\-@]/;

export function sanitizeSpreadsheetCell(value: unknown) {
  if (typeof value !== "string") {
    return value ?? "";
  }

  if (!value) {
    return value;
  }

  return DANGEROUS_SPREADSHEET_PREFIX.test(value) ? `'${value}` : value;
}
