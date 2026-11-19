"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
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
    } finally {
      setLoading(false);
    }
  }
  return (
    <form className="stack" onSubmit={submit}>
      {mode === "register" && (
        <label>
          Nom
          <input name="name" required minLength={2} autoComplete="name" />
        </label>
      )}
      <label>
        Email
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        Mot de passe
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </label>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" disabled={loading}>
        {loading
          ? "Chargement..."
          : mode === "login"
            ? "Se connecter"
            : "Créer le compte"}
      </button>
    </form>
  );
}
