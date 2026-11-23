import { describe, expect, it } from "vitest";
import { assertBorrowAllowed } from "@/lib/loans";
import { assertBookCanBeDeleted } from "@/lib/books";

describe("régressions des anomalies", () => {
  it("AN-01 refuse l'emprunt d'un administrateur", () => {
    expect(() =>
      assertBorrowAllowed(false, 0, false, 1, "ADMIN"),
    ).toThrow("ADMIN_CANNOT_BORROW");
  });

  it("AN-02 refuse la suppression d'un livre avec emprunt actif", () => {
    expect(() => assertBookCanBeDeleted(1)).toThrow("BOOK_HAS_ACTIVE_LOANS");
  });
});
