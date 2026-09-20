import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeToken } from "@/lib/auth";
import { getState } from "@/lib/db";

export async function GET() {
  const user = decodeToken(cookies().get("qt_user")?.value);
  if (!user?.uid) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const state = await getState(user.uid);
  return NextResponse.json(state);
}
