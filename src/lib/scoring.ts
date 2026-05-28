import { prisma } from "@/lib/prisma";
import { pointsForAnswer } from "@/lib/game-rules";
import type { AnswerMode, GameRound } from "@/types/game";

export function computeResponsePoints(
  round: GameRound,
  answerMode: AnswerMode,
  correct: boolean,
  competIndividual: boolean,
): number {
  return pointsForAnswer(round, answerMode, correct, competIndividual);
}

/** Recalcule le score affiché de chaque joueur à partir de l'historique. */
export async function syncSessionScores(sessionId: string) {
  const session = await prisma.gameSession.findUnique({
    where: { id: sessionId },
  });
  if (!session) return;

  const [responses, players] = await Promise.all([
    prisma.playerResponse.findMany({ where: { sessionId } }),
    prisma.gamePlayer.findMany({ where: { sessionId } }),
  ]);

  await prisma.$transaction(
    players.map((player) => {
      const score = responses
        .filter((r) => r.playerId === player.id)
        .filter((r) => !(r.round === "FINALE" && session.finaleHidden))
        .reduce((sum, r) => sum + r.points, 0);

      return prisma.gamePlayer.update({
        where: { id: player.id },
        data: { score },
      });
    }),
  );
}
