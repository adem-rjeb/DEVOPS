# Bibliothèque

Application web simple de gestion de bibliothèque avec Next.js App Router, React, TypeScript, Route Handlers, Prisma et authentification JWT par cookie HTTP-only.

## Architecture

```text
app/                 Pages et API Route Handlers
components/          Composants React client
lib/                 Prisma, session et règles métier
prisma/              Schémas SQLite (local) et PostgreSQL (Docker)
tests/               Tests Vitest + React Testing Library
.github/workflows/   Pipeline CI
```

Les rôles sont `MEMBRE` et `ADMIN`. L'inscription crée un membre ; un administrateur peut être créé directement dans la base avec le champ `role` (ou via un script d'administration propre à l'environnement). Les livres sont écrits uniquement par les administrateurs. Les emprunts sont contrôlés dans une transaction Prisma : un livre ne peut être actif qu'une fois et un membre est limité à trois emprunts.

## Installation locale

```bash
cp .env.example .env
npm ci
npx prisma generate
npx prisma db push
npm run dev
```

L'application est disponible sur <http://localhost:3000>. SQLite est utilisé en local. Le schéma PostgreSQL est fourni dans `prisma/schema.postgres.prisma`; le Dockerfile l'utilise automatiquement pour le déploiement.

## Commandes

```bash
npm run lint       # ESLint
npm test           # 9 tests isolés (mocks, sans base de production)
npm run build      # Prisma generate + Next build
npm start          # serveur de production
docker compose up --build  # nécessite Docker Desktop démarré
```

## API

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`
- `GET /api/books?q=...`, `POST /api/books` (admin)
- `PUT` et `DELETE /api/books/:id` (admin)
- `GET /api/loans`, `POST /api/loans`, `PATCH /api/loans/:id`
- `GET /api/health` retourne `{ "status": "ok", "database": "ok" }` ou HTTP 503.

## CI/CD

Le workflow `.github/workflows/ci.yml` installe les dépendances avec `npm ci`, génère Prisma, initialise SQLite, exécute lint/tests/build puis construit l'image Docker. Le déploiement peut être ajouté après l'étape Docker (par exemple push GHCR avec `docker/login-action` et `docker/build-push-action`) en utilisant uniquement des secrets GitHub.

```text
Code -> Git push/PR -> GitHub Actions (lint + tests + build) -> Build Docker -> Registry -> Déploiement
```

Toutes les valeurs sensibles passent par `.env` ou les secrets CI ; aucun secret n'est versionné.

## Configuration and secrets

The application is configured only through environment variables.
No secret is stored in the source code or in Git.

| Variable       | Purpose                     | Local                   | CI                           | Test environment                        |
| -------------- | --------------------------- | ----------------------- | ---------------------------- | --------------------------------------- |
| `DATABASE_URL` | Database connection         | SQLite file (`.env`)    | SQLite (from `.env.example`) | PostgreSQL (hosting dashboard)          |
| `JWT_SECRET`   | Signs authentication tokens | Dev value in `.env`     | Dummy value                  | Strong random value (hosting dashboard) |
| `NEXTAUTH_URL` | Public URL of the app       | `http://localhost:3000` | not used                     | Public URL of the test app              |

### By environment

- **Local:** copy `.env.example` to `.env` and adjust. `.env` is in `.gitignore`.
- **CI:** the pipeline uses `.env.example` (dummy values only). The registry login uses the automatic `GITHUB_TOKEN`.
- **Docker Compose:** variables are set in `docker-compose.yml`. `JWT_SECRET` can be overridden from the shell: `JWT_SECRET=... docker compose up`. The default value is for local use only.
- **Test environment:** variables are set in the hosting dashboard. Deployment secrets (`DEPLOY_HOOK_URL`, `APP_URL`) are stored as GitHub Actions secrets.

### Rules

- Never commit `.env`.
- Test and production secrets are different from development ones.
- `JWT_SECRET` must be a long random value outside local development. Generate one with: `openssl rand -base64 32`
