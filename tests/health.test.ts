import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: { $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]) } }));
import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("returns application and database status", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok", database: "ok" });
  });
});
