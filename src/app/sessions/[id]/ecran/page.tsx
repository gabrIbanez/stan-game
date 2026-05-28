"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { GameSession, GamePlayer, Question } from "@/types/game";
import { GameBoard } from "@/components/game/GameBoard";
import { getMusicalAudioUrl, isMusicalQuestion } from "@/lib/question-utils";

type SessionWithPlayers = GameSession & {
  players: GamePlayer[];
};

export default function EcranPage() {
  const params = useParams();
  const id = params.id as string;
  const [session, setSession] = useState<SessionWithPlayers | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  const refresh = useCallback(async () => {
    const sRes = await fetch(`/api/sessions/${id}`);
    const s = await sRes.json();
    setSession(s);
    if (s.currentQuestionId) {
      const qRes = await fetch(`/api/questions/${s.currentQuestionId}`);
      if (qRes.ok) setCurrentQuestion(await qRes.json());
    } else {
      setCurrentQuestion(null);
    }
  }, [id]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 800);
    return () => clearInterval(interval);
  }, [refresh]);

  if (!session || !currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-950 to-purple-950">
        <p className="text-3xl font-bold text-amber-400 animate-pulse">
          En attente de la question…
        </p>
      </div>
    );
  }

  const displayMode = session.displayMode;

  const champion = session.players.find((p) => p.isChampion);
  const challenger = session.players
    .filter((p) => !p.isChampion && !p.eliminated)
    .sort((a, b) => b.score - a.score)[0];

  return (
    <div className="min-h-screen">
      <GameBoard
        questionText={currentQuestion.text}
        category={currentQuestion.category}
        options={currentQuestion.options}
        correctAnswer={currentQuestion.correctAnswer}
        displayMode={displayMode}
        revealAnswer={session.revealAnswer}
        leftScore={
          session.currentRound === "FINALE" && session.finaleHidden
            ? undefined
            : challenger?.score
        }
        rightScore={
          session.currentRound === "FINALE" && session.finaleHidden
            ? undefined
            : champion?.score
        }
        leftLabel={challenger?.name}
        rightLabel={champion?.name ?? "Champion"}
        audioUrl={getMusicalAudioUrl(currentQuestion)}
        musicPlayNonce={session.musicPlayNonce}
        musicStopNonce={session.musicStopNonce}
        isMusical={isMusicalQuestion(currentQuestion)}
        showMusicalPlayer={isMusicalQuestion(currentQuestion)}
      />
    </div>
  );
}
