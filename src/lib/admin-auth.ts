export const ADMIN_STORAGE_KEY = "stan-game-admin-unlocked";

export function isAdminUnlockedLocally(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ADMIN_STORAGE_KEY) === "1";
}

export function setAdminUnlockedLocally() {
  sessionStorage.setItem(ADMIN_STORAGE_KEY, "1");
}

export async function unlockAdmin(password: string): Promise<boolean> {
  const res = await fetch("/api/admin/unlock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ password }),
  });
  if (!res.ok) return false;
  setAdminUnlockedLocally();
  return true;
}

export const adminFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, credentials: "include" });
