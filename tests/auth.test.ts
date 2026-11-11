import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth";

describe("authentification", () => {
  it("hashes passwords instead of storing plaintext", async () => {
    const hash = await hashPassword("mot-de-passe");
    expect(hash).not.toBe("mot-de-passe");
    expect(await verifyPassword("mot-de-passe", hash)).toBe(true);
  });
  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("secret-correct");
    expect(await verifyPassword("secret-faux", hash)).toBe(false);
  });
});
