import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const RESERVATION_READY_HOURS = 48;

export function calculateReadyUntil(now = new Date()) {
  const readyUntil = new Date(now);
  readyUntil.setHours(readyUntil.getHours() + RESERVATION_READY_HOURS);
  return readyUntil;
}

export function assertReservationAllowed(
  availableCopies: number,
  activeReservationExists: boolean,
  role: "ADMIN" | "MEMBRE",
) {
  if (role !== "MEMBRE") throw new Error("ONLY_MEMBERS_CAN_RESERVE");
  if (availableCopies > 0) throw new Error("BOOK_AVAILABLE");
  if (activeReservationExists) throw new Error("RESERVATION_EXISTS");
}

export async function createReservation(userId: string, bookId: string) {
  return prisma.$transaction(async (tx) => {
    const [user, book, activeReservation] = await Promise.all([
      tx.user.findUnique({ where: { id: userId }, select: { role: true } }),
      tx.book.findUnique({ where: { id: bookId } }),
      tx.reservation.findFirst({
        where: {
          userId,
          bookId,
          status: { in: ["WAITING", "READY"] },
        },
        select: { id: true },
      }),
    ]);

    if (!user) throw new Error("USER_NOT_FOUND");
    if (!book) throw new Error("BOOK_NOT_FOUND");
    assertReservationAllowed(
      book.availableCopies,
      Boolean(activeReservation),
      user.role,
    );

    return tx.reservation.create({
      data: { userId, bookId, status: "WAITING" },
    });
  });
}

export async function cancelReservation(userId: string, reservationId: string) {
  return prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findFirst({
      where: {
        id: reservationId,
        userId,
        status: { in: ["WAITING", "READY"] },
      },
    });
    if (!reservation) throw new Error("RESERVATION_NOT_FOUND");

    const cancelled = await tx.reservation.update({
      where: { id: reservation.id },
      data: { status: "CANCELLED", readyUntil: null },
    });

    if (reservation.status === "READY") {
      await promoteNextReservation(tx, reservation.bookId);
    }

    return cancelled;
  });
}

export async function promoteNextReservation(
  tx: Prisma.TransactionClient,
  bookId: string,
) {
  const now = new Date();

  await tx.reservation.updateMany({
    where: {
      bookId,
      status: "READY",
      readyUntil: { lt: now },
    },
    data: { status: "CANCELLED", readyUntil: null },
  });

  const existingReady = await tx.reservation.findFirst({
    where: {
      bookId,
      status: "READY",
      readyUntil: { gt: now },
    },
  });
  if (existingReady) return existingReady;

  const nextWaiting = await tx.reservation.findFirst({
    where: { bookId, status: "WAITING" },
    orderBy: { createdAt: "asc" },
  });
  if (!nextWaiting) return null;

  return tx.reservation.update({
    where: { id: nextWaiting.id },
    data: { status: "READY", readyUntil: calculateReadyUntil(now) },
  });
}
