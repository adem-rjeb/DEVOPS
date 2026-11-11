import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return <main><div className="card stack"><h1>Connexion</h1><AuthForm mode="login" /><p>Pas encore de compte ? <Link href="/register">Inscrivez-vous</Link></p></div></main>;
}
