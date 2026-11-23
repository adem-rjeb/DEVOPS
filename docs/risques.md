# Registre des risques

## Matrice de cotation

- Vraisemblance : 1 = faible, 2 = possible, 3 = probable.
- Impact : 1 = faible, 2 = significatif, 3 = grave.
- Score = vraisemblance × impact.

| Score | Niveau |
|---|---|
| 1-2 | Faible |
| 3-4 | Moyen |
| 6 | Élevé |
| 8-9 | Critique |

| ID | Risque | P | I | Initial | Résiduel | Mitigation vérifiée | Niveau de test | Anomalie liée | Exigence liée |
|---|---|---|---|---|---|---|---|---|---|
| R-01 | Un administrateur emprunte ou contourne les permissions | 3 | 3 | Critique (9) | Faible (2) | `assertBorrowAllowed` rejette `role === "ADMIN"`; `POST /api/loans` retourne 403 | Unitaire, API | AN-01 | EX-XX |
| R-02 | Dépassement de trois emprunts actifs | 2 | 3 | Élevé (6) | Faible (2) | `activeMemberLoans >= 3` rejette un quatrième emprunt | Unitaire, intégration | Aucune | EX-XX |
| R-03 | Stock négatif ou supérieur au total | 2 | 3 | Élevé (6) | Moyen (3) | `updateMany` décrémente uniquement si le stock est > 0; `assertStockWithinBounds` vérifie les bornes | Intégration, persistance | aucune reproduite | EX-XX |
| R-04 | Session invalide ou falsifiée | 2 | 3 | Élevé (6) | Moyen (3) | JWT vérifié par `jwtVerify`; cookie HTTP-only; contrôles `requireSession` et `requireAdmin` | Authentification, API | Aucune | EX-XX |
| R-05 | Payload incomplet ou invalide | 3 | 2 | Élevé (6) | Moyen (4) | Schémas Zod présents pour auth, livres, emprunts et paramètres; AN-04 montre qu'un message reste en anglais | Unitaire, API | AN-03, AN-04 | EX-XX |
| R-06 | Emprunt concurrent ou dépassement du stock | 2 | 3 | Élevé (6) | Élevé (6) | Transaction Prisma et décrément conditionnel; test concurrent réel encore manquant | Intégration, persistance | À reproduire | EX-XX |
| R-07 | Suppression d'un livre avec emprunt actif | 3 | 3 | Critique (9) | Faible (2) | Baseline reproduite: aucune protection. Fix: comptage `returnedAt: null`, puis `BOOK_HAS_ACTIVE_LOANS`; API 409 | Unitaire, intégration, API | AN-02 | EX-XX |
| R-08 | Membre retournant le prêt d'un autre membre | 2 | 3 | Élevé (6) | Faible (2) | Filtre membre par `userId`; administrateur autorisé; `LOAN_NOT_FOUND` retourne 404 | Unitaire, API | Aucune reproduite | EX-XX |
| R-09 | Perte ou incohérence après une opération en échec | 2 | 3 | Élevé (6) | Moyen (3) | Emprunts, retours et suppressions utilisent des transactions Prisma; base séparée prévue | Intégration, persistance | Aucune | EX-XX |
| R-10 | Prêts historiques appartenant à des administrateurs | 2 | 3 | Élevé (6) | Moyen (3) | `prisma/remove-admin-loans.mjs` supprime les prêts admin et recalcule les stocks | Migration, persistance | AN-01 | EX-XX |
| R-11 | Un membre accède aux prêts d'un autre membre | 2 | 3 | Élevé (6) | Faible (2) | `GET /api/loans` filtre `userId: session.userId`; PATCH vérifie le propriétaire ou le rôle admin | API, intégration | Aucune reproduite | EX-XX |
| R-12 | Statut de retard calculé incorrectement | 2 | 2 | Moyen (4) | Faible (2) | `getLoanStatus` compare `dueDate` à l'instant courant; `returnedAt` donne prioritairement `RETURNED` | Unitaire | Aucune | EX-XX |
| R-13 | Inscription avec email dupliqué ou mot de passe faible | 2 | 2 | Moyen (4) | Moyen (4) | Zod exige email valide et mot de passe >= 8 caractères; `email` est unique dans Prisma; doublon capturé en 409 | Authentification, API | AN-04 | EX-XX |
| R-14 | Recherche vide ou avec caractères spéciaux | 2 | 1 | Faible (2) | Faible (2) | Zod limite la recherche à 100 caractères; le filtre Prisma porte sur titre/auteur | API, unitaire | Aucune | EX-XX |
| R-15 | Base de données indisponible | 2 | 3 | Élevé (6) | Moyen (3) | `/api/health` exécute `$queryRaw` et retourne 503 si la requête échoue | API, système | Aucune | EX-XX |

## Définitions

- **Erreur** : mauvaise action humaine, mauvaise saisie ou mauvaise décision.
- **Défaut (defect)** : anomalie dans le code, la configuration ou les données susceptible de produire un mauvais résultat.
- **Échec (failure)** : comportement observable qui ne respecte pas le résultat attendu.

## Vérification et validation

- Vérification : vérifier que le produit respecte les règles, les schémas et les spécifications.
- Validation : vérifier qu'un utilisateur peut accomplir réellement un parcours utile.
