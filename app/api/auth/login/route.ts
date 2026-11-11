import { NextResponse } from "next/server";
import { authenticate, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  if (typeof email !== "string" || typeof password !== "string")
    return NextResponse.json(
      { error: "Identifiants invalides." },
      { status: 400 },
    );
  const session = await authenticate(email, password);
  if (!session)
    return NextResponse.json(
      { error: "Email ou mot de passe incorrect." },
      { status: 401 },
    );
  await createSession(session);
  return NextResponse.json({ ok: true });
}
