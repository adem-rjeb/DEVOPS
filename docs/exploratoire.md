# Session exploratoire

## Charte

- **Mission :** chercher les écarts non déjà décrits dans les permissions, la validation, les emprunts, les retours et la persistance.
- **Durée :** 30 minutes.
- **Périmètre :** pages login/register/dashboard/admin, API books/loans/health.
- **Hors périmètre :** réservations et renouvellements.
- **Base :** base de test séparée, serveur local courant.

## Checklist pour l'exécution manuelle de 30 minutes

1. Ouvrir `/register`, tester nom seul, email invalide, mot de passe court et email déjà utilisé.
2. Se connecter avec un membre, rechercher une chaîne vide, une chaîne inexistante et des caractères spéciaux.
3. Vérifier qu'un membre ne voit que ses emprunts.
4. Emprunter un livre disponible, puis tenter de l'emprunter une seconde fois.
5. Créer trois emprunts actifs puis tester une quatrième tentative.
6. Tester le dernier exemplaire disponible puis vérifier que le badge/texte restent cohérents.
7. Retourner son propre prêt, puis tenter un second retour.
8. Se connecter comme autre membre et retourner par URL/API le prêt d'un autre membre.
9. Se connecter comme admin, vérifier le CRUD livres et la suppression d'un livre actif.
10. Tester titre vide, 200 caractères, 201 caractères, auteur vide, auteur 101 caractères.
11. Recharger `/dashboard` après chaque action et vérifier les données affichées.
12. Vérifier `/api/health` après fonctionnement normal.

## Observations obtenues par l'agent

Aucune nouvelle session exploratoire navigateur n'a été conduite; seules les API automatisées et les tests réels demandés ont été exécutés.

## Constats réels

- Aucun nouveau défaut exploratoire n'est inventé.
- AN-03 est confirmé par HTTP `201` pour 201 caractères et 500 caractères.
- Les appels API réels confirment le stock zéro `409`, le second retour `404`, le retour croisé `404`, l'emprunt admin `403` et le prêt en retard `403`.

## Notes personnelles de l'étudiant

- **Heure de début :**
- **Heure de fin :**
- **Pages/routes testées :**
- **Données utilisées :**
- **Observation 1 :**
- **Preuve/URL/capture :**
- **Observation 2 :**
- **Preuve/URL/capture :**
- **Anomalie éventuelle :** aucune sans reproduction, étapes, attendu/réel.
