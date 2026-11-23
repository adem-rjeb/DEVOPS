# Registre des anomalies

## AN-01 - Un administrateur peut emprunter un livre

- **Étapes :** se connecter comme administrateur sur 435451e puis appeler `POST /api/loans` avec un `bookId` valide.
- **Attendu :** HTTP `403`.
- **Réel :** HTTP `201`, avec création d'un prêt associé à l'administrateur.
- **Sévérité :** bloquante
- **Priorité :** P1
- **Preuve :** `docs/preuves/an-01-baseline-435451e.txt` et `docs/preuves/an-01-current.txt`.
- **Commit de baseline :** 435451e
- **Commit de correction :** 76c98df
- **Retest :** `POST /api/loans` retourne `403` sur le code actuel.
- **Statut :** fermé
- **Exigence violée :** seuls les utilisateurs `MEMBRE` peuvent emprunter.
- **Test de non-régression :** `tests/unit/anomaly-regression.test.ts`, test `AN-01 refuse l'emprunt d'un administrateur`.

## AN-02 - Suppression autorisée d'un livre avec emprunt actif

- **Étapes :** créer un prêt actif pour un livre, puis appeler `DELETE /api/books/<id>` comme administrateur.
- **Attendu :** HTTP `409`; aucun prêt ni livre ne doit être supprimé.
- **Réel :** HTTP `200`, avec suppression du livre sur 435451e. La suppression directe du Prisma a également été autorisée.
- **Sévérité :** bloquante
- **Priorité :** P1
- **Preuve :** `docs/preuves/an-02-baseline-435451e.txt` et `docs/preuves/an-02-current.txt`.
- **Commit de baseline :** 435451e
- **Commit de correction :** 76c98df
- **Retest :** HTTP `409` sur le code actuel.
- **Statut :** fermé
- **Exigence violée :** un livre avec emprunt actif ne peut pas être supprimé.
- **Test de non-régression :** `tests/unit/anomaly-regression.test.ts`, test `AN-02 refuse la suppression d'un livre avec emprunt actif`.

## AN-03 - Limite maximale des titres et auteurs non appliquée

- **Étapes :** envoyer un titre et un auteur de 500 caractères à `POST /api/books`.
- **Attendu :** HTTP `400` après définition d'une limite vérifiable.
- **Réel :** HTTP `201`, les champs de 500 caractères sont acceptés.
- **Sévérité :** majeure
- **Priorité :** P1
- **Preuve :** `docs/preuves/an-03-baseline-435451e.txt` et `docs/preuves/an-03-current.txt`.
- **Commit de baseline :** 435451e
- **Commit de correction :** aucune correction
- **Retest :** HTTP `201`, anomalie encore ouverte.
- **Statut :** ouvert
- **Exigence violée :** validation des données avant persistance et limites explicites des champs texte.
- **Test de non-régression :** aucun jusqu'à la définition d'une limite métier.

## AN-04 - Message Zod anglais pour un JSON malformé

- **Étapes :** envoyer `{bad` à `POST /api/books` avec une session administrateur.
- **Attendu :** HTTP `400` avec un message français clair.
- **Réel :** HTTP `400`, message `Invalid input: expected object, received null`.
- **Sévérité :** mineure
- **Priorité :** P3
- **Preuve :** `docs/preuves/an-04-baseline-435451e.txt` et `docs/preuves/an-04-current.txt`.
- **Commit de baseline :** 435451e
- **Commit de correction :** aucune correction
- **Retest :** message anglais encore observé.
- **Statut :** ouvert
- **Exigence violée :** erreurs utilisateur en français et cohérentes.
- **Test de non-régression :** à ajouter après décision sur le texte exact attendu.

## AN-05 - Badge Disponibilité/Emprunté contradictoire

- **Étapes observées :** comparaison du badge avec `x / 1 exemplaires disponibles` sur les captures du 2026-11-19.
- **Attendu :** badge et texte doivent représenter le stock réel.
- **Réel :** capture intermédiaire montrant une contradiction apparente.
- **Sévérité :** mineure
- **Priorité :** P2
- **Preuve :** captures utilisateur du 2026-11-19; fichiers à ajouter dans `docs/preuves/`.
- **Commit de baseline :** 435451e
- **Commit de correction :** aucune reproduction sur le baseline
- **Retest :** non reproductible sur 435451e, sans champ `availableCopies` ni badge.
- **Statut :** non reproductible sur le baseline
- **Exigence violée :** cohérence entre l'état affiché et le stock.
- **Test de non-régression :** test UI avec `availableCopies=0` et `availableCopies=1`.
