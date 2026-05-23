import { useEffect, useState } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import {
  getCharacterById,
  getCharacterCompanionLine,
} from "../../features/customization/presets";
import { formatMonthLabel } from "../../lib/date";
import {
  formatInsightUsage,
  getInsightStateMessage,
  getInsightTypeLabel,
} from "../../features/ai/insights/copy";
import {
  generateInsightForMonth,
  prepareInsightGeneration,
} from "../../features/ai/insights/insightGenerator";
import type {
  InsightPreparationIdleResult,
  InsightPreparationResult,
} from "../../features/ai/insights/types";
import type { Transaction } from "../../types";

interface AIReflectionCardProps {
  month: string;
  transactions: Transaction[];
  aiEnabled: boolean;
  activeCharacterId?: string;
}

export function AIReflectionCard({
  month,
  transactions,
  aiEnabled,
  activeCharacterId,
}: AIReflectionCardProps) {
  const [state, setState] = useState<InsightPreparationResult | { status: "loading"; usageCount: number; limit: number }>({
    status: "loading",
    usageCount: 0,
    limit: 3,
  });
  const [preparation, setPreparation] = useState<InsightPreparationIdleResult | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState((current) => ({
        status: "loading",
        usageCount: current.usageCount,
        limit: current.limit,
      }));

      try {
        const next = await prepareInsightGeneration({
          month,
          transactions,
          aiEnabled,
        });

        if (cancelled) {
          return;
        }

        setState(next);
        setPreparation(next.status === "idle" ? next : null);
      } catch {
        if (cancelled) {
          return;
        }

        setState({
          status: "error",
          message: getInsightStateMessage("error"),
          usageCount: 0,
          limit: 3,
        });
        setPreparation(null);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [aiEnabled, month, transactions]);

  async function handleGenerate() {
    if (!preparation) {
      return;
    }

    setState({
      status: "loading",
      usageCount: preparation.usageCount,
      limit: preparation.limit,
    });

    const next = await generateInsightForMonth(preparation);
    setState(next);
    setPreparation(next.status === "error" ? preparation : null);
  }

  const usageCount = state.usageCount;
  const limit = state.limit;
  const activeCharacter = getCharacterById(activeCharacterId);
  const companionLine =
    getCharacterCompanionLine(activeCharacterId, "reflection") ??
    "Luma bantu baca polanya pelan-pelan biar tetap terasa ringan.";

  return (
    <Card
      title="Refleksi AI"
      subtitle={`Bacaan pola halus untuk ${formatMonthLabel(month).toLowerCase()} tanpa bikin halaman ini terasa berat.`}
      className="bg-[linear-gradient(160deg,rgba(var(--overlay-glow-primary),0.16),rgba(var(--overlay-glow-secondary),0.10))]"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
          <span>Refleksi perilaku</span>
          <span>{formatInsightUsage(usageCount, limit)}</span>
        </div>

        <div className="rounded-[18px] border border-[var(--border-soft)] bg-[rgba(255,243,220,0.06)] px-3.5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            {activeCharacter.name} lagi nemenin
          </p>
          <p className="mt-1 text-[12px] leading-5 text-[var(--text-secondary)]">
            {companionLine}
          </p>
        </div>

        {state.status === "success" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-display text-2xl font-bold leading-tight text-[var(--text-primary)]">
                {state.insight.headline}
              </h3>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                {state.insight.reflection}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {state.insight.types.map((type) => (
                <span
                  key={type}
                  className="rounded-full border border-[var(--border-soft)] bg-[rgba(255,243,220,0.08)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]"
                >
                  {getInsightTypeLabel(type)}
                </span>
              ))}
            </div>

            <div className="rounded-[20px] border border-[var(--border-soft)] bg-[rgba(255,243,220,0.06)] p-4">
              <p className="text-sm leading-6 text-[var(--text-primary)]">
                {state.insight.action}
              </p>
            </div>

            <p className="text-xs leading-5 text-[var(--text-muted)]">
              {state.cached
                ? "Refleksi ini disimpan untuk bulan ini dan akan diperbarui kalau datanya berubah."
                : "Refleksi bulan ini sudah disimpan, jadi nanti bisa dibuka lagi tanpa generate ulang."}
            </p>
          </div>
        ) : state.status === "idle" ? (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              {getInsightStateMessage("idle")}
            </p>
            <Button onClick={() => void handleGenerate()} variant="secondary">
              Bikin refleksi AI
            </Button>
          </div>
        ) : state.status === "loading" ? (
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            {getInsightStateMessage("loading")}
          </p>
        ) : (
          <div className="space-y-4">
            <p
              className={[
                "text-sm leading-6",
                state.status === "error"
                  ? "text-[var(--danger-soft)]"
                  : "text-[var(--text-secondary)]",
              ].join(" ")}
            >
              {state.message}
            </p>
            {state.status === "error" && preparation ? (
              <Button onClick={() => void handleGenerate()} variant="secondary">
                Coba lagi
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </Card>
  );
}
