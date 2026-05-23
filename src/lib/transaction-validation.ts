import {
  ACCOUNT_TYPES,
  CATEGORY_TYPES,
  type AccountType,
  type CategoryType,
} from "../types";

function isKnownOption<TValue extends string>(
  value: TValue,
  options: readonly TValue[],
) {
  return options.includes(value);
}

export function isValidTransactionDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  const [year, month, day] = date.split("-").map(Number);

  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() + 1 === month &&
    parsed.getDate() === day
  );
}

export function isValidAccountType(account: string): account is AccountType {
  return isKnownOption(account as AccountType, ACCOUNT_TYPES);
}

export function isValidCategoryType(category: string): category is CategoryType {
  return isKnownOption(category as CategoryType, CATEGORY_TYPES);
}
