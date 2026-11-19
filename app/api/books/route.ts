import { NextResponse } from "next/server";
import { requireAdmin, requireSession } from "@/lib/auth";
import { logAudit } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { bookQuerySchema, createBookSchema } from "@/lib/validation";

export async function GET(request: Request) {
  await requireSession();
  const parsedQuery = bookQuerySchema.safeParse({
    q: new URL(request.url).searchParams.get("q")?.trim() ?? "",
  });
  if (!parsedQuery.success)
    return NextResponse.json(
      { error: parsedQuery.error.issues[0]?.message ?? "Recherche invalide." },
      { status: 400 },
    );
  const q = parsedQuery.data.q;
  return NextResponse.json(
    await prisma.book.findMany({
      where: q
        ? { OR: [{ title: { contains: q } }, { author: { contains: q } }] }
        : undefined,
      orderBy: { title: "asc" },
    }),
  );
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const body = await request.json().catch(() => null);
    const parsed = createBookSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Livre invalide." },
        { status: 400 },
      );
    const { title, author, isbn, totalCopies: copies } = parsed.data;
    const book = await prisma.book.create({
      data: {
        title: title.trim(),
        author: author.trim(),
        isbn: typeof isbn === "string" && isbn.trim() ? isbn.trim() : null,
        totalCopies: copies,
        availableCopies: copies,
      },
    });
    logAudit(session.userId, "CREATE_BOOK", book.id);
    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED")
      return NextResponse.json(
        { error: "Authentification requise." },
        { status: 401 },
      );
    if (error instanceof Error && error.message === "FORBIDDEN")
      return NextResponse.json(
        { error: "Droits administrateur requis." },
        { status: 403 },
      );
    return NextResponse.json(
      { error: "Impossible de créer le livre." },
      { status: 409 },
    );
  }
}
