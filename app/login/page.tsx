import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <div className="card auth-card stack">
        <div className="auth-heading">
          <span className="eyebrow">ESPACE MEMBRE</span>
          <h1>Connexion</h1>
          <p className="muted">Retrouvez vos livres et vos emprunts.</p>
        </div>
        <AuthForm mode="login" />
        <p className="auth-switch">
          Pas encore de compte ? <Link href="/register">Inscrivez-vous</Link>
        </p>
      </div>
    </main>
  );
}
