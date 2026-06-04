"use client";

import QRCode from "react-qr-code";
import { buildJoinUrl } from "@/lib/session-join";

type JoinQrDisplayProps = {
  sessionId: string;
  playerCount: number;
  registrationsOpen: boolean;
  size?: "tv" | "compact";
};

export function JoinQrDisplay({
  sessionId,
  playerCount,
  registrationsOpen,
  size = "tv",
}: JoinQrDisplayProps) {
  const joinUrl = buildJoinUrl(sessionId);
  const isTv = size === "tv";

  return (
    <div
      className={`flex flex-col items-center text-center ${
        isTv ? "gap-8 px-8" : "gap-4"
      }`}
    >
      <div>
        <p
          className={`font-bold text-amber-400 ${isTv ? "text-5xl" : "text-xl"}`}
        >
          Rejoindre la partie
        </p>
        <p className={`mt-2 text-violet-200 ${isTv ? "text-2xl" : "text-sm"}`}>
          Scanne le QR code avec ton téléphone
        </p>
      </div>

      <div
        className={`rounded-3xl bg-white p-4 shadow-2xl ${
          isTv ? "p-6" : "p-3"
        }`}
      >
        <QRCode
          value={joinUrl}
          size={isTv ? 280 : 160}
          level="M"
          viewBox="0 0 256 256"
        />
      </div>

      <p
        className={`max-w-xl break-all text-violet-400 ${isTv ? "text-lg" : "text-xs"}`}
      >
        {joinUrl}
      </p>

      <div
        className={`rounded-2xl border border-violet-600/50 bg-violet-950/60 px-6 py-4 ${
          isTv ? "text-xl" : "text-sm"
        }`}
      >
        <p className="font-semibold text-white">
          {playerCount} participant{playerCount !== 1 ? "s" : ""} inscrit
          {playerCount !== 1 ? "s" : ""}
        </p>
        <p className="mt-1 text-violet-300">
          {registrationsOpen
            ? "Inscriptions ouvertes — entre ton prénom puis propose tes questions perso sur Stan !"
            : "Inscriptions closes — le présentateur va bientôt lancer la partie."}
        </p>
      </div>
    </div>
  );
}
