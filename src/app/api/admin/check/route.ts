import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth-server";

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
