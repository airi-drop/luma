import { useEffect, useState, type FormEvent } from "react";
import { formatCurrency, parseCurrencyInput } from "../../lib/currency";
import { formatDateLabel } from "../../lib/date";
import { getSavingGoalProgress } from "../../lib/finance";
import { useSavingGoalsStore } from "../../stores/saving-goals.store";
import { BottomSheet } from "../ui/BottomSheet";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import type { SavingGoal } from "../../types";

interface GoalDetailSheetProps {
  goal: SavingGoal | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (message: string, tone?: "success" | "info" | "error") => void;
}

function toCurrencyInput(amount?: number) {
  return amount ? formatCurrency(amount) : "";
}

const iconSuggestions = ["🎧", "✈️", "💻", "🎮", "🎀", "📚", "🏡", "📷"];

export function GoalDetailSheet({
  goal,
  isOpen,
  onClose,
  onSaved,
}: GoalDetailSheetProps) {
  if (!goal) {
    return null;
  }

  return (
    <GoalDetailContent
      key={goal.id}
      goal={goal}
      isOpen={isOpen}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

interface GoalDetailContentProps {
  goal: SavingGoal;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (message: string, tone?: "success" | "info" | "error") => void;
}

function GoalDetailContent({
  goal,
  isOpen,
  onClose,
  onSaved,
}: GoalDetailContentProps) {
  const updateGoal = useSavingGoalsStore((state) => state.updateGoal);
  const archiveGoal = useSavingGoalsStore((state) => state.archiveGoal);
  const removeGoal = useSavingGoalsStore((state) => state.removeGoal);
  const addContribution = useSavingGoalsStore((state) => state.addContribution);
  const loadContributions = useSavingGoalsStore((state) => state.loadContributions);
  const contributionsByGoalId = useSavingGoalsStore(
    (state) => state.contributionsByGoalId,
  );
  const [title, setTitle] = useState(goal.title);
  const [targetAmountText, setTargetAmountText] = useState(
    toCurrencyInput(goal.targetAmount),
  );
  const [currentAmountText, setCurrentAmountText] = useState(
    toCurrencyInput(goal.currentAmount),
  );
  const [icon, setIcon] = useState(goal.icon);
  const [deadline, setDeadline] = useState(goal.deadline ?? "");
  const [note, setNote] = useState(goal.note ?? "");
  const [contributionAmountText, setContributionAmountText] = useState("");
  const [contributionDate, setContributionDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [contributionNote, setContributionNote] = useState("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isSubmittingContribution, setIsSubmittingContribution] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [touched, setTouched] = useState({
    title: false,
    targetAmount: false,
    icon: false,
    contributionAmount: false,
    contributionDate: false,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void loadContributions(goal.id);
  }, [goal.id, isOpen, loadContributions]);

  const progress = getSavingGoalProgress(goal);
  const contributions = contributionsByGoalId[goal.id] ?? [];
  const trimmedTitle = title.trim();
  const trimmedIcon = icon.trim();
  const trimmedNote = note.trim();
  const targetAmount = parseCurrencyInput(targetAmountText);
  const currentAmount = parseCurrencyInput(currentAmountText);
  const contributionAmount = parseCurrencyInput(contributionAmountText);

  const titleError =
    touched.title && !trimmedTitle ? "Nama targetnya jangan kosong ya." : undefined;
  const targetAmountError =
    touched.targetAmount && targetAmount <= 0
      ? "Target nominalnya belum valid."
      : undefined;
  const iconError =
    touched.icon && !trimmedIcon ? "Kasih satu emoji biar tetap gampang dikenali." : undefined;
  const contributionAmountError =
    touched.contributionAmount && contributionAmount <= 0
      ? "Nominal tambah tabungannya belum kebaca."
      : undefined;
  const contributionDateError =
    touched.contributionDate && !contributionDate
      ? "Tanggal kontribusinya belum diisi."
      : undefined;
  const canSubmitEdit =
    Boolean(trimmedTitle) && Boolean(trimmedIcon) && targetAmount > 0;
  const canSubmitContribution =
    goal.status !== "archived" && contributionAmount > 0 && Boolean(contributionDate);

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched((state) => ({
      ...state,
      title: true,
      targetAmount: true,
      icon: true,
    }));

    if (!canSubmitEdit) {
      return;
    }

    setIsSubmittingEdit(true);

    try {
      await updateGoal(goal.id, {
        title: trimmedTitle,
        targetAmount,
        currentAmount,
        icon: trimmedIcon,
        deadline: deadline || undefined,
        note: trimmedNote || undefined,
      });
      onSaved?.("Targetnya sudah dirapihin ✨", "success");
    } catch (error) {
      onSaved?.(
        error instanceof Error
          ? error.message
          : "Belum berhasil disimpan. Coba lagi ya.",
        "error",
      );
    } finally {
      setIsSubmittingEdit(false);
    }
  }

  async function handleContributionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched((state) => ({
      ...state,
      contributionAmount: true,
      contributionDate: true,
    }));

    if (!canSubmitContribution) {
      return;
    }

    setIsSubmittingContribution(true);

    try {
      await addContribution({
        goalId: goal.id,
        amount: contributionAmount,
        date: contributionDate,
        note: contributionNote.trim() || undefined,
      });
      setContributionAmountText("");
      setContributionNote("");
      onSaved?.("Tabungannya sudah masuk 💛", "success");
    } catch (error) {
      onSaved?.(
        error instanceof Error
          ? error.message
          : "Belum bisa nambah tabungan sekarang.",
        "error",
      );
    } finally {
      setIsSubmittingContribution(false);
    }
  }

  async function handleArchive() {
    setIsArchiving(true);

    try {
      await archiveGoal(goal.id);
      onSaved?.("Targetnya dipindah ke arsip dulu ya.", "info");
      onClose();
    } catch (error) {
      onSaved?.(
        error instanceof Error
          ? error.message
          : "Belum bisa diarsipkan sekarang.",
        "error",
      );
    } finally {
      setIsArchiving(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);

    try {
      await removeGoal(goal.id);
      onSaved?.("Targetnya sudah dihapus.", "info");
      onClose();
    } catch (error) {
      onSaved?.(
        error instanceof Error
          ? error.message
          : "Belum bisa dihapus sekarang.",
        "error",
      );
    } finally {
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  }

  return (
    <BottomSheet
      description="Lihat progresnya, tambah tabungan, atau rapihin detail target dari sini."
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Target"
    >
      <div className="space-y-3">
        <Card className="overflow-hidden bg-[linear-gradient(150deg,rgba(var(--overlay-glow-primary),0.22),rgba(var(--overlay-glow-secondary),0.14))]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--bg-card-soft)] text-xl">
                  {goal.icon}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-bold text-[var(--text-primary)]">
                    {goal.title}
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {goal.status === "archived"
                      ? "Sedang diarsipkan dulu"
                      : progress.isCompleted
                        ? "Sudah sampai target ✨"
                        : "Masih ditabung pelan-pelan"}
                  </p>
                </div>
              </div>
              <p className="text-[12px] font-semibold text-[var(--text-primary)]">
                {formatCurrency(progress.savedAmount)} /{" "}
                {formatCurrency(progress.targetAmount)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[13px] font-bold text-[var(--text-primary)]">
                {Math.round(progress.percentage * 100)}%
              </p>
              <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                Sisa {formatCurrency(progress.remainingAmount)}
              </p>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--bg-card-soft)]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-primary),var(--accent-secondary))]"
              style={{ width: `${Math.min(progress.percentage, 1) * 100}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-[var(--text-secondary)]">
            <span>
              {goal.deadline
                ? `Deadline ${formatDateLabel(goal.deadline)}`
                : "Deadline belum diatur"}
            </span>
            <span>Dibuat {formatDateLabel(goal.createdAt.slice(0, 10))}</span>
          </div>
          {goal.note ? (
            <p className="mt-2 text-[12px] leading-5 text-[var(--text-secondary)]">
              {goal.note}
            </p>
          ) : null}
        </Card>

        <Card
          title="Tambah tabungan"
          subtitle={
            goal.status === "archived"
              ? "Target ini lagi diarsipkan, jadi kontribusinya dimatikan dulu."
              : "Setiap tambahan kecil langsung bikin progresnya ikut bergerak."
          }
        >
          <form className="space-y-3" onSubmit={handleContributionSubmit}>
            <div className="grid grid-cols-2 gap-2">
              <Input
                error={contributionAmountError}
                hint={
                  contributionAmountError
                    ? undefined
                    : contributionAmount > 0
                      ? `+${formatCurrency(contributionAmount)}`
                      : "Nominal yang ditambah."
                }
                inputMode="numeric"
                label="Nominal"
                onBlur={() =>
                  setTouched((state) => ({ ...state, contributionAmount: true }))
                }
                onChange={(event) =>
                  setContributionAmountText(
                    toCurrencyInput(parseCurrencyInput(event.target.value)),
                  )
                }
                placeholder="Rp0"
                value={contributionAmountText}
              />
              <Input
                error={contributionDateError}
                label="Tanggal"
                onBlur={() =>
                  setTouched((state) => ({ ...state, contributionDate: true }))
                }
                onChange={(event) => setContributionDate(event.target.value)}
                type="date"
                value={contributionDate}
              />
            </div>

            <label className="flex flex-col gap-1" htmlFor="contribution-note">
              <span className="text-[12px] font-semibold text-[var(--text-secondary)]">
                Catatan tambahan
              </span>
              <textarea
                className="min-h-16 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card-soft)] px-3.5 py-2.5 text-[13px] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)]"
                id="contribution-note"
                onChange={(event) => setContributionNote(event.target.value)}
                placeholder="Misal: hasil nabung minggu ini."
                value={contributionNote}
              />
            </label>

            <Button
              disabled={!canSubmitContribution || isSubmittingContribution}
              fullWidth
              type="submit"
            >
              {isSubmittingContribution ? "Menyimpan..." : "Tambah Tabungan"}
            </Button>
          </form>
        </Card>

        <Card title="Riwayat tambahan" subtitle="Tabungan tumbuh dari waktu ke waktu.">
          {contributions.length > 0 ? (
            <div className="space-y-2">
              {contributions.map((contribution) => (
                <div
                  key={contribution.id}
                  className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[var(--text-primary)]">
                        {formatCurrency(contribution.amount)}
                      </p>
                      <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                        {formatDateLabel(contribution.date)}
                      </p>
                    </div>
                    {contribution.note ? (
                      <p className="max-w-[22ch] text-right text-[10px] leading-4 text-[var(--text-secondary)]">
                        {contribution.note}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] leading-5 text-[var(--text-secondary)]">
              Belum ada tambahan tabungan. Mulai dari nominal kecil juga oke.
            </p>
          )}
        </Card>

        <Card title="Edit target" subtitle="Rapihin nominal atau detail dari sini.">
          <form className="space-y-3" onSubmit={handleEditSubmit}>
            <Input
              error={titleError}
              label="Nama target"
              onBlur={() => setTouched((state) => ({ ...state, title: true }))}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Nama target"
              value={title}
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                error={targetAmountError}
                inputMode="numeric"
                label="Target"
                onBlur={() =>
                  setTouched((state) => ({ ...state, targetAmount: true }))
                }
                onChange={(event) =>
                  setTargetAmountText(
                    toCurrencyInput(parseCurrencyInput(event.target.value)),
                  )
                }
                placeholder="Rp0"
                value={targetAmountText}
              />
              <Input
                hint="Boleh diedit manual."
                inputMode="numeric"
                label="Saat ini"
                onChange={(event) =>
                  setCurrentAmountText(
                    toCurrencyInput(parseCurrencyInput(event.target.value)),
                  )
                }
                placeholder="Rp0"
                value={currentAmountText}
              />
            </div>

            <div className="space-y-2">
              <Input
                error={iconError}
                label="Emoji / icon"
                maxLength={4}
                onBlur={() => setTouched((state) => ({ ...state, icon: true }))}
                onChange={(event) => setIcon(event.target.value)}
                placeholder="🎧"
                value={icon}
              />
              <div className="flex flex-wrap gap-1.5">
                {iconSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    className={[
                      "inline-flex h-9 w-9 items-center justify-center rounded-full border text-base",
                      icon === suggestion
                        ? "border-[var(--accent-primary)] bg-[var(--accent-surface)]"
                        : "border-[var(--border-soft)] bg-[var(--bg-card-soft)]",
                    ].join(" ")}
                    onClick={() => setIcon(suggestion)}
                    type="button"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Deadline"
              onChange={(event) => setDeadline(event.target.value)}
              type="date"
              value={deadline}
            />

            <label className="flex flex-col gap-1" htmlFor="edit-goal-note">
              <span className="text-[12px] font-semibold text-[var(--text-secondary)]">
                Catatan kecil
              </span>
              <textarea
                className="min-h-16 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card-soft)] px-3.5 py-2.5 text-[13px] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)]"
                id="edit-goal-note"
                onChange={(event) => setNote(event.target.value)}
                placeholder="Tambahkan catatan kalau perlu."
                value={note}
              />
            </label>

            <Button disabled={!canSubmitEdit || isSubmittingEdit} fullWidth type="submit">
              {isSubmittingEdit ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </form>
        </Card>

        <Card
          className="border-[rgba(232,123,123,0.22)] bg-[rgba(232,123,123,0.08)]"
          title="Arsip & hapus"
          subtitle="Istirahatin dulu atau hapus permanen."
        >
          <div className="space-y-2">
            <Button
              disabled={goal.status === "archived" || isArchiving}
              fullWidth
              onClick={handleArchive}
              variant="secondary"
            >
              {isArchiving ? "Mengarsipkan..." : "Arsipkan Dulu"}
            </Button>

            {isConfirmingDelete ? (
              <div className="space-y-2">
                <p className="text-[12px] leading-5 text-[var(--text-secondary)]">
                  Yakin mau hapus target ini? Riwayat tabungannya ikut hilang.
                </p>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    disabled={isDeleting}
                    onClick={() => setIsConfirmingDelete(false)}
                    variant="secondary"
                  >
                    Batal
                  </Button>
                  <Button
                    className="flex-1 bg-[var(--danger-soft)] text-white shadow-none"
                    disabled={isDeleting}
                    onClick={handleDelete}
                  >
                    {isDeleting ? "Menghapus..." : "Iya, hapus"}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                className="w-full bg-[var(--danger-soft)] text-white shadow-none"
                disabled={isArchiving}
                onClick={() => setIsConfirmingDelete(true)}
              >
                Hapus Target
              </Button>
            )}
          </div>
        </Card>
      </div>
    </BottomSheet>
  );
}
