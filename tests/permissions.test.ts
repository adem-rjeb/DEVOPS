import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireSession: vi.fn(),
  borrowBook: vi.fn(),
  returnBook: vi.fn(),
  renewLoan: vi.fn(),
  logAudit: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireSession: mocks.requireSession }));
vi.mock("@/lib/loans", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/loans")>();
  return {
    ...original,
    borrowBook: mocks.borrowBook,
    returnBook: mocks.returnBook,
  };
});
vi.mock("@/lib/logger", () => ({ logAudit: mocks.logAudit }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    loan: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

import { POST } from "@/app/api/loans/route";
import { PATCH } from "@/app/api/loans/[id]/route";
import { POST as renewLoan } from "@/app/api/loans/[id]/renew/route";

describe("permissions des emprunts", () => {
  it("refuse un emprunt pour un administrateur", async () => {
    mocks.requireSession.mockResolvedValueOnce({
      userId: "admin",
      role: "ADMIN",
      name: "Admin",
    });
    mocks.borrowBook.mockRejectedValueOnce(new Error("ADMIN_CANNOT_BORROW"));

    const response = await POST(
      new Request("http://localhost/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: "book-1" }),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("refuse qu'un membre retourne le prêt d'un autre membre", async () => {
    mocks.requireSession.mockResolvedValueOnce({
      userId: "member-b",
      role: "MEMBRE",
      name: "Membre B",
    });
    mocks.returnBook.mockRejectedValueOnce(new Error("LOAN_NOT_FOUND"));

    const response = await PATCH(
      new Request("http://localhost/api/loans/loan-a", { method: "PATCH" }),
      { params: Promise.resolve({ id: "loan-a" }) },
    );

    expect(response.status).toBe(404);
  });

  it("refuse la prolongation d'un prêt en retard", async () => {
    mocks.requireSession.mockResolvedValueOnce({
      userId: "member-a",
      role: "MEMBRE",
      name: "Membre A",
    });
    mocks.renewLoan.mockRejectedValueOnce(new Error("LOAN_IS_LATE"));

    const response = await renewLoan(
      new Request("http://localhost/api/loans/loan-a/renew", {
        method: "POST",
      }),
      { params: Promise.resolve({ id: "loan-a" }) },
    );

    expect(response.status).toBe(403);
  });

  it("autorise un administrateur à retourner un prêt", async () => {
    mocks.requireSession.mockResolvedValueOnce({
      userId: "admin",
      role: "ADMIN",
      name: "Admin",
    });
    mocks.returnBook.mockResolvedValueOnce({ id: "loan-a" });

    const response = await PATCH(
      new Request("http://localhost/api/loans/loan-a", { method: "PATCH" }),
      { params: Promise.resolve({ id: "loan-a" }) },
    );

    expect(response.status).toBe(200);
  });
});
