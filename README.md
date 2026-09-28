# Quartiers de Toulouse — sélection collaborative

Application web (Next.js + Supabase) où chaque utilisateur, après avoir débloqué
l'application avec un mot de passe partagé et choisi un identifiant unique,
sélectionne un ou plusieurs quartiers de démocratie locale de Toulouse.
Les sélections de tous les utilisateurs sont visibles par tous, en temps quasi réel.

## Fonctionnalités

- 🔒 Verrouillage par **mot de passe unique** (variable d'environnement `APP_PASSWORD`)
- 🪪 **Identifiant unique premier arrivé premier servi** (insensible à la casse),
  avec message clair si déjà pris
- 🗺️ **Carte interactive** (Leaflet/OpenStreetMap) et **liste**, au choix — même
  comportement sur mobile et ordinateur
- 🖱️ Clic sur un quartier (carte ou liste) → fiche avec la **liste des personnes**
  ayant sélectionné ce quartier + bouton **Sélectionner / Retirer**
- 🎨 Couleurs : gris = 0, **rouge clair** = 1 personne, **rouge foncé** = 2+ personnes.
  Le chiffre (nombre de personnes) s'affiche sur chaque quartier dès qu'il est > 0,
  sur la carte **et** dans la liste
- 🔁 Chacun peut revenir à tout moment consulter / modifier sa sélection ;
  actualisation automatique toutes les 60 s + bouton ⟳
- 🗃️ Persistance dans **Supabase** (Postgres)

## Stack

| Composant | Choix                          | Coût                  |
|-----------|--------------------------------|-----------------------|
| Frontend  | Next.js 14 (Vercel)            | Gratuit               |
| Carte     | react-leaflet + tuiles OSM     | Gratuit               |
| Données   | GeoJSON officiel Toulouse Métropole (`quartiers-de-democratie-locale`) | Gratuit |
| Base      | Supabase (Postgres)            | Gratuit (jusqu'~500 Mo, très largement suffisant) |

## 1. Créer la base Supabase (5 min)

1. Va sur https://supabase.com → **Start your project** (compte GitHub OK) →
   **New project** (choisis une région `eu-central` ou proche, mets un mot de
   passe de base robuste — il n'est pas utilisé par l'app).
2. Dans le projet, ouvre **SQL Editor** → **New query**, colle le contenu de
   [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
3. Va dans **Project Settings → API** et note :
   - `Project URL` → `SUPABASE_URL`
   - `service_role` **secret** (`eyJ...`) → `SUPABASE_SERVICE_ROLE_KEY`
     (clé secrète : elle ne quitte jamais le serveur, jamais de préfixe
     `NEXT_PUBLIC`).

## 2. Lancer en local

```bash
cp .env.example .env.local   # puis remplis les 3 variables
npm install
npm run fetch-quartiers      # recommandé : embarque les contours dans l'app
npm run dev                  # http://localhost:3000
```

> `npm run fetch-quartiers` télécharge les contours officiels dans
> `src/data/quartiers.geojson`. Sans lui, l'app les charge à la volée depuis
> l'API de Toulouse Métropole au chargement de la page (fonctionne, mais
> dépend d'un service externe au runtime — d'où la recommandation).

## 3. Déployer sur Vercel (gratuit)

1. Pousse le dossier sur un dépôt **GitHub** (privé de préférence).
2. Va sur https://vercel.com → **Add New → Project** → importe le dépôt.
3. **Environment Variables**, ajoute :
   - `APP_PASSWORD` = ton mot de passe partagé
   - `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` (valeurs de l'étape 1)
4. **Build Command** : remplace par `npm run fetch-quartiers && npm run build`
   (pour embarquer les contours à chaque déploiement), puis **Deploy**.
5. Chaque `git push` redéploie automatiquement.

## Personnalisation

| Quoi | Où |
|------|----|
| **Couleurs** (rouge clair/foncé, gris, bordure "ma sélection") | [`src/lib/colors.js`](src/lib/colors.js) — tout est au même endroit |
| Mot de passe | variable d'env `APP_PASSWORD` (redéploiement nécessaire) |
| Liste des quartiers | dataset officiel, réimporte via `npm run fetch-quartiers` |
| Fréquence d'actualisation auto | `60_000` dans [`src/components/AppView.jsx`](src/components/AppView.jsx) |

## Notes techniques

- **Authentification maison** : cookies signés HMAC-SHA256 (clé = `APP_PASSWORD`),
  httpOnly. Pas de compte par utilisateur, conformément au modèle "confiance".
- **Identifiant unique** : unicité vérifiée en JS (insensible à la casse) + contrainte
  `unique` en base (protection contre les courses). Si un utilisateur change
  d'appareil, il devra choisir un nouvel identifiant (modèle premier arrivé
  premier servi, assumé).
- **Sécurité BDD** : toutes les requêtes passent par des API routes Next.js avec la
  clé `service_role` (côté serveur uniquement). Le RLS n'est pas ouvert : la clé
  `anon` n'a aucun droit, même en cas de fuite côté client.
- Le GeoJSON local est lu depuis `src/data/` (embarqué dans le build serverless) ;
  en l'absence de fichier, fallback client sur l'export GeoJSON de
  `data.toulouse-metropole.fr`.
