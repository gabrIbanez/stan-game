import type { Question } from "@/types/game";

export function isMusicalQuestion(question: Pick<Question, "kind" | "audioUrl">) {
  return question.kind === "MUSICAL" && Boolean(question.audioUrl);
}

export function getMusicalAudioUrl(question: Pick<Question, "audioUrl">) {
  return question.audioUrl?.trim() || null;
}

export function isVideoQuestion(question: Pick<Question, "kind" | "videoUrl">) {
  return question.kind === "VIDEO" && Boolean(question.videoUrl);
}

export function getVideoUrl(question: Pick<Question, "videoUrl">) {
  return question.videoUrl?.trim() || null;
}

export function isImageQuestion(question: Pick<Question, "kind" | "imageUrl">) {
  return question.kind === "IMAGE" && Boolean(question.imageUrl);
}

export function getImageUrl(question: Pick<Question, "imageUrl">) {
  return question.imageUrl?.trim() || null;
}
