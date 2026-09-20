-- Schéma de la base (à coller dans l'éditeur SQL de Supabase)

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists selections (
  user_id uuid not null references app_users(id) on delete cascade,
  quartier_id text not null,               -- identifiant officiel du quartier (champ "quartier" du dataset)
  created_at timestamptz not null default now(),
  primary key (user_id, quartier_id)
);

-- Tout accès se fait via la clé service_role côté serveur (Next.js),
-- qui contourne le RLS : aucune politique à ajouter, la clé anon reste sans droits.
