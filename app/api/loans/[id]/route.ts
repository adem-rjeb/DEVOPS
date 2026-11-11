import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await context.params;
    const loan = await prisma.loan.updateMany({ where: { id, userId: session.userId, returnedAt: null }, data: { returnedAt: new Date() } });
    if (!loan.count) return NextResponse.json({ error: "Emprunt introuvable." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }
}
