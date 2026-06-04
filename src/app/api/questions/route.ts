import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { AnswerMode, QuestionKind, QuestionRound } from "@/types/game";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const round = searchParams.get("round") as QuestionRound | null;
  const theme = searchParams.get("theme");
  const qualifSlot = searchParams.get("qualifSlot");

  const questions = await prisma.question.findMany({
    where: {
      ...(round ? { round } : {}),
      ...(theme ? { theme } : {}),
      ...(qualifSlot ? { qualifSlot: Number(qualifSlot) } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(questions);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const kind = (body.kind as QuestionKind) ?? "TEXT";
  const text = String(body.text ?? "");
  const category = String(body.category ?? "");
  const round = body.round as QuestionRound;
  const answerMode = body.answerMode as AnswerMode;
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

  if (!round || !answerMode) {
    return NextResponse.json(
      { error: "Manche et mode de réponse requis." },
      { status: 400 },
    );
  }

  if (kind === "MUSICAL" && !audioUrl) {
    return NextResponse.json(
      { error: "Uploadez un fichier MP3 pour une question musicale." },
      { status: 400 },
    );
  }

  if (kind === "VIDEO" && !videoUrl) {
    return NextResponse.json(
      { error: "Uploadez une vidéo pour une question vidéo." },
      { status: 400 },
    );
  }

  if (kind === "IMAGE" && !imageUrl) {
    return NextResponse.json(
      { error: "Uploadez une image pour une question image." },
      { status: 400 },
    );
  }

  try {
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
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (err) {
    console.error("POST /api/questions", err);
    return NextResponse.json(
      { error: "Erreur base de données. Lancez npm run db:migrate si besoin." },
      { status: 500 },
    );
  }
}
