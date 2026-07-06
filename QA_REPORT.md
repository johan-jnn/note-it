# QA_REPORT.md

> Rapport structuré selon les 13 points attendus dans le PDF *"PROJET - Qualité
> logicielle & tests"* (référentiel mini-projet TDD/tests), **limité au
> périmètre retenu : pages 1 à 36**. La partie audit de sécurité (pages 37 à
> 60) est hors périmètre pour ce rendu (voir `.project/SECURITY_AUDIT_DRAFT.md`,
> conservé à titre d'archive).

## 1. Présentation du projet

- **Thème choisi** : *Thème 3 — Gestion de notes étudiantes* (classes,
  matières, cours, devoirs, notes), avec une couche "comptes" (élèves /
  enseignants) ajoutée en plus.
- **Objectif du projet** : gérer les entités d'un établissement scolaire
  (classes, comptes élèves/enseignants, matières, cours, devoirs, notes) via
  une API REST, avec une interface web pour les piloter.
- **Stack utilisée** :
  - Backend : NestJS 11 + TypeORM (SQLite en local/tests, MySQL/MariaDB en
    production), validation via `class-validator`/`class-transformer`.
  - Frontend : SvelteKit (Svelte 5), export statique (`adapter-static`),
    servi par le backend NestJS (`ServeStaticModule`).
  - Tests : Jest (exécuté via `bun test` en local pour les tests unitaires,
    `jest` directement pour les tests d'intégration/e2e).
  - CI : GitHub Actions (`pr-checks.yml`, `build.yml`).
  - Conteneurisation : Docker / docker-compose (MySQL + app + redis).
- **Principales fonctionnalités** : CRUD complet sur classes, matières,
  cours, devoirs, notes ; création/consultation/mise à jour de comptes
  élèves et enseignants avec relations entre toutes ces entités ; calcul de
  moyenne pondérée par élève/matière et règle de validation d'une matière.

## 2. Fonctionnalités développées

| Module | Endpoints | Ce qui existe |
|---|---|---|
| `classes` | `GET/POST/PATCH/DELETE /api/classes` | CRUD complet |
| `subjects` (matières) | `GET/POST/PATCH/DELETE /api/subjects` | CRUD complet + relation `owner` (enseignant propriétaire) |
| `lessons` (cours) | `GET/POST/PATCH/DELETE /api/lessons` | CRUD complet + relations `class`/`teacher`/`subject` + champ calculé `real_name` |
| `assignments` (devoirs) | `GET/POST/PATCH/DELETE /api/assignments` | CRUD complet + relation `lesson` + bornes métier (dates, barème, coefficient) |
| `grades` (notes) | `GET/POST/PATCH/DELETE /api/grades` + `GET /api/grades/average/:studentId/:subjectId` | CRUD complet + relations `assignment`/`student` + bornes 0-20 + calcul de moyenne pondérée + règle de validation de matière |
| `accounts` (comptes) | `GET /api/accounts` (+ `?directorsOnly=true`), `GET /api/accounts/:id`, `POST /api/accounts`, `PATCH /api/accounts/:id` | Création atomique compte + profil (élève ou enseignant) via transaction TypeORM, listing, listing filtré des directeurs, consultation par id, mise à jour. Pas de suppression de compte. |

Frontend (SvelteKit) : pages liste / création / édition pour chaque ressource
ci-dessus, relations sélectionnées via menus déroulants, interface en
français. *(non modifié pendant cette session, hors périmètre demandé)*.

## 3. Règles métier principales

- Un compte enseignant sans `directorId` renseigné est considéré comme
  directeur (`Teacher.director` reste `undefined`).
- Un compte élève doit obligatoirement référencer une `Class` existante ; la
  création échoue avec `NotFoundException` sinon.
- Le nom affiché d'un cours (`Lesson.real_name`) retombe sur le nom de la
  matière associée si aucun nom explicite n'est renseigné.
- Toute relation référencée par id (classe, enseignant, matière, cours,
  devoir, élève, directeur) est vérifiée à la création et à la mise à jour :
  une référence vers une entité inexistante lève systématiquement une
  `NotFoundException`.
- La mise à jour d'un compte enseignant permet explicitement de retirer un
  directeur (`directorId: null`) pour que ce dernier redevienne directeur.
- **`Grade.value` est borné entre 0 et 20** (`@Min(0) @Max(20)` sur
  `CreateGradeDto`, hérité par `UpdateGradeDto`).
- **`Assignment.begin_date` doit être strictement antérieure à
  `Assignment.end_date`** quand les deux sont fournies (validateur
  personnalisé `IsAfterDate`, `src/common/validators/is-after-date.validator.ts`).
  Si une seule des deux dates est fournie, aucune contrainte n'est appliquée.
- **`Assignment.scale` doit être un entier ≥ 1** et **`Assignment.coefficient`
  doit être strictement positif** (`@Min(1)` / `@IsPositive()`).
- **Calcul de moyenne par élève/matière** : moyenne pondérée par le
  coefficient de chaque devoir, chaque note étant d'abord normalisée sur 20
  via le barème (`scale`) de son devoir
  (`GradesService.getStudentSubjectAverage`,
  `src/grades/grade-average.util.ts#computeWeightedAverage`). Retourne `null`
  s'il n'existe encore aucune note pour l'élève sur cette matière.
- **Règle de validation d'une matière à partir d'un seuil de moyenne** : une
  matière est considérée comme validée si la moyenne est ≥ 10/20
  (`SUBJECT_VALIDATION_THRESHOLD`, `isSubjectValidated` dans
  `grade-average.util.ts`, exposé via `GradesService.isStudentSubjectValidated`
  et par l'endpoint `GET /api/grades/average/:studentId/:subjectId`).

## 4. Démarche TDD

Trois cycles complets red → green ont été menés pendant cette session pour
les nouvelles règles métier. Pour chacun, l'implémentation existante a été
temporairement retirée pour rejouer honnêtement le cycle et capturer une
vraie sortie de terminal en échec puis en succès.

### Cycle 1 — Bornes de `Grade.value` (0 à 20)

**Comportement attendu** : `CreateGradeDto.value` doit être rejeté par
`class-validator` si `< 0` ou `> 20`.

**Test écrit** (`src/grades/dto/create-grade.dto.spec.ts`) :
```ts
it('rejects a value below 0', async () => {
  const errors = await validateValue(-1);
  expect(errors).toHaveLength(1);
  expect(errors[0].constraints).toHaveProperty('min');
});
it('rejects a value above 20', async () => {
  const errors = await validateValue(21);
  expect(errors).toHaveLength(1);
  expect(errors[0].constraints).toHaveProperty('max');
});
```

**Échec initial** (décorateurs `@Min(0)`/`@Max(20)` retirés) :
```
 3 pass
 2 fail
(fail) CreateGradeDto (value bounds) > rejects a value below 0
  Expected length: 1
  Received length: 0
(fail) CreateGradeDto (value bounds) > rejects a value above 20
  Expected length: 1
  Received length: 0
```

**Code ajouté** : `@Min(0) @Max(20)` sur `CreateGradeDto.value`
(`src/grades/dto/create-grade.dto.ts`).

**Succès final** :
```
 5 pass
 0 fail
Ran 5 tests across 1 file.
```

### Cycle 2 — Cohérence `begin_date` / `end_date` d'un devoir

**Comportement attendu** : si les deux dates sont fournies, `end_date` doit
être strictement postérieure à `begin_date`. Si une seule des deux est
fournie, aucune erreur.

**Test écrit** (`src/assignments/dto/create-assignment.dto.spec.ts`) :
```ts
it('rejects when end_date is before begin_date', async () => {
  const errors = await validateDto({
    begin_date: '2026-01-02T00:00:00.000Z',
    end_date: '2026-01-01T00:00:00.000Z',
  });
  expect(errors.some((e) => e.property === 'end_date')).toBe(true);
});
```

**Échec initial** (décorateur `@IsAfterDate('begin_date')` retiré de
`end_date`) :
```
 8 pass
 2 fail
(fail) CreateAssignmentDto (begin_date/end_date coherence) > rejects when end_date is before begin_date
  Expected: true
  Received: false
(fail) CreateAssignmentDto (begin_date/end_date coherence) > rejects when end_date equals begin_date
  Expected: true
  Received: false
```

**Code ajouté** : validateur personnalisé `IsAfterDate`
(`src/common/validators/is-after-date.validator.ts`), appliqué sur
`CreateAssignmentDto.end_date`.

**Succès final** :
```
 10 pass
 0 fail
Ran 10 tests across 1 file.
```

### Cycle 3 — Calcul de la moyenne pondérée élève/matière

**Comportement attendu** : la moyenne doit être pondérée par le coefficient
de chaque devoir, chaque note étant normalisée sur 20 via le barème du
devoir — pas une simple moyenne arithmétique des valeurs brutes.

**Test écrit** (`src/grades/grades.service.spec.ts`) :
```ts
it('should compute the weighted average of the student grades for the subject', async () => {
  mockRepository.find.mockResolvedValue([
    { value: 15, assignment: { scale: 20, coefficient: 1 } },
    { value: 8, assignment: { scale: 10, coefficient: 2 } },
  ]);
  const result = await service.getStudentSubjectAverage('student-uuid', 1);
  // (15 + 32) / (1 + 2) = 15.666...
  expect(result).toBeCloseTo(15.6667, 3);
});
```

**Échec initial** (implémentation volontairement dégradée en moyenne
arithmétique simple non pondérée/non normalisée) :
```
 21 pass
 1 fail
(fail) GradesService > getStudentSubjectAverage > should compute the weighted average...
  Expected: 15.6667
  Received: 11.5
```

**Code ajouté** : `computeWeightedAverage` dans
`src/grades/grade-average.util.ts`, normalisant chaque note sur 20 via
`grade.assignment.scale` et pondérant par `grade.assignment.coefficient`.

**Succès final** :
```
 22 pass
 0 fail
Ran 22 tests across 1 file.
```

## 5. Risques qualité identifiés

- Le module `accounts` centralise une logique transactionnelle assez dense
  (création/mise à jour combinée de `Account` + `Student`/`Teacher`), ce qui
  augmente le risque de divergence entre les deux tables si une modification
  future oublie de garder les deux écritures synchrones.
- Incohérence relevée dans `database/sources/_resolver.ts` : la valeur
  attendue pour l'environnement de test est `'tests'` (cf.
  `npm run orm:tests`), alors que les workflows CI définissent
  `NODE_ENV: 'test'` (singulier) — avec cette valeur, `AppModule` retomberait
  sur le datasource *local* (fichier `database/app.db`) plutôt que sur le
  datasource de test en mémoire s'il était démarré tel quel en CI. Pour
  éviter ce piège, la nouvelle suite d'intégration (`test/*.integration-spec.ts`)
  n'utilise pas `AppModule` : elle importe directement les options de
  `database/sources/tests.datasource.ts` (SQLite `:memory:`), indépendamment
  de `NODE_ENV`. Ce décalage `NODE_ENV` reste néanmoins à corriger si
  `AppModule` doit un jour être démarré tel quel en CI/tests.
- La synchronisation automatique du schéma (`synchronize: true`) échoue sur
  la colonne `Account.type` (`enum: () => AccountsType`) avec le driver
  `better-sqlite3` utilisé ici (`columnMetadata.enum.map is not a function`) :
  la suite d'intégration construit donc le schéma en rejouant les vraies
  migrations (`migrationsRun: true`) plutôt qu'en synchronisant les entités,
  ce qui a aussi l'avantage de vérifier que les migrations existantes restent
  valides.

## 6. Stratégie de tests

- **Tests unitaires** (`bun test src`) : chaque module métier dispose d'un
  fichier `*.service.spec.ts` et `*.controller.spec.ts` avec dépendances
  mockées (`@nestjs/testing`, `getRepositoryToken`). Les DTO portant des
  règles métier ont en plus un fichier `*.dto.spec.ts` dédié qui appelle
  directement `class-validator` (`validate()`), sans passer par HTTP ni par
  Nest, pour isoler la règle de validation elle-même.
- **Tests d'intégration** (`npm run test:integration`,
  `test/grades.integration-spec.ts`) : une vraie base SQLite en mémoire est
  créée pour chaque run (via les migrations réelles du projet), aucun
  repository n'est mocké. Les requêtes traversent la pile complète
  (contrôleur → service → repository TypeORM → base de données), avec
  vérification du code HTTP et du corps de réponse.
- **Tests "e2e" existants** (`npm run test:e2e`,
  `test/classes.e2e-spec.ts`, `test/app.e2e-spec.ts`) : montent l'`AppModule`
  complet via Supertest, mais avec le repository `Class` mocké — ce sont des
  tests de câblage HTTP/Nest, pas des tests d'intégration au sens strict.
  Conservés tels quels (hors périmètre de cette session).
- **Tests E2E navigateur** (Cypress/Playwright) : non réalisés — le sujet
  définit explicitement ce point comme portant sur le frontend, hors
  périmètre demandé pour cette session (voir `TODO.md`).

## 7. Tests unitaires réalisés

- 16 fichiers de spec (`*.service.spec.ts`, `*.controller.spec.ts`,
  `*.dto.spec.ts`) répartis sur les 6 modules métier.
- État au dernier `bun test src` exécuté : **164 tests passent, 0 échec**
  (contre 131 passants / 6 échouants avant cette session — la régression du
  module `assignments` a été corrigée).

```
$ bun test src
bun test v1.3.14 (0d9b296a)

 164 pass
 0 fail
 263 expect() calls
Ran 164 tests across 14 files. [426.00ms]
```

<!-- IMAGE À INSÉRER : capture du terminal montrant le résultat ci-dessus de
     `bun test src` (le texte exact est déjà reproduit ci-dessus). -->

- Cas couverts pour tous les modules : création (nominal + relation
  manquante → 404), lecture liste et par id (y compris id inexistant →
  404), mise à jour (y compris entité inexistante → 404, mise à jour de
  relation), suppression.
- Cas nominal/limite/erreur systématiquement couverts pour les nouvelles
  règles métier : bornes de note (0, 20, -1, 21), cohérence de dates
  (une seule date fournie, dates égales, ordre inversé), positivité du
  barème/coefficient (valeur nulle, valeur négative), calcul de moyenne
  (pondération correcte, absence de note → `null`), validation de matière
  (au-dessus/au seuil exact/en dessous du seuil, absence de note → `null`).

## 8. Tests d'intégration réalisés

- `test/grades.integration-spec.ts` : 5 tests contre une vraie base SQLite
  en mémoire (schéma construit par les migrations réelles du projet, aucun
  repository mocké). Chaîne complète seedée via de vraies requêtes HTTP
  (`/api/classes`, `/api/accounts`, `/api/subjects`, `/api/lessons`,
  `/api/assignments`) avant d'exercer `/api/grades` et
  `/api/grades/average/:studentId/:subjectId`.
  - Cas nominal : création d'une note valide (`201`, corps de réponse
    vérifié) ; calcul de moyenne réel à partir d'une note stockée en base
    (`200`, `{ average: 12, validated: true }`).
  - Cas d'erreur : note hors bornes (`400`), élève inexistant (`404`),
    matière inexistante (`404`).

