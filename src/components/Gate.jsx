"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Gate({ mode }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  const isPassword = mode === "password";

  async function submit(e) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch(isPassword ? "/api/unlock" : "/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isPassword ? { password: value } : { name: value }),
    });
    if (res.ok) {
      router.refresh();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? "Une erreur est survenue, réessaie.");
    setPending(false);
  }

  return (
    <main className="gate-wrap">
      <form className="card" onSubmit={submit}>
        <h1>{isPassword ? "Accès restreint" : "Bienvenue !"}</h1>
        <p className="muted">
          {isPassword
            ? "Cette application est réservée. Saisis le mot de passe pour continuer."
            : "Choisis un identifiant (ton prénom par exemple). Premier arrivé, premier servi : il doit être unique et te servira de nom public."}
        </p>
        <input
          type={isPassword ? "password" : "text"}
          autoFocus
          autoComplete="off"
          placeholder={isPassword ? "Mot de passe" : "Ton prénom / identifiant"}
          value={value}
          maxLength={isPassword ? undefined : 30}
          onChange={(e) => setValue(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn primary" disabled={pending}>
          {pending ? "Vérification…" : isPassword ? "Débloquer" : "Valider"}
        </button>
      </form>
    </main>
  );
}
