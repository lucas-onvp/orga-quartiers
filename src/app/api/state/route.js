import { NextResponse } from "next/server";
import { decodeToken } from "@/lib/auth";
import { getState } from "@/lib/db";
import { getCookie } from "@/lib/cookies";

export async function GET() {
  const user = decodeToken(await getCookie("qt_user"));
  if (!user?.uid) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const state = await getState(user.uid);
  return NextResponse.json(state);
}
