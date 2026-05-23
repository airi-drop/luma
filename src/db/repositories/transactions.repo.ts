import { nanoid } from "nanoid";
import { getLumaDb } from "../client";
import { getMonthFromDate, nowIso } from "../../lib/date";
import {
  isValidAccountType,
  isValidCategoryType,
  isValidTransactionDate,
} from "../../lib/transaction-validation";
import type {
  CreateTransactionInput,
  Transaction,
  TransactionSearchParams,
  UpdateTransactionInput,
} from "../../types";

function sortTransactions(transactions: Transaction[]) {
  return [...transactions].sort((left, right) =>
    right.date.localeCompare(left.date) ||
    right.createdAt.localeCompare(left.createdAt),
  );
}

function assertValidTransaction(input: CreateTransactionInput) {
  if (!input.detail.trim()) {
    throw new Error("Detail transaksinya masih kosong.");
  }

  if (!Number.isFinite(input.nominal) || input.nominal <= 0) {
    throw new Error("Nominal transaksi harus lebih dari nol ya.");
  }

  if (!isValidCategoryType(input.category)) {
    throw new Error("Kategori transaksi belum valid.");
  }

  if (!isValidAccountType(input.account)) {
    throw new Error("Akun transaksi belum valid.");
  }

  if (!isValidTransactionDate(input.date)) {
    throw new Error("Tanggal transaksi belum valid.");
  }
}

export const transactionsRepo = {
  async create(input: CreateTransactionInput) {
    assertValidTransaction(input);

    const database = await getLumaDb();
    const timestamp = nowIso();
    const transaction: Transaction = {
      id: nanoid(),
      date: input.date,
      month: getMonthFromDate(input.date),
      createdAt: timestamp,
      updatedAt: timestamp,
      detail: input.detail.trim(),
      nominal: input.nominal,
      account: input.account,
      category: input.category,
      mood: input.mood,
      note: input.note?.trim() || undefined,
      source: input.source ?? "manual",
      isRecurring: input.isRecurring,
      recurringRuleId: input.recurringRuleId,
    };

    await database.put("transactions", transaction);

    return transaction;
  },

  async update(id: string, input: UpdateTransactionInput) {
    const database = await getLumaDb();
    const current = await database.get("transactions", id);

    if (!current) {
      throw new Error("Transaction tidak ditemukan.");
    }

    const date = input.date ?? current.date;
    const nextInput: CreateTransactionInput = {
      date,
      detail: input.detail ?? current.detail,
      nominal: input.nominal ?? current.nominal,
      account: input.account ?? current.account,
      category: input.category ?? current.category,
      mood: input.mood ?? current.mood,
      note:
        input.note === undefined
          ? current.note
          : input.note,
      source: input.source ?? current.source,
      isRecurring: input.isRecurring ?? current.isRecurring,
      recurringRuleId: input.recurringRuleId ?? current.recurringRuleId,
    };

    assertValidTransaction(nextInput);

    const next: Transaction = {
      ...current,
      ...input,
      date,
      month: getMonthFromDate(date),
      detail: input.detail?.trim() ?? current.detail,
      note:
        input.note === undefined
          ? current.note
          : input.note.trim() || undefined,
      updatedAt: nowIso(),
    };

    await database.put("transactions", next);

    return next;
  },

  async remove(id: string) {
    const database = await getLumaDb();
    await database.delete("transactions", id);
  },

  async getById(id: string) {
    const database = await getLumaDb();
    return database.get("transactions", id);
  },

  async listAll() {
    const database = await getLumaDb();
    const items = await database.getAll("transactions");
    return sortTransactions(items);
  },

  async listByMonth(month: string) {
    const database = await getLumaDb();
    const items = await database.getAllFromIndex("transactions", "by-month", month);
    return sortTransactions(items);
  },

  async search(params: TransactionSearchParams) {
    const items = params.month
      ? await this.listByMonth(params.month)
      : await this.listAll();

    return items.filter((item) => {
      const matchCategory = params.category ? item.category === params.category : true;
      const matchAccount = params.account ? item.account === params.account : true;
      const query = params.query?.trim().toLowerCase();
      const matchQuery = query
        ? item.detail.toLowerCase().includes(query)
        : true;

      return matchCategory && matchAccount && matchQuery;
    });
  },
};