```
$ npx jest --config ./test/jest-integration.json
Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
```

## 9. Test E2E réalisé

❌ Aucun test end-to-end navigateur (Cypress/Playwright) n'a été réalisé —
explicitement hors périmètre de cette session (parcours utilisateur
frontend). Voir `TODO.md`.

## 10. Pipeline CI/CD

- `.github/workflows/pr-checks.yml` : déclenché sur les pull requests vers
  `main`/`dev`. Jobs : `lint` → `test-unit` (`npm run test`) et
  `test-integration` (`npm run test:integration`, en parallèle de
  `test-unit`, tous deux dépendants de `lint`).
- `.github/workflows/build.yml` : déclenché sur push vers `main`. Jobs :
  `test-unit` et `test-integration` (en parallèle) → `build`
  (dépend désormais des deux).
- Les tests d'intégration (base SQLite réelle en mémoire) sont donc
  désormais exécutés en CI, en plus des tests unitaires. Les tests E2E
  navigateur (`npm run test:e2e` existant, et un futur test Cypress/
  Playwright) restent à ajouter à la pipeline une fois réalisés côté
  frontend (hors périmètre de cette session).

<!-- IMAGE À INSÉRER : capture d'un run GitHub Actions vert (onglet
     "Actions" du dépôt) pour pr-checks.yml et/ou build.yml, une fois la
     branche poussée. -->

