# technical-assesment

Proyecto full-stack con dos aplicaciones independientes siguiendo **Clean
Architecture + DDD**:

| Carpeta     | Stack                                | Puerto |
| ----------- | ------------------------------------ | ------ |
| `backend/`  | Node.js + Express + TypeScript + Zod | 3000   |
| `frontend/` | Angular 17 (standalone)              | 4200   |

El contrato REST compartido está documentado en [`docs/api-contract.md`](docs/api-contract.md).

## Requisitos

- Node.js >= 20
- pnpm 12 (vía corepack: `corepack enable pnpm`, la versión exacta está en `package.json#packageManager`)

## Arranque en desarrollo

Cada aplicación es un repo/package independiente con su propio `package.json`:

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

El frontend llama en absolutos a `http://localhost:3000/api` (CORS directo,
configurado en el backend vía `CORS_ORIGINS`).

## Arranque con un solo comando

```bash
./tools/build-and-run-dev.sh              # instala si falta node_modules y arranca ambas apps
./tools/build-and-run-dev.sh --reinstall  # fuerza pnpm install antes de arrancar
```

Levanta el backend en `:3000` y el frontend en `:4200` en paralelo; `Ctrl+C`
detiene ambos.

## Scripts útiles

| Comando              | Descripción                          |
| -------------------- | ------------------------------------ |
| `pnpm dev`           | Arranque con watch (ambas apps)      |
| `pnpm run build`     | Build de producción                  |
| `pnpm test`          | Tests (backend: Jest + supertest)    |
| `pnpm run lint`      | ESLint                               |

## Estructura (Clean Architecture + DDD)

Ambas aplicaciones comparten la misma separación de capas y la misma regla de
dependencia: `domain` no importa nada de fuera → `application` solo conoce
`domain` y los puertos → `infrastructure` implementa los puertos → el ensamblaje
ocurre en el composition root (`container.ts` en el backend, Angular DI en el
frontend).

```
domain/         entidades, value objects, errores y puertos (interfaz)
application/    casos de uso
infrastructure/ adaptadores (HTTP, repositorios, logging, DTOs, mappers)
presentation/   solo en el frontend: components, pages, state (Signals)
```

## Docker

Cada aplicación tiene su Dockerfile multi-stage (build → runtime mínimo):
el backend corre `node dist/main.js` como usuario no root en `node:20-alpine`,
el frontend sirve los estáticos con nginx (con SPA fallback y cache de assets).

```bash
docker compose up --build
# Frontend: http://localhost:8080  ·  Backend: http://localhost:3000/api/policies
```

La URL del API para el frontend se inyecta en **time de build** (sin tocar
código) mediante el build-arg `API_URL`:

- `docker-compose.yml` → `http://localhost:3000/api`
- CI → variable `API_URL` del repositorio de GitHub

El backend conoce los orígenes permitidos vía `CORS_ORIGINS` (en compose:
`http://localhost:8080`).

## CI/CD (GitHub Actions)

Workflow en `.github/workflows/ci.yml`:

1. **Paths filters** (`dorny/paths-filter`): solo se ejecuta lo afectado por
   los cambios en `backend/**` o `frontend/**`.
2. **Backend**: `lint → typecheck → test (--coverage) → build`.
3. **Frontend**: `test` (Karma/ChromeHeadless) → `build`.
4. **Docker** (solo push a `main`): build + push de ambas imágenes a GHCR
   (`ghcr.io/<repo>-backend`, `ghcr.io/<repo>-frontend`) taggeadas con
   `latest` y el SHA del commit, con cache GHA.

Para desplegar: añadir un job final que haga pull de las imágenes en el
servidor de destino (SSH, Kubernetes, etc.) reutilizando los tags ya publicados.
