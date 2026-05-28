import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncSessionScores } from "@/lib/scoring";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;

  await prisma.gameSession.update({
    where: { id },
    data: { finaleHidden: false },
  });

  await syncSessionScores(id);

  const updated = await prisma.gamePlayer.findMany({
    where: { sessionId: id },
    orderBy: { score: "desc" },
  });

  return NextResponse.json(updated);
}
