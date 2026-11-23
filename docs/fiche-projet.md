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
- Le stock disponible doit rester compris entre zéro et le stock total.
- Seul l'emprunteur ou un administrateur autorisé peut retourner le prêt selon les routes prévues.
- Un livre avec un prêt actif ne peut pas être supprimé.

