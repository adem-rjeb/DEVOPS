import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function RegisterPage() {
  return <main><div className="card stack"><h1>Inscription</h1><AuthForm mode="register" /><p>Déjà inscrit ? <Link href="/login">Connectez-vous</Link></p></div></main>;
}
