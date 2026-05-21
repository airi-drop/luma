function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export function getCurrentDate(date = new Date()) {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  return `${year}-${month}-${day}`;
}

export function getCurrentMonth(date = new Date()) {
  return getCurrentDate(date).slice(0, 7);
}

export function getMonthFromDate(date: string) {
  return date.slice(0, 7);
}

export function nowIso() {
  return new Date().toISOString();
}
