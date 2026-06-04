import { upload } from "@vercel/blob/client";

import { USE_BLOB_UPLOAD } from "@/lib/constants";

async function uploadViaApi(path: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(path, { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Échec de l'upload.");
  return data.url as string;
}

function safeName(name: string, fallback: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return base.length > 0 ? base : fallback;
}

export async function uploadMp3(file: File): Promise<string> {
  if (!USE_BLOB_UPLOAD) {
    return uploadViaApi("/api/audio/upload", file);
  }
  const pathname = `audio/${Date.now()}-${safeName(file.name, "extrait.mp3")}`;
  const result = await upload(pathname, file, {
    access: "public",
    handleUploadUrl: "/api/blob/upload",
    clientPayload: "audio",
  });
  return result.url;
}

export async function uploadVideo(file: File): Promise<string> {
  if (!USE_BLOB_UPLOAD) {
    return uploadViaApi("/api/video/upload", file);
  }
  const pathname = `video/${Date.now()}-${safeName(file.name, "video.mp4")}`;
  const result = await upload(pathname, file, {
    access: "public",
    handleUploadUrl: "/api/blob/upload",
    clientPayload: "video",
  });
  return result.url;
}

export async function uploadImage(file: File): Promise<string> {
  if (!USE_BLOB_UPLOAD) {
    return uploadViaApi("/api/image/upload", file);
  }
  const pathname = `images/${Date.now()}-${safeName(file.name, "image.jpg")}`;
  const result = await upload(pathname, file, {
    access: "public",
    handleUploadUrl: "/api/blob/upload",
    clientPayload: "image",
  });
  return result.url;
}
