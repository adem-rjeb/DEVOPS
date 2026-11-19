import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <main className="auth-page">
      <div className="card auth-card stack">
        <div className="auth-heading">
          <span className="eyebrow">NOUVEAU MEMBRE</span>
          <h1>Inscription</h1>
          <p className="muted">
            Créez votre espace bibliothèque en quelques secondes.
          </p>
        </div>
        <AuthForm mode="register" />
        <p className="auth-switch">
          Déjà inscrit ? <Link href="/login">Connectez-vous</Link>
        </p>
      </div>
    </main>
  );
}
