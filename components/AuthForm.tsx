"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const body = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      setError((await response.json()).error ?? "Une erreur est survenue.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }
  return (
    <form className="stack" onSubmit={submit}>
      {mode === "register" && (
        <label>
          Nom
          <input name="name" required minLength={2} />
        </label>
      )}
      <label>
        Email
        <input name="email" type="email" required />
      </label>
      <label>
        Mot de passe
        <input name="password" type="password" required minLength={8} />
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit">
        {mode === "login" ? "Se connecter" : "Créer le compte"}
      </button>
    </form>
  );
}
