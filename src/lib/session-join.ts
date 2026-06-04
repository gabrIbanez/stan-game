import { getAppOrigin } from "@/lib/app-url";

export const JOIN_PLAYER_STORAGE_PREFIX = "stan-game-join-";

export type StoredJoinPlayer = {
  playerId: string;
  name: string;
};

export function joinStorageKey(sessionId: string) {
  return `${JOIN_PLAYER_STORAGE_PREFIX}${sessionId}`;
}

export function getStoredJoinPlayer(sessionId: string): StoredJoinPlayer | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(joinStorageKey(sessionId));
    if (!raw) return null;
    return JSON.parse(raw) as StoredJoinPlayer;
  } catch {
    return null;
  }
}

export function storeJoinPlayer(sessionId: string, player: StoredJoinPlayer) {
  localStorage.setItem(joinStorageKey(sessionId), JSON.stringify(player));
}

export function buildJoinUrl(sessionId: string, origin?: string) {
  const base =
    origin ??
    (typeof window !== "undefined" ? window.location.origin : getAppOrigin());
  return `${base.replace(/\/$/, "")}/sessions/${sessionId}/join`;
}
