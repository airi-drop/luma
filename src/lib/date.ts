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

export function formatMonthLabel(month: string) {
  const [year, monthValue] = month.split("-").map(Number);

  if (!year || !monthValue) {
    return month;
  }

  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthValue - 1, 1));
}

export function formatDateLabel(date: string) {
  const [year, monthValue, day] = date.split("-").map(Number);

  if (!year || !monthValue || !day) {
    return date;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(year, monthValue - 1, day));
}
