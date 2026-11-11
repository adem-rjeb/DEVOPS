import Link from "next/link";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();
  return (
    <>
      <header className="topbar">
        <strong>Bibliothèque</strong>
        <nav>
          {session ? (
            <Link href="/dashboard">Tableau de bord</Link>
          ) : (
            <Link href="/login">Connexion</Link>
          )}
        </nav>
      </header>
      <main>
        <section className="card stack">
          <h1>Gestion d&apos;une bibliothèque</h1>
          <p className="muted">
            Une application simple pour gérer les livres et les emprunts.
          </p>
          <div className="actions">
            <Link
              className="button"
              href={session ? "/dashboard" : "/register"}
            >
              {session ? "Ouvrir le tableau de bord" : "Créer un compte"}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
