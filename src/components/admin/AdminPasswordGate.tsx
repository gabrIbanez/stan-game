"use client";

import { useEffect, useState } from "react";
import {
  adminFetch,
  isAdminUnlockedLocally,
  setAdminUnlockedLocally,
  unlockAdmin,
} from "@/lib/admin-auth";

type AdminPasswordGateProps = {
  children: React.ReactNode;
  title?: string;
};

export function AdminPasswordGate({
  children,
  title = "Accès animateur",
}: AdminPasswordGateProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function verify() {
      if (!isAdminUnlockedLocally()) {
        setChecking(false);
        return;
      }
      const res = await adminFetch("/api/admin/check");
      if (res.status === 401) {
        setChecking(false);
        return;
      }
      setAdminUnlockedLocally();
      setUnlocked(true);
      setChecking(false);
    }
    verify();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const ok = await unlockAdmin(password);
    if (!ok) {
      setError("Mot de passe incorrect.");
      return;
    }
    setUnlocked(true);
  }

  if (checking) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-violet-300">
        Vérification…
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col justify-center px-4 py-12">
        <h1 className="mb-2 text-center text-2xl font-bold text-amber-400">{title}</h1>
        <p className="mb-6 text-center text-sm text-violet-300">
          Réservé au présentateur — les invités ne doivent pas voir les réponses des
          autres.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="w-full rounded-xl border border-violet-600 bg-violet-950 px-4 py-3"
          />
          {error && <p className="text-center text-red-400">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-amber-500 py-3 font-black text-black hover:bg-amber-400"
          >
            Entrer
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
