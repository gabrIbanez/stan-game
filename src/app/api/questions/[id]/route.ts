import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { AnswerMode, QuestionKind, QuestionRound } from "@/types/game";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const question = await prisma.question.findUnique({ where: { id } });
  if (!question) {
    return NextResponse.json({ error: "Question introuvable." }, { status: 404 });
  }
  return NextResponse.json(question);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.question.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Question introuvable." }, { status: 404 });
  }

  const kind = (body.kind ?? existing.kind) as QuestionKind;
  const audioUrl =
    body.audioUrl !== undefined
      ? body.audioUrl
        ? String(body.audioUrl).trim()
        : null
      : existing.audioUrl;
  const videoUrl =
    body.videoUrl !== undefined
      ? body.videoUrl
        ? String(body.videoUrl).trim()
        : null
      : existing.videoUrl;
  const imageUrl =
    body.imageUrl !== undefined
      ? body.imageUrl
        ? String(body.imageUrl).trim()
        : null
      : existing.imageUrl;

  if (kind === "MUSICAL" && !audioUrl) {
    return NextResponse.json(
      { error: "Un fichier MP3 est requis pour une question musicale." },
      { status: 400 },
    );
  }

  if (kind === "VIDEO" && !videoUrl) {
    return NextResponse.json(
      { error: "Une vidéo est requise pour une question vidéo." },
      { status: 400 },
    );
  }

  if (kind === "IMAGE" && !imageUrl) {
    return NextResponse.json(
      { error: "Une image est requise pour une question image." },
      { status: 400 },
    );
  }

  const question = await prisma.question.update({
    where: { id },
    data: {
      ...(body.text !== undefined && { text: body.text.trim() }),
      ...(body.category !== undefined && { category: body.category.trim() }),
      ...(body.round !== undefined && { round: body.round as QuestionRound }),
      ...(body.answerMode !== undefined && {
        answerMode: body.answerMode as AnswerMode,
      }),
      ...(body.correctAnswer !== undefined && {
        correctAnswer: body.correctAnswer.trim(),
      }),
      ...(body.options !== undefined && {
        options: body.options.map((o: string) => o.trim()).filter(Boolean),
      }),
      ...(body.theme !== undefined && { theme: body.theme?.trim() || null }),
      ...(body.qualifSlot !== undefined && { qualifSlot: body.qualifSlot }),
      ...(body.notes !== undefined && { notes: body.notes?.trim() || null }),
      ...(body.kind !== undefined && { kind }),
      audioUrl: kind === "MUSICAL" ? audioUrl : null,
      videoUrl: kind === "VIDEO" ? videoUrl : null,
      imageUrl: kind === "IMAGE" ? imageUrl : null,
    },
  });

  return NextResponse.json(question);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  await prisma.question.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
