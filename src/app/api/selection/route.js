import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeToken } from "@/lib/auth";
import { db, getState } from "@/lib/db";
import { getLocalGeoJSON, quartierId } from "@/lib/quartiers";

export async function POST(request) {
  const user = decodeToken(cookies().get("qt_user")?.value);
  if (!user?.uid) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  let quartierIdInput = null;
  let action = null;
  try {
    ({ quartierId: quartierIdInput, action } = await request.json());
  } catch {
    /* corps invalide */
  }

  const id = String(quartierIdInput ?? "");
  // Les identifiants officiels sont des numéros
  if (!/^\d{1,4}$/.test(id)) {
    return NextResponse.json(
      { error: "Identifiant de quartier invalide." },
      { status: 400 }
    );
  }
  // Si le GeoJSON local est présent, on vérifie que le quartier existe
  const local = getLocalGeoJSON();
  if (local && !local.features.some((f) => quartierId(f) === id)) {
    return NextResponse.json(
      { error: "Quartier inconnu." },
      { status: 400 }
    );
  }

  if (action === "select") {
    const { error } = await db()
      .from("selections")
      .upsert({ user_id: user.uid, quartier_id: id });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else if (action === "deselect") {
    const { error } = await db()
      .from("selections")
      .delete()
      .eq("user_id", user.uid)
      .eq("quartier_id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json(
      { error: "Action inconnue (select|deselect)." },
      { status: 400 }
    );
  }

  const state = await getState(user.uid);
  return NextResponse.json(state);
}
