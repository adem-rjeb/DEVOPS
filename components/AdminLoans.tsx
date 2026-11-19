"use client";

import { useCallback, useEffect, useState } from "react";

type AdminLoan = {
  id: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt: string | null;
  status: "ACTIVE" | "LATE" | "RETURNED";
  user: { id: string; name: string; email: string };
  book: { id: string; title: string; author: string };
};

type Filter = "all" | "active" | "late" | "returned";

export default function AdminLoans() {
  const [loans, setLoans] = useState<AdminLoan[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ filter, search });
    const response = await fetch(`/api/admin/loans?${params.toString()}`);
    if (response.ok) setLoans(await response.json());
    setLoading(false);
  }, [filter, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 150);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function markReturned(id: string) {
    setReturningId(id);
    const response = await fetch(`/api/loans/${id}`, { method: "PATCH" });
    setMessage(
      response.ok
        ? "Prêt marqué comme retourné."
        : (await response.json()).error,
    );
    setReturningId("");
    await load();
  }

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 3500);
    return () => window.clearTimeout(timer);
  }, [message]);

  return (
    <main className="dashboard stack">
      <section className="dashboard-heading">
        <div>
          <span className="eyebrow">ADMINISTRATION</span>
          <h1>Gestion des emprunts</h1>
          <p className="muted">Suivez tous les prêts et leur échéance.</p>
        </div>
        <a
          className="button admin-export"
          href="/api/admin/loans/export"
          download="emprunts.csv"
        >
          Exporter en CSV
        </a>
      </section>

      <section className="card stack">
        <div className="admin-loan-controls">
          <label className="search-field">
            <span aria-hidden="true">⌕</span>
            <span className="sr-only">Rechercher</span>
            <input
              aria-label="Rechercher"
              placeholder="Rechercher un membre ou un livre"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <div className="filter-tabs" aria-label="Filtrer les emprunts">
            {(
              [
                ["all", "Tous"],
                ["active", "Actifs"],
                ["late", "En retard"],
                ["returned", "Retournés"],
              ] as [Filter, string][]
            ).map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={
                  filter === value ? "filter-tab active" : "filter-tab"
                }
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div
            className="skeleton-card admin-skeleton"
            aria-label="Chargement des emprunts"
          />
        ) : loans.length ? (
          <div className="table-wrap">
            <table className="admin-loans-table">
              <thead>
                <tr>
                  <th>Membre</th>
                  <th>Livre</th>
                  <th>Emprunté le</th>
                  <th>Échéance</th>
                  <th>Statut</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id}>
                    <td>
                      <strong>{loan.user.name}</strong>
                      <small>{loan.user.email}</small>
                    </td>
                    <td>{loan.book.title}</td>
                    <td>
                      {new Date(loan.borrowedAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td>
                      {new Date(loan.dueDate).toLocaleDateString("fr-FR")}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${loan.status === "LATE" ? "late" : loan.status === "RETURNED" ? "returned" : "available"}`}
                      >
                        {loan.status === "LATE"
                          ? "En retard"
                          : loan.status === "RETURNED"
                            ? "Retourné"
                            : "Actif"}
                      </span>
                    </td>
                    <td>
                      {!loan.returnedAt && (
                        <button
                          onClick={() => void markReturned(loan.id)}
                          disabled={Boolean(returningId)}
                        >
                          {returningId === loan.id
                            ? "..."
                            : "Marquer comme retourné"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>Aucun emprunt trouvé</h3>
            <p className="muted">Modifiez les filtres ou la recherche.</p>
          </div>
        )}
      </section>

      {message && (
        <div className="toast" role="status">
          {message}
        </div>
      )}
    </main>
  );
}
