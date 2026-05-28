import type { AnswerMode, GameRound } from "@/types/game";

export const ROUND_LABELS: Record<GameRound, string> = {
  QUALIFS: "Manche 1 — Les Qualifs",
  COMPET: "Manche 2 — La Compet'",
  FINALE: "Manche 3 — La Finale",
};

export const ANSWER_MODE_LABELS: Record<AnswerMode, string> = {
  CASH: "Cash (5 pts)",
  CARRE: "Carré (3 pts)",
  DUO: "Duo (1 pt)",
};

export const QUALIF_POINTS: Record<AnswerMode, number> = {
  CASH: 5,
  CARRE: 3,
  DUO: 1,
};

export function pointsForAnswer(
  round: GameRound,
  mode: AnswerMode,
  correct: boolean,
  competIndividual = false,
): number {
  if (!correct) {
    return competIndividual ? -5 : 0;
  }
  if (round === "COMPET" && competIndividual) return 5;
  return QUALIF_POINTS[mode];
}

export function maxQualifPlayers(): number {
  return 6;
}

export function qualifiedCount(): number {
  return 4;
}

/** Propositions affichées selon le mode choisi par le participant. */
export function optionsForMode(
  options: string[],
  mode: AnswerMode,
): string[] {
  if (mode === "CASH") return [];
  if (mode === "DUO") return options.slice(0, 2);
  return options.slice(0, 4);
}
