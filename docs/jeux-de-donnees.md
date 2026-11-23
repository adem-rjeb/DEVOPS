# Jeux de données de test

## Utilisateurs

| Identifiant | Rôle   | Email             | Mot de passe | Usage                  |
| ----------- | ------ | ----------------- | ------------ | ---------------------- |
| admin-test  | ADMIN  | admin@test.local  | Motdepasse1! | CRUD, permissions      |
| alice-test  | MEMBRE | alice@test.local  | Motdepasse1! | propriétaire des prêts |
| bruno-test  | MEMBRE | bruno@test.local  | Motdepasse1! | autre membre           |
| limit2      | MEMBRE | limit2@test.local | Motdepasse1! | deux prêts actifs      |
| limit3      | MEMBRE | limit3@test.local | Motdepasse1! | trois prêts actifs     |

## Livres

| Identifiant   | Titre              | Auteur      | totalCopies | availableCopies | Usage                |
| ------------- | ------------------ | ----------- | ----------: | --------------: | -------------------- |
| livre-stock-0 | Stock Zéro         | Auteur Test |           1 |               0 | emprunt refusé       |
| livre-stock-1 | Dernier Exemplaire | Auteur Test |           1 |               1 | décrément à zéro     |
| livre-actif   | Livre Actif        | Auteur Test |           1 |               0 | suppression refusée  |
| livre-libre   | Livre Libre        | Auteur Test |           2 |               2 | CRUD et recherche    |
| livre-long    | X répété           | Auteur Test |           1 |               1 | limites titre/auteur |

## Prêts

| Identifiant       | Utilisateur | Livre        | Etat             |
| ----------------- | ----------- | ------------ | ---------------- |
| loan-alice-active | Alice       | Livre Actif  | returnedAt null  |
| loan-alice-late   | Alice       | Livre Libre  | dueDate dépassée |
| loan-limit-a/b/c  | limit3      | trois livres | 3 actifs         |

## Rechargement avant chaque campagne

Avant chaque exécution locale:

```bash
rm -f /tmp/bibliotheque-test.db
DATABASE_URL='file:/tmp/bibliotheque-test.db' npx prisma db push
DATABASE_URL='file:/tmp/bibliotheque-test.db' npm run seed:test
DATABASE_URL='file:/tmp/bibliotheque-test.db' npm run dev -- --port 3106
```

Toute base utilisée doit être une base SQLite explicitement nommée `test`, `tmp`, `temp` ou `bibliotheque-step...`. `prisma/dev.db` est toujours refusé par `prisma/seed-test.ts`. Les prêts doivent être créés et les stocks disponibles décrémentés ou incrémentés de manière cohérente avec `totalCopies`.
