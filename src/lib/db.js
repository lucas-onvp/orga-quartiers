import { createClient } from "@supabase/supabase-js";

let client = null;

/** Client Supabase service_role — à utiliser UNIQUEMENT côté serveur. */
export function db() {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Variables SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY manquantes"
    );
  }
  client = createClient(url, key);
  return client;
}

/**
 * Renvoie { byQuartier: { [quartierId]: [noms...] }, mine: [quartierId...] }.
 * Les noms sont triés de façon insensible à la casse et aux accents.
 */
export async function getState(userId) {
  const { data, error } = await db()
    .from("selections")
    .select("quartier_id, user_id, user:app_users(name)");
  if (error) throw error;

  const byQuartier = {};
  const mine = [];
  for (const row of data ?? []) {
    (byQuartier[row.quartier_id] ??= []).push(row.user.name);
    if (userId && row.user_id === userId) mine.push(row.quartier_id);
  }
  const cle = (s) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const list of Object.values(byQuartier))
    list.sort((a, b) => cle(a).localeCompare(cle(b)));
  return { byQuartier, mine };
}
