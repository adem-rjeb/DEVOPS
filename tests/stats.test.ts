import { describe, expect, it, vi } from "vitest";

const { requireAdmin } = vi.hoisted(() => ({ requireAdmin: vi.fn() }));

vi.mock("@/lib/auth", () => ({ requireAdmin }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    book: {
      count: vi.fn().mockResolvedValue(2),
      aggregate: vi.fn().mockResolvedValue({ _sum: { totalCopies: 4 } }),
    },
    loan: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

import { GET } from "@/app/api/stats/route";

describe("statistiques administrateur", () => {
  it("refuse l'accès à un membre", async () => {
    requireAdmin.mockRejectedValueOnce(new Error("FORBIDDEN"));
    const response = await GET();
    expect(response.status).toBe(403);
  });

  it("autorise un administrateur", async () => {
    requireAdmin.mockResolvedValueOnce({ userId: "admin", role: "ADMIN" });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      totalBooks: 2,
      totalCopies: 4,
      activeLoans: 0,
      lateLoans: 0,
    });
  });
});
