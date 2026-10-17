# Frontend — Policies SPA

Angular 17 (standalone components) SPA following **Clean Architecture + DDD**.

## Stack

- Angular 17 · Signals state · RxJS
- Karma + Jasmine (unit tests)
- pnpm 12 · ESLint (Angular defaults)

## Quick start

```bash
pnpm install
pnpm start      # http://localhost:4200
```

The app calls the backend at `http://localhost:3000/api` (see
`src/environments/environment.ts`).

## Scripts

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `pnpm start`       | Dev server (http://localhost:4200)   |
| `pnpm run build`   | Production build (with `fileReplacements`) |
| `pnpm test`        | Unit tests (Karma/ChromeHeadless)    |
| `pnpm run watch`   | Build in watch mode                  |

## Architecture

Clean Architecture inside `src/app/features/policies/`, with the same layer
names and dependency rule as the backend:

```
src/app/features/policies/
├── domain/           # Pure TypeScript
│   ├── models/         # PolicyEntity + VOs (PolicyStatusVO, PremiumVO)
│   └── repositories/   # PolicyRepository port + POLICY_REPOSITORY token
├── application/      # Use cases + DI tokens (GetAllPolicies, GetPolicyById)
├── infrastructure/   # Adapters
│   ├── dtos/           # PolicyResponseDto (exact replica of the API JSON)
│   ├── mappers/        # PolicyMapper: DTO ⇄ entity
│   └── repositories/   # HttpPolicyRepository (HttpClient)
├── presentation/     # Angular UI
│   ├── components/     # Dumb components (PolicyCardComponent)
│   ├── pages/          # Smart pages (list, detail) — lazy-loaded under /policies
│   └── state/          # PoliciesStore (Signals)
└── policies.routes.ts
```

Rules:

- Components/pages never see DTOs or HTTP — only domain entities and the store.
- The store depends on the **use cases** (via DI tokens), not on repositories.
- `src/app/app.config.ts` is the composition root: the only place that binds
  ports to concrete adapters (mirrors `container.ts` on the backend).

## Environments

- `environment.ts` (dev): `apiUrl: 'http://localhost:3000/api'`
- `environment.prod.ts`: contains the `__API_URL__` placeholder, replaced at
  build time by Docker (`ARG API_URL` + sed) or CI. A plain local
  `ng build` with the production config will keep the literal placeholder —
  use `ng serve` for local testing.

## Testing

- `policy.mapper.spec.ts` — DTO → entity mapping, invalid status/currency.
- `policies.store.spec.ts` — store loading, error and single-policy flows
  with a fake repository port.
