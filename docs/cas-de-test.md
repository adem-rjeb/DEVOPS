# Cas de test

Les cas ci-dessous utilisent les techniques suivantes:

- Partition d'équivalence: données valides/invalides.
- Valeurs limites: limite ±1 autour des bornes.
- Table de décision: combinaison rôle × action × ressource.

## CT-01 - Connexion valide

- **Exigence / risque:** EX-01 / R-04
- **Objectif:** accepter un membre avec identifiants valides.
- **Préconditions:** utilisateur Alice inscrit.
- **Données:** `alice@bibliotheque.local`, mot de passe valide.
- **Étapes:** POST `/api/auth/login`.
- **Résultat attendu:** HTTP `200`, cookie `library-session` HTTP-only.
- **Technique:** partition d'équivalence.
- **Niveau:** API
- **Etat actuel:** prévu réussi.
- **Automatisation existante:** aucun test API nommé direct; voir `tests/auth.test.ts` pour le hachage/vérification.

## CT-02 - Mot de passe incorrect

- **Exigence / risque:** EX-01 / R-04
- **Objectif:** refuser une mauvaise authentification.
- **Préconditions:** Alice existe.
- **Données:** bon email, mauvais mot de passe.
- **Étapes:** POST login.
- **Résultat attendu:** HTTP `401`, `Email ou mot de passe incorrect.`
- **Technique:** partition d'équivalence.
- **Niveau:** API
- **Etat actuel:** prévu réussi.
- **Automatisation existante:** `tests/auth.test.ts` - `rejects an incorrect password`.

## CT-03 - Accès sans cookie

- **Exigence / risque:** EX-01 / R-04
- **Objectif:** protéger les routes.
- **Préconditions:** aucune session.
- **Données:** aucune.
- **Étapes:** GET `/api/loans`.
- **Résultat attendu:** HTTP `401`, `Authentification requise.`
- **Technique:** partition d'équivalence.
- **Niveau:** API
- **Etat actuel:** prévu réussi.
- **Automatisation existante:** aucune.

## CT-04 - Inscription email valide

- **Exigence / risque:** EX-02 / R-13
- **Objectif:** créer un membre valide.
- **Préconditions:** email absent.
- **Données:** nom valide, email valide, mot de passe 8 caractères.
- **Étapes:** POST `/api/auth/register`.
- **Résultat attendu:** HTTP `201`, rôle `MEMBRE`.
- **Technique:** valeurs limites: mot de passe à 8 caractères.
- **Niveau:** API
- **Etat actuel:** prévu réussi.
- **Automatisation existante:** `e2e/library.spec.ts` - `inscription, connexion, emprunt et retour`.

## CT-05 - Email invalide

- **Exigence / risque:** EX-02 / R-13
- **Objectif:** rejeter un email invalide.
- **Préconditions:** aucune.
- **Données:** `non-email`.
- **Étapes:** POST register.
- **Résultat attendu:** HTTP `400`, `Email invalide.`
- **Technique:** partition d'équivalence.
- **Niveau:** API
- **Etat actuel:** prévu réussi.
- **Automatisation existante:** aucune.

## CT-06 - Email dupliqué

- **Exigence / risque:** EX-02 / R-13
- **Objectif:** éviter deux comptes identiques.
- **Préconditions:** Alice existe.
- **Données:** email Alice.
- **Étapes:** POST register deux fois.
- **Résultat attendu:** second appel HTTP `409`, `Cet email est déjà utilisé.`
- **Technique:** partition d'équivalence.
- **Niveau:** API
- **Etat actuel:** prévu réussi.
- **Automatisation existante:** aucune.

## CT-07 - ADMIN emprunte

- **Exigence / risque:** EX-03 / R-01
- **Objectif:** interdire l'emprunt ADMIN.
- **Préconditions:** administrateur connecté, livre disponible.
- **Données:** rôle ADMIN, bookId valide.
- **Étapes:** POST `/api/loans`.
- **Résultat attendu:** HTTP `403`, `Les administrateurs ne peuvent pas emprunter de livres.`
- **Technique:** table de décision rôle × action × ressource.
- **Niveau:** API
- **Etat actuel:** prévu réussi.
- **Automatisation existante:** `tests/loans.test.ts` - `refuse l'emprunt à un administrateur`; `tests/permissions.test.ts` - `refuse un emprunt pour un administrateur`; `tests/unit/anomaly-regression.test.ts` - AN-01.

