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
- **Réel :** sur 435451e, l'API retourne HTTP `200` avec `{"ok":true}`. Le test Prisma confirme aussi que `prisma.book.delete` permet la suppression directe du livre malgré son prêt actif.
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
- **Priorité :** P2
- **Preuve :** `docs/preuves/an-03-baseline-435451e.txt` et `docs/preuves/an-03-current.txt`.
- **Commit de baseline :** 435451e
- **Commit de correction :** aucune correction
- **Retest mesuré :** titre de 201 caractères → HTTP `201`; titre/auteur de 500 caractères → HTTP `201`. Les cas sont donc des échecs réels du code actuel, pas une hypothèse.
- **Statut :** ouvert
- **Exigence violée :** validation des données avant persistance et limites explicites des champs texte.
- **Test de non-régression :** aucun jusqu'à la définition d'une limite métier.

## AN-04 - Message Zod anglais pour un JSON malformé

- **Étapes :** envoyer `{bad` à `POST /api/books` avec une session administrateur.
- **Attendu :** HTTP `400` avec un message français clair.
- **Baseline :** HTTP `409`, avec `{"error":"Impossible de créer le livre."}`.
- **Réel actuel :** HTTP `400`, message `Invalid input: expected object, received null`.
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
- **Preuve :** [Capture du 2026-11-19 à 21.31.02](/Users/macbook/Desktop/DEVOPS/docs/preuves/Capture_d_ecran_2026-11-19_a_21.31.02.png), qui montre déjà `Disponible` alors que le texte affiche `0 / 1 exemplaires disponibles`.
- **Commit de baseline :** 435451e
- **Commit de correction :** aucune reproduction sur le baseline
- **Retest :** non reproductible sur 435451e, sans champ `availableCopies` ni badge.
- **Statut :** non reproductible sur le baseline
- **Exigence violée :** cohérence entre l'état affiché et le stock.
- **Test de non-régression :** test UI avec `availableCopies=0` et `availableCopies=1`.

## AN-06 - Visiteur redirigé au lieu d'une réponse API 401

- **Étapes :** appeler `GET /api/loans` puis `GET /api/books` sans cookie sur le serveur courant.
- **Attendu :** HTTP `401` avec JSON `{"error":"Authentification requise."}`.
- **Réel :** HTTP `307 Temporary Redirect`, en-tête `location: /login`, corps `/login`.
- **Sévérité :** majeure
- **Priorité :** P2
- **Preuve :** `docs/preuves/step6-live-campaign.txt` et `docs/preuves/step7-pre-admin-visitor.txt`.
- **Commit :** 7a790c8
- **Retest :** non corrigé.
- **Statut :** ouvert
- **Exigence violée :** EX-01 exige une route protégée sans cookie retourne HTTP `401`.
- **Échelle :** majeure/P2: redirection fonctionnelle pouvant gêner les clients API, mais aucune donnée n'est exposée.
- **Test de non-régression :** à ajouter sans cookie sur les deux routes API.
