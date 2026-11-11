import { NextResponse } from "next/server";
import { createSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { name, email, password } = await request.json();
  if (typeof name !== "string" || name.length < 2 || typeof email !== "string" || typeof password !== "string" || password.length < 8)
    return NextResponse.json({ error: "Nom, email et mot de passe valide requis." }, { status: 400 });
  try {
    const user = await prisma.user.create({ data: { name: name.trim(), email: email.toLowerCase().trim(), passwordHash: await hashPassword(password) } });
    await createSession({ userId: user.id, role: user.role, name: user.name });
    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 });
  }
}
