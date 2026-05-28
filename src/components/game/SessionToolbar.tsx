"use client";

import Link from "next/link";
import {
  formatSessionPlayers,
  ROUND_SHORT,
  SESSION_STATUS_LABELS,
} from "@/lib/session-label";
import type { GamePlayer, GameRound, SessionStatus } from "@/types/game";

type SessionToolbarProps = {
  sessionId: string;
  players: Pick<GamePlayer, "name">[];
  status: SessionStatus;
  currentRound: GameRound;
};

export function SessionToolbar({
  sessionId,
  players,
  status,
  currentRound,
}: SessionToolbarProps) {
  const ecranUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/sessions/${sessionId}/ecran`
      : `/sessions/${sessionId}/ecran`;

  async function copyEcranLink() {
    try {
      await navigator.clipboard.writeText(ecranUrl);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-violet-900 bg-violet-950/90 px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/sessions"
          className="rounded-lg bg-violet-800 px-3 py-1.5 text-sm font-medium text-violet-100 hover:bg-violet-700"
        >
          ← Parties
        </Link>
        <span className="hidden text-sm text-violet-500 sm:inline">·</span>
        <span className="text-sm text-violet-300">
          {formatSessionPlayers(players, 6)}
        </span>
        <span className="rounded-full bg-violet-800 px-2 py-0.5 text-xs text-violet-200">
          {SESSION_STATUS_LABELS[status]} · {ROUND_SHORT[currentRound]}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyEcranLink}
          className="rounded-lg border border-violet-600 px-3 py-1.5 text-xs text-violet-300 hover:bg-violet-900"
        >
          Copier lien TV
        </button>
        <a
          href={`/sessions/${sessionId}/ecran`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-fuchsia-500 px-3 py-1.5 text-sm font-bold text-fuchsia-300 hover:bg-fuchsia-950"
        >
          Écran TV ↗
        </a>
      </div>
    </div>
  );
}
