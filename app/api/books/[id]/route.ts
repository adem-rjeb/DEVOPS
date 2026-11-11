import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };
export async function PUT(request: Request, context: Context) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const { title, author, isbn } = await request.json();
    const book = await prisma.book.update({
      where: { id },
      data: { title, author, isbn: isbn || null },
    });
    return NextResponse.json(book);
  } catch (error) {
    const status =
      error instanceof Error && error.message === "FORBIDDEN" ? 403 : 400;
    return NextResponse.json({ error: "Modification impossible." }, { status });
  }
}
export async function DELETE(_request: Request, context: Context) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    await prisma.book.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const status =
      error instanceof Error && error.message === "FORBIDDEN" ? 403 : 400;
    return NextResponse.json({ error: "Suppression impossible." }, { status });
  }
}
