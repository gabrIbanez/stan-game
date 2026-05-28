import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeResponsePoints, syncSessionScores } from "@/lib/scoring";
import type { AnswerMode } from "@/types/game";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id: sessionId } = await params;

  const responses = await prisma.playerResponse.findMany({
    where: { sessionId },
    include: {
      player: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const questionIds = [
    ...new Set(responses.map((r) => r.questionId).filter(Boolean)),
  ] as string[];

  const questions =
    questionIds.length > 0
      ? await prisma.question.findMany({
          where: { id: { in: questionIds } },
          select: { id: true, category: true, text: true },
        })
      : [];

  const questionMap = Object.fromEntries(questions.map((q) => [q.id, q]));

  return NextResponse.json(
    responses.map((r) => ({
      ...r,
      question: r.questionId ? questionMap[r.questionId] ?? null : null,
    })),
  );
}

export async function POST(request: Request, { params }: Params) {
  const { id: sessionId } = await params;
  const body = await request.json();
  const { playerId, questionId, answerMode, correct, competIndividual } = body as {
    playerId: string;
    questionId?: string;
    answerMode: AnswerMode;
    correct: boolean;
    competIndividual?: boolean;
  };

  const session = await prisma.gameSession.findUnique({
    where: { id: sessionId },
    include: { players: true },
  });

  if (!session) {
    return NextResponse.json({ error: "Partie introuvable." }, { status: 404 });
  }

  const player = session.players.find((p) => p.id === playerId);
  if (!player) {
    return NextResponse.json({ error: "Joueur introuvable." }, { status: 404 });
  }

  const isIndividual = competIndividual ?? session.competWave === "INDIVIDUAL";
  const points = computeResponsePoints(
    session.currentRound,
    answerMode,
    correct,
    isIndividual,
  );

  const response = await prisma.playerResponse.create({
    data: {
      sessionId,
      playerId,
      questionId: questionId ?? null,
      round: session.currentRound,
      answerMode,
      correct,
      points,
      competIndividual: isIndividual,
    },
  });

  await syncSessionScores(sessionId);

  const players = await prisma.gamePlayer.findMany({
    where: { sessionId },
    orderBy: { orderIndex: "asc" },
  });

  return NextResponse.json({ response, players }, { status: 201 });
}
