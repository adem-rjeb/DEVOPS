import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL est requis pour le seed de test.");
}
if (!databaseUrl.startsWith("file:")) {
  throw new Error("Refus: DATABASE_URL doit désigner une base SQLite locale.");
}
const normalizedUrl = databaseUrl.toLowerCase();
const isTestDatabase =
  /(^|[/_-])(test|testing|temp|tmp)([-_./]|$)/.test(normalizedUrl) ||
  normalizedUrl.includes("bibliotheque-step");
if (!isTestDatabase || normalizedUrl.includes("dev.db")) {
  throw new Error(
    "Refus: DATABASE_URL doit désigner une base explicitement nommée test/temp/tmp ou bibliotheque-step.",
  );
}

const prisma = new PrismaClient();

async function main() {
  await prisma.loan.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Motdepasse1!", 12);
  const admin = await prisma.user.create({
    data: {
      name: "Admin Test",
      email: "admin@test.local",
      passwordHash,
      role: "ADMIN",
    },
  });
  const alice = await prisma.user.create({
    data: {
      name: "Alice Test",
      email: "alice@test.local",
      passwordHash,
    },
  });
  await prisma.user.create({
    data: {
      name: "Bruno Test",
      email: "bruno@test.local",
      passwordHash,
    },
  });

  const [stock0, stock1, active, free] = await Promise.all([
    prisma.book.create({
      data: {
        title: "Stock Zéro",
        author: "Auteur Test",
        totalCopies: 1,
        availableCopies: 0,
      },
    }),
    prisma.book.create({
      data: {
        title: "Dernier Exemplaire",
        author: "Auteur Test",
        totalCopies: 1,
        availableCopies: 1,
      },
    }),
    prisma.book.create({
      data: {
        title: "Livre Actif",
        author: "Auteur Test",
        totalCopies: 1,
        availableCopies: 0,
      },
    }),
    prisma.book.create({
      data: {
        title: "Livre Libre",
        author: "Auteur Test",
        totalCopies: 2,
        availableCopies: 2,
      },
    }),
  ]);

  await prisma.loan.create({
    data: {
      userId: alice.id,
      bookId: active.id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.loan.create({
    data: {
      userId: admin.id,
      bookId: stock0.id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(
    `Seed test terminé: 2 membres, 1 admin, 4 livres, stock0=${stock0.id}, stock1=${stock1.id}, livreLibre=${free.id}.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
