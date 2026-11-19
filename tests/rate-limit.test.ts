import { describe, expect, it, beforeEach } from "vitest";
import {
  checkLoginRateLimit,
  resetLoginRateLimit,
  LOGIN_RATE_LIMIT,
  LOGIN_WINDOW_MS,
} from "@/lib/rate-limit";

beforeEach(() => resetLoginRateLimit());

describe("limitation des tentatives de connexion", () => {
  it("autorise jusqu'à 5 tentatives", () => {
    const now = 1_000_000;
    for (let index = 0; index < LOGIN_RATE_LIMIT; index++) {
      expect(
        checkLoginRateLimit(
          "client:user",
          now + index,
          LOGIN_RATE_LIMIT,
          LOGIN_WINDOW_MS,
        ).allowed,
      ).toBe(true);
    }
  });

  it("bloque la sixième tentative", () => {
    const now = 2_000_000;
    for (let index = 0; index < LOGIN_RATE_LIMIT; index++) {
      checkLoginRateLimit(
        "client:user",
        now + index,
        LOGIN_RATE_LIMIT,
        LOGIN_WINDOW_MS,
      );
    }
    expect(
      checkLoginRateLimit(
        "client:user",
        now + 5,
        LOGIN_RATE_LIMIT,
        LOGIN_WINDOW_MS,
      ).allowed,
    ).toBe(false);
  });

  it("réinitialise après la fenêtre", () => {
    const now = 3_000_000;
    for (let index = 0; index < LOGIN_RATE_LIMIT; index++) {
      checkLoginRateLimit(
        "client:user",
        now + index,
        LOGIN_RATE_LIMIT,
        LOGIN_WINDOW_MS,
      );
    }
    expect(
      checkLoginRateLimit(
        "client:user",
        now + LOGIN_WINDOW_MS + 100,
        LOGIN_RATE_LIMIT,
        LOGIN_WINDOW_MS,
      ).allowed,
    ).toBe(true);
  });
});
