import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

type MediaKind = "audio" | "video" | "image";

const RULES: Record<
  MediaKind,
  { prefix: string; maxBytes: number; contentTypes: string[] }
> = {
  audio: {
    prefix: "audio/",
    maxBytes: 20 * 1024 * 1024,
    contentTypes: ["audio/mpeg", "audio/mp3", "audio/mpeg3"],
  },
  video: {
    prefix: "video/",
    maxBytes: 80 * 1024 * 1024,
    contentTypes: ["video/mp4", "video/webm", "video/quicktime"],
  },
  image: {
    prefix: "images/",
    maxBytes: 15 * 1024 * 1024,
    contentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
};

function parseKind(clientPayload: string | null | undefined): MediaKind | null {
  if (clientPayload === "audio" || clientPayload === "video" || clientPayload === "image") {
    return clientPayload;
  }
  return null;
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const kind = parseKind(clientPayload);
        if (!kind) {
          throw new Error("Type de média invalide.");
        }
        const rules = RULES[kind];
        if (!pathname.startsWith(rules.prefix)) {
          throw new Error("Chemin de fichier invalide.");
        }

        return {
          allowedContentTypes: rules.contentTypes,
          maximumSizeInBytes: rules.maxBytes,
          addRandomSuffix: false,
        };
      },
      onUploadCompleted: async () => {
        // Rien à faire : l’URL blob est renvoyée au client par upload().
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload refusé." },
      { status: 400 },
    );
  }
}
