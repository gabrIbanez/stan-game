import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const MAX_BYTES = 20 * 1024 * 1024;
const AUDIO_DIR = path.join(process.cwd(), "public", "audio");

function safeFilename(name: string): string {
  const base = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, "_");
  return base.length > 0 ? base : "extrait.mp3";
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Formulaire invalide." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Fichier MP3 requis." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Fichier trop volumineux (max 20 Mo)." },
      { status: 400 },
    );
  }

  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  const isAudio =
    type.startsWith("audio/") || name.endsWith(".mp3") || name.endsWith(".mpeg");

  if (!isAudio) {
    return NextResponse.json(
      { error: "Format non supporté. Utilisez un fichier MP3." },
      { status: 400 },
    );
  }

  await mkdir(AUDIO_DIR, { recursive: true });

  const filename = `${Date.now()}-${safeFilename(file.name)}`;
  const filepath = path.join(AUDIO_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return NextResponse.json({
    url: `/audio/${filename}`,
    filename,
  });
}
