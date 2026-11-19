import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAdminLoans } from "@/lib/admin-loans";

function csvValue(value: string | Date) {
  const text = value instanceof Date ? value.toISOString() : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  try {
    await requireAdmin();
    const loans = await getAdminLoans("all", "");
    const rows = [
      ["Membre", "Email", "Livre", "Emprunté le", "Échéance", "Statut"],
      ...loans.map((loan) => [
        loan.user.name,
        loan.user.email,
        loan.book.title,
        loan.borrowedAt,
        loan.dueDate,
        loan.status,
      ]),
    ];

    const csv = rows
      .map((row) => row.map((value) => csvValue(value)).join(","))
      .join("\n");

    return new NextResponse(`\uFEFF${csv}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="emprunts.csv"',
      },
    });
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
