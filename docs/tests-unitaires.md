# Revue des tests unitaires

| Fichier                                 | Nom du test                                               | EX-xx | CT-xx               |
| --------------------------------------- | --------------------------------------------------------- | ----- | ------------------- |
| `tests/loans.test.ts`                   | refuse le quatrième emprunt actif                         | EX-04 | CT-11               |
| `tests/loans.test.ts`                   | crée un emprunt valide                                    | EX-04 | CT-09               |
| `tests/loans.test.ts`                   | marque un emprunt dépassé comme LATE                      | EX-14 | Aucun               |
| `tests/loans.test.ts`                   | interdit un nouvel emprunt avec un retard                 | EX-14 | CT-26               |
| `tests/loans.test.ts`                   | refuse un livre déjà emprunté                             | EX-05 | CT-14               |
| `tests/loans.test.ts`                   | refuse l'emprunt à un administrateur                      | EX-03 | CT-07               |
| `tests/loans.test.ts`                   | refuse qu'un autre membre retourne un prêt                | EX-08 | CT-16               |
| `tests/loans.test.ts`                   | autorise le propriétaire ou un administrateur à retourner | EX-08 | CT-15, CT-23        |
| `tests/loans.test.ts`                   | garantit que le stock reste dans ses bornes               | EX-06 | CT-12, CT-13        |
| `tests/permissions.test.ts`             | refuse un emprunt pour un administrateur                  | EX-03 | CT-07               |
| `tests/permissions.test.ts`             | refuse qu'un membre retourne le prêt d'un autre membre    | EX-08 | CT-16               |
| `tests/permissions.test.ts`             | autorise un administrateur à retourner un prêt            | EX-08 | CT-23               |
| `tests/books.test.ts`                   | protège la suppression contre un membre                   | EX-07 | CT-17               |
| `tests/health.test.ts`                  | returns application and database status                   | EX-13 | Aucun               |
| `tests/unit/anomaly-regression.test.ts` | AN-01 refuse l'emprunt d'un administrateur                | EX-03 | CT-07               |
| `tests/unit/anomaly-regression.test.ts` | AN-02 refuse la suppression d'un livre avec emprunt actif | EX-07 | CT-17               |
| `tests/unit/boundaries.test.ts`         | trois emprunts 2/3/4                                      | EX-04 | CT-09, CT-10, CT-11 |
| `tests/unit/boundaries.test.ts`         | stock 0/1                                                 | EX-06 | CT-12, CT-13        |
| `tests/unit/boundaries.test.ts`         | titre/auteur AN-03                                        | EX-11 | CT-18, CT-19, CT-20 |

## Interprétation de la couverture

La couverture globale de `lib/` est de 44.5 % des lignes et 42.55 % des branches. Elle reste sous les seuils fixés dans `plan-de-test.md`.

- `loans.ts` reste partiellement couvert: les transactions de base, certaines réservations, renouvellements et erreurs de base sont peu ou pas exercés.
- `admin-loans.ts`, `auth.ts`, `reservations.ts` et `stats.ts` contiennent des chemins non exécutés par les tests unitaires actuels.
- `validation.ts` atteint 100 % dans cette campagne, mais cela ne prouve pas que chaque contrainte métier existe; AN-03 montre que les limites titre/auteur ne sont pas définies.
- Une ligne couverte peut néanmoins masquer un défaut si elle exécute une mauvaise logique attendue. Exemple: un test qui vérifie qu'une ligne de statut retourne `ACTIVE` peut passer même si elle échoue à distinguer un prêt en retard à cause d'une mauvaise donnée `dueDate`.

Une couverture élevée ne prouve ni la pertinence des assertions, ni les états concurrents, ni la persistance réelle, ni les parcours navigateur. Dans Bibliothèque, une ligne `return "LATE"` pourrait être exécutée tout en restant incorrecte si elle utilise la mauvaise date ou ignore `returnedAt`.
