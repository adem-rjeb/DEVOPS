import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Motdepasse1!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@bibliotheque.local" },
    update: { role: "ADMIN", name: "Adèle Admin", passwordHash },
    create: {
      name: "Adèle Admin",
      email: "admin@bibliotheque.local",
      passwordHash,
      role: "ADMIN",
    },
  });

  const members = await Promise.all([
    prisma.user.upsert({
      where: { email: "alice@bibliotheque.local" },
      update: { role: "MEMBRE", name: "Alice Martin", passwordHash },
      create: {
        name: "Alice Martin",
        email: "alice@bibliotheque.local",
        passwordHash,
        role: "MEMBRE",
      },
    }),
    prisma.user.upsert({
      where: { email: "bruno@bibliotheque.local" },
      update: { role: "MEMBRE", name: "Bruno Leroy", passwordHash },
      create: {
        name: "Bruno Leroy",
        email: "bruno@bibliotheque.local",
        passwordHash,
        role: "MEMBRE",
      },
    }),
    prisma.user.upsert({
      where: { email: "camille@bibliotheque.local" },
      update: { role: "MEMBRE", name: "Camille Roy", passwordHash },
      create: {
        name: "Camille Roy",
        email: "camille@bibliotheque.local",
        passwordHash,
        role: "MEMBRE",
      },
    }),
  ]);

  const bookData = [
    ["Le Petit Prince", "Antoine de Saint-Exupéry"],
    ["Les Misérables", "Victor Hugo"],
    ["L'Étranger", "Albert Camus"],
    ["Dune", "Frank Herbert"],
    ["1984", "George Orwell"],
    ["Le Seigneur des Anneaux", "J. R. R. Tolkien"],
    ["Orgueil et Préjugés", "Jane Austen"],
    ["Le Vieil Homme et la Mer", "Ernest Hemingway"],
    ["La Peste", "Albert Camus"],
    ["Fahrenheit 451", "Ray Bradbury"],
  ] as const;

  const books = [];
  for (const [title, author] of bookData) {
    const existing = await prisma.book.findFirst({ where: { title } });
    books.push(
      existing
        ? await prisma.book.update({
            where: { id: existing.id },
            data: { author, totalCopies: 1 },
          })
        : await prisma.book.create({
            data: { title, author, totalCopies: 1, availableCopies: 1 },
          }),
    );
  }

  await prisma.reservation.deleteMany({
    where: {
      userId: { in: [admin.id, ...members.map((member) => member.id)] },
    },
  });
  await prisma.loan.deleteMany({
    where: {
      userId: { in: [admin.id, ...members.map((member) => member.id)] },
    },
  });

  const now = new Date();
  const overdueDueDate = new Date(now);
  overdueDueDate.setDate(overdueDueDate.getDate() - 5);

  await prisma.loan.create({
    data: {
      userId: members[0].id,
      bookId: books[0].id,
      borrowedAt: new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000),
      dueDate: overdueDueDate,
    },
  });
  await prisma.loan.create({
    data: {
      userId: members[1].id,
      bookId: books[1].id,
      borrowedAt: now,
      dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  for (const book of books) {
    const activeLoans = await prisma.loan.count({
      where: { bookId: book.id, returnedAt: null },
    });
    await prisma.book.update({
      where: { id: book.id },
      data: {
        availableCopies: Math.max(0, book.totalCopies - activeLoans),
      },
    });
  }

  console.log("Seed Bibliothèque terminé: 1 admin, 3 membres, 10 livres.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
