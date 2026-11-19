import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  requireSession: vi
    .fn()
    .mockResolvedValue({ userId: "u", role: "MEMBRE", name: "A" }),
  requireAdmin: vi.fn().mockRejectedValue(new Error("FORBIDDEN")),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    book: {
      findMany: vi
        .fn()
        .mockResolvedValue([
          { id: "1", title: "Dune", author: "Frank Herbert" },
        ]),
    },
  },
}));
import { GET } from "@/app/api/books/route";

describe("livres", () => {
  it("recherche par titre ou auteur", async () => {
    const response = await GET(
      new Request("http://localhost/api/books?q=dune"),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toHaveLength(1);
  });
  it("protège la création contre un membre", async () => {
    const { POST } = await import("@/app/api/books/route");
    const response = await POST(
      new Request("http://localhost/api/books", {
        method: "POST",
        body: JSON.stringify({ title: "Dune", author: "A", totalCopies: 1 }),
      }),
    );
    expect(response.status).toBe(403);
  });
  it("protège la modification contre un membre", async () => {
    const { PUT } = await import("@/app/api/books/[id]/route");
    const response = await PUT(
      new Request("http://localhost/api/books/1", {
        method: "PUT",
        body: JSON.stringify({ title: "Dune", author: "A", totalCopies: 1 }),
      }),
      { params: Promise.resolve({ id: "1" }) },
    );
    expect(response.status).toBe(403);
  });
  it("protège la suppression contre un membre", async () => {
    const { DELETE } = await import("@/app/api/books/[id]/route");
    const response = await DELETE(
      new Request("http://localhost/api/books/1", { method: "DELETE" }),
      { params: Promise.resolve({ id: "1" }) },
    );
    expect(response.status).toBe(403);
  });
});
