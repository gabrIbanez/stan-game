import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sessions = await prisma.gameSession.findMany({
    include: {
      players: { orderBy: { orderIndex: "asc" } },
      _count: { select: { players: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(sessions);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { players, championName, competTheme } = body as {
    players: string[];
    championName?: string;
    competTheme?: string;
  };

  if (!players?.length) {
    return NextResponse.json(
      { error: "Ajoutez au moins un participant." },
      { status: 400 },
    );
  }

  const session = await prisma.gameSession.create({
    data: {
      championName: championName?.trim() || null,
      competTheme: competTheme?.trim() || null,
      status: "IN_PROGRESS",
      players: {
        create: players.map((name, index) => ({
          name: name.trim(),
          orderIndex: index,
          isChampion: championName
            ? name.trim().toLowerCase() === championName.trim().toLowerCase()
            : false,
        })),
      },
    },
    include: {
      players: { orderBy: { orderIndex: "asc" } },
    },
  });

  return NextResponse.json(session, { status: 201 });
}
