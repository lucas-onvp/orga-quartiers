import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { encodeToken } from "@/lib/auth";

function normalize(name) {
  return name.trim().replace(/\s+/g, " ");
}

export async function POST(request) {
  let name = "";
  try {
    ({ name } = await request.json());
  } catch {
    /* corps invalide */
  }
  name = normalize(String(name ?? ""));

  if (name.length < 2 || name.length > 30) {
    return NextResponse.json(
      { error: "L'identifiant doit contenir entre 2 et 30 caractères." },
      { status: 400 }
    );
  }

  // Unicité insensible à la casse ("Jean" = "jean")
  const { data: existing } = await db().from("app_users").select("name");
  const taken = (existing ?? []).some(
    (u) => u.name.toLowerCase() === name.toLowerCase()
  );
  if (taken) {
    return NextResponse.json(
      { error: `« ${name} » est déjà pris, choisis un autre identifiant.` },
      { status: 409 }
    );
  }

  const { data, error } = await db()
    .from("app_users")
    .insert({ name })
    .select("id")
    .single();
  if (error) {
    // Sécurité face à une course entre deux inscriptions simultanées
    if (error.code === "23505") {
      return NextResponse.json(
        { error: `« ${name} » est déjà pris, choisis un autre identifiant.` },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  cookies().set("qt_user", encodeToken({ uid: data.id, name }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return NextResponse.json({ ok: true, name });
}
