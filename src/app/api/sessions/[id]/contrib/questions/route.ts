import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { AnswerMode, QuestionKind, QuestionRound } from "@/types/game";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id: sessionId } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const playerId = String(body.playerId ?? "").trim();
  if (!playerId) {
    return NextResponse.json({ error: "Joueur non identifié." }, { status: 400 });
  }

  const player = await prisma.gamePlayer.findFirst({
    where: { id: playerId, sessionId },
  });
  if (!player) {
    return NextResponse.json({ error: "Participant invalide." }, { status: 403 });
  }

  const kind = (body.kind as QuestionKind) ?? "TEXT";
  const text = String(body.text ?? "");
  const category = String(body.category ?? "");
  const round = (body.round as QuestionRound) ?? "COMPET";
  const answerMode = (body.answerMode as AnswerMode) ?? "CARRE";
  const correctAnswer = String(body.correctAnswer ?? "");
  const options = Array.isArray(body.options) ? body.options : [];
  const theme = body.theme ? String(body.theme) : undefined;
  const qualifSlot =
    body.qualifSlot !== undefined && body.qualifSlot !== ""
      ? Number(body.qualifSlot)
      : undefined;
  const notes = body.notes ? String(body.notes) : undefined;
  const audioUrl = body.audioUrl ? String(body.audioUrl).trim() : null;
  const videoUrl = body.videoUrl ? String(body.videoUrl).trim() : null;
  const imageUrl = body.imageUrl ? String(body.imageUrl).trim() : null;

  if (!text.trim() || !category.trim() || !correctAnswer.trim()) {
    return NextResponse.json(
      { error: "Texte, catégorie et bonne réponse requis." },
      { status: 400 },
    );
  }

  if (kind === "MUSICAL" && !audioUrl) {
    return NextResponse.json({ error: "Ajoute un fichier MP3." }, { status: 400 });
  }
  if (kind === "VIDEO" && !videoUrl) {
    return NextResponse.json({ error: "Ajoute une vidéo." }, { status: 400 });
  }
  if (kind === "IMAGE" && !imageUrl) {
    return NextResponse.json({ error: "Ajoute une image." }, { status: 400 });
  }

  const question = await prisma.question.create({
    data: {
      kind,
      text: text.trim(),
      category: category.trim(),
      round,
      answerMode,
      correctAnswer: correctAnswer.trim(),
      options: options.map((o) => String(o).trim()).filter(Boolean),
      theme: theme?.trim() || null,
      qualifSlot: qualifSlot ?? null,
      notes: notes?.trim() || null,
      audioUrl: kind === "MUSICAL" ? audioUrl : null,
      videoUrl: kind === "VIDEO" ? videoUrl : null,
      imageUrl: kind === "IMAGE" ? imageUrl : null,
      sessionId,
      contributorPlayerId: playerId,
    },
  });

  return NextResponse.json(question, { status: 201 });
}
