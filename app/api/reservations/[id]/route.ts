import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { cancelReservation } from "@/lib/reservations";
import { idParamSchema } from "@/lib/validation";

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    const parsed = idParamSchema.safeParse(await context.params);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Identifiant requis." },
        { status: 400 },
      );

    const reservation = await cancelReservation(session.userId, parsed.data.id);
    return NextResponse.json(reservation);
  } catch (error) {
    if (error instanceof Error && error.message === "RESERVATION_NOT_FOUND")
      return NextResponse.json(
        { error: "Réservation introuvable." },
        { status: 404 },
      );
    return NextResponse.json(
      { error: "Authentification requise." },
      { status: 401 },
    );
  }
}
