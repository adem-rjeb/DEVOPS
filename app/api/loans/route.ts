import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { borrowBook } from "@/lib/loans";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await requireSession();
    return NextResponse.json(await prisma.loan.findMany({ where: { userId: session.userId }, include: { book: true }, orderBy: { borrowedAt: "desc" } }));
  } catch {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }
}
export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const { bookId } = await request.json();
    const loan = await borrowBook(session.userId, bookId);
    return NextResponse.json(loan, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const errors: Record<string, string> = { BOOK_UNAVAILABLE: "Ce livre est déjà emprunté.", LOAN_LIMIT: "Un membre ne peut pas dépasser 3 emprunts." };
    return NextResponse.json({ error: errors[message] ?? "Emprunt impossible." }, { status: message === "UNAUTHORIZED" ? 401 : 409 });
  }
}
