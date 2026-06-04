/** Normalise un prénom pour comparer l'unicité (casse, espaces). */
export function normalizePlayerName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase("fr-FR");
}

export function isDuplicatePlayerName(
  name: string,
  existingNames: string[],
): boolean {
  const normalized = normalizePlayerName(name);
  return existingNames.some((n) => normalizePlayerName(n) === normalized);
}
