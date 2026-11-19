import { describe, expect, it } from "vitest";
import {
  assertBorrowAllowed,
  assertRenewAllowed,
  assertReturnAllowed,
  calculateDueDate,
  calculateRenewedDueDate,
  getLoanStatus,
  increaseAvailableCopies,
} from "@/lib/loans";
import { assertBookCanBeDeleted, assertStockWithinBounds } from "@/lib/books";

describe("règles d'emprunt", () => {
  it("refuse un livre déjà emprunté", async () => {
    expect(() => assertBorrowAllowed(true, 0)).toThrow("BOOK_UNAVAILABLE");
  });
  it("refuse le quatrième emprunt actif", async () => {
    expect(() => assertBorrowAllowed(false, 3)).toThrow("LOAN_LIMIT");
  });
  it("crée un emprunt valide", async () => {
    expect(() => assertBorrowAllowed(false, 2)).not.toThrow();
  });
  it("calcule une échéance 14 jours après l'emprunt", () => {
    const borrowedAt = new Date("2026-01-10T12:00:00.000Z");
    expect(calculateDueDate(borrowedAt)).toEqual(
      new Date("2026-01-24T12:00:00.000Z"),
    );
  });
  it("marque un emprunt dépassé comme LATE", () => {
    const borrowedAt = new Date("2026-01-01T12:00:00.000Z");
    expect(
      getLoanStatus(
        {
          borrowedAt,
          dueDate: new Date("2026-01-10T12:00:00.000Z"),
          returnedAt: null,
        },
        new Date("2026-01-11T12:00:00.000Z"),
      ),
    ).toBe("LATE");
  });
  it("interdit un nouvel emprunt avec un retard", () => {
    expect(() => assertBorrowAllowed(false, 1, true, 2)).toThrow("LATE_LOAN");
  });
  it("interdit un emprunt sans exemplaire disponible", () => {
    expect(() => assertBorrowAllowed(false, 1, false, 0)).toThrow(
      "NO_AVAILABLE_COPIES",
    );
  });
  it("augmente le stock disponible au retour", () => {
    expect(increaseAvailableCopies(1, 2)).toBe(2);
  });
  it("refuse l'emprunt réservé pour un autre membre", () => {
    expect(() =>
      assertBorrowAllowed(false, 1, false, 1, "MEMBRE", true),
    ).toThrow("RESERVED_FOR_ANOTHER");
  });
  it("refuse l'emprunt à un administrateur", () => {
    expect(() => assertBorrowAllowed(false, 0, false, 1, "ADMIN")).toThrow(
      "ADMIN_CANNOT_BORROW",
    );
  });
  it("refuse le même livre emprunté simultanément", () => {
    expect(() => assertBorrowAllowed(true, 1)).toThrow("BOOK_UNAVAILABLE");
  });
  it("autorise le propriétaire ou un administrateur à retourner", () => {
    expect(() => assertReturnAllowed("u1", "u1", "MEMBRE")).not.toThrow();
    expect(() => assertReturnAllowed("u1", "admin", "ADMIN")).not.toThrow();
  });
  it("refuse qu'un autre membre retourne un prêt", () => {
    expect(() => assertReturnAllowed("u1", "u2", "MEMBRE")).toThrow(
      "LOAN_NOT_FOUND",
    );
  });
  it("refuse la suppression d'un livre avec un prêt actif", () => {
    expect(() => assertBookCanBeDeleted(1)).toThrow("BOOK_HAS_ACTIVE_LOANS");
  });
  it("prolonge l'échéance de 7 jours", () => {
    const dueDate = new Date("2026-02-10T12:00:00.000Z");
    expect(calculateRenewedDueDate(dueDate)).toEqual(
      new Date("2026-02-17T12:00:00.000Z"),
    );
  });
  it("refuse de prolonger un prêt en retard", () => {
    expect(() =>
      assertRenewAllowed(
        null,
        new Date("2026-02-01T12:00:00.000Z"),
        0,
        new Date("2026-02-02T12:00:00.000Z"),
      ),
    ).toThrow("LOAN_IS_LATE");
  });
  it("refuse plus de 2 prolongations", () => {
    expect(() =>
      assertRenewAllowed(
        null,
        new Date("2026-12-31T12:00:00.000Z"),
        2,
        new Date("2026-11-19T12:00:00.000Z"),
      ),
    ).toThrow("MAX_RENEWALS_REACHED");
  });
  it("autorise une prolongation valide", () => {
    expect(() =>
      assertRenewAllowed(
        null,
        new Date("2026-12-31T12:00:00.000Z"),
        1,
        new Date("2026-11-19T12:00:00.000Z"),
      ),
    ).not.toThrow();
  });
  it("garantit que le stock reste dans ses bornes", () => {
    expect(() => assertStockWithinBounds(-1, 3)).toThrow("INVALID_STOCK");
    expect(() => assertStockWithinBounds(4, 3)).toThrow("INVALID_STOCK");
    expect(assertStockWithinBounds(2, 3)).toBe(2);
  });
});