## 11. Utilisation de l'IA générative

**Outil utilisé** : Claude Code (Anthropic, modèle Claude Sonnet 5), en mode
agent avec accès direct au terminal et au système de fichiers du dépôt.

**Prompt de départ (cette session)** : demande de réaliser les tâches
décrites dans `.project/TODO.md`, à l'exclusion explicite des tâches liées
au frontend, puis de mettre à jour ce fichier en cochant les actions
réalisées.

**Déroulé et ce qui a été conservé** :
- Lecture systématique du code existant (`assignments.service.ts`,
  entités, DTO, tests) avant toute modification, pour aligner les
  correctifs sur le comportement réel plutôt que sur des suppositions.
- Correction de la régression des 6 tests en échec du module `assignments`
  en réalignant les mocks Jest sur les relations réellement chargées par le
  service (`lesson: { class, subject, teacher } `) — diagnostic fait en
  comparant `assignments.service.ts` et `assignments.service.spec.ts` ligne
  à ligne.
- Ajout des règles métier manquantes (bornes de note, cohérence de dates,
  positivité barème/coefficient) via des décorateurs `class-validator`
  standards, plus un validateur personnalisé (`IsAfterDate`) pour la
  cohérence inter-champs, ce type de contrainte n'ayant pas d'équivalent
  direct dans `class-validator`.
