import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { AnswerMode, CompetWave, GameRound, SessionStatus } from "@/types/game";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const session = await prisma.gameSession.findUnique({
    where: { id },
    include: {
      players: { orderBy: { orderIndex: "asc" } },
      responses: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!session) {
    return NextResponse.json({ error: "Partie introuvable." }, { status: 404 });
  }
  return NextResponse.json(session);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  const session = await prisma.gameSession.update({
    where: { id },
    data: {
      ...(body.status !== undefined && { status: body.status as SessionStatus }),
      ...(body.currentRound !== undefined && {
        currentRound: body.currentRound as GameRound,
      }),
      ...(body.currentQuestionId !== undefined && {
        currentQuestionId: body.currentQuestionId,
      }),
      ...(body.displayMode !== undefined && {
        displayMode: body.displayMode as AnswerMode | null,
      }),
      ...(body.revealAnswer !== undefined && { revealAnswer: body.revealAnswer }),
      ...(body.qualifQuestionSlot !== undefined && {
        qualifQuestionSlot: body.qualifQuestionSlot,
      }),
      ...(body.competWave !== undefined && {
        competWave: body.competWave as CompetWave | null,
      }),
      ...(body.competTheme !== undefined && {
        competTheme: body.competTheme?.trim() || null,
      }),
      ...(body.finaleHidden !== undefined && { finaleHidden: body.finaleHidden }),
      ...(body.championName !== undefined && {
        championName: body.championName?.trim() || null,
      }),
      ...(body.musicPlayNonce !== undefined && {
        musicPlayNonce: body.musicPlayNonce,
      }),
      ...(body.musicStopNonce !== undefined && {
        musicStopNonce: body.musicStopNonce,
      }),
      ...(body.videoPlayNonce !== undefined && {
        videoPlayNonce: body.videoPlayNonce,
      }),
      ...(body.videoStopNonce !== undefined && {
        videoStopNonce: body.videoStopNonce,
      }),
      ...(body.imagePlayNonce !== undefined && {
        imagePlayNonce: body.imagePlayNonce,
      }),
      ...(body.imageStopNonce !== undefined && {
        imageStopNonce: body.imageStopNonce,
      }),
      ...(body.registrationsOpen !== undefined && {
        registrationsOpen: body.registrationsOpen,
      }),
      ...(body.showJoinQrOnScreen !== undefined && {
        showJoinQrOnScreen: body.showJoinQrOnScreen,
      }),
      ...(body.targetPlayerId !== undefined && {
        targetPlayerId: body.targetPlayerId,
      }),
      ...(body.showTargetPlayerOnTv !== undefined && {
        showTargetPlayerOnTv: body.showTargetPlayerOnTv,
      }),
    },
    include: {
      players: { orderBy: { orderIndex: "asc" } },
    },
  });

  return NextResponse.json(session);
}
