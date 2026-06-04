"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Nav } from "@/components/Nav";
import {
  ADMIN_UNLOCK_EVENT,
  adminFetch,
  isAdminUnlockedLocally,
  setAdminUnlockedLocally,
  unlockAdmin,
} from "@/lib/admin-auth";
import { isParticipantPath } from "@/lib/routes";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const participantMode = isParticipantPath(pathname);
  const [navUnlocked, setNavUnlocked] = useState(false);
  const [checking, setChecking] = useState(!participantMode);

  const refreshNavAccess = useCallback(async () => {
    if (participantMode) return;
    if (!isAdminUnlockedLocally()) {
      setNavUnlocked(false);
      setChecking(false);
      return;
    }
    const res = await adminFetch("/api/admin/check");
    setNavUnlocked(res.ok);
    setChecking(false);
  }, [participantMode]);

  useEffect(() => {
    refreshNavAccess();
    const onUnlock = () => refreshNavAccess();
    window.addEventListener(ADMIN_UNLOCK_EVENT, onUnlock);
    return () => window.removeEventListener(ADMIN_UNLOCK_EVENT, onUnlock);
  }, [refreshNavAccess]);

  if (participantMode) {
    return <>{children}</>;
  }

  async function handleNavUnlock(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("nav-password") as HTMLInputElement;
    const ok = await unlockAdmin(input.value);
    if (ok) {
      setAdminUnlockedLocally();
      setNavUnlocked(true);
      input.value = "";
    }
  }

  return (
    <>
      {navUnlocked ? (
        <Nav />
      ) : (
        !checking && (
          <div className="border-b border-violet-900/60 bg-violet-950/90 px-4 py-2">
            <form
              onSubmit={handleNavUnlock}
              className="mx-auto flex max-w-xl flex-wrap items-center justify-center gap-2"
            >
              <span className="text-xs text-violet-400">Menu animateur</span>
              <input
                name="nav-password"
                type="password"
                placeholder="Mot de passe"
                className="w-36 rounded-lg border border-violet-700 bg-violet-950 px-2 py-1 text-sm"
              />
              <button
                type="submit"
                className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-bold text-black"
              >
                Déverrouiller
              </button>
            </form>
          </div>
        )
      )}
      <main>{children}</main>
    </>
  );
}
