import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/logger";
import { deleteBook, updateBookStock } from "@/lib/books";
import { idParamSchema, updateBookSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };
export async function PUT(request: Request, context: Context) {
  try {
    const session = await requireAdmin();
    const params = idParamSchema.safeParse(await context.params);
    if (!params.success)
      return NextResponse.json(
        { error: params.error.issues[0]?.message ?? "Identifiant requis." },
        { status: 400 },
      );
    const body = await request.json().catch(() => null);
    const parsed = updateBookSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Livre invalide." },
        { status: 400 },
      );
    const { id } = params.data;
    const { title, author, isbn, totalCopies } = parsed.data;
    const book = await updateBookStock(id, {
      title,
      author,
      isbn: isbn || null,
      totalCopies,
    });
    logAudit(session.userId, "UPDATE_BOOK", book.id);
    return NextResponse.json(book);
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN")
      return NextResponse.json(
        { error: "Droits administrateur requis." },
        { status: 403 },
      );
    if (error instanceof Error && error.message === "BOOK_NOT_FOUND")
      return NextResponse.json(
        { error: "Livre introuvable." },
        { status: 404 },
      );
    if (error instanceof Error && error.message === "TOO_FEW_COPIES")
      return NextResponse.json(
        {
          error:
            "Le nombre d'exemplaires ne peut pas être inférieur aux emprunts en cours.",
        },
        { status: 409 },
      );
    return NextResponse.json(
      { error: "Modification impossible." },
      { status: 400 },
    );
  }
}
export async function DELETE(_request: Request, context: Context) {
  try {
    const session = await requireAdmin();
    const params = idParamSchema.safeParse(await context.params);
    if (!params.success)
      return NextResponse.json(
        { error: params.error.issues[0]?.message ?? "Identifiant requis." },
        { status: 400 },
      );
    const { id } = params.data;
    await deleteBook(id);
    logAudit(session.userId, "DELETE_BOOK", id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN")
      return NextResponse.json(
        { error: "Droits administrateur requis." },
        { status: 403 },
      );
    if (error instanceof Error && error.message === "BOOK_HAS_ACTIVE_LOANS")
      return NextResponse.json(
        { error: "Impossible de supprimer un livre avec des emprunts actifs." },
        { status: 409 },
      );
    return NextResponse.json(
      { error: "Suppression impossible." },
      { status: 404 },
    );
  }
}
