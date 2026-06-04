/** Pages participant (pas de nav animateur). */
export function isParticipantPath(pathname: string): boolean {
  return /\/sessions\/[^/]+\/(ecran|join)\/?$/.test(pathname);
}
