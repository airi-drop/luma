import { create } from "zustand";
import { savingGoalsRepo } from "../db/repositories/saving-goals.repo";
import { getSavingGoalProgress } from "../lib/finance";
import type {
  AddSavingContributionInput,
  CreateSavingGoalInput,
  SavingGoal,
  SavingGoalContribution,
  UpdateSavingGoalInput,
} from "../types";

interface SavingGoalWithProgress {
  goal: SavingGoal;
  progress: ReturnType<typeof getSavingGoalProgress>;
}

interface SavingGoalsState {
  goals: SavingGoal[];
  progressList: SavingGoalWithProgress[];
  contributionsByGoalId: Record<string, SavingGoalContribution[]>;
  isLoading: boolean;
  error: string | null;
  loadGoals: () => Promise<void>;
  createGoal: (input: CreateSavingGoalInput) => Promise<SavingGoal>;
  updateGoal: (id: string, input: UpdateSavingGoalInput) => Promise<SavingGoal>;
  archiveGoal: (id: string) => Promise<SavingGoal>;
  removeGoal: (id: string) => Promise<void>;
  loadContributions: (goalId: string) => Promise<void>;
  addContribution: (
    input: AddSavingContributionInput,
  ) => Promise<{ goal: SavingGoal; contribution: SavingGoalContribution }>;
}

function deriveProgress(goals: SavingGoal[]) {
  return goals.map((goal) => ({
    goal,
    progress: getSavingGoalProgress(goal),
  }));
}

export const useSavingGoalsStore = create<SavingGoalsState>((set, get) => ({
  goals: [],
  progressList: [],
  contributionsByGoalId: {},
  isLoading: false,
  error: null,
  async loadGoals() {
    set({ isLoading: true, error: null });

    try {
      const goals = await savingGoalsRepo.listAll();
      set({
        goals,
        progressList: deriveProgress(goals),
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Gagal memuat target tabungan.",
      });
    }
  },
  async createGoal(input) {
    const goal = await savingGoalsRepo.create(input);
    await get().loadGoals();
    return goal;
  },
  async updateGoal(id, input) {
    const goal = await savingGoalsRepo.update(id, input);
    await get().loadGoals();
    return goal;
  },
  async archiveGoal(id) {
    const goal = await savingGoalsRepo.archive(id);
    await get().loadGoals();
    return goal;
  },
  async removeGoal(id) {
    await savingGoalsRepo.remove(id);
    await get().loadGoals();
    set((state) => {
      const rest = { ...state.contributionsByGoalId };
      delete rest[id];
      return { contributionsByGoalId: rest };
    });
  },
  async loadContributions(goalId) {
    const contributions = await savingGoalsRepo.listContributions(goalId);
    set((state) => ({
      contributionsByGoalId: {
        ...state.contributionsByGoalId,
        [goalId]: contributions,
      },
    }));
  },
  async addContribution(input) {
    const result = await savingGoalsRepo.addContribution(input);
    await Promise.all([get().loadGoals(), get().loadContributions(input.goalId)]);
    return result;
  },
}));
