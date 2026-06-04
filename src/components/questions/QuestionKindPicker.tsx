"use client";

import type { QuestionKind } from "@/types/game";
import { QUESTION_KIND_GUIDES } from "@/lib/question-kind-guide";

type QuestionKindPickerProps = {
  value: QuestionKind;
  onChange: (kind: QuestionKind) => void;
  championName?: string | null;
};

export function QuestionKindPicker({
  value,
  onChange,
  championName,
}: QuestionKindPickerProps) {
  const stan = championName?.trim() || "Stan";

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-white">Choisis le format de ta question</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {QUESTION_KIND_GUIDES.map((guide) => {
          const selected = value === guide.kind;
          return (
            <button
              key={guide.kind}
              type="button"
              onClick={() => onChange(guide.kind)}
              className={`rounded-xl border p-4 text-left transition ${
                selected
                  ? "border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/50"
                  : "border-violet-700 bg-violet-950/50 hover:border-violet-500"
              }`}
            >
              <span className="text-2xl">{guide.emoji}</span>
              <p className="mt-2 font-bold text-white">{guide.label}</p>
              <p className="mt-1 text-xs text-violet-300">{guide.summary}</p>
            </button>
          );
        })}
      </div>
      {(() => {
        const guide = QUESTION_KIND_GUIDES.find((g) => g.kind === value)!;
        return (
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-sm">
            <p className="font-semibold text-amber-200">
              Idées pour {stan} & toi
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-violet-200">
              {guide.stanIdeas.map((idea) => (
                <li key={idea}>{idea}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-violet-400">
              <strong className="text-violet-300">Côté plateau :</strong> {guide.hostTip}
            </p>
          </div>
        );
      })()}
    </div>
  );
}
