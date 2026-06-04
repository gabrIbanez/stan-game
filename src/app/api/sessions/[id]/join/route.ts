import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isDuplicatePlayerName, normalizePlayerName } from "@/lib/player-name";

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

  if (
    isDuplicatePlayerName(
      name,
      session.players.map((p) => p.name),
    )
  ) {
    return NextResponse.json(
      { error: "Ce prénom est déjà inscrit sur cette partie (un seul par personne)." },
      { status: 409 },
    );
  }

  const normalized = normalizePlayerName(name);

  const player = await prisma.gamePlayer.create({
    data: {
      sessionId: id,
      name: name.trim().replace(/\s+/g, " "),
      orderIndex: session.players.length,
      joinedViaQr: true,
      isChampion: session.championName
        ? normalizePlayerName(session.championName) === normalized
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
