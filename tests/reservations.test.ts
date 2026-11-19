import { describe, expect, it } from "vitest";
import {
  RESERVATION_READY_HOURS,
  assertReservationAllowed,
  calculateReadyUntil,
} from "@/lib/reservations";

describe("réservations", () => {
  it("prévoit une fenêtre READY de 48 heures", () => {
    const now = new Date("2026-11-19T12:00:00.000Z");
    expect(calculateReadyUntil(now)).toEqual(
      new Date("2026-11-21T12:00:00.000Z"),
    );
    expect(RESERVATION_READY_HOURS).toBe(48);
  });

  it("refuse une réservation si le livre est disponible", () => {
    expect(() => assertReservationAllowed(1, false, "MEMBRE")).toThrow(
      "BOOK_AVAILABLE",
    );
  });

  it("refuse une réservation pour un administrateur", () => {
    expect(() => assertReservationAllowed(0, false, "ADMIN")).toThrow(
      "ONLY_MEMBERS_CAN_RESERVE",
    );
  });

  it("refuse une seconde réservation active du même livre", () => {
    expect(() => assertReservationAllowed(0, true, "MEMBRE")).toThrow(
      "RESERVATION_EXISTS",
    );
  });

  it("autorise une réservation valide", () => {
    expect(() => assertReservationAllowed(0, false, "MEMBRE")).not.toThrow();
  });
});
