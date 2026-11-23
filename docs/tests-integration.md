# Tests d'intégration

## Pourquoi l'intégration est nécessaire

Les tests unitaires vérifient des fonctions isolées avec des entrées déterministes. Ils ne prouvent pas que les transactions Prisma, les mises à jour simultanées du stock ou les contraintes SQLite persistent ensemble.

Un mock peut confirmer qu'une fonction est appelée, mais pas qu'un emprunt concurrent crée un seul prêt ni qu'un retour annule bien les mises à jour du stock.

## Tests réalisés

1. CRUD/persistence: création, emprunt, décrément, retour, incrément et modification.
2. Stock borné et limite de trois prêts.
3. Emprunt à stock zéro.
4. Suppression d'un livre avec prêt actif.
5. Deux emprunts concurrents sur le dernier exemplaire: exactement un succès et un échec.

## Résultat

- 5 tests d'intégration exécutés.
- 5 tests passés avec le vrai PrismaClient et SQLite.
- Couverture `lib/` après intégration: 68.2 % des lignes, 51.77 % des branches.
- Les seuils 80 %/70 % restent non atteints.
