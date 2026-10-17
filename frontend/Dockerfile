# ---------- Stage 1: build de la SPA ----------
FROM node:20-alpine AS build
WORKDIR /app

# pnpm vía corepack (la versión exacta viene de package.json#packageManager)
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# La URL del API se inyecta en time de build (CI/CD) sin tocar código.
# Ver src/environments/environment.prod.ts (sustitución del placeholder).
ARG API_URL=http://localhost:3000/api
RUN sed -i "s|__API_URL__|${API_URL}|g" src/environments/environment.prod.ts

RUN pnpm run build

# ---------- Stage 2: nginx sirviendo estáticos ----------
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80