- Conception du calcul de moyenne et de la règle de validation de matière
  comme des fonctions pures et testables séparément
  (`grade-average.util.ts`) plutôt que noyées dans le service, pour
  permettre des tests unitaires rapides sans mock de repository — choix
  motivé par la volonté de documenter des cycles TDD clairs.
- Les 3 cycles TDD documentés en section 4 ont été **rejoués sincèrement** :
  l'implémentation déjà écrite a été temporairement retirée, les tests ont
  été exécutés pour constater un échec réel (capturé tel quel dans ce
  rapport), puis l'implémentation restaurée pour confirmer le succès —
  plutôt que de rédiger une narration théorique du cycle red/green.
- Écriture d'une vraie suite d'intégration contre une base SQLite en
  mémoire. Une première tentative utilisant `synchronize: true` a échoué
  (bug révélé sur la colonne enum `Account.type` avec le driver
  `better-sqlite3`) ; plutôt que de contourner artificiellement ce problème,
  la suite a été réécrite pour rejouer les vraies migrations du projet
  (`migrationsRun: true`), ce qui teste en même temps la validité de ces
  migrations.
- Une bascule ponctuelle vers `npx jest` / `python3` a été corrigée en cours
  de session sur retour de l'utilisateur : les tests unitaires backend de
  ce dépôt doivent être lancés via `bun test`, et les scripts ponctuels via
  `bun`/Node plutôt que Python (ou `python` sous `pyenv` si Python est
  réellement nécessaire).

