# API Contract — Policies

Shared REST contract between `backend/` and `frontend/`. Any shape change must
be reflected here first, and then on both sides:

- **Backend**: `src/infrastructure/persistence/mapper/policy.mapper.ts` (produces the JSON).
- **Frontend**: `src/app/features/policies/infrastructure/dtos/policy-response.dto.ts` (exact replica).

## Resource

```json
{
  "id": "0f8fad5b-d9cb-469f-a165-70867728950e",
  "policyNumber": "POL-2026-0001",
  "type": "AUTO",
  "status": "ACTIVE",
  "holderName": "Ana García",
  "premium": { "amount": 240.5, "currency": "EUR" },
  "startDate": "2026-01-15"
}
```

## Endpoints

### `GET /api/policies`

Paginated, filterable list.

**Query params**

| Param    | Type   | Default | Rules                                        |
| -------- | ------ | ------- | -------------------------------------------- |
| `status` | enum   | –       | `ACTIVE` \| `PENDING` \| `CANCELLED` \| `EXPIRED` (case-insensitive) |
| `type`   | enum   | –       | `AUTO` \| `HOME` \| `LIFE` \| `HEALTH` \| `TRAVEL` (case-insensitive) |
| `holderName` | string | –   | case-insensitive partial match on the holder name |
| `page`   | number | `1`     | integer ≥ 1                                  |
| `limit`  | number | `10`    | integer between 1 and 100                    |

**Response `200`**

```json
{
  "data": [
    {
      "id": "0f8fad5b-d9cb-469f-a165-70867728950e",
      "policyNumber": "POL-2026-0001",
      "type": "AUTO",
      "status": "ACTIVE",
      "holderName": "Ana García",
      "premium": { "amount": 240.5, "currency": "EUR" },
      "startDate": "2026-01-15"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 6, "totalPages": 1 }
}
```

**Response `400`** when a query param is invalid (e.g. `limit=0`, `status=WEIRD`).

### `GET /api/policies/:id`

Single policy detail. `:id` must be a UUID.

- **`200`**: a single resource object (shape above).
- **`400`**: the id is not a valid UUID.
- **`404`**: the policy does not exist.

### `POST /api/policies`

Creates a policy.

**Body**

| Field          | Required | Notes                                        |
| -------------- | -------- | -------------------------------------------- |
| `policyNumber` | yes      | unique business key                          |
| `type`         | yes      | enum (case-insensitive)                      |
| `holderName`   | yes      | 1–120 chars                                  |
| `premium`      | yes      | `{ amount > 0, currency }`                   |
| `startDate`    | yes      | ISO date `YYYY-MM-DD`                        |
| `status`       | no       | defaults to `PENDING`                        |

Unknown fields are rejected.

- **`201`**: the created resource, with header `Location: /api/policies/:id`.
- **`400`**: body validation failed (shape/types).
- **`422`**: `policyNumber` already exists (`POLICY_ALREADY_EXISTS`).

### `PUT /api/policies/:id`

Full update of the mutable fields. `id` and `policyNumber` are immutable.

**Body**: same fields as `POST` without `policyNumber`; `status` is optional
(omitted → current status is kept).

- **`200`**: the updated resource.
- **`400`**: id or body validation failed.
- **`404`**: the policy does not exist.
- **`422`**: illegal status transition (`INVALID_STATUS_TRANSITION`) or an
  invalid domain value (`INVALID_POLICY_DATA`).

## Status lifecycle

```
PENDING ──▶ ACTIVE ──▶ CANCELLED
   │           │
   └─▶CANCELLED└─▶EXPIRED
```

`CANCELLED` and `EXPIRED` are terminal. Re-sending the same status is allowed
(idempotent); any other non-declared move returns `422`.

## Error shape

Every error uses the same body:

```json
{ "statusCode": 404, "code": "POLICY_NOT_FOUND", "message": "Policy with id '<id>' was not found" }
```

| Status | `code`                      | When                                            |
| ------ | --------------------------- | ----------------------------------------------- |
| `400`  | `VALIDATION_ERROR`          | Zod validation failed (params/query/body)       |
| `400`  | `INVALID_JSON`              | Malformed JSON body                             |
| `404`  | `POLICY_NOT_FOUND`          | Unknown policy id                               |
| `404`  | `ROUTE_NOT_FOUND`           | Unmatched `/api/*` route                        |
| `422`  | `POLICY_ALREADY_EXISTS`     | Duplicate `policyNumber`                        |
| `422`  | `INVALID_STATUS_TRANSITION` | Status change not allowed by the lifecycle      |
| `422`  | `INVALID_POLICY_DATA`       | Domain invariant violated                       |
| `500`  | `INTERNAL_SERVER_ERROR`     | Unexpected error                                |

The `VALIDATION_ERROR` response also includes a `details` field with the
flattened Zod issues.

## Field types

| Field          | Type       | Values                                     |
| -------------- | ---------- | ------------------------------------------ |
| `id`           | UUID       |                                            |
| `policyNumber` | string     | `POL-<year>-<n>`                           |
| `type`         | enum string| `AUTO`, `HOME`, `LIFE`, `HEALTH`, `TRAVEL` |
| `status`       | enum string| `ACTIVE`, `PENDING`, `CANCELLED`, `EXPIRED`|
| `holderName`   | string     |                                            |
| `premium`      | object     | `{ amount: number (> 0), currency: string }` |
| `currency`     | enum string| `EUR`, `USD`, `GBP`                        |
| `startDate`    | ISO date   | `YYYY-MM-DD`                               |

## CORS

The backend explicitly allows the frontend origin (configured via the
`CORS_ORIGINS` environment variable, default `http://localhost:4200`).
The frontend calls the backend at its absolute URL
(`http://localhost:3000/api`).
