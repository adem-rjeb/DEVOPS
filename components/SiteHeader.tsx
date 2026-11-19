"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@/lib/auth";

export default function SiteHeader({ session }: { session: Session | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a className="brand" href={session ? "/dashboard" : "/"}>
          <span className="brand-mark" aria-hidden="true">
            B
          </span>
          Bibliothèque
        </a>
        {session ? (
          <nav className="nav-links" aria-label="Navigation principale">
            <a href="/dashboard">Livres</a>
            {session.role === "MEMBRE" && (
              <a href="/dashboard#emprunts">Mes emprunts</a>
            )}
            {session.role === "ADMIN" && <a href="/admin/loans">Emprunts</a>}
            <span className="user-chip">
              <span>{session.name}</span>
              <span className="role-badge">{session.role}</span>
            </span>
            <button
              className="secondary nav-logout"
              onClick={logout}
              disabled={loading}
            >
              {loading ? "..." : "Déconnexion"}
            </button>
          </nav>
        ) : (
          <a className="button nav-login" href="/login">
            Connexion
          </a>
        )}
      </div>
    </header>
  );
}
