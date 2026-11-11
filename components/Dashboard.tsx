"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@/lib/auth";

type Book = { id: string; title: string; author: string; isbn: string | null };
type Loan = { id: string; borrowedAt: string; returnedAt: string | null; book: Book };

export default function Dashboard({ session }: { session: Session }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const load = useCallback(async () => {
    const [bookResponse, loanResponse] = await Promise.all([fetch(`/api/books?q=${encodeURIComponent(search)}`), fetch("/api/loans")]);
    if (bookResponse.ok) setBooks(await bookResponse.json());
    if (loanResponse.ok) setLoans(await loanResponse.json());
  }, [search]);
  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  async function borrow(bookId: string) {
    const response = await fetch("/api/loans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookId }) });
    setMessage(response.ok ? "Emprunt enregistré." : (await response.json()).error);
    await load();
  }
  async function returnBook(id: string) {
    const response = await fetch(`/api/loans/${id}`, { method: "PATCH" });
    setMessage(response.ok ? "Livre retourné." : (await response.json()).error);
    await load();
  }
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.push("/"); router.refresh(); }
  return <><header className="topbar"><strong>Bibliothèque</strong><nav><span>{session.name} ({session.role})</span><button className="secondary" onClick={logout}>Déconnexion</button></nav></header><main className="stack"><div className="card stack"><h1>Livres</h1><input aria-label="Rechercher" placeholder="Rechercher par titre ou auteur" value={search} onChange={(event) => setSearch(event.target.value)} />{session.role === "ADMIN" && <AdminBookForm onSaved={load} />}{message && <p className="success">{message}</p>}<div className="grid">{books.map((book) => <article className="card stack" key={book.id}><strong>{book.title}</strong><span>{book.author}</span><button onClick={() => borrow(book.id)}>Emprunter</button></article>)}</div></div><div className="card"><h2>Mes emprunts</h2><table><thead><tr><th>Livre</th><th>Emprunté le</th><th>Statut</th><th /></tr></thead><tbody>{loans.map((loan) => <tr key={loan.id}><td>{loan.book.title}</td><td>{new Date(loan.borrowedAt).toLocaleDateString("fr-FR")}</td><td>{loan.returnedAt ? "Retourné" : "En cours"}</td><td>{!loan.returnedAt && <button onClick={() => returnBook(loan.id)}>Retourner</button>}</td></tr>)}</tbody></table></div></main></>;
}

function AdminBookForm({ onSaved }: { onSaved: () => void }) {
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await fetch("/api/books", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    event.currentTarget.reset();
    onSaved();
  }
  return <form className="actions" onSubmit={submit}><input name="title" placeholder="Titre" required /><input name="author" placeholder="Auteur" required /><input name="isbn" placeholder="ISBN (optionnel)" /><button>Ajouter</button></form>;
}
