import { NextResponse } from "next/server";
import { createSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ??
          "Nom, email et mot de passe valide requis.",
      },
      { status: 400 },
    );
  const { name, email, password } = parsed.data;
  try {
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash: await hashPassword(password),
      },
    });
    await createSession({ userId: user.id, role: user.role, name: user.name });
    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Cet email est déjà utilisé." },
      { status: 409 },
    );
  }
}
