# Registre des risques

| ID | Risque | Probabilité | Impact | Niveau | Mesures de mitigation | Niveau de test lié |
|---|---|---|---|---|---|---|
| R-01 | Contournement des permissions | Moyenne | Élevé | Élevé | Assertions API avec cookie absent, rôle membre sur route administrateur et rôle administrateur sur emprunt | API, intégration, permissions |
| R-02 | Dépassement de la limite de trois emprunts actifs | Moyenne | Élevé | Élevé | Cas aux limites 2/3/4, vérification transactionnelle avant création | Unitaire, intégration |
| R-03 | Stock négatif ou supérieur au nombre total d'exemplaires | Moyenne | Élevé | Élevé | Contraintes Prisma/applicatives, décrément/incrément transactionnels, tests aux bornes 0/1 | Unitaire, intégration |
| R-04 | Session expirée, cookie falsifié ou identifiants invalides | Moyenne | Élevé | Élevé | JWT vérifié, cookie HTTP-only, tests sans cookie et avec identifiants invalides | Authentification, API |
| R-05 | Payload incomplet ou champs texte/numériques invalides | Élevée | Moyen | Élevé | Schémas Zod, tests des valeurs limites, messages cohérents | Unitaire, API |
| R-06 | Emprunts simultanés créent un double prêt ou dépassent le stock | Moyenne | Élevé | Élevé | Transaction Prisma et mise à jour conditionnelle du stock; test concurrent futur en intégration | Intégration, persistance |
| R-07 | Suppression d'un livre avec prêt actif | Faible | Élevé | Moyen | Comptage des prêts actifs dans une transaction avant suppression | Unité, intégration, API |
| R-08 | Membre retournant le prêt d'un autre membre | Moyenne | Élevé | Élevé | Filtre sur l'utilisateur emprunteur et test propriétaire/autre membre | Unitaire, API |
| R-09 | Perte ou incohérence des données après échec d'une opération | Moyenne | Élevé | Élevé | Transactions Prisma, base SQLite séparée, reset avant chaque test d'intégration | Intégration, persistance |
| R-10 | Prêt appartenant à un ancien utilisateur administrateur | Moyenne | Élevé | Élevé | Requête historique, script de nettoyage `prisma/remove-admin-loans.mjs`, test futur | Migration/persistance |

## Définitions utilisées pour les anomalies

- **Erreur** : action humaine ou entrée qui conduit à un comportement incorrect.
- **Défaut (defect)** : défaut du code, de la configuration ou de la donnée qui peut produire un comportement incorrect.
- **Échec (failure)** : observation contraire au comportement attendu pendant l'exécution.
- Une erreur peut révéler un défaut, et l'exécution du défaut peut produire une défaillance. L'anomalie doit relier le défaut à son observation reproductible.

## Vérification et validation

- **Vérification** : répondre à « le produit respecte-t-il les spécifications et les artefacts ? » Elle compare le résultat aux exigences, aux règles de code et aux documents.
- Exemple pour Bibliothèque : vérifier que `POST /api/loans` retourne `403` pour un utilisateur `ADMIN`.
- **Validation** : répondre à « le produit apporte-t-il la valeur attendue à l'utilisateur ? » Elle vérifie le parcours réel dans son contexte.
- Exemple pour Bibliothèque : valider qu'un membre peut rechercher un livre, emprunter, voir son prêt dans « Mes emprunts », puis le retourner.
