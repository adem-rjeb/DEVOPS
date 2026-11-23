# Matrice de traçabilité

Les colonnes `Cas de test` sont volontairement laissées pour Step 4.

| Exigence | Risque     | Anomalie                 | Niveau de test prévu     | Cas de test                |
| -------- | ---------- | ------------------------ | ------------------------ | -------------------------- |
| EX-01    | R-04       | Aucune reproduite        | API, système             | CT-01, CT-02, CT-03        |
| EX-02    | R-13       | AN-04 partiellement liée | API, unitaire            | CT-04, CT-05, CT-06        |
| EX-03    | R-01, R-11 | AN-01                    | Unitaire, API            | CT-07, CT-08               |
| EX-04    | R-02       | Aucune                   | Unitaire, intégration    | CT-09, CT-10, CT-11        |
| EX-05    | R-06       | Aucune reproduite        | Intégration, API         | CT-14                      |
| EX-06    | R-03, R-06 | AN-03, AN-05             | Unitaire, intégration    | CT-12, CT-13               |
| EX-07    | R-07       | AN-02                    | API, intégration         | CT-07, CT-12               |
| EX-08    | R-08, R-11 | Aucune reproduite        | Unitaire, API            | CT-15, CT-16, CT-17, CT-23 |
| EX-09    | R-09       | Aucune                   | Intégration, persistance | CT-13, CT-14               |
| EX-10    | R-10       | AN-01 indirectement      | Intégration, script      | Aucun cas automatisé       |
| EX-11    | R-05       | AN-03, AN-04             | Unitaire, API            | CT-18, CT-19, CT-20        |
| EX-12    | R-14       | Aucune                   | API, unitaire            | Aucun cas automatisé       |
| EX-13    | R-15       | Aucune                   | API, système             | Aucun cas automatisé       |
| EX-14    | R-12       | Aucune                   | Unitaire, API            | CT-26                      |
