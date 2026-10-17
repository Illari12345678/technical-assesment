#!/usr/bin/env bash
#
# build-and-run-dev.sh — instala dependencias (si faltan) y arranca
# backend (pnpm dev, :3000) y frontend (pnpm start, :4200) en paralelo.
#
# Uso:
#   ./tools/build-and-run-dev.sh            # arranque normal
#   ./tools/build-and-run-dev.sh --reinstall  # fuerza pnpm install en ambos
#
# Ctrl+C detiene ambos procesos.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

REINSTALL="${1:-}"

info()  { printf '\033[1;34m[tools]\033[0m %s\n' "$*"; }
error() { printf '\033[1;31m[tools]\033[0m %s\n' "$*" >&2; }

# ---------- Precondiciones ----------
if ! command -v pnpm >/dev/null 2>&1; then
  error "pnpm no está instalado. Ejecuta: corepack enable pnpm"
  exit 1
fi

# ---------- Instalación condicional ----------
for project in "$BACKEND_DIR" "$FRONTEND_DIR"; do
  if [[ "$REINSTALL" == "--reinstall" || ! -d "$project/node_modules" ]]; then
    info "Instalando dependencias de $(basename "$project")…"
    (cd "$project" && pnpm install)
  fi
done

# ---------- Limpieza al salir ----------
PIDS=()

cleanup() {
  info "Deteniendo servicios…"
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# ---------- Arranque en paralelo ----------
info "Backend  → http://localhost:3000/api/policies"
(cd "$BACKEND_DIR" && pnpm dev) &
PIDS+=($!)

info "Frontend → http://localhost:4200"
(cd "$FRONTEND_DIR" && pnpm start) &
PIDS+=($!)

info "Ctrl+C para detener ambos."
wait -n
error "Un servicio terminó inesperadamente; deteniendo el resto."
