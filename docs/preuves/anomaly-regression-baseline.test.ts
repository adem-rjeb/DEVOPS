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

    try {
      await prisma.loan.deleteMany();
      await prisma.reservation.deleteMany();
      await prisma.book.deleteMany();
      await prisma.user.deleteMany();

      const member = await prisma.user.create({
        data: {
          name: "Membre AN-02",
          email: "an02-baseline@example.com",
          passwordHash: "test-password-hash",
        },
      });

      const book = await prisma.book.create({
        data: {
          title: "Livre AN-02",
          author: "Auteur AN-02",
        },
      });

      await prisma.loan.create({
        data: {
          userId: member.id,
          bookId: book.id,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });

      await expect(
        prisma.book.delete({
          where: { id: book.id },
        }),
      ).rejects.toThrow();
    } finally {
      await prisma.$disconnect();
    }
  });
});
