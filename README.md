# Technical Assessment

Full-stack project composed of two independent applications following
**Clean Architecture + DDD**:

| Folder      | Stack                                    | Port |
| ----------- | ---------------------------------------- | ---- |
| `backend/`  | Node.js + Express + TypeScript + Zod     | 3000 |
| `frontend/` | Angular 17 (standalone)                  | 4200 |

The shared REST contract is documented in [`docs/api-contract.md`](docs/api-contract.md).

## Requirements

- Node.js >= 20
- pnpm 12 (via corepack: `corepack enable pnpm`; the exact version is pinned in
  each `package.json#packageManager`)
- Docker (optional, for the containerized setup)

## Quick start (single command)

```bash
./tools/build-and-run-dev.sh              # installs deps if missing and starts both apps
./tools/build-and-run-dev.sh --reinstall  # forces pnpm install before starting
```

Starts the backend on `:3000` and the frontend on `:4200` in parallel; `Ctrl+C`
stops both.

## Manual start (development)

Each application is an independent package with its own `package.json`:

```bash
# Terminal 1 — API
cd backend
pnpm install
pnpm dev        # http://localhost:3000/api/policies

# Terminal 2 — SPA
cd frontend
pnpm install
pnpm start      # http://localhost:4200
```

The frontend calls the backend at the absolute URL `http://localhost:3000/api`
(direct CORS, configured on the backend via `CORS_ORIGINS`).

## Useful scripts

| Command            | Description                        | Where    |
| ------------------ | ---------------------------------- | -------- |
| `pnpm dev`         | Watch-mode dev server              | backend  |
| `pnpm start`       | Dev server (SPA)                   | frontend |
| `pnpm run build`   | Production build                   | both     |
| `pnpm test`        | Jest + supertest / Karma + Jasmine | both     |
| `pnpm run lint`    | ESLint                             | both     |
| `pnpm run typecheck` | TypeScript type check            | backend  |

## API surface

- `GET /api/policies?status=&type=&holderName=&page=&limit=` → `{ data, meta }` envelope
- `GET /api/policies/:id`
- `POST /api/policies` → `201` + `Location`
- `PUT /api/policies/:id`

The SPA lists, searches and filters policies and creates/edits them from a
reactive form (`/policies/new`, `/policies/:id/edit`).

Full request/response shapes and the error catalogue (`400`/`404`/`422`) are in
[`docs/api-contract.md`](docs/api-contract.md).

## Architecture (Clean Architecture + DDD)

Both applications share the same layer separation and the same dependency rule:
`domain` imports nothing from outside → `application` only knows `domain` and
the ports → `infrastructure` implements the ports → assembly happens in the
composition root (`container.ts` on the backend, Angular DI on the frontend).

```
domain/         entities, value objects, errors and ports (interfaces)
application/    use cases
infrastructure/ adapters (HTTP, repositories, logging, DTOs, mappers)
presentation/   frontend only: components, pages, state (Signals)
```

See [`backend/README.md`](backend/README.md) and
[`frontend/README.md`](frontend/README.md) for per-app details.

## Docker

Each application ships a multi-stage Dockerfile (build → minimal runtime): the
backend runs `node dist/main.js` as a non-root user on `node:20-alpine`, the
frontend serves the static build with nginx (SPA fallback + asset caching).

```bash
docker compose up --build
# Frontend: http://localhost:8080  ·  Backend: http://localhost:3000/api/policies
```

The frontend API URL is injected at **build time** (no code changes) through
the `API_URL` build arg:

- `docker-compose.yml` → `http://localhost:3000/api`
- CI → the repository variable `API_URL`

The backend knows the allowed origins via `CORS_ORIGINS`
(`http://localhost:8080` in compose).

## CI/CD (GitHub Actions)

Workflow in `.github/workflows/ci.yml`:

1. **Paths filters** (`dorny/paths-filter`): only jobs affected by changes in
   `backend/**` or `frontend/**` run.
2. **Backend**: `lint → typecheck → test (--coverage) → build`.
3. **Frontend**: `test` (Karma/ChromeHeadless) → `build`.
4. **Docker** (main pushes only): build + push of both images to GHCR
   (`ghcr.io/<repo>-backend`, `ghcr.io/<repo>-frontend`) tagged with `latest`
   and the commit SHA, with GHA cache.

To deploy, add a final job that pulls the published images on the target
server (SSH, Kubernetes, etc.) reusing the already-published tags.

## CI (GitLab)

`.gitlab-ci.yml` provides the same quality gate for GitLab-hosted pipelines,
with two stages:

1. **lint** — `backend:lint` (ESLint + `tsc --noEmit`) and `frontend:lint`
   (angular-eslint).
2. **test** — `backend:test` (Jest + coverage) and `frontend:test`
  (installs Debian `chromium`, runs Karma headless via
  `CHROME_BIN=/usr/bin/chromium`, then the production build).

pnpm is provided by Corepack (`corepack enable`) and the pnpm store is cached
per package.
