import { prisma } from "@/lib/prisma";
import { promoteNextReservation } from "@/lib/reservations";

export const LOAN_DURATION_DAYS = 14;
export const RENEWAL_DURATION_DAYS = 7;
export const MAX_RENEWALS = 2;
export type LoanStatus = "ACTIVE" | "LATE" | "RETURNED";

export function calculateDueDate(borrowedAt: Date) {
  const dueDate = new Date(borrowedAt);
  dueDate.setDate(dueDate.getDate() + LOAN_DURATION_DAYS);
  return dueDate;
}

export function getLoanStatus(
  loan: {
    borrowedAt: Date;
    dueDate?: Date | null;
    returnedAt: Date | null;
  },
  now = new Date(),
): LoanStatus {
  if (loan.returnedAt) return "RETURNED";
  const dueDate = loan.dueDate ?? calculateDueDate(loan.borrowedAt);
  return dueDate < now ? "LATE" : "ACTIVE";
}

export function increaseAvailableCopies(
  availableCopies: number,
  totalCopies: number,
) {
  return Math.min(availableCopies + 1, totalCopies);
}

export function calculateAvailableCopies(
  totalCopies: number,
  availableCopies: number,
  nextTotalCopies: number,
) {
  const borrowedCopies = totalCopies - availableCopies;
  if (nextTotalCopies < borrowedCopies) throw new Error("TOO_FEW_COPIES");
  return nextTotalCopies - borrowedCopies;
}

export function assertBorrowAllowed(
  hasActiveBookLoan: boolean,
  activeMemberLoans: number,
  hasLateLoan = false,
  availableCopies = 1,
  role: "ADMIN" | "MEMBRE" = "MEMBRE",
  reservedForAnother = false,
) {
  if (role === "ADMIN") throw new Error("ADMIN_CANNOT_BORROW");
  if (reservedForAnother) throw new Error("RESERVED_FOR_ANOTHER");
  if (hasActiveBookLoan) throw new Error("BOOK_UNAVAILABLE");
  if (hasLateLoan) throw new Error("LATE_LOAN");
  if (activeMemberLoans >= 3) throw new Error("LOAN_LIMIT");
  if (availableCopies <= 0) throw new Error("NO_AVAILABLE_COPIES");
}

export async function borrowBook(userId: string, bookId: string) {
  return prisma.$transaction(async (tx) => {
    await promoteNextReservation(tx, bookId);
    const [
      user,
      book,
      activeMemberLoans,
      activeCopyLoan,
      memberLoans,
      readyReservation,
    ] = await Promise.all([
      tx.user.findUnique({ where: { id: userId }, select: { role: true } }),
      tx.book.findUnique({ where: { id: bookId } }),
      tx.loan.count({ where: { userId, returnedAt: null } }),
      tx.loan.findFirst({
        where: { userId, bookId, returnedAt: null },
        select: { id: true },
      }),
      tx.loan.findMany({
        where: { userId, returnedAt: null },
        select: { borrowedAt: true, dueDate: true, returnedAt: true },
      }),
      tx.reservation.findFirst({
        where: {
          bookId,
          status: "READY",
          readyUntil: { gt: new Date() },
        },
        select: { id: true, userId: true },
      }),
    ]);
    if (!user) throw new Error("USER_NOT_FOUND");
    if (!book) throw new Error("BOOK_NOT_FOUND");
    const hasLateLoan = memberLoans.some(
      (loan) => getLoanStatus(loan) === "LATE",
    );
    assertBorrowAllowed(
      Boolean(activeCopyLoan),
      activeMemberLoans,
      hasLateLoan,
      book.availableCopies,
      user.role,
      Boolean(readyReservation && readyReservation.userId !== userId),
    );
    const updated = await tx.book.updateMany({
      where: { id: bookId, availableCopies: { gt: 0 } },
      data: { availableCopies: { decrement: 1 } },
    });
    if (!updated.count) throw new Error("NO_AVAILABLE_COPIES");
    const borrowedAt = new Date();
    const loan = await tx.loan.create({
      data: {
        userId,
        bookId,
        borrowedAt,
        dueDate: calculateDueDate(borrowedAt),
      },
    });

    if (readyReservation?.userId === userId) {
      await tx.reservation.update({
        where: { id: readyReservation.id },
        data: { status: "FULFILLED", readyUntil: null },
      });
    }

    return loan;
  });
}

export function assertReturnAllowed(
  borrowerId: string,
  currentUserId: string,
  role: "ADMIN" | "MEMBRE",
) {
  if (role !== "ADMIN" && borrowerId !== currentUserId)
    throw new Error("LOAN_NOT_FOUND");
}

export function calculateRenewedDueDate(dueDate: Date) {
  const renewedDueDate = new Date(dueDate);
  renewedDueDate.setDate(renewedDueDate.getDate() + RENEWAL_DURATION_DAYS);
  return renewedDueDate;
}

export function assertRenewAllowed(
  returnedAt: Date | null,
  dueDate: Date,
  renewCount: number,
  now = new Date(),
) {
  if (returnedAt) throw new Error("LOAN_ALREADY_RETURNED");
  if (dueDate < now) throw new Error("LOAN_IS_LATE");
  if (renewCount >= MAX_RENEWALS) throw new Error("MAX_RENEWALS_REACHED");
}

export async function renewLoan(
  userId: string,
  role: "ADMIN" | "MEMBRE",
  loanId: string,
) {
  return prisma.$transaction(async (tx) => {
    const loan = await tx.loan.findFirst({
      where:
        role === "ADMIN"
          ? { id: loanId, returnedAt: null }
          : { id: loanId, userId, returnedAt: null },
      select: {
        id: true,
        userId: true,
        dueDate: true,
        renewCount: true,
        returnedAt: true,
      },
    });
    if (!loan) throw new Error("LOAN_NOT_FOUND");

    const now = new Date();
    assertRenewAllowed(loan.returnedAt, loan.dueDate, loan.renewCount, now);

    const newDueDate = calculateRenewedDueDate(loan.dueDate);

    return tx.loan.update({
      where: { id: loan.id },
      data: { dueDate: newDueDate, renewCount: { increment: 1 } },
    });
  });
}

export async function returnBook(
  userId: string,
  role: "ADMIN" | "MEMBRE",
  loanId: string,
) {
  return prisma.$transaction(async (tx) => {
    const loan = await tx.loan.findFirst({
      where:
        role === "ADMIN"
          ? { id: loanId, returnedAt: null }
          : { id: loanId, userId, returnedAt: null },
      include: { book: true },
    });
    if (!loan) throw new Error("LOAN_NOT_FOUND");
    assertReturnAllowed(loan.userId, userId, role);
    const returnedAt = new Date();
    await tx.loan.update({ where: { id: loanId }, data: { returnedAt } });
    const stockUpdate = await tx.book.updateMany({
      where: {
        id: loan.bookId,
        availableCopies: { lt: loan.book.totalCopies },
      },
      data: { availableCopies: { increment: 1 } },
    });
    if (!stockUpdate.count) throw new Error("INVALID_STOCK");
    await promoteNextReservation(tx, loan.bookId);
    return { ...loan, returnedAt };
  });
}
