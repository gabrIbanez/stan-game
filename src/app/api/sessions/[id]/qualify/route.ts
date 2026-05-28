import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { qualifiedCount } from "@/lib/game-rules";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { playerIds } = body as { playerIds?: string[] };

  const players = await prisma.gamePlayer.findMany({
    where: { sessionId: id, eliminated: false },
    orderBy: [{ score: "desc" }, { orderIndex: "asc" }],
  });

  const topCount = qualifiedCount();
  const toQualify =
    playerIds ??
    players.slice(0, topCount).map((p) => p.id);

  await prisma.gamePlayer.updateMany({
    where: { sessionId: id },
    data: { qualified: false },
  });

  await prisma.gamePlayer.updateMany({
    where: { id: { in: toQualify } },
    data: { qualified: true },
  });

  const others = players
    .filter((p) => !toQualify.includes(p.id))
    .map((p) => p.id);

  if (others.length) {
    await prisma.gamePlayer.updateMany({
      where: { id: { in: others } },
      data: { eliminated: true },
    });
  }

  const updated = await prisma.gamePlayer.findMany({
    where: { sessionId: id },
    orderBy: { orderIndex: "asc" },
  });

  return NextResponse.json(updated);
}
