import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Email invalide."),
  password: z.string().min(1, "Mot de passe requis."),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères."),
  email: z.string().trim().email("Email invalide."),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères."),
});

export const bookQuerySchema = z.object({
  q: z.string().trim().max(100).optional().default(""),
});

export const createBookSchema = z.object({
  title: z.string().trim().min(1, "Titre requis."),
  author: z.string().trim().min(1, "Auteur requis."),
  isbn: z.string().trim().max(100).optional().or(z.literal("")),
  totalCopies: z.coerce
    .number()
    .int()
    .positive("Le nombre d'exemplaires doit être supérieur à 0."),
});

export const updateBookSchema = z.object({
  title: z.string().trim().min(1, "Titre requis."),
  author: z.string().trim().min(1, "Auteur requis."),
  isbn: z.string().trim().max(100).optional().or(z.literal("")),
  totalCopies: z.coerce
    .number()
    .int()
    .positive("Le nombre d'exemplaires doit être supérieur à 0."),
});

export const borrowSchema = z.object({
  bookId: z.string().trim().min(1, "Livre requis."),
});

export const adminLoanQuerySchema = z.object({
  filter: z.enum(["all", "active", "late", "returned"]).default("all"),
  search: z.string().trim().max(100).optional().default(""),
});

export const idParamSchema = z.object({
  id: z.string().trim().min(1, "Identifiant requis."),
});
