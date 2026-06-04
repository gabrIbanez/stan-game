import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; playerId: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const { id: sessionId, playerId } = await params;

  const player = await prisma.gamePlayer.findFirst({
    where: { id: playerId, sessionId },
  });

  if (!player) {
    return NextResponse.json({ error: "Participant introuvable." }, { status: 404 });
  }

  await prisma.gamePlayer.delete({ where: { id: playerId } });

  const players = await prisma.gamePlayer.findMany({
    where: { sessionId },
    orderBy: { orderIndex: "asc" },
  });

  await Promise.all(
    players.map((p, index) =>
      prisma.gamePlayer.update({
        where: { id: p.id },
        data: { orderIndex: index },
      }),
    ),
  );

  const updated = await prisma.gamePlayer.findMany({
    where: { sessionId },
    orderBy: { orderIndex: "asc" },
  });

  return NextResponse.json({ ok: true, players: updated });
}
