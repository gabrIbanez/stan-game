import Link from "next/link";
import { APP_TITLE } from "@/lib/constants";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/sessions", label: "Parties" },
  { href: "/questions", label: "Questions" },
  { href: "/sessions/new", label: "Nouvelle partie" },
];

export function Nav() {
  return (
    <header className="border-b border-violet-900/40 bg-violet-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-amber-400">
          {APP_TITLE}
        </Link>
        <nav className="flex flex-wrap gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-1.5 text-sm font-medium text-violet-100 transition hover:bg-violet-800"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
