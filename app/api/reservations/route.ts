import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createReservation } from "@/lib/reservations";
import { borrowSchema } from "@/lib/validation";

export async function GET() {
  try {
    const session = await requireSession();
    const reservations = await prisma.reservation.findMany({
      where: { userId: session.userId },
      include: { book: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(reservations);
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

    const reservation = await createReservation(
      session.userId,
      parsed.data.bookId,
    );
    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const errors: Record<string, string> = {
      ONLY_MEMBERS_CAN_RESERVE:
        "Seuls les membres peuvent réserver des livres.",
      BOOK_AVAILABLE: "Ce livre est actuellement disponible.",
      RESERVATION_EXISTS:
        "Vous avez déjà une réservation active pour ce livre.",
      BOOK_NOT_FOUND: "Livre introuvable.",
    };
    const status =
      message === "UNAUTHORIZED"
        ? 401
        : message === "ONLY_MEMBERS_CAN_RESERVE"
          ? 403
          : 409;
    return NextResponse.json(
      { error: errors[message] ?? "Réservation impossible." },
      { status },
    );
  }
}
