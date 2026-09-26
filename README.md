# Eventify

A full-stack event and ticketing platform, built as a learning project and used
as a playground for DevOps / SRE practice (containers, CI, deployment,
observability, reliability).

Users can browse events and venues, buy tickets, and leave reviews.
Admins and event planners manage events, venues and tickets.

## Architecture

```
Browser ──> frontend (nginx, static React app)   :5173
   │
   └──────> backend (Node.js / Express API)      :5000
                 │
                 └──> PostgreSQL 15 (via Prisma)  :5433 on the host
```

| Part     | Tech                                              |
| -------- | ------------------------------------------------- |
| Frontend | React 19, Vite, Redux Toolkit, React Router, Tailwind |
| Backend  | Node.js 22, Express 5, Prisma ORM, JWT in an HttpOnly cookie |
| Database | PostgreSQL 15                                     |
| Infra    | Docker + Docker Compose, GitHub Actions (CI)      |

Roles: `USER`, `EVENT_PLANNER`, `ADMIN`.

## Quick start (Docker)

Requirements: Docker Desktop (or Docker Engine + Compose).

1. Create your local config from the template:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set `POSTGRES_PASSWORD` and `JWT_SECRET`.
   The `.env` file is gitignored and must never be committed.

2. Build and start everything:

   ```bash
   docker compose up --build
   ```

   The backend applies the database migrations automatically on startup.

3. Open the app:

   - Frontend: http://localhost:5173
   - API health check: http://localhost:5000/health

To stop: `Ctrl+C`, or `docker compose down`.
**Do not** use `docker compose down -v` unless you want to delete the database
(the `-v` flag removes the `postgres_data` volume).

### Create your first admin

New accounts are created with the `USER` role. Register in the app first, then
promote your account (replace the email):

```bash
docker exec eventify-postgres psql -U postgres -d eventify \
  -c "UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'you@example.com';"
```

Log out and back in afterwards, because the role is stored in your login token.

## Local development (without Docker for the app)

Run only the database in Docker, and the apps directly:

```bash
docker compose up postgres
```

Backend (`backend/.env` needs `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`,
`FRONTEND_URL`):

```bash
cd backend
npm ci
npx prisma migrate deploy
npm run dev
```

Frontend (`frontend/.env` needs `VITE_API_URL=http://localhost:5000/api`):

```bash
cd frontend
npm ci
npm run dev
```

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every pull request and on
pushes to `main`:

- **Frontend:** `npm ci`, lint, production build
- **Backend:** `npm ci`, syntax check, `prisma validate`
- **Docker:** builds both images

`main` is protected: changes go through a pull request and all checks must pass
before merging.

## Workflow

1. Update `main`: `git switch main && git pull`
2. Create a branch: `git switch -c feat/short-name`
3. Commit small, push, open a pull request
4. Wait for green checks, merge, delete the branch

## SRE notes

Running log of operational lessons and ideas. Add to it as the project grows.

- The database lives in the Docker volume `postgres_data`; it survives
  restarts and `docker compose down`, but not `down -v`.
- The backend container only starts once Postgres reports healthy, and runs
  `prisma migrate deploy` before serving traffic.
- Config and secrets come from `.env`, never from the repository.
- Planned: cloud deployment with HTTPS, a richer `/health` endpoint (database
  check), metrics and dashboards, database backups with a tested restore,
  resource limits, and a written postmortem after a deliberate failure drill.
