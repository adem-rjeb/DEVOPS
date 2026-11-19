import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { renewLoan } from "@/lib/loans";
import { idParamSchema } from "@/lib/validation";

export async function POST(
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

    const loan = await renewLoan(session.userId, session.role, parsed.data.id);
    return NextResponse.json(loan);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const errors: Record<string, string> = {
      LOAN_NOT_FOUND:
        "Emprunt introuvable ou vous n'êtes pas autorisé à le prolonger.",
      LOAN_ALREADY_RETURNED: "Ce prêt a déjà été retourné.",
      LOAN_IS_LATE: "Un prêt en retard ne peut pas être prolongé.",
      MAX_RENEWALS_REACHED:
        "Ce prêt a déjà atteint les 2 prolongations maximum.",
    };
    const status =
      message === "UNAUTHORIZED"
        ? 401
        : message === "LOAN_NOT_FOUND"
          ? 404
          : 403;
    return NextResponse.json(
      { error: errors[message] ?? "Prolongation impossible." },
      { status },
    );
  }
}
