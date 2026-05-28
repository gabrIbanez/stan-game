"use client";

import { useCallback, useEffect, useState } from "react";
import type { Question } from "@/types/game";
import { QuestionForm } from "@/components/questions/QuestionForm";
import { ANSWER_MODE_OPTIONS, QUESTION_ROUND_OPTIONS } from "@/lib/constants";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editing, setEditing] = useState<Question | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>("");

  const load = useCallback(async () => {
    const res = await fetch("/api/questions");
    setQuestions(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette question ?")) return;
    await fetch(`/api/questions/${id}`, { method: "DELETE" });
    load();
  }

  const filtered = filter
    ? questions.filter((q) => q.round === filter)
    : questions;

  const roundLabel = (v: string) =>
    QUESTION_ROUND_OPTIONS.find((o) => o.value === v)?.label ?? v;
  const modeLabel = (v: string) =>
    ANSWER_MODE_OPTIONS.find((o) => o.value === v)?.label ?? v;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-amber-400">Banque de questions</h1>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="rounded-lg bg-amber-500 px-4 py-2 font-bold text-black hover:bg-amber-400"
        >
          + Nouvelle question
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("")}
          className={`rounded-full px-3 py-1 text-sm ${!filter ? "bg-amber-500 text-black" : "bg-violet-800"}`}
        >
          Toutes
        </button>
        {QUESTION_ROUND_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setFilter(o.value)}
            className={`rounded-full px-3 py-1 text-sm ${
              filter === o.value ? "bg-amber-500 text-black" : "bg-violet-800"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {(showForm || editing) && (
        <div className="mb-8">
          <QuestionForm
            initial={editing ?? undefined}
            onSaved={() => {
              setShowForm(false);
              setEditing(null);
              load();
            }}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      <ul className="space-y-3">
        {filtered.map((q) => (
          <li
            key={q.id}
            className="rounded-xl border border-violet-800 bg-violet-950/40 p-4"
          >
            <div className="mb-1 flex flex-wrap gap-2 text-xs">
              <span className="rounded bg-violet-800 px-2 py-0.5">
                {roundLabel(q.round)}
              </span>
              <span className="rounded bg-orange-800/80 px-2 py-0.5">
                {modeLabel(q.answerMode)}
              </span>
              {q.qualifSlot && (
                <span className="rounded bg-fuchsia-800 px-2 py-0.5">
                  Qualif Q{q.qualifSlot}
                </span>
              )}
              {q.kind === "MUSICAL" && (
                <span className="rounded bg-fuchsia-800 px-2 py-0.5">🎵 Musicale</span>
              )}
              {q.theme && (
                <span className="rounded bg-indigo-800 px-2 py-0.5">{q.theme}</span>
              )}
            </div>
            <p className="font-medium text-white">{q.text}</p>
            <p className="text-sm text-amber-400">{q.category}</p>
            <p className="mt-1 text-sm text-violet-300">
              ✓ {q.correctAnswer}
              {q.options.length > 0 && ` — [${q.options.join(" | ")}]`}
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(q);
                  setShowForm(false);
                }}
                className="text-sm text-amber-400 hover:underline"
              >
                Modifier
              </button>
              <button
                type="button"
                onClick={() => handleDelete(q.id)}
                className="text-sm text-red-400 hover:underline"
              >
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="text-center text-violet-400">Aucune question pour le moment.</p>
      )}
    </div>
  );
}
