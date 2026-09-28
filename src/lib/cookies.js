import { cookies } from "next/headers";

// Compatibilité Next.js 14 / 15+ :
// - Next.js 14 : cookies() est synchrone et retourne un RequestCookie[] (tableau,
//   avec .get()/.set() selon les sous-versions).
// - Next.js 15+ : cookies() est asynchrone (Promise) et retourne une CookieMap.
// Ce module expose getCookie/setCookie qui fonctionnent dans les deux cas.

async function cookieStore() {
  const c = await cookies(); // no-op si déjà synchrone (Next 14)
  return c;
}

export async function getCookie(name) {
  const c = await cookieStore();
  if (typeof c.get === "function") return c.get(name)?.value;
  // dernier recours : objet tableau sans méthode get()
  return c.find?.((x) => x.name === name)?.value;
}

export async function setCookie(name, value, options) {
  const c = await cookieStore();
  if (typeof c.set === "function") {
    c.set(name, value, options);
  } else {
    // API Next 14 (React cookies()) : set(objet)
    c.set({ name, value, ...options });
  }
}
