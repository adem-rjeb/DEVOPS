import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  await prisma.$transaction(async (tx) => {
    const adminLoans = await tx.loan.findMany({
      where: { user: { role: "ADMIN" } },
      select: { bookId: true },
    });

    if (adminLoans.length === 0) {
      console.log("Aucun prêt administrateur trouvé.");
      return;
    }

    const bookIds = [...new Set(adminLoans.map((loan) => loan.bookId))];
    await tx.loan.deleteMany({
      where: { user: { role: "ADMIN" } },
    });

    for (const bookId of bookIds) {
      const book = await tx.book.findUnique({ where: { id: bookId } });
      if (!book) continue;
      const activeLoans = await tx.loan.count({
        where: { bookId, returnedAt: null },
      });
      await tx.book.update({
        where: { id: bookId },
        data: {
          availableCopies: Math.max(
            0,
            Math.min(book.totalCopies - activeLoans, book.totalCopies),
          ),
        },
      });
    }

    console.log(`${adminLoans.length} prêt(s) administrateur supprimé(s).`);
  });
} finally {
  await prisma.$disconnect();
}
