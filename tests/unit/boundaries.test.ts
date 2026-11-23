import { describe, expect, it, test } from "vitest";
import { assertBorrowAllowed } from "@/lib/loans";
import { assertStockWithinBounds } from "@/lib/books";
import { createBookSchema } from "@/lib/validation";

describe("Bornes des emprunts", () => {
  it("AN-04 CT-09 autorise deux emprunts actifs", () => {
    expect(() => assertBorrowAllowed(false, 2)).not.toThrow();
  });

  it("AN-04 CT-10 autorise exactement trois emprunts actifs", () => {
    expect(() => assertBorrowAllowed(false, 2)).not.toThrow();
  });

  it("AN-04 CT-11 refuse le quatrième emprunt actif", () => {
    expect(() => assertBorrowAllowed(false, 3)).toThrow("LOAN_LIMIT");
  });
});

describe("Bornes du stock", () => {
  it("CT-12 accepte le stock zéro", () => {
    expect(assertStockWithinBounds(0, 1)).toBe(0);
  });

  it("CT-13 accepte le stock un", () => {
    expect(assertStockWithinBounds(1, 1)).toBe(1);
  });
});

describe("Bornes titre/auteur AN-03", () => {
  it("AN-03 CT-18 accepte exactement un caractère de titre", () => {
    const result = createBookSchema.safeParse({
      title: "A",
      author: "Auteur",
      totalCopies: 1,
    });
    expect(result.success).toBe(true);
  });

  test.fails("AN-03 CT-19 refuse un titre de 201 caractères", () => {
    const result = createBookSchema.safeParse({
      title: "A".repeat(201),
      author: "Auteur",
      totalCopies: 1,
    });
    expect(result.success).toBe(false);
  });

  it("AN-03 CT-18 accepte exactement 200 caractères", () => {
    const result = createBookSchema.safeParse({
      title: "A".repeat(200),
      author: "Auteur",
      totalCopies: 1,
    });
    expect(result.success).toBe(true);
  });

  it("AN-03 CT-20 refuse un titre vide", () => {
    const result = createBookSchema.safeParse({
      title: "",
      author: "Auteur",
      totalCopies: 1,
    });
    expect(result.success).toBe(false);
  });

  test.fails("AN-03 refuse un auteur de 101 caractères", () => {
    const result = createBookSchema.safeParse({
      title: "Titre",
      author: "A".repeat(101),
      totalCopies: 1,
    });
    expect(result.success).toBe(false);
  });

  it("AN-03 accepte exactement 100 caractères d'auteur", () => {
    const result = createBookSchema.safeParse({
      title: "Titre",
      author: "A".repeat(100),
      totalCopies: 1,
    });
    expect(result.success).toBe(true);
  });

  it("AN-03 accepte exactement un caractère d'auteur", () => {
    const result = createBookSchema.safeParse({
      title: "Titre",
      author: "A",
      totalCopies: 1,
    });
    expect(result.success).toBe(true);
  });

  it("AN-03 refuse un auteur vide", () => {
    const result = createBookSchema.safeParse({
      title: "Titre",
      author: "",
      totalCopies: 1,
    });
    expect(result.success).toBe(false);
  });
});
