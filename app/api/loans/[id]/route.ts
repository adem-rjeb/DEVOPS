import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { logAudit } from "@/lib/logger";
import { returnBook } from "@/lib/loans";
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
        { error: "Identifiant requis." },
        { status: 400 },
      );
    const { id } = parsed.data;
    await returnBook(session.userId, session.role, id);
    logAudit(session.userId, "RETURN", id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "LOAN_NOT_FOUND")
      return NextResponse.json(
        {
          error:
            "Emprunt introuvable ou vous n'êtes pas autorisé à le retourner.",
        },
        { status: 404 },
      );
    return NextResponse.json(
      { error: "Authentification requise." },
      { status: 401 },
    );
  }
}
