export function getCurrentDate() {
  return new Date().toISOString().slice(0, 10);
}

export function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function getMonthFromDate(date: string) {
  return date.slice(0, 7);
}

export function nowIso() {
  return new Date().toISOString();
}
