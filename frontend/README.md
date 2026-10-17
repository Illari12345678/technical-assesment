# Frontend — Policies SPA

Angular 17 (standalone components) SPA following **Clean Architecture + DDD**.

## Stack

- Angular 17 · Signals state · RxJS
- Karma + Jasmine (unit tests) · ESLint (angular-eslint)
- pnpm 12 · TypeScript strict

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
| `pnpm run lint`    | ESLint (angular-eslint)              |
| `pnpm run watch`   | Build in watch mode                  |

## Architecture

Clean Architecture inside `src/app/features/policies/`, with the same layer
names and dependency rule as the backend:

```
src/app/features/policies/
├── domain/           # Pure TypeScript
│   ├── models/         # PolicyEntity, PolicyPage + VOs (PolicyStatusVO, PremiumVO)
│   │                   # + PolicyQuery / NewPolicy / PolicyChanges inputs
│   └── repositories/   # PolicyRepository port + POLICY_REPOSITORY token
├── application/      # Use cases + DI tokens (GetAll, GetById, Create, Update)
├── infrastructure/   # Adapters
│   ├── dtos/           # Envelope + request DTOs (exact replica of the API JSON)
│   ├── mappers/        # PolicyMapper: DTO ⇄ entity, envelope ⇄ PolicyPage
│   └── repositories/   # HttpPolicyRepository (HttpClient)
├── presentation/     # Angular UI
│   ├── components/     # Dumb components (PolicyCardComponent, PolicyFormComponent)
│   ├── pages/          # Smart pages (list, detail, form) — lazy-loaded under /policies
│   └── state/          # PoliciesStore (Signals: page, limit, filters, total…)
└── policies.routes.ts

src/app/core/http/    # Cross-cutting HTTP concerns
├── api-error.ts          # ApiError shape (mirrors the backend error body)
└── api-error.interceptor.ts  # normalises every HTTP failure into an ApiError
```

Rules:

- Components/pages never see DTOs or HTTP — only domain entities and the store.
- The store depends on the **use cases** (via DI tokens), not on repositories.
- `src/app/app.config.ts` is the composition root: the only place that binds
  ports to concrete adapters (mirrors `container.ts` on the backend).

## List features

- **Search by holder** — the store's `search(term$)` pipeline debounces keystrokes
  (`debounceTime(300)`), ignores repeats (`distinctUntilChanged`) and cancels the
  in-flight request (`switchMap`) before querying `?holderName=`.
- **Filter by status** — the store keeps `statusFilter` and reloads page 1.
- **Pagination** — `meta` (`page`, `limit`, `total`, `totalPages`) drives the
  Anterior/Siguiente controls and the `hasPreviousPage` / `hasNextPage` signals.
- **Writes** — `createPolicy` / `updatePolicy` store actions call the create and
  update use cases and return an `Observable` so the caller navigates on success.

## Form features

A single smart `PolicyFormPage` powers both `GET /policies/new` and
`/policies/:id/edit` (lazy routes). It delegates rendering/validation to the
dumb `PolicyFormComponent`:

- Reactive form (`FormBuilder`) with `required`, `pattern` (policy number),
  `minLength`/`maxLength` and `min` (premium) validators.
- Per-field error messages shown once the control is touched/dirty.
- `policyNumber` is read-only in edit mode (immutable on the backend).
- Cross-cutting HTTP errors are normalised by `apiErrorInterceptor` and surfaced
  by the store (`error` signal).

## Environments

- `environment.ts` (dev): `apiUrl: 'http://localhost:3000/api'`
- `environment.prod.ts`: contains the `__API_URL__` placeholder, replaced at
  build time by Docker (`ARG API_URL` + sed) or CI. A plain local
  `ng build` with the production config will keep the literal placeholder —
  use `ng serve` for local testing.

## Testing

- `policy.mapper.spec.ts` — DTO → entity and envelope → `PolicyPage` mapping,
  invalid status/currency.
- `policies.store.spec.ts` — loading, error, filter, pagination, holder search
  (debounce/distinct/switchMap) and create/update flows with a fake repository port.
- `policy-form.component.spec.ts` — form validation, per-field errors and the
  create/edit payloads.
- `policy-list.page.spec.ts` — card rendering, debounced search, status filter
  and navigation.
- `api-error.interceptor.spec.ts` — HTTP failures normalised into `ApiError`.
