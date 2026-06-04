# Déployer gratuitement (entre potes)

URL du type **`stan-game-xyz123.vercel.app`** — pas de domaine à acheter.

Stack : **Vercel** (app) + **Neon** (Postgres gratuit) + **Vercel Blob** (MP3 / vidéos / images).

Temps estimé : **~10 minutes**, une seule fois.

---

## 1. Base Postgres (Neon)

1. Va sur [neon.tech](https://neon.tech) → compte gratuit.
2. **New project** → région proche de toi (ex. `eu-central-1`).
3. Onglet **Connection string** → copie l’URL **pooled** (avec `?sslmode=require`).

Tu la colleras plus tard dans Vercel comme `DATABASE_URL`.

---

## 2. App sur Vercel

1. Pousse le repo sur **GitHub** (si ce n’est pas déjà fait).
2. Va sur [vercel.com](https://vercel.com) → **Add New… → Project** → importe `stan-game`.
3. **Environment variables** (Production) :
   - `DATABASE_URL` = l’URL Neon copiée à l’étape 1.
4. **Deploy** (le premier build peut échouer tant que Blob n’est pas créé — normal, continue à l’étape 3).

---

## 3. Stockage des fichiers (Blob)

1. Dans le projet Vercel : **Storage** → **Create Database / Store** → **Blob**.
2. Lie le store au projet : Vercel ajoute automatiquement `BLOB_READ_WRITE_TOKEN`.
3. **Redeploy** (Deployments → … → Redeploy).

Les uploads en prod passent par le navigateur → Blob (pas de limite 4,5 Mo côté serveur).

---

## 4. Migrations & seed (optionnel)

Au premier déploiement, `vercel-build` lance déjà `prisma migrate deploy`.

Pour des questions de démo, en local avec la **même** `DATABASE_URL` Neon :

```bash
# dans .env
DATABASE_URL="postgresql://..."
npm run db:seed
```

---

## 5. Utiliser le jeu

- **Pupitre** : `https://ton-projet.vercel.app`
- **Écran TV** : lien « Ouvrir l’écran TV » dans une session (même URL + `/sessions/.../ecran`)

Partage l’URL aux potes. Pas de login : ne publie pas l’URL sur les réseaux si tu veux rester discret.

---

## Développement local

Inchangé : Docker Postgres + `npm run dev`. Les uploads restent dans `public/audio`, etc.

Pour tester les uploads Blob en local, il faut un tunnel (ngrok) — inutile pour préparer une soirée ; teste les médias directement sur Vercel.

---

## Limites gratuites (largement OK pour une soirée)

| Service | Hobby / Free |
|---------|----------------|
| Vercel | App + bande passante raisonnable |
| Neon | ~0,5 Go, projet qui “dort” si inactif (réveil en quelques secondes) |
| Blob | ~1 Go stockage |

---

## Plan B (Docker)

Si tu préfères un VPS : `docker-compose.prod.yml` à la racine (voir README).
