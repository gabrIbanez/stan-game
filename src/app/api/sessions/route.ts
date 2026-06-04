import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePlayerName } from "@/lib/player-name";
import { prismaRouteErrorResponse } from "@/lib/prisma-api-error";

export async function GET() {
  try {
    const sessions = await prisma.gameSession.findMany({
      include: {
        players: { orderBy: { orderIndex: "asc" } },
        _count: { select: { players: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(sessions);
  } catch (err) {
    return prismaRouteErrorResponse("GET /api/sessions", err);
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { players, championName, competTheme, useQrRegistration } = body as {
    players?: string[];
    championName?: string;
    competTheme?: string;
    useQrRegistration?: boolean;
  };

  const playerNames = (players ?? [])
    .map((n) => n.trim().replace(/\s+/g, " "))
    .filter(Boolean);
  const qrMode = Boolean(useQrRegistration);

  const seen = new Set<string>();
  for (const name of playerNames) {
    const key = normalizePlayerName(name);
    if (seen.has(key)) {
      return NextResponse.json(
        { error: `Le prénom « ${name} » est en double dans la liste.` },
        { status: 400 },
      );
    }
    seen.add(key);
  }

  if (!playerNames.length && !qrMode) {
    return NextResponse.json(
      { error: "Ajoutez au moins un participant ou activez les inscriptions par QR." },
      { status: 400 },
    );
  }

  try {
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
              ? normalizePlayerName(name) === normalizePlayerName(championName)
              : false,
          })),
        },
      },
      include: {
        players: { orderBy: { orderIndex: "asc" } },
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (err) {
    return prismaRouteErrorResponse("POST /api/sessions", err);
  }
}
