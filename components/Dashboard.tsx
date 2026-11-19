"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import type { Session } from "@/lib/auth";

type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  totalCopies: number;
  availableCopies: number;
};
type Loan = {
  id: string;
  borrowedAt: string;
  returnedAt: string | null;
  dueDate: string;
  renewCount: number;
  book: Book;
  status?: "ACTIVE" | "LATE" | "RETURNED";
};
type Reservation = {
  id: string;
  status: "WAITING" | "READY" | "CANCELLED" | "FULFILLED";
  readyUntil: string | null;
  book: Book;
};
type Stats = {
  totalBooks: number;
  totalCopies: number;
  activeLoans: number;
  lateLoans: number;
  mostBorrowedBooks: { title: string; author: string; count: number }[];
};

export default function Dashboard({ session }: { session: Session }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState("");
  const [editing, setEditing] = useState<Book | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const [bookResponse, loanResponse] = await Promise.all([
      fetch(`/api/books?q=${encodeURIComponent(search)}`),
      fetch("/api/loans"),
    ]);
    if (bookResponse.ok) {
      const responseBooks = await bookResponse.json();
      setBooks(
        responseBooks.map(
          (book: Partial<Book> & Pick<Book, "id" | "title" | "author">) => ({
            ...book,
            totalCopies: book.totalCopies ?? 1,
            availableCopies: book.availableCopies ?? 1,
          }),
        ),
      );
    }
    if (loanResponse.ok) setLoans(await loanResponse.json());
    if (session.role === "MEMBRE") {
      const reservationResponse = await fetch("/api/reservations");
      if (reservationResponse.ok)
        setReservations(await reservationResponse.json());
    }
    if (session.role === "ADMIN") {
      const statsResponse = await fetch("/api/stats");
      if (statsResponse.ok) setStats(await statsResponse.json());
    }
    setLoading(false);
  }, [search, session.role]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 180);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 3500);
    return () => window.clearTimeout(timer);
  }, [message]);

  async function borrow(bookId: string) {
    setAction(`borrow-${bookId}`);
    const response = await fetch("/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId }),
    });
    setMessage(
      response.ok ? "Emprunt enregistré." : (await response.json()).error,
    );
    setAction("");
    await load();
  }

  async function renewLoan(id: string) {
    setAction(`renew-${id}`);
    const response = await fetch(`/api/loans/${id}/renew`, { method: "POST" });
    setMessage(
      response.ok ? "Prêt prolongé de 7 jours." : (await response.json()).error,
    );
    setAction("");
    await load();
  }

  async function reserveBook(bookId: string) {
    setAction(`reserve-${bookId}`);
    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId }),
    });
    setMessage(
      response.ok ? "Réservation enregistrée." : (await response.json()).error,
    );
    setAction("");
    await load();
  }

  async function cancelReservation(id: string) {
    setAction(`cancel-${id}`);
    const response = await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
    });
    setMessage(
      response.ok ? "Réservation annulée." : (await response.json()).error,
    );
    setAction("");
    await load();
  }

  async function returnBook(id: string) {
    setAction(`return-${id}`);
    const response = await fetch(`/api/loans/${id}`, { method: "PATCH" });
    setMessage(response.ok ? "Livre retourné." : (await response.json()).error);
    setAction("");
    await load();
  }

  async function deleteBook(book: Book) {
    setAction(`delete-${book.id}`);
    const response = await fetch(`/api/books/${book.id}`, { method: "DELETE" });
    setMessage(response.ok ? "Livre supprimé." : (await response.json()).error);
    setAction("");
    setDeleteTarget(null);
    await load();
  }

  const activeLoans = loans.filter((loan) => !loan.returnedAt);

  return (
    <main className="dashboard stack">
      <section className="dashboard-heading">
        <div>
          <span className="eyebrow">ESPACE {session.role}</span>
          <h1>Bonjour, {session.name}</h1>
          <p className="muted">
            {session.role === "ADMIN"
              ? "Gérez le catalogue et les emprunts."
              : "Explorez le catalogue et gérez vos emprunts."}
          </p>
        </div>
        {session.role === "MEMBRE" && (
          <div className="loan-counter">
            <strong>{activeLoans.length} / 3</strong>
            <span>emprunts</span>
          </div>
        )}
      </section>

      <section className="card stack">
        <div className="section-heading">
          <div>
            <h2>Livres</h2>
            <p className="muted">Trouvez votre prochaine lecture.</p>
          </div>
          {session.role === "ADMIN" && <AdminBookForm onSaved={load} />}
        </div>
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <span className="sr-only">Rechercher</span>
          <input
            aria-label="Rechercher"
            placeholder="Rechercher par titre ou auteur"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        {loading ? (
          <div className="grid" aria-label="Chargement des livres">
            {[1, 2, 3].map((item) => (
              <div className="book-card skeleton-card" key={item} />
            ))}
          </div>
        ) : books.length ? (
          <div className="grid">
            {books.map((book) => {
              const isBorrowedByUser = activeLoans.some(
                (loan) => loan.book.id === book.id,
              );
              const totalCopies = book.totalCopies ?? 1;
              const availableCopies = Math.max(
                0,
                Math.min(book.availableCopies ?? totalCopies, totalCopies),
              );
              return (
                <article className="book-card stack" key={book.id}>
                  <div className="book-cover" aria-hidden="true">
                    {book.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="book-info">
                    <span
                      className={`status-badge ${availableCopies > 0 ? "available" : "borrowed"}`}
                    >
                      {availableCopies > 0 ? "Disponible" : "Emprunté"}
                    </span>
                    {session.role === "MEMBRE" && isBorrowedByUser && (
                      <span className="status-badge borrowed-by-user">
                        Emprunté par vous
                      </span>
                    )}
                    <h3>{book.title}</h3>
                    <p>{book.author}</p>
                    <small>
                      {availableCopies} / {totalCopies} exemplaires disponibles
                    </small>
                  </div>
                  <div className="book-actions">
                    {session.role === "MEMBRE" && availableCopies > 0 && (
                      <button
                        onClick={() => void borrow(book.id)}
                        disabled={
                          Boolean(action) ||
                          isBorrowedByUser ||
                          availableCopies === 0
                        }
                      >
                        {action === `borrow-${book.id}` ? "..." : "Emprunter"}
                      </button>
                    )}
                    {session.role === "MEMBRE" && availableCopies === 0 && (
                      <button
                        onClick={() => void reserveBook(book.id)}
                        disabled={Boolean(action)}
                        className="secondary"
                      >
                        {action === `reserve-${book.id}` ? "..." : "Réserver"}
                      </button>
                    )}
                    {session.role === "ADMIN" && (
                      <>
                        <button
                          className="icon-button"
                          aria-label={`Modifier ${book.title}`}
                          onClick={() => setEditing(book)}
                          disabled={Boolean(action)}
                        >
                          ✎
                        </button>
                        <button
                          className="icon-button danger-icon"
                          aria-label={`Supprimer ${book.title}`}
                          onClick={() => setDeleteTarget(book)}
                          disabled={Boolean(action)}
                        >
                          ×
                        </button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">
              ⌕
            </span>
            <h3>Aucun livre trouvé</h3>
            <p className="muted">Essayez avec un autre titre ou auteur.</p>
          </div>
        )}
      </section>

      {session.role === "ADMIN" && stats && (
        <section className="card stack">
          <div className="section-heading">
            <div>
              <h2>Statistiques</h2>
              <p className="muted">Vue d&apos;ensemble de la bibliothèque.</p>
            </div>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <strong>{stats.totalBooks}</strong>
              <span>Livres</span>
            </div>
            <div className="stat-item">
              <strong>{stats.totalCopies}</strong>
              <span>Exemplaires</span>
            </div>
            <div className="stat-item">
              <strong>{stats.activeLoans}</strong>
              <span>Emprunts actifs</span>
            </div>
            <div className="stat-item">
              <strong>{stats.lateLoans}</strong>
              <span>En retard</span>
            </div>
          </div>
          {stats.mostBorrowedBooks.length > 0 && (
            <div className="popular-list">
              <h3>Livres les plus empruntés</h3>
              {stats.mostBorrowedBooks.map((book) => (
                <div className="popular-row" key={book.title}>
                  <span>
                    {book.title} <small>{book.author}</small>
                  </span>
                  <strong>{book.count}</strong>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {session.role === "MEMBRE" && (
        <section className="card stack" id="emprunts">
          <div className="section-heading">
            <div>
              <h2>Mes emprunts</h2>
              <p className="muted">
                Votre activité récente et votre historique.
              </p>
            </div>
            <span className="loan-counter compact">
              <strong>{activeLoans.length} / 3</strong> emprunts
            </span>
          </div>
          {loans.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Livre</th>
                    <th>Emprunté le</th>
                    <th>À rendre le</th>
                    <th>Statut</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => (
                    <tr key={loan.id}>
                      <td>
                        <strong>{loan.book.title}</strong>
                      </td>
                      <td>
                        {new Date(loan.borrowedAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td>
                        {new Date(loan.dueDate).toLocaleDateString("fr-FR")}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${loan.returnedAt ? "returned" : loan.status === "LATE" ? "late" : "available"}`}
                        >
                          {loan.returnedAt
                            ? "Retourné"
                            : loan.status === "LATE"
                              ? "En retard"
                              : "En cours"}
                        </span>
                      </td>
                      <td>
                        {!loan.returnedAt && (
                          <div className="loan-actions">
                            {loan.status !== "LATE" && loan.renewCount < 2 && (
                              <button
                                className="secondary"
                                onClick={() => void renewLoan(loan.id)}
                                disabled={Boolean(action)}
                              >
                                {action === `renew-${loan.id}`
                                  ? "..."
                                  : "Prolonger"}
                              </button>
                            )}
                            <button
                              onClick={() => void returnBook(loan.id)}
                              disabled={Boolean(action)}
                            >
                              {action === `return-${loan.id}`
                                ? "..."
                                : "Retourner"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted">Aucun emprunt pour le moment.</p>
          )}
        </section>
      )}

      {session.role === "MEMBRE" && (
        <section className="card stack" id="reservations">
          <div className="section-heading">
            <div>
              <h2>Mes réservations</h2>
              <p className="muted">
                Suivez vos demandes et vos fenêtres de retrait.
              </p>
            </div>
          </div>
          {reservations.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Livre</th>
                    <th>Statut</th>
                    <th>Fenêtre</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {reservations
                    .filter((reservation) =>
                      ["WAITING", "READY"].includes(reservation.status),
                    )
                    .map((reservation) => (
                      <tr key={reservation.id}>
                        <td>
                          <strong>{reservation.book.title}</strong>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${reservation.status === "READY" ? "available" : "borrowed"}`}
                          >
                            {reservation.status === "READY"
                              ? "Disponible 48 h"
                              : "En attente"}
                          </span>
                        </td>
                        <td>
                          {reservation.readyUntil
                            ? new Date(reservation.readyUntil).toLocaleString(
                                "fr-FR",
                              )
                            : "—"}
                        </td>
                        <td>
                          <button
                            className="secondary"
                            onClick={() =>
                              void cancelReservation(reservation.id)
                            }
                            disabled={Boolean(action)}
                          >
                            {action === `cancel-${reservation.id}`
                              ? "..."
                              : "Annuler"}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted">Aucune réservation active.</p>
          )}
        </section>
      )}

      {editing && (
        <EditBookForm
          book={editing}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      )}
      {deleteTarget && (
        <div className="modal-backdrop" role="presentation">
          <div
            className="card modal stack delete-confirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-book-title"
          >
            <h2 id="delete-book-title">Supprimer le livre ?</h2>
            <p className="muted">
              « {deleteTarget.title} » sera définitivement supprimé.
            </p>
            <div className="actions">
              <button
                className="danger"
                onClick={() => void deleteBook(deleteTarget)}
                disabled={Boolean(action)}
              >
                {action === `delete-${deleteTarget.id}`
                  ? "Suppression..."
                  : "Supprimer"}
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={Boolean(action)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className="toast" role="status">
          {message}
        </div>
      )}
    </main>
  );
}

function AdminBookForm({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form));
    await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    form.reset();
    setOpen(false);
    onSaved();
  }

  return open ? (
    <form className="admin-form" onSubmit={submit}>
      <input name="title" placeholder="Titre" aria-label="Titre" required />
      <input name="author" placeholder="Auteur" aria-label="Auteur" required />
      <input
        name="totalCopies"
        type="number"
        min="1"
        defaultValue="1"
        placeholder="Exemplaires"
        aria-label="Exemplaires"
        required
      />
      <input
        name="isbn"
        placeholder="ISBN (optionnel)"
        aria-label="ISBN (optionnel)"
      />
      <button>Ajouter</button>
      <button
        type="button"
        className="secondary"
        onClick={() => setOpen(false)}
      >
        Annuler
      </button>
    </form>
  ) : (
    <button onClick={() => setOpen(true)}>+ Ajouter un livre</button>
  );
}

function EditBookForm({
  book,
  onClose,
  onSaved,
}: {
  book: Book;
  onClose: () => void;
  onSaved: () => void;
}) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await fetch(`/api/books/${book.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        Object.fromEntries(new FormData(event.currentTarget)),
      ),
    });
    onClose();
    onSaved();
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form
        className="card modal stack"
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-book-title"
      >
        <h2 id="edit-book-title">Modifier le livre</h2>
        <input
          name="title"
          defaultValue={book.title}
          aria-label="Titre"
          required
        />
        <input
          name="totalCopies"
          type="number"
          min="1"
          defaultValue={book.totalCopies}
          aria-label="Exemplaires"
          required
        />
        <input
          name="author"
          defaultValue={book.author}
          aria-label="Auteur"
          required
        />
        <input
          name="isbn"
          defaultValue={book.isbn ?? ""}
          aria-label="ISBN (optionnel)"
        />
        <div className="actions">
          <button>Enregistrer</button>
          <button type="button" className="secondary" onClick={onClose}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
