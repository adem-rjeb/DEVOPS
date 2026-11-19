import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  findMany: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    loan: {
      findMany: mocks.findMany,
    },
  },
}));

import { GET as getLoans } from "@/app/api/admin/loans/route";
import { GET as exportLoans } from "@/app/api/admin/loans/export/route";

describe("emprunts administrateur", () => {
  it("refuse l'accès à un membre", async () => {
    mocks.requireAdmin.mockRejectedValueOnce(new Error("FORBIDDEN"));
    const response = await getLoans(
      new Request("http://localhost/api/admin/loans"),
    );
    expect(response.status).toBe(403);
  });

  it("autorise un administrateur", async () => {
    mocks.requireAdmin.mockResolvedValueOnce({
      userId: "admin",
      role: "ADMIN",
      name: "Admin",
    });
    mocks.findMany.mockResolvedValueOnce([]);

    const response = await getLoans(
      new Request("http://localhost/api/admin/loans?filter=all&search="),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
  });

  it("autorise l'export CSV pour un administrateur", async () => {
    mocks.requireAdmin.mockResolvedValueOnce({
      userId: "admin",
      role: "ADMIN",
      name: "Admin",
    });
    mocks.findMany.mockResolvedValueOnce([]);

    const response = await exportLoans();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/csv");
  });
});
