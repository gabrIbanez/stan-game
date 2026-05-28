"use client";

import type { AnswerMode } from "@/types/game";
import { ANSWER_MODE_LABELS, optionsForMode } from "@/lib/game-rules";
import { MusicalBlindTest } from "@/components/game/MusicalBlindTest";
import { VideoPrompt } from "@/components/game/VideoPrompt";

type GameBoardProps = {
  questionText: string;
  category: string;
  options: string[];
  correctAnswer: string;
  displayMode: AnswerMode | null;
  revealAnswer: boolean;
  leftScore?: number;
  rightScore?: number;
  leftLabel?: string;
  rightLabel?: string;
  audioUrl?: string | null;
  videoUrl?: string | null;
  musicPlayNonce?: number;
  musicStopNonce?: number;
  videoPlayNonce?: number;
  videoStopNonce?: number;
  showMusicalPlayer?: boolean;
  isMusical?: boolean;
  showVideoPlayer?: boolean;
  isVideo?: boolean;
};

function AnswerPill({
  text,
  variant,
}: {
  text: string;
  variant: "default" | "correct" | "hidden";
}) {
  const base =
    "flex min-h-[4.5rem] items-center justify-center rounded-full border-4 px-6 py-3 text-center text-lg font-bold text-white shadow-lg transition-all";
  const styles = {
    default:
      "border-amber-300 bg-gradient-to-b from-orange-400 to-orange-600 shadow-orange-900/50",
    correct:
      "border-lime-300 bg-gradient-to-b from-lime-400 to-green-600 shadow-lime-900/50 scale-[1.02]",
    hidden: "invisible",
  };
  return <div className={`${base} ${styles[variant]}`}>{text}</div>;
}

