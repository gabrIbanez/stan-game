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
