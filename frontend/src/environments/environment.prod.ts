export const environment = {
  production: true,
  // Placeholder injected at build time by Docker/CI:
  // - Docker: ARG API_URL from frontend/Dockerfile (sed replaces this file)
  // - GitHub Actions: repo variable API_URL (build-args in ci.yml)
  // Note: a local `ng build` with the production config keeps the literal
  // placeholder; use `ng serve` for local testing (uses environment.ts).
  apiUrl: '__API_URL__',
};
