import Link from "next/link";

export default function EcranLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="fixed left-3 top-3 z-50 opacity-0 transition hover:opacity-100">
        <Link
          href="/sessions"
          className="rounded-lg bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur"
        >
          ← Parties
        </Link>
      </div>
      {children}
    </>
  );
}
