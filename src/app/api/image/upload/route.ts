import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const MAX_BYTES = 15 * 1024 * 1024;
const IMAGE_DIR = path.join(process.cwd(), "public", "images");

function safeFilename(name: string): string {
  const base = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, "_");
  return base.length > 0 ? base : "image.jpg";
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
    return NextResponse.json({ error: "Fichier image requis." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Fichier trop volumineux (max 15 Mo)." },
      { status: 400 },
    );
  }

  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  const isImage =
    type.startsWith("image/") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".webp") ||
    name.endsWith(".gif");

  if (!isImage) {
    return NextResponse.json(
      { error: "Format non supporté. Utilisez JPEG, PNG ou WebP." },
      { status: 400 },
    );
  }

  await mkdir(IMAGE_DIR, { recursive: true });

  const filename = `${Date.now()}-${safeFilename(file.name)}`;
  const filepath = path.join(IMAGE_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return NextResponse.json({
    url: `/images/${filename}`,
    filename,
  });
}
