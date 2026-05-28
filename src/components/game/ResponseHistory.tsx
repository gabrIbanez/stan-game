"use client";

import { useCallback, useEffect, useState } from "react";
import type { AnswerMode } from "@/types/game";
import { ANSWER_MODE_LABELS } from "@/lib/game-rules";

type HistoryEntry = {
  id: string;
  playerId: string;
  player: { id: string; name: string };
  questionId: string | null;
  question: { id: string; category: string; text: string } | null;
  round: string;
  answerMode: AnswerMode;
  correct: boolean;
  points: number;
  createdAt: string;
};

type ResponseHistoryProps = {
  sessionId: string;
  refreshKey?: number;
  onUpdated: () => void;
};

export function ResponseHistory({
  sessionId,
  refreshKey = 0,
  onUpdated,
}: ResponseHistoryProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/sessions/${sessionId}/responses`);
    if (res.ok) setEntries(await res.json());
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    if (open) load();
  }, [open, load, refreshKey]);

  async function toggleCorrect(entry: HistoryEntry) {
    await fetch(`/api/sessions/${sessionId}/responses/${entry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correct: !entry.correct }),
    });
    await load();
    onUpdated();
  }

  async function changeMode(entry: HistoryEntry, answerMode: AnswerMode) {
    await fetch(`/api/sessions/${sessionId}/responses/${entry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answerMode }),
    });
    await load();
    onUpdated();
  }

  async function remove(entry: HistoryEntry) {
    if (!confirm(`Supprimer la réponse de ${entry.player.name} (${entry.points} pts) ?`)) {
      return;
    }
    await fetch(`/api/sessions/${sessionId}/responses/${entry.id}`, {
      method: "DELETE",
    });
    await load();
    onUpdated();
  }

  return (
    <section className="space-y-2 border-t border-violet-800 pt-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg bg-violet-900/60 px-3 py-2 font-semibold text-white hover:bg-violet-800"
      >
        <span>Historique des points</span>
        <span className="text-violet-400">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {loading && (
            <p className="text-center text-xs text-violet-400">Chargement…</p>
          )}
          {!loading && entries.length === 0 && (
            <p className="text-center text-xs text-violet-400">Aucune réponse notée.</p>
          )}
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-lg border border-violet-800 bg-violet-950/80 p-2 text-xs"
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <div>
                  <span className="font-bold text-white">{entry.player.name}</span>
                  <span
                    className={`ml-2 font-mono ${
                      entry.points >= 0 ? "text-lime-400" : "text-red-400"
                    }`}
                  >
                    {entry.points > 0 ? "+" : ""}
                    {entry.points} pts
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => remove(entry)}
                  className="shrink-0 text-red-400 hover:text-red-300"
                  title="Annuler cette entrée"
                >
                  Suppr.
                </button>
              </div>
              <p className="text-violet-400">
                {entry.round} · {ANSWER_MODE_LABELS[entry.answerMode]} ·{" "}
                {entry.correct ? "✓ correct" : "✗ faux"}
              </p>
              {entry.question && (
                <p className="mt-0.5 truncate text-violet-500">
                  {entry.question.category}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => toggleCorrect(entry)}
                  className={`rounded px-2 py-0.5 ${
                    entry.correct
                      ? "bg-red-900/80 hover:bg-red-800"
                      : "bg-lime-900/80 hover:bg-lime-800"
                  }`}
                >
                  {entry.correct ? "Marquer faux" : "Marquer bon"}
                </button>
                {(["CASH", "DUO", "CARRE"] as AnswerMode[]).map((mode) =>
                  entry.answerMode !== mode ? (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => changeMode(entry, mode)}
                      className="rounded bg-violet-800 px-2 py-0.5 hover:bg-violet-700"
                    >
                      → {mode}
                    </button>
                  ) : null,
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
