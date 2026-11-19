import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAdminStats } from "@/lib/stats";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(await getAdminStats());
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
