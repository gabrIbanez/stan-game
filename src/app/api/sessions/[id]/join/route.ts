import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const session = await prisma.gameSession.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      registrationsOpen: true,
      championName: true,
      competTheme: true,
      _count: { select: { players: true } },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Partie introuvable." }, { status: 404 });
  }

  return NextResponse.json({
    sessionId: session.id,
    status: session.status,
    registrationsOpen: session.registrationsOpen,
    championName: session.championName,
    competTheme: session.competTheme,
    playerCount: session._count.players,
  });
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const name = String(body.name ?? "").trim();

  if (!name || name.length < 2) {
    return NextResponse.json(
      { error: "Indique ton prénom (au moins 2 caractères)." },
      { status: 400 },
    );
  }

  if (name.length > 40) {
    return NextResponse.json(
      { error: "Prénom trop long (40 caractères max)." },
      { status: 400 },
    );
  }

  const session = await prisma.gameSession.findUnique({
    where: { id },
    include: { players: true },
  });

  if (!session) {
    return NextResponse.json({ error: "Partie introuvable." }, { status: 404 });
  }

  if (!session.registrationsOpen) {
    return NextResponse.json(
      { error: "Les inscriptions sont closes pour cette partie." },
      { status: 403 },
    );
  }

  const normalized = name.toLowerCase();
  const duplicate = session.players.some(
    (p) => p.name.trim().toLowerCase() === normalized,
  );
  if (duplicate) {
    return NextResponse.json(
      { error: "Ce prénom est déjà pris sur cette partie." },
      { status: 409 },
    );
  }

  const player = await prisma.gamePlayer.create({
    data: {
      sessionId: id,
      name,
      orderIndex: session.players.length,
      joinedViaQr: true,
      isChampion: session.championName
        ? session.championName.trim().toLowerCase() === normalized
        : false,
    },
  });

  return NextResponse.json(
    {
      playerId: player.id,
      name: player.name,
      isChampion: player.isChampion,
    },
    { status: 201 },
  );
}
