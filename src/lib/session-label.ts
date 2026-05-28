import type { GamePlayer, GameRound, SessionStatus } from "@/types/game";

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  SETUP: "Préparation",
  IN_PROGRESS: "En cours",
  FINISHED: "Terminée",
};

export const ROUND_SHORT: Record<GameRound, string> = {
  QUALIFS: "Qualifs",
  COMPET: "Compet'",
  FINALE: "Finale",
};

export function formatSessionPlayers(players: Pick<GamePlayer, "name">[], max = 4) {
  if (!players.length) return "Aucun joueur";
  const names = players.map((p) => p.name);
  if (names.length <= max) return names.join(", ");
  return `${names.slice(0, max).join(", ")} +${names.length - max}`;
}

export function formatSessionDate(iso: string | Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}
