import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { logAudit } from "@/lib/logger";
import { borrowBook, getLoanStatus } from "@/lib/loans";
import { prisma } from "@/lib/prisma";
import { borrowSchema } from "@/lib/validation";

export async function GET() {
  try {
    const session = await requireSession();
    const loans = await prisma.loan.findMany({
      where: { userId: session.userId },
      include: { book: true },
      orderBy: { borrowedAt: "desc" },
    });
    return NextResponse.json(
      loans.map((loan) => ({ ...loan, status: getLoanStatus(loan) })),
    );
  } catch {
    return NextResponse.json(
      { error: "Authentification requise." },
      { status: 401 },
    );
  }
}
export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json().catch(() => null);
    const parsed = borrowSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Livre requis." },
        { status: 400 },
      );
    const { bookId } = parsed.data;
    const loan = await borrowBook(session.userId, bookId);
    logAudit(session.userId, "BORROW", loan.id);
    return NextResponse.json(loan, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const errors: Record<string, string> = {
      ADMIN_CANNOT_BORROW:
        "Les administrateurs ne peuvent pas emprunter de livres.",
      BOOK_UNAVAILABLE: "Vous avez déjà emprunté ce livre.",
      NO_AVAILABLE_COPIES: "Aucun exemplaire disponible.",
      LATE_LOAN:
        "Vous devez retourner vos emprunts en retard avant d'en prendre un nouveau.",
      LOAN_LIMIT: "Un membre ne peut pas dépasser 3 emprunts.",
      BOOK_NOT_FOUND: "Livre introuvable.",
      RESERVED_FOR_ANOTHER:
        "Ce livre est réservé pour un autre membre pendant la fenêtre de 48 heures.",
    };
    const status =
      message === "UNAUTHORIZED"
        ? 401
        : message === "ADMIN_CANNOT_BORROW" || message === "LATE_LOAN"
          ? 403
          : 409;
    return NextResponse.json(
      { error: errors[message] ?? "Emprunt impossible." },
      { status },
    );
  }
}
