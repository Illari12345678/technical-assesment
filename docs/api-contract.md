# API Contract — Policies

Shared REST contract between `backend/` and `frontend/`. Any shape change must
be reflected here first, and then on both sides:

- **Backend**: `src/infrastructure/persistence/mapper/policy.mapper.ts` (produces the JSON).
- **Frontend**: `src/app/features/policies/infrastructure/dtos/policy-response.dto.ts` (exact replica).

## Endpoints

### `GET /api/policies`

Full list of policies.

**Response `200`**

```json
[
  {
    "id": "0f8fad5b-d9cb-469f-a165-70867728950e",
    "policyNumber": "POL-2026-0001",
    "type": "AUTO",
    "status": "ACTIVE",
    "holderName": "Ana García",
    "premium": { "amount": 240.5, "currency": "EUR" },
    "startDate": "2026-01-15"
  }
]
```

### `GET /api/policies/:id`

Single policy detail. `:id` must be a UUID.

**Response `200`**: a single object with the shape above.

**Response `404`** when it does not exist:

```json
{
  "statusCode": 404,
  "code": "POLICY_NOT_FOUND",
  "message": "Policy with id '<id>' was not found"
}
```

**Response `400`** when the parameter is not a valid UUID:

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Invalid request parameters"
}
```

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