export function GameBoard({
  questionText,
  category,
  options,
  correctAnswer,
  displayMode,
  revealAnswer,
  leftScore,
  rightScore,
  leftLabel,
  rightLabel,
  audioUrl,
  videoUrl,
  musicPlayNonce = 0,
  musicStopNonce = 0,
  videoPlayNonce = 0,
  videoStopNonce = 0,
  showMusicalPlayer = false,
  isMusical = false,
  showVideoPlayer = false,
  isVideo = false,
}: GameBoardProps) {
  const modeChosen = displayMode !== null;
  const visibleOptions = displayMode
    ? optionsForMode(options, displayMode)
    : [];

  const padded =
    displayMode === "CARRE"
      ? [...visibleOptions, "", "", ""].slice(0, 4)
      : displayMode === "DUO"
        ? [...visibleOptions, ""].slice(0, 2)
        : [];

  const showGrid = displayMode === "DUO" || displayMode === "CARRE";
  const showCashBanner = displayMode === "CASH";

  return (
    <div className="relative flex min-h-[70vh] flex-col justify-end bg-gradient-to-b from-indigo-950 via-violet-900 to-purple-950 p-6 md:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,180,50,0.08)_0%,_transparent_70%)]" />

      {showMusicalPlayer && isMusical && audioUrl && (
        <MusicalBlindTest
          audioUrl={audioUrl}
          playNonce={musicPlayNonce}
          stopNonce={musicStopNonce}
        />
      )}

      {isMusical && !showMusicalPlayer && (
        <div className="relative z-10 mx-auto mb-6 max-w-lg rounded-2xl border-2 border-fuchsia-400/50 bg-fuchsia-950/40 px-6 py-4 text-center">
          <p className="text-2xl">🎵</p>
          <p className="font-bold text-fuchsia-200">Blind test — écran TV</p>
          <p className="text-sm text-violet-300">Lance l&apos;extrait depuis le pupitre.</p>
        </div>
      )}

      {showVideoPlayer && isVideo && videoUrl && (
        <VideoPrompt
          videoUrl={videoUrl}
          playNonce={videoPlayNonce}
          stopNonce={videoStopNonce}
        />
      )}

      {isVideo && !showVideoPlayer && (
        <div className="relative z-10 mx-auto mb-6 max-w-lg rounded-2xl border-2 border-indigo-400/50 bg-indigo-950/40 px-6 py-4 text-center">
          <p className="text-2xl">🎬</p>
          <p className="font-bold text-indigo-200">Vidéo — écran TV</p>
          <p className="text-sm text-violet-300">Lance la vidéo depuis le pupitre.</p>
        </div>
      )}

      {!modeChosen && !isMusical && !isVideo && (
        <div className="relative mx-auto mb-8 max-w-2xl animate-pulse rounded-3xl border-4 border-dashed border-amber-400/60 bg-violet-950/40 px-8 py-10 text-center">
          <p className="text-2xl font-bold text-amber-300">
            Le participant choisit son mode
          </p>
          <p className="mt-2 text-lg text-violet-200">Cash · Duo · Carré</p>
        </div>
      )}

      {showGrid && (
        <div className="relative mx-auto mb-6 w-full max-w-4xl">
          <div
            className={`grid gap-4 ${
              displayMode === "DUO"
                ? "mx-auto max-w-2xl grid-cols-2"
                : "grid-cols-2"
            }`}
          >
            {displayMode === "CARRE" &&
              padded.map((opt, i) => (
                <AnswerPill
                  key={i}
                  text={opt || "—"}
                  variant={
                    !opt
                      ? "hidden"
                      : revealAnswer && opt === correctAnswer
                        ? "correct"
                        : "default"
                  }
                />
              ))}
            {displayMode === "DUO" &&
              padded.map((opt, i) => (
                <AnswerPill
                  key={i}
                  text={opt}
                  variant={
                    revealAnswer && opt === correctAnswer ? "correct" : "default"
                  }
                />
              ))}
          </div>

          {(leftScore !== undefined || rightScore !== undefined) && (
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
              <div className="flex h-20 w-14 flex-col overflow-hidden rounded-full border-2 border-amber-200 shadow-xl">
                <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-orange-400 to-orange-600 text-white">
                  <span className="text-[10px] uppercase opacity-80">
                    {leftLabel ?? ""}
                  </span>
                  <span className="text-xl font-black">{leftScore ?? "—"}</span>
                </div>
                <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-fuchsia-500 to-pink-600 text-white">
                  <span className="text-[10px] uppercase opacity-80">
                    {rightLabel ?? ""}
                  </span>
                  <span className="text-xl font-black">{rightScore ?? "—"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showCashBanner && (
        <div className="mx-auto mb-8 max-w-3xl rounded-3xl border-4 border-amber-300 bg-gradient-to-b from-orange-400/90 to-orange-600/90 px-8 py-6 text-center">
          <p className="text-2xl font-bold text-white">
            {ANSWER_MODE_LABELS.CASH} — réponse orale
          </p>
          {revealAnswer && (
            <p className="mt-4 text-xl font-bold text-lime-200">
              Bonne réponse : {correctAnswer}
            </p>
          )}
        </div>
      )}

      <div className="relative mx-auto w-full max-w-5xl">
        <div className="rounded-3xl border-[6px] border-amber-400 bg-gradient-to-b from-slate-100 to-slate-200 p-1 shadow-2xl shadow-amber-900/30">
          <div className="rounded-2xl bg-gradient-to-b from-violet-700 to-violet-900 px-6 py-8 text-center md:px-12">
            <p className="text-xl font-bold leading-snug text-white md:text-2xl lg:text-3xl">
              {questionText}
            </p>
            <div className="mt-6 inline-block rounded-xl bg-white/95 px-8 py-2">
              <span className="text-lg font-black tracking-wide text-orange-600 md:text-xl">
                {category}
              </span>
            </div>
            {modeChosen && displayMode && (
              <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-amber-300">
                Mode {ANSWER_MODE_LABELS[displayMode]}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
