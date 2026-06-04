"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { GuestQuestionForm } from "@/components/questions/GuestQuestionForm";
import {
  getStoredJoinPlayer,
  storeJoinPlayer,
  type StoredJoinPlayer,
} from "@/lib/session-join";

type JoinMeta = {
  sessionId: string;
  registrationsOpen: boolean;
  championName: string | null;
  playerCount: number;
  status: string;
};

export default function JoinSessionPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const [meta, setMeta] = useState<JoinMeta | null>(null);
  const [player, setPlayer] = useState<StoredJoinPlayer | null>(null);
  const [step, setStep] = useState<"name" | "questions">("name");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(0);

  const refreshMeta = useCallback(async () => {
    const res = await fetch(`/api/sessions/${sessionId}/join`);
    if (!res.ok) {
      setMeta(null);
      return;
    }
    setMeta(await res.json());
  }, [sessionId]);

  useEffect(() => {
    refreshMeta();
    const stored = getStoredJoinPlayer(sessionId);
    if (stored) {
      setPlayer(stored);
      setStep("questions");
    }
  }, [sessionId, refreshMeta]);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/sessions/${sessionId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Inscription impossible.");
      return;
    }
    const stored = { playerId: data.playerId as string, name: data.name as string };
    storeJoinPlayer(sessionId, stored);
    setPlayer(stored);
    setStep("questions");
    refreshMeta();
  }

  if (meta === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-950 to-purple-950 p-6 text-center">
        <p className="text-violet-300">Partie introuvable.</p>
      </div>
    );
  }

  const stan = meta.championName?.trim() || "Stan";

  if (step === "name") {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-gradient-to-b from-indigo-950 to-purple-950 px-6 py-10">
        <h1 className="text-center text-3xl font-black text-amber-400">
          Rejoindre la partie
        </h1>
        <p className="mt-2 text-center text-violet-200">
          {meta.registrationsOpen
            ? "Entre ton prénom pour t'inscrire."
            : "Les inscriptions sont closes."}
        </p>

        {meta.registrationsOpen ? (
          <form onSubmit={handleJoin} className="mt-8 space-y-4">
            <input
              required
              autoFocus
              minLength={2}
              maxLength={40}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ton prénom (unique sur la partie)"
              className="w-full rounded-xl border border-violet-600 bg-violet-950 px-4 py-3 text-lg"
            />
            <p className="text-center text-xs text-violet-500">
              Un seul compte par prénom — pas de doublon avec les autres.
            </p>
            {error && <p className="text-center text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-amber-500 py-3 text-lg font-black text-black disabled:opacity-50"
            >
              {loading ? "Inscription…" : "Je m'inscris"}
            </button>
          </form>
        ) : (
          <p className="mt-6 text-center text-violet-400">
            Retourne voir l&apos;écran : la partie va commencer.
          </p>
        )}

        <p className="mt-8 text-center text-xs text-violet-500">
          {meta.playerCount} déjà inscrit{meta.playerCount !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-gradient-to-b from-indigo-950 to-purple-950 px-4 py-8">
      <header className="mb-6 text-center">
        <p className="text-sm text-violet-400">Inscrit en tant que</p>
        <h1 className="text-2xl font-black text-amber-400">{player?.name}</h1>
        <p className="mt-3 text-violet-200">
          Propose des questions perso sur <strong className="text-white">{stan}</strong>{" "}
          et vos souvenirs : anecdotes, moments forts, private jokes…
        </p>
        {questionCount > 0 && (
          <p className="mt-2 text-sm text-lime-400">
            {questionCount} question{questionCount > 1 ? "s" : ""} envoyée
            {questionCount > 1 ? "s" : ""} — merci !
          </p>
        )}
      </header>

      {player && (
        <GuestQuestionForm
          sessionId={sessionId}
          playerId={player.playerId}
          playerName={player.name}
          championName={meta.championName}
          onSaved={() => setQuestionCount((c) => c + 1)}
        />
      )}

      <p className="mt-8 text-center text-sm text-violet-400">
        Tu peux envoyer autant de questions que tu veux. Reviens sur cette page si tu
        fermes l&apos;onglet — ton inscription est mémorisée sur ce téléphone.
      </p>
    </div>
  );
}
