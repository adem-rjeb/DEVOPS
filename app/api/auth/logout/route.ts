import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sessionCookieName } from "@/lib/auth";

export async function POST() {
  (await cookies()).delete(sessionCookieName);
  return NextResponse.json({ ok: true });
}
