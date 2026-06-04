"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewSessionPage() {
  const router = useRouter();
  const [useQr, setUseQr] = useState(true);
  const [names, setNames] = useState<string[]>([""]);
  const [championName, setChampionName] = useState("Stanislas");
  const [competTheme, setCompetTheme] = useState("Stan & les potes");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateName(index: number, value: string) {
    const next = [...names];
    next[index] = value;
    setNames(next);
  }

  function addPlayer() {
    setNames([...names, ""]);
  }

  function removePlayer(index: number) {
    if (names.length <= 1) return;
    setNames(names.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const players = useQr ? [] : names.map((n) => n.trim()).filter(Boolean);
    if (!useQr && !players.length) {
      setError("Ajoutez au moins un participant.");
      return;
    }
    setLoading(true);
    setError(null);

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        players,
        championName: championName || undefined,
        competTheme: competTheme || undefined,
        useQrRegistration: useQr,
      }),
    });

    setLoading(false);
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Impossible de créer la partie.");
      return;
    }

    const session = data as { id: string };
    router.push(`/sessions/${session.id}`);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-amber-400">Nouvelle partie</h1>
      <p className="mb-6 text-violet-200">
        Lance une partie avec inscriptions par QR code : les potes scannent, entrent
        leur prénom et proposent des questions perso sur Stan.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-cyan-600/50 bg-cyan-950/30 p-4">
          <input
            type="checkbox"
            checked={useQr}
            onChange={(e) => setUseQr(e.target.checked)}
            className="mt-1"
          />
          <div>
            <span className="font-semibold text-cyan-200">
              Inscriptions par QR code (recommandé)
            </span>
            <p className="mt-1 text-sm text-violet-300">
              Affiche le QR sur l&apos;écran TV, les participants s&apos;inscrivent
              depuis leur téléphone puis créent leurs questions.
            </p>
          </div>
        </label>

        {!useQr && (
          <section className="space-y-3">
            <h2 className="font-semibold text-white">Participants</h2>
            {names.map((name, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={name}
                  onChange={(e) => updateName(i, e.target.value)}
                  placeholder={`Joueur ${i + 1}`}
                  className="flex-1 rounded-lg border border-violet-700 bg-violet-950 px-3 py-2"
                />
                <button
                  type="button"
                  onClick={() => removePlayer(i)}
                  className="rounded-lg px-3 text-red-400 hover:bg-violet-900"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addPlayer}
              className="text-sm text-amber-400 hover:underline"
            >
              + Ajouter un participant
            </button>
          </section>
        )}

        <section className="space-y-3 rounded-xl border border-violet-800 bg-violet-950/40 p-4">
          <h2 className="font-semibold text-white">Options</h2>
          <div>
            <label className="mb-1 block text-sm text-violet-300">
              Champion en titre (Stan)
            </label>
            <input
              value={championName}
              onChange={(e) => setChampionName(e.target.value)}
              placeholder="Stanislas"
              className="w-full rounded-lg border border-violet-700 bg-violet-950 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-violet-300">
              Thème de la Compet&apos;
            </label>
            <input
              value={competTheme}
              onChange={(e) => setCompetTheme(e.target.value)}
              placeholder="Stan & les potes"
              className="w-full rounded-lg border border-violet-700 bg-violet-950 px-3 py-2"
            />
          </div>
        </section>

        {error && <p className="text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-lg font-black text-black hover:from-amber-400 hover:to-orange-400 disabled:opacity-50"
        >
          {loading ? "Création…" : useQr ? "Créer la partie (QR)" : "Lancer la partie"}
        </button>
      </form>
    </div>
  );
}
