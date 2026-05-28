"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { GameSession, GamePlayer, Question } from "@/types/game";
import { GameBoard } from "@/components/game/GameBoard";
import { HostPanel } from "@/components/game/HostPanel";
import { SessionToolbar } from "@/components/game/SessionToolbar";
import { ROUND_LABELS } from "@/lib/game-rules";
import {
  getMusicalAudioUrl,
  getVideoUrl,
  isMusicalQuestion,
  isVideoQuestion,
} from "@/lib/question-utils";

type SessionWithPlayers = GameSession & {
  players: GamePlayer[];
};

export default function SessionPage() {
  const params = useParams();
  const id = params.id as string;
  const [session, setSession] = useState<SessionWithPlayers | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  const refresh = useCallback(async () => {
    const [sRes, qRes] = await Promise.all([
      fetch(`/api/sessions/${id}`),
      fetch("/api/questions"),
    ]);
    const s = await sRes.json();
    const q = await qRes.json();
    setSession(s);
    setQuestions(q);
    if (s.currentQuestionId) {
      const found = q.find((x: Question) => x.id === s.currentQuestionId);
      setCurrentQuestion(found ?? null);
      if (!found) {
        const one = await fetch(`/api/questions/${s.currentQuestionId}`);
        if (one.ok) setCurrentQuestion(await one.json());
      }
    } else {
      setCurrentQuestion(null);
    }
  }, [id]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  if (!session) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-violet-300">
        Chargement de la partie…
      </div>
    );
  }

  const displayMode = session.displayMode;

  const champion = session.players.find((p) => p.isChampion);
  const challenger = session.players
    .filter((p) => !p.isChampion && !p.eliminated)
    .sort((a, b) => b.score - a.score)[0];

  const leftScore =
    session.currentRound === "FINALE" && session.finaleHidden
      ? undefined
      : challenger?.score;
  const rightScore =
    session.currentRound === "FINALE" && session.finaleHidden
      ? undefined
      : champion?.score;

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col lg:flex-row">
      <div className="flex flex-1 flex-col">
        <SessionToolbar
          sessionId={id}
          players={session.players}
          status={session.status}
          currentRound={session.currentRound}
        />
        <div className="border-b border-violet-900 bg-violet-950/80 px-4 py-2">
          <p className="text-sm text-violet-300">{ROUND_LABELS[session.currentRound]}</p>
          <div className="flex flex-wrap gap-2">
            {session.players.map((p) => (
              <span
                key={p.id}
                className={`rounded-full px-3 py-0.5 text-sm ${
                  p.eliminated
                    ? "bg-slate-800 text-slate-500 line-through"
                    : p.qualified
                      ? "bg-lime-900 text-lime-200"
                      : "bg-violet-800 text-violet-100"
                }`}
              >
                {p.name}
                {p.isChampion && " ★"}
                {" — "}
                {session.currentRound === "FINALE" && session.finaleHidden
                  ? "?"
                  : p.score}
              </span>
            ))}
          </div>
        </div>

        {currentQuestion ? (
          <GameBoard
            questionText={currentQuestion.text}
            category={currentQuestion.category}
            options={currentQuestion.options}
            correctAnswer={currentQuestion.correctAnswer}
            displayMode={displayMode}
            revealAnswer={session.revealAnswer}
            leftScore={leftScore}
            rightScore={rightScore}
            leftLabel={challenger?.name.slice(0, 6)}
            rightLabel={champion?.name.slice(0, 6) ?? "Champ"}
            audioUrl={getMusicalAudioUrl(currentQuestion)}
            videoUrl={getVideoUrl(currentQuestion)}
            musicPlayNonce={session.musicPlayNonce}
            musicStopNonce={session.musicStopNonce}
            videoPlayNonce={session.videoPlayNonce}
            videoStopNonce={session.videoStopNonce}
            isMusical={isMusicalQuestion(currentQuestion)}
            showMusicalPlayer={false}
            isVideo={isVideoQuestion(currentQuestion)}
            showVideoPlayer={false}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-indigo-950 to-purple-950 p-8 text-center">
            <div>
              <p className="text-2xl font-bold text-amber-400">
                Plateau prêt — chargez une question
              </p>
              <p className="mt-2 text-violet-300">
                Utilisez le pupitre présentateur à droite (ou en bas sur mobile).
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="h-[45vh] w-full shrink-0 lg:h-auto lg:w-96">
        <HostPanel
          sessionId={id}
          currentRound={session.currentRound}
          players={session.players}
          questions={questions}
          currentQuestionId={session.currentQuestionId}
          displayMode={session.displayMode}
          revealAnswer={session.revealAnswer}
          qualifQuestionSlot={session.qualifQuestionSlot}
          competWave={session.competWave}
          finaleHidden={session.finaleHidden}
          musicPlayNonce={session.musicPlayNonce}
          musicStopNonce={session.musicStopNonce}
          videoPlayNonce={session.videoPlayNonce}
          videoStopNonce={session.videoStopNonce}
          onSessionUpdate={refresh}
        />
      </div>
    </div>
  );
}
