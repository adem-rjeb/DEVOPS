import { prisma } from "@/lib/prisma";

export function assertStockWithinBounds(
  availableCopies: number,
  totalCopies: number,
) {
  if (
    !Number.isInteger(availableCopies) ||
    !Number.isInteger(totalCopies) ||
    totalCopies < 1
  )
    throw new Error("INVALID_STOCK");
  if (availableCopies < 0 || availableCopies > totalCopies)
    throw new Error("INVALID_STOCK");
  return availableCopies;
}

export function assertBookCanBeDeleted(activeLoanCount: number) {
  if (activeLoanCount > 0) throw new Error("BOOK_HAS_ACTIVE_LOANS");
}

export async function deleteBook(bookId: string) {
  return prisma.$transaction(async (tx) => {
    const activeLoanCount = await tx.loan.count({
      where: { bookId, returnedAt: null },
    });
    assertBookCanBeDeleted(activeLoanCount);
    return tx.book.delete({ where: { id: bookId } });
  });
}

export async function updateBookStock(
  bookId: string,
  data: {
    title: string;
    author: string;
    isbn: string | null;
    totalCopies: number;
  },
) {
  return prisma.$transaction(async (tx) => {
    const book = await tx.book.findUnique({ where: { id: bookId } });
    if (!book) throw new Error("BOOK_NOT_FOUND");

    const borrowedCopies = await tx.loan.count({
      where: { bookId, returnedAt: null },
    });
    if (data.totalCopies < borrowedCopies) throw new Error("TOO_FEW_COPIES");

    const availableCopies = assertStockWithinBounds(
      data.totalCopies - borrowedCopies,
      data.totalCopies,
    );

    return tx.book.update({
      where: { id: bookId },
      data: {
        title: data.title,
        author: data.author,
        isbn: data.isbn,
        totalCopies: data.totalCopies,
        availableCopies,
      },
    });
  });
}
