import Link from "next/link";
import { APP_TITLE } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-2 text-4xl font-black text-amber-400">{APP_TITLE}</h1>
      <p className="mb-8 text-lg text-violet-200">
        Application locale pour animer votre quiz façon « Tout le monde veut prendre sa
        place ». Vous êtes le présentateur : préparez vos questions, inscrivez les
        participants, puis affichez le plateau sur grand écran.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/sessions"
          className="rounded-2xl border-2 border-lime-400/60 bg-gradient-to-br from-lime-950 to-violet-950 p-6 transition hover:border-lime-400"
        >
          <h2 className="mb-2 text-xl font-bold text-lime-300">Reprendre une partie</h2>
          <p className="text-violet-200">
            Liste des parties en cours : pupitre présentateur et écran TV.
          </p>
        </Link>
        <Link
          href="/questions"
          className="rounded-2xl border-2 border-amber-400/60 bg-gradient-to-br from-violet-900 to-purple-950 p-6 transition hover:border-amber-400"
        >
          <h2 className="mb-2 text-xl font-bold text-amber-300">Banque de questions</h2>
          <p className="text-violet-200">
            Ajoutez vos questions en mode Cash, Duo ou Carré, par manche (Qualifs,
            Compet&apos;, Finale).
          </p>
        </Link>
        <Link
          href="/sessions/new"
          className="rounded-2xl border-2 border-fuchsia-400/60 bg-gradient-to-br from-fuchsia-950 to-violet-950 p-6 transition hover:border-fuchsia-400"
        >
          <h2 className="mb-2 text-xl font-bold text-fuchsia-300">Nouvelle partie</h2>
          <p className="text-violet-200">
            Saisissez les prénoms ou alias de tous les participants, puis lancez le jeu.
          </p>
        </Link>
      </div>

      <section className="mt-12 rounded-2xl bg-violet-950/60 p-6">
        <h2 className="mb-4 text-xl font-bold text-white">Règles intégrées</h2>
        <ul className="space-y-3 text-violet-200">
          <li>
            <strong className="text-amber-300">Manche 1 — Qualifs</strong> : 6 joueurs max,
            2 questions communes. Cash = 5 pts, Carré = 3 pts, Duo = 1 pt. Les 4 meilleurs
            passent.
          </li>
          <li>
            <strong className="text-amber-300">Manche 2 — Compet&apos;</strong> : vagues Duo /
            Carré / Cash puis questions individuelles (+5 / −5 pts).
          </li>
          <li>
            <strong className="text-amber-300">Manche 3 — Finale</strong> : le challenger
            répond en mode choisi ; points masqués jusqu&apos;au décompte final.
          </li>
        </ul>
      </section>
    </div>
  );
}
