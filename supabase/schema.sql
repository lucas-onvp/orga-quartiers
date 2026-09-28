-- Schéma de la base (à coller dans l'éditeur SQL de Supabase)
-- Si les tables existent déjà (premier essai), ce script est idempotent :
-- il ajoute seulement la colonne calculée name_key et son index unique.

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  -- Clé d'unicité normalisée : minuscules + sans accents ("Hélène" = "helene").
  -- Colonne calculée => impossible à contourner, même en insertion simultanée.
  name_key text generated always as (
    lower(translate(btrim(regexp_replace(name, '\s+', ' ', 'g')),
      'áàâäãåçéèêëîïôöùúûüñ', 'aaaaaaceeeeiiiouuuuun'))
  ) stored unique,
  created_at timestamptz not null default now()
);

-- Migration douce si la table existe déjà avec une contrainte `name unique`
alter table app_users drop constraint if exists app_users_name_key;
alter table app_users add column if not exists name_key text
  generated always as (
    lower(translate(btrim(regexp_replace(name, '\s+', ' ', 'g')),
      'áàâäãåçéèêëîïôöùúûüñ', 'aaaaaaceeeeiiiouuuuun'))
  ) stored;
create unique index if not exists app_users_name_key_uidx on app_users (name_key);

create table if not exists selections (
  user_id uuid not null references app_users(id) on delete cascade,
  quartier_id text not null,               -- identifiant officiel du quartier (champ "quartier" du dataset)
  created_at timestamptz not null default now(),
  primary key (user_id, quartier_id)
);

-- Renforcer le RLS : aucune politique = aucune accès possible avec la clé
-- publique `anon`. Tout passe par les API routes Next.js côté serveur, qui
-- utilisent la clé `service_role` (contourne le RLS, jamais exposée au client).
alter table app_users enable row level security;
alter table selections enable row level security;
