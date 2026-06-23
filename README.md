# Note-It 📝

> **Projet de fin de module** – Gestion et consultation des notes des élèves

**Note-It** est une application web conçue pour simplifier la gestion des notes scolaires. Elle permet aux **élèves** de consulter leurs notes, aux **enseignants** de les attribuer et de gérer les cours, et aux **directeurs** (enseignants spéciaux) de superviser l'ensemble du système.

L'affichage et les fonctionnalités disponibles s'adaptent automatiquement en fonction du type de compte connecté.

---

## ✨ Fonctionnalités

### 👨🎓 Pour les **élèves**

- Consultation de l'ensemble de leurs notes
- Visualisation des détails des devoirs (titre, dates, coefficient, échelle de notation)
- Accès aux informations des cours associés (matière, enseignant)
- Affichage des commentaires sur les notes

### 👩🏫 Pour les **enseignants**

- Créer, modifier et supprimer des **cours**
- Gérer les **devoirs** (titre, dates, échelle, coefficient)
- Attribuer des **notes** aux élèves avec commentaires
- Visualiser les notes de leurs élèves
- Gérer les **matières** qu'ils enseignent
- Accès aux informations des classes

### 👨🏫💼 Pour les **directeurs** (enseignants spéciaux)

- Toutes les fonctionnalités des enseignants
- Créer et gérer les **matières** (propriétaire par défaut)
- Superviser les comptes enseignants
- Gestion complète du système

---

## 🛠 Technologies

| Technologie                                  | Version | Usage                       |
| -------------------------------------------- | ------- | --------------------------- |
| [NestJS](https://nestjs.com)                 | ^11.0.1 | Framework backend           |
| [TypeScript](https://www.typescriptlang.org) | ^5.7.3  | Langage principal           |
| [TypeORM](https://typeorm.io)                | ^1.0.0  | ORM pour la base de données |
| [Jest](https://jestjs.io)                    | ^30.0.0 | Tests unitaires et e2e      |

---

## 📋 Prérequis

- [Node.js](https://nodejs.org) (v18 ou supérieur recommandé)
- [npm](https://www.npmjs.com) (inclus avec Node.js)

### ⚠️ Bun n'est pas compatible

En raison d'une librarie non compatible avec [Bun](https://bun.sh) ([better-sqlite3](https://www.npmjs.com/package/better-sqlite3)), il n'est pas possible de lancer ce projet avec Bun.
Ce projet a pour le moment été pensé pour fonctionner correctement sous Node.js.

- [Plus d'informations sur cette incompatibilité](https://github.com/oven-sh/bun/issues/4290)
- [Package à tester pour permettre l'utilisation de Bun](https://github.com/nounder/bun-better-sqlite3)

---

## 🚀 Installation

1. **Cloner le dépôt** (si applicable) ou accéder au dossier du projet

2. **Installer les dépendances** :

   ```bash
   npm install # bun i
   ```

3. **Configurer l'environnement** (optionnel) :

Copiez le fichier `.env.example` en `.env` et adaptez les variables si nécessaire :

```bash
cp .env.example .env
```

---

## 🔧 Configuration de la base de données

Le projet est configuré pour utiliser **SQLite** par défaut (fichier `app.db` dans `/database`).

### Utilisation de MySQL

Si vous souhaitez utiliser MySQL à la place :

1. Modifiez la configuration TypeORM dans `database/sources/app.datasource.ts`
2. Mettez à jour vos variables d'environnement avec les informations de connexion MySQL

### Exécuter les migrations

Pour créer ou mettre à jour la structure de la base de données :

```bash
# Pour l'application principale (prévu pour mariadb)
npm run orm:app migration:run

# Pour la base de données locale (sqlite)
npm run orm:local migration:run

# Pour les tests (sqlite -> ':memory:')
npm run orm:tests migration:run
```

---

## ▶️ Exécution

### Mode développement (avec rechargement automatique)

```bash
npm run start:dev
```

L'application sera accessible à l'adresse : [http://localhost:8000](http://localhost:8000) (ou autre suivant la configuration de vos variables d'environnements)

### Mode production

```bash
# Construction de l'application
npm run build

# Lancement
npm run start:prod
```

### Mode debug

```bash
npm run start:debug # Ou 'F5' sur vscode
```

---

## 🧪 Tests

### Tests unitaires

```bash
npm run test
```

### Tests e2e (end-to-end)

```bash
npm run test:e2e
```

### Couverture de code

```bash
npm run test:cov
```

### Mode watch pour les tests

```bash
npm run test:watch
```

---

## 📊 Modèle de données

L'application utilise les entités suivantes :

| Entité         | Description                                                     |
| -------------- | --------------------------------------------------------------- |
| **Account**    | Compte utilisateur (email, mot de passe, type: student/teacher) |
| **Student**    | Élève (prénom, nom, classe associée)                            |
| **Teacher**    | Enseignant (prénom, nom, directeur optionnel)                   |
| **Class**      | Classe (nom)                                                    |
| **Subject**    | Matière (nom, description, propriétaire)                        |
| **Lesson**     | Cours (nom, classe, enseignant, matière)                        |
| **Assignment** | Devoir (titre, dates, échelle, coefficient, cours associé)      |
| **Grade**      | Note (valeur, commentaire, devoir et élève associés)            |

---

## 💡 Utilisation de base

### Connexion

1. **En tant qu'élève** : Utilisez un compte de type `student`
2. **En tant qu'enseignant** : Utilisez un compte de type `teacher`
3. **En tant que directeur** : Utilisez un compte `teacher` sans `director_id` (compte racine)

### Flux typique

**Pour un enseignant** :

1. Créer une matière (si directeur) ou utiliser une matière existante
2. Créer un cours associé à une classe et une matière
3. Créer un devoir pour ce cours
4. Attribuer des notes aux élèves pour ce devoir

**Pour un élève** :

1. Se connecter avec son compte
2. Visualiser toutes ses notes triées par cours/matière
3. Consulter les détails des devoirs et les commentaires

---

## 🎯 Commandes utiles

| Commande              | Description                            |
| --------------------- | -------------------------------------- |
| `npm run lint`        | Vérifier et corriger le style du code  |
| `npm run format`      | Formater le code avec Prettier         |
| `npm run build`       | Compiler l'application                 |
| `npm run start`       | Démarrer l'application en mode normal  |
| `npm run start:dev`   | Démarrer avec rechargement automatique |
| `npm run start:debug` | Démarrer en mode debug                 |
| `npm run start:prod`  | Démarrer l'application compilée        |

---

## 📝 Remarques

- Ce projet a été développé dans le cadre d'un **projet de fin de module** pour des études en informatique
- Les comptes directeurs sont identifiés par l'absence de `director_id` dans l'entité `Teacher`
- Les notes sont stockées avec une précision de 2 décimales et associées à un devoir
- Le coefficient d'un devoir permet de pondérer les notes dans les calculs de moyenne

---

> **Auteur** : Johan | **Type** : Projet académique | **Statut** : ⏳ En cours de développement
