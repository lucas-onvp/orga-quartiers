import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { encodeToken } from "@/lib/auth";
import { normalizeName } from "@/lib/quartiers";

export async function POST(request) {
  let name = "";
  try {
    ({ name } = await request.json());
  } catch {
    /* corps invalide */
  }
  const raw = String(name ?? "");
  const key = normalizeName(raw); // minuscules + sans accents : base de l'unicité

  if (key.length < 2 || key.length > 30) {
    return NextResponse.json(
      { error: "L'identifiant doit contenir entre 2 et 30 caractères." },
      { status: 400 }
    );
  }

  // Premier arrivé premier servi : unicité insensible à la casse et aux accents
  const { data: existing, error: selErr } = await db()
    .from("app_users")
    .select("name");
  if (selErr) return NextResponse.json({ error: selErr.message }, { status: 500 });
  const taken = (existing ?? []).some((u) => normalizeName(u.name) === key);
  if (taken) {
    return NextResponse.json(
      { error: `« ${raw.trim()} » est déjà pris, choisis un autre identifiant.` },
      { status: 409 }
    );
  }

  // Le nom public conserve les majuscules/accents saisis ; la colonne
  // calculée `name_key` (index unique en base) protège aussi contre deux
  // inscriptions simultanées avec le même identifiant normalisé.
  const displayName = raw.trim().replace(/\s+/g, " ");
  const { data, error } = await db()
    .from("app_users")
    .insert({ name: displayName })
    .select("id, name")
    .single();
  if (error) {
    // Sécurité face à une course entre deux inscriptions simultanées
    if (error.code === "23505") {
      return NextResponse.json(
        { error: `« ${displayName} » est déjà pris, choisis un autre identifiant.` },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  cookies().set("qt_user", encodeToken({ uid: data.id, name: data.name }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return NextResponse.json({ ok: true, name: data.name });
}
