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
  const { players, championName, competTheme, useQrRegistration } = body as {
    players?: string[];
    championName?: string;
    competTheme?: string;
    useQrRegistration?: boolean;
  };

  const playerNames = (players ?? []).map((n) => n.trim()).filter(Boolean);
  const qrMode = Boolean(useQrRegistration);

  if (!playerNames.length && !qrMode) {
    return NextResponse.json(
      { error: "Ajoutez au moins un participant ou activez les inscriptions par QR." },
      { status: 400 },
    );
  }

  const session = await prisma.gameSession.create({
    data: {
      championName: championName?.trim() || null,
      competTheme: competTheme?.trim() || null,
      status: qrMode && !playerNames.length ? "SETUP" : "IN_PROGRESS",
      registrationsOpen: true,
      showJoinQrOnScreen: qrMode,
      players: {
        create: playerNames.map((name, index) => ({
          name,
          orderIndex: index,
          isChampion: championName
            ? name.toLowerCase() === championName.trim().toLowerCase()
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
