"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { GamePlayer, GameSession } from "@/types/game";
import {
  formatSessionDate,
  formatSessionPlayers,
  ROUND_SHORT,
  SESSION_STATUS_LABELS,
} from "@/lib/session-label";

type SessionRow = GameSession & {
  players: GamePlayer[];
};

export default function SessionsIndexPage() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/sessions");
    if (res.ok) setSessions(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const inProgress = sessions.filter((s) => s.status === "IN_PROGRESS");
  const others = sessions.filter((s) => s.status !== "IN_PROGRESS");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-400">Parties</h1>
          <p className="mt-1 text-violet-300">
            Reprenez une partie en cours ou rouvrez l&apos;écran TV.
          </p>
        </div>
        <Link
          href="/sessions/new"
          className="rounded-lg bg-fuchsia-600 px-4 py-2 font-bold text-white hover:bg-fuchsia-500"
        >
          + Nouvelle partie
        </Link>
      </div>

      {loading && <p className="text-violet-400">Chargement…</p>}

      {!loading && sessions.length === 0 && (
        <p className="rounded-xl border border-violet-800 bg-violet-950/50 p-8 text-center text-violet-300">
          Aucune partie enregistrée.{" "}
          <Link href="/sessions/new" className="text-amber-400 underline">
            Créer une partie
          </Link>
        </p>
      )}

      {inProgress.length > 0 && (
        <SessionList title="En cours" sessions={inProgress} highlight />
      )}
      {others.length > 0 && (
        <SessionList
          title={inProgress.length ? "Historique" : "Toutes les parties"}
          sessions={others}
        />
      )}
    </div>
  );
}

function SessionList({
  title,
  sessions,
  highlight = false,
}: {
  title: string;
  sessions: SessionRow[];
  highlight?: boolean;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-semibold text-white">{title}</h2>
      <ul className="space-y-3">
        {sessions.map((session) => (
          <li
            key={session.id}
            className={`rounded-xl border p-4 ${
              highlight
                ? "border-amber-500/50 bg-amber-950/20"
                : "border-violet-800 bg-violet-950/40"
            }`}
          >
            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-bold text-white">
                  {formatSessionPlayers(session.players)}
                </p>
                <p className="text-sm text-violet-400">
                  {formatSessionDate(session.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 text-xs">
                <span
                  className={`rounded-full px-2 py-0.5 ${
                    session.status === "IN_PROGRESS"
                      ? "bg-lime-900 text-lime-200"
                      : "bg-violet-800 text-violet-300"
                  }`}
                >
                  {SESSION_STATUS_LABELS[session.status]}
                </span>
                <span className="rounded-full bg-violet-800 px-2 py-0.5 text-violet-200">
                  {ROUND_SHORT[session.currentRound]}
                </span>
              </div>
            </div>

            {session.competTheme && (
              <p className="mb-2 text-xs text-violet-500">
                Thème Compet&apos; : {session.competTheme}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/sessions/${session.id}`}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-black hover:bg-amber-400"
              >
                Pupitre présentateur
              </Link>
              <a
                href={`/sessions/${session.id}/ecran`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-fuchsia-500 px-4 py-2 text-sm font-bold text-fuchsia-300 hover:bg-fuchsia-950"
              >
                Écran TV ↗
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
