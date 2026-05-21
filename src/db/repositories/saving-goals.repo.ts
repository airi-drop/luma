import { nanoid } from "nanoid";
import { getLumaDb } from "../client";
import { nowIso } from "../../lib/date";
import type {
  AddSavingContributionInput,
  CreateSavingGoalInput,
  SavingGoal,
  SavingGoalContribution,
  UpdateSavingGoalInput,
} from "../../types";

function sortGoals(goals: SavingGoal[]) {
  return [...goals].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );
}

export const savingGoalsRepo = {
  async create(input: CreateSavingGoalInput) {
    const database = await getLumaDb();
    const timestamp = nowIso();
    const currentAmount = input.currentAmount ?? 0;
    const goal: SavingGoal = {
      id: nanoid(),
      title: input.title.trim(),
      targetAmount: input.targetAmount,
      currentAmount,
      icon: input.icon.trim(),
      deadline: input.deadline,
      note: input.note?.trim() || undefined,
      status: currentAmount >= input.targetAmount ? "completed" : "active",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await database.put("savingGoals", goal);

    return goal;
  },

  async update(id: string, input: UpdateSavingGoalInput) {
    const database = await getLumaDb();
    const current = await database.get("savingGoals", id);

    if (!current) {
      throw new Error("Target tabungan tidak ditemukan.");
    }

    const nextCurrentAmount = input.currentAmount ?? current.currentAmount;
    const nextTargetAmount = input.targetAmount ?? current.targetAmount;
    const derivedStatus =
      current.status === "archived"
        ? "archived"
        : nextCurrentAmount >= nextTargetAmount
          ? "completed"
          : "active";
    const goal: SavingGoal = {
      ...current,
      ...input,
      title: input.title?.trim() ?? current.title,
      icon: input.icon?.trim() ?? current.icon,
      note:
        input.note === undefined
          ? current.note
          : input.note.trim() || undefined,
      currentAmount: nextCurrentAmount,
      targetAmount: nextTargetAmount,
      status: input.status ?? derivedStatus,
      updatedAt: nowIso(),
    };

    await database.put("savingGoals", goal);

    return goal;
  },

  async archive(id: string) {
    return this.update(id, { status: "archived" });
  },

  async remove(id: string) {
    const database = await getLumaDb();
    const transaction = database.transaction(
      ["savingGoals", "savingGoalContributions"],
      "readwrite",
    );
    await transaction.objectStore("savingGoals").delete(id);
    const contributions = await transaction
      .objectStore("savingGoalContributions")
      .index("by-goal-id")
      .getAllKeys(id);

    await Promise.all(
      contributions.map((contributionId) =>
        transaction.objectStore("savingGoalContributions").delete(contributionId),
      ),
    );
    await transaction.done;
  },

  async getById(id: string) {
    const database = await getLumaDb();
    return database.get("savingGoals", id);
  },

  async listAll() {
    const database = await getLumaDb();
    const goals = await database.getAll("savingGoals");
    return sortGoals(goals);
  },

  async listByStatus(status: SavingGoal["status"]) {
    const database = await getLumaDb();
    const goals = await database.getAllFromIndex("savingGoals", "by-status", status);
    return sortGoals(goals);
  },

  async listContributions(goalId: string) {
    const database = await getLumaDb();
    const contributions = await database.getAllFromIndex(
      "savingGoalContributions",
      "by-goal-id",
      goalId,
    );

    return contributions.sort((left, right) => right.date.localeCompare(left.date));
  },

  async addContribution(input: AddSavingContributionInput) {
    const database = await getLumaDb();
    const goal = await database.get("savingGoals", input.goalId);

    if (!goal) {
      throw new Error("Target tabungan tidak ditemukan.");
    }

    const contribution: SavingGoalContribution = {
      id: nanoid(),
      goalId: input.goalId,
      amount: input.amount,
      date: input.date,
      note: input.note?.trim() || undefined,
      createdAt: nowIso(),
    };

    const nextAmount = goal.currentAmount + input.amount;
    const nextGoal: SavingGoal = {
      ...goal,
      currentAmount: nextAmount,
      status: nextAmount >= goal.targetAmount ? "completed" : goal.status,
      updatedAt: nowIso(),
    };

    const transaction = database.transaction(
      ["savingGoalContributions", "savingGoals"],
      "readwrite",
    );

    await transaction.objectStore("savingGoalContributions").put(contribution);
    await transaction.objectStore("savingGoals").put(nextGoal);
    await transaction.done;

    return { contribution, goal: nextGoal };
  },
};
