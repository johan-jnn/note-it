# Note-It - Système de Gestion Scolaire

Un système complet de gestion scolaire pour gérer les classes, matières, cours, devoirs et notes.

## 🚀 Déploiement Rapide

### Avec Docker Compose (Recommandé)

```bash
git clone <repository-url>
cd note-it
docker-compose up -d
# Application disponible à http://localhost:3000
```

### Développement Local

```bash
# Backend
npm install
npm run start:dev

# Frontend (autre terminal)
cd frontend
npm install
npm run dev
# Backend: http://localhost:3000, Frontend: http://localhost:5173
```

## 📦 Structure

```
note-it/
├── src/                          # Backend NestJS
├── frontend/                     # Frontend Svelte+TailwindCSS
├── database/                     # Migrations TypeORM
├── test/                         # Tests Jest
├── .github/workflows/            # CI/CD GitHub Actions
├── docker-compose.yml
└── Dockerfile
```

## 🛠 Stack Technique

- **Backend**: NestJS 11, TypeORM, Node.js 20+
- **Frontend**: Svelte 5, TailwindCSS 3, Vite 5
- **Base de données**: MySQL 8.0 / SQLite
- **CI/CD**: GitHub Actions
- **Containerisation**: Docker, Docker Compose

## 📋 Fonctionnalités

### API Backend
| Module | Endpoints | Description |
|--------|-----------|-------------|
| Classes | `/api/classes` | CRUD complet |
| Matières | `/api/subjects` | CRUD complet |
| Cours | `/api/lessons` | CRUD complet |
| Devoirs | `/api/assignments` | CRUD complet |
| Notes | `/api/grades` | CRUD complet |

### Frontend
- Tableau de bord avec statistiques
- Gestion CRUD pour tous les modules
- Interface responsive
- Design moderne avec TailwindCSS

## 🔧 Configuration

### Backend (.env)
```env
NODE_ENV=development
APP_PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=root
DATABASE_NAME=note_it
```

### Frontend (frontend/.env)
```env
VITE_API_URL=http://localhost:3000
```

## 🚀 Scripts

### Backend
```bash
npm install
npm run start:dev      # Développement
npm run start:prod     # Production
npm run build           # Build
npm test                # Tests unitaires
npm run test:e2e       # Tests E2E
```

### Frontend
```bash
cd frontend
npm install
npm run dev            # Développement
npm run build           # Production
```

### Docker
```bash
docker-compose up -d
```

## 🧪 Tests

- **Unitaires**: Jest pour tous les services et contrôleurs
- **E2E**: Tests d'intégration avec Supertest
- **CI/CD**: Pipeline complet sur GitHub Actions

## 📊 Base de Données

### Migrations
```bash
npm run orm:app -- migration:generate src/database/migrations/TableName
npm run orm:app -- migration:run
npm run orm:app -- migration:revert
```

## 🔐 Sécurité

- CORS configuré
- Validation des données
- Gestion des erreurs
- Scan des vulnérabilités CI

## 📈 Déploiement

Le backend sert le frontend en production via `@nestjs/serve-static`.

## 🤝 Contribution

1. Fork
2. Branch (`feature/nom`)
3. Commit
4. Push
5. Pull Request

## 📄 Licence

MIT
