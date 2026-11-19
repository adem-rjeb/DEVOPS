import { prisma } from "@/lib/prisma";
import { getLoanStatus } from "@/lib/loans";

export async function getAdminStats() {
  const [totalBooks, copies, loans] = await Promise.all([
    prisma.book.count(),
    prisma.book.aggregate({ _sum: { totalCopies: true } }),
    prisma.loan.findMany({
      select: {
        bookId: true,
        dueDate: true,
        borrowedAt: true,
        returnedAt: true,
        book: { select: { title: true, author: true } },
      },
    }),
  ]);

  const activeLoans = loans.filter((loan) => !loan.returnedAt);
  const lateLoans = activeLoans.filter(
    (loan) => getLoanStatus(loan) === "LATE",
  );
  const borrowedCounts = new Map<
    string,
    { bookId: string; title: string; author: string; count: number }
  >();
  for (const loan of loans) {
    const current = borrowedCounts.get(loan.bookId);
    borrowedCounts.set(loan.bookId, {
      bookId: loan.bookId,
      title: loan.book.title,
      author: loan.book.author,
      count: (current?.count ?? 0) + 1,
    });
  }

  return {
    totalBooks,
    totalCopies: copies._sum.totalCopies ?? 0,
    activeLoans: activeLoans.length,
    lateLoans: lateLoans.length,
    mostBorrowedBooks: [...borrowedCounts.values()]
      .sort((first, second) => second.count - first.count)
      .slice(0, 5),
  };
}
