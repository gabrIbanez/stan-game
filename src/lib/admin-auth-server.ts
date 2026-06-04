import { cookies } from "next/headers";

export const ADMIN_PASSWORD = "Oklm";
export const ADMIN_COOKIE_NAME = "stan_admin";

export async function isAdminSession(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE_NAME)?.value === "1";
}
