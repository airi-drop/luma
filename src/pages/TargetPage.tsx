import { useState } from "react";
import { SavingGoalCard } from "../components/cards/SavingGoalCard";
import { GoalDetailSheet } from "../components/sheets/GoalDetailSheet";
import { CreateGoalSheet } from "../components/sheets/CreateGoalSheet";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { formatCurrency } from "../lib/currency";
import { useSavingGoalsStore } from "../stores/saving-goals.store";
import { useUiStore } from "../stores/ui.store";
import type { CreateSavingGoalInput } from "../types";

export function TargetPage() {
  const progressList = useSavingGoalsStore((state) => state.progressList);
  const isLoading = useSavingGoalsStore((state) => state.isLoading);
  const error = useSavingGoalsStore((state) => state.error);
  const createGoal = useSavingGoalsStore((state) => state.createGoal);
  const showToast = useUiStore((state) => state.showToast);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  const activeGoals = progressList.filter(({ goal }) => goal.status === "active");
  const completedGoals = progressList.filter(
    ({ goal }) => goal.status === "completed",
  );
  const archivedGoals = progressList.filter(({ goal }) => goal.status === "archived");
  const selectedGoal =
    progressList.find(({ goal }) => goal.id === selectedGoalId)?.goal ?? null;
  const totalTarget = activeGoals.reduce(
    (sum, item) => sum + item.progress.targetAmount,
    0,
  );
  const totalSaved = activeGoals.reduce(
    (sum, item) => sum + item.progress.savedAmount,
    0,
  );

  async function handleCreateGoal(input: CreateSavingGoalInput) {
    setIsCreating(true);

    try {
      await createGoal(input);
      setIsCreateOpen(false);
      showToast({
        message: "Target barunya sudah siap ditemenin ✨",
        tone: "success",
      });
    } catch (createError) {
      showToast({
        message:
          createError instanceof Error
            ? createError.message
            : "Belum berhasil bikin target. Coba lagi ya.",
        tone: "error",
      });
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <PageWrapper
      title="Target"
      description="Ruang kecil buat nyimpen mimpi yang lagi kamu tabung, tanpa rasa kaku kayak rekening bank."
      headerAction={
        <button
          className="inline-flex min-h-9 items-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-card)] px-3 text-[12px] font-semibold text-[var(--text-secondary)]"
          onClick={() => setIsCreateOpen(true)}
          type="button"
        >
          + Buat
        </button>
      }
    >
      <Card className="overflow-hidden bg-[linear-gradient(155deg,rgba(var(--overlay-glow-primary),0.22),rgba(var(--overlay-glow-secondary),0.16))]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Ruang tabungan
            </p>
            <h2 className="font-display text-[20px] leading-tight font-bold text-[var(--text-primary)]">
              {activeGoals.length > 0
                ? `${activeGoals.length} target lagi jalan`
                : "Belum ada target aktif"}
            </h2>
            <p className="line-clamp-2 max-w-[30ch] text-[12px] leading-5 text-[var(--text-secondary)]">
              {activeGoals.length > 0
                ? "Sedikit demi sedikit juga tetap gerak."
                : "Mulai dari satu target kecil dulu juga boleh."}
            </p>
          </div>
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-surface)] text-xl">
            🎯
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Terkumpul
            </p>
            <p className="mt-1 text-[13px] font-bold text-[var(--text-primary)]">
              {formatCurrency(totalSaved)}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Total target
            </p>
            <p className="mt-1 text-[13px] font-bold text-[var(--text-primary)]">
              {formatCurrency(totalTarget)}
            </p>
          </div>
        </div>
      </Card>

      <Card
        title={
          activeGoals.length > 0 ? "Target yang lagi ditabung" : "Belum ada target dulu"
        }
        subtitle={
          activeGoals.length > 0
            ? "Tap satu kartu buat tambah tabungan, edit detail, atau arsipkan."
            : "Bikin target pertamamu biar nabungnya terasa lebih dekat dan kebayang."
        }
      >
        {isLoading ? (
          <p className="text-[12px] leading-5 text-[var(--text-secondary)]">
            Lagi nyiapin daftar targetmu sebentar ya...
          </p>
        ) : error ? (
          <p className="text-[12px] leading-5 text-[var(--danger-soft)]">{error}</p>
        ) : activeGoals.length > 0 ? (
          <div className="space-y-3">
            {activeGoals.map(({ goal, progress }) => (
              <SavingGoalCard
                key={goal.id}
                goal={goal}
                onClick={() => setSelectedGoalId(goal.id)}
                progress={progress}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[12px] leading-5 text-[var(--text-secondary)]">
              Ada sesuatu yang lagi kamu pengen wujudkan?
            </p>
            <Button fullWidth onClick={() => setIsCreateOpen(true)}>
              Buat Target
            </Button>
          </div>
        )}
      </Card>

      {completedGoals.length > 0 ? (
        <Card
          title="Sudah selesai"
          subtitle="Bisa dibuka lagi kapan aja kalau mau lihat detailnya."
        >
          <div className="space-y-3">
            {completedGoals.map(({ goal, progress }) => (
              <SavingGoalCard
                key={goal.id}
                goal={goal}
                onClick={() => setSelectedGoalId(goal.id)}
                progress={progress}
              />
            ))}
          </div>
        </Card>
      ) : null}

      {archivedGoals.length > 0 ? (
        <Card
          title="Arsip target"
          subtitle="Target yang lagi diistirahatin sebentar tetap aman."
        >
          <div className="space-y-3">
            {archivedGoals.map(({ goal, progress }) => (
              <SavingGoalCard
                key={goal.id}
                goal={goal}
                onClick={() => setSelectedGoalId(goal.id)}
                progress={progress}
              />
            ))}
          </div>
        </Card>
      ) : null}

      <CreateGoalSheet
        isOpen={isCreateOpen}
        isSubmitting={isCreating}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateGoal}
      />

      <GoalDetailSheet
        goal={selectedGoal}
        isOpen={selectedGoal !== null}
        onClose={() => setSelectedGoalId(null)}
        onSaved={(message, tone = "success") => {
          showToast({ message, tone });
        }}
      />
    </PageWrapper>
  );
}
