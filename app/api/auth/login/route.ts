import { NextResponse } from "next/server";
import { authenticate, createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { checkLoginRateLimit, loginRateLimitKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Identifiants invalides." },
      { status: 400 },
    );
  const { email, password } = parsed.data;
  const forwardedFor = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const ip = forwardedFor || request.headers.get("x-real-ip") || "unknown";
  const limit = checkLoginRateLimit(loginRateLimitKey(ip, email));
  if (!limit.allowed)
    return NextResponse.json(
      {
        error: "Trop de tentatives. Réessayez dans quelques minutes.",
        retryAfterSeconds: limit.retryAfterSeconds,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
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