## CT-08 - MEMBRE emprunte

- **Exigence / risque:** EX-03 / R-01
- **Objectif:** autoriser un membre valide.
- **Préconditions:** membre, moins de 3 prêts, stock > 0.
- **Données:** rôle MEMBRE.
- **Étapes:** POST `/api/loans`.
- **Résultat attendu:** HTTP `201`.
- **Technique:** table de décision rôle × action × ressource.
- **Niveau:** API
- **Etat actuel:** prévu réussi.
- **Automatisation existante:** `e2e/library.spec.ts` - inscription/connexion/emprunt/retour.

## CT-09 - Limite 2 emprunts

- **Exigence / risque:** EX-04 / R-02
- **Objectif:** accepter le troisième emprunt.
- **Préconditions:** membre avec 2 prêts actifs.
- **Données:** stock 1 pour nouveau livre.
- **Étapes:** POST `/api/loans`.
- **Résultat attendu:** HTTP `201`.
- **Technique:** valeurs limites: borne 2.
- **Niveau:** intégration
- **Etat actuel:** prévu réussi.
- **Automatisation existante:** `tests/loans.test.ts` - `crée un emprunt valide`.

## CT-10 - Limite 3 emprunts

- **Exigence / risque:** EX-04 / R-02
- **Objectif:** accepter exactement 3 emprunts actifs.
- **Préconditions:** membre avec 2 prêts actifs.
- **Données:** 3ème livre disponible.
- **Étapes:** POST `/api/loans`.
- **Résultat attendu:** HTTP `201`, compteur 3/3.
- **Technique:** valeurs limites: borne 3.
- **Niveau:** intégration
- **Etat actuel:** prévu réussi.
- **Automatisation existante:** aucune intégration réelle; unitaire partiel.

## CT-11 - Quatrième emprunt

- **Exigence / risque:** EX-04 / R-02
- **Objectif:** refuser le quatrième emprunt.
- **Préconditions:** membre avec 3 prêts actifs.
- **Données:** quatrième livre disponible.
- **Étapes:** POST `/api/loans`.
- **Résultat attendu:** HTTP `403`, `Un membre ne peut pas dépasser 3 emprunts.`
- **Technique:** valeurs limites: 3/4.
- **Niveau:** intégration/API
- **Etat actuel:** prévu réussi.
- **Automatisation existante:** `tests/loans.test.ts` - `refuse le quatrième emprunt actif`.

## CT-12 - Stock à 0

- **Exigence / risque:** EX-06 / R-03
- **Objectif:** empêcher l'emprunt sans stock.
- **Préconditions:** livre totalCopies=1, availableCopies=0.
- **Données:** stock 0.
- **Étapes:** POST `/api/loans`.
- **Résultat attendu:** HTTP `409`, `Aucun exemplaire disponible.`
- **Technique:** valeurs limites: 0.
- **Niveau:** intégration/API
- **Etat actuel:** prévu réussi.
- **Automatisation existante:** `tests/loans.test.ts` - `interdit un emprunt sans exemplaire disponible`.

## CT-13 - Stock à 1

- **Exigence / risque:** EX-06 / R-03
- **Objectif:** emprunter le dernier exemplaire.
- **Préconditions:** availableCopies=1.
- **Données:** stock 1.
- **Étapes:** POST loan puis vérifier stock.
- **Résultat attendu:** HTTP `201`, stock passe de 1 à 0.
- **Technique:** valeurs limites: 1.
- **Niveau:** intégration
- **Etat actuel:** prévu réussi.
- **Automatisation existante:** aucune intégration réelle.

## CT-14 - Double emprunt du même livre

