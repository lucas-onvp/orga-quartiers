import { NextResponse } from "next/server";
import { checkPassword, encodeToken } from "@/lib/auth";
import { setCookie } from "@/lib/cookies";

export async function POST(request) {
  let password = "";
  try {
    ({ password } = await request.json());
  } catch {
    /* corps invalide */
  }

  if (!checkPassword(password)) {
    return NextResponse.json(
      { error: "Mot de passe incorrect." },
      { status: 401 }
    );
  }

  await setCookie("qt_gate", encodeToken({ v: 1 }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return NextResponse.json({ ok: true });
}
