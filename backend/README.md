# Backend — Policies API

Node.js + Express + TypeScript API following **Clean Architecture + DDD**.

## Stack

- Express 4 · TypeScript (strict) · Zod (env + request validation)
- Jest + supertest (unit + integration tests)
- pnpm 12 · tsx (dev watch) · ESLint + Prettier

## Quick start

```bash
pnpm install
pnpm dev        # http://localhost:3000/api/policies
```

## Scripts

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `pnpm dev`           | Dev server with watch (tsx)          |
| `pnpm run build`     | Compile TypeScript to `dist/`        |
| `pnpm start`         | Run the compiled build               |
| `pnpm test`          | Jest unit + integration tests        |
| `pnpm run lint`      | ESLint                               |
| `pnpm run typecheck` | TypeScript type check                |

## Endpoints

See the shared contract in [`../docs/api-contract.md`](../docs/api-contract.md):

- `GET /api/policies`
- `GET /api/policies/:id` (404 with a uniform error shape, 400 for invalid UUID)

## Architecture

Layered Clean Architecture with a strict dependency rule
(`domain` ← `application` ← `infrastructure` ← composition root):

```
src/
├── config/           # Env loading + validation (Zod, fail fast)
├── domain/           # Core enterprise: entities, value objects, errors, ports
│   ├── model/          # Policy aggregate + VOs (PolicyId, PolicyType, PolicyStatus, Premium)
│   ├── errors/         # DomainError base + PolicyNotFoundError
│   └── ports/          # PolicyRepositoryPort, LoggerPort (interfaces)
├── application/      # Use cases (GetAllPolicies, GetPolicyById)
├── infrastructure/   # Adapters
│   ├── persistence/    # In-memory repository + PolicyMapper
│   ├── http/           # Controllers, Zod schemas, error handler, routes
│   └── logging/        # ConsoleLoggerAdapter (swappable for Winston/Pino)
├── app.ts            # Express app factory (testable with supertest)
├── container.ts      # Composition Root: the ONLY place that wires concretes
└── main.ts           # Bootstrap (loadEnvConfig → container → listen)
```

Rules:

- `domain` imports nothing from outside itself.
- `application` only knows `domain` + ports.
- `infrastructure` implements ports; HTTP layer holds no business logic.
- `container.ts` is the only file that instantiates concrete adapters.

## Environment variables

| Variable      | Default                  | Description                              |
| ------------- | ------------------------ | ---------------------------------------- |
| `NODE_ENV`    | `development`            | `development` \| `test` \| `production`  |
| `PORT`        | `3000`                   | HTTP port                                |
| `CORS_ORIGINS`| `http://localhost:4200`  | Comma-separated list of allowed origins  |

Invalid values abort the process at startup (fail fast).

## Testing

- `test/use-cases.test.ts` — use-case unit tests with a fake repository port.
- `test/policy.routes.test.ts` — integration tests over the real Express app
  (supertest): 200, 404 uniform error shape, 400 validation.

## Docker

Multi-stage Dockerfile: `pnpm install --frozen-lockfile` + `tsc` build →
minimal `node:20-alpine` runtime running `dist/main.js` as a non-root user.
