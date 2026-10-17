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
- npm >= 10

## Arranque en desarrollo

Cada aplicación es un repo/package independiente con su propio `package.json`:

```bash
# Terminal 1 — API
cd backend
npm install
npm run dev        # http://localhost:3000/api/policies

# Terminal 2 — SPA
cd frontend
npm install
npm start          # http://localhost:4200
```

El frontend llama en absolutos a `http://localhost:3000/api` (CORS directo,
configurado en el backend vía `CORS_ORIGINS`).

## Scripts útiles

| Comando              | Descripción                          |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Arranque con watch (ambas apps)      |
| `npm run build`      | Build de producción                  |
| `npm test`           | Tests (backend: Jest + supertest)    |
| `npm run lint`       | ESLint                               |

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

## Roadmap (previsto, no implementado aún)

- Docker: Dockerfiles multi-stage (backend en Node, frontend en nginx) +
  `docker-compose.yml` en la raíz con healthchecks.
- CI/CD: pipelines con paths filters por carpeta
  (`lint → typecheck → test → build → docker build/push`).
