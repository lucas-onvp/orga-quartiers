import crypto from "crypto";

function secret() {
  const s = process.env.APP_PASSWORD;
  if (!s) throw new Error("Variable d'environnement APP_PASSWORD manquante");
  return s;
}

function sign(value) {
  return crypto.createHmac("sha256", secret()).update(value).digest("base64url");
}

/** Encode un objet en jeton signé "payload.signature" (stocké en cookie). */
export function encodeToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

/** Vérifie la signature et renvoie le payload, ou null si invalide. */
export function decodeToken(token) {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString());
  } catch {
    return null;
  }
}

export function checkPassword(candidate) {
  const expected = process.env.APP_PASSWORD;
  if (!expected || typeof candidate !== "string") return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
