"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getStoredJoinPlayer } from "@/lib/session-join";

type ParticipantScreenShellProps = {
  sessionId: string;
  children: React.ReactNode;
};

export function ParticipantScreenShell({
  sessionId,
  children,
}: ParticipantScreenShellProps) {
  const searchParams = useSearchParams();
  const [hasRegistration, setHasRegistration] = useState(false);
  const playerFromUrl = searchParams.get("player")?.trim();
  const joinHref = playerFromUrl
    ? `/sessions/${sessionId}/join?player=${encodeURIComponent(playerFromUrl)}`
    : `/sessions/${sessionId}/join`;

  useEffect(() => {
    setHasRegistration(Boolean(getStoredJoinPlayer(sessionId) || playerFromUrl));
  }, [sessionId, playerFromUrl]);

  return (
    <div className="flex min-h-screen flex-col bg-[#0f0720]">
      <div className="flex-1 pb-24">{children}</div>

      <footer className="fixed inset-x-0 bottom-0 z-50 border-t border-violet-800/80 bg-slate-950/95 px-4 py-3 backdrop-blur">
        <p className="mb-2 text-center text-xs text-violet-400">
          Mode participant — tu ne vois que l&apos;écran de la partie
        </p>
        <div className="mx-auto flex max-w-lg flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href={joinHref}
            className="rounded-xl border border-cyan-600 bg-cyan-950/50 px-4 py-2.5 text-center text-sm font-bold text-cyan-200 hover:bg-cyan-900/50"
          >
            {hasRegistration
              ? "Mon inscription & mes questions"
              : "S'inscrire à la partie"}
          </Link>
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = joinHref;
              }
            }}
            className="rounded-xl border border-violet-600 px-4 py-2.5 text-sm font-medium text-violet-300 hover:bg-violet-900"
          >
            Quitter l&apos;écran TV
          </button>
        </div>
      </footer>
    </div>
  );
}
