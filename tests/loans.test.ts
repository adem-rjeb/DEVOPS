import { describe, expect, it } from "vitest";
import { assertBorrowAllowed } from "@/lib/loans";

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
});