- **Exigence / risque:** EX-05 / R-06
- **Objectif:** refuser le même livre actif.
- **Préconditions:** Alice emprunte déjà le livre.
- **Données:** même userId/bookId.
- **Étapes:** POST loan une seconde fois.
- **Résultat attendu:** HTTP `409`, `Vous avez déjà emprunté ce livre.`
- **Technique:** partition d'équivalence.
- **Niveau:** intégration/API
- **Etat actuel:** prévu réussi.
- **Automatisation existante:** `tests/loans.test.ts` - `refuse le même livre emprunté simultanément`.

## CT-15 - Retour du propriétaire membre

- **Exigence / risque:** EX-08 / R-08
- **Objectif:** autoriser le propriétaire à retourner.
- **Préconditions:** prêt actif d'Alice.
- **Données:** session Alice, loanId Alice.
- **Étapes:** PATCH `/api/loans/:id`.
- **Résultat attendu:** HTTP `200`, `{"ok":true}`.
- **Technique:** table de décision rôle × action × ressource.
- **Niveau:** API
- **Etat actuel:** prévu réussi.
- **Automatisation existante:** `tests/loans.test.ts` - autorise propriétaire/admin; `tests/permissions.test.ts` - admin peut retourner.

## CT-16 - Membre retourne prêt d'un autre

- **Exigence / risque:** EX-08 / R-08
- **Objectif:** interdire l'accès horizontal.
- **Préconditions:** prêt actif d'Alice, session Bruno.
- **Données:** loanId Alice.
- **Étapes:** PATCH avec Bruno.
- **Résultat attendu:** HTTP `404`, `Emprunt introuvable ou vous n'êtes pas autorisé à le retourner.`
- **Technique:** table de décision rôle × action × ressource.
- **Niveau:** API
- **Etat actuel:** prévu réussi.
- **Automatisation existante:** `tests/permissions.test.ts` - `refuse qu'un membre retourne le prêt d'un autre membre`.

## CT-17 - Second retour

- **Exigence / risque:** EX-08 / R-08
- **Objectif:** refuser un retour déjà effectué.
- **Préconditions:** prêt avec returnedAt non nul.
- **Données:** même loanId.
- **Étapes:** PATCH deux fois.
- **Résultat attendu:** deuxième HTTP `404`, `Emprunt introuvable ou vous n'êtes pas autorisé à le retourner.`
- **Technique:** partition d'équivalence + transition d'état.
- **Niveau:** API/intégration
- **Etat actuel:** aucune automatisation.

## CT-18 - Titre à 200 caractères

- **Exigence / risque:** EX-11 / R-05
- **Objectif:** accepter la limite supérieure de titre.
- **Préconditions:** admin connecté.
- **Données:** titre 200 caractères, auteur valide.
- **Étapes:** POST `/api/books`.
- **Résultat attendu:** HTTP `201`.
- **Technique:** valeurs limites: 200.
- **Niveau:** API
- **Etat actuel:** prévu réussi.
- **Automatisation existante:** aucune.

## CT-19 - Titre à 201 caractères

- **Exigence / risque:** EX-11 / R-05
- **Objectif:** rejeter le dépassement.
- **Préconditions:** admin connecté.
- **Données:** titre 201 caractères.
- **Étapes:** POST `/api/books`.
- **Résultat attendu:** HTTP `400`, `Le titre doit contenir au plus 200 caractères.`
- **Technique:** valeurs limites: 201.
- **Niveau:** API
- **Etat actuel:** attendu échec sur le code actuel (AN-03).
- **Automatisation existante:** aucune.

## CT-20 - Titre vide

- **Exigence / risque:** EX-11 / R-05
- **Objectif:** rejeter titre 0 caractère.
- **Préconditions:** admin connecté.
- **Données:** titre vide/espaces.
- **Étapes:** POST `/api/books`.
- **Résultat attendu:** HTTP `400`, `Titre requis.`
- **Technique:** valeurs limites: 0.
- **Niveau:** API
- **Etat actuel:** déjà conforme.
- **Automatisation existante:** `tests/books.test.ts` couvre membre, pas titre vide.
