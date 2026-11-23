# Revue des tests unitaires

Source: sortie réelle de `npx vitest list`.

| Fichier                                 | Nom réel                                                                                | EX-xx | CT-xx               |
| --------------------------------------- | --------------------------------------------------------------------------------------- | ----- | ------------------- |
| `tests/loans.test.ts`                   | `règles d'emprunt > refuse le quatrième emprunt actif`                                  | EX-04 | CT-11               |
| `tests/loans.test.ts`                   | `règles d'emprunt > crée un emprunt valide`                                             | EX-04 | CT-09, CT-10        |
| `tests/loans.test.ts`                   | `règles d'emprunt > marque un emprunt dépassé comme LATE`                               | EX-14 | Aucun               |
| `tests/loans.test.ts`                   | `règles d'emprunt > interdit un nouvel emprunt avec un retard`                          | EX-14 | CT-26               |
| `tests/loans.test.ts`                   | `règles d'emprunt > refuse un livre déjà emprunté`                                      | EX-05 | CT-14               |
| `tests/loans.test.ts`                   | `règles d'emprunt > refuse l'emprunt à un administrateur`                               | EX-03 | CT-07               |
| `tests/loans.test.ts`                   | `règles d'emprunt > refuse qu'un autre membre retourne un prêt`                         | EX-08 | CT-16               |
| `tests/loans.test.ts`                   | `règles d'emprunt > autorise le propriétaire ou un administrateur à retourner`          | EX-08 | CT-15, CT-23        |
| `tests/loans.test.ts`                   | `règles d'emprunt > garantit que le stock reste dans ses bornes`                        | EX-06 | CT-12, CT-13        |
| `tests/permissions.test.ts`             | `permissions des emprunts > refuse un emprunt pour un administrateur`                   | EX-03 | CT-07               |
| `tests/permissions.test.ts`             | `permissions des emprunts > refuse qu'un membre retourne le prêt d'un autre membre`     | EX-08 | CT-16               |
| `tests/permissions.test.ts`             | `permissions des emprunts > autorise un administrateur à retourner un prêt`             | EX-08 | CT-23               |
| `tests/books.test.ts`                   | `livres > protège la suppression contre un membre`                                      | EX-07 | CT-17               |
| `tests/health.test.ts`                  | `GET /api/health > returns application and database status`                             | EX-13 | Aucun               |
| `tests/unit/anomaly-regression.test.ts` | `régressions des anomalies > AN-01 refuse l'emprunt d'un administrateur`                | EX-03 | CT-07               |
| `tests/unit/anomaly-regression.test.ts` | `régressions des anomalies > AN-02 refuse la suppression d'un livre avec emprunt actif` | EX-07 | CT-17               |
| `tests/unit/boundaries.test.ts`         | `Bornes des emprunts > AN-04 CT-09/10/11`                                               | EX-04 | CT-09, CT-10, CT-11 |
| `tests/unit/boundaries.test.ts`         | `Bornes du stock > CT-12/CT-13`                                                         | EX-06 | CT-12, CT-13        |
| `tests/unit/boundaries.test.ts`         | `AN-03 CT-19 refuse un titre de 201 caractères`                                         | EX-11 | CT-19               |
| `tests/unit/boundaries.test.ts`         | `AN-03 refuse un auteur de 101 caractères`                                              | EX-11 | CT-19               |

## Interprétation

Le seuil porte sur `lib/`: au moins 80 % des lignes et 70 % des branches. La dernière mesure réelle était 44.5 % de lignes et 42.55 % de branches, donc non atteint.
