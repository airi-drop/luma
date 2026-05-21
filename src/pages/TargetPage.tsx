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
          className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-card)] px-4 text-sm font-semibold text-[var(--text-secondary)]"
          onClick={() => setIsCreateOpen(true)}
          type="button"
        >
          + Buat
        </button>
      }
    >
      <Card className="overflow-hidden bg-[linear-gradient(155deg,rgba(232,168,87,0.18),rgba(143,184,150,0.12))]">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
              Ruang tabungan
            </p>
            <h2 className="font-display text-[32px] leading-tight font-bold text-[var(--text-primary)]">
              {activeGoals.length > 0
                ? `${activeGoals.length} target lagi jalan`
                : "Belum ada target aktif"}
            </h2>
            <p className="max-w-[30ch] text-sm leading-6 text-[var(--text-secondary)]">
              {activeGoals.length > 0
                ? "Sedikit demi sedikit juga tetap gerak. Semua progresnya kebaca dari sini."
                : "Ada sesuatu yang lagi kamu pengen wujudkan? Mulai dari satu target kecil dulu juga boleh."}
            </p>
          </div>
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(255,243,220,0.14)] text-3xl">
            🎯
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-[22px] border border-[rgba(255,243,220,0.12)] bg-[rgba(26,20,16,0.18)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
              Terkumpul
            </p>
            <p className="mt-2 text-sm font-bold text-[var(--text-primary)]">
              {formatCurrency(totalSaved)}
            </p>
          </div>
          <div className="rounded-[22px] border border-[rgba(255,243,220,0.12)] bg-[rgba(26,20,16,0.18)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
              Total target
            </p>
            <p className="mt-2 text-sm font-bold text-[var(--text-primary)]">
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
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Lagi nyiapin daftar targetmu sebentar ya...
          </p>
        ) : error ? (
          <p className="text-sm leading-6 text-[var(--danger-soft)]">{error}</p>
        ) : activeGoals.length > 0 ? (
          <div className="space-y-4">
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
          <div className="space-y-4">
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
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
          subtitle="Yang ini sudah berhasil sampai. Tetap bisa dibuka lagi kalau mau lihat detailnya."
        >
          <div className="space-y-4">
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
          subtitle="Target yang lagi diistirahatin sebentar tetap aman tersimpan."
        >
          <div className="space-y-4">
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
