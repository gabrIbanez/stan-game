import type { Question } from "@/types/game";

export function isMusicalQuestion(question: Pick<Question, "kind" | "audioUrl">) {
  return question.kind === "MUSICAL" && Boolean(question.audioUrl);
}

export function getMusicalAudioUrl(question: Pick<Question, "audioUrl">) {
  return question.audioUrl?.trim() || null;
}
