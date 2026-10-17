# API Contract — Policies

Contrato REST compartido entre `backend/` y `frontend/`. Cualquier cambio de forma
debe reflejarse aquí primero, y después en ambos lados:

- **Backend**: `src/infrastructure/persistence/mapper/policy.mapper.ts` (producción del JSON).
- **Frontend**: `src/app/features/policies/infrastructure/dtos/policy-response.dto.ts` (réplica exacta).

## Endpoints

### `GET /api/policies`

Lista completa de pólizas.

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

Detalle de una póliza. `:id` debe ser un UUID v4.

**Response `200`**: un único objeto con la forma anterior.

**Response `404`** si no existe:

```json
{
  "statusCode": 404,
  "code": "POLICY_NOT_FOUND",
  "message": "Policy with id '<id>' was not found"
}
```

**Response `400`** si el parámetro no es un UUID válido:

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Invalid request parameters"
}
```

## Tipos de campo

| Campo         | Tipo                    | Valores                                    |
| ------------- | ----------------------- | ------------------------------------------ |
| `id`          | UUID v4                 |                                            |
| `policyNumber`| string                  | `POL-<año>-<n>`                            |
| `type`        | enum string             | `AUTO`, `HOME`, `LIFE`, `HEALTH`, `TRAVEL` |
| `status`      | enum string             | `ACTIVE`, `PENDING`, `CANCELLED`, `EXPIRED`|
| `holderName`  | string                  |                                            |
| `premium`     | object                  | `{ amount: number (> 0), currency: string }`|
| `currency`    | enum string             | `EUR`, `USD`, `GBP`                        |
| `startDate`   | ISO date string         | `YYYY-MM-DD`                               |

## CORS

El backend permite explícitamente el origen del frontend (configurado vía la
variable de entorno `CORS_ORIGINS`, por defecto `http://localhost:4200`).
El frontend llama a la URL absoluta del backend (`http://localhost:3000/api`).
