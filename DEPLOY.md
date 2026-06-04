# Déployer gratuitement (entre potes)

URL du type **`stan-game-xyz123.vercel.app`** — pas de domaine à acheter.

Stack : **Vercel** (app) + **Neon** (Postgres gratuit) + **Vercel Blob** (MP3 / vidéos / images).

Temps estimé : **~10 minutes**, une seule fois.

---

## 1. Base Postgres (Neon)

1. Va sur [neon.tech](https://neon.tech) → compte gratuit.
2. **New project** → région proche de toi (ex. `eu-central-1`).
3. Onglet **Connection string** :
   - **Pooled** (host `…-pooler.…`) → `DATABASE_URL` sur Vercel
   - **Direct** (sans `pooler`) → garde-la pour les migrations en local (`DIRECT_URL` dans `.env`)

Ne mets **pas** l’URL pooled dans `prisma migrate` : Neon + pooler provoquent l’erreur `P1002` (timeout verrou).

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

## 4. Migrations & seed (une fois)

Les migrations **ne tournent pas** pendant le build Vercel (évite `P1002` sur le pooler Neon).
Lance-les **depuis ton Mac** après chaque changement de schéma :

```bash
# .env : DATABASE_URL = pooled (app), DIRECT_URL = direct (migrations Neon)
npm run db:migrate:deploy
```

Si tu n’as qu’une seule URL Neon, utilise la connexion **direct** (sans `-pooler`) pour cette commande.

Seed des questions de démo (optionnel) :

```bash
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
