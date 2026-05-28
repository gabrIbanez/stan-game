# Qui veut prendre la place de Stan ?

Application locale de quiz façon « Tout le monde veut prendre sa place », pour animer une partie en tant que présentateur.

## Stack

- Next.js 16 (App Router) + React + TypeScript
- Tailwind CSS 4
- PostgreSQL + Prisma

## Démarrage rapide

### 1. Base de données

```bash
npm run db:up
npm run db:migrate
npm run db:seed
```

### 2. Lancer l'app

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Utilisation

1. **Banque de questions** — Créez vos questions par manche (Qualifs, Compet', Finale) en mode Cash, Duo ou Carré. Les **questions musicales** : uploadez un MP3 (extrait déjà monté au bon moment).
2. **Nouvelle partie** — Saisissez tous les participants (autant que vous voulez), optionnellement le champion en titre et le thème de la Compet'.
3. **Plateau présentateur** — Chargez une question, choisissez le mode d'affichage (Cash / Duo / Carré), révélez la réponse, marquez les points par joueur.
4. **Écran TV** — Ouvrez le lien « Ouvrir l'écran TV ». Pour le blind test : touchez l'écran une fois (activation audio), puis **Lancer l'extrait** depuis le pupitre.

## Règles implémentées

| Manche | Points |
|--------|--------|
| Qualifs — Cash | +5 si correct |
| Qualifs — Carré | +3 si correct |
| Qualifs — Duo | +1 si correct |
| Compet' — individuel | +5 / −5 |
| Finale | Points masqués jusqu'au décompte final |

## Variables d'environnement

Copiez `.env.example` vers `.env` :

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/stan_game?schema=public"
```