**Limites observées** :
- L'IA ne peut pas exécuter d'action irréversible (push, commit) sans
  validation explicite : aucun commit n'a été créé pendant cette session,
  conformément aux consignes.
- La détection du bug `NODE_ENV: 'test'` vs `'tests'` (section 5) est un
  effet de bord de l'écriture de la suite d'intégration, pas d'une revue de
  code exhaustive du projet — d'autres incohérences de ce type peuvent
  subsister ailleurs dans le dépôt.
- Le calcul de moyenne pondérée (normalisation par barème, pondération par
  coefficient) est une interprétation raisonnable mais non explicitement
  spécifiée du sujet ; une autre pondération (ex. ignorer le barème,
  pondérer par nombre de notes) serait tout aussi défendable et mériterait
  une validation avec l'enseignant/le jury.

## 12. Limites actuelles

- Pas de système d'authentification : les comptes créés via `POST
  /api/accounts` sont volontairement non "connectables" (décision métier
  assumée pour ce projet).
- Pas de suppression de compte (`DELETE /api/accounts/:id` n'existe pas).
- Pas de test E2E navigateur (Cypress/Playwright) — hors périmètre de cette
  session.
- Incohérence `NODE_ENV: 'test'` (CI) vs `'tests'` (attendu par
  `database/sources/_resolver.ts`) non corrigée, contournée uniquement pour
  la nouvelle suite d'intégration (voir section 5).
- La normalisation de moyenne par barème/coefficient n'est pas exposée
  paramétrable (seuil de validation fixé à 10/20 par défaut, non
  configurable via l'API).

## 13. Améliorations possibles

- Corriger l'incohérence `NODE_ENV` entre la CI et
  `database/sources/_resolver.ts` pour que `AppModule` puisse lui-même être
  démarré en mode test sans dépendre d'un contournement.
- Étendre la suite d'intégration à d'autres modules (`classes`, `subjects`,
  `lessons`, `accounts`) en réutilisant le même pattern (migrations réelles
  + SQLite en mémoire).
- Ajouter un test E2E navigateur (Cypress ou Playwright) sur un parcours
  complet (créer un compte élève, lui attribuer une note, voir la moyenne
  mise à jour), puis l'intégrer à la pipeline CI/CD.
- Rendre le seuil de validation d'une matière configurable (actuellement
  une constante `SUBJECT_VALIDATION_THRESHOLD = 10`).
- Réduire le couplage transactionnel du module `accounts` (risque identifié
  en section 5).
