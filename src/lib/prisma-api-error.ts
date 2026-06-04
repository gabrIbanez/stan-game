import { NextResponse } from "next/server";

const MIGRATE_HINT =
  "La base de données n’est pas à jour. Depuis ton Mac : npm run db:migrate:deploy (URL Neon directe, sans -pooler).";

export function prismaRouteErrorResponse(
  route: string,
  err: unknown,
): NextResponse<{ error: string }> {
  console.error(route, err);
  const message = err instanceof Error ? err.message : String(err);
  const needsMigrate =
    /column.*does not exist|relation.*does not exist|P2021|P2022/i.test(message);
  return NextResponse.json(
    { error: needsMigrate ? MIGRATE_HINT : "Erreur serveur. Réessayez dans un instant." },
    { status: 500 },
  );
}
