# Plan de test - Semaine 2

## 1. Périmètre

### Inclus

- Authentification : inscription, connexion, déconnexion, cookie JWT.
- Rôles `MEMBRE` et `ADMIN`, permissions et accès aux routes.
- Livres : recherche, création, modification et suppression.
- Emprunts : emprunt, retour, limite de trois prêts actifs, retard.
- API HTTP : statuts, corps JSON, en-têtes et négatifs.
- Persistance Prisma : intégrité du stock, prêts, utilisateurs et données de livres.
- Régression des anomalies AN-01 et AN-02.

### Hors périmètre ou basse priorité

- Réservations : hors campagne principale, tests seulement après stabilisation.
- Prolongations : basse priorité.
- Export CSV, statistiques avancées et administration hors parcours critiques : basse priorité.

## 2. Niveaux de test

| Niveau | Outil | Couverture Bibliothèque |
|---|---|---|
| Unitaire | Vitest | Fonctions d'échéance, statut, limite 3, bornes, validation Zod, permissions |
| Intégration | Vitest + Prisma + SQLite séparée | Transactions emprunt/retour, persistance, stock, suppression active, contraintes |
| Système/API | Bruno CLI | Routes auth, books, loans, health, codes 400/401/403/404/409 |
| Système UI | Playwright | Parcours inscription/connexion/recherche/emprunt/« Mes emprunts »/retour |
| Système | k6 | Charge locale sur `GET /api/books` |
| Acceptation | Journal humain + Playwright | Un membre valide son besoin métier; un administrateur valide la gestion du catalogue |

## 3. Environnement

- Local : Next.js sur port 3000, SQLite séparée, `.env` local exclu de Git.
- CI : Ubuntu, Node.js 22, `npm ci`, Prisma generate/db push, SQLite jetable, lint, tests, build et Playwright.
- Test : aucune écriture dans `prisma/dev.db` pendant les tests d'intégration. Chaque test utilise une base dédiée ou une transaction/reset.
- Docker : validation secondaire de démarrage et `GET /api/health`.

## 4. Rôles et responsabilités

| Rôle | Responsabilité |
|---|---|
| Étudiant/testeur | Designer les cas, exécuter, documenter les preuves et classer les anomalies |
| Développeur | Corriger après reproduction, puis rejouer les tests ciblés |
| Encadrant | Valider les critères, arbitrer les ambiguïtés et accepter/refuser |

## 5. Planning sur 10 semaines

1. Comprendre les règles et risques.
2. Définir la stratégie, les critères et les outils.
3. Spécifier les exigences et la traçabilité.
4. Concevoir au moins 15 cas, cible 20.
5. Tracer les états et conduire une session exploratoire.
6. Implémenter les tests unitaires et le rapport de couverture.
7. Ajouter les tests d'intégration SQLite.
8. Exécuter la collection Bruno.
9. Exécuter Playwright, k6 et définir la régression.
10. Lancer la campagne complète, corriger P1/P2, puis décider.

## 6. Critères d'entrée

- Application démarrable localement.
- Base SQLite séparée disponible.
- Utilisateur membre et administrateur identifiables.
- Exigences EX-xx écrites ou ambiguïtés enregistrées.
- Anomalies reproduites dans `docs/anomalies.md`.
- CI capable d'exécuter lint, tests et build.

## 7. Critères de sortie

- Tous les cas prioritaires P1 exécutés.
- Aucun échec non expliqué sur les parcours critiques.
- Anomalies P1/P2 retestées après correction.
- Preuves conservées dans `docs/preuves/`.
- Rapport de campagne, couverture et bilan produits.

## 8. Échelle de gravité

| Gravité | Définition | Exemple AN-xx |
|---|---|---|
| Bloquante | Empêche un parcours critique, contourne une autorisation, corrompt/perd les données ou bloque toute validation | AN-01 (admin emprunte); AN-02 (livre actif supprimé) |
| Majeure | Dégrade une règle importante ou une fonction principale sans arrêter totalement l'application | AN-03 (longueur texte non bornée) |
| Mineure | Gène l'usage ou la lisibilité, avec faible impact sur les données et les parcours critiques | AN-04 (message anglais); AN-05 (incohérence d'affichage) |

## 9. Échelle de priorité

| Priorité | Définition | Exemple |
|---|---|---|
| P1 | Risque critique pour permissions, intégrité ou parcours principal; correction avant validation | AN-01, AN-02 |
| P2 | Impact réel mais contournable ou limité; correction planifiée avant livraison | AN-03, AN-05 |
| P3 | Faible impact cosmétique/UX ou entretien; correction différable | AN-04 |

Reclassification des anomalies existantes : AN-03 passe de P1 à P2 parce que la limite manquante dégrade la validation des champs sans bloquer le parcours emprunt/retour ni la sécurité. AN-01 et AN-02 restent bloquantes/P1, AN-03 majeure/P2, AN-04 mineure/P3, AN-05 mineure/P2.

## 10. Critères de décision fixes

Ces critères sont arrêtés avant la campagne finale.

- **Seuil de couverture :** le seuil final porte sur `lib/` (règles métier), avec au moins 80 % des lignes, 70 % des branches et 100 % des décisions P1 sur administrateur/emprunt/stock. Les nombres seront vérifiés en Step 6.
- **Défaut bloquant :** anomalie qui viole une exigence P1 : contournement des permissions, violation de l'intégrité du stock, perte/corruption de données, ou arrêt du parcours critique emprunt/retour.
- **Validation :** aucun défaut bloquant ou majeur ouvert; seuil de couverture atteint; tous les cas P1 exécutés avec succès; seules des anomalies mineures documentées peuvent rester.
- **Validation conditionnelle :** aucun défaut bloquant, avec des défauts majeurs ou mineurs restants explicitement acceptés, contournement documenté, risque résiduel, propriétaire et date de correction.
- **Refus :** au moins une anomalie bloquante ouverte, ou une sécurité/permission P1, perte/corruption P1, ou parcours critique P1 en échec.
- **Couverture insuffisante :** campagne incomplète; les critères de sortie ne sont pas atteints. Cela devient un refus uniquement si les critères de la décision finale restent également insatisfaits ou si les exigences P1 ne peuvent pas être établies.

## 11. Données de test et reproductibilité

- Chaque test d'intégration utilise une base SQLite dédiée avec `DATABASE_URL` propre.
- Réinitialisation avec suppression des lignes avant chaque test; aucune modification de la base locale de développement.
- Jeux : admin, membre Alice, membre Bruno, membres limite 2/3/4, livre stock 0/1, prêt actif/retourné/en retard.
- Les identifiants, recettes Bruno et commandes Playwright sont conservés dans le dépôt.

## 12. Stratégie de régression

À rejouer après chaque correction :

- Tests unitaires métier Vitest.
- Tests AN-01/AN-02.
- Recherche, auth, permissions, emprunts et retours.
- Test Playwright critique.
- `GET /api/health`.

## 13. Esquisse CI

```yaml
quality:
  - npm ci
  - cp .env.example .env
  - npx prisma generate
  - npx prisma db push
  - npm run lint
  - npm test
  - npm run test:e2e
  - npm run build
  - upload des rapports et traces
```

Bruno, Playwright, k6 et la couverture seront ajoutés dans les étapes ultérieures; cette étape ne modifie pas encore la CI.
