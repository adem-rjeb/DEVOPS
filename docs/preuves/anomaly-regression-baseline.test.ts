import { describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { assertBorrowAllowed } from "@/lib/loans";

describe("AN-01 / AN-02 sur le baseline", () => {
  it("AN-01 refuse l'emprunt d'un administrateur", () => {
    expect(() => assertBorrowAllowed(false, 0)).toThrow(
      "ADMIN_CANNOT_BORROW",
    );
  });

  it("AN-02 refuse la suppression d'un livre avec emprunt actif", async () => {
    const prisma = new PrismaClient();
    await prisma.loan.deleteMany();
    await prisma.book.deleteMany();
    await prisma.user.deleteMany();

    try {
      const passwordHash =
        "$2b$12$000000000000000000000000000000000000000000000000000000";
      const member = await prisma.user.create({
        data: {
          name: "Membre AN-02",
          email: "an02-baseline@example.com",
          passwordHash,
        },
      });
      const book = await prisma.book.create({
        data: { title: "Livre AN-02", author: "Auteur AN-02" },
      });
      await prisma.loan.create({
        data: { userId: member.id, bookId: book.id },
      });

      await expect(prisma.book.delete({ where: { id: book.id } })).rejects.toThrow();
    } finally {
      await prisma.$disconnect();
    }
  });
});
