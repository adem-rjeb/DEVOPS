import { prisma } from "@/lib/prisma";
import { getLoanStatus, type LoanStatus } from "@/lib/loans";

export type AdminLoanFilter = "all" | "active" | "late" | "returned";

export async function getAdminLoans(filter: AdminLoanFilter, search: string) {
  const loans = await prisma.loan.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      book: { select: { id: true, title: true, author: true } },
    },
    orderBy: { borrowedAt: "desc" },
  });

  const normalizedSearch = search.trim().toLowerCase();
  const enriched = loans.map((loan) => ({
    ...loan,
    status: getLoanStatus(loan),
  }));

  return enriched.filter((loan) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "returned" && loan.status === "RETURNED") ||
      (filter === "active" && loan.status === "ACTIVE") ||
      (filter === "late" && loan.status === "LATE");

    if (!matchesFilter) return false;
    if (!normalizedSearch) return true;

    return (
      loan.user.name.toLowerCase().includes(normalizedSearch) ||
      loan.user.email.toLowerCase().includes(normalizedSearch) ||
      loan.book.title.toLowerCase().includes(normalizedSearch)
    );
  }) as Array<(typeof enriched)[number] & { status: LoanStatus }>;
}
