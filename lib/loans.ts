import { prisma } from "@/lib/prisma";

export function assertBorrowAllowed(hasActiveBookLoan: boolean, activeMemberLoans: number) {
  if (hasActiveBookLoan) throw new Error("BOOK_UNAVAILABLE");
  if (activeMemberLoans >= 3) throw new Error("LOAN_LIMIT");
}

export async function borrowBook(userId: string, bookId: string) {
  return prisma.$transaction(async (tx) => {
    const [activeBookLoan, activeMemberLoans] = await Promise.all([
      tx.loan.findFirst({ where: { bookId, returnedAt: null } }),
      tx.loan.count({ where: { userId, returnedAt: null } }),
    ]);
    assertBorrowAllowed(Boolean(activeBookLoan), activeMemberLoans);
    return tx.loan.create({ data: { userId, bookId } });
  });
}
