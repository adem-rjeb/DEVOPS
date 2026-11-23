# Fiche projet - Test et validation de la bibliothèque

## 1. Présentation

« Bibliothèque » est une application web de gestion de livres développée avec Next.js App Router, React, TypeScript, Prisma, SQLite/PostgreSQL et une authentification JWT stockée dans un cookie HTTP-only.

## 2. Périmètre fonctionnel inclus

- Inscription, connexion, déconnexion et persistance de la session.
- Deux rôles : `MEMBRE` et `ADMIN`.
- Recherche du catalogue et consultation des livres.
- Création, modification et suppression des livres par un administrateur.
- Emprunt, retour et consultation des emprunts.
- Limite de trois emprunts actifs par membre.
- Interdiction d'emprunter pour un administrateur.
- Refus d'un double emprunt simultané du même livre.
- Interdiction du retour d'un prêt appartenant à un autre membre.
- Gestion transactionnelle du stock disponible lors des emprunts et retours.
- Refus de la suppression d'un livre ayant des prêts actifs.
- Détection des prêts en retard à partir de `dueDate`.
- API HTTP, persistance Prisma et parcours utilisateur complet.

## 3. Périmètre hors campagne ou basse priorité

- Réservation des livres : hors périmètre principal ou basse priorité.
- Prolongation des prêts : hors périmètre principal ou basse priorité.
- Administration avancée, export CSV, statistiques détaillées et rate limiting : testés seulement si leurs effets concernent directement les permissions ou les risques principaux.

## 4. Rôles

| Rôle | Autorisations principales | Interdictions principales |
|---|---|---|
| `MEMBRE` | Rechercher, emprunter, consulter ses prêts, retourner ses prêts | Gérer le catalogue, emprunter plus de trois livres actifs, emprunter plusieurs fois le même livre simultanément |
| `ADMIN` | Gérer les livres et consulter les emprunts selon les routes autorisées | Emprunter un livre |
| Visiteur | Accéder aux pages publiques | Appeler les routes protégées ou modifier les données |

## 5. Règles métier principales

- Un utilisateur doit être authentifié pour consulter ou modifier des données protégées.
- Un membre ne peut avoir plus de trois prêts actifs.
- Un membre ne peut pas emprunter deux fois simultanément le même livre.
- Un prêt est actif tant que `returnedAt` est nul.
- Un prêt est en retard lorsque `dueDate` est dépassée.
- Aucun champ de statut `ACTIVE`, `LATE` ou `RETURNED` n'est stocké dans `Loan`; `getLoanStatus` les calcule à partir de `returnedAt`, `dueDate` et l'heure courante.
- Le stock disponible doit rester compris entre zéro et le stock total.
- Seul l'emprunteur ou un administrateur autorisé peut retourner le prêt selon les routes prévues.
- Un livre avec un prêt actif ne peut pas être supprimé.

## 6. Écarts avec RéclaGest

Le domaine « réclamation » est remplacé par un catalogue de bibliothèque.

- RéclaGest ne dispose pas des rôles `MEMBRE` et `ADMIN` décrits ici.
- Les emprunts remplacent les affectations; l'état est calculé depuis `returnedAt` et `dueDate`.
- Limite adaptée : trois emprunts actifs maximum.
- Stock adapté : `totalCopies` et `availableCopies`.
- Réservation et prolongation sont hors périmètre principal ou basse priorité.

## 7. Environnement

- Node.js local : 20.20.2; Node.js CI : 22.
- Next.js 16.0.1, React 19.2.0, TypeScript 5.9.3.
- Prisma 6.19.3 dans le code courant; SQLite en local.
- PostgreSQL fourni pour Docker/deploiement.
- Vitest 4.1.12 et Playwright 1.65.1.

## 8. Droit de retour

- Un membre ne peut retourner que son propre prêt actif.
- Un administrateur peut retourner un prêt actif quel que soit son emprunteur.
- Le retour fixe `returnedAt` et incrémente le stock sans dépasser `totalCopies`.

## 9. Droits administrateur

- Créer, modifier, rechercher et supprimer des livres.
- Refuser la suppression d'un livre ayant un prêt actif.
- Consulter les emprunts administratifs.
- Retourner un prêt de membre.
- Ne jamais emprunter directement.

## 10. Exigences ambiguës

- Longueur maximale du titre et de l'auteur.
- Texte français exact des erreurs Zod.
- Comportement exact en cas d'emprunts simultanés.
- Bornes exactes lors d'une modification simultanée du stock.
