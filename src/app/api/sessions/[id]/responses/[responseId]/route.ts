import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeResponsePoints, syncSessionScores } from "@/lib/scoring";
import type { AnswerMode } from "@/types/game";

type Params = { params: Promise<{ id: string; responseId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id: sessionId, responseId } = await params;
  const body = await request.json();

  const existing = await prisma.playerResponse.findFirst({
    where: { id: responseId, sessionId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Entrée introuvable." }, { status: 404 });
  }

  const correct =
    body.correct !== undefined ? Boolean(body.correct) : existing.correct;
  const answerMode = (body.answerMode ?? existing.answerMode) as AnswerMode;

  const points = computeResponsePoints(
    existing.round,
    answerMode,
    correct,
    existing.competIndividual,
  );

  const response = await prisma.playerResponse.update({
    where: { id: responseId },
    data: { correct, answerMode, points },
  });

  await syncSessionScores(sessionId);

  const players = await prisma.gamePlayer.findMany({
    where: { sessionId },
    orderBy: { orderIndex: "asc" },
  });

  return NextResponse.json({ response, players });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id: sessionId, responseId } = await params;

  const existing = await prisma.playerResponse.findFirst({
    where: { id: responseId, sessionId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Entrée introuvable." }, { status: 404 });
  }

  await prisma.playerResponse.delete({ where: { id: responseId } });
  await syncSessionScores(sessionId);

  const players = await prisma.gamePlayer.findMany({
    where: { sessionId },
    orderBy: { orderIndex: "asc" },
  });

  return NextResponse.json({ ok: true, players });
}
