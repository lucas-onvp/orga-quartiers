import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkPassword, encodeToken } from "@/lib/auth";

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

  cookies().set("qt_gate", encodeToken({ v: 1 }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return NextResponse.json({ ok: true });
}
