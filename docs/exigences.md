# Exigences vérifiables

## Décisions explicites

- **Titre :** chaîne obligatoire de 1 à 200 caractères, espaces externes supprimés.
- **Auteur :** chaîne obligatoire de 1 à 100 caractères, espaces externes supprimés.
- **Erreur française :** chaque cas possède un message français unique dans `docs/anomalies.md` et dans l'API.
- **Second retour :** HTTP `404`, avec `Emprunt introuvable ou déjà retourné.`
- **Autre membre :** HTTP `404`, avec `Emprunt introuvable ou vous n'êtes pas autorisé à le retourner.`
- **Emprunt par ADMIN :** HTTP `403`, avec `Les administrateurs ne peuvent pas emprunter de livres.`
- **Suppression avec prêts actifs :** HTTP `409`, avec `Impossible de supprimer un livre avec des emprunts actifs.`
- **Qui peut retourner :** le propriétaire du prêt ou un utilisateur `ADMIN`; un membre ne peut pas retourner le prêt d'un autre membre.

## EX-01 - Authentification obligatoire

- **Priorité :** P1
- **Critères d'acceptation :**
  1. Toute route protégée sans cookie JWT retourne HTTP `401`.
  2. Un cookie invalide ou expiré est refusé.
  3. `/api/auth/login` valide email/mot de passe et crée une session HTTP-only.

## EX-02 - Inscription

- **Priorité :** P1
- **Critères d'acceptation :**
  1. Nom de 2 caractères minimum.
  2. Email valide et normalisé en minuscules.
  3. Mot de passe de 8 caractères minimum.
  4. Email dupliqué retourne HTTP `409`.

## EX-03 - Rôles

- **Priorité :** P1
- **Critères d'acceptation :**
  1. Inscription crée un rôle `MEMBRE`.
  2. Un membre ne peut pas appeler une route administrateur: HTTP `403`.
  3. Un administrateur ne peut pas emprunter: HTTP `403`.

## EX-04 - Limite de trois emprunts

- **Priorité :** P1
- **Critères d'acceptation :**
  1. À 2 emprunts actifs, un troisième emprunt est accepté.
  2. À 3 emprunts actifs, le quatrième est refusé avec HTTP `403`.

## EX-05 - Emprunt non dupliqué

- **Priorité :** P1
- **Critères d'acceptation :**
  1. Un membre ne peut pas emprunter deux fois le même livre avec `returnedAt = null`.
  2. Une répétition concurrente ne crée qu'un prêt actif au plus.
  3. HTTP `409` pour le doublon métier.

## EX-06 - Stock disponible

- **Priorité :** P1
- **Critères d'acceptation :**
  1. `0 <= availableCopies <= totalCopies`.
  2. À stock 0, emprunt refusé avec HTTP `409`.
  3. Un retour ne dépasse jamais `totalCopies`.
  4. Réduire `totalCopies` sous les prêts actifs est refusé avec HTTP `409`.

## EX-07 - Suppression de livre

- **Priorité :** P1
- **Critères d'acceptation :**
  1. Livres sans prêt actif supprimables par l'ADMIN.
  2. Livre avec prêt actif retourne HTTP `409`.
  3. Aucun prêt actif n'est supprimé silencieusement.

## EX-08 - Retour de prêt

- **Priorité :** P1
- **Critères d'acceptation :**
  1. Le propriétaire membre peut retourner son prêt actif.
  2. Un administrateur peut retourner tout prêt actif.
  3. Un membre retournant le prêt d'un autre retourne HTTP `404`.
  4. Un second retour retourne HTTP `404`.

## EX-09 - Persistance transactionnelle

- **Priorité :** P1
- **Critères d'acceptation :**
  1. Emprunt et décrément du stock réussissent ensemble.
  2. Retour et incrément du stock réussissent ensemble.
  3. Toute erreur annule les modifications de la transaction.

## EX-10 - Nettoyage des prêts ADMIN

- **Priorité :** P2
- **Critères d'acceptation :**
  1. Le script identifie les prêts dont l'utilisateur est `ADMIN`.
  2. Le script supprime ces prêts dans une transaction.
  3. Les stocks des livres concernés sont recalculés entre 0 et `totalCopies`.

## EX-11 - Validation des livres

- **Priorité :** P1
- **Critères d'acceptation :**
  1. Titre : 1 à 200 caractères après trim.
  2. Auteur : 1 à 100 caractères après trim.
  3. Champ invalide retourne HTTP `400`.
  4. JSON malformé retourne HTTP `400` avec un message français: `Données JSON invalides.`

## EX-12 - Recherche

- **Priorité :** P2
- **Critères d'acceptation :**
  1. Recherche vide retourne tous les livres.
  2. Recherche d'au plus 100 caractères filtre titre/auteur.
  3. Recherche spéciale ne provoque aucune erreur ni injection.
  4. HTTP `400` si plus de 100 caractères.

## EX-13 - API health

- **Priorité :** P1
- **Critères d'acceptation :**
  1. Base disponible: HTTP `200`, `{"status":"ok","database":"ok"}`.
  2. Base indisponible: HTTP `503`, avec `status/database` à `error`.

## EX-14 - État de retard

- **Priorité :** P2
- **Critères d'acceptation :**
  1. `returnedAt != null` donne `RETURNED`.
  2. Prêt non retourné et `dueDate < now` donne `LATE`.
  3. Sinon donne `ACTIVE`.

## AN-03/AN-04 dans l'état actuel

- La limite titre/auteur de EX-11 n'est pas satisfaite: le code ne limite que les champs à une longueur minimale.
- AN-04 n'est pas satisfaite: le JSON malformé retourne encore un message Zod anglais sur le code actuel.

## Ce qui rend une exigence testable

Une exigence testable contient une précondition identifiable, une entrée précise, une observation mesurable et un résultat attendu unique.

**Bon exemple :** EX-04 précise qu'à trois emprunts actifs, le quatrième emprunt est refusé avec HTTP `403`. On peut préparer quatre états et vérifier exactement le dernier code HTTP.

**Exemple vague :** « Le système doit être sécurisé. » Il ne précise ni rôle, ni route, ni résultat observable.

**Réécriture testable :** « Sans cookie JWT, `GET /api/loans` retourne HTTP `401` avec `{"error":"Authentification requise."}`. »
