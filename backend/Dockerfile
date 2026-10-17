# ---------- Stage 1: build TypeScript + dependencias de producción ----------
FROM node:20-alpine AS build
WORKDIR /app

# pnpm vía corepack (la versión exacta viene de package.json#packageManager)
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig*.json ./
COPY src ./src
RUN pnpm run build && pnpm prune --prod

# ---------- Stage 2: runtime mínimo (solo dist + node_modules prod) ----------
FROM node:20-alpine AS runtime
ENV NODE_ENV=production

RUN addgroup -S app && adduser -S app -G app

WORKDIR /app
COPY --from=build --chown=app:app /app/dist ./dist
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/package.json ./package.json

USER app
EXPOSE 3000

CMD ["node", "dist/main.js"]
