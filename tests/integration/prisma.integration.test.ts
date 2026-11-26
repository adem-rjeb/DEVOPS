import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { borrowBook, returnBook } from "@/lib/loans";
import { deleteBook, updateBookStock } from "@/lib/books";

import { vi } from "vitest";

vi.mock("@/lib/prisma", async () => {
  const { PrismaClient } = await import("@prisma/client");
  return {
    prisma: new PrismaClient({
      datasources: { db: { url: process.env.TEST_DATABASE_URL } },
    }),
  };
});

const databaseUrl = process.env.TEST_DATABASE_URL;
const appDatabaseUrl = process.env.DATABASE_URL;

if (!databaseUrl || !appDatabaseUrl) {
  throw new Error(
    "DATABASE_URL et TEST_DATABASE_URL sont requis pour les tests d'intégration.",
  );
}
if (databaseUrl === appDatabaseUrl) {
  throw new Error(
    "La base de test doit être différente de la base de développement.",
  );
}
if (databaseUrl.includes("dev.db")) {
  throw new Error("prisma/dev.db est interdit dans les tests d'intégration.");
}
if (
  !databaseUrl.startsWith("file:") ||
  (!databaseUrl.includes("test") &&
    !databaseUrl.includes("tmp") &&
    !databaseUrl.includes("integr") &&
    !databaseUrl.includes("bibliotheque-step"))
) {
  throw new Error(
    "TEST_DATABASE_URL doit désigner explicitement une base SQLite de test.",
  );
}

const prisma = new PrismaClient({
  datasources: { db: { url: databaseUrl } },
});

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await prisma.loan.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

async function createMember(email: string) {
  return prisma.user.create({
    data: {
      name: email,
      email,
      passwordHash: "hash-test",
      role: "MEMBRE",
    },
  });
}

describe("intégration Prisma réelle", () => {
  it("persiste CRUD et retourne un livre avec stock cohérent", async () => {
    const member = await createMember("crud@test.local");
    const book = await prisma.book.create({
      data: {
        title: "Livre CRUD",
        author: "Auteur CRUD",
        totalCopies: 1,
        availableCopies: 1,
      },
    });

    const loan = await borrowBook(member.id, book.id);
    expect(loan.userId).toBe(member.id);
    expect(
      await prisma.book.findUnique({ where: { id: book.id } }),
    ).toMatchObject({
      availableCopies: 0,
    });

    await returnBook(member.id, "MEMBRE", loan.id);
    expect(
      await prisma.book.findUnique({ where: { id: book.id } }),
    ).toMatchObject({
      availableCopies: 1,
    });

    await prisma.book.update({
      where: { id: book.id },
      data: { title: "Titre modifié" },
    });
    expect(
      await prisma.book.findUnique({ where: { id: book.id } }),
    ).toMatchObject({
      title: "Titre modifié",
    });
  });

  it("garde le stock borné et refuse trois/plus trois emprunts", async () => {
    const member = await createMember("limit@test.local");
    const book = await prisma.book.create({
      data: {
        title: "Stock et limite",
        author: "Auteur",
        totalCopies: 3,
        availableCopies: 3,
      },
    });

    await expect(
      updateBookStock(book.id, {
        title: book.title,
        author: book.author,
        isbn: null,
        totalCopies: 2,
      }),
    ).resolves.toMatchObject({ availableCopies: 2, totalCopies: 2 });

    const threeBooks = await Promise.all(
      [1, 2, 3].map((copy) =>
        prisma.book.create({
          data: {
            title: `Limite ${copy}`,
            author: "Auteur",
            totalCopies: 1,
            availableCopies: 1,
          },
        }),
      ),
    );
    await Promise.all(
      threeBooks.map((entry) => borrowBook(member.id, entry.id)),
    );

    const fourth = await prisma.book.create({
      data: {
        title: "Quatrième",
        author: "Auteur",
        totalCopies: 1,
        availableCopies: 1,
      },
    });
    await expect(borrowBook(member.id, fourth.id)).rejects.toThrow(
      "LOAN_LIMIT",
    );

    for (const entry of await prisma.book.findMany()) {
      const stock = await prisma.book.findUnique({ where: { id: entry.id } });
      expect(stock!.availableCopies).toBeGreaterThanOrEqual(0);
      expect(stock!.availableCopies).toBeLessThanOrEqual(stock!.totalCopies);
    }
  });

  it("refuse l'emprunt à stock zéro", async () => {
    const member = await createMember("zero@test.local");
    const book = await prisma.book.create({
      data: {
        title: "Stock zéro",
        author: "Auteur",
        totalCopies: 1,
        availableCopies: 0,
      },
    });

    await expect(borrowBook(member.id, book.id)).rejects.toThrow(
      "NO_AVAILABLE_COPIES",
    );
  });

  it("refuse la suppression d'un livre avec emprunt actif", async () => {
    const member = await createMember("delete@test.local");
    const book = await prisma.book.create({
      data: {
        title: "Livre actif",
        author: "Auteur",
        totalCopies: 1,
        availableCopies: 1,
      },
    });
    await borrowBook(member.id, book.id);

    await expect(deleteBook(book.id)).rejects.toThrow("BOOK_HAS_ACTIVE_LOANS");
    expect(
      await prisma.book.findUnique({ where: { id: book.id } }),
    ).not.toBeNull();
  });

  it("autorise une seule transaction pour le dernier exemplaire concurrent", async () => {
    const alice = await createMember("alice-concurrent@test.local");
    const bruno = await createMember("bruno-concurrent@test.local");
    const book = await prisma.book.create({
      data: {
        title: "Dernier exemplaire",
        author: "Auteur",
        totalCopies: 1,
        availableCopies: 1,
      },
    });

    const results = await Promise.allSettled([
      borrowBook(alice.id, book.id),
      borrowBook(bruno.id, book.id),
    ]);

    expect(
      results.filter((entry) => entry.status === "fulfilled"),
    ).toHaveLength(1);
    expect(results.filter((entry) => entry.status === "rejected")).toHaveLength(
      1,
    );
    expect(
      await prisma.loan.count({ where: { bookId: book.id, returnedAt: null } }),
    ).toBe(1);
    expect(
      await prisma.book.findUnique({ where: { id: book.id } }),
    ).toMatchObject({
      availableCopies: 0,
      totalCopies: 1,
    });
  });
});
