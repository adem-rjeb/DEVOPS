import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAdminLoans } from "@/lib/admin-loans";
import { adminLoanQuerySchema } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const parsed = adminLoanQuerySchema.safeParse({
      filter: url.searchParams.get("filter") ?? "all",
      search: url.searchParams.get("search") ?? "",
    });
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Filtres invalides." },
        { status: 400 },
      );

    return NextResponse.json(
      await getAdminLoans(parsed.data.filter, parsed.data.search),
    );
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN")
      return NextResponse.json(
        { error: "Droits administrateur requis." },
        { status: 403 },
      );
    return NextResponse.json(
      { error: "Authentification requise." },
      { status: 401 },
    );
  }
}
