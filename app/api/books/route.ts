import { NextResponse } from "next/server";
import { requireAdmin, requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  await requireSession();
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  return NextResponse.json(await prisma.book.findMany({ where: q ? { OR: [{ title: { contains: q } }, { author: { contains: q } }] } : undefined, orderBy: { title: "asc" } }));
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { title, author, isbn } = await request.json();
    if (typeof title !== "string" || typeof author !== "string" || !title.trim() || !author.trim()) return NextResponse.json({ error: "Titre et auteur requis." }, { status: 400 });
    const book = await prisma.book.create({ data: { title: title.trim(), author: author.trim(), isbn: typeof isbn === "string" && isbn.trim() ? isbn.trim() : null } });
    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "Droits administrateur requis." }, { status: 403 });
    return NextResponse.json({ error: "Impossible de créer le livre." }, { status: 409 });
  }
}
