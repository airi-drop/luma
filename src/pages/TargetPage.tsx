import { PageWrapper } from "../components/layout/PageWrapper";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useSavingGoalsStore } from "../stores/saving-goals.store";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function TargetPage() {
  const progressList = useSavingGoalsStore((state) => state.progressList);

  return (
    <PageWrapper
      title="Target"
      description="Fondasi target tabungan sudah siap di data layer, UI lengkapnya masuk sprint berikutnya."
    >
      {progressList.length > 0 ? (
        <Card title="Ringkasan target">
          <div className="space-y-3">
            {progressList.map(({ goal, progress }) => (
              <div key={goal.id} className="rounded-3xl border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-4">
                <p className="font-semibold text-[var(--text-primary)]">
                  {goal.icon} {goal.title}
                </p>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  {formatCurrency(progress.savedAmount)} / {formatCurrency(progress.targetAmount)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card title="Belum ada target">
          <p className="mb-4 text-sm leading-6 text-[var(--text-secondary)]">
            Ada sesuatu yang lagi kamu pengen wujudkan?
          </p>
          <Button>Buat Target</Button>
        </Card>
      )}
    </PageWrapper>
  );
}
